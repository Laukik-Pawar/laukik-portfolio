
import Link from "next/link";
import ActivityForm from "../ActivityForm";

export default function NewExtracurricularPage() {
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
          Add Activity
        </h1>

        <p className="mb-8 text-gray-500">
          Add leadership roles, clubs, and campus involvement.
        </p>

        <ActivityForm />
      </div>
    </main>
  );
}
