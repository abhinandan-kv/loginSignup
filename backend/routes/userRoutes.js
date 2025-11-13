import { Router } from "express";
import {
  adminDashboard,
  forgotPassword,
  getFirstRefreshTokenAfterSignin,
  getTotalUserCount,
  getUserData,
  login,
  logOut,
  logUserIpAfterLogin,
  refreshAccessToken,
  resetPassword,
  sendLocalOtp,
  sendOtp,
  signUp,
  testController,
  verifyOtp,
  verifyResetToken,
} from "../controllers/userController.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
import { verifyRole } from "../middleware/verifyRole.js";
import { verifyPermission } from "../middleware/verifyPermission.js";

const userRouter = Router();

userRouter.get("/test", testController);
userRouter.post("/otp", sendOtp);
userRouter.post("/signup", signUp);
userRouter.post("/verifyotp", verifyOtp);
userRouter.post("/login", login);
userRouter.post("/localotp", sendLocalOtp);
userRouter.post("/logip", logUserIpAfterLogin);
userRouter.post("/logout", logOut);
userRouter.post("/userdata", getUserData);
userRouter.post("/refresh", refreshAccessToken);
userRouter.post("/token", getFirstRefreshTokenAfterSignin);
userRouter.post("/forgot-password", forgotPassword);
userRouter.get("/forgot-password/verify", verifyResetToken);
userRouter.post("/forgot-password/reset-password", resetPassword);
userRouter.post("/usercount", verifyAccessToken, getTotalUserCount);

userRouter.post("/admindashboard", verifyAccessToken, verifyRole(["admin"]), verifyPermission(["view_dashboard"]), adminDashboard);

export default userRouter;
