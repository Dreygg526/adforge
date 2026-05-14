import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="inline-block bg-lime-400 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
          AI Creative Studio
        </div>
        <h1 className="text-5xl font-black tracking-tight">
          AdForge
        </h1>
        <p className="text-gray-400 text-lg">
          Generate on-brand ad creatives in seconds. Pick a format, drop your copy, let AI do the rest.
        </p>
        <Link
          href="/generate"
          className="inline-block bg-lime-400 text-black font-bold px-8 py-4 rounded-full text-lg hover:bg-lime-300 transition-all"
        >
          Start Creating →
        </Link>
      </div>
    </main>
  );
}