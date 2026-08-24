// ─────────────────────────────────────────────────────────────────────────────
// Tabs — Premium segmented control with keyboard navigation
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useEffect } from "react";
import { C, cn } from "../../theme/colors";

export function Tabs({ items, value, onChange, style, className = "", variant = "default" }) {
  const containerRef = useRef(null);
  const buttonRefs = useRef([]);

  // Scroll active tab into view
  useEffect(() => {
    if (containerRef.current && buttonRefs.current[0]) {
      const activeIndex = items.indexOf(value);
      if (activeIndex >= 0 && buttonRefs.current[activeIndex]) {
        const button = buttonRefs.current[activeIndex];
        const container = containerRef.current;
        const scrollLeft = button.offsetLeft - (container.clientWidth - button.offsetWidth) / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [value, items]);

  const handleKeyDown = (e, index) => {
    let newIndex = index;
    if (e.key === "ArrowRight") newIndex = Math.min(index + 1, items.length - 1);
    else if (e.key === "ArrowLeft") newIndex = Math.max(index - 1, 0);
    else if (e.key === "Home") newIndex = 0;
    else if (e.key === "End") newIndex = items.length - 1;
    else return;
    
    e.preventDefault();
    onChange(items[newIndex]);
    buttonRefs.current[newIndex]?.focus();
  };

  const variants = {
    default: {
      container: {
        display: "inline-flex",
        gap: 4,
        padding: 4,
        background: C.surfaceAlt,
        border: `1px solid ${C.border}`,
        borderRadius: C.radiusLg,
        overflowX: "auto",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      },
      button: (active) => ({
        border: "none",
        background: active ? C.brand : "transparent",
        color: active ? "#fff" : C.textDim,
        borderRadius: C.radius,
        padding: "8px 14px",
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        whiteSpace: "nowrap",
        transition: `all ${C.fast}`,
        boxShadow: active ? C.shadowSm : "none",
      }),
    },
    pills: {
      container: {
        display: "inline-flex",
        gap: 6,
        background: "transparent",
        border: "none",
        padding: 0,
      },
      button: (active) => ({
        border: `1px solid ${active ? C.brand : C.border}`,
        background: active ? C.brandSoft : "transparent",
        color: active ? C.brand : C.textDim,
        borderRadius: C.radiusFull,
        padding: "8px 16px",
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        whiteSpace: "nowrap",
        transition: `all ${C.fast}`,
      }),
    },
    underline: {
      container: {
        display: "flex",
        gap: 0,
        borderBottom: `1px solid ${C.border}`,
        paddingBottom: 0,
        background: "transparent",
      },
      button: (active) => ({
        border: "none",
        background: "transparent",
        color: active ? C.brand : C.textDim,
        borderRadius: 0,
        padding: "12px 16px",
        fontSize: 13.5,
        fontWeight: active ? 700 : 500,
        borderBottom: `2px solid ${active ? C.brand : "transparent"}`,
        marginBottom: -1,
        whiteSpace: "nowrap",
        transition: `all ${C.fast}`,
      }),
    },
  };

  const v = variants[variant] || variants.default;

  return (
    <div
      ref={containerRef}
      className={cn("tabs-container", className)}
      style={{ ...v.container, ...style }}
      role="tablist"
      aria-label="Tab navigation"
    >
      {items.map((item, index) => {
        const active = item === value;
        return (
          <button
            key={item}
            ref={(el) => { buttonRefs.current[index] = el; }}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`tabpanel-${item}`}
            id={`tab-${item}`}
            onClick={() => onChange(item)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            style={v.button(active)}
            tabIndex={active ? 0 : -1}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}