import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request) {
  const { name, email, message } = await request.json();
  const { error } = await supabaseAdmin
    .from("contact_messages")
    .insert([{ name, email, message }]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(
    JSON.stringify({ message: "Form submitted successfully!" }),
    {
      status: 200,
    }
  );
}
