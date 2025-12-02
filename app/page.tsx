"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (data?.user) {
      router.replace("/protectedPage");
    }
  }, [data?.user, router]);

  if (isPending || data?.user) {
    return null;
  }

  return (
    <main className="h-screen flex flex-col gap-6 justify-center items-center">
      <h1 className="text-3xl font-bold">Welcome to the App</h1>

      <button
        onClick={() =>
          authClient.signIn.social({
            provider: "google",
            callbackURL: "/protectedPage",
          })
        }
        
        className="px-6 py-3 bg-black text-white rounded-lg duration-200 hover:bg-gray-900"
      >
        Continue with Google
      </button>
    </main>
  );
}
