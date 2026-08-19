import React from "react";
import { useNavigate } from "react-router-dom";

const TOKEN_REGEX = /(^|\s)(#[\w\u00C0-\u024F]+|@[\w.\u00C0-\u024F]+)/g;

export default function Linkify({ text, className = "" }) {
  const navigate = useNavigate();

  if (!text) return null;

  const parts = String(text).split(TOKEN_REGEX);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^\s+$/.test(part) || part === text[0] && /^\s/.test(text[0])) {
          return <span key={i}>{part}</span>;
        }
        if (part.startsWith("#") && part.length > 1) {
          return (
            <button
              key={i}
              onClick={() => navigate("/search", { state: { q: part } })}
              className="text-sky-500 hover:text-sky-400 font-medium hover:underline"
            >
              {part}
            </button>
          );
        }
        if (part.startsWith("@") && part.length > 1) {
          return (
            <button
              key={i}
              onClick={() => navigate("/search", { state: { q: part } })}
              className="text-sky-500 hover:text-sky-400 font-medium hover:underline"
            >
              {part}
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}