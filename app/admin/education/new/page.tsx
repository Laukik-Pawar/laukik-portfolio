"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NewEducationPage() {
  const supabase = createClient();
  const router = useRouter();

  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [field, setField] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const [saving, setSaving] = useState(false);

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
      .insert({
        institution: institution.trim(),
        degree: degree.trim() || null,
        field: field.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
        description: description.trim() || null,
        display_order: Number(displayOrder) || 0,
      });

    if (error) {
      console.error(error);
      alert(`Failed to create education: ${error.message}`);
      setSaving(false);
      return;
    }

    router.push("/admin/education");
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
            Add Education
          </h1>

          <p className="mt-1 text-gray-500">
            Add an academic qualification to your portfolio.
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
              placeholder="Stevens Institute of Technology"
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
              placeholder="Master of Science"
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
              placeholder="Computer Science"
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
              placeholder="GPA, coursework, achievements, activities, etc."
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

            <p className="mt-2 text-sm text-gray-500">
              Lower numbers appear first.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Education"}
            </button>

            <Link
              href="/admin/education"
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