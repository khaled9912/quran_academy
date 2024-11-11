import nodemailer from "nodemailer";

export async function POST(request) {
  const { name, email, message } = await request.json();
  const mailData = {
    from: email,
    to: process.env.RECEIVER_EMAIL,
    subject: `You have a new message from ${name}`,
    text: message + " | Sent from: " + email,
    html: `<div>${message}</div><p>Sent from:
    ${email}</p>`,
  };
  console.log(
    "env",
    process.env.NEXT_PUBLIC_EMAIL_USER,
    process.env.NEXT_PUBLIC_EMAIL_APP_PASSWORD,
    mailData
  );

  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    secure: true,
  });

  console.log(
    "env",
    process.env.EMAIL_USER,
    process.env.EMAIL_APP_PASSWORD,
    mailData
  );
  await new Promise((resolve, reject) => {
    // verify connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("Server is ready to take our messages");
        resolve(success);
      }
    });
  });
  await new Promise((resolve, reject) => {
    // send mail
    transporter.sendMail(mailData, (err, info) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log(info);
        resolve(info);
      }
    });
  });

  return new Response(
    JSON.stringify({ message: "Form submitted successfully!" }),
    {
      status: 200,
    }
  );
}
