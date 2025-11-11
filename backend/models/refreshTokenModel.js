import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const RefreshToken = sequelize.define("RefreshToken", {
  token: {
    type: DataTypes.STRING(512),
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  revoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});
