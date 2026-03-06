import { Request, Response } from "express";
import { SustentaiBlocoService } from "../services/SustentaiBlocoService";
import SustentaiBloco from "../entities/SustentaiBloco.entity";

export class SustentaiBlocosController {
  static async list(req: Request, res: Response) {
    try {
      const { startDate, endDate, page, limit, sort } = req.query as any;
      const options = {
        startDate,
        endDate,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        sort,
      };

      const result = await SustentaiBlocoService.list(options);

      // Ajustar imagemUrl
      const items = result.items.map((it: any) => {
        const obj = it.toJSON();
        const imagem = obj.imagemPath || null;
        obj.imagemUrl = imagem ? imagem : null;
        return obj;
      });

      res.setHeader("Cache-Control", "public, max-age=60");
      return res.status(200).json({ items, meta: result.meta });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao listar blocos." });
    }
  }

  static async click(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const source = req.body && req.body.source ? req.body.source : null;

      const bloco = await SustentaiBlocoService.incrementClicks(parseInt(id, 10));
      if (!bloco) return res.status(404).json({ message: "Bloco não encontrado." });

      // opcional: salvar histórico simples em tabela se desejar (não implementado)

      return res.status(200).json({ id: bloco.id, cliques: bloco.cliques });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao registrar clique." });
    }
  }
}
