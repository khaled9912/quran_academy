import nodemailer from "nodemailer";

export async function POST(request) {
  const { name, email, message } = await request.json();
  const mailData = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `You have a new message from ${name}`,
    text: message + " | Sent from: " + email,
    html: `<div>${message}</div><p>Sent from:
    ${email}</p>`,
  };

  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    secure: true,
  });

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

  // send mail
  await transporter.sendMail(mailData);
  return new Response(
    JSON.stringify({ message: "Form submitted successfully!" }),
    {
      status: 200,
    }
  );
}
