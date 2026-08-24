// ─────────────────────────────────────────────────────────────────────────────
// Avatar — Premium user avatar with initials fallback and status indicator
// ─────────────────────────────────────────────────────────────────────────────

import { C, cn, styleUtils } from "../../theme/colors";

const colorPalette = [
  C.brand, C.accent, C.violet, C.rose, C.amberSoft, C.mint, C.sky, C.high,
];

function hashToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colorPalette[Math.abs(hash) % colorPalette.length];
}

export function Avatar({
  name = "User",
  src,
  size = "md",
  status,
  statusPosition = "bottom-right",
  className = "",
  style,
  ...props
}) {
  const sizes = {
    xs: { width: 24, height: 24, fontSize: 9, statusSize: 6 },
    sm: { width: 32, height: 32, fontSize: 11, statusSize: 7 },
    md: { width: 40, height: 40, fontSize: 13, statusSize: 8 },
    lg: { width: 56, height: 56, fontSize: 18, statusSize: 10 },
    xl: { width: 72, height: 72, fontSize: 22, statusSize: 12 },
  };

  const { width, height, fontSize, statusSize } = sizes[size];

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const bgColor = src ? "transparent" : hashToColor(name);

  const statusColors = {
    online: C.resolved,
    busy: C.critical,
    away: C.high,
    offline: C.textMuted,
  };

  return (
    <div
      {...props}
      className={cn("avatar", className)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width,
        height,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        ...style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
            background: bgColor,
            color: "#fff",
            fontWeight: 700,
            fontSize,
            letterSpacing: "0.02em",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          style={{
            position: "absolute",
            bottom: statusPosition.includes("bottom") ? -2 : "auto",
            top: statusPosition.includes("top") ? -2 : "auto",
            right: statusPosition.includes("right") ? -2 : "auto",
            left: statusPosition.includes("left") ? -2 : "auto",
            width: statusSize,
            height: statusSize,
            borderRadius: "50%",
            background: statusColors[status] || C.resolved,
            border: `2px solid ${C.bg}`,
            boxShadow: styleUtils.shadowSm,
          }}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

export function AvatarGroup({ avatars = [], max = 5, size = "md", className = "", style, ...props }) {
  const sizes = { xs: -6, sm: -8, md: -10, lg: -14, xl: -18 };
  const overlap = sizes[size];

  return (
    <div
      {...props}
      className={cn("avatar-group", className)}
      style={{
        display: "inline-flex",
        ...style,
      }}
    >
      {avatars.slice(0, max).map((avatar, i) => (
        <Avatar
          key={i}
          {...avatar}
          size={size}
          style={{
            ...avatar.style,
            marginLeft: i > 0 ? overlap : 0,
            zIndex: max - i,
            border: `2px solid ${C.bg}`,
            boxShadow: i > 0 ? styleUtils.shadowSm : "none",
          }}
        />
      ))}
      {avatars.length > max && (
        <Avatar
          name={`+${avatars.length - max}`}
          size={size}
          src={null}
          style={{
            marginLeft: overlap,
            background: C.surfaceAlt,
            color: C.textDim,
            fontWeight: 600,
            border: `2px solid ${C.bg}`,
            boxShadow: styleUtils.shadowSm,
          }}
        />
      )}
    </div>
  );
}