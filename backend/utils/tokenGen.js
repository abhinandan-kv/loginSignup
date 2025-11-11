import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { RefreshToken } from "../models/refreshTokenModel.js";
dotenv.config();

// /**
//  * Verify refresh token validity and (optional) existence in DB
//  * @param {string} token - The refresh token to verify
//  * @returns {object|null} Decoded payload if valid, else null
//  */
export const verifyRefreshToken = async (token) => {
  try {
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    if (process.env.USE_REFRESH_DB === "true") {
      console.log("USE REFRESH DB TRUE");
      const storedToken = await RefreshToken.findOne({
        where: { token, userId: decoded.userId, revoked: false },
      });
      if (!storedToken) {
        console.warn("Refresh token not found or revoked");
        return null;
      }
    }

    return decoded;
  } catch (err) {
    console.error("Refresh token verification failed:", err.message);
    return null;
  }
};

export const generateTokens = async (user) => {
  const accessToken = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "15m" });

  const refreshToken = jwt.sign({ userId: user.id, name: user.name, email: user.email, verified: user.verified }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  await RefreshToken.create({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //7days
  });

  return { accessToken, refreshToken };
};
