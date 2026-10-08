"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NewCertificationPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const [saving, setSaving] = useState(false);

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
      .insert({
        name: name.trim(),
        issuer: issuer.trim() || null,
        issue_date: issueDate || null,
        credential_url: credentialUrl.trim() || null,
        description: description.trim() || null,
        display_order: Number(displayOrder) || 0,
      });

    if (error) {
      console.error(error);
      alert(
        `Failed to create certification: ${error.message}`
      );
      setSaving(false);
      return;
    }

    router.push("/admin/certifications");
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
            Add Certification
          </h1>

          <p className="mt-1 text-gray-500">
            Add a professional certification.
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
              placeholder="AWS Certified Cloud Practitioner"
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
              placeholder="Amazon Web Services"
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

            <p className="mt-2 text-sm text-gray-500">
              Link to your verification or certificate page.
            </p>
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
              placeholder="Optional details about the certification..."
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

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Certification"}
            </button>

            <Link
              href="/admin/certifications"
              className="rounded-lg border px-6 py-3 transition hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}