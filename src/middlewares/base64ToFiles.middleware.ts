import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

export const base64BlocosToFiles = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let { blocos } = req.body as any;

    if (!blocos) return next();

    if (typeof blocos === 'string') {
      try {
        blocos = JSON.parse(blocos);
      } catch (err) {
        return next();
      }
    }

    if (!Array.isArray(blocos)) return next();

    // garante estrutura de req.files compatível com upload.fields
    // Se multer já colocou arquivos em req.files como array (upload.any()), converte para objeto
    const existingFiles = (req as any).files;
    let filesObj: { [key: string]: Express.Multer.File[] } = {};

    if (!existingFiles) {
      filesObj = {};
    } else if (Array.isArray(existingFiles)) {
      // converter array para objeto sob a chave 'conteudoFiles'
      filesObj = { conteudoFiles: existingFiles as Express.Multer.File[] };
    } else {
      filesObj = existingFiles as { [key: string]: Express.Multer.File[] };
    }

    if (!filesObj['conteudoFiles']) filesObj['conteudoFiles'] = [];

    for (const bloco of blocos) {
      if (bloco && bloco.type === 'image' && typeof bloco.content === 'string' && bloco.content.startsWith('data:image/')) {
        const matches = bloco.content.match(/^data:(image\/(png|jpeg|jpg|webp|gif));base64,(.+)$/);
        if (!matches) continue;
        const mime = matches[1];
        const ext = matches[2] === 'jpeg' ? 'jpg' : matches[2];
        const buffer = Buffer.from(matches[3], 'base64');
        const filename = `${Date.now()}-${uuidv4()}.${ext}`;
        const filepath = path.join(UPLOADS_DIR, filename);

        // garante pasta de uploads
        if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

        // grava o arquivo temporário
        fs.writeFileSync(filepath, buffer);

        // adiciona à lista de arquivos simulando a estrutura do multer (campo conteudoFiles)
        filesObj['conteudoFiles'].push({
          fieldname: 'conteudoFiles',
          originalname: filename,
          encoding: '7bit',
          mimetype: mime,
          destination: UPLOADS_DIR,
          filename: filename,
          path: filepath,
          size: buffer.length,
        } as unknown as Express.Multer.File);

        // atualiza o bloco para referenciar o nome do arquivo (será usado no mapeamento)
        bloco.content = filename;
      }
    }

    // assegura que req.files é o objeto esperado
    (req as any).files = filesObj;

    // coloca blocos atualizados de volta no body (stringify caso venha como string)
    req.body.blocos = JSON.stringify(blocos);

    return next();
  } catch (error) {
    console.error('base64BlocosToFiles error:', error);
    return next(error as any);
  }
};
