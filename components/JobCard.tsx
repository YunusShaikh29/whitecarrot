"use client";

import { Edit, Trash2, Eye, EyeOff, MapPin, Briefcase, Clock } from "lucide-react";

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
}

interface JobCardProps {
  job: Job;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

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
  if (max !== undefined) {
    return `Up to ${currency} ${max.toLocaleString()}`;
  }
  return null;
};

export default function JobCard({
  job,
  onEdit,
  onDelete,
  onToggleActive,
}: JobCardProps) {
  const isActive = job.isActive ?? true;

  return (
    <div
      className={`bg-white border rounded-lg p-5 ${
        isActive ? "border-gray-200" : "border-gray-300 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
            {!isActive && (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Inactive
              </span>
            )}
          </div>

          {job.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {job.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleActive}
            className="p-2 text-gray-400 hover:text-gray-600"
            title={isActive ? "Deactivate job" : "Activate job"}
          >
            {isActive ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600"
            title="Edit job"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600"
            title="Delete job"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

