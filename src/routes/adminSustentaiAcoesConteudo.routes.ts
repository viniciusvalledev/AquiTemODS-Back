import { Router } from "express";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware";
import { SustentaiAcaoConteudoController } from "../controllers/SustentaiAcaoConteudoController";

const router = Router();

// Rota para criar conteúdo de uma ação (apenas admin)
router.post(
  "/sustentai/acoes/:id/conteudo",
  adminAuthMiddleware,
  SustentaiAcaoConteudoController.createConteudo,
);

// Rota para atualizar conteúdo de uma ação (apenas admin)
router.put(
  "/sustentai/acoes/:id/conteudo",
  adminAuthMiddleware,
  SustentaiAcaoConteudoController.updateConteudo,
);

export default router;