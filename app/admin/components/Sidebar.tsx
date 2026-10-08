import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r bg-white p-6">

      <div className="mb-10">
        <h1 className="text-xl font-bold">
          Laukik Portfolio
        </h1>

        <p className="text-sm text-gray-500">
          Admin Dashboard
        </p>
      </div>

      <nav className="space-y-2">

        <Link
          href="/admin"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          Dashboard
        </Link>

        <Link
          href="/admin/projects"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          Projects
        </Link>

        <Link
          href="/admin/experience"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          Experience
        </Link>

        <Link
          href="/admin/education"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          Education
        </Link>

        <Link
          href="/admin/skills"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          Skills
        </Link>

        <Link
          href="/admin/certifications"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          Certifications
        </Link>

        <Link
          href="/admin/profile"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          Profile
        </Link>

        <Link
  href="/admin/publications"
  className="..."
>
  Publications
</Link>

      </nav>

      <div className="mt-auto">
        <Link
          href="/"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          ← View Portfolio
        </Link>
      </div>

    </aside>
  );
}