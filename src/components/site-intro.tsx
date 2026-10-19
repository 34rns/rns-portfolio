export function SiteIntro() {
  // Apply the repeat-visit skip through an adopted stylesheet instead of a
  // class on <html>. React owns that element, so adding a class before
  // hydration made the server and client attribute sets disagree.
  const script = `
    try {
      if (sessionStorage.getItem("rns-intro") === "1") {
        if ("adoptedStyleSheets" in document && typeof CSSStyleSheet === "function") {
          var sheet = new CSSStyleSheet();
          sheet.replaceSync(".intro{display:none!important}");
          document.adoptedStyleSheets = document.adoptedStyleSheets.concat(sheet);
        }
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
