import SustentaiBloco from "../entities/SustentaiBloco.entity";
import sequelize from "../config/database";
import { Op } from "sequelize";

export interface ListOptions {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export class SustentaiBlocoService {
  static async list(options: ListOptions) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 20;
    const offset = (page - 1) * limit;

    const order: any = [];
    if (options.sort === "createdAt") order.push(["createdAt", "DESC"]);
    else order.push(["cliques", "DESC"]);

    const where: any = {};
    if (options.startDate && options.endDate) {
      const start = new Date(`${options.startDate}T00:00:00.000Z`);
      const end = new Date(`${options.endDate}T23:59:59.999Z`);
      where.createdAt = { [Op.between]: [start, end] };
    }

    const { rows: items, count: totalItems } = await SustentaiBloco.findAndCountAll({
      where,
      order,
      offset,
      limit,
    });

    const totalCliques = items.reduce((acc, it) => acc + (it.cliques || 0), 0);

    return {
      items,
      meta: {
        totalItems,
        page,
        limit,
        totalCliques,
      },
    };
  }

  static async incrementClicks(id: number) {
    // operação atômica
    const bloco = await SustentaiBloco.findByPk(id);
    if (!bloco) return null;
    await bloco.increment("cliques");
    await bloco.reload();
    return bloco;
  }
}
