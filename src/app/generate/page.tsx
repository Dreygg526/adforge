"use client";
import { useState, useEffect, useRef } from "react";

type Format = {
  id: string;
  name: string;
  category: string;
  description: string;
  prompt_template: string;
};

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

export default function GeneratePage() {
  const [formats, setFormats] = useState<Format[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [copy, setCopy] = useState("");
  const [brand, setBrand] = useState("");
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showManualBrand, setShowManualBrand] = useState(false);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [refImage, setRefImage] = useState<string | null>(null);
  const [refImagePreview, setRefImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const refFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/formats", { cache: "no-store" }).then((res) => res.json()).then((data) => setFormats(data));
    fetch("/api/brands", { cache: "no-store" }).then((res) => res.json()).then((data) => {
      setBrands(Array.isArray(data) ? data : []);
      setBrandsLoading(false);
    }).catch(() => setBrandsLoading(false));
  }, []);

  const handleBrandSelect = (b: Brand) => {
    setSelectedBrand(b);
    setBrand(b.name);
    setShowManualBrand(false);
    if (b.reference_image) {
      setImage(b.reference_image);
      setImagePreview(`data:image/${b.reference_image.startsWith("/9j/") ? "jpeg" : "png"};base64,${b.reference_image}`);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

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
  const handleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setRefImagePreview(base64);
      setRefImage(base64.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!selectedFormat || !copy || !brand) return;
    setLoading(true);
    setVariations([]);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: selectedFormat, copy, brand, image, refImage }),
    });
    const data = await res.json();
    setVariations(data.variations);
    setLoading(false);
  };

  const handleCopy = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">

        <div>
          <h1 className="text-4xl font-black tracking-tight">Generate Creative</h1>
          <p className="text-zinc-500 mt-2">Fill in the details and get 5 ready-to-use image prompts.</p>
        </div>

        {/* Brand selector */}
        <div className="space-y-3">
          <label className="text-sm text-gray-400 uppercase tracking-widest">Select Brand</label>
          {brandsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-zinc-900 border border-zinc-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : brands.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleBrandSelect(b)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedBrand?.id === b.id
                        ? "border-lime-400 bg-lime-400/10"
                        : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {b.reference_image ? (
                        <img
                          src={`data:image/${b.reference_image.startsWith("/9j/") ? "jpeg" : "png"};base64,${b.reference_image}`}
                          alt={b.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-zinc-800 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{b.name}</p>
                        {b.tone && <p className="text-zinc-500 text-xs mt-0.5 truncate">{b.tone}</p>}
                      </div>
                    </div>
                  </button>
                ))}

                <button
                  onClick={() => {
                    setShowManualBrand(true);
                    setSelectedBrand(null);
                    setBrand("");
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer border-dashed ${
                    showManualBrand
                      ? "border-lime-400 bg-lime-400/10"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 text-xl shrink-0">+</div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm">Other Brand</p>
                      <p className="text-zinc-500 text-xs mt-0.5">Enter manually</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Manual brand input */}
              {showManualBrand && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Brand name..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
                  />
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-zinc-700 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-lime-400 transition-all"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="max-h-40 rounded-lg object-contain" />
                    ) : (
                      <>
                        <p className="text-zinc-500 text-sm">Upload reference image (optional)</p>
                        <p className="text-zinc-600 text-xs mt-1">PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {imagePreview && (
                    <button
                      onClick={() => { setImage(null); setImagePreview(null); }}
                      className="text-xs text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                    >
                      Remove image
                    </button>
                  )}
                </div>
              )}

              {/* Selected brand reference preview */}
              {selectedBrand && imagePreview && (
                <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-xl p-3">
                  <img src={imagePreview} alt="brand ref" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div>
                    <p className="text-sm font-bold">{selectedBrand.name}</p>
                    <p className="text-xs text-zinc-500">Reference image loaded from brand memory</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-zinc-500 text-sm">
                No brands saved yet.{" "}
                <a href="/brands" className="text-lime-400 hover:underline cursor-pointer">Add a brand →</a>
              </div>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Or type a brand name manually..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
              />
              <div
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-zinc-700 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-lime-400 transition-all"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="max-h-40 rounded-lg object-contain" />
                ) : (
                  <>
                    <p className="text-zinc-500 text-sm">Upload reference image (optional)</p>
                    <p className="text-zinc-600 text-xs mt-1">PNG, JPG up to 10MB</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          )}
        </div>

        {/* Format picker */}
        <div className="space-y-3">
          <label className="text-sm text-gray-400 uppercase tracking-widest">Pick a Format</label>
          <div className="grid grid-cols-2 gap-3">
            {formats.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFormat(f)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedFormat?.id === f.id
                    ? "border-lime-400 bg-lime-400/10"
                    : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                }`}
              >
                <p className="font-bold text-sm">{f.name}</p>
                <p className="text-zinc-500 text-xs mt-1">{f.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Message input */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 uppercase tracking-widest">What do you want this ad to do?</label>
          <p className="text-xs text-zinc-500">Describe the vibe, message, or goal. Can be broad — our AI will handle the rest.</p>
          <textarea
            value={copy}
            onChange={(e) => setCopy(e.target.value)}
            placeholder="e.g. Make it feel premium and clean. Show the product in a lifestyle setting. Or just: 50% off this weekend."
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 resize-none"
          />
        </div>
{/* Creative reference image */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 uppercase tracking-widest">Creative Reference Image</label>
          <p className="text-xs text-zinc-500">Optional — upload an ad you like the style of. Claude will use it as creative inspiration.</p>
          <div
            onClick={() => refFileRef.current?.click()}
            className="w-full border-2 border-dashed border-zinc-700 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-lime-400 transition-all"
          >
            {refImagePreview ? (
              <img src={refImagePreview} alt="ref preview" className="max-h-40 rounded-lg object-contain" />
            ) : (
              <>
                <p className="text-zinc-500 text-sm">Click to upload a style reference ad</p>
                <p className="text-zinc-600 text-xs mt-1">PNG, JPG up to 10MB</p>
              </>
            )}
          </div>
          <input ref={refFileRef} type="file" accept="image/*" onChange={handleRefImageUpload} className="hidden" />
          {refImagePreview && (
            <button
              onClick={() => { setRefImage(null); setRefImagePreview(null); }}
              className="text-xs text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
            >
              Remove reference
            </button>
          )}
        </div>
        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !selectedFormat || !copy || !brand}
          className="w-full bg-lime-400 text-black font-black py-4 rounded-full text-lg hover:bg-lime-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Generating 5 variations..." : "Generate Prompts →"}
        </button>

        {/* Results */}
        {variations.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 uppercase tracking-widest">5 Generated Variations</p>
            {variations.map((v, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-lime-400 font-bold text-sm">Variation {i + 1}</p>
                  <button
                    onClick={() => handleCopy(i, v)}
                    className="text-sm bg-lime-400 text-black font-bold px-4 py-1.5 rounded-full hover:bg-lime-300 transition-all cursor-pointer"
                  >
                    {copied === i ? "Copied! ✓" : "Copy Prompt"}
                  </button>
                </div>
                <p className="text-white leading-relaxed text-sm">{v}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}