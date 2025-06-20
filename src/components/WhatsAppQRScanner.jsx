"use client";

import { useEffect, useState } from "react";

export default function WhatsAppQRScanner({ country }) {
  const [qrSvg, setQrSvg] = useState("");
  const [status, setStatus] = useState("CONNECTING");
  const [number, setNumber] = useState("");

  useEffect(() => {
    if (!country) return;

    const fetchQR = async () => {
      try {
        const response = await fetch(`/api/whatsapp/init?country=${country}`);
        const data = await response.json();

        if (data.qr) {
          setQrSvg(data.qr);
          setStatus("QR_READY");
        } else if (data.status === "CONNECTED") {
          setStatus("CONNECTED");
        }

        if (data.number) setNumber(data.number);

        // If not connected and no QR yet, keep polling
        if (data.status !== "CONNECTED" && !data.qr) {
          setTimeout(fetchQR, 3000);
        }
      } catch (error) {
        console.error("Failed to fetch QR:", error);
        setTimeout(fetchQR, 5000);
      }
    };

    fetchQR();
  }, [country]);

  if (status === "CONNECTED") {
    return (
      <div className="bg-green-100 text-green-800 p-4 rounded-lg">
        <p className="font-bold">✅ WhatsApp Connected</p>
        <p>Number: {number}</p>
      </div>
    );
  }

  if (status === "QR_READY" && qrSvg) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-center">
            Scan QR Code for {number}
          </h2>

          {/* Render SVG directly */}
          <div
            className="mx-auto"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />

          <p className="text-center mt-4 text-sm text-gray-600">
            Open WhatsApp → Settings → Linked Devices → Link a Device
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4">Initializing WhatsApp connection for {country}...</p>
    </div>
  );
}
