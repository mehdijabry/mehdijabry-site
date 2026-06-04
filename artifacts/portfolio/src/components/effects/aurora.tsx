import { useEffect, useRef } from "react";

/**
 * Aurora — a slow, organic gradient mesh rendered with a WebGL fragment shader.
 * Fills its parent (or fixed full-screen when `fixed` is true). Reads the
 * current theme's primary/secondary/accent HSL tokens so colors stay in sync.
 *
 * Cheap to render: 60fps on integrated graphics. Falls back to a static gradient
 * if WebGL is unavailable or the user prefers reduced motion.
 */
interface AuroraProps {
  fixed?: boolean;
  intensity?: number; // 0–1, how bright the colors burn
  className?: string;
}

const VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
uniform float u_intensity;

// Simplex-ish 2D noise (Ashima)
vec3 mod289(vec3 x){return x - floor(x*(1./289.))*289.;}
vec2 mod289(vec2 x){return x - floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i = floor(v + dot(v,C.yy));
  vec2 x0 = v - i + dot(i,C.xx);
  vec2 i1 = (x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.);
  m = m*m; m = m*m;
  vec3 x = 2.*fract(p*C.www) - 1.;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314*(a0*a0 + h*h);
  vec3 g; g.x = a0.x*x0.x + h.x*x0.y;
  g.yz = a0.yz*x12.xz + h.yz*x12.yw;
  return 130.*dot(m,g);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 st = uv * 1.6 - 0.8;
  st.x *= u_resolution.x / u_resolution.y;

  float t = u_time * 0.06;
  float n1 = snoise(st * 1.2 + vec2(t, -t*0.5));
  float n2 = snoise(st * 2.4 + vec2(-t*0.8, t*0.7));
  float n3 = snoise(st * 0.6 + vec2(t*0.3, t*0.4));

  float blob1 = smoothstep(0.0, 0.9, n1 * 0.5 + 0.5);
  float blob2 = smoothstep(0.0, 0.9, n2 * 0.5 + 0.5);
  float blob3 = smoothstep(0.0, 0.9, n3 * 0.5 + 0.5);

  vec3 col = vec3(0.0);
  col += u_c1 * blob1 * 0.55;
  col += u_c2 * blob2 * 0.40;
  col += u_c3 * blob3 * 0.30;

  // soft vignette
  float d = length(uv - 0.5);
  col *= smoothstep(1.0, 0.35, d);

  col *= u_intensity;
  gl_FragColor = vec4(col, 1.0);
}`;

// Convert "h s% l%" CSS variable to RGB 0–1
function hslVarToRgb(varName: string): [number, number, number] {
  if (typeof window === "undefined") return [0.5, 0.5, 0.5];
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  const match = raw.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
  if (!match) return [0.5, 0.5, 0.5];
  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;
  return hslToRgb(h, s, l);
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l, l, l];
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    hue2rgb(p, q, h + 1 / 3),
    hue2rgb(p, q, h),
    hue2rgb(p, q, h - 1 / 3),
  ];
}

export function Aurora({ fixed = false, intensity = 0.55, className }: AuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return; // Caller's CSS fallback (gradient) stays visible.

    // ----- Compile + link program
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("[aurora]", gl.getShaderInfoLog(sh));
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uC1 = gl.getUniformLocation(prog, "u_c1");
    const uC2 = gl.getUniformLocation(prog, "u_c2");
    const uC3 = gl.getUniformLocation(prog, "u_c3");
    const uInt = gl.getUniformLocation(prog, "u_intensity");

    const refreshColors = () => {
      gl.uniform3fv(uC1, hslVarToRgb("--primary"));
      gl.uniform3fv(uC2, hslVarToRgb("--secondary"));
      gl.uniform3fv(uC3, hslVarToRgb("--accent"));
      gl.uniform1f(uInt, intensity);
    };

    // Render at very low resolution and CSS-blur back up. Aurora is a soft
    // gradient field — pixel detail buys us nothing, and the per-fragment
    // shader cost dominates GPU time.
    const RENDER_SCALE = 0.35;

    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * RENDER_SCALE));
      const h = Math.max(1, Math.floor(canvas.clientHeight * RENDER_SCALE));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };

    refreshColors();
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Re-read CSS variables if user toggles the theme.
    const themeObserver = new MutationObserver(refreshColors);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    // Cap the frame rate; aurora is slow-noise — 24fps is indistinguishable
    // and frees up the compositor for scroll work.
    const TARGET_FPS = 24;
    const FRAME_MS = 1000 / TARGET_FPS;
    let lastFrame = performance.now();
    let running = true;

    const start = performance.now();
    const frame = (now: number) => {
      if (!running) return;
      if (now - lastFrame >= FRAME_MS) {
        lastFrame = now;
        const t = (now - start) / 1000;
        gl.uniform1f(uTime, t);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      if (!prefersReduced) animRef.current = requestAnimationFrame(frame);
    };
    animRef.current = requestAnimationFrame(frame);

    // Pause the shader when the tab is hidden — major perf win.
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        if (animRef.current) cancelAnimationFrame(animRef.current);
      } else if (!prefersReduced) {
        running = true;
        lastFrame = performance.now();
        animRef.current = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      ro.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [intensity]);

  const base =
    "pointer-events-none select-none w-full h-full block opacity-[0.85]";
  // CSS-blur the upscaled low-DPR canvas so the lower-res render still
  // reads as soft, not pixelated.
  const filterStyle: React.CSSProperties = { filter: "blur(28px) saturate(1.05)" };
  return (
    <div
      aria-hidden
      className={
        fixed
          ? "fixed inset-0 z-0 pointer-events-none"
          : "absolute inset-0 z-0 pointer-events-none overflow-hidden"
      }
    >
      {/* CSS fallback always renders behind, so even if WebGL fails we still
          ship something visually interesting. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 30%, hsl(var(--primary) / 0.18), transparent 60%), radial-gradient(50% 45% at 80% 70%, hsl(var(--secondary) / 0.14), transparent 60%), radial-gradient(45% 40% at 60% 20%, hsl(var(--accent) / 0.12), transparent 65%)",
        }}
      />
      <canvas
        ref={canvasRef}
        className={`${base} ${className ?? ""}`}
        style={filterStyle}
      />
    </div>
  );
}
