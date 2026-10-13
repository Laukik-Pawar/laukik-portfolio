
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NewEducationPage() {
  const supabase = createClient();
  const router = useRouter();

  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [field, setField] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!institution.trim()) {
      alert("Institution is required.");
      return;
    }

    setSaving(true);

    let uploadedImagePath: string | null = null;
    let imageUrl: string | null = null;

    try {
      // Upload the optional image first.
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
          .from("project-images")
          .upload(uploadedImagePath, imageFile, {
            contentType: imageFile.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data } = supabase.storage
          .from("project-images")
          .getPublicUrl(uploadedImagePath);

        imageUrl = data.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("education")
        .insert({
          institution: institution.trim(),
          degree: degree.trim() || null,
          field: field.trim() || null,
          start_date: startDate || null,
          end_date: endDate || null,
          description: description.trim() || null,
          display_order: Number(displayOrder) || 0,
          image_url: imageUrl,
        });

      if (insertError) {
        // Remove the uploaded image if the database insert fails.
        if (uploadedImagePath) {
          const { error: cleanupError } = await supabase.storage
            .from("project-images")
            .remove([uploadedImagePath]);

          if (cleanupError) {
            console.error("Image cleanup failed:", cleanupError);
          }
        }

        throw new Error(
          `Failed to create education: ${insertError.message}`
        );
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

          <h1 className="mt-4 text-3xl font-bold">
            Add Education
          </h1>

          <p className="mt-1 text-gray-500">
            Add an academic qualification to your portfolio.
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
              placeholder="Stevens Institute of Technology"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="educationImage"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Institution Logo or Image
            </label>

            <input
              id="educationImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-medium"
            />

            <p className="mt-2 text-sm text-gray-500">
              Optional. JPG, PNG, or WebP; maximum 5 MB.
            </p>

            {imagePreview && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Image Preview
                </p>

                <img
                  src={imagePreview}
                  alt="Education image preview"
                  className="h-40 w-40 rounded-xl border border-gray-200 bg-white object-contain p-2"
                />

                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                    const input = document.getElementById(
                      "educationImage"
                    ) as HTMLInputElement | null;

                    if (input) input.value = "";
                  }}
                  className="mt-2 block text-sm text-red-600 hover:text-red-800"
                >
                  Remove selected image
                </button>
              </div>
            )}
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
              placeholder="Master of Science"
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
              placeholder="Computer Science"
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
              placeholder="GPA, coursework, achievements, activities, etc."
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

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Education"}
            </button>

            <Link
              href="/admin/education"
              className="rounded-lg border px-6 py-3 transition hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
