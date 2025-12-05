"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import axios from "axios";
import SectionRenderer from "@/components/SectionRenderer";
import { Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";

interface Company {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo: string | null;
  bannerImage: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

interface Section {
  id: string;
  type: "HERO" | "ABOUT" | "CULTURE" | "JOBS";
  title: string | null;
  content: any;
  isVisible: boolean;
}

interface Job {
  id: string;
  title: string;
  description: string | null;
  location: string;
  jobType: string;
  workMode: string;
  department: string | null;
  salaryRange: any;
  applicationUrl: string | null;
  isActive: boolean | null;
}

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [company, setCompany] = useState<Company | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
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
      fetchPreviewData();
    }
  }, [session?.user, companySlug]);

  const fetchPreviewData = async () => {
    try {
      setLoading(true);
      setError(null);

      const companyResponse = await axios.get(`${url}/api/companies`);
      const fetchedCompany = companyResponse.data.company;

      if (!fetchedCompany || fetchedCompany.slug !== companySlug) {
        setError("Company not found or you don't have permission to preview it.");
        return;
      }

      setCompany(fetchedCompany);

      const sectionsResponse = await axios.get(
        `${url}/api/companies/${companySlug}/sections`
      );
      const visibleSections = sectionsResponse.data.sections.filter(
        (s: Section) => s.isVisible
      );
      setSections(visibleSections);

      const jobsResponse = await axios.get(
        `${url}/api/companies/${companySlug}/jobs`
      );
      const activeJobs = jobsResponse.data.jobs.filter(
        (j: Job) => j.isActive
      );
      setJobs(activeJobs);
    } catch (err) {
      console.error("Error fetching preview data:", err);
      setError(
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to load preview"
      );
    } finally {
      setLoading(false);
    }
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

  if (error) {
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

  const primaryColor = company?.primaryColor || "#000000";
  const secondaryColor = company?.secondaryColor || "#FFFFFF";

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Header */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/${companySlug}/edit`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Edit
            </button>
            <span className="text-sm text-gray-500">|</span>
            <span className="text-sm font-medium text-gray-700">
              Preview Mode
            </span>
          </div>
          <a
            href={`/${companySlug}/careers`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View Public Page →
          </a>
        </div>
      </div>

      {company?.bannerImage && (
        <div className="relative w-full h-64 md:h-80 bg-gray-200">
          <Image
            src={company.bannerImage}
            alt={`${company.name} banner`}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      {company?.logo && (
        <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
          <div className="w-24 h-24 bg-white rounded-lg shadow-lg p-2">
            <Image
              src={company.logo}
              alt={`${company.name} logo`}
              width={96}
              height={96}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>
        </div>
      )}

      {sections
        .filter((s) => s.type !== "JOBS")
        .map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}

      <div id="jobs" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Open Positions</h2>
          {jobs.length === 0 ? (
            <p className="text-gray-500">No open positions at the moment.</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                      {job.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.jobType.replace("_", " ")}</span>
                        <span>•</span>
                        <span>{job.workMode.replace("_", "-")}</span>
                        {job.department && (
                          <>
                            <span>•</span>
                            <span>{job.department}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {job.applicationUrl && (
                      <a
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition whitespace-nowrap"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Apply Now
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

