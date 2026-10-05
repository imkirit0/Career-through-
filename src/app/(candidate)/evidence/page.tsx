import { redirect } from "next/navigation";

// Evidence now lives inside My Plan; old links and bookmarks land on its history.
export default function EvidencePage() {
  redirect("/plan?view=history");
}
