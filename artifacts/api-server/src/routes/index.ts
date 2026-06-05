import { Router, type IRouter } from "express";
import healthRouter from "./health";
import quoteRouter from "./quote";
import contactRouter from "./contact";
import breathingRouter from "./breathing";

const router: IRouter = Router();

router.use(healthRouter);
router.use(quoteRouter);
router.use(contactRouter);
router.use(breathingRouter);

export default router;
