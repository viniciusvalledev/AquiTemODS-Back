import { Request, Response } from "express";
import SustentaiPessoa from "../entities/SustentaiPessoa.entity";
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

export class SustentaiPessoasController {
  static async getAll(req: Request, res: Response) {
    try {
      const pessoas = await SustentaiPessoa.findAll({
        order: [["createdAt", "DESC"]],
      });
      return res.status(200).json(pessoas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar pessoas." });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { nome, cargo, descricao, imagemUrl } = req.body;

      if (!nome || !cargo || !descricao) {
        return res.status(400).json({ message: "Campos obrigatórios não informados." });
      }

      let finalImagemUrl = imagemUrl || null;

      if (req.file) {
        const slug = toSlug(nome);
        const baseDir = path.resolve(process.cwd(), "uploads", "sustentai", "pessoas", slug);
        ensureDir(baseDir);

        const newFilename = `${Date.now()}-${req.file.originalname}`;
        const newPath = path.join(baseDir, newFilename);

        fs.renameSync(req.file.path, newPath);
        finalImagemUrl = `/uploads/sustentai/pessoas/${slug}/${newFilename}`;
      }

      if (!finalImagemUrl) {
        return res.status(400).json({ message: "Imagem é obrigatória (upload ou imagemUrl)." });
      }

      const novaPessoa = await SustentaiPessoa.create({
        nome,
        cargo,
        descricao,
        imagemUrl: finalImagemUrl,
      });

      return res.status(201).json(novaPessoa);
    } catch (error: any) {
      console.error(error);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(500).json({ message: "Erro ao criar pessoa." });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, cargo, descricao, imagemUrl } = req.body;

      const pessoa = await SustentaiPessoa.findByPk(id);
      if (!pessoa) return res.status(404).json({ message: "Pessoa não encontrada." });

      let finalImagemUrl = pessoa.imagemUrl;

      if (req.file) {
        const slug = toSlug(nome || pessoa.nome);
        const baseDir = path.resolve(process.cwd(), "uploads", "sustentai", "pessoas", slug);
        ensureDir(baseDir);

        const newFilename = `${Date.now()}-${req.file.originalname}`;
        const newPath = path.join(baseDir, newFilename);

        if (pessoa.imagemUrl) {
          const oldFile = path.resolve(process.cwd(), pessoa.imagemUrl.replace(/^\//, ""));
          if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
        }

        fs.renameSync(req.file.path, newPath);
        finalImagemUrl = `/uploads/sustentai/pessoas/${slug}/${newFilename}`;
      } else if (imagemUrl) {
        finalImagemUrl = imagemUrl;
      }

      await pessoa.update({
        nome: nome ?? pessoa.nome,
        cargo: cargo ?? pessoa.cargo,
        descricao: descricao ?? pessoa.descricao,
        imagemUrl: finalImagemUrl,
      });

      return res.status(200).json(pessoa);
    } catch (error: any) {
      console.error(error);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(500).json({ message: "Erro ao atualizar pessoa." });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pessoa = await SustentaiPessoa.findByPk(id);

      if (!pessoa) return res.status(404).json({ message: "Pessoa não encontrada." });

      // Remover pasta inteira associada à pessoa (slug baseado no nome)
      const slug = toSlug(pessoa.nome);
      const dirPath = path.resolve(process.cwd(), "uploads", "sustentai", "pessoas", slug);
      if (fs.existsSync(dirPath)) {
        try {
          fs.rmSync(dirPath, { recursive: true, force: true });
        } catch (err) {
          console.warn('Falha ao remover diretório da pessoa:', err);
        }
      } else if (pessoa.imagemUrl) {
        // fallback: remover arquivo único se pasta não existir
        const filePath = path.resolve(process.cwd(), pessoa.imagemUrl.replace(/^\//, ""));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await pessoa.destroy();
      return res.status(200).json({ message: "Pessoa removida com sucesso." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao remover pessoa." });
    }
  }
}