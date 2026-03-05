import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class SustentaiAcao extends Model {
  public id!: number;
  public titulo!: string;
  public slug!: string;
  public descricao!: string;
  public imagemUrl?: string | null;
  public linkTexto?: string | null;
  public linkDestino?: string | null;
  public corDestaque?: string | null;
  public corFundo?: string | null;
  public corBorda?: string | null;
  public corTexto?: string | null;
  public tag?: string | null;
}

SustentaiAcao.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imagemUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "imagem_url",
    },
    linkTexto: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "link_texto",
    },
    linkDestino: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "link_destino",
    },
    corDestaque: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "cor_destaque",
    },
    corFundo: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "cor_fundo",
    },
    corBorda: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "cor_borda",
    },
    corTexto: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "cor_texto",
    },
    tag: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // NOTE: `cardId` intentionally removed to avoid querying a non-existent column in the database.
  },
  {
    sequelize,
    tableName: "sustentai_acoes",
    timestamps: true,
  },
);

export default SustentaiAcao;
