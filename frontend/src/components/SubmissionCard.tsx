import Link from 'next/link';
import { SubmissionStatus } from '@/lib/api';

interface SubmissionCardProps {
  submission: SubmissionStatus;
}

export default function SubmissionCard({ submission }: SubmissionCardProps) {
  // Format date
  const date = new Date(submission.created_at);
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  // Shorten ID
  const shortId = submission.id.split('-')[0];

  // Status Styling
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'processing':
      case 'pending':
      default:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };

  const statusStyle = getStatusStyles(submission.status);

  return (
    <Link href={`/editor?id=${submission.id}`} className="group block">
      <div className="grid grid-cols-12 gap-4 items-center px-6 py-4 transition-colors hover:bg-white/5 cursor-pointer">
        
        {/* Column 1: ID */}
        <div className="col-span-2">
          <span className="font-mono text-[13px] font-semibold tracking-wider text-white/90 group-hover:text-brand transition-colors">
            {shortId}
          </span>
        </div>

        {/* Column 2: Language */}
        <div className="col-span-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 opacity-80" />
          <span className="text-[13px] font-medium tracking-wide text-white/70 uppercase">
            {submission.language}
          </span>
        </div>

        {/* Column 3: Status */}
        <div className="col-span-2">
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide border ${statusStyle}`}>
            {submission.status}
          </span>
        </div>

        {/* Column 4: Complexity */}
        <div className="col-span-3">
          {submission.estimated_complexity ? (
            <span className="inline-flex items-center rounded bg-brand/10 px-2 py-0.5 font-mono text-[13px] text-brand border border-brand/20">
              {submission.estimated_complexity}
            </span>
          ) : (
             <span className="text-white/20 text-[13px] italic">Calculating...</span>
          )}
        </div>

        {/* Column 5: Timestamp */}
        <div className="col-span-3 flex items-center justify-end gap-3 text-right">
          <span className="text-[13px] text-white/50 font-medium">
            {formattedDate}
          </span>
          <svg className="h-4 w-4 text-white/20 group-hover:text-brand transition-colors rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>

      </div>
    </Link>
  );
}
