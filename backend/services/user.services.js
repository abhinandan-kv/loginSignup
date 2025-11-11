import { UserTable } from "../models/index.js";

export const findOneUserInUserTable = (email) => {
  return UserTable.findOne({ where: { email } });
};

export const findOneUserInUserTableWithSafeColumns = (email) => {
  return UserTable.findOne({ where: { email }, attributes: ["name", "email", "verified"] });
};
