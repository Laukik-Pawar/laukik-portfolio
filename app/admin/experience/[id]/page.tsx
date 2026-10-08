"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Experience = {
  id: string;
  company: string;
  role: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  display_order: number;
};

function EditExperienceForm() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadExperience() {
      const { data, error } = await supabase
        .from("experience")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        alert(`Failed to load experience: ${error.message}`);
        router.push("/admin/experience");
        return;
      }

      const experience = data as Experience;

      setCompany(experience.company || "");
      setRole(experience.role || "");
      setLocation(experience.location || "");
      setStartDate(experience.start_date || "");
      setEndDate(experience.end_date || "");
      setDescription(experience.description || "");
      setDisplayOrder(
        String(experience.display_order ?? 0)
      );

      setLoading(false);
    }

    if (id) {
      loadExperience();
    }
  }, [id]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!company.trim()) {
      alert("Company is required.");
      return;
    }

    if (!role.trim()) {
      alert("Role is required.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("experience")
      .update({
        company: company.trim(),
        role: role.trim(),
        location: location.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
        description: description.trim() || null,
        display_order: Number(displayOrder) || 0,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Failed to update experience: ${error.message}`);
      setSaving(false);
      return;
    }

    router.push("/admin/experience");
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this experience?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    const { error } = await supabase
      .from("experience")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Failed to delete experience: ${error.message}`);
      setDeleting(false);
      return;
    }

    router.push("/admin/experience");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-600">
            Loading experience...
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
            href="/admin/experience"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to Experience
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Edit Experience
          </h1>

          <p className="mt-1 text-gray-500">
            Update your professional experience.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-sm"
        >
          <div className="mb-6">
            <label
              htmlFor="company"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Company *
            </label>

            <input
              id="company"
              type="text"
              value={company}
              onChange={(event) =>
                setCompany(event.target.value)
              }
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="role"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Role *
            </label>

            <input
              id="role"
              type="text"
              value={role}
              onChange={(event) =>
                setRole(event.target.value)
              }
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Location
            </label>

            <input
              id="location"
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              placeholder="Mumbai, India"
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

              <p className="mt-2 text-sm text-gray-500">
                Leave empty if this is your current position.
              </p>
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
              rows={8}
              placeholder="Describe your responsibilities and achievements..."
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

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="rounded-lg border border-red-200 px-6 py-3 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Experience"}
            </button>

            <div className="flex gap-3">
              <Link
                href="/admin/experience"
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

export default function EditExperiencePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-gray-600">
              Loading experience...
            </p>
          </div>
        </main>
      }
    >
      <EditExperienceForm />
    </Suspense>
  );
}