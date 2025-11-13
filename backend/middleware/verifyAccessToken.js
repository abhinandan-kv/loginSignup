import jwt from "jsonwebtoken";

export function verifyAccessToken(req, res, next) {
  try {
    // console.log("req.headers -> ", req.headers);
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Missing Authorization header" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access token not provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Access token verification failed:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }
    return res.status(403).json({ message: "Invalid access token" });
  }
}
