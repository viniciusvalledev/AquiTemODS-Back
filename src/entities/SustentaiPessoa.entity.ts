import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class SustentaiPessoa extends Model {
  public id!: number;
  public nome!: string;
  public cargo!: string;
  public descricao!: string;
  public imagemUrl?: string | null;
}

SustentaiPessoa.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cargo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imagemUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "imagem_url",
    },
  },
  {
    sequelize,
    tableName: "sustentai_pessoas",
    timestamps: true,
  },
);

export default SustentaiPessoa;