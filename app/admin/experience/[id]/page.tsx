"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Experience = {
  id: string;
  company: string;
  role: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  display_order: number;
  image_url: string | null;
};

const BUCKET = "project-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function getStoragePath(imageUrl: string | null): string | null {
  if (!imageUrl) return null;

  const marker = `/${BUCKET}/`;
  const index = imageUrl.indexOf(marker);

  if (index === -1) return null;

  return imageUrl
    .slice(index + marker.length)
    .split("?")[0];
}

function EditExperienceForm() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadExperience() {
      const { data, error } = await supabase
        .from("experience")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        alert(`Failed to load experience: ${error.message}`);
        router.push("/admin/experience");
        return;
      }

      const experience = data as Experience;

      setCompany(experience.company || "");
      setRole(experience.role || "");
      setLocation(experience.location || "");
      setStartDate(experience.start_date || "");
      setEndDate(experience.end_date || "");
      setDescription(experience.description || "");
      setDisplayOrder(String(experience.display_order ?? 0));
      setImageUrl(experience.image_url || null);

      setLoading(false);
    }

    if (id) {
      loadExperience();
    }
  }, [id, router, supabase]);

  // Release temporary browser preview URLs when they change or the page closes.
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setUploadError("");

    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please select a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  }

  function handleRemoveImage() {
    setSelectedImage(null);
    setImagePreview(null);
    setRemoveImage(true);
    setUploadError("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!company.trim()) {
      alert("Company is required.");
      return;
    }

    if (!role.trim()) {
      alert("Role is required.");
      return;
    }

    setSaving(true);
    setUploadError("");

    let finalImageUrl = removeImage ? null : imageUrl;
    let newlyUploadedPath: string | null = null;

    // Upload the selected image only when saving the form.
    if (selectedImage) {
      const extensionByType: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };

      const extension = extensionByType[selectedImage.type];
      const storagePath = `experience/${id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, selectedImage, {
          contentType: selectedImage.type,
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        alert(`Image upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      newlyUploadedPath = storagePath;

      const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      finalImageUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("experience")
      .update({
        company: company.trim(),
        role: role.trim(),
        location: location.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
        description: description.trim() || null,
        display_order: Number(displayOrder) || 0,
        image_url: finalImageUrl,
      })
      .eq("id", id);

    if (error) {
      console.error(error);

      // Remove the newly uploaded file if the database update fails.
      if (newlyUploadedPath) {
        await supabase.storage
          .from(BUCKET)
          .remove([newlyUploadedPath]);
      }

      alert(`Failed to update experience: ${error.message}`);
      setSaving(false);
      return;
    }

    // The database now points to the new URL (or no image).
    // It is safe to remove the previously saved image.
    if (imageUrl && imageUrl !== finalImageUrl) {
      const oldPath = getStoragePath(imageUrl);

      if (oldPath) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET)
          .remove([oldPath]);

        if (cleanupError) {
          console.error("Old image cleanup failed:", cleanupError);
        }
      }
    }

    router.push("/admin/experience");
    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this experience?"
    );

    if (!confirmed) return;

    setDeleting(true);

    const { error } = await supabase
      .from("experience")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Failed to delete experience: ${error.message}`);
      setDeleting(false);
      return;
    }

    // Delete the associated image after the database record is deleted.
    const imagePath = getStoragePath(imageUrl);

    if (imagePath) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([imagePath]);

      if (storageError) {
        console.error("Image cleanup failed:", storageError);
      }
    }

    router.push("/admin/experience");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-600">Loading experience...</p>
        </div>
      </main>
    );
  }

  const displayedImage = imagePreview || (removeImage ? null : imageUrl);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/admin/experience"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to Experience
          </Link>

          <h1 className="mt-4 text-3xl font-bold">Edit Experience</h1>

          <p className="mt-1 text-gray-500">
            Update your professional experience.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-sm"
        >
          <div className="mb-6">
            <label
              htmlFor="company"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Company *
            </label>

            <input
              id="company"
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="role"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Role *
            </label>

            <input
              id="role"
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          {/* Company logo upload */}
          <div className="mb-6">
            <label
              htmlFor="experienceImage"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Company Logo / Experience Image
            </label>

            {displayedImage && (
              <div className="mb-4">
                <img
                  src={displayedImage}
                  alt="Company logo preview"
                  className="h-32 w-32 rounded-xl border border-gray-200 bg-white object-contain p-2"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {imagePreview
                    ? "Preview of the image you selected"
                    : "Current saved image"}
                </p>
              </div>
            )}

            <input
              id="experienceImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={saving || deleting}
              className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-medium hover:file:bg-gray-200"
            />

            <p className="mt-2 text-sm text-gray-500">
              JPG, PNG, or WebP. Maximum size: 5 MB.
            </p>

            {uploadError && (
              <p className="mt-2 text-sm text-red-600">
                {uploadError}
              </p>
            )}

            {displayedImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={saving || deleting}
                className="mt-3 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Remove Image
              </button>
            )}

            {removeImage && (
              <p className="mt-2 text-sm text-amber-700">
                The image will be removed when you save your changes.
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Location
            </label>

            <input
              id="location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Mumbai, India"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>

              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                End Date
              </label>

              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />

              <p className="mt-2 text-sm text-gray-500">
                Leave empty if this is your current position.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={8}
              placeholder="Describe your responsibilities and achievements..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-8">
            <label
              htmlFor="displayOrder"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Display Order
            </label>

            <input
              id="displayOrder"
              type="number"
              min="0"
              value={displayOrder}
              onChange={(event) => setDisplayOrder(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

            <p className="mt-2 text-sm text-gray-500">
              Lower numbers appear first.
            </p>
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="rounded-lg border border-red-200 px-6 py-3 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Experience"}
            </button>

            <div className="flex gap-3">
              <Link
                href="/admin/experience"
                className="rounded-lg border px-6 py-3 transition hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving || deleting}
                className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function EditExperiencePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-gray-600">Loading experience...</p>
          </div>
        </main>
      }
    >
      <EditExperienceForm />
    </Suspense>
  );
}