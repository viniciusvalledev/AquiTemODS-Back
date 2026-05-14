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

    const processBase64 = (base64String: string) => {
      // Regex que pega qualquer coisa entre "data:" e ";base64,"
      const matches = base64String.match(/^data:(.*?);base64,(.+)$/);

      if (!matches) {
        console.log("❌ Base64 não reconhecido pelo Regex.");
        return null;
      }

      const mime = matches[1]; // ex: video/mp4, image/png, application/pdf
      const base64Data = matches[2];

      // Aqui nós liberamos o que é permitido: Imagens, VÍDEOS e PDFs
      if (
        !mime.startsWith("image/") &&
        !mime.startsWith("video/") &&
        mime !== "application/pdf"
      ) {
        return null;
      }

      let ext = mime.split("/")[1];
      if (ext === "jpeg") ext = "jpg";
      if (ext === "quicktime") ext = "mov";

      const buffer = Buffer.from(base64Data, "base64");
      const filename = `${Date.now()}-${uuidv4()}.${ext}`;
      const filepath = path.join(UPLOADS_DIR, filename);

      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }

      fs.writeFileSync(filepath, buffer);
      console.log(`📂 Arquivo temporário criado: ${filename}`);

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

    for (const bloco of blocos) {
      if (
        bloco &&
        (bloco.type === "image" ||
          bloco.type === "video" ||
          bloco.tipo === "video")
      ) {
        const campoConteudo =
          bloco.content !== undefined ? "content" : "conteudo";

        if (
          typeof bloco[campoConteudo] === "string" &&
          bloco[campoConteudo].startsWith("data:")
        ) {
          const savedFilename = processBase64(bloco[campoConteudo]);
          if (savedFilename) {
            bloco[campoConteudo] = savedFilename;
          }
        }

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

        if (Array.isArray(bloco.videos)) {
          for (let i = 0; i < bloco.videos.length; i++) {
            const vid = bloco.videos[i];
            if (typeof vid.url === "string" && vid.url.startsWith("data:")) {
              const savedFilename = processBase64(vid.url);
              if (savedFilename) {
                bloco.videos[i].url = savedFilename;
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
