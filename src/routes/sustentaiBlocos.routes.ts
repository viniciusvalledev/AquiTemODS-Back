import { Router } from "express";
import { SustentaiBlocosController } from "../controllers/SustentaiBlocosController";
import rateLimit from "express-rate-limit";

const router = Router();

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 requisições por minuto por IP
});

router.get("/blocos", SustentaiBlocosController.list);
router.post("/blocos/:id/click", limiter, SustentaiBlocosController.click);

export default router;
