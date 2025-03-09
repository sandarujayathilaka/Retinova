const nodeMailer = require("nodemailer");
const mjml2html = require("mjml");
const fs = require("fs");
const path = require("path");

const DEFAULT_VARS = {
  CompanyName: "Retinova",
  ContactEmail: "support@retinova.com",
  year: new Date().getFullYear(),
};

const sendEmail = async (to, subject, templateName, variables) => {
  // Merge default variables with provided ones
  const finalVars = { ...DEFAULT_VARS, ...variables };

  console.log("Email Variables:", finalVars); // Debugging line

  // Load MJML template file dynamically
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    `${templateName}.mjml`
  );
  let mjmlTemplate = fs.readFileSync(templatePath, "utf-8");

  // Replace placeholders with actual values
  Object.keys(finalVars).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    mjmlTemplate = mjmlTemplate.replace(regex, finalVars[key]);
  });

  // Convert MJML to HTML
  const htmlContent = mjml2html(mjmlTemplate).html;

  const transporter = nodeMailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `Retinova <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log("Message sent: " + info.messageId);
    console.log("Rejected recipients: " + info.rejected);
    console.log("Accepted recipients: " + info.accepted);

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEmail };
