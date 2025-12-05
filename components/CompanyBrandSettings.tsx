"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Save, X, Info } from "lucide-react";

interface CompanyBrandSettingsProps {
  companySlug: string;
  currentPrimaryColor?: string | null;
  currentSecondaryColor?: string | null;
  currentCultureVideoUrl?: string | null;
  onUpdate?: () => void;
}

export default function CompanyBrandSettings({
  companySlug,
  currentPrimaryColor,
  currentSecondaryColor,
  currentCultureVideoUrl,
  onUpdate,
}: CompanyBrandSettingsProps) {
  const [primaryColor, setPrimaryColor] = useState(
    currentPrimaryColor || "#000000"
  );
  const [secondaryColor, setSecondaryColor] = useState(
    currentSecondaryColor || "#FFFFFF"
  );
  const [cultureVideoUrl, setCultureVideoUrl] = useState(
    currentCultureVideoUrl || ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  useEffect(() => {
    setPrimaryColor(currentPrimaryColor || "#000000");
    setSecondaryColor(currentSecondaryColor || "#FFFFFF");
    setCultureVideoUrl(currentCultureVideoUrl || "");
  }, [currentPrimaryColor, currentSecondaryColor, currentCultureVideoUrl]);

  const hasChanges =
    primaryColor !== (currentPrimaryColor || "#000000") ||
    secondaryColor !== (currentSecondaryColor || "#FFFFFF") ||
    cultureVideoUrl !== (currentCultureVideoUrl || "");

  const handleCancel = () => {
    setPrimaryColor(currentPrimaryColor || "#000000");
    setSecondaryColor(currentSecondaryColor || "#FFFFFF");
    setCultureVideoUrl(currentCultureVideoUrl || "");
    setError(null);
  };

  const normalizeVideoUrl = (url: string): string | null => {
    if (!url.trim()) return null;

    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    if (url.includes("youtube.com/embed") || url.includes("vimeo.com/video")) {
      return url;
    }

    try {
      new URL(url);
      return url;
    } catch {
      return null;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const normalizedVideoUrl = normalizeVideoUrl(cultureVideoUrl);

      const updateData: {
        primaryColor?: string;
        secondaryColor?: string;
        cultureVideoUrl?: string | null;
      } = {
        primaryColor,
        secondaryColor,
        cultureVideoUrl: normalizedVideoUrl,
      };

      await axios.patch(`${url}/api/companies/${companySlug}`, updateData);

      setSuccess(true);
      if (onUpdate) {
        onUpdate();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving brand settings:", err);
      setError(
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to save brand settings"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Brand Colors & Culture Video</h3>
        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          Brand settings saved successfully!
        </div>
      )}

      {hasChanges && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
          You have unsaved changes. Click "Save Changes" to apply them.
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="#000000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Used for buttons, links, and accents
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Secondary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="#FFFFFF"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Used for backgrounds and contrast
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium mb-3">Preview</p>
          <div className="flex flex-wrap gap-3">
            <button
              style={{ backgroundColor: primaryColor, color: secondaryColor }}
              className="px-4 py-2 rounded-lg font-medium"
            >
              Primary Button
            </button>
            <div
              className="px-4 py-2 rounded-lg border-2 font-medium"
              style={{
                backgroundColor: secondaryColor,
                color: primaryColor,
                borderColor: primaryColor,
              }}
            >
              Secondary Element
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Culture Video URL
          </label>
          <input
            type="text"
            value={cultureVideoUrl}
            onChange={(e) => setCultureVideoUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
          />
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Supported formats:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>YouTube: https://www.youtube.com/watch?v=VIDEO_ID</li>
                  <li>Vimeo: https://vimeo.com/VIDEO_ID</li>
                  <li>Embed URLs: https://www.youtube.com/embed/VIDEO_ID</li>
                </ul>
                <p className="mt-2">
                  The video will be displayed in the Culture section of your
                  careers page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

