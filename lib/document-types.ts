import {
  Scale,
  FileText,
  DollarSign,
  Wallet,
  ShieldCheck,
  CheckCircle,
  ClipboardCheck,
  FileSearch,
  Image,
  Camera,
  Wrench,
  Tool,
  File,
  Receipt,
  Building2,
  FileCheck,
  Home,
  CreditCard,
  FileBarChart,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface DocumentTypeConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export function getDocumentTypeIcon(
  category?: string,
  type?: string
): DocumentTypeConfig {
  const categoryLower = category?.toLowerCase() || "";
  const typeLower = type?.toLowerCase() || "";

  // Legal Documents
  if (
    categoryLower.includes("legal") ||
    typeLower.includes("deed") ||
    typeLower.includes("agreement") ||
    typeLower.includes("contract") ||
    typeLower.includes("lease") ||
    typeLower.includes("solicitor")
  ) {
    return {
      icon: FileCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    };
  }

  // Financial Documents
  if (
    categoryLower.includes("financial") ||
    typeLower.includes("mortgage") ||
    typeLower.includes("bank") ||
    typeLower.includes("statement")
  ) {
    return {
      icon: CreditCard,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    };
  }

  // Compliance
  if (
    categoryLower.includes("compliance") ||
    typeLower.includes("epc") ||
    typeLower.includes("certificate") ||
    typeLower.includes("cert")
  ) {
    return {
      icon: ShieldCheck,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    };
  }

  // Surveys & Reports
  if (
    categoryLower.includes("survey") ||
    categoryLower.includes("report") ||
    typeLower.includes("survey") ||
    typeLower.includes("report")
  ) {
    return {
      icon: FileBarChart,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    };
  }

  // Property Details (Photos, IDs)
  if (
    categoryLower.includes("property") ||
    typeLower.includes("photo") ||
    typeLower.includes("image") ||
    typeLower.includes("id") ||
    typeLower.includes("identity")
  ) {
    return {
      icon: Home,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    };
  }

  // Maintenance
  if (
    categoryLower.includes("maintenance") ||
    typeLower.includes("warranty") ||
    typeLower.includes("invoice") ||
    typeLower.includes("service")
  ) {
    return {
      icon: Receipt,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    };
  }

  // Default
  return {
    icon: FileText,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  };
}

