import "./globals.css";
import { AuthProvider } from "./common/auth-context";
import { ToastProvider } from "@/components/ToastProvider";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider />

          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
