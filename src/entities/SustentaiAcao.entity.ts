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
  public cliques!: number;
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
    cliques: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "sustentai_acoes",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["titulo"],
        name: "sustentai_acoes_titulo_unique",
      },
      {
        unique: true,
        fields: ["slug"],
        name: "sustentai_acoes_slug_unique",
      },
    ],
  },
);

export default SustentaiAcao;
