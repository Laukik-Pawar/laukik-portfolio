"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

function EditEducationForm() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [field, setField] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadEducation() {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        alert(`Failed to load education: ${error.message}`);
        router.push("/admin/education");
        return;
      }

      const education = data as Education;

      setInstitution(education.institution || "");
      setDegree(education.degree || "");
      setField(education.field || "");
      setStartDate(education.start_date || "");
      setEndDate(education.end_date || "");
      setDescription(education.description || "");
      setDisplayOrder(
        String(education.display_order ?? 0)
      );

      setLoading(false);
    }

    if (id) {
      loadEducation();
    }
  }, [id]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!institution.trim()) {
      alert("Institution is required.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("education")
      .update({
        institution: institution.trim(),
        degree: degree.trim() || null,
        field: field.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
        description: description.trim() || null,
        display_order: Number(displayOrder) || 0,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Failed to update education: ${error.message}`);
      setSaving(false);
      return;
    }

    router.push("/admin/education");
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this education entry?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    const { error } = await supabase
      .from("education")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Failed to delete education: ${error.message}`);
      setDeleting(false);
      return;
    }

    router.push("/admin/education");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-600">
            Loading education...
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
            href="/admin/education"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to Education
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Edit Education
          </h1>

          <p className="mt-1 text-gray-500">
            Update your academic background.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-sm"
        >
          <div className="mb-6">
            <label
              htmlFor="institution"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Institution *
            </label>

            <input
              id="institution"
              type="text"
              value={institution}
              onChange={(event) =>
                setInstitution(event.target.value)
              }
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="degree"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Degree
            </label>

            <input
              id="degree"
              type="text"
              value={degree}
              onChange={(event) =>
                setDegree(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="field"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Field of Study
            </label>

            <input
              id="field"
              type="text"
              value={field}
              onChange={(event) =>
                setField(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>

              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                End Date
              </label>

              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>
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
              rows={6}
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
                : "Delete Education"}
            </button>

            <div className="flex gap-3">
              <Link
                href="/admin/education"
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

export default function EditEducationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-gray-600">
              Loading education...
            </p>
          </div>
        </main>
      }
    >
      <EditEducationForm />
    </Suspense>
  );
}