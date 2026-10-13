"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Education = {
  id: string;
  institution: string;
  degree: string | null;
  field: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  display_order: number;
  image_url: string | null;
};

const BUCKET = "project-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function getStoragePath(publicUrl: string): string | null {
  try {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const index = publicUrl.indexOf(marker);

    if (index === -1) return null;

    return decodeURIComponent(
      publicUrl.slice(index + marker.length).split("?")[0]
    );
  } catch {
    return null;
  }
}

function EditEducationForm() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [field, setField] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    async function loadEducation() {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        alert(`Failed to load education: ${error.message}`);
        router.push("/admin/education");
        return;
      }

      const education = data as Education;

      setInstitution(education.institution || "");
      setDegree(education.degree || "");
      setField(education.field || "");
      setStartDate(education.start_date || "");
      setEndDate(education.end_date || "");
      setDescription(education.description || "");
      setDisplayOrder(String(education.display_order ?? 0));
      setCurrentImageUrl(education.image_url || null);
      setLoading(false);
    }

    if (id) {
      loadEducation();
    }
  }, [id]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveCurrentImage(false);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
    setRemoveCurrentImage(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleCancelImageChange() {
    setImageFile(null);
    setImagePreview(null);
    setRemoveCurrentImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!institution.trim()) {
      alert("Institution is required.");
      return;
    }

    setSaving(true);

    let uploadedImagePath: string | null = null;
    let newImageUrl = currentImageUrl;

    try {
      // Upload a replacement image if one was selected.
      if (imageFile) {
        const extension = imageFile.name.split(".").pop()?.toLowerCase();

        const safeExtension =
          extension && ["jpg", "jpeg", "png", "webp"].includes(extension)
            ? extension
            : imageFile.type === "image/png"
              ? "png"
              : imageFile.type === "image/webp"
                ? "webp"
                : "jpg";

        uploadedImagePath = `education/${crypto.randomUUID()}.${safeExtension}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(uploadedImagePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(uploadedImagePath);

        newImageUrl = publicUrlData.publicUrl;
      } else if (removeCurrentImage) {
        newImageUrl = null;
      }

      // Update the education record.
      const { error: updateError } = await supabase
        .from("education")
        .update({
          institution: institution.trim(),
          degree: degree.trim() || null,
          field: field.trim() || null,
          start_date: startDate || null,
          end_date: endDate || null,
          description: description.trim() || null,
          display_order: Number(displayOrder) || 0,
          image_url: newImageUrl,
        })
        .eq("id", id);

      if (updateError) {
        // Clean up the new upload if the database update fails.
        if (uploadedImagePath) {
          await supabase.storage
            .from(BUCKET)
            .remove([uploadedImagePath]);
        }

        throw new Error(`Failed to update education: ${updateError.message}`);
      }

      // Delete the previous image only after the database update succeeds.
      const imageChanged = imageFile !== null || removeCurrentImage;

      if (imageChanged && currentImageUrl) {
        const oldImagePath = getStoragePath(currentImageUrl);

        if (oldImagePath && oldImagePath !== uploadedImagePath) {
          const { error: removeError } = await supabase.storage
            .from(BUCKET)
            .remove([oldImagePath]);

          if (removeError) {
            console.error("Could not remove old image:", removeError.message);
          }
        }
      }

      router.push("/admin/education");
      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving education."
      );

      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this education entry?"
    );

    if (!confirmed) return;

    setDeleting(true);

    const { error } = await supabase
      .from("education")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Failed to delete education: ${error.message}`);
      setDeleting(false);
      return;
    }

    // Remove its image from Storage when possible.
    if (currentImageUrl) {
      const imagePath = getStoragePath(currentImageUrl);

      if (imagePath) {
        const { error: imageError } = await supabase.storage
          .from(BUCKET)
          .remove([imagePath]);

        if (imageError) {
          console.error("Could not remove education image:", imageError.message);
        }
      }
    }

    router.push("/admin/education");
    router.refresh();
  }

  const displayedImage = imageFile
    ? imagePreview
    : removeCurrentImage
      ? null
      : currentImageUrl;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-600">Loading education...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/admin/education"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to Education
          </Link>

          <h1 className="mt-4 text-3xl font-bold">Edit Education</h1>

          <p className="mt-1 text-gray-500">
            Update your academic background.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-sm"
        >
          <div className="mb-6">
            <label
              htmlFor="institution"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Institution *
            </label>
            <input
              id="institution"
              type="text"
              value={institution}
              onChange={(event) => setInstitution(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="degree"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Degree
            </label>
            <input
              id="degree"
              type="text"
              value={degree}
              onChange={(event) => setDegree(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="field"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Field of Study
            </label>
            <input
              id="field"
              type="text"
              value={field}
              onChange={(event) => setField(event.target.value)}
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
              rows={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          {/* Education image */}
          <div className="mb-8">
            <label
              htmlFor="educationImage"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Institution Image or Logo
            </label>

            {displayedImage ? (
              <div className="mb-4">
                <img
                  src={displayedImage}
                  alt="Education image preview"
                  className="h-48 w-full rounded-xl border border-gray-200 bg-gray-50 object-contain p-3"
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={saving || deleting}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Remove Image
                  </button>

                  {imageFile && (
                    <button
                      type="button"
                      onClick={handleCancelImageChange}
                      disabled={saving || deleting}
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel Replacement
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="mb-3 text-sm text-gray-500">
                No image selected. You can upload an institution logo or campus
                photo.
              </p>
            )}

            <input
              ref={fileInputRef}
              id="educationImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={saving || deleting}
              className="block w-full rounded-lg border border-gray-300 p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2"
            />

            <p className="mt-2 text-xs text-gray-500">
              Accepted formats: JPG, PNG, WebP. Maximum size: 5 MB.
            </p>
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
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="rounded-lg border border-red-200 px-6 py-3 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Education"}
            </button>

            <div className="flex gap-3">
              <Link
                href="/admin/education"
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

export default function EditEducationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-gray-600">Loading education...</p>
          </div>
        </main>
      }
    >
      <EditEducationForm />
    </Suspense>
  );
}