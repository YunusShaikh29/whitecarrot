"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface Section {
  id: string;
  type: "HERO" | "ABOUT" | "CULTURE" | "JOBS";
  title: string | null;
  isVisible: boolean;
}

interface SectionCardProps {
  section: Section;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}

export default function SectionCard({
  section,
  onEdit,
  onDelete,
  onToggleVisibility,
}: SectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none select-none"
        style={{ touchAction: "none" }}
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {section.type}
          </span>
          <h3 className="font-medium text-gray-900">
            {section.title || "Untitled Section"}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleVisibility}
          className="p-2 text-gray-400 hover:text-gray-600"
          title={section.isVisible ? "Hide section" : "Show section"}
        >
          {section.isVisible ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-blue-600"
          title="Edit section"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-600"
          title="Delete section"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

