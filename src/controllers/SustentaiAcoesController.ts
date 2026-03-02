import { Request, Response } from "express";
import SustentaiAcao from "../entities/SustentaiAcao.entity";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";

const toSlug = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

export class SustentaiAcoesController {
  static async getAll(req: Request, res: Response) {
    try {
      const acoes = await SustentaiAcao.findAll({
        order: [["createdAt", "DESC"]],
      });
      return res.status(200).json(acoes);
    } catch (error: any) {
      console.error('[SustentaiAcoesController.getAll] error:', error);
      return res.status(500).json({ message: "Erro ao buscar ações.", detail: error.message || String(error) });
    }
  }

  static async getByIdOrSlug(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const acao = /^\d+$/.test(id)
        ? await SustentaiAcao.findByPk(id)
        : await SustentaiAcao.findOne({ where: { slug: id } });

      if (!acao) return res.status(404).json({ message: "Ação não encontrada." });

      return res.status(200).json(acao);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar ação." });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      console.log('[SustentaiAcoesController.create] req.headers:', req.headers);
      console.log('[SustentaiAcoesController.create] req.body:', req.body);
      console.log('[SustentaiAcoesController.create] req.file:', req.file);

      // Proteção: não permita criar quando o cliente enviar um `id` (indica request inválida/duplicada)
      if (req.body && (req.body.id || req.body.projetoId)) {
        return res.status(400).json({ message: 'Requisição inválida: não envie `id` ao criar.' });
      }

      const {
        titulo,
        descricao,
        linkTexto,
        linkDestino,
        corDestaque,
        corFundo,
        corBorda,
        imagemUrl,
      } = req.body;

      // Exigir apenas título; descrição pode ficar vazia
      const missing: string[] = [];
      if (!titulo) missing.push('titulo');
      if (missing.length > 0) {
        return res.status(400).json({ message: 'Campos obrigatórios não informados.', missing });
      }

      const slug = toSlug(titulo);
      let finalImagemUrl = imagemUrl || null;

      if (req.file) {
        const baseDir = path.resolve(process.cwd(), "uploads", "sustentai", "acoes", slug);
        ensureDir(baseDir);

        const newFilename = `${Date.now()}-${req.file.originalname}`;
        const newPath = path.join(baseDir, newFilename);

        fs.renameSync(req.file.path, newPath);
        finalImagemUrl = `/uploads/sustentai/acoes/${slug}/${newFilename}`;
      }

      // Tenta criar de forma atômica para evitar condições de corrida
      const defaults = {
        titulo,
        slug,
        descricao: descricao ?? "",
        imagemUrl: finalImagemUrl ?? "",
        linkTexto: linkTexto ?? "",
        linkDestino: linkDestino ?? "",
        corDestaque: corDestaque ?? "",
        corFundo: corFundo ?? "",
        corBorda: corBorda ?? "",
      };

      const [novaAcao, created] = await SustentaiAcao.findOrCreate({ where: { titulo }, defaults });

      if (!created) {
        // limpamos arquivo salvo se o registro não foi criado
        if (finalImagemUrl && finalImagemUrl.startsWith('/uploads/')) {
          try {
            const filePath = path.resolve(process.cwd(), finalImagemUrl.replace(/^\//, ''));
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          } catch (err) {
            console.warn('Falha ao limpar arquivo não utilizado:', err);
          }
        }
        return res.status(409).json({ message: 'Já existe uma ação com este título.' });
      }

      return res.status(201).json(novaAcao);
    } catch (error: any) {
      console.error(error);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(500).json({ message: "Erro ao criar ação." });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        titulo,
        descricao,
        linkTexto,
        linkDestino,
        corDestaque,
        corFundo,
        corBorda,
        imagemUrl,
      } = req.body;

      const acao = await SustentaiAcao.findByPk(id);
      if (!acao) return res.status(404).json({ message: "Ação não encontrada." });

      let currentSlug = acao.slug;
      let newSlug = titulo ? toSlug(titulo) : currentSlug;
      let finalImagemUrl = acao.imagemUrl;

      if (titulo && titulo !== acao.titulo && finalImagemUrl) {
        const oldDir = path.resolve(process.cwd(), "uploads", "sustentai", "acoes", currentSlug);
        const newDir = path.resolve(process.cwd(), "uploads", "sustentai", "acoes", newSlug);

        if (fs.existsSync(oldDir) && !fs.existsSync(newDir)) {
          fs.renameSync(oldDir, newDir);
        }

        if (finalImagemUrl.includes(`/acoes/${currentSlug}/`)) {
          finalImagemUrl = finalImagemUrl.replace(`/acoes/${currentSlug}/`, `/acoes/${newSlug}/`);
        }
        currentSlug = newSlug;
      }

      if (req.file) {
        const baseDir = path.resolve(process.cwd(), "uploads", "sustentai", "acoes", currentSlug);
        ensureDir(baseDir);

        const newFilename = `${Date.now()}-${req.file.originalname}`;
        const newPath = path.join(baseDir, newFilename);

        if (acao.imagemUrl) {
          const oldFile = path.resolve(process.cwd(), acao.imagemUrl.replace(/^\//, ""));
          if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
        }

        fs.renameSync(req.file.path, newPath);
        finalImagemUrl = `/uploads/sustentai/acoes/${currentSlug}/${newFilename}`;
      } else if (imagemUrl) {
        finalImagemUrl = imagemUrl;
      }

      await acao.update({
        titulo: titulo ?? acao.titulo,
        slug: newSlug,
        descricao: descricao ?? acao.descricao,
        imagemUrl: finalImagemUrl ?? "",
        linkTexto: (linkTexto ?? acao.linkTexto) ?? "",
        linkDestino: (linkDestino ?? acao.linkDestino) ?? "",
        corDestaque: (corDestaque ?? acao.corDestaque) ?? "",
        corFundo: (corFundo ?? acao.corFundo) ?? "",
        corBorda: (corBorda ?? acao.corBorda) ?? "",
      });

      return res.status(200).json(acao);
    } catch (error: any) {
      console.error(error);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(500).json({ message: "Erro ao atualizar ação." });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const acao = await SustentaiAcao.findByPk(id);

      if (!acao) return res.status(404).json({ message: "Ação não encontrada." });

      const slug = acao.slug;
      const dirPath = path.resolve(process.cwd(), "uploads", "sustentai", "acoes", slug);

      if (fs.existsSync(dirPath)) fs.rmSync(dirPath, { recursive: true, force: true });

      await acao.destroy();
      return res.status(200).json({ message: "Ação removida com sucesso." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao remover ação." });
    }
  }
}