import { Router } from "express";
import {
  getFirstRefreshTokenAfterSignin,
  getUserData,
  login,
  logOut,
  refreshToken,
  sendLocalOtp,
  sendOtp,
  signUp,
  testController,
  verifyOtp,
} from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/test", testController);
userRouter.post("/otp", sendOtp);
userRouter.post("/signup", signUp);
userRouter.post("/verifyotp", verifyOtp);
userRouter.post("/login", login);
userRouter.post("/localotp", sendLocalOtp);
userRouter.post("/logout", logOut);
userRouter.post("/userdata", getUserData);
userRouter.post("/refresh", refreshToken);
userRouter.post("/token", getFirstRefreshTokenAfterSignin);

export default userRouter;
