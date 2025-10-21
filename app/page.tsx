import { redirect } from "next/navigation";

export default function Home() {
  // Redirect directly to sign-in page
  redirect("/auth/login");
}
