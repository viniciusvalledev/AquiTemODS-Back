import { Router } from "express";
import multer from "multer";
import path from "path";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware";
import { SustentaiAcoesController } from "../controllers/SustentaiAcoesController";
import { SustentaiPessoasController } from "../controllers/SustentaiPessoasController";
import { SustentaiHeaderController } from "../controllers/SustentaiHeaderController";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "temp-sustentai-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimes = ["image/jpeg", "image/pjpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedMimes.includes(file.mimetype)) return cb(null, true);
  return cb(new Error("Formato inválido de imagem."), false);
};

const upload = multer({ storage, fileFilter });

router.post(
  "/sustentai/acoes",
  adminAuthMiddleware,
  upload.single("imagem"),
  SustentaiAcoesController.create,
);

router.put(
  "/sustentai/acoes/:id",
  adminAuthMiddleware,
  upload.single("imagem"),
  SustentaiAcoesController.update,
);

router.delete(
  "/sustentai/acoes/:id",
  adminAuthMiddleware,
  SustentaiAcoesController.delete,
);

router.post(
  "/sustentai/pessoas",
  adminAuthMiddleware,
  upload.single("imagem"),
  SustentaiPessoasController.create,
);

router.put(
  "/sustentai/pessoas/:id",
  adminAuthMiddleware,
  upload.single("imagem"),
  SustentaiPessoasController.update,
);

router.delete(
  "/sustentai/pessoas/:id",
  adminAuthMiddleware,
  SustentaiPessoasController.delete,
);

router.put(
  "/sustentai/header",
  adminAuthMiddleware,
  SustentaiHeaderController.update,
);

export default router;