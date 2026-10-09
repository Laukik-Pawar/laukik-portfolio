"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

type Profile = {
  name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  email: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  resume_url: string | null;
  photo_url: string | null;

};


type Project = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  github_url: string | null;
  demo_url: string | null;
  technologies: string[] | null;
  featured: boolean;
  display_order?: number | null;
};


type Publication = {
  id: string;
  title: string;
  authors: string | null;
  venue: string | null;
  publication_date: string | null;
  abstract: string | null;
  paper_url: string | null;
  doi_url: string | null;
  github_url: string | null;
  display_order: number | null;
};

type Experience = {
  id: string;
  company: string;
  role: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  display_order: number | null;
};

type Education = {
  id: string;
  institution: string;
  degree: string | null;
  field: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  display_order: number | null;
};

type Skill = {
  id: string;
  name: string;
  category: string | null;
  display_order: number | null;
};

type Certification = {
  id: string;
  name: string;
  issuer: string | null;
  issue_date: string | null;
  credential_url: string | null;
  description: string | null;
  display_order: number | null;
};

function formatDate(date: string | null) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

function formatPublicationDate(date: string | null) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

export default function Home() {
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortfolio() {
      const [
        profileResult,
        projectsResult,
        publicationsResult,
        experienceResult,
        educationResult,
        skillsResult,
        certificationsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .limit(1)
          .maybeSingle(),


supabase
  .from("projects")
  .select("*")
  .order("display_order", { ascending: true }),


        supabase
          .from("publications")
          .select("*")
          .order("display_order", {
            ascending: true,
          })
          .order("publication_date", {
            ascending: false,
          }),

        supabase
          .from("experience")
          .select("*")
          .order("display_order", {
            ascending: true,
          })
          .order("start_date", {
            ascending: false,
          }),

        supabase
          .from("education")
          .select("*")
          .order("display_order", {
            ascending: true,
          })
          .order("start_date", {
            ascending: false,
          }),

        supabase
          .from("skills")
          .select("*")
          .order("display_order", {
            ascending: true,
          }),

        supabase
          .from("certifications")
          .select("*")
          .order("display_order", {
            ascending: true,
          })
          .order("issue_date", {
            ascending: false,
          }),
      ]);

      if (profileResult.error) {
        console.error("Profile error:", profileResult.error);
      }

      if (projectsResult.error) {
        console.error("Projects error:", projectsResult.error);
      }

      if (publicationsResult.error) {
        console.error(
          "Publications error:",
          publicationsResult.error
        );
      }

      if (experienceResult.error) {
        console.error(
          "Experience error:",
          experienceResult.error
        );
      }

      if (educationResult.error) {
        console.error(
          "Education error:",
          educationResult.error
        );
      }

      if (skillsResult.error) {
        console.error("Skills error:", skillsResult.error);
      }

      if (certificationsResult.error) {
        console.error(
          "Certifications error:",
          certificationsResult.error
        );
      }

      setProfile(profileResult.data);
      setProjects(projectsResult.data || []);
      setPublications(publicationsResult.data || []);
      setExperience(experienceResult.data || []);
      setEducation(educationResult.data || []);
      setSkills(skillsResult.data || []);
      setCertifications(certificationsResult.data || []);

      setLoading(false);
    }

    loadPortfolio();
  }, []);

  const groupedSkills = skills.reduce(
    (groups: Record<string, Skill[]>, skill) => {
      const category = skill.category || "Other";

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(skill);

      return groups;
    },
    {}
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-500">Loading portfolio...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="shrink-0 text-xl font-bold"
          >
            {profile?.name || "Laukik Pawar"}
          </Link>

          <div className="hidden items-center gap-4 text-sm lg:flex">
            <a
              href="#about"
              className="transition hover:text-gray-500"
            >
              About
            </a>

            <a
              href="#projects"
              className="transition hover:text-gray-500"
            >
              Projects
            </a>

            <a
              href="#experience"
              className="transition hover:text-gray-500"
            >
              Experience
            </a>

            <a
              href="#education"
              className="transition hover:text-gray-500"
            >
              Education
            </a>

            <a
              href="#skills"
              className="transition hover:text-gray-500"
            >
              Skills
            </a>

            <a
              href="#certifications"
              className="transition hover:text-gray-500"
            >
              Certifications
            </a>

            <a
              href="#publications"
              className="transition hover:text-gray-500"
            >
              Publications
            </a>

            <a
              href="#contact"
              className="transition hover:text-gray-500"
            >
              Contact
            </a>

            <Link
              href="/admin"
              className="rounded-lg border px-4 py-2 transition hover:bg-gray-50"
            >
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
<section className="mx-auto max-w-6xl px-6 py-24">
  <div className="flex flex-col-reverse items-center gap-12 md:flex-row md:items-center md:justify-between">
    
    {/* Text */}
    <div className="max-w-3xl">
      <p className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
        {profile?.location || "United States"}
      </p>

      <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
        {profile?.name || "Laukik Pawar"}
      </h1>

      <h2 className="mt-6 text-2xl font-medium text-gray-600 md:text-3xl">
        {profile?.headline ||
          "Computer Science Graduate Student | Data & Cloud"}
      </h2>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
        {profile?.bio ||
          "I build data-driven applications, machine learning systems, and cloud-based solutions."}
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href="#projects"
          className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800"
        >
          View Projects
        </a>

        {profile?.github_url && (
          <a
            href={profile.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border px-6 py-3 transition hover:bg-gray-50"
          >
            GitHub
          </a>
        )}

        {profile?.linkedin_url && (
          <a
            href={profile.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border px-6 py-3 transition hover:bg-gray-50"
          >
            LinkedIn
          </a>
        )}

        {profile?.resume_url && (
          <a
            href={profile.resume_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border px-6 py-3 transition hover:bg-gray-50"
          >
            Resume
          </a>
        )}
      </div>
    </div>

    {/* Profile Photo */}
    {profile?.photo_url && (
      <div className="shrink-0">
<div className="relative h-56 w-56 overflow-hidden rounded-full border-4 border-white shadow-xl ring-1 ring-gray-200 md:h-64 md:w-64">
  <Image
  src={profile.photo_url}
  alt={profile.name || "Profile photo"}
  fill
  priority
  sizes="(max-width: 768px) 224px, 256px"
  className="object-cover"
/>
        </div>
      </div>
    )}
  </div>
</section>
      {/* About */}
      <section
        id="about"
        className="border-t bg-gray-50"
      >
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold">
            About Me
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            {profile?.bio ||
              "I am a Computer Science graduate student interested in building reliable software, data platforms, machine learning systems, and cloud infrastructure."}
          </p>

          {profile?.location && (
            <p className="mt-4 text-gray-500">
              Based in {profile.location}
            </p>
          )}
        </div>
      </section>

      {/* Projects */}
      <section
        id="projects"
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <div className="mb-10">
          <h2 className="text-3xl font-bold">
             Projects
          </h2>

          <p className="mt-2 text-gray-500">
            A selection of projects I&apos;ve built.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <h3 className="text-xl font-semibold">
              Projects coming soon
            </h3>

            <p className="mt-2 text-gray-500">
              I&apos;m currently building out my project portfolio.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            
{projects.map((project) => (
  <article
    key={project.id}
    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
  >
    {/* Project thumbnail */}
    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
      {project.image_url ? (
        <Image
          src={project.image_url}
          alt={`${project.title} project preview`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white text-2xl font-bold text-gray-700 shadow-sm">
              {project.title.charAt(0).toUpperCase()}
            </div>
            <p className="px-4 text-sm font-medium text-gray-500">
              {project.title}
            </p>
          </div>
        </div>
      )}

      {project.featured && (
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur">
          Featured
        </span>
      )}
    </div>

    {/* Project details */}
    <div className="p-6">
      <h3 className="text-xl font-bold tracking-tight text-gray-900 transition group-hover:text-gray-600">
        {project.title}
      </h3>

      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
        {project.description || "No description available yet."}
      </p>

      {/* Technology tags */}
      {project.technologies &&
        project.technologies.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.technologies.map((technology) => (
              <span
                key={technology}
                className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700"
              >
                {technology}
              </span>
            ))}
          </div>
        )}

      {/* Project links */}
      {(project.github_url || project.demo_url) && (
        <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
            >
              GitHub <span aria-hidden="true">↗</span>
            </a>
          )}

          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
            >
              Live Demo <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      )}
    </div>
  </article>
))}

          </div>
        )}
      </section>

      {/* Experience */}
      <section
        id="experience"
        className="border-t bg-gray-50"
      >
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Career
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Experience
            </h2>

            <p className="mt-3 max-w-2xl text-gray-600">
              Professional experience, internships, and technical roles.
            </p>
          </div>

          {experience.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
              <p className="text-gray-500">
                No experience added yet.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {experience.map((item) => (
                <article
                  key={item.id}
                  className="relative rounded-2xl border bg-white p-6 shadow-sm md:p-8"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-xl font-bold">
                        {item.role}
                      </h3>

                      <p className="mt-1 text-lg font-medium text-gray-700">
                        {item.company}
                      </p>

                      {item.location && (
                        <p className="mt-1 text-sm text-gray-500">
                          {item.location}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
                      {formatDate(item.start_date)}
                      {" — "}
                      {item.end_date
                        ? formatDate(item.end_date)
                        : "Present"}
                    </div>
                  </div>

                  {item.description && (
                    <p className="mt-6 whitespace-pre-line leading-7 text-gray-600">
                      {item.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Education */}
      <section
        id="education"
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Academic Background
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Education
          </h2>
        </div>

        {education.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <p className="text-gray-500">
              No education information added yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {education.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border p-6 transition hover:shadow-lg"
              >
                <h3 className="text-xl font-bold">
                  {item.institution}
                </h3>

                {item.degree && (
                  <p className="mt-3 text-lg font-medium text-gray-700">
                    {item.degree}
                  </p>
                )}

                {item.field && (
                  <p className="mt-1 text-gray-600">
                    {item.field}
                  </p>
                )}

                {(item.start_date || item.end_date) && (
                  <p className="mt-4 text-sm text-gray-500">
                    {formatDate(item.start_date)}
                    {" — "}
                    {item.end_date
                      ? formatDate(item.end_date)
                      : "Present"}
                  </p>
                )}

                {item.description && (
                  <p className="mt-5 whitespace-pre-line leading-7 text-gray-600">
                    {item.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Skills */}
      <section
        id="skills"
        className="border-t bg-gray-50"
      >
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Technical Toolkit
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Skills
            </h2>

            <p className="mt-3 max-w-2xl text-gray-600">
              Technologies and tools I use to build data, software,
              machine learning, and cloud solutions.
            </p>
          </div>

          {skills.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
              <p className="text-gray-500">
                No skills added yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(groupedSkills).map(
                ([category, categorySkills]) => (
                  <div
                    key={category}
                    className="rounded-2xl border bg-white p-6"
                  >
                    <h3 className="text-lg font-bold">
                      {category}
                    </h3>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {categorySkills.map((skill) => (
                        <span
                          key={skill.id}
                          className="rounded-full border bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* Certifications */}
      <section
        id="certifications"
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Credentials
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Certifications
          </h2>

          <p className="mt-3 max-w-2xl text-gray-600">
            Professional certifications and credentials.
          </p>
        </div>

        {certifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <p className="text-gray-500">
              No certifications added yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {certifications.map((certification) => (
              <article
                key={certification.id}
                className="rounded-2xl border p-6 transition hover:shadow-lg"
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-xl font-bold">
                      {certification.name}
                    </h3>

                    {certification.issuer && (
                      <p className="mt-2 font-medium text-gray-700">
                        {certification.issuer}
                      </p>
                    )}
                  </div>

                  {certification.issue_date && (
                    <p className="text-sm text-gray-500">
                      Issued{" "}
                      {formatDate(certification.issue_date)}
                    </p>
                  )}

                  {certification.description && (
                    <p className="leading-7 text-gray-600">
                      {certification.description}
                    </p>
                  )}

                  {certification.credential_url && (
                    <div>
                      <a
                        href={certification.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
                      >
                        View Credential →
                      </a>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Publications */}
      <section
        id="publications"
        className="border-t bg-gray-50 px-6 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Research
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              Publications
            </h2>

            <p className="mt-3 max-w-2xl text-gray-600">
              Research papers, technical publications, and academic work.
            </p>
          </div>

          {publications.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
              No publications available yet.
            </div>
          ) : (
            <div className="space-y-6">
              {publications.map((publication) => (
                <article
                  key={publication.id}
                  className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md md:p-8"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:justify-between">
                    <div className="max-w-4xl">
                      <h3 className="text-xl font-bold text-gray-900">
                        {publication.title}
                      </h3>

                      {publication.authors && (
                        <p className="mt-2 text-sm text-gray-600">
                          {publication.authors}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        {publication.venue && (
                          <span className="font-medium">
                            {publication.venue}
                          </span>
                        )}

                        {publication.venue &&
                          publication.publication_date && (
                            <span>•</span>
                          )}

                        {publication.publication_date && (
                          <span>
                            {formatPublicationDate(
                              publication.publication_date
                            )}
                          </span>
                        )}
                      </div>

                      {publication.abstract && (
                        <p className="mt-5 leading-7 text-gray-600">
                          {publication.abstract}
                        </p>
                      )}

                      <div className="mt-6 flex flex-wrap gap-3">
                        {publication.paper_url && (
                          <a
                            href={publication.paper_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                          >
                            Read Paper →
                          </a>
                        )}

                        {publication.doi_url && (
                          <a
                            href={publication.doi_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            DOI
                          </a>
                        )}

                        {publication.github_url && (
                          <a
                            href={publication.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="border-t bg-gray-50"
      >
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold">
            Let&apos;s Connect
          </h2>

          <p className="mt-4 text-gray-600">
            Interested in working together or discussing
            opportunities?
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800"
              >
                Email Me
              </a>
            )}

            {profile?.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border px-6 py-3 transition hover:bg-white"
              >
                LinkedIn
              </a>
            )}

            {profile?.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border px-6 py-3 transition hover:bg-white"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-gray-500">
          © {new Date().getFullYear()}{" "}
          {profile?.name || "Laukik Pawar"}. All rights reserved.
        </div>
      </footer>
    </main>
  );
}