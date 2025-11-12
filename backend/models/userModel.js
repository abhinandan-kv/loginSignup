import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserTable = sequelize.define(
  "UserTable",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      //removed validation because of encryption
    },
    password: { type: DataTypes.STRING, allowNull: false },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
      comment: "0 means false, 1 means true",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    paranoid: false,
  }
);

// try {
//   await UserTable.sync();
//   console.log("UserTable Synced");
// } catch (error) {
//   console.log(error);
// }
export default UserTable;
