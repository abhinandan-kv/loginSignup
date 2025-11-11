import sequelize from "../config/database.js";
import IpTable from "./ipModel.js";
import otpTable from "./otpModel.js";
import UserTable from "./userModel.js";

UserTable.hasMany(otpTable, { foreignKey: "userId", onDelete: "CASCADE" });
otpTable.belongsTo(UserTable, { foreignKey: "userId" });

UserTable.hasMany(IpTable, { foreignKey: "userId", onDelete: "CASCADE" });
IpTable.belongsTo(UserTable, { foreignKey: "userId" });

try {
  await sequelize.sync();
  console.log("All model Synced");
} catch (error) {
  console.log(error);
}
export { UserTable, otpTable, IpTable };
