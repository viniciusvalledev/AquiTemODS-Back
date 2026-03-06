import { Router } from "express";
import { SustentAiController } from "../controllers/SustentAiController";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware";
import multer from "multer";
import path from "path";
import { SustentaiAcoesController } from "../controllers/SustentaiAcoesController";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "temp-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const router = Router();

router.get("/", SustentAiController.getAll);

// Rota pública para listar newsletters (mantém compatibilidade com `/`)
router.get("/newsletter", SustentAiController.getAll);

// Rotas para criar e editar newsletters (requer admin)
router.post(
  "/newsletter",
  adminAuthMiddleware,
  upload.single("imagem"),
  SustentAiController.create,
);

router.put(
  "/newsletter/:id",
  adminAuthMiddleware,
  upload.single("imagem"),
  SustentAiController.update,
);

router.post("/click-nav", SustentAiController.registerNavClick);
router.post("/click-card/:id", SustentAiController.registerCardClick);

// --- NOVAS ROTAS PÚBLICAS PARA AÇÕES ---
router.get("/acoes", SustentaiAcoesController.getAll);
router.post("/acoes/:id/click", SustentaiAcoesController.registerClick);
// rota alternativa que o front já usa
router.post("/acoes/:id/click-card", SustentaiAcoesController.registerClick);

// Rota PUT (Editar) - agora apenas admin via adminSustentai.routes.ts
// router.put(
//   "/:id",
//   adminAuthMiddleware,
//   upload.single("imagem"),
//   SustentAiController.update,
// );

router.delete(
  "/:titulo",
  adminAuthMiddleware,
  SustentAiController.deleteByTitle,
);

export default router;
