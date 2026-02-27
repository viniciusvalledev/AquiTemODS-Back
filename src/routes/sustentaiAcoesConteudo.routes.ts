import { Router } from "express";
import { SustentaiAcaoConteudoController } from "../controllers/SustentaiAcaoConteudoController";

const router = Router();

router.get("/acoes/:id/conteudo", SustentaiAcaoConteudoController.getConteudo);

export default router;