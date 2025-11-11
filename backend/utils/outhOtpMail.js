import nodemailer from "nodemailer";
import { google } from "googleapis";

const CLIENT_ID = process.env.EMAIL_OAUTH_ID;
const CLIENT_SECRET = process.env.EMAIL_OAUTH_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const REFRESH_TOKEN = process.env.EMAIL_OAUTH_REFRESH_TOKEN;
const SENDER_EMAIL = process.env.EMAIL_OAUTH_SENDER_EMAIL;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendOtpEmailGmailOAuth = async (to, otp) => {
  try {
    const { token: accessToken } = await oAuth2Client.getAccessToken();
    console.log("accessToken", accessToken);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: SENDER_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken,
      },
    });

    const mailOptions = {
      from: `"Demo App" <${SENDER_EMAIL}>`,
      to,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
      html: `<p>Your OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP Email sent: %s", info.messageId);

    return info;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

export default sendOtpEmailGmailOAuth;
