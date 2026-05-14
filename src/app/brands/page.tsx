"use client";
import { useState, useEffect, useRef } from "react";

type Brand = {
  id: string;
  name: string;
  description: string;
  colors: string;
  fonts: string;
  tone: string;
  guidelines: string;
  reference_image: string;
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    colors: "",
    fonts: "",
    tone: "",
    guidelines: "",
  });

  useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => { setBrands(data); setBrandsLoading(false); });
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImage(base64.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name) return;
    setLoading(true);
    await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, reference_image: image }),
    });
    const updated = await fetch("/api/brands").then((r) => r.json());
    setBrands(updated);
    setForm({ name: "", description: "", colors: "", fonts: "", tone: "", guidelines: "" });
    setImage(null);
    setImagePreview(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/brands/${id}`, { method: "DELETE" });
    setBrands(brands.filter((b) => b.id !== id));
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-12">

        <div>
          <a href="/generate" className="text-sm text-zinc-500 hover:text-white transition-all flex items-center gap-1 mb-6">
            ← Back to Generate
          </a>
          <h1 className="text-4xl font-black tracking-tight">Brand Memory</h1>
          <p className="text-zinc-500 mt-2">Save your brand details once. Use them every time you generate.</p>
        </div>

        {/* Add brand form */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold">Add New Brand</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 uppercase tracking-widest">Brand Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Standard Lab"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 uppercase tracking-widest">Brand Tone</label>
              <input
                type="text"
                value={form.tone}
                onChange={(e) => setForm({ ...form, tone: e.target.value })}
                placeholder="e.g. Premium, Clean, Scientific"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 uppercase tracking-widest">Brand Colors</label>
              <input
                type="text"
                value={form.colors}
                onChange={(e) => setForm({ ...form, colors: e.target.value })}
                placeholder="e.g. #0047AB, #00C896, White"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 uppercase tracking-widest">Fonts</label>
              <input
                type="text"
                value={form.fonts}
                onChange={(e) => setForm({ ...form, fonts: e.target.value })}
                placeholder="e.g. Inter, Helvetica Neue"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-400 uppercase tracking-widest">Brand Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. A premium supplement brand focused on science-backed daily health support"
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-400 uppercase tracking-widest">Brand Guidelines</label>
            <textarea
              value={form.guidelines}
              onChange={(e) => setForm({ ...form, guidelines: e.target.value })}
              placeholder="e.g. Always use clean white backgrounds, avoid busy layouts, keep typography minimal..."
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 resize-none"
            />
          </div>

          {/* Reference image */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 uppercase tracking-widest">Reference Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-zinc-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-lime-400 transition-all"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="max-h-40 rounded-lg object-contain" />
              ) : (
                <>
                  <p className="text-zinc-500 text-sm">Click to upload brand reference image</p>
                  <p className="text-zinc-600 text-xs mt-1">PNG, JPG up to 10MB</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {imagePreview && (
              <button onClick={() => { setImage(null); setImagePreview(null); }} className="text-xs text-zinc-500 hover:text-red-400 transition-all">
                Remove image
              </button>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={loading || !form.name}
            className="w-full bg-lime-400 text-black font-black py-4 rounded-full hover:bg-lime-300 transition-all disabled:opacity-40"
          >
            {loading ? "Saving..." : saved ? "Saved! ✓" : "Save Brand →"}
          </button>
        </div>

        {/* Saved brands */}
        {brandsLoading ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Saved Brands</h2>
            {[1,2].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 animate-pulse h-24" />
            ))}
          </div>
        ) : brands.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Saved Brands</h2>
            <div className="grid grid-cols-1 gap-4">
              {brands.map((b) => (
                <div key={b.id} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <p className="font-bold text-lg">{b.name}</p>
                    {b.description && <p className="text-zinc-400 text-sm">{b.description}</p>}
                    <div className="flex flex-wrap gap-3 mt-2">
                      {b.colors && <span className="text-xs bg-zinc-800 px-3 py-1 rounded-full text-zinc-300">🎨 {b.colors}</span>}
                      {b.tone && <span className="text-xs bg-zinc-800 px-3 py-1 rounded-full text-zinc-300">✨ {b.tone}</span>}
                      {b.fonts && <span className="text-xs bg-zinc-800 px-3 py-1 rounded-full text-zinc-300">🔤 {b.fonts}</span>}
                    </div>
                  </div>
                  {b.reference_image && (
                    <img src={`data:image/png;base64,${b.reference_image}`} alt={b.name} className="w-20 h-20 rounded-xl object-cover" />
                  )}
                  <button onClick={() => handleDelete(b.id)} className="text-zinc-600 hover:text-red-400 transition-all text-sm">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}