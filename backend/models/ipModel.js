import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const IpTable = sequelize.define(
  "IpTable",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { tableName: "ip" }
);

// try {
//   await IpTable.sync();
//   console.log("IpTable synced");
// } catch (error) {
//   console.log(error);
// }

export default IpTable;
