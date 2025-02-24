import "./globals.css";
import { AuthProvider } from "./common/auth-context";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
      <AuthProvider>
        {children}
      </AuthProvider>


      </body>
    </html>
  );
}
