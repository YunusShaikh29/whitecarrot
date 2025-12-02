import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    redirect("/"); 
  }

  return (
    <div className="p-4 text-xl font-semibold">
       Protected Route — Welcome, {session.user.email}!
    </div>
  );
}
