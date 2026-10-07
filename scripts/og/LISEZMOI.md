# L'image de partage (`public/og.png`)

C'est l'image qui s'affiche chaque fois que `mehdijabry.dev` est partagé — Facebook, LinkedIn,
Messenger, iMessage, Slack — **et dans l'aperçu de chaque courriel de prospection qui contient le
lien**. C'est donc l'actif le plus vu du studio après le site lui-même.

Celle d'avant le 7 octobre 2026 datait de juin et affirmait deux choses fausses : **« MONTRÉAL, QC »**
et **« From $390 CAD »**. Elle portait aussi l'ancienne direction artistique. D'où cette source,
gardée dans le dépôt pour que l'image puisse être refaite au lieu d'être retouchée à l'aveugle.

## La refaire

```bash
# 1. un Chrome sans interface, avec son port de débogage
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --remote-debugging-port=9335 --user-data-dir=/tmp/chrome-og --no-first-run --disable-gpu &

# 2. rendre en 2400 × 1260 puis réduire à la taille exacte attendue par Open Graph
#    (le script de rendu est dans la session ; en substance : CDP Page.captureScreenshot
#     avec deviceScaleFactor 2, après `document.fonts.ready`)
sips -z 630 1200 og-2x.png --out artifacts/portfolio/public/og.png
```

**Attendre `document.fonts.ready` avant la capture.** Sans ça, Bricolage Grotesque et JetBrains Mono
n'ont pas fini de charger et l'image part avec la police système — le défaut se voit immédiatement.

## Ce qui s'y trouve, et pourquoi

- Le fond papier, la grille dessinée et la plaque d'encre sous la moitié décisive du titre : ce sont
  les trois signes de la direction artistique du site. L'image doit être reconnaissable comme venant
  de ce site-là.
- **Pas de doré**, sauf le crochet du J du monogramme. Dans ce système le doré ne marque que les
  données vivantes ; une image fixe n'en contient aucune.
- Les seuls chiffres sont **375 $** (le prix SPARK de `artifacts/portfolio/src/lib/pricing.ts`) et
  **48 h** (la promesse déjà écrite sur l'accueil et sur la page Contact). Ne jamais y mettre un
  nombre de réalisations : il vieillit, et une image partagée ne se corrige pas.

---

# Le logo carré (`public/logo-carre.png`)

1024 × 1024, rendu depuis `logo-carre.html` par la même méthode. Sert de **photo de profil de la
fiche Google Business** : Google demande au moins 250 × 250 et recadre en cercle, d'où la marge de
14 % autour de la plaque.

**Google n'accepte pas qu'un fichier soit injecté dans son dialogue d'ajout de photos** — il écoute
son propre sélecteur. L'image doit être glissée à la main dans
`business.google.com → Photos → Ajouter`. Même chose pour `og.png`, qui fait une bonne photo de
couverture (1200 × 630, proche du 16:9 attendu).
