import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class SustentaiHeader extends Model {
  public id!: number;
  public titulo!: string;
  public subtitulo!: string;
  public data!: string;
}

SustentaiHeader.init(
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
    subtitulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "sustentai_header",
    timestamps: true,
  },
);

export default SustentaiHeader;