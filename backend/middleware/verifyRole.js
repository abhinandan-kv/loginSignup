import jwt from "jsonwebtoken";
import { roleModel, UserTable } from "../models/index.js";

export const verifyRole = (rolesAllowed = []) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await UserTable.findByPk(decoded.id, {
        include: [{ model: roleModel }],
      });

      const userRoles = user.roles.map((r) => r.name);

      if (!rolesAllowed.some((role) => userRoles.includes(role))) {
        return res.status(403).json({ message: "Forbidden: Insufficient role" });
      }

      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};
