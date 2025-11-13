import sequelize from "../config/database.js";
import IpTable from "./ipModel.js";
import otpTable from "./otpModel.js";
import { permissionModel } from "./permissionModel.js";
import { roleModel } from "./rolesModel.js";
import UserTable from "./userModel.js";
import { UserRole } from "./userRole.js";
import { RolePermission } from "./rolePermission.js";

UserTable.hasMany(otpTable, { foreignKey: "userId", onDelete: "CASCADE" });
otpTable.belongsTo(UserTable, { foreignKey: "userId" });

UserTable.hasMany(IpTable, { foreignKey: "userId", onDelete: "CASCADE" });
IpTable.belongsTo(UserTable, { foreignKey: "userId" });

UserTable.belongsToMany(roleModel, { through: UserRole, foreignKey: "userId", as: "roles" });
roleModel.belongsToMany(UserTable, { through: UserRole, foreignKey: "roleId", as: "users" });

roleModel.belongsToMany(permissionModel, { through: RolePermission, foreignKey: "roleId", as: "permissions" });
permissionModel.belongsToMany(roleModel, { through: RolePermission, foreignKey: "permissionId", as: "roles" });

try {
  await sequelize.sync();
  console.log(" All models synced successfully!");
} catch (error) {
  console.error(" Sequelize sync error:", error);
}

export { UserTable, otpTable, IpTable, roleModel, permissionModel, UserRole, RolePermission };
