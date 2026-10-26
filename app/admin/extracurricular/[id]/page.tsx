
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ActivityForm, { type Activity } from "../ActivityForm";

export default function EditExtracurricularPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadActivity() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("extracurricular_activities")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!active) return;

      if (error) {
        setErrorMessage(error.message);
      } else {
        setActivity(data as Activity);
      }

      setLoading(false);
    }

    void loadActivity();

    return () => {
      active = false;
    };
  }, [params.id, router]);

  return (
    <main className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin/extracurricular"
          className="text-sm text-gray-500 hover:text-blue-700"
        >
          ← Back to Extracurricular Activities
        </Link>

        <h1 className="mb-2 mt-4 text-3xl font-bold">
          Edit Activity
        </h1>

        <p className="mb-8 text-gray-500">
          Update your activity details and image.
        </p>

        {loading ? (
          <p>Loading activity...</p>
        ) : errorMessage ? (
          <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
            {errorMessage}
          </p>
        ) : activity ? (
          <ActivityForm key={activity.id} activity={activity} />
        ) : (
          <p>Activity not found.</p>
        )}
      </div>
    </main>
  );
}
