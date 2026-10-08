"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Skill = {
  id: string;
  name: string;
  category: string | null;
  display_order: number;
};

export default function SkillsPage() {
  const supabase = createClient();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadSkills() {
    setLoading(true);

    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      alert(`Failed to load skills: ${error.message}`);
      setLoading(false);
      return;
    }

    setSkills(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadSkills();
  }, []);

  async function deleteSkill(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this skill?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    const { error } = await supabase
      .from("skills")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Failed to delete skill: ${error.message}`);
      setDeletingId(null);
      return;
    }

    setSkills((current) =>
      current.filter((skill) => skill.id !== id)
    );

    setDeletingId(null);
  }

  const categories = Array.from(
    new Set(
      skills
        .map((skill) => skill.category)
        .filter((category): category is string => Boolean(category))
    )
  );

  const uncategorizedSkills = skills.filter(
    (skill) => !skill.category
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-600">
            Loading skills...
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
              Skills
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your technical skills
            </p>
          </div>

          <Link
            href="/admin/skills/new"
            className="rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800"
          >
            + Add Skill
          </Link>
        </div>

        {skills.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              No skills yet
            </h2>

            <p className="mt-2 text-gray-500">
              Add your first technical skill.
            </p>

            <Link
              href="/admin/skills/new"
              className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800"
            >
              + Add Your First Skill
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => {
              const categorySkills = skills.filter(
                (skill) => skill.category === category
              );

              return (
                <section
                  key={category}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <h2 className="mb-5 text-xl font-semibold">
                    {category}
                  </h2>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {categorySkills.map((skill) => (
                      <div
                        key={skill.id}
                        className="flex items-center justify-between gap-3 rounded-lg border p-4"
                      >
                        <span className="font-medium">
                          {skill.name}
                        </span>

                        <div className="flex gap-2">
                          <Link
                            href={`/admin/skills/${skill.id}`}
                            className="text-sm text-gray-600 hover:text-black"
                          >
                            Edit
                          </Link>

                          <button
                            onClick={() =>
                              deleteSkill(skill.id)
                            }
                            disabled={
                              deletingId === skill.id
                            }
                            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {deletingId === skill.id
                              ? "..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {uncategorizedSkills.length > 0 && (
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-semibold">
                  Other
                </h2>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {uncategorizedSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between gap-3 rounded-lg border p-4"
                    >
                      <span className="font-medium">
                        {skill.name}
                      </span>

                      <div className="flex gap-2">
                        <Link
                          href={`/admin/skills/${skill.id}`}
                          className="text-sm text-gray-600 hover:text-black"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() =>
                            deleteSkill(skill.id)
                          }
                          disabled={
                            deletingId === skill.id
                          }
                          className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}