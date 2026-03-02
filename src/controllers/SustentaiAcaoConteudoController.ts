import { Request, Response } from "express";
import sequelize from "../config/database";
import SustentaiAcao from "../entities/SustentaiAcao.entity";
import SustentaiAcaoBloco from "../entities/SustentaiAcaoBloco.entity";

export class SustentaiAcaoConteudoController {
  static async getConteudo(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const acao = await SustentaiAcao.findByPk(id);
      if (!acao) return res.status(404).json({ message: "Ação não encontrada." });

      const blocos = await SustentaiAcaoBloco.findAll({
        where: { acaoId: acao.id },
        order: [["ordem", "ASC"]],
      });

      return res.status(200).json({ blocos });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar conteúdo da ação." });
    }
  }

  static async createConteudo(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { blocos } = req.body;

      const acao = await SustentaiAcao.findByPk(id);
      if (!acao) {
        await transaction.rollback();
        return res.status(404).json({ message: "Ação não encontrada." });
      }

      if (!Array.isArray(blocos)) {
        await transaction.rollback();
        return res.status(400).json({ message: "Blocos deve ser um array." });
      }

      const existing = await SustentaiAcaoBloco.findOne({ where: { acaoId: acao.id } });
      if (existing) {
        await transaction.rollback();
        return res.status(409).json({ message: "Conteúdo já existe para esta ação. Use PUT para atualizar." });
      }

      const blocosParaCriar = blocos.map((bloco: any, index: number) => ({
        acaoId: acao.id,
        type: bloco.type,
        content: bloco.content,
        bgColor: bloco.bgColor || "bg-white",
        isBold: bloco.isBold === true,
        ordem: typeof bloco.ordem === "number" ? bloco.ordem : index,
      }));

      await SustentaiAcaoBloco.bulkCreate(blocosParaCriar, { transaction });

      await transaction.commit();
      return res.status(201).json({ message: "Conteúdo criado com sucesso." });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ message: "Erro ao criar conteúdo da ação." });
    }
  }

  static async updateConteudo(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { blocos } = req.body;

      const acao = await SustentaiAcao.findByPk(id);
      if (!acao) {
        await transaction.rollback();
        return res.status(404).json({ message: "Ação não encontrada." });
      }

      if (!Array.isArray(blocos)) {
        await transaction.rollback();
        return res.status(400).json({ message: "Blocos deve ser um array." });
      }

      await SustentaiAcaoBloco.destroy({
        where: { acaoId: acao.id },
        transaction,
      });

      const blocosParaCriar = blocos.map((bloco: any, index: number) => ({
        acaoId: acao.id,
        type: bloco.type,
        content: bloco.content,
        bgColor: bloco.bgColor || "bg-white",
        isBold: bloco.isBold === true,
        ordem: typeof bloco.ordem === "number" ? bloco.ordem : index,
      }));

      await SustentaiAcaoBloco.bulkCreate(blocosParaCriar, { transaction });

      await transaction.commit();

      return res.status(200).json({ message: "Conteúdo atualizado com sucesso." });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ message: "Erro ao atualizar conteúdo da ação." });
    }
  }
}