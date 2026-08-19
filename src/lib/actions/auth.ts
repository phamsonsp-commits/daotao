"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

export async function authenticate(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const dest = String(formData.get("callbackUrl") || "/");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: dest,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      redirect(`/login?error=1&callbackUrl=${encodeURIComponent(dest)}`);
    }
    throw err;
  }
}
