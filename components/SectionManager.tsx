"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SectionCard from "./SectionCard";
import SectionEditor from "./SectionEditor";
import { Plus, Loader2 } from "lucide-react";

interface Section {
  id: string;
  type: "HERO" | "ABOUT" | "CULTURE" | "JOBS";
  title: string | null;
  content: any;
  order: number;
  isVisible: boolean;
}

interface SectionManagerProps {
  companySlug: string;
}

export default function SectionManager({ companySlug }: SectionManagerProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSections();
  }, [companySlug]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${url}/api/companies/${companySlug}/sections`
      );
      setSections(response.data.sections);
    } catch (err) {
      console.error("Error fetching sections:", err);
      setError("Failed to load sections");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections); // Optimistic update

      try {
        await axios.patch(
          `${url}/api/companies/${companySlug}/sections/reorder`,
          {
            sectionIds: newSections.map((s) => s.id),
          }
        );
      } catch (err) {
        console.error("Error reordering:", err);
        fetchSections(); 
      }
    }
  };

  const handleAddSection = async (type: "HERO" | "ABOUT" | "CULTURE" | "JOBS") => {
    try {
      const resp = await axios
        .post(`${url}/api/companies/${companySlug}/sections`, {
          type,
          title: type.charAt(0) + type.slice(1).toLowerCase() + " Section",
        })

      setSections([...sections, resp.data.section])
      setEditingSection(resp.data.section)
      setShowAddModal(false)

    } catch (err) {
      console.error("Error creating section:", err);
      setError("Failed to create section");
    }

  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      await axios.delete(
        `${url}/api/companies/${companySlug}/sections/${id}`
      );
      setSections(sections.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error deleting section:", err);
      setError("Failed to delete section");
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const response = await axios.patch(
        `${url}/api/companies/${companySlug}/sections/${id}`,
        { isVisible: !currentVisibility }
      );
      setSections(
        sections.map((s) =>
          s.id === id ? { ...s, isVisible: !currentVisibility } : s
        )
      );
    } catch (err) {
      console.error("Error toggling visibility:", err);
      setError("Failed to update section");
    }
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
        <h2 className="text-lg font-semibold">Page Sections</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {sections.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No sections yet. Click "Add Section" to get started.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  onEdit={() => setEditingSection(section)}
                  onDelete={() => handleDeleteSection(section.id)}
                  onToggleVisibility={() =>
                    handleToggleVisibility(section.id, section.isVisible)
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Section</h3>
            <div className="space-y-2">
              {(["HERO", "ABOUT", "CULTURE"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleAddSection(type)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddModal(false)}
              className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {editingSection && (
        <SectionEditor
          companySlug={companySlug}
          section={editingSection}
          onClose={() => {
            setEditingSection(null);
            fetchSections();
          }}
        />
      )}
    </div>
  );
}