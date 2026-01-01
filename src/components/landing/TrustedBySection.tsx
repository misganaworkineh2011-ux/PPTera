"use client";

const logos = [
  { name: "duolingo", display: "duolingo" },
  { name: "GitHub", display: "GitHub" },
  { name: "Microsoft", display: "Microsoft" },
  { name: "NETFLIX", display: "NETFLIX" },
  { name: "The New York Times", display: "The New York Times" },
  { name: "Pentagram", display: "Pentagram" },
  { name: "slack", display: "slack" },
  { name: "stripe", display: "stripe" },
  { name: "zoom", display: "zoom" },
  { name: "airbnb", display: "airbnb" },
  { name: "ATLASSIAN", display: "ATLASSIAN" },
  { name: "Dropbox", display: "Dropbox" },
];

export function TrustedBySection() {
  return (
    <section className="py-2 border-y border-zinc-100 overflow-hidden bg-white" aria-label="Trusted by leading companies">
      <div className="relative w-full overflow-hidden">
        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {/* First set */}
          <div className="flex items-center gap-12 px-6 shrink-0">
            {logos.map((logo, i) => (
              <span
                key={`a-${i}`}
                className="text-zinc-600 font-semibold text-sm tracking-wide whitespace-nowrap"
              >
                {logo.display}
              </span>
            ))}
          </div>

          {/* Duplicate for seamless loop */}
          <div className="flex items-center gap-12 px-6 shrink-0" aria-hidden="true">
            {logos.map((logo, i) => (
              <span
                key={`b-${i}`}
                className="text-zinc-600 font-semibold text-sm tracking-wide whitespace-nowrap"
              >
                {logo.display}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
