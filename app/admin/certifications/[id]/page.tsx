"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

function EditCertificationForm() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadCertification() {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        alert(
          `Failed to load certification: ${error.message}`
        );
        router.push("/admin/certifications");
        return;
      }

      const certification = data as Certification;

      setName(certification.name || "");
      setIssuer(certification.issuer || "");
      setIssueDate(certification.issue_date || "");
      setCredentialUrl(
        certification.credential_url || ""
      );
      setDescription(certification.description || "");
      setDisplayOrder(
        String(certification.display_order ?? 0)
      );

      setLoading(false);
    }

    if (id) {
      loadCertification();
    }
  }, [id]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      alert("Certification name is required.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("certifications")
      .update({
        name: name.trim(),
        issuer: issuer.trim() || null,
        issue_date: issueDate || null,
        credential_url: credentialUrl.trim() || null,
        description: description.trim() || null,
        display_order: Number(displayOrder) || 0,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(
        `Failed to update certification: ${error.message}`
      );
      setSaving(false);
      return;
    }

    router.push("/admin/certifications");
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this certification?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    const { error } = await supabase
      .from("certifications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(
        `Failed to delete certification: ${error.message}`
      );
      setDeleting(false);
      return;
    }

    router.push("/admin/certifications");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-600">
            Loading certification...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/admin/certifications"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to Certifications
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Edit Certification
          </h1>

          <p className="mt-1 text-gray-500">
            Update this certification.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-sm"
        >
          <div className="mb-6">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Certification Name *
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="issuer"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Issuing Organization
            </label>

            <input
              id="issuer"
              type="text"
              value={issuer}
              onChange={(event) =>
                setIssuer(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="issueDate"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Issue Date
            </label>

            <input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(event) =>
                setIssueDate(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="credentialUrl"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Credential URL
            </label>

            <input
              id="credentialUrl"
              type="url"
              value={credentialUrl}
              onChange={(event) =>
                setCredentialUrl(event.target.value)
              }
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-8">
            <label
              htmlFor="displayOrder"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Display Order
            </label>

            <input
              id="displayOrder"
              type="number"
              min="0"
              value={displayOrder}
              onChange={(event) =>
                setDisplayOrder(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="rounded-lg border border-red-200 px-6 py-3 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting
                ? "Deleting..."
                : "Delete Certification"}
            </button>

            <div className="flex gap-3">
              <Link
                href="/admin/certifications"
                className="rounded-lg border px-6 py-3 transition hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving || deleting}
                className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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

export default function EditCertificationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-gray-600">
              Loading certification...
            </p>
          </div>
        </main>
      }
    >
      <EditCertificationForm />
    </Suspense>
  );
}