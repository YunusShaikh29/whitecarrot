"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle2, Layout, Users, Globe, ArrowRight } from "lucide-react";

export default function Home() {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (data?.user) {
      router.replace("/dashboard");
    }
  }, [data?.user, router]);

  if (isPending || data?.user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Layout className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">
                CareerCraft
              </span>
            </div>
            <button
              onClick={handleGoogleSignIn}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Now Hiring? Build your page in seconds.
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              Attract talent with a <span className="text-blue-600">stunning</span> career page.
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Stop relying on boring job boards. Build a branded careers site that tells your story, showcases your culture, and converts top candidates.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={handleGoogleSignIn}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
              
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200">
                View Demo <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-gray-500">
              No credit card required · Free for early access users
            </p>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-purple-50 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-xl shadow-2xl p-6 rotate-1 hover:rotate-0 transition-transform duration-500">
               <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
               </div>
               <div className="space-y-4">
                  <div className="h-32 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center text-blue-800 font-medium">
                    Company Banner Area
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 rounded-lg bg-gray-50 border border-gray-100"></div>
                    <div className="h-24 rounded-lg bg-gray-50 border border-gray-100"></div>
                    <div className="h-24 rounded-lg bg-gray-50 border border-gray-100"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to hire</h2>
            <p className="mt-4 text-gray-600">Built for modern recruiting teams.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Layout className="w-6 h-6 text-blue-600" />}
              title="Drag & Drop Builder"
              description="Customize your career page with our intuitive visual editor. No coding required."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-purple-600" />}
              title="Custom Domain"
              description="Host your career page on your own domain to maintain brand consistency."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-green-600" />}
              title="Applicant Tracking"
              description="Simple management of candidates and job postings in one dashboard."
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gray-900 p-1.5 rounded-lg">
                <Layout className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">CareerCraft</span>
            </div>
            <p className="text-sm text-gray-500">© 2025 CareerCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}