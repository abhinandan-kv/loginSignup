import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const RolePermission = sequelize.define("RolePermission", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  permissionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
