import { OtpGen } from "../utils/otpGenerator.js";
import { STATUS_CODES } from "../utils/statusCodes.js";
import { IpTable, otpTable, permissionModel, roleModel, UserTable } from "../models/index.js";
import sendOtpEmailEthereal from "../utils/sendOtpMail.js";
import bcrypt, { compare } from "bcrypt";
import {
  countAllUser,
  countUserMonthly,
  findOneUserInUserTable,
  findOneUserInUserTableWithSafeColumns,
  findOneUserToken,
  findOneUserWithRolesPermissionsbyId,
  getUserRolesAndPermissions,
  listAllUserList,
} from "../services/user.services.js";
import { logUserLogin } from "../utils/getIp.js";
import jwt from "jsonwebtoken";
import sendOtpEmailGmailOAuth from "../utils/outhOtpMail.js";
import { generateTokens, verifyRefreshToken } from "../utils/tokenGen.js";
import { RefreshToken } from "../models/refreshTokenModel.js";
import sendResetLinkEmail from "../utils/oauthResetMail.js";
import { configDotenv } from "dotenv";
import { decrypt, decryptDeterministic, encrypt, encryptDeterministic } from "../utils/cryptoUtils.js";
import { Op } from "sequelize";
import { getMonthlyChange } from "../utils/getMonthlyChange.js";
configDotenv();

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
    // admin | manager | user
    const { name, email, password, role = "user" } = req.body; // this is just for role dev purpose, can be extendeble to create new users with roles

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
    const encryptedName = await encryptDeterministic(name);
    const encryptedEmail = await encryptDeterministic(email);
    console.log("Encrpyted data- ", { encryptedEmail, encryptedName });
    const newUser = await UserTable.create({ name: encryptedName, email: encryptedEmail, password: hashedPassword });
    console.log("😀", Object.keys(newUser.__proto__));

    //get the admin role from db
    const userRole = await roleModel.findOne({ where: { name: role } });
    console.log("😀😀", Object.keys(userRole.__proto__));

    //add role to the user from role
    await newUser.addRole(userRole);
    //find all permissions available
    const allPerms = await permissionModel.findAll();
    console.log("😀😀😀", Object.keys(allPerms.__proto__));

    //add permission to the role
    await userRole.addPermission(allPerms);

    // const otpCode = Math.floor(100000 + Math.random() * 900000);
    const otpCode = await OtpGen();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // await sendOtpEmailEthereal(email, otpCode);
    // await sendOtpEmailGmailOAuth(email, otpCode);

    console.log("encryptedEmail - 1-", encryptedEmail);
    console.log("dencryptedEmail - 1-", await decryptDeterministic(encryptedEmail));
    await sendOtp(encryptedEmail);
    res.status(201).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP." });
  }
}

