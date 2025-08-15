import Header from "@/components/header";
import Footer from "@/components/footer";
import SidebarNav from "@/components/sidebar-nav";
import { Button } from "@/components/ui/button";
import NoteCard from "@/components/note-card";
import Link from "next/link";

const notes = [
  {
    title: "Mortgage Calculations",
    excerpt:
      "Based on a £300,000 property with 15% deposit, monthly payments would be approximately £1,100 on a 25-year term.",
    date: "May 12, 2023",
  },
  {
    title: "Property Viewing Checklist",
    excerpt:
      "Check for damp, test all windows, inspect the roof condition, check water pressure, and ask about neighbor noise.",
    date: "May 8, 2023",
  },
  {
    title: "Leasehold Explained",
    excerpt:
      "With a leasehold, you own the property but not the land it stands on. Pay attention to lease length and ground rent.",
    date: "April 30, 2023",
  },
  {
    title: "First-Time Buyer Benefits",
    excerpt:
      "As a first-time buyer, you may be eligible for stamp duty relief and shared ownership schemes.",
    date: "April 25, 2023",
  },
  {
    title: "Survey Types Comparison",
    excerpt:
      "Basic condition report vs HomeBuyer report vs full structural survey — which one suits your property?",
    date: "April 20, 2023",
  },
];

export default function SavedNotesPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header variant="landing" />

      <div className="flex flex-1">
        <SidebarNav />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h1 className="type-h3 text-gray-900">Saved Notes</h1>
            <Button className="bg-[#B19CD9] hover:bg-purple-600 text-white">
              + Add new
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((n) => (
                <NoteCard
                  key={n.title}
                  title={n.title}
                  excerpt={n.excerpt}
                  date={n.date}
                  href="#"
                />
              ))}
            </div>

            {/* Upgrade CTA */}
            <div className="mt-10">
              <div className="rounded-2xl bg-gradient-to-b from-white to-gray-50 border border-gray-200 p-8 text-center">
                <p className="type-h4 text-gray-900 mb-3">
                  Want to add more notes?
                </p>
                <Link href="/pro">
                  <Button className="bg-[#00BFFF] hover:bg-blue-600 text-white px-6 py-2">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer variant="app" />
    </div>
  );
}
