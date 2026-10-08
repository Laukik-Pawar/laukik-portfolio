"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NewSkillPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const [saving, setSaving] = useState(false);

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
      .insert({
        name: name.trim(),
        category: category.trim() || null,
        display_order: Number(displayOrder) || 0,
      });

    if (error) {
      console.error(error);
      alert(`Failed to create skill: ${error.message}`);
      setSaving(false);
      return;
    }

    router.push("/admin/skills");
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
            Add Skill
          </h1>

          <p className="mt-1 text-gray-500">
            Add a technical skill to your portfolio.
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
              placeholder="Python"
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

            <p className="mt-2 text-sm text-gray-500">
              Examples: Programming, Data Engineering,
              Cloud, Databases, Machine Learning
            </p>
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
              {saving ? "Saving..." : "Save Skill"}
            </button>

            <Link
              href="/admin/skills"
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