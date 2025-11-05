// src/config/smtp-config.js

export const smtpConfigurations = {
  // ILM Ul Quran SMTP
  'ilmulquran.com': {
    host: 'mail.ilmulquran.com',
    port: 465,
    secure: true, // SSL
    auth: {
      user: 'admin@ilmulquran.com',
      pass: process.env.ILMULQURAN_SMTP_PASSWORD,
    },
    from: '"ILM Ul Quran" <admin@ilmulquran.com>',
    imap: {
      host: 'mail.ilmulquran.com',
      port: 993,
      secure: true,
      auth: {
        user: 'admin@ilmulquran.com',
        pass: process.env.ILMULQURAN_SMTP_PASSWORD,
      }
    }
  },

  // YF Campus SMTP
  'yfcampus.com': {
    host: 'mail.yfcampus.com',
    port: 465,
    secure: true,
    auth: {
      user: 'admin@yfcampus.com',
      pass: process.env.YFCAMPUS_SMTP_PASSWORD,
    },
    from: '"YF Campus" <admin@yfcampus.com>',
    imap: {
      host: 'mail.yfcampus.com',
      port: 993,
      secure: true,
      auth: {
        user: 'admin@yfcampus.com',
        pass: process.env.YFCAMPUS_SMTP_PASSWORD,
      }
    }
  },

  // Quran Online Tutoring SMTP
  'quranonlinetutoring.com': {
    host: 'mail.quranonlinetutoring.com',
    port: 465,
    secure: true,
    auth: {
      user: 'admin@quranonlinetutoring.com',
      pass: process.env.QURANONLINE_SMTP_PASSWORD,
    },
    from: '"Quran Online Tutoring" <admin@quranonlinetutoring.com>',
    imap: {
      host: 'mail.quranonlinetutoring.com',
      port: 993,
      secure: true,
      auth: {
        user: 'admin@quranonlinetutoring.com',
        pass: process.env.QURANONLINE_SMTP_PASSWORD,
      }
    }
  }
};

// Helper function to get SMTP config by domain
export function getSmtpConfig(domain) {
  const config = smtpConfigurations[domain];
  if (!config) {
    throw new Error(`No SMTP configuration found for domain: ${domain}`);
  }
  return config;
}
