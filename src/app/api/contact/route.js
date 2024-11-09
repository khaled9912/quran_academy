import nodemailer from "nodemailer";

export async function POST(request) {
  const { name, email, message } = await request.json();
  const mailData = {
    from: email,
    to: process.env.NEXT_PUBLIC_RECEIVER_EMAIL,
    subject: `You have a new message from ${name}`,
    text: message + " | Sent from: " + email,
    html: `<div>${message}</div><p>Sent from:
    ${email}</p>`,
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL_USER,
      pass: process.env.NEXT_PUBLIC_EMAIL_APP_PASSWORD,
    },
    secure: true,
  });
  console.log(
    "env",
    process.env.NEXT_PUBLIC_EMAIL_USER,
    process.env.NEXT_PUBLIC_EMAIL_APP_PASSWORD,
    mailData
  );

  transporter.sendMail(mailData, function (err, info) {
    if (err) console.log(err);
    else console.log(info);
  });

  return new Response(
    JSON.stringify({ message: "Form submitted successfully!" }),
    {
      status: 200,
    }
  );
}
