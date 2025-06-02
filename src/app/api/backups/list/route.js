import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("Im running the list backups API");

  try {
    const serviceAccountCredentials = {
      type: "service_account",
      project_id: "mongodb-backup-system",
      private_key_id: "d30d685f6dab876b7da00b55763f1066ce13fb7c",
      private_key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC0B23eD04MEE1x
hWf0p6eF8L67xijIoxuEgG/dywTlnr0ZSzB6jyH4zc+JGf7a6NfLh2rfs3WirBdb
Ew5b/UgKZoXPaD5exkYATji7geoJxTGEpnSJJfzFn/cek/EiiIDOXXtfIyUD1tNc
VK0h5uKAX8bFVrRKAMEilra+SCHvQXYmGGBfkh5x+Uj+yV7V+Fb60BfoqwVJHgp/
pxy9NRtyTqksNZuOkmLFdkAUEU64D/mtr9OU1eNhIcEecrLFRGRQG1rxunLO2npB
bA7O0ANBsp4SrQZ7engneZErZqSzsvy93nWwM07zm5MLygO3vccIIdIkA0pNAaTv
buD5vmCHAgMBAAECggEAKe4RCMdHxkeFwgrwS2tA+VE5G0Lr/M8AebvwUhgW6+Qs
5tc8U09C+k/1JlmHojTZDe5cVf3WSC0Mw4mMrqAvRzzZrZT58dj8NNYDIKkBeYUU
I3Ehc1AFr4GybMzIPOLOHUJomZ/13w8J61dNe7fqyTuFcDDhjNrgIM45gdgLD04r
1eGiAxY/hNPfpccZyveCJi2OHYOpc/boMeBd38Lb900LgJUx0x0zP+oNc1+KPTXW
Yjgmq7lilH6o0dioc+fglQY5XOb9X6EjGjx6FO9iMPkPyFzDlqKmhQXjV7kjQcxk
sF9Yt+cRozGuaZdS3wf1IRxBm0R022QDS0klB48cAQKBgQDWuM/4Vs0NhV5IfZnb
LfAxKR62iawDusIlOtUUKCA6UBaOgFNyMvxfDWD9ivYgcGSKJ+Wbni4RY5U1jrxv
CXeIIoHv2h8mVpKQIPL/G624zVzY6E5heXz+qUkD6mRB3svPkNUIQxKsHiPo4aXm
9KImNTz6UyLLPa45ALlL4V1ulwKBgQDWo0Ms62G8Nc5y7PJWzut7uloYu4uAWtS2
92TSX+/rbb2xQIjDP20emhLjlcTQagQyeTPMBjfzCEMQYhGY2zDghgnhpdKsbQkT
h4YjQ+GAHgIIw6blnyKNwiQRUbSmigp9MlYFdKUJtKyAYdxBay2JmBp3WrQ3rtd4
BQqkYQfLkQKBgHVVIC/wHrTYwCCUodJnU+1JLwNIT7rp/tUhRPZyxsmWofzUmsS4
n7fBM9LYcI5hXE8yZgGXekz+Qba2fLmgTrURRjeu1X65p/UiTCajFVb6wVW1+77A
CFGQZ9m/53EnMfAGkKKnJDjxb2X+iA2geEqwpNWVQFoXJnD3uEmCqO+ZAoGBAJoB
q0Gf4xDYyrlLqtb+wZiVre/xIbeHdPmTqZQJomya4XE9jOQLrpA2nTcPT5j7eOd+
b9wE2kBXvUcUFuxG2ls/0fdGtFNkKQ8KPwUuv67d2TfQqwA3nuN4WcjTh3u3sK8E
XxSrDYBZUy0LCq8l6BbCPLtHKeiKW7CSbYBk3uMBAoGBAIFs5i9eGMvZqi5Iy4Ja
XDM0rOe7VEUxci8bn75UxMSZfJdUV5uUvTqR13emvbCwk1Xi1dz5Dg11MZijle+R
4s059KL+8QTkDF3SBwHVwU2QSwtheLVYvj97JR4ZTdIIfc14tccixOy0bXUjYJ+N
zST+ksFn10asob8IQPiS6x1r
-----END PRIVATE KEY-----`,
      client_email:
        "mongo-backup-uploader@mongodb-backup-system.iam.gserviceaccount.com",
      client_id: "113749446626218850405",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/mongo-backup-uploader%40mongodb-backup-system.iam.gserviceaccount.com",
      universe_domain: "googleapis.com",
    };

    const driveFolderId = "YOUR_FOLDER_ID_HERE"; // Replace with actual folder ID string

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountCredentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.list({
      q: `'${driveFolderId}' in parents`,
      fields: "files(id, name, createdTime, description, webViewLink)",
      orderBy: "createdTime desc",
    });

    return NextResponse.json({
      success: true,
      backups: response.data.files,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
