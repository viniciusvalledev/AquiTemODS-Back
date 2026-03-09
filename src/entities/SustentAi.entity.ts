import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class SustentAi extends Model {
  public id!: number;
  public titulo!: string;
  public linkDestino!: string;
  public imagemUrl!: string;
  public visualizacoes!: number;
}

SustentAi.init(
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
    linkDestino: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "link_destino",
    },
    imagemUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "imagem_url",
    },
    visualizacoes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "sustentai_cards",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["titulo"],
        name: "sustentai_cards_titulo_unique",
      },
    ],
  },
);

export default SustentAi;
