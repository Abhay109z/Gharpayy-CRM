export function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatTimeAgo(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function formatDeadline(isoString: string): { text: string; isOverdue: boolean } {
  if (!isoString) return { text: 'No deadline', isOverdue: false };
  const target = new Date(isoString);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 0) {
    const overdueMins = Math.abs(diffMins);
    if (overdueMins < 60) {
      return { text: `Overdue by ${overdueMins}m`, isOverdue: true };
    }
    const overdueHours = Math.floor(overdueMins / 60);
    return { text: `Overdue by ${overdueHours}h ${overdueMins % 60}m`, isOverdue: true };
  }

  if (diffMins < 60) {
    return { text: `Due in ${diffMins}m`, isOverdue: false };
  }
  const hours = Math.floor(diffMins / 60);
  return { text: `Due in ${hours}h ${diffMins % 60}m`, isOverdue: false };
}

export const STAGE_CONFIG: Record<string, { label: string; badgeClass: string; color: string; dotClass: string }> = {
  new_lead: { label: 'New Inquiry', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 shadow-xs', color: '#4f46e5', dotClass: 'bg-indigo-500' },
  contacted: { label: 'Contacted', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/80 shadow-xs', color: '#0284c7', dotClass: 'bg-sky-500' },
  tour_scheduled: { label: 'Tour Scheduled', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-xs', color: '#d97706', dotClass: 'bg-amber-500' },
  tour_completed: { label: 'Tour Completed', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-xs', color: '#059669', dotClass: 'bg-emerald-500' },
  quote_sent: { label: 'Quote Sent', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80 shadow-xs', color: '#9333ea', dotClass: 'bg-purple-500' },
  decision_pending: { label: 'Decision Pending', badgeClass: 'bg-orange-50 text-orange-800 border-orange-200/80 shadow-xs', color: '#ea580c', dotClass: 'bg-orange-500' },
  booking_confirmed: { label: 'Booking Confirmed', badgeClass: 'bg-teal-50 text-teal-800 border-teal-200/80 shadow-xs', color: '#0d9488', dotClass: 'bg-teal-500' },
  money_pending: { label: 'Money Pending', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80 shadow-xs', color: '#e11d48', dotClass: 'bg-rose-500' },
  check_in_done: { label: 'Check-in Done', badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-xs', color: '#10b981', dotClass: 'bg-emerald-600' },
  lost: { label: 'Lost / Closed', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 shadow-xs', color: '#64748b', dotClass: 'bg-slate-400' },
};
