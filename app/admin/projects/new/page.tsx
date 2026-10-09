
"use client";

import { FormEvent, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function NewProjectPage() {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  function handleImageChange(file: File | null) {
    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Please select a JPG, PNG, or WebP image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("The image must be 5 MB or smaller.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);

    let uploadedImageUrl: string | null = null;
    let uploadedImagePath: string | null = null;

    try {
      // Upload the image first, if one was selected.
      if (imageFile) {
        const extension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const imagePath = `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("project-images")
          .upload(imagePath, imageFile, {
            contentType: imageFile.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        uploadedImagePath = imagePath;

        const { data: publicUrlData } = supabase.storage
          .from("project-images")
          .getPublicUrl(imagePath);

        uploadedImageUrl = publicUrlData.publicUrl;
      }

      const technologyList = technologies
        .split(",")
        .map((technology) => technology.trim())
        .filter(Boolean);

      const { error: insertError } = await supabase
        .from("projects")
        .insert({
          title: title.trim(),
          description: description.trim(),
          github_url: githubUrl.trim() || null,
          demo_url: demoUrl.trim() || null,
          technologies: technologyList,
          featured,
          display_order: displayOrder,
          image_url: uploadedImageUrl,
        });

      if (insertError) throw insertError;

      router.push("/admin/projects");
      router.refresh();
    } catch (error) {
      // Avoid leaving an orphaned image if saving the project fails.
      if (uploadedImagePath) {
        const { error: cleanupError } = await supabase.storage
          .from("project-images")
          .remove([uploadedImagePath]);

        if (cleanupError) {
          console.error("Could not clean up uploaded image:", cleanupError.message);
        }
      }

      const message =
        error instanceof Error ? error.message : "An unexpected error occurred.";

      alert(`Could not save project: ${message}`);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold">Add Project</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-8 shadow-sm"
        >
          <div>
            <label className="mb-2 block font-medium">Project Name</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="OmniStream AI"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-32 w-full rounded-lg border p-3"
              placeholder="Describe what the project does..."
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Project Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) =>
                handleImageChange(e.target.files?.[0] ?? null)
              }
              className="w-full rounded-lg border p-3"
            />
            <p className="mt-1 text-sm text-gray-500">
              Optional. JPG, PNG, or WebP; maximum 5 MB.
            </p>

            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Selected project preview"
                  className="max-h-64 w-full rounded-xl border object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(imagePreview);
                    handleImageChange(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="mt-2 text-sm text-red-600 hover:underline"
                >
                  Remove selected image
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block font-medium">Technologies</label>
            <input
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="Python, Flask, PostgreSQL, AWS"
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate technologies with commas.
            </p>
          </div>

          <div>
            <label className="mb-2 block font-medium">GitHub URL</label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="https://github.com/..."
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Demo URL</label>
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="https://..."
            />
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4"
            />
            <span>Featured project</span>
          </label>

          <div>
            <label htmlFor="display_order" className="mb-2 block font-medium">
              Display Order
            </label>
            <input
              id="display_order"
              type="number"
              min="0"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="w-full rounded-lg border p-3"
            />
            <p className="mt-1 text-sm text-gray-500">
              Lower numbers appear first. For example: 1, 2, 3.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="rounded-lg border px-5 py-3 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
            >
              {loading ? "Uploading and saving..." : "Save Project"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
