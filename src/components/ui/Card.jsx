// ─────────────────────────────────────────────────────────────────────────────
// Card — Premium surface container with consistent styling
// ─────────────────────────────────────────────────────────────────────────────

import { C, styleUtils, cn } from "../../theme/colors";

const baseCard = styleUtils.glass(false);
const elevatedCard = styleUtils.glass(true);

export function Card({ children, elevated = false, interactive = false, style, className = "", ...props }) {
  return (
    <div
      {...props}
      className={cn("card", interactive ? "card-interactive" : "", elevated ? "card-elevated" : "", className)}
      style={{
        ...(elevated ? elevatedCard : baseCard),
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
        fontSize: 16.5,
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
        color: C.textDim,
        fontSize: 12.5,
        marginTop: 5,
        lineHeight: 1.5,
        ...style,
      }}
    >
      {children}
    </div>
  );
}