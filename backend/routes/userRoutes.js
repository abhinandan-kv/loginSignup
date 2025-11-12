import { Router } from "express";
import {
  forgotPassword,
  getFirstRefreshTokenAfterSignin,
  getUserData,
  login,
  logOut,
  logUserIpAfterLogin,
  refreshToken,
  resetPassword,
  sendLocalOtp,
  sendOtp,
  signUp,
  testController,
  verifyOtp,
  verifyResetToken,
} from "../controllers/userController.js";

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
userRouter.post("/refresh", refreshToken);
userRouter.post("/token", getFirstRefreshTokenAfterSignin);
userRouter.post("/forgot-password", forgotPassword);
userRouter.get("/forgot-password/verify", verifyResetToken);
userRouter.post("/forgot-password/reset-password", resetPassword);

export default userRouter;
