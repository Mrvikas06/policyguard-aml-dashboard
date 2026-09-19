// ─────────────────────────────────────────────────────────────────────────────
// Card — Premium surface container with consistent styling
// ─────────────────────────────────────────────────────────────────────────────

import { cn } from "../../theme/colors";

export function Card({ children, elevated = false, interactive = false, style, className = "", ...props }) {
  return (
    <div
      {...props}
      className={cn(
        "modern-card",
        elevated ? "card-elevated" : "",
        interactive ? "card-interactive" : "",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, style, className = "", ...props }) {
  return (
    <div {...props} className={className} style={{ padding: "20px 24px 0", ...style }}>
      {children}
    </div>
  );
}

export function CardContent({ children, style, className = "", ...props }) {
  return (
    <div {...props} className={className} style={{ padding: 24, ...style }}>
      {children}
    </div>
  );
}

export function CardTitle({ children, style, className = "", ...props }) {
  return (
    <div
      {...props}
      className={className}
      style={{
        color: "var(--color-text)",
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardDescription({ children, style, className = "", ...props }) {
  return (
    <div
      {...props}
      className={className}
      style={{
        color: "var(--color-text-dim)",
        fontSize: 13,
        marginTop: 6,
        lineHeight: 1.5,
        ...style,
      }}
    >
      {children}
    </div>
  );
}