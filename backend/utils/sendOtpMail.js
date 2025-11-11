import nodemailer from 'nodemailer';

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
      from: '"Demo App" <no-reply@example.com>', 
      to, 
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
      html: `<p>Your OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    return nodemailer.getTestMessageUrl(info); 
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

export default sendOtpEmailEthereal;
