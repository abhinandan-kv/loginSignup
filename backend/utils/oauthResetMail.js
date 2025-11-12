import nodemailer from "nodemailer";
import { google } from "googleapis";

const CLIENT_ID = process.env.EMAIL_OAUTH_ID;
const CLIENT_SECRET = process.env.EMAIL_OAUTH_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const REFRESH_TOKEN = process.env.EMAIL_OAUTH_REFRESH_TOKEN;
const SENDER_EMAIL = process.env.EMAIL_OAUTH_SENDER_EMAIL;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendResetLinkEmail = async (to, link) => {
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
      from: `"ExpressWay" <${SENDER_EMAIL}>`,
      to,
      subject: "Password Reset Request for ExpressWay",
      text: `Hello,\n\nWe received a request to reset your password. Please click on the link below to set your new password. The link will be valid for 15 minutes.\n\n${link}\n\nIf you did not request this, please ignore this email.`,
      html: `
    <html>
      <body>
        <p>Hello,</p>
        <p>We received a request to reset your password. Please click the link below to set your new password. This link will be valid for 15 minutes:</p>
        <p><a href="${link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Your Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>ExpressWay Team</p>
      </body>
    </html>
  `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP Email sent: %s", info.messageId);

    return info;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

export default sendResetLinkEmail;
