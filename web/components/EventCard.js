'use client';

const OWNER_STYLES = {
  primary: { badge: 'bg-apricot text-white', label: 'لك', accent: '#0a6bf5' },
  secondary: { badge: 'bg-warmyellow text-white', label: 'لزوجتك', accent: '#12b03a' },
};

function accentFor(event) {
  if (event.isFamilyEvent) return 'linear-gradient(180deg, #0a6bf5, #12b03a)';
  return (OWNER_STYLES[event.ownerColorTag] || OWNER_STYLES.primary).accent;
}

function OwnerBadge({ event }) {
  if (event.isFamilyEvent) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-l from-apricot to-warmyellow text-white">
        لكما معًا
      </span>
    );
  }
  const style = OWNER_STYLES[event.ownerColorTag] || OWNER_STYLES.primary;
  return (
    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full ${style.badge}`}>
      {style.label}
    </span>
  );
}

export default function EventCard({ event, onEdit, onDelete }) {
  const start = new Date(event.startAt);
  const time = event.allDay
    ? 'طوال اليوم'
    : start.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="group flex items-start gap-3 rounded-2xl bg-[#20265a] border border-white/5 px-4 py-3.5">
      <div className="w-16 shrink-0 pt-0.5 text-xs font-bold text-white/40 tabular-nums">{time}</div>
      <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: accentFor(event) }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-[15px] truncate text-white">{event.title}</h3>
          <OwnerBadge event={event} />
        </div>
        {event.location && <p className="mt-1 text-xs text-white/50">📍 {event.location}</p>}
        {event.notes && <p className="mt-1 text-xs text-white/35 line-clamp-2">{event.notes}</p>}
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button
          onClick={() => onEdit(event)}
          className="text-sm px-2 py-1 rounded-md hover:bg-white/10 active:bg-white/10"
          aria-label="تعديل الموعد"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(event)}
          className="text-sm px-2 py-1 rounded-md hover:bg-white/10 active:bg-white/10"
          aria-label="حذف الموعد"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
