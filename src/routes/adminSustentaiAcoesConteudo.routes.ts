import { Router } from "express";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware";
import { SustentaiAcaoConteudoController } from "../controllers/SustentaiAcaoConteudoController";

const router = Router();

router.put(
  "/sustentai/acoes/:id/conteudo",
  adminAuthMiddleware,
  SustentaiAcaoConteudoController.updateConteudo,
);

export default router;