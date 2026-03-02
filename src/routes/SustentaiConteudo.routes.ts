import { Router } from "express";
import { SustentaiAcoesController } from "../controllers/SustentaiAcoesController";
import { SustentaiPessoasController } from "../controllers/SustentaiPessoasController";
import { SustentaiHeaderController } from "../controllers/SustentaiHeaderController";
import { SustentaiAcaoConteudoController } from "../controllers/SustentaiAcaoConteudoController";

const router = Router();

router.get("/acoes", SustentaiAcoesController.getAll);
router.get("/acoes/:id", SustentaiAcoesController.getByIdOrSlug);
router.get("/acoes/:id/conteudo", SustentaiAcaoConteudoController.getConteudo);
router.get("/pessoas", SustentaiPessoasController.getAll);
router.get("/header", SustentaiHeaderController.get);

export default router;