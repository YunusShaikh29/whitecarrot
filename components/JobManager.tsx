"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import JobCard from "./JobCard";
import JobForm from "./JobForm";
import { Plus, Loader2 } from "lucide-react";

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
  updatedAt: string;
}

interface JobManagerProps {
  companySlug: string;
}

export default function JobManager({ companySlug }: JobManagerProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  useEffect(() => {
    fetchJobs();
  }, [companySlug]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${url}/api/companies/${companySlug}/jobs`
      );
      setJobs(response.data.jobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = () => {
    setEditingJob(null);
    setShowAddModal(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowAddModal(true);
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      await axios.delete(`${url}/api/companies/${companySlug}/jobs/${id}`);
      setJobs(jobs.filter((j) => j.id !== id));
    } catch (err) {
      console.error("Error deleting job:", err);
      setError("Failed to delete job");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean | null) => {
    try {
      const response = await axios.patch(
        `${url}/api/companies/${companySlug}/jobs/${id}`,
        { isActive: !currentStatus }
      );
      setJobs(
        jobs.map((j) =>
          j.id === id ? { ...j, isActive: response.data.job.isActive } : j
        )
      );
    } catch (err) {
      console.error("Error toggling job status:", err);
      setError("Failed to update job");
    }
  };

  const handleFormClose = () => {
    setShowAddModal(false);
    setEditingJob(null);
    fetchJobs(); // Refresh jobs list
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Job Listings</h2>
        <button
          onClick={handleAddJob}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Job
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No jobs yet. Click "Add Job" to create your first job listing.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={() => handleEditJob(job)}
              onDelete={() => handleDeleteJob(job.id)}
              onToggleActive={() => handleToggleActive(job.id, job.isActive)}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <JobForm
          companySlug={companySlug}
          job={editingJob}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

