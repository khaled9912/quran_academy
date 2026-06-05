"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { FaFacebook, FaYoutube, FaHandPeace } from "react-icons/fa";

const Footer = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();
  const [successMessage, setSuccessMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e) => {
    let data = getValues();
    setLoading(true);

    fetch("/api/contact", {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        setLoading(false);
        console.log("Response received");
        if (res.status === 200) {
          console.log("Response succeeded!");
          reset();

          setSuccessMessage(
            "Thank you! Your message has been sent successfully."
          );
          setShowAlert(true);
          // Hide the alert after 3 seconds
          setTimeout(() => {
            setShowAlert(false);
            setSuccessMessage("");
          }, 3000);
        }
      })
      .catch((error) => {
        console.error("Error occurred:", error);
      });
  };

  return (
    <section
      className="w-full p-10 bg-card-bg text-center md:text-left"
      id="contacts"
    >
      {showAlert && <div className="alert success-alert">{successMessage}</div>}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Column - Message */}
        <div className="flex flex-col justify-center items-center md:items-start p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <FaHandPeace className="text-3xl text-yellow-500" />
            <h2 className="text-4xl font-semibold text-green-500 dark:text-green-400">
              Reach Out
            </h2>
          </div>
          <p className="text-xl text-foreground">
            Ready to start your Quran journey today? We are here to help you
            every step of the way.
          </p>
          <div className="flex space-x-4 mt-6">
            <a
              href="https://www.facebook.com/people/Quran/61568090070901/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebook className="text-3xl text-blue-600 hover:text-blue-800 dark:hover:text-blue-400" />
            </a>
            <a
              href="https://youtube.com/YourAcademy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FaYoutube className="text-3xl text-red-600 hover:text-red-800 dark:hover:text-red-400" />
            </a>
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div className="bg-background border border-card-border p-6 rounded-lg shadow-md">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mt-4"
          >
            <div className="flex flex-col">
              <label htmlFor="name" className="text-foreground">
                Name
              </label>
              <input
                id="name"
                {...register("name", { required: "Name is required" })}
                className="p-2 border border-card-border rounded bg-card-bg text-foreground focus:outline-none focus:border-green-500"
              />
              {errors.name && (
                <span className="text-red-500 dark:text-red-400">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label htmlFor="email" className="text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Enter a valid email address",
                  },
                })}
                className="p-2 border border-card-border rounded bg-card-bg text-foreground focus:outline-none focus:border-green-500"
              />
              {errors.email && (
                <span className="text-red-500 dark:text-red-400">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label htmlFor="message" className="text-foreground">
                Message
              </label>
              <textarea
                id="message"
                {...register("message", { required: "Message is required" })}
                className="p-2 border border-card-border rounded bg-card-bg text-foreground focus:outline-none focus:border-green-500"
                rows="4"
              />
              {errors.message && (
                <span className="text-red-500 dark:text-red-400">
                  {errors.message.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="p-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded mt-4 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Loading..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
      <p className="mt-10 text-foreground opacity-70">
        &copy; {new Date().getFullYear()} Rayan Academy. All rights reserved.
      </p>
    </section>
  );
};

export default Footer;
