"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import axios from "axios";
import CompanyImageSettings from "@/components/CompanyImageSettings";
import CompanyBrandSettings from "@/components/CompanyBrandSettings";
import { Loader2 } from "lucide-react";
import SectionManager from "@/components/SectionManager";
import JobManager from "@/components/JobManager";

interface Company {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  logo: string | null;
  bannerImage: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  cultureVideoUrl: string | null;
  userId: string;
}

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companySlug = params["company-slug"] as string;
  const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.replace("/");
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    if (session?.user && companySlug) {
      fetchCompany();
    }
  }, [session?.user, companySlug]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${url}/api/companies`);
      const fetchedCompany = response.data.company;

      if (!fetchedCompany || fetchedCompany.slug !== companySlug) {
        setError("Company not found or you don't have permission to edit it.");
        return;
      }

      setCompany(fetchedCompany);
    } catch (err) {
      console.error("Error fetching company:", err);
      setCompany(null);
      setError(
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to load company"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    fetchCompany();
  };

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (error && !company) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading company...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Edit Company: {company?.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your company's branding and content
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/${company?.slug}/preview`)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Preview
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
          <CompanyImageSettings
            companySlug={company?.slug || ""}
            currentLogo={company?.logo}
            currentBanner={company?.bannerImage}
            onUpdate={handleUpdate}
          />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
          <CompanyBrandSettings
            companySlug={company?.slug || ""}
            currentPrimaryColor={company?.primaryColor}
            currentSecondaryColor={company?.secondaryColor}
            currentCultureVideoUrl={company?.cultureVideoUrl}
            onUpdate={handleUpdate}
          />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
         <SectionManager companySlug={company?.slug || ""}/>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
          <JobManager companySlug={company?.slug || ""} />
        </div>
      </div>
    </div>
  );
}

