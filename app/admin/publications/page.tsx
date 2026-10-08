"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Publication = {
  id: string;
  title: string;
  authors: string | null;
  venue: string | null;
  publication_date: string | null;
  abstract: string | null;
  paper_url: string | null;
  doi_url: string | null;
  github_url: string | null;
  display_order: number | null;
};

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  async function loadPublications() {
    setLoading(true);

    const { data, error } = await supabase
      .from("publications")
      .select("*")
      .order("display_order", { ascending: true })
      .order("publication_date", { ascending: false });

    if (error) {
      console.error("Error loading publications:", error);
      setLoading(false);
      return;
    }

    setPublications(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadPublications();
  }, []);

  async function deletePublication(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this publication?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("publications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting publication:", error);
      alert("Failed to delete publication.");
      return;
    }

    setPublications((current) =>
      current.filter((publication) => publication.id !== id)
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Publications
            </h1>

            <p className="mt-1 text-gray-600">
              Manage your research papers, publications, and technical work.
            </p>
          </div>

          <Link
            href="/admin/publications/new"
            className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800"
          >
            + Add Publication
          </Link>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
            Loading publications...
          </div>
        ) : publications.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              No publications yet
            </h2>

            <p className="mt-2 text-gray-500">
              Add your first publication to display it on your portfolio.
            </p>

            <Link
              href="/admin/publications/new"
              className="mt-6 inline-block rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              Add Publication
            </Link>
          </div>
        ) : (
          /* Publication list */
          <div className="space-y-4">
            {publications.map((publication) => (
              <div
                key={publication.id}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {publication.title}
                    </h2>

                    {publication.authors && (
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Authors:</span>{" "}
                        {publication.authors}
                      </p>
                    )}

                    {publication.venue && (
                      <p className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">Published in:</span>{" "}
                        {publication.venue}
                      </p>
                    )}

                    {publication.publication_date && (
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(
                          publication.publication_date
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}

                    {publication.abstract && (
                      <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-gray-600">
                        {publication.abstract}
                      </p>
                    )}

                    {/* Links */}
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      {publication.paper_url && (
                        <a
                          href={publication.paper_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          View Paper →
                        </a>
                      )}

                      {publication.doi_url && (
                        <a
                          href={publication.doi_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          DOI →
                        </a>
                      )}

                      {publication.github_url && (
                        <a
                          href={publication.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          GitHub →
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-3">
                    <Link
                      href={`/admin/publications/${publication.id}`}
                      className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => deletePublication(publication.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}