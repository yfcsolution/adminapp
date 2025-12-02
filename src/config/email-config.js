import nodemailer from "nodemailer";

// SMTP configurations for each brand
export const emailConfigs = {
  ilm: {
    host: process.env.ILM_SMTP_HOST,
    port: parseInt(process.env.ILM_SMTP_PORT),
    secure: true, // SSL
    auth: {
      user: process.env.ILM_SMTP_USER,
      pass: process.env.ILM_SMTP_PASS,
    },
    from: "ILM Ul Quran <admin@ilmulquran.com>",
    domain: "ilmulquran.com",
  },

  yfc: {
    host: process.env.YFC_SMTP_HOST,
    port: parseInt(process.env.YFC_SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.YFC_SMTP_USER,
      pass: process.env.YFC_SMTP_PASS,
    },
    from: "YFC Campus <admin@yfcampus.com>",
    domain: "yfcampus.com",
  },

  quran: {
    host: process.env.QURAN_SMTP_HOST,
    port: parseInt(process.env.QURAN_SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.QURAN_SMTP_USER,
      pass: process.env.QURAN_SMTP_PASS,
    },
    from: "Quran Online Tutoring <admin@quranonlinetutoring.com>",
    domain: "quranonlinetutoring.com",
  },
};

// Create transporters using correct Nodemailer API
export const transporters = {
  ilm: nodemailer.createTransport(emailConfigs.ilm),
  yfc: nodemailer.createTransport(emailConfigs.yfc),
  quran: nodemailer.createTransport(emailConfigs.quran),
};

// Verify SMTP connections at startup
export const verifyTransporters = async () => {
  for (const [key, transporter] of Object.entries(transporters)) {
    try {
      await transporter.verify();
      console.log(`✅ ${key.toUpperCase()} SMTP connection verified`);
    } catch (error) {
      console.error(
        `❌ ${key.toUpperCase()} SMTP connection failed:`,
        error.message
      );
    }
  }
};
