
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Activity = {
  id: string;
  title: string;
  organization: string | null;
  role: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  display_order: number;
};

export default function ExtracurricularPage() {
  const supabase = createClient();
  const router = useRouter();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    const { data, error } = await supabase
      .from("extracurricular_activities")
      .select(
        "id, title, organization, role, description, start_date, end_date, display_order"
      )
      .order("display_order", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      setActivities([]);
    } else {
      setActivities(data ?? []);
    }

    setLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    void loadActivities();
  }, [loadActivities]);


  
  async function deleteActivity(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this extracurricular activity?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setErrorMessage("");

    const { error, data } = await supabase
      .from("extracurricular_activities")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) {
      window.alert(`Failed to delete activity: ${error.message}`);
      setDeletingId(null);
      return;
    }

    if (!data || data.length === 0) {
      window.alert(
        "The activity was not deleted. Check your Supabase DELETE policy."
      );
      setDeletingId(null);
      return;
    }

    setActivities((current) =>
      current.filter((activity) => activity.id !== id)
    );

    setDeletingId(null);
  }

  function formatDateRange(start: string | null, end: string | null) {
    const format = (date: string) =>
      new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

    if (start && end) return `${format(start)} – ${format(end)}`;
    if (start) return `${format(start)} – Present`;
    if (end) return format(end);
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/admin"
              className="text-sm text-blue-700 hover:text-blue-900"
            >
              ← Admin Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-bold text-gray-900">
              Extracurricular Activities
            </h1>

            <p className="mt-2 text-gray-600">
              Manage leadership, clubs, and campus involvement.
            </p>
          </div>

          <Link
            href="/admin/extracurricular/new"
            className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 font-medium text-white transition hover:bg-blue-800"
          >
            + Add Activity
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-600">
            Loading activities…
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-white p-6">
            <h2 className="font-semibold text-red-700">
              Could not load activities
            </h2>
            <p className="mt-2 break-words text-sm text-gray-600">
              {errorMessage}
            </p>
            <button
              onClick={() => void loadActivities()}
              className="mt-4 rounded-lg border px-4 py-2 hover:bg-gray-50"
            >
              Try again
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              No activities yet
            </h2>
            <p className="mt-2 text-gray-600">
              Add your first activity to showcase your leadership and campus
              involvement.
            </p>
            <Link
              href="/admin/extracurricular/new"
              className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
            >
              Add Your First Activity
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <article
                key={activity.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {activity.title}
                    </h2>

                    {activity.role && (
                      <p className="mt-1 font-medium text-blue-700">
                        {activity.role}
                      </p>
                    )}

                    {activity.organization && (
                      <p className="mt-1 text-gray-600">
                        {activity.organization}
                      </p>
                    )}

                    {formatDateRange(
                      activity.start_date,
                      activity.end_date
                    ) && (
                      <p className="mt-2 text-sm text-gray-500">
                        {formatDateRange(
                          activity.start_date,
                          activity.end_date
                        )}
                      </p>
                    )}

                    {activity.description && (
                      <p className="mt-3 whitespace-pre-line text-gray-600">
                        {activity.description}
                      </p>
                    )}
                  </div>


<div className="flex shrink-0 items-start gap-3">
  <Link
    href={`/admin/extracurricular/${activity.id}`}
    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
  >
    Edit
  </Link>

  <button
    type="button"
    onClick={() => deleteActivity(activity.id)}
    disabled={deletingId === activity.id}
    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {deletingId === activity.id ? "Deleting..." : "Delete"}
  </button>
</div>

                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
