import { OtpGen } from "../utils/otpGenerator.js";
import { STATUS_CODES } from "../utils/statusCodes.js";
import { IpTable, otpTable, UserTable } from "../models/index.js";
import sendOtpEmailEthereal from "../utils/sendOtpMail.js";
import bcrypt, { compare } from "bcrypt";
import { findOneUserInUserTable, findOneUserInUserTableWithSafeColumns, findOneUserToken } from "../services/user.services.js";
import { logUserLogin } from "../utils/getIp.js";
import jwt from "jsonwebtoken";
import sendOtpEmailGmailOAuth from "../utils/outhOtpMail.js";
import { generateTokens, verifyRefreshToken } from "../utils/tokenGen.js";
import { RefreshToken } from "../models/refreshTokenModel.js";

const SALT_ROUNDS = 10;

export async function testController(req, res) {
  try {
    res.status(STATUS_CODES.OK.code).send("WORKING...");
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODES.BadRequest.code).send(STATUS_CODES.BadRequest.description);
  }
}

export async function signUp(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(200).json({ message: "Email and password are required" });
    }

    const user = await findOneUserInUserTable(email);
    if (user && user.verified) {
      return res.status(200).json({ message: "User is not verified yet. Please login to verify!" });
    }
    if (user) {
      return res.status(200).json({ message: "User already exists! Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await UserTable.create({ name, email, password: hashedPassword });

    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // await sendOtpEmailEthereal(email, otpCode);
    await sendOtpEmailGmailOAuth(email, otpCode);

    await sendOtp(req);
    res.status(201).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP." });
  }
}

export async function sendOtp(req, res = null) {
  try {
    const { email } = req.body;

    if (!email) {
      const message = "Email is required.";
      if (res) return res.status(400).json({ message });
      throw new Error(message);
    }

    const user = await UserTable.findOne({ where: { email } });
    if (!user) {
      const message = "User not found. Please register first.";
      if (res) return res.status(404).json({ message });
      throw new Error(message);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins validity

    //fix later
    const otpHashed = await bcrypt.hash(otpCode, SALT_ROUNDS);
    // console.log("otpHashed", otpHashed);
    const otpCreated = await otpTable.create({
      otpCode: otpHashed,
      expiresAt,
      userId: user.id,
    });
    // console.log("otpCreated", otpCreated);

    // await sendOtpEmailEthereal(email, otpCode);
    await sendOtpEmailGmailOAuth(email, otpCode);

    if (res) {
      return res.json({ message: "OTP sent to your email." });
    } else {
      return { success: true, message: "OTP sent to email." };
    }
  } catch (err) {
    console.error("Error in sendOtp:", err);

    if (res) {
      return res.status(500).json({ message: "Internal server error." });
    } else {
      throw err;
    }
  }
}

export async function verifyOtp(req, res) {
  try {
    const { email, otp, purpose } = req.body;
    console.log(req.body);
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const user = await findOneUserInUserTable(email);
    if (!user) return res.status(400).json({ message: "Invalid email." });

    const otpRecord = await otpTable.findOne({
      where: { userId: user.id },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "No OTP found. Please request a new one." });
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      await otpRecord.destroy();
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    // Matching otp
    const isMatch = await bcrypt.compare(otp, otpRecord.otpCode);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // if (otp !== otpRecord.otpCode) {
    //   return res.status(400).json({ message: "Invalid OTP!" });
    // }

    await otpRecord.destroy();

    await user.update({ verified: true });

    // this method will store otp in database <-NOT REQ. CURRENTLY
    // if (purpose === "login") {
    //   const { ip, userAgent } = req;
    //   await logUserLogin(req, user.id);

    //   await IpTable.create({
    //     ip: ip || req.ip,
    //     userAgent: userAgent || req.headers["user-agent"],
    //     userId: user.id,
    //   });

    //   const jwtPayload = {
    //     name: user.dataValues.name,
    //     email: user.dataValues.email,
    //     verified: user.dataValues.verified,
    //   };
    //   const jwtToken = await jwt.sign(
    //     jwtPayload,
    //     process.env.JWT_SECRET,
    //     { expiresIn: 24 * 60 * 60 * 1000 } //24hrs
    //   );

    //   res.cookie("jwt", jwtToken, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     sameSite: "strict",
    //     maxAge: 24 * 60 * 60 * 1000, //24 hour
    //   });
    // }

    return res.status(200).json({ message: "OTP verified successfully", user });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(200).json({ message: "Email and password are required" });
    }

    const user = await findOneUserInUserTable(email);
    if (!user) {
      return res.status(200).json({ message: "User not found" });
    }

    if (!user.verified) {
      await sendOtp({ body: { email } });
      return res.status(200).json({ message: "You are not verified! otp sent to you registered email." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.dataValues.password || user.password);

    console.log("isPasswordValid", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(200).json({ message: "Invalid password" });
    }

    // to get refresh token and access token
    const tokenGen = await generateTokens(user);
    console.log("tokenGen - ", tokenGen);

    res.status(201).json({ message: "Credentials Correct." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function sendLocalOtp(req, res = null) {
  try {
    const { email } = req.body;
    console.log("email", email);
    if (!email) {
      const message = "Email is required.";
      if (res) return res.status(400).json({ message });
      throw new Error(message);
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins validity

    // await sendOtpEmailEthereal(email, otpCode);
    await sendOtpEmailGmailOAuth(email, otpCode);

    return res.status(200).send({ message: "OTP sent to your email.", otpDetails: { otpCode, expiresAt } });
  } catch (err) {
    console.error("Error in sendOtp:", err);

    if (res) {
      return res.status(500).send({ message: "Internal server error." });
    } else {
      throw err;
    }
  }
}

export async function getUserData(req, res) {
  try {
    const { email } = req.body;
    console.log(req.body);
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await findOneUserInUserTableWithSafeColumns(email);
    console.log(user);
    // const userToken = await findOneUserToken(user.dataValues.id);
    // console.log(userToken);
    if (!user) return res.status(400).json({ message: "Invalid email." });

    // const responseLoad = { user: user, token: userToken };
    return res.status(200).json({ message: "User Data retrived Sucessfully", user });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

// export async function getFirstRefreshTokenAfterSignin(req, res) {
//   try {
//     const { id, name, email, verified } = req.body;
//     // console.log("req body", req.body);

//     const payload = { id, name, email, verified };
//     // console.log(payload);

//     const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

//     await RefreshToken.create({
//       token: refreshToken,
//       userId: id,
//       expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //7days
//     });
//     res.cookie("refreshtoken", refreshToken, { maxAge: 604800000, httpOnly: true, secure: true });
//     //sending token in response just for developing / testing purpose
//     return res.status(200).send({ refreshToken });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: "ERROR: Unable to set RefreshToken" });
//   }
// }

export async function getFirstRefreshTokenAfterSignin(req, res) {
  try {
    const { id, name, email, verified } = req.body;
    if (!id || !email) {
      return res.status(400).json({ message: "Missing user data" });
    }

    const payload = { id, name, email, verified };

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    const accessToken = jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "15m" });

    await RefreshToken.create({
      token: refreshToken,
      userId: id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 604800000, // 7 days
      sameSite: "strict",
    });

    return res.status(200).json({ refreshToken, accessToken });
  } catch (error) {
    console.error("Error creating refresh token:", error);
    res.status(500).send({ message: "ERROR: Unable to create tokens" });
  }
}


// export async function refreshToken(req, res) {
//   const { refreshToken } = req.body;
//   if (!refreshToken) return res.status(401).json({ message: "Missing refresh token" });

//   const payload = verifyRefreshToken(refreshToken);
//   if (!payload) return res.status(403).json({ message: "Invalid refresh token" });

//   const newAccessToken = jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET, { expiresIn: "15m" });

//   return res.json({ accessToken: newAccessToken });
// }

export async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Missing refresh token" });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const newAccessToken = jwt.sign(
      { id: payload.id, email: payload.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh token invalid:", err);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
}


export async function logOut(req, res) {
  try {
    //need refreshToken from user <- handle later
    await RefreshToken.update({ revoked: true }, { where: { token: refreshToken } });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
}
