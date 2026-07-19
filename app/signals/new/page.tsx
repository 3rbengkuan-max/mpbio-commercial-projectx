import { PageHeader } from "@/app/components/ui";
import { SignalForm } from "./signal-form";

export default function NewSignalPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Log a signal"
        description="Capture a market event so the whole commercial team can see and act on it."
      />
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <SignalForm />
      </div>
    </div>
  );
}
