/* Heaven & Eve — Tweaks island.
   Mounts a small React app that drives the whole page's feel via CSS variables. */

const HE_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": ["#bd5430", "#9c4222"],
  "display": "editorial"
}/*EDITMODE-END*/;

const HE_FONTS = {
  editorial: "'Instrument Serif', Georgia, serif",
  modern: "'Bricolage Grotesque', system-ui, sans-serif",
  classic: "'Playfair Display', Georgia, serif",
};

const HE_DISPLAY_TRACKING = {
  editorial: "-0.01em",
  modern: "-0.02em",
  classic: "0",
};

const HE_DISPLAY_WEIGHT = {
  editorial: "400",
  modern: "700",
  classic: "500",
};

function HETweaks() {
  const [t, setTweak] = useTweaks(HE_TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    const accent = Array.isArray(t.accent) ? t.accent : [t.accent, t.accent];
    root.style.setProperty("--clay", accent[0]);
    root.style.setProperty("--clay-deep", accent[1] || accent[0]);
    root.style.setProperty("--display", HE_FONTS[t.display] || HE_FONTS.editorial);
    root.style.setProperty("--display-tracking", HE_DISPLAY_TRACKING[t.display] || "-0.01em");
    root.style.setProperty("--display-weight", HE_DISPLAY_WEIGHT[t.display] || "400");
  }, [t.accent, t.display]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Accent" />
      <TweakColor
        label="House colour"
        value={t.accent}
        options={[
          ["#bd5430", "#9c4222"],
          ["#8a5a34", "#6d4626"],
          ["#c08a35", "#9c6f24"],
          ["#a8443f", "#86322e"],
        ]}
        onChange={(v) => setTweak("accent", v)}
      />
      <TweakSection label="Headline type" />
      <TweakRadio
        label="Voice"
        value={t.display}
        options={[
          { value: "editorial", label: "Editorial" },
          { value: "modern", label: "Modern" },
          { value: "classic", label: "Classic" },
        ]}
        onChange={(v) => setTweak("display", v)}
      />
    </TweaksPanel>
  );
}

(function mountHETweaks() {
  const el = document.getElementById("tweaks-root");
  if (el && window.ReactDOM) {
    ReactDOM.createRoot(el).render(<HETweaks />);
  }
})();
