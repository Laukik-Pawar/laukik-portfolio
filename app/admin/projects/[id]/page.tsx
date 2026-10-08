"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function EditProjectForm() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [featured, setFeatured] = useState(false);

  const [loading, setLoading] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProject() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

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

      setLoading(false);
    }

    if (id) {
      loadProject();
    }
  }, [id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);

    const technologyList = technologies
      .split(",")
      .map((technology) => technology.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from("projects")
      .update({
        title,
        description,
        github_url: githubUrl || null,
        demo_url: demoUrl || null,
        technologies: technologyList,
        featured,
        display_order: displayOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Failed to update project: ${error.message}`);
      setSaving(false);
      return;
    }

    router.push("/admin/projects");
    router.refresh();
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

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/admin/projects")}
            className="mb-4 text-sm text-gray-500 hover:text-black"
          >
            ← Back to Projects
          </button>

          <h1 className="text-3xl font-bold">
            Edit Project
          </h1>

          <p className="mt-1 text-gray-500">
            Update your portfolio project
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-sm"
        >
          {/* Title */}
          <div className="mb-6">
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

          {/* Description */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              placeholder="Describe your project..."
            />
          </div>

          {/* GitHub */}
          <div className="mb-6">
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

          {/* Demo */}
          <div className="mb-6">
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

          {/* Technologies */}
          <div className="mb-6">
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

          {/* Featured */}
          <div className="mb-8 flex items-center gap-3">
            <input
              id="featured"
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
              className="h-4 w-4"
            />

            <label
              htmlFor="featured"
              className="text-sm font-medium text-gray-700"
            >
              Feature this project on my portfolio
            </label>
          </div>

          
<div>
  <label
    htmlFor="display_order"
    className="mb-2 block font-medium"
  >
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


          {/* Buttons */}
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
              onClick={() => router.push("/admin/projects")}
              className="rounded-lg border px-6 py-3 transition hover:bg-gray-50"
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
            <p className="text-gray-600">
              Loading project...
            </p>
          </div>
        </main>
      }
    >
      <EditProjectForm />
    </Suspense>
  );
}