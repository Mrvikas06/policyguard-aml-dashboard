// ─────────────────────────────────────────────────────────────────────────────
// Tabs — compact segmented control
// ─────────────────────────────────────────────────────────────────────────────

import { C } from "../../theme/colors";

export function Tabs({ items, value, onChange, style, className = "" }) {
  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        gap: 4,
        padding: 4,
        background: C.panelAlt,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        ...style,
      }}
    >
      {items.map((item) => {
        const active = item === value;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className="pg-tab"
            data-active={active}
            style={{
              border: "none",
              background: active ? C.surface : "transparent",
              color: active ? C.text : C.text2,
              borderRadius: 9,
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
