import { Router } from "express";
import { getUserData, login, sendLocalOtp, sendOtp, signUp, testController, verifyOtp } from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/test", testController);
userRouter.post("/otp", sendOtp);
userRouter.post("/signup", signUp);
userRouter.post("/verifyotp", verifyOtp);
userRouter.post("/login", login);
userRouter.post("/localotp", sendLocalOtp);
userRouter.post('/userdata', getUserData)

export default userRouter;
