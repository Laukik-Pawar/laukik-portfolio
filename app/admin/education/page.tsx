"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Education = {
  id: string;
  institution: string;
  degree: string | null;
  field: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  display_order: number;
};

export default function EducationPage() {
  const supabase = createClient();

  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadEducation() {
    setLoading(true);

    const { data, error } = await supabase
      .from("education")
      .select("*")
      .order("display_order", { ascending: true })
      .order("start_date", { ascending: false });

    if (error) {
      console.error(error);
      alert(`Failed to load education: ${error.message}`);
      setLoading(false);
      return;
    }

    setEducation(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadEducation();
  }, []);

  async function deleteEducation(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this education entry?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    const { error } = await supabase
      .from("education")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Failed to delete education: ${error.message}`);
      setDeletingId(null);
      return;
    }

    setEducation((current) =>
      current.filter((item) => item.id !== id)
    );

    setDeletingId(null);
  }

  function formatDate(date: string | null) {
    if (!date) {
      return "";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        month: "short",
        year: "numeric",
      }
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-600">
            Loading education...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Education
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your academic background
            </p>
          </div>

          <Link
            href="/admin/education/new"
            className="rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800"
          >
            + Add Education
          </Link>
        </div>

        {education.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              No education yet
            </h2>

            <p className="mt-2 text-gray-500">
              Add your first academic qualification.
            </p>

            <Link
              href="/admin/education/new"
              className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800"
            >
              + Add Your First Education
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {education.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {item.institution}
                    </h2>

                    {(item.degree || item.field) && (
                      <p className="mt-2 text-lg text-gray-700">
                        {item.degree}
                        {item.degree && item.field
                          ? " in "
                          : ""}
                        {item.field}
                      </p>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 md:text-right">
                    <p>
                      {formatDate(item.start_date)}
                      {" — "}
                      {item.end_date
                        ? formatDate(item.end_date)
                        : "Present"}
                    </p>
                  </div>
                </div>

                {item.description && (
                  <p className="mt-5 whitespace-pre-line leading-7 text-gray-600">
                    {item.description}
                  </p>
                )}

                <div className="mt-6 flex gap-3 border-t pt-4">
                  <Link
                    href={`/admin/education/${item.id}`}
                    className="rounded-lg border px-4 py-2 transition hover:bg-gray-50"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() =>
                      deleteEducation(item.id)
                    }
                    disabled={deletingId === item.id}
                    className="rounded-lg border border-red-200 px-4 py-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === item.id
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