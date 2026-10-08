"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Certification = {
  id: string;
  name: string;
  issuer: string | null;
  issue_date: string | null;
  credential_url: string | null;
  description: string | null;
  display_order: number;
};

export default function CertificationsPage() {
  const supabase = createClient();

  const [certifications, setCertifications] = useState<
    Certification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  async function loadCertifications() {
    setLoading(true);

    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .order("display_order", { ascending: true })
      .order("issue_date", { ascending: false });

    if (error) {
      console.error(error);
      alert(
        `Failed to load certifications: ${error.message}`
      );
      setLoading(false);
      return;
    }

    setCertifications(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadCertifications();
  }, []);

  async function deleteCertification(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this certification?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    const { error } = await supabase
      .from("certifications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(
        `Failed to delete certification: ${error.message}`
      );
      setDeletingId(null);
      return;
    }

    setCertifications((current) =>
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
            Loading certifications...
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
              Certifications
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your professional certifications
            </p>
          </div>

          <Link
            href="/admin/certifications/new"
            className="rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800"
          >
            + Add Certification
          </Link>
        </div>

        {certifications.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              No certifications yet
            </h2>

            <p className="mt-2 text-gray-500">
              Add your first certification.
            </p>

            <Link
              href="/admin/certifications/new"
              className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800"
            >
              + Add Your First Certification
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {certifications.map((certification) => (
              <div
                key={certification.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold">
                  {certification.name}
                </h2>

                {certification.issuer && (
                  <p className="mt-2 text-gray-700">
                    {certification.issuer}
                  </p>
                )}

                {certification.issue_date && (
                  <p className="mt-1 text-sm text-gray-500">
                    Issued {formatDate(certification.issue_date)}
                  </p>
                )}

                {certification.description && (
                  <p className="mt-4 whitespace-pre-line leading-7 text-gray-600">
                    {certification.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  {certification.credential_url && (
                    <a
                      href={certification.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border px-4 py-2 text-sm transition hover:bg-gray-50"
                    >
                      View Credential
                    </a>
                  )}
                </div>

                <div className="mt-6 flex gap-3 border-t pt-4">
                  <Link
                    href={`/admin/certifications/${certification.id}`}
                    className="rounded-lg border px-4 py-2 transition hover:bg-gray-50"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() =>
                      deleteCertification(certification.id)
                    }
                    disabled={
                      deletingId === certification.id
                    }
                    className="rounded-lg border border-red-200 px-4 py-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === certification.id
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