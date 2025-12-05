"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { LogOut } from "lucide-react";

interface Company {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    websiteUrl: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchCompany();
    }
  }, [session?.user]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const response = await axios.get(url + "/api/companies");
      setCompany(response.data.company || null);
    } catch (err) {
      console.error("Error fetching company:", err);
      setError("Failed to load company");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/");
    } catch (err) {
      console.error("Error signing out:", err);
      router.push("/");
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      const response = await axios.post(url + "/api/companies", {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        websiteUrl: formData.websiteUrl || null,
      });

      setCompany(response.data.company);
      router.push(`/company/${response.data.company.slug}/edit`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(err instanceof Error ? err.message : "Failed to create company");
      }
    } finally {
      setCreating(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {session.user.name || session.user.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!company && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-2 py-2 text-xs md:px-6 md:py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors flex justify-center items-center"
              >
                {showCreateForm ? "Cancel" : "Create Company"}
              </button>
            )}
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {showCreateForm && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Create New Company</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., Whitecarrot Inc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                  pattern="[a-z0-9-]+"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., whitecarrot"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used in URL: /{formData.slug || "company-slug"}/careers
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Brief description of your company..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, websiteUrl: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Company"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({
                      name: "",
                      slug: "",
                      description: "",
                      websiteUrl: "",
                    });
                    setError(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {!company ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg mb-4">
              You don't have a company yet.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900"
            >
              Create Your Company
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-16 w-16 object-contain"
                />
              ) : (
                <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-2xl font-bold">
                    {company.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {company.name}
            </h3>
            {company.description && (
              <p className="text-gray-600 text-sm mb-4">
                {company.description}
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => router.push(`/${company.slug}/edit`)}
                className="flex-1 px-6 py-3 md:max-w-30 bg-black text-white rounded-lg hover:bg-stone-800 hover:text-white transition-all duration-100"
              >
                Edit
              </button>
              <button
                onClick={() => router.push(`/${company.slug}/preview`)}
                className="flex-1 px-6 py-3 md:max-w-30 border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-black transition-all duration-100"
              >
                Preview
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <a
                href={`/${company.slug}/careers`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-black"
              >
                View Public Page →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
