import { Request, Response } from "express";
import SustentaiHeader from "../entities/SustentaiHeader.entity";

export class SustentaiHeaderController {
  static async get(req: Request, res: Response) {
    try {
      const header = await SustentaiHeader.findOne({
        order: [["updatedAt", "DESC"]],
      });
      return res.status(200).json(header);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar header." });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { titulo, subtitulo, data } = req.body;

      if (!titulo || !subtitulo || !data) {
        return res.status(400).json({ message: "Campos obrigatórios não informados." });
      }

      const existing = await SustentaiHeader.findOne({
        order: [["updatedAt", "DESC"]],
      });

      if (existing) {
        await existing.update({ titulo, subtitulo, data });
        return res.status(200).json(existing);
      }

      const novo = await SustentaiHeader.create({ titulo, subtitulo, data });
      return res.status(201).json(novo);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao atualizar header." });
    }
  }
}