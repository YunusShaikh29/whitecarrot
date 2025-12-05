"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import SectionRenderer from "@/components/SectionRenderer";
import { Loader2, Search, MapPin, Briefcase, Clock, Filter, X } from "lucide-react";
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
  cultureVideoUrl: string | null;
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
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  workMode: "REMOTE" | "HYBRID" | "ON_SITE";
  department: string | null;
  salaryRange: {
    min?: number;
    max?: number;
    currency?: string;
  } | null;
  applicationUrl: string | null;
  isActive: boolean | null;
  createdAt: string;
}

export default function CareersPage() {
  const params = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedJobType, setSelectedJobType] = useState<string>("all");
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const companySlug = params["company-slug"] as string;
  const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  useEffect(() => {
    fetchCompanyData();
  }, [companySlug]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedLocation, selectedJobType, selectedWorkMode, selectedDepartment, allJobs]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${url}/api/public/companies/${companySlug}`
      );

      setCompany(response.data.company);
      setSections(response.data.company.sections || []);
      setAllJobs(response.data.company.jobs || []);
      setFilteredJobs(response.data.company.jobs || []);
    } catch (err) {
      console.error("Error fetching company data:", err);
      setError(
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to load careers page"
      );
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allJobs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query) ||
          job.department?.toLowerCase().includes(query)
      );
    }

    if (selectedLocation !== "all") {
      filtered = filtered.filter((job) => job.location === selectedLocation);
    }

    if (selectedJobType !== "all") {
      filtered = filtered.filter((job) => job.jobType === selectedJobType);
    }

    if (selectedWorkMode !== "all") {
      filtered = filtered.filter((job) => job.workMode === selectedWorkMode);
    }

    if (selectedDepartment !== "all") {
      filtered = filtered.filter((job) => job.department === selectedDepartment);
    }

    setFilteredJobs(filtered);
  };

  const formatJobType = (type: string) => {
    return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatWorkMode = (mode: string) => {
    return mode.replace("_", "-").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatSalary = (salaryRange: Job["salaryRange"]) => {
    if (!salaryRange) return null;
    
    let rangeObj = salaryRange;
    if (typeof salaryRange === 'string') {
      try {
        rangeObj = JSON.parse(salaryRange);
      } catch (e) {
        return null;
      }
    }
    
    if (!rangeObj || typeof rangeObj !== 'object') return null;
    
    const { min, max, currency = "USD" } = rangeObj as { min?: number; max?: number; currency?: string };
    
    if (min !== undefined && max !== undefined) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    if (min !== undefined) {
      return `${currency} ${min.toLocaleString()}+`;
    }
    return null;
  };

  const formatPostedDate = (createdAt: string) => {
    const now = new Date();
    const postedDate = new Date(createdAt);
    
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const postedMidnight = new Date(postedDate.getFullYear(), postedDate.getMonth(), postedDate.getDate());
    
    const diffTime = nowMidnight.getTime() - postedMidnight.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Posted today";
    } else if (diffDays === 1) {
      return "Posted 1 day ago";
    } else {
      return `Posted ${diffDays} days ago`;
    }
  };

  const locations = Array.from(new Set(allJobs.map((j) => j.location))).sort();
  const departments = Array.from(
    new Set(allJobs.map((j) => j.department).filter(Boolean))
  ).sort();

  const activeFiltersCount =
    (selectedLocation !== "all" ? 1 : 0) +
    (selectedJobType !== "all" ? 1 : 0) +
    (selectedWorkMode !== "all" ? 1 : 0) +
    (selectedDepartment !== "all" ? 1 : 0);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocation("all");
    setSelectedJobType("all");
    setSelectedWorkMode("all");
    setSelectedDepartment("all");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">
            {error || "Company not found"}
          </p>
        </div>
      </div>
    );
  }

  const primaryColor = company.primaryColor || "#000000";
  const secondaryColor = company.secondaryColor || "#FFFFFF";

  return (
    <div className="min-h-screen bg-white">
      {company.bannerImage && (
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

      {company.logo && (
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
          <SectionRenderer
            key={section.id}
            section={section}
            cultureVideoUrl={company.cultureVideoUrl}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        ))}

      <div id="jobs" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2
              className="text-3xl font-bold mb-6"
              style={{ color: primaryColor || "#000000" }}
            >
              Open Positions
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search jobs by title, location, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition"
                  style={{
                    "--tw-ring-color": primaryColor || "#000000",
                  } as React.CSSProperties & { "--tw-ring-color": string }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = primaryColor || "#000000";
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${primaryColor || "#000000"}40`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "";
                    e.currentTarget.style.boxShadow = "";
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm flex items-center gap-1 transition"
                    style={{
                      color: primaryColor || "#4B5563",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.8";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    <X className="w-4 h-4" />
                    Clear filters
                  </button>
                )}
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Location
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="all">All Locations</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Job Type
                    </label>
                    <select
                      value={selectedJobType}
                      onChange={(e) => setSelectedJobType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="all">All Types</option>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Work Mode
                    </label>
                    <select
                      value={selectedWorkMode}
                      onChange={(e) => setSelectedWorkMode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="all">All Modes</option>
                      <option value="REMOTE">Remote</option>
                      <option value="HYBRID">Hybrid</option>
                      <option value="ON_SITE">On-Site</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Department
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="all">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept || ""}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600">
                {filteredJobs.length === 0 ? (
                  <p>No jobs found matching your criteria.</p>
                ) : (
                  <p>
                    Showing {filteredJobs.length} of {allJobs.length} jobs
                  </p>
                )}
              </div>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No jobs found.</p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="transition"
                  style={{
                    color: primaryColor || "#2563EB",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  Clear filters to see all jobs
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="border-2 rounded-lg p-6 hover:shadow-md transition"
                  style={{
                    borderColor: primaryColor ? `${primaryColor}30` : "#E5E7EB",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = primaryColor || "#D1D5DB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = primaryColor ? `${primaryColor}30` : "#E5E7EB";
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3
                        className="text-xl font-semibold mb-2"
                        style={{ color: primaryColor || "#000000" }}
                      >
                        {job.title}
                      </h3>
                      {job.description && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {job.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{formatJobType(job.jobType)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatWorkMode(job.workMode)}</span>
                        </div>
                        {job.department && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {job.department}
                          </span>
                        )}
                        {formatSalary(job.salaryRange) && (
                          <span className="font-medium text-gray-700">
                            {formatSalary(job.salaryRange)}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatPostedDate(job.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {job.applicationUrl ? (
                        <a
                          href={job.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition whitespace-nowrap"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Apply Now
                        </a>
                      ) : (
                        <span className="px-6 py-2 bg-gray-200 text-gray-500 rounded-lg whitespace-nowrap">
                          Apply Soon
                        </span>
                      )}
                    </div>
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

