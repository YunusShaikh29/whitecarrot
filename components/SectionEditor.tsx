"use client"

import axios from "axios"
import { Save, X } from "lucide-react"
import { useState } from "react"

interface Section {
  id: string
  type: "HERO" | "ABOUT" | "CULTURE" | "JOBS"
  title: string | null
  content: any
  isVisible: boolean
}

interface SectionEditorProps {
  companySlug: string
  section: Section
  onClose: () => void
}

export default function SectionEditor({
  companySlug, onClose, section
}: SectionEditorProps) {

  const [title, setTitle] = useState(section.title || "")
  const [content, setContent] = useState<any>(section.content || {})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      await axios.patch(`${url}/api/companies/${companySlug}/sections/${section.id}`, { title: title || null, content })

      onClose()
    } catch (error) {
      console.error("Error saving section:", error);
      setError("Failed to save section");
    } finally {
      setSaving(false)
    }
  }


  const renderContentFields = () => {
    switch (section.type) {
      case "HERO":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Headline
              </label>
              <input
                type="text"
                value={content.headline || ""}
                onChange={(e) =>
                  setContent({ ...content, headline: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Join Our Team"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Subheadline
              </label>
              <input
                type="text"
                value={content.subheadline || ""}
                onChange={(e) =>
                  setContent({ ...content, subheadline: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="We're hiring amazing people"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                CTA Text
              </label>
              <input
                type="text"
                value={content.ctaText || ""}
                onChange={(e) =>
                  setContent({ ...content, ctaText: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="View Open Positions"
              />
            </div>
          </div>
        );

      case "ABOUT":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={content.description || ""}
                onChange={(e) =>
                  setContent({ ...content, description: e.target.value })
                }
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Tell candidates about your company..."
              />
            </div>
          </div>
        );

      case "CULTURE":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={content.description || ""}
                onChange={(e) =>
                  setContent({ ...content, description: e.target.value })
                }
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Describe your company culture..."
              />
            </div>
          </div>
        );
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-beteween items-center">
          <h3 className="text-lg font-semibold">Edit {section.type} Section</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Section title"
            />
            {renderContentFields()}

          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>


        </div>


      </div>
    </div>
  )


}