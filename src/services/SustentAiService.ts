import fs from "fs";
import path from "path";
import { Op } from "sequelize";
import sequelize from "../config/database";
import SustentAi from "../entities/SustentAi.entity";
import ContadorODS from "../entities/ContadorODS.entity";
import HistoricoCliqueSustentAi from "../entities/Historico/HistoricoCliqueSustentAi.entity";
import HistoricoAcessoMenu from "../entities/Historico/HistoricoAcessoMenu.entity";

const toSlug = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

export class SustentAiService {
  static async create(data: { titulo?: string; linkDestino?: string }, file?: Express.Multer.File) {
    const { titulo, linkDestino } = data;
    if (!file) throw { status: 400, message: "Imagem é obrigatória." };
    if (!titulo || !linkDestino) throw { status: 400, message: "Título e Link são obrigatórios." };

    const slug = toSlug(titulo);
    const baseDir = path.resolve(process.cwd(), "uploads", "newsletter", slug);
    ensureDir(baseDir);

    const oldPath = file.path;
    const newFilename = `${Date.now()}-${file.originalname}`;
    const newPath = path.join(baseDir, newFilename);

    fs.renameSync(oldPath, newPath);
    const dbImageUrl = `/uploads/newsletter/${slug}/${newFilename}`;

    try {
      const novoCard = await SustentAi.create({ titulo, linkDestino, imagemUrl: dbImageUrl });
      return novoCard;
    } catch (error: any) {
      // cleanup
      if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
      if (error.name === "SequelizeUniqueConstraintError") throw { status: 400, message: "Já existe uma box com este título." };
      throw { status: 500, message: "Erro ao criar box.", error };
    }
  }

  static async update(id: number | string, data: { titulo?: string; linkDestino?: string }, file?: Express.Multer.File) {
    const { titulo, linkDestino } = data;
    const card = await SustentAi.findByPk(id);
    if (!card) throw { status: 404, message: "Box não encontrada." };

    let currentSlug = toSlug(card.titulo);
    let newSlug = titulo ? toSlug(titulo) : currentSlug;
    let finalImageUrl = card.imagemUrl;

    if (titulo && titulo !== card.titulo) {
      const oldDir = path.resolve(process.cwd(), "uploads", "newsletter", currentSlug);
      const newDir = path.resolve(process.cwd(), "uploads", "newsletter", newSlug);

      if (fs.existsSync(oldDir) && !fs.existsSync(newDir)) {
        fs.renameSync(oldDir, newDir);
      }

      if (finalImageUrl) {
        finalImageUrl = finalImageUrl.replace(`/newsletter/${currentSlug}/`, `/newsletter/${newSlug}/`);
      }
      currentSlug = newSlug;
    }

    if (file) {
      const targetDir = path.resolve(process.cwd(), "uploads", "newsletter", currentSlug);
      ensureDir(targetDir);

      const newFilename = `${Date.now()}-${file.originalname}`;
      const newPath = path.join(targetDir, newFilename);

      if (card.imagemUrl) {
        const oldFile = path.resolve(process.cwd(), card.imagemUrl.replace(/^\//, ""));
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }

      fs.renameSync(file.path, newPath);
      finalImageUrl = `/uploads/newsletter/${currentSlug}/${newFilename}`;
    }

    await card.update({
      titulo: titulo || card.titulo,
      linkDestino: linkDestino || card.linkDestino,
      imagemUrl: finalImageUrl,
    });

    return card;
  }

  static async getAll(startDate?: string | undefined, endDate?: string | undefined) {
    const cards = await SustentAi.findAll({ order: [["createdAt", "DESC"]] });

    if (!startDate || !endDate) return cards;

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const historico = await HistoricoCliqueSustentAi.findAll({
      attributes: ["sustentAiId", [sequelize.fn("COUNT", sequelize.col("id")), "totalCliques"]],
      where: { createdAt: { [Op.between]: [start, end] } },
      group: ["sustentAiId"],
    });

    const cliquesPorCard: Record<number, number> = {};
    historico.forEach((row: any) => {
      cliquesPorCard[row.sustentAiId] = parseInt(row.getDataValue("totalCliques"), 10);
    });

    const cardsFiltrados = cards.map((card) => {
      const cardData = card.toJSON();
      cardData.visualizacoes = cliquesPorCard[card.id] || 0;
      return cardData;
    });

    return cardsFiltrados;
  }

  static async deleteByTitle(titulo: string) {
    const card = await SustentAi.findOne({ where: { titulo } });
    if (!card) throw { status: 404, message: "Box não encontrada." };

    const slug = toSlug(card.titulo);
    const dirPath = path.resolve(process.cwd(), "uploads", "newsletter", slug);
    if (fs.existsSync(dirPath)) fs.rmSync(dirPath, { recursive: true, force: true });

    await card.destroy();
    return { message: "Box removida com sucesso." };
  }

  static async registerNavClick() {
    const chave = "SUSTENTAI_NAV";
    let contador = await ContadorODS.findOne({ where: { ods: chave } });

    if (!contador) {
      contador = await ContadorODS.create({ ods: chave, visualizacoes: 1 });
    } else {
      await contador.increment("visualizacoes");
    }
    await HistoricoAcessoMenu.create({ chave });
    return { message: "Clique navbar OK" };
  }

  static async registerCardClick(id: number | string) {
    const card = await SustentAi.findByPk(id);
    if (!card) throw { status: 404, message: "Card não existe" };

    await card.increment("visualizacoes");
    await HistoricoCliqueSustentAi.create({ sustentAiId: card.id });
    return { message: "Clique card OK" };
  }
}
