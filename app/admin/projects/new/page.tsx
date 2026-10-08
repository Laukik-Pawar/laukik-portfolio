"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);

    const technologyList = technologies
      .split(",")
      .map((technology) => technology.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from("projects")
.insert({
  title,
  description,
  github_url: githubUrl || null,
  demo_url: demoUrl || null,
  technologies: technologyList,
  featured,
  display_order: displayOrder,
});

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/projects");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl">

        <h1 className="mb-8 text-3xl font-bold">
          Add Project
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-8 shadow-sm"
        >

          <div>
            <label className="mb-2 block font-medium">
              Project Name
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="OmniStream AI"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-32 w-full rounded-lg border p-3"
              placeholder="Describe what the project does..."
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Technologies
            </label>

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
            <label className="mb-2 block font-medium">
              GitHub URL
            </label>

            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="https://github.com/..."
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Demo URL
            </label>

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

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border px-5 py-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-5 py-3 text-white"
            >
              {loading ? "Saving..." : "Save Project"}
            </button>
          </div>

        </form>

      </div>
    </main>
  );
}