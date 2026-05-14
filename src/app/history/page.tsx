"use client";
import { useState, useEffect } from "react";

type HistoryItem = {
  id: string;
  brand_name: string;
  format_name: string;
  copy: string;
  generated_prompt: string;
  reference_image: string | null;
  created_at: string;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/history", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCopy = (id: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight">History</h1>
          <p className="text-zinc-500 mt-2">All your past generated prompts.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 animate-pulse h-40" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            No generations yet.{" "}
            <a href="/generate" className="text-lime-400 hover:underline cursor-pointer">Go generate something →</a>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-4">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{item.brand_name}</span>
                      <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">{item.format_name}</span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {item.reference_image && (
                      <img
                        src={`data:image/${item.reference_image.startsWith("/9j/") ? "jpeg" : "png"};base64,${item.reference_image}`}
                        alt="ref"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <button
                      onClick={() => handleCopy(item.id, item.generated_prompt)}
                      className="text-sm bg-lime-400 text-black font-bold px-4 py-1.5 rounded-full hover:bg-lime-300 transition-all cursor-pointer shrink-0"
                    >
                      {copied === item.id ? "Copied! ✓" : "Copy All"}
                    </button>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">Message</p>
                  <p className="text-zinc-300 text-sm">{item.copy}</p>
                </div>

                {/* Variations */}
                <div className="space-y-3">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">Generated Prompts</p>
                  {item.generated_prompt.split("\n\n---\n\n").map((v, i) => (
                    <div key={i} className="bg-zinc-800 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-lime-400 text-xs font-bold">Variation {i + 1}</p>
                        <button
                          onClick={() => handleCopy(`${item.id}-${i}`, v)}
                          className="text-xs bg-zinc-700 text-white px-3 py-1 rounded-full hover:bg-zinc-600 transition-all cursor-pointer"
                        >
                          {copied === `${item.id}-${i}` ? "Copied! ✓" : "Copy"}
                        </button>
                      </div>
                      <p className="text-zinc-300 text-xs leading-relaxed">{v}</p>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}