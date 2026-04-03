import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ActivityItem } from "../types/dashboard";

interface ActivityFeedTableProps {
  items: ActivityItem[];
}

export default function ActivityFeedTable({ items }: ActivityFeedTableProps): JSX.Element {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const shouldVirtualize = items.length > 100;

  const rowVirtualizer = useVirtualizer({
    count: shouldVirtualize ? items.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 8,
  });

  const rows = useMemo(() => {
    if (!shouldVirtualize) {
      return items.map((item, index) => ({
        key: item.id,
        index,
        item,
        style: undefined,
      }));
    }

    return rowVirtualizer.getVirtualItems().map((virtualRow) => ({
      key: items[virtualRow.index]?.id ?? virtualRow.key,
      index: virtualRow.index,
      item: items[virtualRow.index],
      style: {
        transform: `translateY(${virtualRow.start}px)`,
        position: "absolute" as const,
        top: 0,
        left: 0,
        width: "100%",
      },
    }));
  }, [items, rowVirtualizer, shouldVirtualize]);

  return (
    <div className="rounded-2xl border border-white/50 bg-white/85 p-4 shadow-panel">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold">Activity Feed</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {items.length} events
        </span>
      </div>

      <div className="grid grid-cols-[2fr_1fr_1fr_2fr] gap-2 border-b border-slate-200 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <p>Event</p>
        <p>Type</p>
        <p>When</p>
        <p>User</p>
      </div>

      <div ref={parentRef} className="mt-2 max-h-[420px] overflow-auto">
        <div
          className="relative"
          style={{
            height: shouldVirtualize ? `${rowVirtualizer.getTotalSize()}px` : "auto",
          }}
        >
          {rows.map((row) => {
            const item = row.item;

            if (!item) {
              return null;
            }

            return (
              <div
                key={row.key}
                style={row.style}
                className="grid grid-cols-[2fr_1fr_1fr_2fr] gap-2 border-b border-slate-100 py-3 text-sm"
              >
                <p className="font-semibold text-slate-700">{item.event_name}</p>
                <p className="text-slate-500">{item.event_type}</p>
                <p className="text-slate-500">
                  {new Date(item.occurred_at).toLocaleDateString()}
                </p>
                <p className="truncate text-slate-600">{item.user_email ?? "Unknown"}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
