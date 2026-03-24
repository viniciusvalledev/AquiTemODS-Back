import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class SustentaiAcaoBloco extends Model {
  public id!: number;
  public acaoId!: number;
  public type!: string;
  public content!: string;
  public bgColor!: string;
  public isBold!: boolean;
  public ordem!: number;
}

SustentaiAcaoBloco.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    acaoId: {
      type: DataTypes.INTEGER,
      allowNull: true, // alterado para true para ser compatível com a FK existente (ON DELETE SET NULL)
      field: "acao_id",
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    bgColor: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "bg_color",
    },
    isBold: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_bold",
    },
    ordem: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "sustentai_acao_blocos",
    timestamps: true,
  },
);

export default SustentaiAcaoBloco;