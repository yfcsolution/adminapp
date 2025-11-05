export const imapConfigs = {
  ilm: {
    imap: {
      user: process.env.ILM_SMTP_USER,
      password: process.env.ILM_SMTP_PASS,
      host: process.env.ILM_IMAP_HOST,
      port: parseInt(process.env.ILM_IMAP_PORT),
      tls: true,
      authTimeout: 10000,
      tlsOptions: { rejectUnauthorized: false }
    },
    domain: 'ilmulquran.com'
  },
  yfc: {
    imap: {
      user: process.env.YFC_SMTP_USER,
      password: process.env.YFC_SMTP_PASS,
      host: process.env.YFC_IMAP_HOST,
      port: parseInt(process.env.YFC_IMAP_PORT),
      tls: true,
      authTimeout: 10000,
      tlsOptions: { rejectUnauthorized: false }
    },
    domain: 'yfcampus.com'
  },
  quran: {
    imap: {
      user: process.env.QURAN_SMTP_USER,
      password: process.env.QURAN_SMTP_PASS,
      host: process.env.QURAN_IMAP_HOST,
      port: parseInt(process.env.QURAN_IMAP_PORT),
      tls: true,
      authTimeout: 10000,
      tlsOptions: { rejectUnauthorized: false }
    },
    domain: 'quranonlinetutoring.com'
  }
};
