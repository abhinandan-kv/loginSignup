import nodemailer from "nodemailer";

const sendOtpEmailEthereal = async (to, otp) => {
  try {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const mailOptions = {
      from: `"ExpressWay" <${SENDER_EMAIL}>`,
      to,
      subject: "Your One-Time Password (OTP) for ExpressWay App",
      text: `Hello,\n\nYour One-Time Password (OTP) is: ${otp}. It is valid for 5 minutes. Please use it to complete your action.\n\nIf you did not request this, please ignore this email.`,
      html: `
    <html>
      <body>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) is: <b>${otp}</b>. It is valid for 5 minutes.</p>
        <p>Please use this OTP to complete your action.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>ExpressWay App Team</p>
      </body>
    </html>
  `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    return nodemailer.getTestMessageUrl(info);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

export default sendOtpEmailEthereal;
