import { Router, type IRouter } from "express";
import healthRouter from "./health";
import quoteRouter from "./quote";
import contactRouter from "./contact";
import breathingRouter from "./breathing";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(quoteRouter);
router.use(contactRouter);
router.use(breathingRouter);
router.use("/admin", adminRouter);   // facturation + courriels (cookie admin, voir middlewares/admin-auth.ts)

export default router;
