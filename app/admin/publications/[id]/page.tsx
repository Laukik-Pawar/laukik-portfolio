"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function EditPublicationForm() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [venue, setVenue] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [abstract, setAbstract] = useState("");
  const [paperUrl, setPaperUrl] = useState("");
  const [doiUrl, setDoiUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPublication() {
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading publication:", error);
        setError("Unable to load publication.");
        setLoading(false);
        return;
      }

      setTitle(data.title || "");
      setAuthors(data.authors || "");
      setVenue(data.venue || "");
      setPublicationDate(data.publication_date || "");
      setAbstract(data.abstract || "");
      setPaperUrl(data.paper_url || "");
      setDoiUrl(data.doi_url || "");
      setGithubUrl(data.github_url || "");
      setDisplayOrder(String(data.display_order ?? 0));

      setLoading(false);
    }

    loadPublication();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Publication title is required.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("publications")
      .update({
        title: title.trim(),
        authors: authors.trim() || null,
        venue: venue.trim() || null,
        publication_date: publicationDate || null,
        abstract: abstract.trim() || null,
        paper_url: paperUrl.trim() || null,
        doi_url: doiUrl.trim() || null,
        github_url: githubUrl.trim() || null,
        display_order: Number(displayOrder) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating publication:", error);
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/admin/publications");
    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this publication?"
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    const { error } = await supabase
      .from("publications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting publication:", error);
      setError(error.message);
      setDeleting(false);
      return;
    }

    router.push("/admin/publications");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="mx-auto max-w-4xl rounded-xl border bg-white p-8 text-center text-gray-500">
          Loading publication...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/admin/publications"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Back to Publications
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Edit Publication
          </h1>

          <p className="mt-1 text-gray-600">
            Update your publication information.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border bg-white p-6 shadow-sm md:p-8"
        >
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Publication Title *
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              required
            />
          </div>

          {/* Authors */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Authors
            </label>

            <input
              type="text"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="e.g. Laukik Pawar, John Doe, Jane Smith"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
            />

            <p className="mt-1 text-xs text-gray-500">
              Separate multiple authors with commas.
            </p>
          </div>

          {/* Venue */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Journal / Conference / Publication
            </label>

            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. IEEE Conference on Machine Learning"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Publication Date
            </label>

            <input
              type="date"
              value={publicationDate}
              onChange={(e) => setPublicationDate(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
            />
          </div>

          {/* Abstract */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Abstract / Description
            </label>

            <textarea
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              rows={7}
              className="w-full resize-y rounded-lg border px-4 py-3 outline-none focus:border-black"
            />
          </div>

          {/* Paper URL */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Paper URL
            </label>

            <input
              type="url"
              value={paperUrl}
              onChange={(e) => setPaperUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
            />
          </div>

          {/* DOI URL */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              DOI URL
            </label>

            <input
              type="url"
              value={doiUrl}
              onChange={(e) => setDoiUrl(e.target.value)}
              placeholder="https://doi.org/..."
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
            />
          </div>

          {/* GitHub URL */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              GitHub URL
            </label>

            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
            />
          </div>

          {/* Display order */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Display Order
            </label>

            <input
              type="number"
              min="0"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Publication"}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin/publications"
                className="rounded-lg border px-5 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving || deleting}
                className="rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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

export default function EditPublicationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 p-6 md:p-10">
          <div className="mx-auto max-w-4xl rounded-xl border bg-white p-8 text-center text-gray-500">
            Loading publication...
          </div>
        </main>
      }
    >
      <EditPublicationForm />
    </Suspense>
  );
}