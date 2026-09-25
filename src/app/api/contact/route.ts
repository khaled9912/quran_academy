import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { name, email, message } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !message.trim()
  ) {
    return NextResponse.json(
      { error: "Name, email and message are required." },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("contact_messages").insert([
    {
      name: name.trim().slice(0, 200),
      email: email.trim().slice(0, 200),
      message: message.trim().slice(0, 5000),
    },
  ]);

  if (error) {
    console.error("Contact insert failed:", error);
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Form submitted successfully!" },
    { status: 200 }
  );
}
