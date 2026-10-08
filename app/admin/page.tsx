"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/admin/login");
        return;
      }

      setEmail(user.email ?? "");
    }

    checkUser();
  }, [router, supabase.auth]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Portfolio Admin
            </h1>

            <p className="text-gray-500">
              Welcome back, {email}
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border bg-white px-4 py-2"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
<a href="/admin/projects">
  <DashboardCard
    title="Projects"
    description="Manage your projects"
  />
</a>

          <DashboardCard
            title="Experience"
            description="Manage your work experience"
          />

          <DashboardCard
            title="Skills"
            description="Manage your technical skills"
          />

          <DashboardCard
            title="Education"
            description="Manage your education"
          />

          <DashboardCard
            title="Certifications"
            description="Manage certifications"
          />

          <DashboardCard
            title="Profile"
            description="Manage your personal information"
          />
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-gray-500">{description}</p>
    </div>
  );
}