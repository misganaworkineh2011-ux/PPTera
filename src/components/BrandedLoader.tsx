// Self-contained, themeable full-screen loading screen used both by the global
// navigation overlay (NavigationContext) and by route-level loading.tsx files,
// so every "something is coming" moment looks identical and on-brand.
//
// Pure markup + CSS (no hooks), so it works as a server component inside
// loading.tsx and as a child of the client NavigationProvider alike.

export default function BrandedLoader({
  label = "Loading…",
  subtle = false,
}: {
  /** Message shown beneath the animation. */
  label?: string;
  /** When true, the backdrop is transparent (sits over existing content/skeletons). */
  subtle?: boolean;
}) {
  return (
    <div
      className={`ppt-loader-overlay${subtle ? " ppt-loader-overlay--subtle" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="ppt-loader">
        <span className="ppt-loader-ring" />
        <span className="ppt-loader-deck">
          <span className="ppt-loader-slide ppt-loader-slide-3" />
          <span className="ppt-loader-slide ppt-loader-slide-2" />
          <span className="ppt-loader-slide ppt-loader-slide-1">
            <i />
            <i />
            <i />
          </span>
        </span>
      </div>
      <p className="ppt-loader-text">{label}</p>

      <style>{LOADER_STYLES}</style>
    </div>
  );
}

const LOADER_STYLES = `
.ppt-loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 99998;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 26px;
  background: radial-gradient(120% 120% at 50% 35%, rgba(255,255,255,0.92) 0%, rgba(241,245,249,0.93) 60%, rgba(226,232,240,0.95) 100%);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  animation: ppt-loader-in 0.35s ease both;
}
.ppt-loader-overlay--subtle {
  background: rgba(248, 250, 252, 0.55);
}
@keyframes ppt-loader-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ppt-loader {
  position: relative;
  width: 96px;
  height: 96px;
  display: grid;
  place-items: center;
}
.ppt-loader-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #0f766e, #0d9488, #14b8a6, #2dd4bf, #0f766e);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px));
  animation: ppt-loader-spin 1s linear infinite;
}
@keyframes ppt-loader-spin {
  to { transform: rotate(360deg); }
}
.ppt-loader-deck {
  position: relative;
  width: 46px;
  height: 34px;
}
.ppt-loader-slide {
  position: absolute;
  inset: 0;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.35);
}
.ppt-loader-slide-3 { transform: translate(7px, 7px) rotate(6deg); opacity: 0.45; animation: ppt-loader-float 2.4s ease-in-out infinite; }
.ppt-loader-slide-2 { transform: translate(3px, 3px) rotate(3deg); opacity: 0.7; animation: ppt-loader-float 2.4s ease-in-out infinite 0.15s; }
.ppt-loader-slide-1 {
  padding: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  overflow: hidden;
  animation: ppt-loader-float 2.4s ease-in-out infinite 0.3s;
}
.ppt-loader-slide-1 i {
  display: block;
  height: 3px;
  border-radius: 2px;
  background: linear-gradient(90deg, #0f766e, #14b8a6);
  background-size: 220% 100%;
  animation: ppt-loader-line 1.4s ease-in-out infinite;
}
.ppt-loader-slide-1 i:nth-child(1) { width: 80%; }
.ppt-loader-slide-1 i:nth-child(2) { width: 100%; animation-delay: 0.2s; opacity: 0.75; }
.ppt-loader-slide-1 i:nth-child(3) { width: 60%; animation-delay: 0.4s; opacity: 0.55; }
@keyframes ppt-loader-line {
  0%, 100% { background-position: 0% 50%; opacity: 0.5; }
  50% { background-position: 120% 50%; opacity: 1; }
}
@keyframes ppt-loader-float {
  0%, 100% { transform: translate(7px, 7px) rotate(6deg); }
}
.ppt-loader-slide-3 { animation-name: ppt-loader-float-3; }
.ppt-loader-slide-2 { animation-name: ppt-loader-float-2; }
.ppt-loader-slide-1 { animation-name: ppt-loader-float-1; }
@keyframes ppt-loader-float-3 {
  0%, 100% { transform: translate(7px, 7px) rotate(6deg); }
  50% { transform: translate(9px, 5px) rotate(8deg); }
}
@keyframes ppt-loader-float-2 {
  0%, 100% { transform: translate(3px, 3px) rotate(3deg); }
  50% { transform: translate(4px, 1px) rotate(4deg); }
}
@keyframes ppt-loader-float-1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(0, -2px) rotate(0deg); }
}

.ppt-loader-text {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: #475569;
  background: linear-gradient(90deg, #475569 0%, #0f766e 25%, #14b8a6 50%, #0f766e 75%, #475569 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ppt-loader-text-shimmer 2.2s linear infinite;
}
@keyframes ppt-loader-text-shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: -200% 50%; }
}

@media (prefers-color-scheme: dark) {
  .ppt-loader-overlay {
    background: radial-gradient(120% 120% at 50% 35%, rgba(15,23,42,0.92) 0%, rgba(2,6,23,0.95) 100%);
  }
  .ppt-loader-overlay--subtle { background: rgba(2, 6, 23, 0.5); }
  .ppt-loader-text { color: #cbd5e1; }
}

@media (prefers-reduced-motion: reduce) {
  .ppt-loader-ring, .ppt-loader-slide, .ppt-loader-slide-1 i, .ppt-loader-text {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
  }
}
`;
