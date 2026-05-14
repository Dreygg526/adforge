import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return Response.json({ error }, { status: 500 });
  return Response.json(data ?? []);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await supabase.from("history").insert([body]).select();
  if (error) return Response.json({ error }, { status: 500 });
  return Response.json(data);
}