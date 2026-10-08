"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Project = {
  id: string;
  title: string;
  description: string | null;
  github_url: string | null;
  demo_url: string | null;
  technologies: string[] | null;
  featured: boolean;
};

export default function ProjectsPage() {
  const supabase = createClient();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadProjects() {
    setLoading(true);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error(error);
      alert(`Failed to load projects: ${error.message}`);
      setLoading(false);
      return;
    }

    setProjects(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function deleteProject(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Failed to delete project: ${error.message}`);
      setDeletingId(null);
      return;
    }

    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== id)
    );

    setDeletingId(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Projects
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your portfolio projects
            </p>
          </div>

          <Link
            href="/admin/projects/new"
            className="rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800"
          >
            + Add Project
          </Link>
        </div>

        {/* Empty State */}
        {projects.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              No projects yet
            </h2>

            <p className="mt-2 text-gray-500">
              Add your first project to your portfolio.
            </p>

            <Link
              href="/admin/projects/new"
              className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800"
            >
              + Add Your First Project
            </Link>
          </div>
        ) : (
          /* Project Cards */
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                {/* Title + Featured */}
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold">
                    {project.title}
                  </h2>

                  {project.featured && (
                    <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      Featured
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="mt-3 text-gray-600">
                  {project.description || "No description added."}
                </p>

                {/* Technologies */}
                {project.technologies &&
                  project.technologies.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.technologies.map((technology) => (
                        <span
                          key={technology}
                          className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                        >
                          {technology}
                        </span>
                      ))}
                    </div>
                  )}

                {/* Links */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border px-4 py-2 text-sm transition hover:bg-gray-50"
                    >
                      GitHub
                    </a>
                  )}

                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border px-4 py-2 text-sm transition hover:bg-gray-50"
                    >
                      Live Demo
                    </a>
                  )}
                </div>

                {/* Edit + Delete */}
                <div className="mt-6 flex gap-3 border-t pt-4">
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="rounded-lg border px-4 py-2 transition hover:bg-gray-50"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => deleteProject(project.id)}
                    disabled={deletingId === project.id}
                    className="rounded-lg border border-red-200 px-4 py-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === project.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}