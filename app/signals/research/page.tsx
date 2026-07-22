import { PageHeader } from "@/app/components/ui";
import { ResearchClient } from "./research-client";

export const dynamic = "force-dynamic";
// Web search + model reasoning can take a while; give the action room to finish.
export const maxDuration = 60;

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Research signals"
        description="Pull recent market signals from the web, review them, and import the ones worth tracking."
      />
      <ResearchClient />
    </div>
  );
}
