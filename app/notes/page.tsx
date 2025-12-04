"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import NoteCard from "@/components/note-card";
import Link from "next/link";
import { Plus } from "lucide-react";

interface SavedNote {
  id: string;
  title: string;
  excerpt: string;
  content?: any;
  type?: string;
  createdAt: number;
  updatedAt: number;
}

interface StaticNote {
  title: string;
  excerpt: string;
  date: string;
}

// Original static notes
const staticNotes: StaticNote[] = [
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

const NOTES_STORAGE_KEY = "ht.notes";

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SavedNotesPage() {
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load notes from localStorage
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(NOTES_STORAGE_KEY);

      // If no stored notes, initialize with static notes converted to JSON format
      if (!stored) {
        const staticNotesAsJson: SavedNote[] = staticNotes.map(
          (note, index) => {
            // Convert date string to timestamp (approximate)
            const dateParts = note.date.split(" ");
            const monthMap: Record<string, number> = {
              January: 0,
              February: 1,
              March: 2,
              April: 3,
              May: 4,
              June: 5,
              July: 6,
              August: 7,
              September: 8,
              October: 9,
              November: 10,
              December: 11,
            };
            const day = parseInt(dateParts[0]);
            const month = monthMap[dateParts[1]] || 0;
            const year = parseInt(dateParts[2]);
            const timestamp = new Date(year, month, day).getTime();

            return {
              id: `static-${timestamp}-${index}`,
              title: note.title,
              excerpt: note.excerpt,
              content: {
                type: "static",
                content: note.excerpt,
              },
              type: "static",
              createdAt: timestamp,
              updatedAt: timestamp,
            };
          }
        );

        localStorage.setItem(
          NOTES_STORAGE_KEY,
          JSON.stringify(staticNotesAsJson)
        );
        setSavedNotes(staticNotesAsJson);
      } else {
        const parsed = JSON.parse(stored);
        // Sort by createdAt descending (newest first)
        const sorted = Array.isArray(parsed)
          ? parsed.sort(
              (a: SavedNote, b: SavedNote) => b.createdAt - a.createdAt
            )
          : [];
        setSavedNotes(sorted);
      }
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for storage events to update when notes are saved from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === NOTES_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const sorted = Array.isArray(parsed)
            ? parsed.sort(
                (a: SavedNote, b: SavedNote) => b.createdAt - a.createdAt
              )
            : [];
          setSavedNotes(sorted);
        } catch (error) {
          console.error("Failed to parse notes from storage event:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // All notes are now in savedNotes (including converted static notes)
  const allNotes = savedNotes.map((note) => ({
    id: note.id,
    title: note.title,
    excerpt: note.excerpt,
    date: formatDate(note.createdAt),
    href: `/notes/${note.id}`,
  }));

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="type-h3 text-gray-900 font-gill-sans-regular">
            Notes
          </h1>
          <Button
            className="bg-secondary hover:bg-secondary/90 text-white font-gill-sans-light transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
            onClick={() => {
              // Could open a modal to create a new note
              window.location.href = "/chat";
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add new
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 font-gill-sans-light">
                Loading notes...
              </p>
            </div>
          ) : allNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-gray-500 font-gill-sans-light mb-4">
                No notes yet. Start a conversation and save important
                information to Notes.
              </p>
              <Link href="/chat">
                <Button className="bg-primary hover:bg-primary/90 text-white font-gill-sans-light">
                  Start Chat
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  title={note.title}
                  excerpt={note.excerpt}
                  date={note.date}
                  href={note.href}
                />
              ))}
            </div>
          )}

          {/* Upgrade CTA */}
          {allNotes.length > 0 && (
            <div className="mt-10">
              <div className="rounded-2xl bg-gradient-to-b from-white to-gray-50 border border-gray-200 p-8 text-center">
                <p className="type-h4 text-gray-900 mb-3 font-gill-sans-regular">
                  Want to add more notes?
                </p>
                <Link href="/pro">
                  <Button className="bg-primary hover:bg-primary/90 px-6 py-2 font-gill-sans-light">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
