const nodemailer = require("nodemailer");

const createTransport = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return null;
};

const sendEmail = async ({ to, subject, html }) => {
  const transport = createTransport();
  if (!transport) {
    console.warn(`Email skipped (SMTP not configured). To: ${to}, Subject: ${subject}`);
    return { sent: false, reason: "SMTP not configured" };
  }

  await transport.sendMail({
    from: process.env.EMAIL_FROM || "no-reply@worktrack.com",
    to,
    subject,
    html,
  });

  return { sent: true };
};

module.exports = { sendEmail };
