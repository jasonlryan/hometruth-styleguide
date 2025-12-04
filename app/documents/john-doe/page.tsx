"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FileDown, Wallet, Files, MapPin, ShieldCheck, Clock3, Link2 } from "lucide-react";

import AppLayout from "@/components/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import addressesData from "@/data/brighton-addresses.json";
import ledgerData from "@/data/john-doe-ledger.json";

type AddressRecord = {
  id: number;
  name: string;
  email: string;
  address: string;
  postcode: string;
  propertyType: string;
  plan: "free" | "pro";
  documents: string[];
};

type LedgerEntry = {
  date: string;
  category: string;
  description: string;
  vendor: string;
  amount: number;
  status: string;
};

type LedgerProof =
  | {
      status: "anchored";
      txHash: string;
      blockNumber: number;
      anchorDate: string;
      explorerUrl: string;
      merkleRoot: string;
    }
  | {
      status: "queued";
      anchorDate?: string;
      explorerUrl?: string;
    };

type LedgerRow = LedgerEntry & { proof: LedgerProof };

const johnDoe = (addressesData as AddressRecord[])[0];
const ledgerEntries = ledgerData as LedgerEntry[];

const configuredAmoyTxHash =
  process.env.NEXT_PUBLIC_AMOY_TX_HASH ||
  "0x089368f700a249ee6bb5711954bb03a92010507b74451217912c657ab9d0e648";
const demoExplorerUrl = `https://amoy.polygonscan.com/tx/${configuredAmoyTxHash}`;

const ledgerAnchor = {
  network: "Polygon Amoy (testnet)",
  batchId: "HT-Ledger-Batch-0184",
  merkleRoot: "0x9e3b16c8e5e1c933f202bdb30ac7d5a0f75c8d0a6a4f3c7c8c1913cb64a9f021",
  txHash: configuredAmoyTxHash ?? "",
  blockNumber: 5029185,
  anchoredAt: "",
  nextAnchorWindow: "2025-03-19T18:00:00Z",
  explorerUrl: demoExplorerUrl,
};

const initialLedgerRows: LedgerRow[] = (ledgerEntries as LedgerEntry[]).map(
  (entry) => ({
    ...entry,
    proof: {
      status: "queued",
      anchorDate: ledgerAnchor.nextAnchorWindow,
    },
  })
);

const clearedSpend = ledgerEntries
  .filter((entry) => entry.status.toLowerCase() === "cleared")
  .reduce((total, entry) => total + entry.amount, 0);

const pendingSpend = ledgerEntries
  .filter((entry) => entry.status.toLowerCase() !== "cleared")
  .reduce((total, entry) => total + entry.amount, 0);

const lastEntry = ledgerEntries[ledgerEntries.length - 1];

