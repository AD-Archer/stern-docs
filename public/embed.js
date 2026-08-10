/**
 * Drop-in embed helper for a Stern docs site.
 *
 * The docs report their own height (see src/components/embed-bridge.tsx), and
 * this listens for that and resizes the iframe, so an embedded manual never has
 * its own scrollbar inside somebody else's page.
 *
 * Usage — put this anywhere in the host page:
 *
 *   <div data-stern-docs="https://docs.example.com/cloudfall"></div>
 *   <script src="https://docs.example.com/embed.js" defer></script>
 *
 * Optional attributes on the div:
 *   data-nav="0"                   hide the header and contents rail
 *   data-height="1200"             starting height before the first message
 *
 * Any framework can skip this file: render an <iframe> at the same URL with
 * ?embed=1 and listen for the "stern-docs:size" message yourself. It's 10 lines.
 */
(function () {
  "use strict";

  var MESSAGE = "stern-docs:size";
  var frames = [];

  function mount(host) {
    var src = host.getAttribute("data-stern-docs");
    if (!src) return;

    var url;
    try {
      url = new URL(src, window.location.href);
    } catch {
      return; // Not a URL we can build on.
    }

    url.searchParams.set("embed", "1");
    ["nav"].forEach(function (key) {
      var value = host.getAttribute("data-" + key);
      if (value) url.searchParams.set(key, value);
    });

    var frame = document.createElement("iframe");
    frame.src = url.toString();
    frame.title = host.getAttribute("data-title") || "Documentation";
    frame.loading = "lazy";
    frame.style.width = "100%";
    frame.style.border = "0";
    frame.style.display = "block";
    frame.style.height = (host.getAttribute("data-height") || "900") + "px";
    // The docs are same-site content but sandboxing costs nothing to be explicit
    // about: they need scripts and same-origin storage, and nothing else.
    frame.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox",
    );

    host.appendChild(frame);
    frames.push({ frame: frame, origin: url.origin });
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.type !== MESSAGE || typeof data.height !== "number") return;

    for (var i = 0; i < frames.length; i++) {
      // Match on the sending window, not just the origin: a page may embed more
      // than one docs frame, and each should size itself.
      if (frames[i].frame.contentWindow === event.source) {
        if (event.origin !== frames[i].origin) return;
        frames[i].frame.style.height = Math.max(240, data.height) + "px";
        return;
      }
    }
  });

  function init() {
    var hosts = document.querySelectorAll("[data-stern-docs]");
    for (var i = 0; i < hosts.length; i++) {
      if (!hosts[i].querySelector("iframe")) mount(hosts[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
