import { col, fn } from "sequelize";
import { permissionModel, roleModel, UserTable } from "../models/index.js";
import { RefreshToken } from "../models/refreshTokenModel.js";
import { decryptDeterministic } from "../utils/cryptoUtils.js";

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

export const findOneUserWithRolesPermissionsbyId = async (userId) => {
  const userData = await UserTable.findByPk(userId, {
    include: [
      {
        model: roleModel,
        as: "roles",
        include: [{ model: permissionModel, as: "permissions" }],
      },
    ],
  });
  return userData;
};

export async function getUserRolesAndPermissions(id) {
  try {
    if (!id) return { message: "User ID required" };

    const userEnc = await UserTable.findByPk(id);
    if (!userEnc) return { message: "User not found" };

    const roles = await userEnc.getRoles({ raw: true });
    if (!roles.length) return { userEnc, roles: [], permissions: [] };

    const roleIds = roles.map((r) => r.id);
    const rolePerms = await roleModel.findAll({
      where: { id: roleIds },
      include: [
        {
          model: permissionModel,
          as: "permissions",
          through: { attributes: [] },
        },
      ],
    });

    const decryptedEmail = await decryptDeterministic(userEnc.dataValues.email);
    const decryptedName = await decryptDeterministic(userEnc.dataValues.name);

    const user = { id: userEnc.dataValues.id, name: decryptedName, email: decryptedEmail, verified: userEnc.dataValues.verified };

    const permissions = [...new Set(rolePerms.flatMap((role) => role.permissions.map((perm) => perm.name.trim())))];

    return {
      user,
      roles: roles.map((r) => r.name),
      permissions,
    };
  } catch (err) {
    console.error("Error fetching roles/permissions:", err);
    return { message: "Internal server error" };
  }
}

export async function listAllUserList(verified = true) {
  try {
    const userList = await UserTable.findAll({ where: { verified } });
    console.log("UserList ->", userList);
    return userList;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function countAllUser(verified = true) {
  try {
    const userCount = await UserTable.count({ where: { verified } });
    console.log(userCount);
    return userCount;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function countUserMonthly(verified = true) {
  try {
    const queryRes = await UserTable.findAll({
      attributes: [
        // change the args date format for monthly | yearly | daily data
        [fn("DATE_FORMAT", col("createdAt"), "%Y-%m-%d"), "month"],
        [fn("COUNT", col("id")), "value"],
      ],
      group: ["month"],
      raw: true,
    });

    // console.log(queryRes);
    return queryRes;
  } catch (error) {
    console.error(error);
    return null;
  }
}
