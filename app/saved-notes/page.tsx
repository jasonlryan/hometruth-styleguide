import { redirect } from "next/navigation";

export default function SavedNotesRedirect() {
  redirect("/notes");
}
