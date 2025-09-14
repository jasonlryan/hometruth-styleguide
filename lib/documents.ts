export type DocItem = {
  id: string;
  name: string;
  type: string;
  dateAdded: string;
  starred?: boolean;
  category?: string;
  tags?: string[];
  status?: "Processing" | "Urgent" | "Expiring" | "Ready" | "Error";
};

export const mockDocs: DocItem[] = [
  {
    id: "1",
    name: "Tenancy_Agreement.pdf",
    type: "Lease Agreement",
    dateAdded: "Sep 16th 2024",
    starred: true,
    category: "Legal",
    tags: ["Lease", "Tenant"],
    status: "Ready",
  },
  {
    id: "2",
    name: "Property_Deed.pdf",
    type: "Title Deed",
    dateAdded: "Sep 17th 2024",
    category: "Legal",
    tags: ["Ownership"],
    status: "Processing",
  },
  {
    id: "3",
    name: "Energy_Performance_Cert.pdf",
    type: "EPC Certificate",
    dateAdded: "Sep 16th 2024",
    category: "Compliance",
    tags: ["EPC", "Energy"],
    status: "Expiring",
  },
];

