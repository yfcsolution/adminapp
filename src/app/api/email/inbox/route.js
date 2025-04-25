import Imap from "imap";
import { NextResponse } from "next/server";
import { decode } from "quoted-printable";
export const GET = async () => {
  console.log("[EMAIL API] Starting GET request for emails");
  // Validate environment variables
  if (
    !process.env.EMAIL_IMAP_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASSWORD
  ) {
    console.error("[EMAIL API] Missing required environment variables");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  console.log(
    `[EMAIL API] Connecting to ${process.env.EMAIL_IMAP_HOST} as ${process.env.EMAIL_USER}`
  );

  const imap = new Imap({
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    host: process.env.EMAIL_IMAP_HOST,
    port: 993,
    tls: true,
    connTimeout: 10000,
    authTimeout: 5000,
    tlsOptions: {
      rejectUnauthorized: false,
      servername: process.env.EMAIL_IMAP_HOST,
    },
  });

  return new Promise((resolve) => {
    let allEmails = [];

    imap.once("ready", () => {
      console.log("[EMAIL API] IMAP connection established successfully");

      // List all mailboxes
      imap.getBoxes((err, boxes) => {
        if (err) {
          console.error("[EMAIL API] Error listing mailboxes:", err);
          imap.end();
          return resolve(
            NextResponse.json(
              { error: "Failed to list mailboxes" },
              { status: 500 }
            )
          );
        }

        // Important folders to check (common names across providers)
        const targetFolders = [
          "INBOX",
          "Sent",
          "Sent Items",
          "Sent Messages",
          "Drafts",
          "Trash",
          "Deleted Items",
          "Junk",
          "Spam",
          "Archive",
          "All Mail",
        ];

        // Filter to only existing folders
        const foldersToFetch = [];
        const findFolders = (boxList, path = "") => {
          for (const [name, box] of Object.entries(boxList)) {
            const fullPath = path ? `${path}${name}` : name;
            if (box.attribs.includes("\\NoSelect")) {
              continue; // Skip non-selectable folders
            }
            if (targetFolders.some((folder) => fullPath.endsWith(folder))) {
              foldersToFetch.push(fullPath);
            }
            if (box.children) {
              findFolders(box.children, `${fullPath}.`);
            }
          }
        };
        findFolders(boxes);

        if (foldersToFetch.length === 0) {
          console.error("[EMAIL API] No target folders found");
          imap.end();
          return resolve(
            NextResponse.json({ error: "No mailboxes found" }, { status: 404 })
          );
        }

        console.log(`[EMAIL API] Found folders to fetch:`, foldersToFetch);

        let processedFolders = 0;
        const processNextFolder = () => {
          if (processedFolders >= foldersToFetch.length) {
            console.log(
              `[EMAIL API] Finished processing all folders. Total emails: ${allEmails.length}`
            );
            imap.end();
            return resolve(NextResponse.json(allEmails, { status: 200 }));
          }

          const folder = foldersToFetch[processedFolders++];
          console.log(`[EMAIL API] Processing folder: ${folder}`);

          imap.openBox(folder, false, (err, box) => {
            if (err) {
              console.error(`[EMAIL API] Error opening folder ${folder}:`, err);
              return processNextFolder(); // Skip this folder but continue with others
            }

            console.log(
              `[EMAIL API] Successfully opened ${folder} with ${box.messages.total} messages`
            );

            if (box.messages.total === 0) {
              return processNextFolder();
            }

            const fetchRange = `1:${box.messages.total}`;
            console.log(
              `[EMAIL API] Fetching messages ${fetchRange} from ${folder}`
            );

            const fetch = imap.seq.fetch(fetchRange, {
              bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE CC BCC)", "1"],
              struct: true,
            });

            let folderEmails = [];

            fetch.on("message", (msg) => {
              let email = {
                headers: {},
                body: "",
                cleanText: "",
                uid: null,
                date: null,
                folder: folder,
              };

              msg.on("attributes", (attrs) => {
                if (attrs.uid) email.uid = attrs.uid;
                if (attrs.date) email.date = attrs.date;
                if (attrs.flags) email.flags = attrs.flags;
              });

              msg.on("body", (stream, info) => {
                let buffer = "";
                stream.on("data", (chunk) => {
                  buffer += chunk.toString("utf8");
                });
                stream.once("end", () => {
                  if (
                    info.which === "HEADER.FIELDS (FROM TO SUBJECT DATE CC BCC)"
                  ) {
                    email.headers = Imap.parseHeader(buffer);
                  } else {
                    email.body = buffer;
                    email.cleanText = cleanEmailBody(buffer);
                  }
                });
              });

              msg.once("end", () => {
                folderEmails.push(email);
              });
            });

            fetch.once("end", () => {
              console.log(
                `[EMAIL API] Fetched ${folderEmails.length} emails from ${folder}`
              );
              allEmails = [...allEmails, ...folderEmails];
              processNextFolder();
            });

            fetch.once("error", (err) => {
              console.error(`[EMAIL API] Error fetching from ${folder}:`, err);
              processNextFolder();
            });
          });
        };

        processNextFolder();
      });
    });

    imap.once("error", (err) => {
      console.error("[EMAIL API] IMAP Connection Error:", err);
      imap.end();
      resolve(
        NextResponse.json(
          { error: "Email server connection failed", details: err.message },
          { status: 502 }
        )
      );
    });

    imap.once("end", () => {
      console.log("[EMAIL API] IMAP connection ended");
    });

    console.log("[EMAIL API] Attempting IMAP connection...");
    imap.connect();
  });
};

// Enhanced email cleaning function
function cleanEmailBody(rawBody) {
  if (!rawBody) return "No message content";

  try {
    // 1. Remove MIME boundaries and technical headers
    let text = rawBody.replace(/--[a-zA-Z0-9]+--\r\n/g, "");
    text = text.replace(/Content-.*?\r\n\r\n/gs, "");

    // 2. Decode quoted-printable
    text = decode(text);

    // 3. Remove HTML tags but preserve line breaks
    text = text.replace(/<[^>]+>/g, "");
    text = text.replace(/\r\n/g, "\n");

    // 4. Remove quoted text and signatures
    text = text.replace(/On\s.+\s?wrote:.*$/gms, "");
    text = text.replace(/^>.*$/gm, "");
    text = text.replace(/\n-+\n.*$/s, "");

    // 5. Remove any remaining special characters
    text = text.replace(/=([A-Fa-f0-9]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );

    return text.trim() || "No readable message content";
  } catch (error) {
    console.error("Error cleaning email body:", error);
    return rawBody;
  }
}

// Unsupported methods
export const POST = async () => {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
};

export const PUT = async () => {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
};
