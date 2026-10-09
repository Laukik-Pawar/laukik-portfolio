
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function EditProjectForm() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [currentImagePath, setCurrentImagePath] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProject() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (!active) return;

      if (error) {
        console.error(error);
        alert(`Failed to load project: ${error.message}`);
        router.push("/admin/projects");
        return;
      }

      setTitle(data.title || "");
      setDescription(data.description || "");
      setGithubUrl(data.github_url || "");
      setDemoUrl(data.demo_url || "");
      setTechnologies(data.technologies?.join(", ") || "");
      setFeatured(data.featured || false);
      setDisplayOrder(data.display_order ?? 0);
      setCurrentImageUrl(data.image_url || null);

      // Extract the Storage object path from this bucket's public URL.
      const publicMarker = "/storage/v1/object/public/project-images/";
      if (data.image_url?.includes(publicMarker)) {
        const pathAndQuery = data.image_url.split(publicMarker)[1];
        setCurrentImagePath(
          pathAndQuery ? decodeURIComponent(pathAndQuery.split("?")[0]) : null
        );
      }

      setLoading(false);
    }

    if (id) loadProject();

    return () => {
      active = false;
    };
  }, [id, router, supabase]);

  function handleImageChange(file: File | null) {
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Please select a JPG, PNG, or WebP image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setImageFile(null);
      setImagePreview("");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("The image must be 5 MB or smaller.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setImageFile(null);
      setImagePreview("");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  }

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);

    let newImagePath: string | null = null;
    let oldImageRemoved = false;

    try {
      let imageUrlToSave = removeImage ? null : currentImageUrl;
      let imagePathToSave = removeImage ? null : currentImagePath;

      // Upload a replacement image first. Keep the existing image until
      // the database update succeeds.
      if (imageFile) {
        const extension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
        newImagePath = `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("project-images")
          .upload(newImagePath, imageFile, {
            contentType: imageFile.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("project-images")
          .getPublicUrl(newImagePath);

        imageUrlToSave = publicUrlData.publicUrl;
        imagePathToSave = newImagePath;
      }

      const technologyList = technologies
        .split(",")
        .map((technology) => technology.trim())
        .filter(Boolean);

      const { error: updateError } = await supabase
        .from("projects")
        .update({
          title: title.trim(),
          description: description.trim(),
          github_url: githubUrl.trim() || null,
          demo_url: demoUrl.trim() || null,
          technologies: technologyList,
          featured,
          display_order: displayOrder,
          image_url: imageUrlToSave,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // Remove the previous Storage object only after the DB update succeeds.
      const shouldRemoveOldImage =
        currentImagePath &&
        currentImagePath !== imagePathToSave &&
        (removeImage || Boolean(imageFile));

      if (shouldRemoveOldImage) {
        const { error: removeError } = await supabase.storage
          .from("project-images")
          .remove([currentImagePath]);

        if (removeError) {
          console.error("Project updated, but old image cleanup failed:", removeError.message);
        } else {
          oldImageRemoved = true;
        }
      }

      router.push("/admin/projects");
      router.refresh();
    } catch (error) {
      // Clean up a newly uploaded object if the database update failed.
      if (newImagePath) {
        const { error: cleanupError } = await supabase.storage
          .from("project-images")
          .remove([newImagePath]);

        if (cleanupError) {
          console.error("Could not clean up new image:", cleanupError.message);
        }
      }

      const message =
        error instanceof Error ? error.message : "An unexpected error occurred.";

      alert(`Failed to update project: ${message}`);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-gray-600">Loading project...</p>
        </div>
      </main>
    );
  }

  const visibleImage = imagePreview || (!removeImage ? currentImageUrl : null);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/admin/projects")}
            className="mb-4 text-sm text-gray-500 hover:text-black"
          >
            ← Back to Projects
          </button>

          <h1 className="text-3xl font-bold">Edit Project</h1>
          <p className="mt-1 text-gray-500">Update your portfolio project</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-8 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              placeholder="My Awesome Project"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              placeholder="Describe your project..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Project Image
            </label>
            {visibleImage && (
              <div className="mb-3">
                <img
                  src={visibleImage}
                  alt="Project image preview"
                  className="max-h-64 w-full rounded-xl border object-cover"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {imagePreview
                    ? "New image selected"
                    : "Current project image"}
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                handleImageChange(event.target.files?.[0] ?? null)
              }
              className="w-full rounded-lg border border-gray-300 p-3"
            />

            <p className="mt-1 text-sm text-gray-500">
              Optional. JPG, PNG, or WebP; maximum 5 MB.
            </p>

            {(currentImageUrl || imageFile) && !removeImage && (
              <button
                type="button"
                onClick={() => {
                  if (imagePreview) URL.revokeObjectURL(imagePreview);
                  setImagePreview("");
                  setImageFile(null);
                  setRemoveImage(true);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Remove image when saving
              </button>
            )}

            {removeImage && (
              <div className="mt-3">
                <p className="text-sm text-amber-700">
                  The image will be removed when you save.
                </p>
                <button
                  type="button"
                  onClick={() => setRemoveImage(false)}
                  className="mt-1 text-sm underline"
                >
                  Undo removal
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              GitHub URL
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(event) => setGithubUrl(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              placeholder="https://github.com/username/project"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Live Demo URL
            </label>
            <input
              type="url"
              value={demoUrl}
              onChange={(event) => setDemoUrl(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Technologies
            </label>
            <input
              type="text"
              value={technologies}
              onChange={(event) => setTechnologies(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              placeholder="Python, FastAPI, PostgreSQL, AWS"
            />
            <p className="mt-2 text-sm text-gray-500">
              Separate technologies with commas.
            </p>
          </div>

          <div>
            <label htmlFor="display_order" className="mb-2 block font-medium">
              Display Order
            </label>
            <input
              id="display_order"
              type="number"
              min="0"
              value={displayOrder}
              onChange={(event) => setDisplayOrder(Number(event.target.value))}
              className="w-full rounded-lg border p-3"
            />
            <p className="mt-1 text-sm text-gray-500">
              Lower numbers appear first. For example: 1, 2, 3.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="featured"
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700">
              Feature this project on my portfolio
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => router.push("/admin/projects")}
              className="rounded-lg border px-6 py-3 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function EditProjectPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-gray-600">Loading project...</p>
          </div>
        </main>
      }
    >
      <EditProjectForm />
    </Suspense>
  );
}
