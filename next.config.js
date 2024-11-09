/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  env: {
    EMAIL_USER: process.env.NEXT_PUBLIC_EMAIL_USER,
    EMAIL_APP_PASSWORD: process.env.NEXT_PUBLIC_EMAIL_APP_PASSWORD,
    RECEIVER_EMAIL: process.env.NEXT_PUBLIC_RECEIVER_EMAIL,
  },
};

export default nextConfig;
