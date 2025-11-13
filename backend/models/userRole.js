import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const UserRole = sequelize.define("UserRole", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
