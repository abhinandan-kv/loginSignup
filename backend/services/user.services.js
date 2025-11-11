import { UserTable } from "../models/index.js";
import { RefreshToken } from "../models/refreshTokenModel.js";

export const findOneUserInUserTable = (email) => {
  return UserTable.findOne({ where: { email } });
};

//change this function name later
export const findOneUserInUserTableWithSafeColumns = (email) => {
  const userData = UserTable.findOne({ where: { email }, attributes: ["id", "name", "email", "verified"] });
  return userData;
};

export const findOneUserToken = (id) => {
  const token = RefreshToken.findOne({ where: { id } });
  return token;
};
