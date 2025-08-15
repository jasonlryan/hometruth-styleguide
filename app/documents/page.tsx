"use client";

import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SidebarNav from "@/components/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import {
  Search,
  Filter,
  Star,
  FileText,
  File,
  Shield,
  Home,
  CreditCard,
  User,
  MapPin,
  DollarSign,
  Scale,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  dateAdded: string;
  starred: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const documents: Document[] = [
  {
    id: "1",
    name: "Tenancy_Agreement.pdf",
    type: "Lease Agreement",
    dateAdded: "Sep 16th 2024",
    starred: true,
    icon: Home,
    color: "text-[#00BFFF]",
    bgColor: "bg-blue-50",
  },
  {
    id: "2",
    name: "Property_Deed.pdf",
    type: "Title Deed",
    dateAdded: "Sep 17th 2024",
    starred: false,
    icon: File,
    color: "text-[#10B981]",
    bgColor: "bg-green-50",
  },
  {
    id: "3",
    name: "Energy_Performance_Cert.pdf",
    type: "EPC Certificate",
    dateAdded: "Sep 16th 2024",
    starred: false,
    icon: Shield,
    color: "text-[#F59E0B]",
    bgColor: "bg-yellow-50",
  },
  {
    id: "4",
    name: "Survey_Report.pdf",
    type: "Property Survey Report",
    dateAdded: "Sep 18th 2024",
    starred: true,
    icon: FileText,
    color: "text-[#8B5CF6]",
    bgColor: "bg-purple-50",
  },
  {
    id: "5",
    name: "Mortgage_Approval.pdf",
    type: "Mortgage in Principle Letter",
    dateAdded: "Sep 16th 2024",
    starred: true,
    icon: CreditCard,
    color: "text-[#EF4444]",
    bgColor: "bg-red-50",
  },
  {
    id: "6",
    name: "ID_Document_Trent.jpg",
    type: "Proof of Identity",
    dateAdded: "Sep 19th 2024",
    starred: false,
    icon: User,
    color: "text-[#06B6D4]",
    bgColor: "bg-cyan-50",
  },
  {
    id: "7",
    name: "Utility_Bill_March.pdf",
    type: "Proof of Address",
    dateAdded: "Sep 19th 2024",
    starred: false,
    icon: MapPin,
    color: "text-[#84CC16]",
    bgColor: "bg-lime-50",
  },
  {
    id: "8",
    name: "Bank_Statement_Aug.pdf",
    type: "Financial Statement",
    dateAdded: "Sep 20th 2024",
    starred: false,
    icon: DollarSign,
    color: "text-[#10B981]",
    bgColor: "bg-emerald-50",
  },
  {
    id: "9",
    name: "Solicitor_Letter.pdf",
    type: "Legal Correspondence",
    dateAdded: "Sep 16th 2024",
    starred: true,
    icon: Scale,
    color: "text-[#6366F1]",
    bgColor: "bg-indigo-50",
  },
];

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [documentsState, setDocumentsState] = useState(documents);

  const filteredDocuments = documentsState.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStar = (id: string) => {
    setDocumentsState(prev => prev.map(doc => 
      doc.id === id ? { ...doc, starred: !doc.starred } : doc
    ));
  };

  const toggleSelect = (id: string) => {
    setSelectedDocs(prev => 
      prev.includes(id) 
        ? prev.filter(docId => docId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    const allIds = filteredDocuments.map(doc => doc.id);
    setSelectedDocs(selectedDocs.length === allIds.length ? [] : allIds);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header variant="landing" />

      <div className="flex flex-1">
        <SidebarNav />

        <main className="flex-1 flex flex-col">
          {/* Top bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h1 className="type-h3 text-gray-900 font-gill-sans-regular">Documents</h1>
            <Button className="bg-[#B19CD9] hover:bg-purple-600 text-white font-gill-sans-light">
              Ask HomeTruth
            </Button>
          </div>

          {/* Search and filters */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search document..."
                  className="pl-10 bg-gray-50/50 border-gray-200 focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF]/20 font-gill-sans-light"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200 text-gray-600 hover:bg-[#00BFFF]/5 hover:border-[#00BFFF]/20 hover:text-[#00BFFF] transition-colors font-gill-sans-light"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Documents table */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Table header */}
              <div className="border-b border-gray-200 bg-gray-50/50">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                  <div className="col-span-1 flex items-center">
                    <Checkbox
                      checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
                      onCheckedChange={selectAll}
                    />
                  </div>
                  <div className="col-span-1"></div>
                  <div className="col-span-5">
                    <span className="type-caption font-medium text-gray-600">Document Name</span>
                  </div>
                  <div className="col-span-3">
                    <span className="type-caption font-medium text-gray-600">Document Type</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="type-caption font-medium text-gray-600">Date Added</span>
                  </div>
                </div>
              </div>

              {/* Table body */}
              <div className="divide-y divide-gray-100">
                {filteredDocuments.map((doc) => {
                  const Icon = doc.icon;
                  return (
                    <div
                      key={doc.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors group"
                    >
                      <div className="col-span-1 flex items-center">
                        <Checkbox
                          checked={selectedDocs.includes(doc.id)}
                          onCheckedChange={() => toggleSelect(doc.id)}
                        />
                      </div>
                      <div className="col-span-1 flex items-center">
                        <button
                          onClick={() => toggleStar(doc.id)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Star
                            className={`h-4 w-4 transition-colors ${
                              doc.starred
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300 hover:text-gray-400"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="col-span-5 flex items-center space-x-3">
                        <div className={`w-8 h-8 ${doc.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`h-4 w-4 ${doc.color}`} />
                        </div>
                        <span className="font-gill-sans-regular text-gray-900 truncate">
                          {doc.name}
                        </span>
                      </div>
                      <div className="col-span-3">
                        <span className="font-gill-sans-light text-gray-600">
                          {doc.type}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="font-gill-sans-light text-gray-500 text-sm">
                          {doc.dateAdded}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upgrade CTA */}
            <div className="mt-10">
              <div className="rounded-2xl bg-gradient-to-b from-white to-gray-50 border border-gray-200 p-8 text-center">
                <p className="type-h4 text-gray-900 mb-3 font-gill-sans-regular">
                  Need more document storage?
                </p>
                <Link href="/pro">
                  <Button className="bg-[#00BFFF] hover:bg-blue-600 text-white px-6 py-2 font-gill-sans-light">
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