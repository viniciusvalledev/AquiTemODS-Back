import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class SustentaiBloco extends Model {
  public id!: number;
  public titulo!: string;
  public descricao?: string;
  public imagemPath!: string;
  public cliques!: number;
  public ativo!: boolean;
}

SustentaiBloco.init(
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
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imagemPath: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "imagem_path",
    },
    cliques: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "sustentai_blocos",
    timestamps: true,
  },
);

export default SustentaiBloco;
