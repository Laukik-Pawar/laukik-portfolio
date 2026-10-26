
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type Activity = {
  id: string;
  title: string;
  organization: string | null;
  role: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  activity_url: string | null;
  display_order: number;
};

type Props = {
  activity?: Activity;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function ActivityForm({ activity }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(activity?.title ?? "");
  const [organization, setOrganization] = useState(
    activity?.organization ?? ""
  );
  const [role, setRole] = useState(activity?.role ?? "");
  const [description, setDescription] = useState(
    activity?.description ?? ""
  );
  const [startDate, setStartDate] = useState(
    activity?.start_date ?? ""
  );
  const [endDate, setEndDate] = useState(
    activity?.end_date ?? ""
  );
  const [activityUrl, setActivityUrl] = useState(
    activity?.activity_url ?? ""
  );
  const [displayOrder, setDisplayOrder] = useState(
    String(activity?.display_order ?? 0)
  );
  const [imageUrl, setImageUrl] = useState(
    activity?.image_url ?? ""
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const editing = Boolean(activity);

  useEffect(() => {
    if (!imageFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  function selectImage(file: File | null) {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Select a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMessage("Image must be 5 MB or smaller.");
      return;
    }

    setErrorMessage("");
    setImageFile(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Activity title is required.");
      return;
    }

    if (startDate && endDate && endDate < startDate) {
      setErrorMessage("End date cannot be before start date.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in to your admin account.");
      }

      let finalImageUrl: string | null = imageUrl || null;
      let uploadedPath: string | null = null;

      if (imageFile) {
        const extension =
          imageFile.type === "image/png"
            ? "png"
            : imageFile.type === "image/webp"
            ? "webp"
            : "jpg";

        const path = `extracurricular/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("project-images")
          .upload(path, imageFile, {
            contentType: imageFile.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        uploadedPath = path;

        const { data } = supabase.storage
          .from("project-images")
          .getPublicUrl(path);

        finalImageUrl = data.publicUrl;
      }

      const payload = {
        title: title.trim(),
        organization: organization.trim() || null,
        role: role.trim() || null,
        description: description.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
        activity_url: activityUrl.trim() || null,
        image_url: finalImageUrl,
        display_order: Number(displayOrder) || 0,
      };

      const result = activity
        ? await supabase
            .from("extracurricular_activities")
            .update(payload)
            .eq("id", activity.id)
            .select("id")
            .single()
        : await supabase
            .from("extracurricular_activities")
            .insert(payload)
            .select("id")
            .single();

      if (result.error) {
        // Newly uploaded files may remain if database saving fails.
        // We do not grant broad storage deletion permissions.
        if (uploadedPath) {
          console.warn("Unused uploaded image:", uploadedPath);
        }
        throw result.error;
      }

      router.push("/admin/extracurricular");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred."
      );
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium">
          Activity Title *
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Graduate Consulting Club"
          className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-600 focus:outline-none"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="organization" className="mb-2 block text-sm font-medium">
            Organization
          </label>
          <input
            id="organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Stevens Institute of Technology"
            className="w-full rounded-lg border border-gray-300 p-3"
          />
        </div>

        <div>
          <label htmlFor="role" className="mb-2 block text-sm font-medium">
            Your Role
          </label>
          <input
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Treasurer"
            className="w-full rounded-lg border border-gray-300 p-3"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="mb-2 block text-sm font-medium">
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="mb-2 block text-sm font-medium">
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3"
          />
          <p className="mt-2 text-xs text-gray-500">
            Leave blank for an ongoing activity.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Responsibilities, initiatives, and achievements..."
          className="w-full rounded-lg border border-gray-300 p-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Activity Image
        </label>

        {(preview || imageUrl) && (
          <div className="relative mb-4 h-48 w-full max-w-sm overflow-hidden rounded-xl border bg-gray-50">
            <Image
              src={preview || imageUrl}
              alt="Activity image preview"
              fill
              unoptimized
              sizes="384px"
              className="object-contain p-3"
            />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) =>
            selectImage(e.target.files?.[0] ?? null)
          }
          className="block w-full rounded-lg border border-gray-300 p-3 text-sm"
        />

        <p className="mt-2 text-xs text-gray-500">
          JPG, PNG, or WebP. Maximum 5 MB.
        </p>

        {(imageFile || imageUrl) && (
          <button
            type="button"
            onClick={() => {
              setImageFile(null);
              setPreview("");
              setImageUrl("");
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="mt-3 text-sm font-medium text-red-600 hover:underline"
          >
            Remove image from activity
          </button>
        )}
      </div>

      <div>
        <label htmlFor="activityUrl" className="mb-2 block text-sm font-medium">
          Related Link
        </label>
        <input
          id="activityUrl"
          type="url"
          value={activityUrl}
          onChange={(e) => setActivityUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-gray-300 p-3"
        />
      </div>

      <div>
        <label htmlFor="displayOrder" className="mb-2 block text-sm font-medium">
          Display Order
        </label>
        <input
          id="displayOrder"
          type="number"
          min="0"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-3"
        />
        <p className="mt-2 text-xs text-gray-500">
          Lower numbers appear first.
        </p>
      </div>

      {errorMessage && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t pt-6">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-700 px-6 py-3 font-medium text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : editing
            ? "Save Changes"
            : "Add Activity"}
        </button>

        <Link
          href="/admin/extracurricular"
          className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
