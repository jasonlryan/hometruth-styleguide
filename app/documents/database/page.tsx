"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileDown, Search, Sparkles, ArrowRight } from "lucide-react";

import AppLayout from "@/components/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import addressesData from "@/data/brighton-addresses.json";

type Plan = "free" | "pro";

type AddressRecord = {
  id: number;
  name: string;
  email: string;
  address: string;
  postcode: string;
  propertyType: string;
  plan: Plan;
  documents: string[];
};

const addresses = addressesData as AddressRecord[];
const totalRecords = addresses.length;
const proCount = addresses.filter((record) => record.plan === "pro").length;
const freeCount = totalRecords - proCount;
const johnDoe = addresses[0];

const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
};

function formatDocsList(docs: string[]) {
  if (!docs.length) return "—";
  if (docs.length <= 2) return docs.join(", ");
  return `${docs.slice(0, 2).join(", ")} +${docs.length - 2} more`;
}

export default function BrightonDatabasePage() {
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<Plan | "all">("all");
  const [visibleCount, setVisibleCount] = useState(25);

  const filteredRecords = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();

    return [...addresses]
      .filter((record) => {
        const matchesPlan =
          planFilter === "all" ? true : record.plan === planFilter;
        if (!matchesPlan) return false;

        if (!trimmedQuery) return true;

        const haystack = [
          record.name,
          record.email,
          record.address,
          record.postcode,
          record.propertyType,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(trimmedQuery);
      })
      .sort((a, b) => a.id - b.id);
  }, [planFilter, query]);

  const visibleRecords = filteredRecords.slice(0, visibleCount);
  const hasMore = filteredRecords.length > visibleCount;

  return (
    <AppLayout>
      <div className="flex-1 bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Data Room · Brighton
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-gray-900 font-gill-sans-regular">
                Fabricated property database (1,000 Brighton addresses)
              </h1>
              <p className="mt-2 text-sm text-gray-600 max-w-3xl font-gill-sans-light">
                Fully mocked data with names, contact details, property types,
                plans, and uploaded document arrays. The first record is John
                Doe with a linked ledger for the last 18 months of works.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <a href="/data/brighton-addresses.csv" download>
                  <FileDown className="h-4 w-4" />
                  CSV
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/data/brighton-addresses.json" download>
                  <FileDown className="h-4 w-4" />
                  JSON
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total records" value={totalRecords} />
            <StatCard label="Pro plans" value={proCount} accent="bg-primary/10 text-primary" />
            <StatCard label="Free plans" value={freeCount} accent="bg-gray-100 text-gray-800" />
            <StatCard
              label="Featured profile"
              value={johnDoe.name}
              helper="Direct link to ledger & documents"
              accent="bg-amber-100 text-amber-700"
              ctaHref="/documents/john-doe"
              ctaLabel="View John Doe"
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Curated record for John Doe
                  </div>
                  <div className="mt-1 text-base font-semibold text-gray-900">
                    {johnDoe.address} · {johnDoe.propertyType}
                  </div>
                  <p className="text-sm text-gray-600">
                    {(() => {
                      const preview = johnDoe.documents.slice(0, 3).join(", ");
                      const extra = Math.max(0, johnDoe.documents.length - 3);
                      return extra
                        ? `Documents: ${preview} + ${extra} more`
                        : `Documents: ${preview}`;
                    })()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href="/documents/john-doe">
                      Open extended record
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="/data/john-doe-ledger.csv" download>
                      <FileDown className="h-4 w-4" />
                      Ledger CSV
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-600">
                Quick filters
              </div>
              <div className="mt-3 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search name, email, address, type..."
                    className="pl-10 font-gill-sans-light"
                  />
                </div>
                <div className="flex gap-2">
                  {(["all", "pro", "free"] as const).map((plan) => (
                    <Button
                      key={plan}
                      size="sm"
                      variant={planFilter === plan ? "default" : "outline"}
                      onClick={() => setPlanFilter(plan)}
                      className="flex-1"
                    >
                      {plan === "all" ? "All plans" : PLAN_LABELS[plan]}
                    </Button>
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  Showing {visibleRecords.length} of {filteredRecords.length}{" "}
                  matching records
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Brighton address database
                </div>
                <p className="text-xs text-gray-600">
                  Sorted with John Doe as the first record for direct access.
                </p>
              </div>
              {hasMore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount((count) => count + 25)}
                >
                  Load 25 more
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3">Property type</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Documents</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleRecords.map((record) => {
                    const isJohn = record.id === 1;
                    return (
                      <tr
                        key={record.id}
                        className={`${
                          isJohn ? "bg-amber-50/60" : "bg-white"
                        } hover:bg-gray-50`}
                      >
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-2">
                            <div className="text-gray-900 font-semibold">
                              {record.name}
                            </div>
                            {isJohn && (
                              <Badge className="bg-amber-100 text-amber-700">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="text-gray-900">{record.address}</div>
                          <div className="text-xs text-gray-500">
                            {record.postcode}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-gray-700">
                          {record.propertyType}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Badge
                            className={
                              record.plan === "pro"
                                ? "bg-primary/10 text-primary"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {PLAN_LABELS[record.plan]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 align-top text-gray-700">
                          {formatDocsList(record.documents)}
                        </td>
                        <td className="px-4 py-3 align-top text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            {isJohn && (
                              <Button asChild size="sm">
                                <Link href="/documents/john-doe">
                                  Details
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Quick scroll to spotlight card
                                document
                                  .getElementById("record-spotlight")
                                  ?.scrollIntoView({ behavior: "smooth" });
                              }}
                            >
                              Preview
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div
            id="record-spotlight"
            className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Spotlight record
                </div>
                <div className="mt-1 text-lg font-semibold text-gray-900">
                  {johnDoe.name} · {johnDoe.address}
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  {johnDoe.propertyType} · {johnDoe.postcode}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {johnDoe.documents.map((doc) => (
                    <Badge key={doc} variant="outline">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href="/documents/john-doe">Open extended record</Link>
                </Button>
                <Button asChild variant="outline">
                  <a href="/data/john-doe-ledger.csv" download>
                    Download ledger CSV
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  accent?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

function StatCard({
  label,
  value,
  helper,
  accent,
  ctaHref,
  ctaLabel,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-gray-900 font-gill-sans-regular">
        {value}
      </div>
      {helper && (
        <div className={`mt-1 text-xs font-medium ${accent ?? "text-gray-600"}`}>
          {helper}
        </div>
      )}
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="mt-2 inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          {ctaLabel}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
