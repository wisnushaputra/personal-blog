import { Lightbulb } from 'lucide-react';

interface WisnuCalloutProps {
  children: React.ReactNode;
}

export function WisnuCallout({ children }: WisnuCalloutProps) {
  return (
    <div className="my-6 rounded-lg border-l-4 border-highlight bg-surface p-4">
      <div className="mb-2 flex items-center gap-3">
        <Lightbulb className="h-5 w-5 text-highlight" />
        <span className="font-semibold text-ink">Catatan Wisnu</span>
      </div>
      <div className="text-sm italic leading-relaxed text-ink">{children}</div>
    </div>
  );
}
