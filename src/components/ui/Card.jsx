// ─────────────────────────────────────────────────────────────────────────────
// Card — clean enterprise surface container
// ─────────────────────────────────────────────────────────────────────────────

import { C } from "../../theme/colors";

export function Card({ children, style, className = "", ...props }) {
  return (
    <div
      {...props}
      className={`soft-card ${className}`.trim()}
      style={{
        borderRadius: 16,
        overflow: "clip",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, style, className = "", ...props }) {
  return (
    <div {...props} className={className} style={{ padding: "18px 20px 0", ...style }}>
      {children}
    </div>
  );
}

export function CardContent({ children, style, className = "", ...props }) {
  return (
    <div {...props} className={className} style={{ padding: 20, ...style }}>
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
        color: C.text,
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: "-0.01em",
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
        color: C.text2,
        fontSize: 11,
        marginTop: 4,
        lineHeight: 1.5,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
