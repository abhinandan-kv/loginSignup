import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const roleModel = sequelize.define(
  "roleTable",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: { type: DataTypes.STRING, allowNull: true },
  },
  { paranoid: true }
);
