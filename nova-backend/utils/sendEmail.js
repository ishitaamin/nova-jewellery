import nodemailer from "nodemailer";

// Notice how we now accept an object with 'to', 'subject', and 'html'
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Using host instead of service is more reliable
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"NOVA Jewellery" <${process.env.EMAIL_USER}>`,
      to,          // The recipient's email
      subject,     // The subject line we pass in
      html,        // The custom HTML body we pass in
    });

    console.log(`✅ Email successfully sent to: ${to}`);
  } catch (error) {
    console.error("❌ Nodemailer Error:", error.message);
    throw new Error("Email sending failed");
  }
};

export default sendEmail;