import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { error } = await supabase.from("brands").delete().eq("id", params.id);
  if (error) return Response.json({ error }, { status: 500 });
  return Response.json({ success: true });
}