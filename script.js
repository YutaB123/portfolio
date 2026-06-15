// Lightweight demo slideshow (lightbox) for the project cards.
// Each entry is a list of steps; a step is an image or a video, with a caption.
(function () {
  "use strict";

  const DEMOS = {
    adsnap: {
      title: "AdSnap",
      steps: [
        { video: "assets/adsnap-demo.mp4", cap: "One photo in → a finished ~15s commercial out, with voiceover and music." },
        { img: "assets/demos/adsnap-out1.jpg", cap: "The AI directs cinematic product shots…" },
        { img: "assets/demos/adsnap-out2.jpg", cap: "…each with an on-screen slogan." },
      ],
    },
    recipe: {
      title: "recipe.AI",
      // Placeholder overview until the individual screens are re-added.
      steps: [
        { img: "assets/screenshots/recipe.jpg", cap: "Capture your fridge → AI dish ideas → a full recipe with nutrition." },
      ],
    },
    study: {
      title: "Study Assistant",
      steps: [
        { img: "assets/screenshots/canvas.jpg", cap: "Text it like a friend — answers from your real Canvas, sets reminders, makes study guides." },
      ],
    },
  };

  let overlay, mediaEl, capEl, counterEl, dotsEl, prevBtn, nextBtn;
  let steps = [];
  let idx = 0;

  function build() {
    overlay = document.createElement("div");
    overlay.className = "lb-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `
      <button class="lb-close" aria-label="Close">&times;</button>
      <button class="lb-nav lb-prev" aria-label="Previous">&#8249;</button>
      <div class="lb-stage">
        <div class="lb-media"></div>
        <p class="lb-cap"></p>
        <div class="lb-meta"><span class="lb-counter"></span><div class="lb-dots"></div></div>
      </div>
      <button class="lb-nav lb-next" aria-label="Next">&#8250;</button>`;
    document.body.appendChild(overlay);

    mediaEl = overlay.querySelector(".lb-media");
    capEl = overlay.querySelector(".lb-cap");
    counterEl = overlay.querySelector(".lb-counter");
    dotsEl = overlay.querySelector(".lb-dots");
    prevBtn = overlay.querySelector(".lb-prev");
    nextBtn = overlay.querySelector(".lb-next");

    overlay.querySelector(".lb-close").addEventListener("click", close);
    prevBtn.addEventListener("click", () => go(idx - 1));
    nextBtn.addEventListener("click", () => go(idx + 1));
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    document.addEventListener("keydown", (e) => {
      if (!overlay.classList.contains("lb-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") go(idx - 1);
      else if (e.key === "ArrowRight") go(idx + 1);
    });
  }

  function render() {
    const s = steps[idx];
    mediaEl.innerHTML = s.video
      ? `<video class="lb-img" src="${s.video}" controls autoplay playsinline></video>`
      : `<img class="lb-img" src="${s.img}" alt="${s.cap.replace(/"/g, "&quot;")}" />`;
    capEl.textContent = s.cap;
    const single = steps.length <= 1;
    counterEl.textContent = single ? "" : `${idx + 1} / ${steps.length}`;
    prevBtn.style.visibility = single ? "hidden" : "visible";
    nextBtn.style.visibility = single ? "hidden" : "visible";
    dotsEl.innerHTML = single ? "" : steps.map((_, i) =>
      `<span class="lb-dot${i === idx ? " on" : ""}"></span>`).join("");
  }

  function go(n) {
    if (n < 0 || n >= steps.length) return;
    idx = n;
    render();
  }

  function open(key) {
    const demo = DEMOS[key];
    if (!demo) return;
    steps = demo.steps;
    idx = 0;
    render();
    overlay.classList.add("lb-open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.remove("lb-open");
    document.body.style.overflow = "";
    mediaEl.innerHTML = ""; // stop any video
  }

  document.addEventListener("DOMContentLoaded", function () {
    build();
    document.querySelectorAll("[data-demo]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        open(btn.getAttribute("data-demo"));
      });
    });
  });
})();
