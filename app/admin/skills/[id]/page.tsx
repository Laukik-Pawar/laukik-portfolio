"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Skill = {
  id: string;
  name: string;
  category: string | null;
  display_order: number;
};

function EditSkillForm() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadSkill() {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        alert(`Failed to load skill: ${error.message}`);
        router.push("/admin/skills");
        return;
      }

      const skill = data as Skill;

      setName(skill.name || "");
      setCategory(skill.category || "");
      setDisplayOrder(
        String(skill.display_order ?? 0)
      );

      setLoading(false);
    }

    if (id) {
      loadSkill();
    }
  }, [id]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      alert("Skill name is required.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("skills")
      .update({
        name: name.trim(),
        category: category.trim() || null,
        display_order: Number(displayOrder) || 0,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Failed to update skill: ${error.message}`);
      setSaving(false);
      return;
    }

    router.push("/admin/skills");
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this skill?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    const { error } = await supabase
      .from("skills")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Failed to delete skill: ${error.message}`);
      setDeleting(false);
      return;
    }

    router.push("/admin/skills");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-600">
            Loading skill...
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
            href="/admin/skills"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to Skills
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Edit Skill
          </h1>

          <p className="mt-1 text-gray-500">
            Update this technical skill.
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
              Skill Name *
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
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Category
            </label>

            <input
              id="category"
              type="text"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              placeholder="Programming"
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
              {deleting ? "Deleting..." : "Delete Skill"}
            </button>

            <div className="flex gap-3">
              <Link
                href="/admin/skills"
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

export default function EditSkillPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-gray-600">
              Loading skill...
            </p>
          </div>
        </main>
      }
    >
      <EditSkillForm />
    </Suspense>
  );
}