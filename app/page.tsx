import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import PersonSchema from "@/app/components/PersonSchema";

type Profile = {
  name: string;
  headline: string | null;
  subtitle: string | null;
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
  image_url: string | null;
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
  image_url: string | null;
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
  image_url: string | null;
};

type ExtracurricularActivity = {
  id: string;
  title: string;
  organization: string | null;
  role: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  activity_url: string | null;
  display_order: number;
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

const NAV_LINKS: [string, string][] = [
  ["About", "#about"],
  ["Projects", "#projects"],
  ["Experience", "#experience"],
  ["Education", "#education"],
  ["Activities", "#extracurricular"],
  ["Skills", "#skills"],
  ["Certifications", "#certifications"],
  ["Publications", "#publications"],
  ["Contact", "#contact"],
];

/* ───────────────────────── Section chrome ───────────────────────── */

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="font-mono text-xs tracking-[0.3em] text-amber-600">
        {index}
      </span>
      <span className="h-px w-10 bg-amber-600/50" />
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
        {label}
      </span>
    </div>
  );
}

function SectionHeading({
  index,
  eyebrow,
  title,
  subtitle,
}: {
  index: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-16 max-w-3xl">
      <SectionLabel index={index} label={eyebrow} />
      <h2 className="font-serif text-4xl font-normal tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-6 text-lg leading-8 text-slate-600">{subtitle}</p>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

/* ───────────────────────── Page ───────────────────────── */

export default async function Home() {
  const supabase = await createClient();

  const [
    profileResult,
    projectsResult,
    publicationsResult,
    experienceResult,
    educationResult,
    skillsResult,
    certificationsResult,
    extracurricularResult,

  ] = await Promise.all([
    supabase.from("profiles").select("*").limit(1).maybeSingle(),
    supabase.from("projects").select("*").order("display_order", { ascending: true }),
    supabase
      .from("publications")
      .select("*")
      .order("display_order", { ascending: true })
      .order("publication_date", { ascending: false }),
    supabase
      .from("experience")
      .select("*")
      .order("display_order", { ascending: true })
      .order("start_date", { ascending: false }),
    supabase
      .from("education")
      .select("*")
      .order("display_order", { ascending: true })
      .order("start_date", { ascending: false }),
    supabase.from("skills").select("*").order("display_order", { ascending: true }),
    supabase
      .from("certifications")
      .select("*")
      .order("display_order", { ascending: true })
      .order("issue_date", { ascending: false }),
      supabase
  .from("extracurricular_activities")
  .select("*")
  .order("display_order", { ascending: true }),
  ]);

  if (
    profileResult.error ||
    projectsResult.error ||
    publicationsResult.error ||
    experienceResult.error ||
    educationResult.error ||
    skillsResult.error ||
    certificationsResult.error ||
        extracurricularResult.error
  ) {
    console.error("Error loading portfolio data", {
      profile: profileResult.error,
      projects: projectsResult.error,
      publications: publicationsResult.error,
      experience: experienceResult.error,
      education: educationResult.error,
      skills: skillsResult.error,
      certifications: certificationsResult.error,
            extracurricular: extracurricularResult.error,
    });
  }

  const profile = (profileResult.data as Profile | null) ?? null;
  const projects = (projectsResult.data as Project[] | null) ?? [];
  const publications = (publicationsResult.data as Publication[] | null) ?? [];
  const experience = (experienceResult.data as Experience[] | null) ?? [];
  const education = (educationResult.data as Education[] | null) ?? [];
  const skills = (skillsResult.data as Skill[] | null) ?? [];
  const certifications = (certificationsResult.data as Certification[] | null) ?? [];
  const extracurricularActivities =
    (extracurricularResult.data as ExtracurricularActivity[] | null) ?? [];
  const groupedSkills = skills.reduce(
    (groups: Record<string, Skill[]>, skill) => {
      const category = skill.category || "Other";
      if (!groups[category]) groups[category] = [];
      groups[category].push(skill);
      return groups;
    },
    {}
  );

  const name = profile?.name || "Laukik Pawar";

  return (
    <main className="min-h-screen scroll-smooth bg-[#F5F2EC] text-slate-900 selection:bg-amber-200 selection:text-slate-900">
      {/* Global styles for this page: serif + grain + custom scrollbar */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
            .fade-up { animation: fadeUp 0.9s ease-out both; }
            .font-serif { font-family: 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', Palatino, Georgia, serif; }
            .font-mono { font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace; }
            .grain::before {
              content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 100;
              opacity: 0.035; mix-blend-mode: multiply;
              background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
            }
            ::-webkit-scrollbar { width: 10px; height: 10px; }
            ::-webkit-scrollbar-track { background: #F5F2EC; }
            ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; border: 2px solid #F5F2EC; }
            ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            html { scroll-behavior: smooth; }
            @media (prefers-reduced-motion: reduce) {
              .fade-up { animation: none; }
              * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
            }
          `,
        }}
      />

      <PersonSchema
        siteUrl={
          process.env.NEXT_PUBLIC_SITE_URL ||
          "https://laukik-portfolio-nine.vercel.app"
        }
      />

      {/* ───────── Navigation ───────── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#080B14]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/30">
              {name.charAt(0)}
            </span>
            <span className="font-serif text-lg font-medium tracking-tight text-white">
              {name}
              <span className="text-amber-400">.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-[13px] font-medium tracking-wide text-slate-300 lg:flex">
            {NAV_LINKS.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="relative transition-colors duration-200 hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-amber-400 after:transition-all after:duration-300 hover:after:w-full"
              >
                {label}
              </a>
            ))}
            {/* <Link
              href="/admin"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-slate-200 transition hover:border-amber-400/60 hover:bg-amber-400/10 hover:text-amber-200"
            >
              Admin
            </Link> */}
          </div>
        </div>

        <div className="border-t border-white/5 lg:hidden">
          <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-6 py-3 text-[13px] text-slate-300">
            {NAV_LINKS.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="shrink-0 whitespace-nowrap transition-colors hover:text-amber-300"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ───────── Hero ───────── */}
      <section className="relative isolate overflow-hidden bg-[#080B14] text-white">
        {/* Ambient glow */}
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute right-[-10%] top-[-20%] h-[40rem] w-[40rem] rounded-full bg-amber-500/10 blur-[140px]" />
          <div className="absolute bottom-[-30%] left-[-10%] h-[36rem] w-[36rem] rounded-full bg-emerald-500/10 blur-[140px]" />
          {/* Editorial grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 md:pb-32 md:pt-24">
          <div className="grid gap-16 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div className="fade-up">
              {/* Status */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium tracking-wide text-slate-300 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {profile?.location || "United States"}
              </div>

              {/* Name */}
              <h1 className="mt-8 font-serif text-5xl leading-[1.02] tracking-tight md:text-7xl lg:text-8xl">
                <span className="block text-white/60">Hi, I&apos;m</span>
                <span className="mt-2 block bg-gradient-to-br from-amber-200 via-amber-100 to-amber-300 bg-clip-text italic text-transparent">
                  {name}.
                </span>
              </h1>

              {/* Headline */}
              {/* <p className="mt-8 max-w-xl font-serif text-xl leading-relaxed text-slate-300 md:text-2xl">
                {profile?.headline ||
                  "Computer Science Graduate Student | Data & Cloud"}
              </p>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">
                {profile?.bio ||
                  "I build data-driven applications, machine learning systems, and cloud-based solutions."}
              </p> */}
{/* Headline */}
<p className="mt-8 max-w-xl font-serif text-xl leading-relaxed text-slate-300 md:text-2xl">
  {profile?.headline ||
    "Building Intelligent Systems with Data, AI & Cloud."}
</p>

{/* Admin-editable Subtitle */}
{profile?.subtitle && (
  <p className="mt-4 max-w-xl text-base leading-7 text-slate-400 md:text-lg">
    {profile.subtitle}
  </p>
)}
              {/* CTAs */}
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#projects"
                  className="group inline-flex items-center gap-3 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/25 transition duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-amber-500/40"
                >
                  Explore my work
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </a>

                {profile?.resume_url && (
                  <a
                    href={profile.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:border-amber-400/50 hover:bg-amber-400/10"
                  >
                    Resume
                    <span className="text-xs opacity-60 transition group-hover:opacity-100">↗</span>
                  </a>
                )}
              </div>

              {/* Socials row */}
              <div className="mt-10 flex items-center gap-6 border-t border-white/10 pt-6 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                {profile?.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-amber-300"
                  >
                    GitHub
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-amber-300"
                  >
                    LinkedIn
                  </a>
                )}
                {profile?.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="transition hover:text-amber-300"
                  >
                    Email
                  </a>
                )}
              </div>
            </div>

            {/* Portrait */}
            <div className="fade-up flex justify-center md:justify-end" style={{ animationDelay: "0.15s" }}>
              {profile?.photo_url ? (
                <div className="relative">
                  {/* Ornamental frame */}
                  <div className="absolute -inset-3 rounded-full border border-amber-400/20" />
                  <div className="absolute -inset-6 rounded-full border border-amber-400/10" />
                  <div className="relative h-64 w-64 overflow-hidden rounded-full ring-1 ring-white/20 sm:h-72 sm:w-72 lg:h-80 lg:w-80">
                    <Image
                      src={profile.photo_url}
                      alt={name || "Profile photo"}
                      fill
                      priority
                      sizes="(max-width: 640px) 256px, (max-width: 1024px) 288px, 320px"
                      className="object-cover"
                    />
                  </div>
                  {/* Corner tag */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#080B14] px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.25em] text-amber-300">
                    Available for work
                  </div>
                </div>
              ) : (
                <div className="flex h-64 w-64 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 font-serif text-6xl text-slate-900 sm:h-72 sm:w-72 lg:h-80 lg:w-80">
                  {name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      
{/* ───────── About ───────── */}
<section id="about" className="scroll-mt-24 grain">
  <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
    <SectionHeading
      index="01"
      eyebrow="Introduction"
      title="A little about me."
    />

    <div className="grid gap-12 md:grid-cols-[2fr_1fr] md:gap-16">
      <div className="max-w-3xl">
        {(profile?.bio ||
          "I am a Computer Science graduate student interested in building reliable software, data platforms, machine learning systems, and cloud infrastructure."
        )
          .replace(/\r\n/g, "\n")
          .trim()
          .split(/\n\s*\n/)
          .filter((paragraph) => paragraph.trim().length > 0)
          .map((paragraph, index) => (
            <p
              key={index}
              className={`font-serif text-xl leading-8 text-slate-700 md:text-2xl md:leading-9 ${
                index > 0 ? "mt-5" : ""
              }`}
            >
              {paragraph.trim()}
            </p>
          ))}
      </div>

      {profile?.location && (
        <div className="flex flex-col justify-end gap-4 border-l border-slate-300 pl-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500">
            Based in
          </p>
          <p className="font-serif text-2xl text-slate-900">
            {profile.location}
          </p>
        </div>
      )}
    </div>
  </div>
</section>


      {/* ───────── Projects ───────── */}
      <section
        id="projects"
        className="scroll-mt-24 border-y border-slate-900/5 bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <SectionHeading
            index="02"
            eyebrow="Selected work"
            title="Things I've built."
            subtitle="A selection of projects spanning data engineering, machine learning, and cloud-native applications."
          />

          {projects.length === 0 ? (
            <EmptyState text="Projects coming soon." />
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {projects.map((project, i) => (
                <article
                  key={project.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-500 hover:-translate-y-1 hover:border-amber-300 hover:shadow-2xl hover:shadow-slate-900/10 motion-reduce:transform-none"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-100 to-amber-50">
                    {project.image_url ? (
                      <Image
                        src={project.image_url}
                        alt={`${project.title} project preview`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="font-serif text-6xl italic text-slate-300">
                          {project.title.charAt(0)}
                        </span>
                      </div>
                    )}

                    {/* Index badge */}
                    <span className="absolute left-4 top-4 rounded-full bg-slate-900/90 px-3 py-1 font-mono text-[10px] tracking-widest text-amber-300 backdrop-blur">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {project.featured && (
                      <span className="absolute right-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-900 shadow">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6 md:p-8">
                    <h3 className="font-serif text-2xl tracking-tight text-slate-900 transition-colors group-hover:text-amber-700">
                      {project.title}
                    </h3>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                      {project.description || "No description available yet."}
                    </p>

                    {project.technologies && project.technologies.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {project.technologies.map((technology) => (
                          <span
                            key={technology}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-[11px] text-slate-700"
                          >
                            {technology}
                          </span>
                        ))}
                      </div>
                    )}

                    {(project.github_url || project.demo_url) && (
                      <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5 text-sm font-medium">
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-slate-900 transition hover:text-amber-700"
                          >
                            GitHub <span aria-hidden="true">↗</span>
                          </a>
                        )}
                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-slate-900 transition hover:text-amber-700"
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
        </div>
      </section>

      {/* ───────── Experience ───────── */}
      <section id="experience" className="scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <SectionHeading
            index="03"
            eyebrow="Career"
            title="Where I've worked."
            subtitle="Professional experience, internships, and technical roles."
          />

          {experience.length === 0 ? (
            <EmptyState text="No experience added yet." />
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-amber-400 via-slate-300 to-transparent md:left-[7.5rem]" />

              <div className="space-y-12">
                {experience.map((item) => (
                  <article key={item.id} className="relative pl-12 md:pl-44">
                    {/* Dot */}
                    <span className="absolute left-[0.6rem] top-3 h-3 w-3 rounded-full border-2 border-[#F5F2EC] bg-amber-500 shadow ring-2 ring-amber-200 md:left-[7.1rem]" />

                    {/* Period */}
                    <div className="mb-3 md:absolute md:left-0 md:top-2 md:mb-0 md:w-28">
                      <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                        {formatDate(item.start_date)} —{" "}
                        {item.end_date ? formatDate(item.end_date) : "Present"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg motion-reduce:transform-none md:p-8">
                      <div className="flex items-start gap-4">
                        {item.image_url ? (
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-50 ring-1 ring-slate-200">
                            <Image
                              src={item.image_url}
                              alt={`${item.company} logo`}
                              fill
                              sizes="48px"
                              className="object-contain p-1.5"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 font-serif text-lg text-amber-300">
                            {item.company.charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <h3 className="font-serif text-xl tracking-tight text-slate-900 md:text-2xl">
                            {item.role}
                          </h3>
                          <p className="mt-1 text-sm font-medium text-slate-600">
                            {item.company}
                            {item.location && (
                              <span className="text-slate-400">
                                {" "}· {item.location}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {item.description && (
                        <p className="mt-5 whitespace-pre-line border-t border-slate-100 pt-5 text-sm leading-7 text-slate-600">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ───────── Education ───────── */}
      <section
        id="education"
        className="scroll-mt-24 border-y border-slate-900/5 bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <SectionHeading
            index="04"
            eyebrow="Academic background"
            title="Where I studied."
          />

          {education.length === 0 ? (
            <EmptyState text="No education information added yet." />
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {education.map((item) => (
                <article
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl motion-reduce:transform-none"
                >
                  <div className="relative flex h-40 items-center justify-center border-b border-slate-100 bg-gradient-to-br from-slate-50 to-amber-50/60">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={`${item.institution} logo or campus`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain p-6"
                      />
                    ) : (
                      <span className="font-serif text-5xl italic text-slate-300">
                        {item.institution.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="p-6 md:p-8">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                      {formatDate(item.start_date)} —{" "}
                      {item.end_date ? formatDate(item.end_date) : "Present"}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl tracking-tight text-slate-900">
                      {item.institution}
                    </h3>
                    {item.degree && (
                      <p className="mt-2 text-sm font-medium text-amber-700">
                        {item.degree}
                      </p>
                    )}
                    {item.field && (
                      <p className="mt-1 text-sm text-slate-600">{item.field}</p>
                    )}
                    {item.description && (
                      <p className="mt-4 whitespace-pre-line border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600">
                        {item.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      
      {/* ───────── Extracurricular Activities ───────── */}
      <section
        id="extracurricular"
        className="scroll-mt-24 border-y border-slate-900/5 bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <SectionHeading
            index="05"
            eyebrow="Beyond academics"
            title="Leadership & involvement."
            subtitle="Extracurricular activities, leadership roles, and communities I've been part of."
          />

          {extracurricularActivities.length === 0 ? (
            <EmptyState text="No extracurricular activities added yet." />
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {extracurricularActivities.map((activity) => (
                <article
                  key={activity.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl motion-reduce:transform-none"
                >
                  {/* Image area — same as Education / Certifications */}
                  <div className="relative flex h-40 items-center justify-center border-b border-slate-100 bg-gradient-to-br from-slate-50 to-amber-50/60">
                    {activity.image_url ? (
                      <Image
                        src={activity.image_url}
                        alt={`${activity.title} activity image`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain p-6"
                      />
                    ) : (
                      <span className="font-serif text-5xl italic text-slate-300">
                        {activity.title.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6 md:p-8">
                    {(activity.start_date || activity.end_date) && (
                      <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                        {activity.start_date
                          ? formatDate(activity.start_date)
                          : "Date not specified"}
                        {" — "}
                        {activity.end_date
                          ? formatDate(activity.end_date)
                          : "Present"}
                      </p>
                    )}

                    <h3 className="mt-2 font-serif text-2xl tracking-tight text-slate-900">
                      {activity.title}
                    </h3>

                    {activity.role && (
                      <p className="mt-2 text-sm font-medium text-amber-700">
                        {activity.role}
                      </p>
                    )}

                    {activity.organization && (
                      <p className="mt-1 text-sm text-slate-600">
                        {activity.organization}
                      </p>
                    )}

                    {activity.description && (
                      <p className="mt-4 whitespace-pre-line border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600">
                        {activity.description}
                      </p>
                    )}

                    {activity.activity_url && (
                      <div className="mt-auto pt-5">
                        <a
                          href={activity.activity_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 transition hover:text-amber-700"
                        >
                          Learn more
                          <span aria-hidden="true">→</span>
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* ───────── Skills ───────── */}
      <section id="skills" className="scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <SectionHeading
            index="06"
            eyebrow="Technical toolkit"
            title="What I work with."
            subtitle="Technologies and tools I use to build data, software, machine learning, and cloud solutions."
          />

          {skills.length === 0 ? (
            <EmptyState text="No skills added yet." />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(groupedSkills).map(([category, categorySkills], idx) => (
                <div
                  key={category}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-amber-300 hover:shadow-md"
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-serif text-lg text-slate-900">
                      {category}
                    </h3>
                    <span className="font-mono text-[10px] tracking-widest text-slate-400">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-full bg-slate-50 px-3 py-1 font-mono text-[11px] text-slate-700 ring-1 ring-slate-200 transition hover:bg-amber-50 hover:text-amber-800 hover:ring-amber-200"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───────── Certifications ───────── */}
      <section
        id="certifications"
        className="scroll-mt-24 border-y border-slate-900/5 bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <SectionHeading
            index="07"
            eyebrow="Credentials"
            title="Certifications."
            subtitle="Professional certifications and credentials."
          />

          {certifications.length === 0 ? (
            <EmptyState text="No certifications added yet." />
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {certifications.map((certification) => (
                <article
                  key={certification.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl motion-reduce:transform-none"
                >
                  <div className="relative flex h-40 items-center justify-center border-b border-slate-100 bg-gradient-to-br from-slate-50 to-amber-50/60">
                    {certification.image_url ? (
                      <Image
                        src={certification.image_url}
                        alt={`${certification.name} certificate`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain p-6"
                      />
                    ) : (
                      <span className="font-serif text-5xl italic text-slate-300">
                        {certification.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6 md:p-8">
                    <h3 className="font-serif text-xl tracking-tight text-slate-900 md:text-2xl">
                      {certification.name}
                    </h3>
                    {certification.issuer && (
                      <p className="mt-2 text-sm font-medium text-amber-700">
                        {certification.issuer}
                      </p>
                    )}
                    {certification.issue_date && (
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                        Issued {formatDate(certification.issue_date)}
                      </p>
                    )}
                    {certification.description && (
                      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                        {certification.description}
                      </p>
                    )}
                    {certification.credential_url && (
                      <div className="mt-auto border-t border-slate-100 pt-4">
                        <a
                          href={certification.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 transition hover:text-amber-700"
                        >
                          View credential <span aria-hidden="true">→</span>
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───────── Publications ───────── */}
      <section id="publications" className="scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <SectionHeading
            index="08"
            eyebrow="Research"
            title="Publications."
            subtitle="Research papers, technical publications, and academic work."
          />

          {publications.length === 0 ? (
            <EmptyState text="No publications available yet." />
          ) : (
            <div className="space-y-6">
              {publications.map((publication, i) => (
                <article
                  key={publication.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-amber-300 hover:shadow-lg md:p-8"
                >
                  <div className="flex flex-col gap-6 md:flex-row">
                    <div className="shrink-0 md:w-32">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                        Paper
                      </span>
                      <p className="mt-1 font-serif text-3xl text-amber-600">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1 border-slate-200 md:border-l md:pl-6">
                      <h3 className="font-serif text-xl tracking-tight text-slate-900 md:text-2xl">
                        {publication.title}
                      </h3>
                      {publication.authors && (
                        <p className="mt-2 text-sm text-slate-600">
                          {publication.authors}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                        {publication.venue && (
                          <span className="text-amber-700">
                            {publication.venue}
                          </span>
                        )}
                        {publication.venue && publication.publication_date && (
                          <span>·</span>
                        )}
                        {publication.publication_date && (
                          <span>
                            {formatPublicationDate(publication.publication_date)}
                          </span>
                        )}
                      </div>
                      {publication.abstract && (
                        <p className="mt-4 text-sm leading-7 text-slate-600">
                          {publication.abstract}
                        </p>
                      )}
                      <div className="mt-5 flex flex-wrap gap-3">
                        {publication.paper_url && (
                          <a
                            href={publication.paper_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                          >
                            Read paper →
                          </a>
                        )}
                        {publication.doi_url && (
                          <a
                            href={publication.doi_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                          >
                            DOI
                          </a>
                        )}
                        {publication.github_url && (
                          <a
                            href={publication.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
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

      {/* ───────── Contact ───────── */}
      <section id="contact" className="scroll-mt-24 px-6 pb-24 pt-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#080B14] px-8 py-20 text-white md:px-16 md:py-28">
          <div aria-hidden="true" className="absolute inset-0">
            <div className="absolute right-[-15%] top-[-30%] h-96 w-96 rounded-full bg-amber-500/15 blur-[120px]" />
            <div className="absolute bottom-[-40%] left-[-10%] h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-amber-300">
              09 — Contact
            </p>
            <h2 className="mt-6 font-serif text-5xl tracking-tight md:text-7xl">
              Let&apos;s build something{" "}
              <span className="italic text-amber-300">great.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-slate-400">
              Interested in working together or discussing opportunities? My
              inbox is always open.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="group inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-300"
                >
                  Email me
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </a>
              )}
              {profile?.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/20 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-amber-400/50 hover:bg-amber-400/10"
                >
                  LinkedIn
                </a>
              )}
              {profile?.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/20 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-amber-400/50 hover:bg-amber-400/10"
                >
                  GitHub
                </a>
              )}
              <a
                href="tel:+15512483855"
                className="rounded-full border border-white/20 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-amber-400/50 hover:bg-amber-400/10"
              >
                <span aria-hidden="true">☎</span> +1 (551) 248-3855
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="border-t border-slate-900/10 bg-[#F5F2EC]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-widest text-slate-500">
            <Link href="/admin" className="transition hover:text-amber-700">
              Admin
            </Link> 
            <a href="#contact" className="transition hover:text-amber-700">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}