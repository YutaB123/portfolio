// Lightweight demo slideshow (lightbox) for the project cards.
// Each entry is a list of steps; a step is an image or a video, with a caption.
(function () {
  "use strict";

  const DEMOS = {
    adsnap: {
      title: "AdSnap",
      steps: [
        { img: "assets/demos/adsnap-1.jpg", cap: "Point your phone at any item — center it in the box and tap." },
        { img: "assets/demos/adsnap-2.jpg", cap: "The AI hires a virtual film crew: writes the ad, films scenes, records a voiceover, adds music." },
        { img: "assets/demos/adsnap-out1.jpg", cap: "It generates cinematic product shots…" },
        { img: "assets/demos/adsnap-out2.jpg", cap: "…each with an on-screen slogan." },
        { video: "assets/adsnap-demo.mp4", cap: "~2 minutes later: a finished commercial with voiceover and music." },
      ],
    },
    recipe: {
      title: "recipe.AI",
      steps: [
        { img: "assets/demos/recipe-1.jpg", cap: "Open recipe.AI and point at your open fridge." },
        { img: "assets/demos/recipe-2.jpg", cap: "Snap a photo of everything inside." },
        { img: "assets/demos/recipe-3.jpg", cap: "Claude detects your ingredients — edit the list before cooking." },
        { img: "assets/demos/recipe-4.jpg", cap: "Get dish ideas, each with cook time and full nutrition." },
        { img: "assets/demos/recipe-5.jpg", cap: "Tap a dish for the complete recipe and steps." },
      ],
    },
    dubly: {
      title: "Dubly",
      steps: [
        { img: "assets/demos/dubly-1.jpg", cap: "Dubly sees your real UW Canvas classes — ask it anything." },
        { img: "assets/demos/dubly-reminders.jpg", cap: "Set reminders & alerts — get a buzz on a schedule, or just say \"remind me every morning what's due.\"" },
        { img: "assets/demos/dubly-quiz-ask.jpg", cap: "Ask it to make a quiz for an exam…" },
        { img: "assets/demos/dubly-2.jpg", cap: "…and study with instant answers and explanations." },
        { img: "assets/demos/dubly-flash-ask.jpg", cap: "Ask for flashcards on a topic…" },
        { img: "assets/demos/dubly-3.jpg", cap: "…and it builds you a study deck." },
        { img: "assets/demos/dubly-doc-ask.jpg", cap: "Ask for a Word doc about an assignment…" },
        { img: "assets/demos/dubly-4.jpg", cap: "…and it drafts the document, ready to download." },
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

  // Let the projects CircularGallery open these same lightboxes on tap.
  window.openProjectDemo = open;

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
