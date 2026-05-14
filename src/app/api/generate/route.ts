import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const { format, copy, brand, image, refImage } = await req.json();

  const userContent: Anthropic.MessageParam["content"] = [];

  if (image) {
    userContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: image.startsWith("/9j/") ? "image/jpeg" : "image/png",
        data: image,
      },
    });
  }

  if (refImage) {
    userContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: refImage.startsWith("/9j/") ? "image/jpeg" : "image/png",
        data: refImage,
      },
    });
  }

  const aspectRatios: Record<string, string> = {
    "Facebook Feed Ad": "1:1 (1080x1080px)",
    "Instagram Story": "9:16 (1080x1920px)",
    "Google Display Banner": "16:9 (1200x628px)",
    "Product Promo": "1:1 (1080x1080px)",
    "Testimonial Card": "4:5 (1080x1350px)",
    "TikTok Ad": "9:16 (1080x1920px)",
    "YouTube Thumbnail": "16:9 (1280x720px)",
    "Twitter/X Post": "16:9 (1600x900px)",
    "Pinterest Pin": "2:3 (1000x1500px)",
    "LinkedIn Post": "1:1 (1080x1080px)",
  };

  const ratio = aspectRatios[format.name] || "1:1 (1080x1080px)";

  userContent.push({
    type: "text",
    text: `You are a senior graphic designer and creative director with 15+ years of experience in digital advertising and brand design. You have deep expertise in:
- Visual hierarchy and composition
- Typography pairing and text placement
- Color theory and brand consistency
- Platform-specific ad design (Meta, Google, TikTok)
- Product photography direction and lighting
- Consumer psychology and conversion-focused design

${image ? "PRODUCT REFERENCE: I've attached a reference image of the product. Carefully analyze its color palette, packaging design, typography style, brand tone, and visual language." : ""}
${refImage ? "CREATIVE STYLE REFERENCE: I've attached a reference image for visual context. Do NOT copy or directly replicate it. Only use elements from it IF the user's creative direction explicitly asks for it (e.g. 'make it like this', 'similar vibe', 'cartoon style like this'). Otherwise treat it purely as background context — let the user's message and your own creative expertise drive the prompts." : ""}

Your task is to generate 5 COMPLETELY DIFFERENT image generation prompts for the same ad brief.

STRICT RULES — NEVER BREAK THESE:
- NO real people, NO real faces, NO real hands, NO real models, NO real human figures
- Cartoon characters, CGI figures, 3D illustrated characters, and animated mascots ARE allowed
- If a creative style reference is provided, closely follow its concept, composition style, and creative direction — adapt it to fit the brand and product
- The PRODUCT is always the hero of the image
- Focus on: product placement, backgrounds, environments, textures, props, graphic elements, typography, lighting, and composition
- Each variation must have a completely different scene, setting, mood, and composition
- Reflect the AD MESSAGE tone and energy (e.g. "50% off" → bold, urgent, high contrast. "fuel your body" → clean, lifestyle, aspirational)
- Feel like 5 different creative directors each came up with their own concept
- Never repeat the same background, lighting style, or composition across the 5 versions
- Think like a top ad agency: product as hero, bold typography, graphic design elements, clean layouts

Brand: ${brand}
Creative Direction (interpret this and expand it — even if vague, use your expertise to make it work):
${copy}
Platform: ${format.name}
Aspect Ratio: ${ratio}

Each prompt must include:
- PRODUCT PLACEMENT — how and where the product sits in the frame
- BACKGROUND & SETTING — environment, textures, surfaces, props (no people)
- LIGHTING — type, direction, mood
- COLOR PALETTE — specific to brand and ad message energy
- GRAPHIC ELEMENTS — shapes, overlays, design details, visual effects
- TYPOGRAPHY — font style, weight, size hierarchy, placement of the ad copy text
- OVERALL MOOD & TONE
${image ? "- BRAND CONSISTENCY — colors, design language, visual style from the reference image" : ""}

Format your response EXACTLY like this — no extra text, no preamble:

VARIATION 1:
[full detailed prompt here]

VARIATION 2:
[full detailed prompt here]

VARIATION 3:
[full detailed prompt here]

VARIATION 4:
[full detailed prompt here]

VARIATION 5:
[full detailed prompt here]`,
  });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: userContent }],
  });

  const result = message.content[0];
  if (result.type !== "text") {
    return Response.json({ error: "Unexpected response" }, { status: 500 });
  }

  const raw = result.text;
  const variations = [1, 2, 3, 4, 5].map((n) => {
    const start = raw.indexOf(`VARIATION ${n}:`);
    const end = n < 5 ? raw.indexOf(`VARIATION ${n + 1}:`) : raw.length;
    return raw.slice(start + `VARIATION ${n}:`.length, end).trim();
  });

  await supabase.from("history").insert([{
    brand_name: brand,
    format_name: format.name,
    copy: copy,
    generated_prompt: variations.join("\n\n---\n\n"),
    reference_image: refImage || image || null,
  }]);

  return Response.json({ variations });
}