export default function JohnDoePage() {
  const [anchorInfo, setAnchorInfo] = useState(ledgerAnchor);
  const [ledgerRows, setLedgerRows] = useState<LedgerRow[]>(initialLedgerRows);
  const anchoredCount = ledgerRows.filter(
    (row) => row.proof.status === "anchored"
  ).length;
  const queuedCount = ledgerRows.length - anchoredCount;

  const anchorButtonLabel = "View demo proof";

  const handleSimulateAnchor = () => {
    const simulatedTxHash = configuredAmoyTxHash;
    const simulatedExplorerUrl = demoExplorerUrl;
    const anchorDate = new Date().toISOString();

    const nextRows = ledgerRows.map((row) =>
      row.proof.status === "anchored"
        ? row
        : {
            ...row,
            proof: {
              status: "anchored",
              txHash: simulatedTxHash,
              blockNumber: anchorInfo.blockNumber,
              anchorDate,
              explorerUrl: simulatedExplorerUrl,
              merkleRoot: anchorInfo.merkleRoot,
            },
          }
    );
    setAnchorInfo((prev) => ({
      ...prev,
      txHash: simulatedTxHash,
      anchoredAt: anchorDate,
      explorerUrl: simulatedExplorerUrl,
    }));
    setLedgerRows(nextRows);
  };

  return (
    <AppLayout>
      <div className="flex-1 bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Link
                  href="/documents/database"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to database
                </Link>
                <span>·</span>
                <span className="uppercase tracking-wide">Featured profile</span>
              </div>
              <h1 className="mt-1 text-2xl font-semibold text-gray-900 font-gill-sans-regular">
                John Doe — Extended record
              </h1>
              <p className="mt-1 text-sm text-gray-600 font-gill-sans-light">
                Brighton-based pro plan with uploaded compliance documents and
                an 18-month transaction ledger spanning home improvements,
                electrical tests, boiler checks, and repairs.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary">Pro plan</Badge>
                <Badge variant="outline">{johnDoe.propertyType}</Badge>
                <Badge variant="outline">{johnDoe.postcode}</Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <a href="#ledger">
                  Jump to ledger
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/data/john-doe-ledger.csv" download>
                  <FileDown className="h-4 w-4" />
                  Export ledger CSV
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={<MapPin className="h-5 w-5 text-primary" />}
              label="Property"
              value={johnDoe.address}
              helper={`${johnDoe.propertyType} · ${johnDoe.postcode}`}
            />
            <SummaryCard
              icon={<Files className="h-5 w-5 text-secondary" />}
              label="Uploaded documents"
              value={`${johnDoe.documents.length} on file`}
              helper="Compliance, ownership & safety"
            />
            <SummaryCard
              icon={<Wallet className="h-5 w-5 text-emerald-600" />}
              label="Cleared spend (18m)"
              value={formatCurrency(clearedSpend)}
              helper={`${ledgerEntries.length} entries`}
            />
            <SummaryCard
              icon={<Wallet className="h-5 w-5 text-amber-600" />}
              label="Pending / upcoming"
              value={formatCurrency(pendingSpend)}
              helper={`Last entry ${formatDate(lastEntry.date)}`}
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Documents on record
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    Pro plan uploads for this property
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary">
                  {johnDoe.documents.length} total
                </Badge>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {johnDoe.documents.map((doc) => (
                  <div
                    key={doc}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {doc}
                      </div>
                      <div className="text-xs text-gray-600">
                        Uploaded and linked to this property record.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Contact & tenancy
              </div>
              <div className="mt-2 text-lg font-semibold text-gray-900">
                {johnDoe.name}
              </div>
              <div className="text-sm text-gray-700">{johnDoe.email}</div>
              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <div>{johnDoe.address}</div>
                <div>{johnDoe.postcode}</div>
                <div>{johnDoe.propertyType}</div>
              </div>
              <div className="mt-4 space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <a href="/data/brighton-addresses.csv" download>
                    Download entire CSV
                  </a>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/documents/database">View all addresses</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[2fr,1fr]">
            <div className="rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                    Blockchain proof (demo)
                  </div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    Anchored on {anchorInfo.network}
                  </div>
                  <div className="mt-1 text-sm text-gray-700">
                    Batch {anchorInfo.batchId} · Merkle root{" "}
                  {truncateHash(anchorInfo.merkleRoot, 10)} · anchored{" "}
                    {formatDateTime(anchorInfo.anchoredAt)}.
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge className="border border-emerald-200 bg-white text-emerald-700">
                      Block #{anchorInfo.blockNumber}
                    </Badge>
                    <Badge className="border border-emerald-200 bg-white text-emerald-700">
                      Tx {truncateHash(anchorInfo.txHash)}
                    </Badge>
                    <Badge className="border border-emerald-200 bg-white text-emerald-700">
                      {anchoredCount} anchored · {queuedCount} queued
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <a
                      href={anchorInfo.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {anchorButtonLabel}
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="justify-center">
                    <Link href="/resources/hometruth-blockchain-ledger-strategy.html">
                      How we store proofs
                      <Link2 className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-emerald-100 bg-white/80 p-3">
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Anchored entries
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {anchoredCount}
                  </div>
                  <div className="text-xs text-gray-600">
                    Proof hash stored on-chain
                  </div>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-white/80 p-3">
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Merkle root
                  </div>
                  <div className="break-all text-sm font-semibold text-gray-900">
                    {truncateHash(anchorInfo.merkleRoot, 12)}
                  </div>
                  <div className="text-xs text-gray-600">
                    Batch {anchorInfo.batchId}
                  </div>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-white/80 p-3">
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Next anchor window
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatDateTime(anchorInfo.nextAnchorWindow)}
                  </div>
                  <div className="text-xs text-gray-600">
                    Auto-batching demo data daily
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Anchor management
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    Queue & monitoring
                  </div>
                  <div className="text-sm text-gray-700">
                    Use this pane during demos to show what is on-chain vs
                    queued.
                  </div>
                </div>
                <Badge className="border border-gray-200 bg-gray-100 text-gray-800">
                  Demo
                </Badge>
              </div>
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Anchored now
                  </div>
                  <span className="font-semibold text-gray-900">
                    {anchoredCount}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-amber-600" />
                    <span>Queued for next batch</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {queuedCount}
                  </span>
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-amber-600" />
                  <span>
                    Next anchor window {formatDateTime(anchorInfo.nextAnchorWindow)}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Batch anchoring runs automatically; trigger manually during a
                  demo to show the flow.
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="bg-secondary text-white hover:bg-secondary/90"
                  type="button"
                  onClick={handleSimulateAnchor}
                >
                  Simulate anchor
                </Button>
                <Button size="sm" variant="outline" type="button">
                  Export anchor log
                </Button>
              </div>
            </div>
          </div>

          <div
            id="ledger"
            className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Ledger · last 18 months
                </div>
                <div className="text-base font-semibold text-gray-900">
                  Home improvements, electrical safety, boiler checks, repairs
                </div>
              </div>
              <Button asChild variant="outline">
                <a href="/data/john-doe-ledger.csv" download>
                  <FileDown className="h-4 w-4" />
                  CSV
                </a>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Proof</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ledgerRows.map((row) => (
                    <tr key={`${row.date}-${row.vendor}`} className="bg-white hover:bg-gray-50">
                      <td className="px-4 py-3 align-top text-gray-900">
                        {formatDate(row.date)}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-700">
                        {row.category}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-700">
                        {row.description}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-700">
                        {row.vendor}
                      </td>
                      <td className="px-4 py-3 align-top text-right text-gray-900 font-semibold">
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {row.proof.status === "anchored" ? (
                          <div className="flex flex-col gap-1">
                            <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700">
                              Anchored
                            </Badge>
                            <div className="text-xs text-gray-600">
                              {truncateHash(row.proof.txHash)}
                            </div>
                            <a
                              href={row.proof.explorerUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-primary hover:underline"
                            >
                              View demo proof
                            </a>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <Badge className="border border-amber-200 bg-amber-50 text-amber-800">
                              Queued
                            </Badge>
                            <div className="text-xs text-gray-600">
                              Batching {formatDateTime(row.proof.anchorDate)}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Badge
                          className={
                            row.status.toLowerCase() === "cleared"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-100 text-amber-800"
                          }
                        >
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

type SummaryCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  helper?: string;
};

function SummaryCard({ icon, label, value, helper }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{value}</div>
      {helper && <div className="text-sm text-gray-600">{helper}</div>}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  return date.toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncateHash(hash: string, visible = 6) {
  if (!hash) return "";
  return `${hash.slice(0, visible + 2)}...${hash.slice(-visible)}`;
}
