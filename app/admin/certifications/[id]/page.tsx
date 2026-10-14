"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Certification = {
  id: string;
  name: string;
  issuer: string | null;
  issue_date: string | null;
  credential_url: string | null;
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

  return imageUrl.slice(index + marker.length).split("?")[0];
}

function EditCertificationForm() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
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
    async function loadCertification() {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        alert(`Failed to load certification: ${error.message}`);
        router.push("/admin/certifications");
        return;
      }

      const certification = data as Certification;

      setName(certification.name || "");
      setIssuer(certification.issuer || "");
      setIssueDate(certification.issue_date || "");
      setCredentialUrl(certification.credential_url || "");
      setDescription(certification.description || "");
      setDisplayOrder(String(certification.display_order ?? 0));
      setImageUrl(certification.image_url || null);

      setLoading(false);
    }

    if (id) loadCertification();
  }, [id, router, supabase]);

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

    if (!name.trim()) {
      alert("Certification name is required.");
      return;
    }

    setSaving(true);
    setUploadError("");

    let finalImageUrl = removeImage ? null : imageUrl;
    let newlyUploadedPath: string | null = null;

    if (selectedImage) {
      const extensionByType: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };

      const extension = extensionByType[selectedImage.type];
      const storagePath =
        `certifications/${id}/${crypto.randomUUID()}.${extension}`;

      const { error: storageUploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, selectedImage, {
          contentType: selectedImage.type,
          upsert: false,
        });

      if (storageUploadError) {
        console.error(storageUploadError);
        alert(`Image upload failed: ${storageUploadError.message}`);
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
      .from("certifications")
      .update({
        name: name.trim(),
        issuer: issuer.trim() || null,
        issue_date: issueDate || null,
        credential_url: credentialUrl.trim() || null,
        description: description.trim() || null,
        display_order: Number(displayOrder) || 0,
        image_url: finalImageUrl,
      })
      .eq("id", id);

    if (error) {
      console.error(error);

      if (newlyUploadedPath) {
        await supabase.storage
          .from(BUCKET)
          .remove([newlyUploadedPath]);
      }

      alert(`Failed to update certification: ${error.message}`);
      setSaving(false);
      return;
    }

    // Clean up the old image only after the database update succeeds.
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

    router.push("/admin/certifications");
    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this certification?"
    );

    if (!confirmed) return;

    setDeleting(true);

    const { error } = await supabase
      .from("certifications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Failed to delete certification: ${error.message}`);
      setDeleting(false);
      return;
    }

    const imagePath = getStoragePath(imageUrl);

    if (imagePath) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([imagePath]);

      if (storageError) {
        console.error("Image cleanup failed:", storageError);
      }
    }

    router.push("/admin/certifications");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-600">Loading certification...</p>
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
            href="/admin/certifications"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to Certifications
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Edit Certification
          </h1>

          <p className="mt-1 text-gray-500">
            Update this certification.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-sm"
        >
          <div className="mb-6">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Certification Name *
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          {/* Certification image upload */}
          <div className="mb-6">
            <label
              htmlFor="certificationImage"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Certificate Image / Badge
            </label>

            {displayedImage && (
              <div className="mb-4">
                <img
                  src={displayedImage}
                  alt="Certification image preview"
                  className="h-48 max-w-full rounded-xl border border-gray-200 bg-white object-contain p-2"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {imagePreview
                    ? "Preview of the image you selected"
                    : "Current saved image"}
                </p>
              </div>
            )}

            <input
              id="certificationImage"
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
              htmlFor="issuer"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Issuing Organization
            </label>

            <input
              id="issuer"
              type="text"
              value={issuer}
              onChange={(event) => setIssuer(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="issueDate"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Issue Date
            </label>

            <input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(event) => setIssueDate(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="credentialUrl"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Credential URL
            </label>

            <input
              id="credentialUrl"
              type="url"
              value={credentialUrl}
              onChange={(event) => setCredentialUrl(event.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
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
              rows={5}
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
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="rounded-lg border border-red-200 px-6 py-3 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Certification"}
            </button>

            <div className="flex gap-3">
              <Link
                href="/admin/certifications"
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

export default function EditCertificationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-gray-600">Loading certification...</p>
          </div>
        </main>
      }
    >
      <EditCertificationForm />
    </Suspense>
  );
}