/**
 * Registration by mobile number and one-time code. Off unless the build sets
 * NEXT_PUBLIC_PHONE_SIGNUP=true. With it off, /signup keeps the email form and
 * asks for a mobile number in it, so the academy still gets a way to reach a
 * new student without sending any codes.
 */
export const PHONE_SIGNUP_ENABLED =
  process.env.NEXT_PUBLIC_PHONE_SIGNUP === "false";
