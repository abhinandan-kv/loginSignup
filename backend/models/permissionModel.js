import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const permissionModel = sequelize.define(
  "permissionTable",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { paranoid: true }
);

