import { Request, Response } from "express";
import { SustentAiService } from "../services/SustentAiService";

export class SustentAiControllerNew {
  static async create(req: Request, res: Response) {
    try {
      const card = await SustentAiService.create(req.body, req.file);
      return res.status(201).json(card);
    } catch (err: any) {
      console.error(err);
      const status = err.status || 500;
      const message = err.message || "Erro ao criar box.";
      return res.status(status).json({ message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const card = await SustentAiService.update(id, req.body, req.file);
      return res.status(200).json(card);
    } catch (err: any) {
      console.error(err);
      const status = err.status || 500;
      const message = err.message || "Erro ao atualizar box.";
      return res.status(status).json({ message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const cards = await SustentAiService.getAll(startDate as string | undefined, endDate as string | undefined);
      return res.status(200).json(cards);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro ao buscar boxes." });
    }
  }

  static async deleteByTitle(req: Request, res: Response) {
    try {
      const { titulo } = req.params;
      const result = await SustentAiService.deleteByTitle(titulo);
      return res.status(200).json(result);
    } catch (err: any) {
      console.error(err);
      const status = err.status || 500;
      const message = err.message || "Erro ao remover box.";
      return res.status(status).json({ message });
    }
  }

  static async registerNavClick(req: Request, res: Response) {
    try {
      const result = await SustentAiService.registerNavClick();
      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro navbar" });
    }
  }

  static async registerCardClick(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await SustentAiService.registerCardClick(id);
      return res.status(200).json(result);
    } catch (err: any) {
      console.error(err);
      const status = err.status || 500;
      const message = err.message || "Erro card";
      return res.status(status).json({ message });
    }
  }
}
