"use client";

/* 
Not deleting the them because this components is little tricky with so many states and logic
*/

import { useState, useEffect } from "react";
import axios from "axios";
import ImageUpload from "./ImageUpload";
import { Save, X } from "lucide-react";

interface CompanyImageSettingsProps {
  companySlug: string;
  currentLogo?: string | null;
  currentBanner?: string | null;
  onUpdate?: () => void;
}

export default function CompanyImageSettings({
  companySlug,
  currentLogo,
  currentBanner,
  onUpdate,
}: CompanyImageSettingsProps) {

  // Saved images (from database)
  const [savedLogo, setSavedLogo] = useState<string | null>(currentLogo || null);
  const [savedBanner, setSavedBanner] = useState<string | null>(currentBanner || null);
  
  // Pending files (selected but not uploaded yet - just local preview)
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingBannerFile, setPendingBannerFile] = useState<File | null>(null);
  
  // Deletion flags (when user clicks X on saved image)
  const [pendingLogoDelete, setPendingLogoDelete] = useState(false);
  const [pendingBannerDelete, setPendingBannerDelete] = useState(false);
  
  // Preview URLs (local preview from FileReader - not uploaded yet)
  const [logoPreview, setLogoPreview] = useState<string | null>(currentLogo || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(currentBanner || null);
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Update saved images when props change (only if no pending changes)
  useEffect(() => {
    // Only update if there are no pending files or deletions
    if (!pendingLogoFile && !pendingLogoDelete) {
      setSavedLogo(currentLogo || null);
      setLogoPreview(currentLogo || null); // Always sync preview with saved logo URL
    }
    if (!pendingBannerFile && !pendingBannerDelete) {
      setSavedBanner(currentBanner || null);
      setBannerPreview(currentBanner || null); // Always sync preview with saved banner URL
    }
  }, [currentLogo, currentBanner, pendingLogoFile, pendingLogoDelete, pendingBannerFile, pendingBannerDelete]);
  
  // Compute what image to display: pending preview OR saved image URL
  const displayLogo = pendingLogoFile 
    ? logoPreview // Local preview from FileReader
    : (pendingLogoDelete 
      ? null // Marked for deletion, show upload box
      : (savedLogo || currentLogo || null)); // Show saved image URL
  
  const displayBanner = pendingBannerFile
    ? bannerPreview // Local preview from FileReader
    : (pendingBannerDelete
      ? null // Marked for deletion, show upload box
      : (savedBanner || currentBanner || null)); // Show saved image URL

  const handleLogoFileSelect = (file: File) => {
    setPendingLogoFile(file);
    setPendingLogoDelete(false); 
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFileSelect = (file: File) => {
    setPendingBannerFile(file);
    setPendingBannerDelete(false); 
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoRemove = () => {
    // If there's a pending file (local preview), just cancel it
    if (pendingLogoFile) {
      setPendingLogoFile(null);
      setLogoPreview(savedLogo || null); // Reset to saved image
    } else {
      // If removing saved image, mark for deletion and show upload box
      setPendingLogoDelete(true);
      setLogoPreview(null); // Clear preview to show upload box
    }
  };

  const handleBannerRemove = () => {
    // If there's a pending file (local preview), just cancel it
    if (pendingBannerFile) {
      setPendingBannerFile(null);
      setBannerPreview(savedBanner || null); // Reset to saved image
    } else {
      // If removing saved image, mark for deletion and show upload box
      setPendingBannerDelete(true);
      setBannerPreview(null); // Clear preview to show upload box
    }
  };

  const handleCancel = () => {
    setPendingLogoFile(null);
    setPendingBannerFile(null);
    setPendingLogoDelete(false);
    setPendingBannerDelete(false);
    setLogoPreview(savedLogo || null);
    setBannerPreview(savedBanner || null);
    setError(null);
  };

  const handleSave = async () => {
    setUploading(true);
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData: { logo?: string | null; bannerImage?: string | null } = {};
      
      // Handle logo: upload new file OR delete existing
      if (pendingLogoFile) {
        // Upload new logo file to Supabase
        const logoFormData = new FormData();
        logoFormData.append("file", pendingLogoFile);
        logoFormData.append("folder", "logos");
        
        const logoResponse = await axios.post(`${url}/api/upload`, logoFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        updateData.logo = logoResponse.data.url;
      } else if (pendingLogoDelete) {
        // Mark logo for deletion
        updateData.logo = null;
      }
      
      // Handle banner: upload new file OR delete existing
      if (pendingBannerFile) {
        // Upload new banner file to Supabase
        const bannerFormData = new FormData();
        bannerFormData.append("file", pendingBannerFile);
        bannerFormData.append("folder", "banners");
        
        const bannerResponse = await axios.post(`${url}/api/upload`, bannerFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        updateData.bannerImage = bannerResponse.data.url;
      } else if (pendingBannerDelete) {
        // Mark banner for deletion
        updateData.bannerImage = null;
      }

      // If no changes, don't make API call
      if (Object.keys(updateData).length === 0) {
        setUploading(false);
        setSaving(false);
        return;
      }

      await axios.patch(`${url}/api/companies/${companySlug}`, updateData);
      
      // Update saved images and clear pending states
      if (pendingLogoFile && updateData.logo) {
        // New logo uploaded
        setSavedLogo(updateData.logo);
        setLogoPreview(updateData.logo);
        setPendingLogoFile(null);
        setPendingLogoDelete(false);
      } else if (pendingLogoDelete) {
        // Logo deleted
        setSavedLogo(null);
        setLogoPreview(null);
        setPendingLogoDelete(false);
      }
      
      if (pendingBannerFile && updateData.bannerImage) {
        // New banner uploaded
        setSavedBanner(updateData.bannerImage);
        setBannerPreview(updateData.bannerImage);
        setPendingBannerFile(null);
        setPendingBannerDelete(false);
      } else if (pendingBannerDelete) {
        // Banner deleted
        setSavedBanner(null);
        setBannerPreview(null);
        setPendingBannerDelete(false);
      }
      
      setSuccess(true);
      if (onUpdate) {
        onUpdate();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving images:", err);
      setError(
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to save images"
      );
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const hasPendingChanges = 
    pendingLogoFile !== null || 
    pendingBannerFile !== null || 
    pendingLogoDelete || 
    pendingBannerDelete;

  return (

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Company Images</h3>
          {hasPendingChanges && (
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
                disabled={uploading || saving}
                className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading || saving ? (
                  <>
                    {uploading ? "Uploading..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Images
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
            Images saved successfully!
          </div>
        )}

        {hasPendingChanges && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
            You have unsaved changes. Click "Save Images" to apply them.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <ImageUpload
            label="Company Logo"
            currentImage={displayLogo}
            folder="logos"
            aspectRatio="square"
            onFileSelect={handleLogoFileSelect}
            onRemove={handleLogoRemove}
          />

          <ImageUpload
            label="Banner Image"
            currentImage={displayBanner}
            folder="banners"
            aspectRatio="wide"
            onFileSelect={handleBannerFileSelect}
            onRemove={handleBannerRemove}
          />
        </div>
      </div>
    
  );
}

