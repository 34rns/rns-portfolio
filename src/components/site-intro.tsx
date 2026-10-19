export function SiteIntro() {
  const script = `
    try {
      if (sessionStorage.getItem("rns-intro") === "1") {
        document.documentElement.classList.add("intro-skip");
      } else {
        window.setTimeout(function () {
          try { sessionStorage.setItem("rns-intro", "1"); } catch (error) {}
        }, 1200);
      }
    } catch (error) {}
  `;

  return (
    <>
      <script
        // Runs before paint so repeat visits never flash the overlay.
        dangerouslySetInnerHTML={{ __html: script }}
      />
      <div className="intro" aria-hidden="true">
        <span className="intro-mark display">RNS</span>
        <span className="intro-rule" />
      </div>
    </>
  );
}
