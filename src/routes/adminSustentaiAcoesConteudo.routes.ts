import { Router } from "express";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware";
import { SustentaiAcaoConteudoController } from "../controllers/SustentaiAcaoConteudoController";
import multer from "multer";
import path from "path";
import fs from "fs";
import { base64BlocosToFiles } from "../middlewares/base64ToFiles.middleware";
import { compressImages } from "../middlewares/compression.middleware";

const tempDir = path.resolve(process.cwd(), "uploads", "temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, tempDir);
  },
  filename: function (_req, file, cb) {
    const safe = `${Date.now()}-${(file.originalname || file.fieldname).replace(/\s+/g, "_")}`;
    cb(null, safe);
  },
});

const upload = multer({ storage });

const router = Router();

// Rota para criar conteúdo de uma ação (apenas admin)
router.post(
  "/sustentai/acoes/:id/conteudo",
  adminAuthMiddleware,
  upload.any(),
  base64BlocosToFiles,
  compressImages,
  SustentaiAcaoConteudoController.createConteudo,
);

// Rota para atualizar conteúdo de uma ação (apenas admin)
router.put(
  "/sustentai/acoes/:id/conteudo",
  adminAuthMiddleware,
  upload.any(),
  base64BlocosToFiles,
  compressImages,
  SustentaiAcaoConteudoController.updateConteudo,
);

export default router;