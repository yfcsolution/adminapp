// components/ServerSelector.jsx
"use client";
import { useState, useEffect } from "react";

export default function ServerSelector() {
  const [selected, setSelected] = useState("baileys");

  useEffect(() => {
    fetch("/api/server-config")
      .then(res => res.json())
      .then(data => {
        // Handle backward compatibility: "other" → "waserver"
        const server = data.selectedServer === "other" ? "waserver" : (data.selectedServer || "baileys");
        setSelected(server);
      });
  }, []);

  const updateSelection = async (newServer) => {
    setSelected(newServer);
    await fetch("/api/server-config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedServer: newServer }),
    });
  };

  const servers = [
    { id: "baileys", name: "Baileys" },
    { id: "waserver", name: "Waserver.pro" },
    { id: "wacrm", name: "WACRM" },
  ];

  return (
    <div className="space-x-4">
      {servers.map((server) => (
        <button
          key={server.id}
          onClick={() => updateSelection(server.id)}
          className={selected === server.id ? "font-bold" : ""}
        >
          {server.name}
        </button>
      ))}
    </div>
  );
}
