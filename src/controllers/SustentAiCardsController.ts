import { Request, Response } from "express";
import { SustentAiCardsService } from "../services/SustentAiCardsService";

export class SustentAiCardsController {
  static async create(req: Request, res: Response) {
    try {
      const card = await SustentAiCardsService.create(req.body, req.file);
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
      const card = await SustentAiCardsService.update(id, req.body, req.file);
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
      const cards = await SustentAiCardsService.getAll(startDate as string | undefined, endDate as string | undefined);
      return res.status(200).json(cards);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro ao buscar boxes." });
    }
  }

  static async deleteByTitle(req: Request, res: Response) {
    try {
      const { titulo } = req.params;
      const result = await SustentAiCardsService.deleteByTitle(titulo);
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
      const result = await SustentAiCardsService.registerNavClick();
      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro navbar" });
    }
  }

  static async registerCardClick(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await SustentAiCardsService.registerCardClick(id);
      return res.status(200).json(result);
    } catch (err: any) {
      console.error(err);
      const status = err.status || 500;
      const message = err.message || "Erro card";
      return res.status(status).json({ message });
    }
  }
}
