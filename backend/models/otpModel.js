import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const otpTable = sequelize.define(
  "OtpTable",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    otpCode: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "otps", 
  }
);

// try {
//   await otpTable.sync();
//   console.log("otpTable synced");
// } catch (error) {
//   console.log(error);
// }

export default otpTable;
