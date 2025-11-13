import jwt from "jsonwebtoken";
import { UserTable, roleModel, permissionModel } from "../models/index.js";

export const verifyPermission = (requiredPerms = []) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await UserTable.findByPk(decoded.id, {
        include: [{ model: roleModel, include: [permissionModel] }],
      });

      const userPerms = user.roles.flatMap((role) =>
        role.permissions.map((p) => p.name)
      );

      if (!requiredPerms.some((perm) => userPerms.includes(perm))) {
        return res.status(403).json({ message: "Forbidden: Missing permission" });
      }

      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};
