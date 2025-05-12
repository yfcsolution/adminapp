import Imap from "imap";
import { decode } from "quoted-printable";
import dotenv from "dotenv";

dotenv.config();

export function startEmailListener(onNewEmail) {
  const imap = new Imap({
    user: process.env.EMAIL_USER || "test@ilmulquran.com",
    password: process.env.EMAIL_PASSWORD || "2025@Ijaz",
    host: process.env.EMAIL_IMAP_HOST || "mail.ilmulquran.com",
    port: 993,
    tls: true,
    tlsOptions: {
      rejectUnauthorized: false,
    },
  });

  const cleanEmailBody = (rawBody) => {
    if (!rawBody) return "No message content";
    try {
      let text = rawBody.replace(/--[a-zA-Z0-9]+--\r\n/g, "");
      text = text.replace(/Content-.*?\r\n\r\n/gs, "");
      text = decode(text);
      text = text.replace(/<[^>]+>/g, "");
      text = text.replace(/\r\n/g, "\n");
      text = text.replace(/On\s.+\s?wrote:.*$/gms, "");
      text = text.replace(/^>.*$/gm, "");
      text = text.replace(/\n-+\n.*$/s, "");
      text = text.replace(/=([A-Fa-f0-9]{2})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      );
      return text.trim() || "No readable message content";
    } catch (error) {
      console.error("[EMAIL LISTENER] Error cleaning email body:", error);
      return rawBody;
    }
  };

  imap.once("ready", () => {
    console.log("[EMAIL LISTENER] IMAP connection established");

    function openInbox(cb) {
      imap.openBox("INBOX", false, cb);
    }

    openInbox((err, box) => {
      if (err) throw err;
      console.log(`[EMAIL LISTENER] INBOX opened with ${box.messages.total} messages`);

      // Listen for new emails
      imap.on("mail", (numNewMsgs) => {
        console.log(`[EMAIL LISTENER] New email detected: ${numNewMsgs} new messages`);

        const fetch = imap.seq.fetch(`${box.messages.total}:${box.messages.total}`, {
          bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
          struct: true,
        });

        fetch.on("message", (msg) => {
          let email = {
            headers: {},
            body: "",
            date: null,
            from: null,
            to: null,
            subject: null,
          };

          msg.on("body", (stream, info) => {
            let buffer = "";
            stream.on("data", (chunk) => (buffer += chunk.toString("utf8")));
            stream.once("end", () => {
              if (info.which === "TEXT") {
                email.body = cleanEmailBody(buffer);
              } else {
                const headers = Imap.parseHeader(buffer);
                email.from = headers.from ? headers.from[0] : null;
                email.to = headers.to ? headers.to[0] : null;
                email.subject = headers.subject ? headers.subject[0] : null;
                email.date = headers.date ? headers.date[0] : null;
              }
            });
          });

          msg.once("end", () => {
            console.log("[EMAIL LISTENER] New email received:", email.subject);
            onNewEmail(email); // Pass the email to your callback
          });
        });

        fetch.once("error", (err) => {
          console.error("[EMAIL LISTENER] Error fetching new email:", err);
        });
      });

      console.log("[EMAIL LISTENER] Now listening for new emails...");
    });
  });

  imap.once("error", (err) => {
    console.error("[EMAIL LISTENER] IMAP Connection Error:", err);
  });

  imap.once("end", () => {
    console.log("[EMAIL LISTENER] IMAP connection ended");
  });

  imap.connect();
}
