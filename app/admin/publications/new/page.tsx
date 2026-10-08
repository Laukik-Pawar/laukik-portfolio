"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NewPublicationPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [venue, setVenue] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [abstract, setAbstract] = useState("");
  const [paperUrl, setPaperUrl] = useState("");
  const [doiUrl, setDoiUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Publication title is required.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("publications").insert({
      title: title.trim(),
      authors: authors.trim() || null,
      venue: venue.trim() || null,
      publication_date: publicationDate || null,
      abstract: abstract.trim() || null,
      paper_url: paperUrl.trim() || null,
      doi_url: doiUrl.trim() || null,
      github_url: githubUrl.trim() || null,
      display_order: Number(displayOrder) || 0,
    });

    if (error) {
      console.error("Error creating publication:", error);
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/admin/publications");
    router.refresh();
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
            Add Publication
          </h1>

          <p className="mt-1 text-gray-600">
            Add a research paper, conference publication, or technical paper.
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
              placeholder="e.g. An AI-Based Approach for Predictive Maintenance"
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
              placeholder="Briefly describe the research, methodology, and results..."
              rows={7}
              className="w-full resize-y rounded-lg border px-4 py-3 outline-none focus:border-black"
            />

            <p className="mt-1 text-xs text-gray-500">
              A concise summary is best for your public portfolio.
            </p>
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

          {/* DOI */}
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

          {/* GitHub */}
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
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              min="0"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
            />

            <p className="mt-1 text-xs text-gray-500">
              Lower numbers appear first.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/admin/publications"
              className="rounded-lg border px-5 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Publication"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}