export async function sendOtp(encryptedEmail, res = null) {
  try {
    const email = await decryptDeterministic(encryptedEmail);

    if (!email) {
      const message = "Email is required.";
      if (res) return res.status(400).json({ message });
      throw new Error(message);
    }

    const user = await UserTable.findOne({ where: { email: encryptedEmail } });
    console.log("user -", user);

    if (!user) {
      const message = "User not found. Please register first.";
      if (res) return res.status(404).json({ message });
      throw new Error(message);
    }

    // const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpCode = await OtpGen();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins validity
    //otp just for development purposes
    console.log("OTP CODE-> ", otpCode);

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

    const encryptedEmail = await encryptDeterministic(email);
    const user = await findOneUserInUserTable(encryptedEmail);
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
    console.log({ email, password });
    if (!email || !password) {
      return res.status(200).json({ message: "Email and password are required" });
    }

    const encryptEmail = await encryptDeterministic(email);
    const user = await findOneUserInUserTable(encryptEmail);
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
    // const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpCode = await OtpGen();
    console.log("OTP-", otpCode); //for dev purpose only
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

export async function logUserIpAfterLogin(req, res) {
  try {
    const { ip, userAgent } = req;
    const { id } = req.body;

    await logUserLogin(req, id);

    // const encryptIp = await encryptDeterministic(ip);
    // const encryptUserAgent = await encryptDeterministic(userAgent);

    const ipValue = ip || req.ip || "";
    const userAgentValue = userAgent || req.headers["user-agent"] || "";

    const response = await IpTable.create({
      ip: encryptDeterministic(ipValue),
      userAgent: encryptDeterministic(userAgentValue),
      userId: id,
    });

    res.status(200).send({ message: "Logged Successfully", response: response });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Error Occured" });
  }
}

export async function getUserData(req, res) {
  try {
    const { email } = req.body;
    console.log("req.body getUserData-> ", req.body);
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const encryptEmail = await encryptDeterministic(email);
    const userRes = await findOneUserInUserTableWithSafeColumns(encryptEmail);
    // console.log(userRes);
    // const userToken = await findOneUserToken(user.dataValues.id);
    // console.log(userToken);
    // if (!userRes) return res.status(400).json({ message: "Invalid email." });

    // const responseLoad = { user: user, token: userToken };
    // const decryptedName = await decryptDeterministic(userRes.dataValues.name);
    // const decryptedEmail = await decryptDeterministic(userRes.dataValues.email);

    const userId = userRes.dataValues.id;
    const { user, roles, permissions } = await getUserRolesAndPermissions(userId);
    console.log("userRolePermission ->", user, roles, permissions);

    // const user = {
    //   name: decryptedName,
    //   email: decryptedEmail,
    //   id: userRes.dataValues.id,
    //   verified: userRes.dataValues.verified,
    //   // role: userRes.dataValues.
    // };

    return res.status(200).json({ message: "User Data retrived Sucessfully", user, roles, permissions });
    //Response of the above code:-
    //     {
    //     "message": "User Data retrived Sucessfully",
    //     "user": {
    //         "id": 65,
    //         "name": "kededor",
    //         "email": "kededor599@agenra.com",
    //         "verified": true
    //     },
    //     "roles": [
    //         "admin"
    //     ],
    //     "permissions": [
    //         "view",
    //         "edit\r\n",
    //         "delete",
    //         "create",
    //         "assign_to"
    //     ]
    // }
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

    const existingToken = await RefreshToken.findOne({
      where: {
        userId: id,
        expiresAt: { [Op.gt]: new Date() },
      },
      order: [["createdAt", "DESC"]],
    });

    let refreshToken;
    if (existingToken) {
      refreshToken = existingToken.token;
    } else {
      const payload = { id, name, email, verified };
      refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

      await RefreshToken.create({
        token: refreshToken,
        userId: id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    const accessToken = jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "15m" });

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

export async function refreshAccessToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Missing refresh token" });
  console.log("resfresh Token ->", refreshToken);

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const newAccessToken = jwt.sign({ id: payload.id, email: payload.email }, process.env.JWT_SECRET, { expiresIn: "15m" });

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh token invalid:", err);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
}

export async function logOut(req, res) {
  try {
    const { refreshToken } = req.body;
    console.log(req.body);
    //need refreshToken from user <- handle later
    const response = await RefreshToken.update({ revoked: true }, { where: { token: refreshToken } });
    console.log(response);
    if (response) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
    }

    res.status(200).send({ message: "refresh token updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  const encryptedEmail = await encryptDeterministic(email);
  const user = await findOneUserInUserTable(encryptedEmail);
  if (!user) return res.status(404).json({ message: "No account with that email." });

  const token = jwt.sign({ id: user.dataValues.id, email }, process.env.RESET_TOKEN_SECRET, { expiresIn: "15m" });

  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendResetLinkEmail(email, link);

  return res.status(200).json({ message: "Password reset link sent to your email." });
}

export async function verifyResetToken(req, res) {
  const { token } = req.query;
  try {
    const payload = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
    return res.status(200).json({ valid: true, email: payload.email });
  } catch {
    return res.status(400).json({ valid: false });
  }
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;
  try {
    const payload = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
    const encryptedEmail = await encryptDeterministic(payload.email);
    const user = await findOneUserInUserTable(encryptedEmail);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(password, 10);
    await user.update({ password: hashed });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
}

export async function getTotalUserCount(req, res) {
  try {
    const { verified } = req?.body;
    const userCount = await countAllUser(verified);
    console.log("userCount ->", userCount);
    res.status(200).send({ message: "Current User Count Data Retrived", userCount });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
}

export async function adminDashboard(req, res) {
  try {
    res.status(200).send({ message: "Admin Dashboard Data recieved." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
}

export async function getTotalUserCountPerMonth(req, res) {
  try {
    const { verified } = req?.body;
    const queryRes = await countUserMonthly(verified);
    // console.log(queryRes)
    const monthlyChange = await getMonthlyChange(queryRes);

    res.status(200).send({ message: "User Count PerMonth Found!", userMonth: queryRes, userCount: monthlyChange });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
}
