// components/ServerSelector.jsx
"use client";
import { useState, useEffect } from "react";

export default function ServerSelector() {
  const [selected, setSelected] = useState("baileys");

  useEffect(() => {
    fetch("/api/server-config")
      .then(res => res.json())
      .then(data => setSelected(data.selectedServer));
  }, []);

  const updateSelection = async (newServer) => {
    setSelected(newServer);
    await fetch("/api/server-config", {
      method: "POST",
      body: JSON.stringify({ selectedServer: newServer }),
    });
  };

  return (
    <div className="space-x-4">
      <button onClick={() => updateSelection("baileys")} className={selected === "baileys" ? "font-bold" : ""}>
        Baileys
      </button>
      <button onClick={() => updateSelection("other")} className={selected === "other" ? "font-bold" : ""}>
        Other
      </button>
    </div>
  );
}
