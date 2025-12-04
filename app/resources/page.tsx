import fs from "fs/promises";
import path from "path";

import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ArrowRight, FileText, Sparkles } from "lucide-react";

type ResourcePage = {
  title: string;
  description: string;
  slug: string;
  href: string;
  updatedAt: Date;
};

async function getResourcePages(): Promise<ResourcePage[]> {
  const resourcesDir = path.join(process.cwd(), "public", "resources");
  let entries: string[] = [];

  try {
    entries = await fs.readdir(resourcesDir);
  } catch {
    return [];
  }

  const pages: ResourcePage[] = [];

  for (const file of entries) {
    if (!file.endsWith(".html")) continue;

    const filePath = path.join(resourcesDir, file);
    const content = await fs.readFile(filePath, "utf8");
    const titleMatch = content.match(/<title[^>]*>([^<]*)<\/title>/i);
    const descriptionMatch = content.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    );
    const stats = await fs.stat(filePath);

    pages.push({
      title:
        titleMatch?.[1]?.trim() ||
        file.replace(/-/g, " ").replace(/\.html$/, "").trim(),
      description:
        descriptionMatch?.[1]?.trim() ||
        "HomeTruth resource explaining how we personalize the experience.",
      slug: file,
      href: `/resources/${file}`,
      updatedAt: stats.mtime,
    });
  }

  return pages.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function ResourcesPage() {
  const resources = await getResourcePages();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-white to-blue-50/60">
      <Header variant="landing" />
      <main className="container mx-auto px-4 py-10 lg:py-14">
        <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white/90 px-6 py-8 shadow-xl lg:px-10 lg:py-12">
          <div className="absolute -left-10 -top-16 h-48 w-48 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -right-10 -bottom-12 h-48 w-48 rounded-full bg-purple-100/60 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-gill-sans-regular text-blue-800 ring-1 ring-blue-100">
                <Sparkles className="h-4 w-4" />
                HomeTruth Resources
              </div>
              <h1 className="type-h1 text-gray-900">
                Explain the “why” behind every HomeTruth touchpoint.
              </h1>
              <p className="type-body-lg text-gray-700 max-w-2xl">
                A library of explainer pages we can share with users, partners,
                or the team—covering onboarding flows, data inputs, and the
                personalized outcomes they unlock.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-gill-sans-regular text-blue-900 ring-1 ring-blue-100">
                  Dynamic index: reads everything in <code>public/resources</code>
                </span>
                <span className="rounded-xl bg-white px-3 py-2 text-sm font-gill-sans-regular text-gray-700 ring-1 ring-gray-200 shadow-sm">
                  Ready to share or link in-product
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50/90 p-5 ring-1 ring-blue-100">
              <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-800">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-gill-sans-regular text-gray-900">
                    HomeTruth Profiling System
                  </p>
                  <p className="text-sm font-gill-sans-light text-gray-600">
                    Why the 2–3 minute onboarding exists and how it powers the
                    AI copilot.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <div className="rounded-lg bg-purple-100 p-2 text-purple-800">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-gill-sans-regular text-gray-900">
                    Add more explainers
                  </p>
                  <p className="text-sm font-gill-sans-light text-gray-600">
                    Drop new HTML files into <code>public/resources</code> to
                    have them appear below automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="type-h2 text-gray-900">Resource library</h2>
            <div className="rounded-full bg-white px-3 py-1 text-sm font-gill-sans-regular text-gray-700 ring-1 ring-gray-200 shadow-sm">
              {resources.length} item{resources.length === 1 ? "" : "s"}
            </div>
          </div>

          {resources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="type-body-lg text-gray-800 mb-2">
                No resources yet.
              </p>
              <p className="type-body text-gray-600">
                Add an HTML page to <code>public/resources</code> and it will
                appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {resources.map((resource) => (
                <article
                  key={resource.slug}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-900">
                        Explainer
                      </p>
                      <span className="text-xs font-gill-sans-regular text-gray-500">
                        Updated {formatDate(resource.updatedAt)}
                      </span>
                    </div>
                    <h3 className="type-h3 text-gray-900">{resource.title}</h3>
                    <p className="type-body text-gray-700">
                      {resource.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Link
                        href={resource.href}
                        target="_blank"
                        prefetch={false}
                        className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-3 py-2 text-sm font-gill-sans-regular text-primary-foreground shadow-md transition hover:shadow-lg"
                      >
                        Open explainer
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <span className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-blue-800 ring-1 ring-blue-100">
                        HTML · Public
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[hsl(var(--primary))] via-sky-400 to-[var(--ht-secondary)] opacity-60" />
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer variant="landing" />
    </div>
  );
}
