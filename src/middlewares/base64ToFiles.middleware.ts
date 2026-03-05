import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

export const base64BlocosToFiles = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    let { blocos } = req.body as any;

    if (!blocos) return next();

    if (typeof blocos === "string") {
      try {
        blocos = JSON.parse(blocos);
      } catch (err) {
        return next();
      }
    }

    if (!Array.isArray(blocos)) return next();

    const existingFiles = (req as any).files;
    let filesObj: { [key: string]: Express.Multer.File[] } = {};

    if (!existingFiles) {
      filesObj = {};
    } else if (Array.isArray(existingFiles)) {
      filesObj = { conteudoFiles: existingFiles as Express.Multer.File[] };
    } else {
      filesObj = existingFiles as { [key: string]: Express.Multer.File[] };
    }

    if (!filesObj["conteudoFiles"]) filesObj["conteudoFiles"] = [];

    // Função auxiliar para processar a string base64, salvar em disco e retornar o nome do arquivo
    const processBase64 = (base64String: string) => {
      // Regex atualizado para suportar imagens e PDFs
      const matches = base64String.match(
        /^data:(image\/(png|jpeg|jpg|webp|gif)|application\/pdf);base64,(.+)$/,
      );
      if (!matches) return null;

      const mime = matches[1];
      let ext = "bin";

      if (mime === "application/pdf") {
        ext = "pdf";
      } else {
        ext = matches[2] === "jpeg" ? "jpg" : matches[2];
      }

      const buffer = Buffer.from(matches[3], "base64");
      const filename = `${Date.now()}-${uuidv4()}.${ext}`;
      const filepath = path.join(UPLOADS_DIR, filename);

      if (!fs.existsSync(UPLOADS_DIR))
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      fs.writeFileSync(filepath, buffer);

      filesObj["conteudoFiles"].push({
        fieldname: "conteudoFiles",
        originalname: filename,
        encoding: "7bit",
        mimetype: mime,
        destination: UPLOADS_DIR,
        filename: filename,
        path: filepath,
        size: buffer.length,
      } as unknown as Express.Multer.File);

      return filename;
    };

    // Percorre os blocos procurando Base64 nos dois formatos (antigo e novo)
    for (const bloco of blocos) {
      if (bloco && bloco.type === "image") {
        // 1. Retrocompatibilidade: Checa o formato antigo (bloco.content)
        if (
          typeof bloco.content === "string" &&
          bloco.content.startsWith("data:")
        ) {
          const savedFilename = processBase64(bloco.content);
          if (savedFilename) {
            bloco.content = savedFilename;
          }
        }

        // 2. Novo formato Swiper/Carrossel: Checa dentro do array bloco.images
        if (Array.isArray(bloco.images)) {
          for (let i = 0; i < bloco.images.length; i++) {
            const img = bloco.images[i];
            if (typeof img.url === "string" && img.url.startsWith("data:")) {
              const savedFilename = processBase64(img.url);
              if (savedFilename) {
                bloco.images[i].url = savedFilename;
              }
            }
          }
        }
      }
    }

    (req as any).files = filesObj;
    req.body.blocos = JSON.stringify(blocos);

    return next();
  } catch (error) {
    console.error("base64BlocosToFiles error:", error);
    return next(error as any);
  }
};
