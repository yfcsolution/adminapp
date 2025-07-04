"use client"; // Mark this component as a client component
import "./globals.css";
import { AuthProvider } from "./common/auth-context";
import { ToastProvider } from "@/components/ToastProvider";
import { useEffect } from "react"; // Import useEffect
import axios from "axios"; // Import axios
export default function RootLayout({ children }) {
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Make the GET request to the cron URL using axios without logging
      axios.get("https://waserver.pro/cron/execute-webhook").catch((error) => {
        // Handle error silently if necessary
        console.error("Error in cron job request:", error);
      });
    }, 120000);
    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    // Function to fetch data every 15 minutes
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "/api/messages/whatsapp/webhooks/sync"
        );
        // You can handle the response here if needed
        console.log("Data synced successfully:", response.data);
      } catch (error) {
        console.error("Error syncing data:", error);
      }
    };

    // Fetch data immediately on mount
    fetchData();
    // Set interval to call fetchData every 15 minutes (900,000ms)
    const intervalId = setInterval(fetchData, 900000);
    // Cleanup on component unmount
    return () => clearInterval(intervalId);
  }, []);

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
