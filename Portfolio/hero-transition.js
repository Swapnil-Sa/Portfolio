"use strict";
/* V14 hero milestone. The dashboard image is a *rendered copy of V13's illustrative
   dashboard*, not a new project graphic; project files and portrait are untouched. */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const screens = {
    desktop: "assets/intro-dashboard-desktop.png",
    tablet: "assets/intro-dashboard-tablet.png",
    mobile: "assets/intro-dashboard-mobile.png"
  };

  function setupPortrait() {
    const portrait = document.querySelector(".v14-interactive-portrait");
    if (!portrait) return;
    let requested = 0;
    let pointerX = 0.5, pointerY = 0.5;
    let inside = false;

    function frame() {
      requested = 0;
      if (!inside || reduced.matches || !finePointer.matches) return;
      // Move only while the cursor is on the photo: never rotate continuously.
      portrait.style.setProperty("--portrait-x", `${((0.5 - pointerY) * 20).toFixed(2)}deg`);
      portrait.style.setProperty("--portrait-y", `${((pointerX - 0.5) * 25).toFixed(2)}deg`);
      portrait.style.setProperty("--portrait-lift", "17px");
      portrait.style.setProperty("--portrait-shift-x", `${((pointerX - 0.5) * -13).toFixed(1)}px`);
      portrait.style.setProperty("--portrait-shift-y", `${((pointerY - 0.5) * -13).toFixed(1)}px`);
    }
    function reset() {
      inside = false;
      portrait.classList.remove("is-interacting");
      if (requested) cancelAnimationFrame(requested);
      requested = 0;
      portrait.style.setProperty("--portrait-x", "0deg");
      portrait.style.setProperty("--portrait-y", "0deg");
      portrait.style.setProperty("--portrait-lift", "0px");
      portrait.style.setProperty("--portrait-shift-x", "0px");
      portrait.style.setProperty("--portrait-shift-y", "0px");
    }
    portrait.addEventListener("pointerenter", (event) => {
      if (!finePointer.matches || reduced.matches || event.pointerType === "touch") return;
      if (root.classList.contains("v14-intro-pending") && !root.classList.contains("v14-details-visible")) return;
      inside = true;
      portrait.classList.add("is-interacting");
    });
    portrait.addEventListener("pointermove", (event) => {
      if (!inside) return;
      const bounds = portrait.getBoundingClientRect();
      pointerX = Math.min(1,Math.max(0,(event.clientX-bounds.left)/bounds.width));
      pointerY = Math.min(1,Math.max(0,(event.clientY-bounds.top)/bounds.height));
      if (!requested) requested = requestAnimationFrame(frame);
    }, {passive:true});
    portrait.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", () => {if(document.hidden) reset();});
    reduced.addEventListener("change", reset);
  }

  function runDashboardHandoff({intro, finish}) {
    const panel = document.getElementById("insight-panel");
    const photo = document.querySelector(".hero-photo");
    if (!panel || !photo || reduced.matches) {
      root.classList.remove("v14-intro-pending");
      intro.classList.add("is-leaving");
      document.dispatchEvent(new Event("portfolio:entering"));
      finish();
      return;
    }
    window.scrollTo({top:0,behavior:"instant"});
    const rect = panel.getBoundingClientRect();
    const destination = photo.getBoundingClientRect();
    if (!rect.width || !rect.height || !destination.width) {
      root.classList.remove("v14-intro-pending");
      intro.classList.add("is-leaving");
      document.dispatchEvent(new Event("portfolio:entering"));
      finish();
      return;
    }
    const image = innerWidth <= 560 ? screens.mobile : innerWidth <= 980 ? screens.tablet : screens.desktop;
    const overlay = document.createElement("div");
    overlay.className = "v14-handoff-overlay";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);

    // Use a bounded number of raster tiles, never 20+ copies of live dashboard DOM.
    const cols = innerWidth < 560 ? 5 : 8;
    const rows = innerWidth < 560 ? 5 : 5;
    const w = rect.width / cols, h = rect.height / rows;
    const centerX = destination.left + destination.width * 0.5;
    const centerY = destination.top + destination.height * 0.47;
    const fragments = [];
    for (let y=0;y<rows;y++) for(let x=0;x<cols;x++) {
      const piece = document.createElement("span");
      piece.className = "v14-shard";
      piece.style.left = `${rect.left+x*w}px`;
      piece.style.top = `${rect.top+y*h}px`;
      piece.style.width = `${w+0.7}px`;
      piece.style.height = `${h+0.7}px`;
      piece.style.backgroundImage = `url("${image}")`;
      piece.style.backgroundSize = `${rect.width}px ${rect.height}px`;
      piece.style.backgroundPosition = `${-x*w}px ${-y*h}px`;
      overlay.appendChild(piece);
      fragments.push({piece,x,y});
    }
    // Warm cached image before exposing the fragments to avoid a blank tile flash.
    const decoded = new Image();
    decoded.src = image;
    const start = () => {
      if (!overlay.isConnected) return;
      const duration = innerWidth < 560 ? 850 : 1040;
      const deadline = duration + 350;
      intro.classList.add("is-shattering", "is-leaving");
      document.dispatchEvent(new Event("portfolio:entering"));
      for (const {piece,x,y} of fragments) {
        const tileCenterX = rect.left+(x+0.5)*w;
        const tileCenterY = rect.top+(y+0.5)*h;
        const spreadX = (x-cols/2)*15 + Math.sin((x+1)*(y+3))*23;
        const spreadY = (y-rows/2)*17 + Math.cos((x+3)*(y+1))*20;
        const dx = centerX - tileCenterX + spreadX;
        const dy = centerY - tileCenterY + spreadY;
        const rotation = ((x*13+y*19)%15-7)*6;
        const delay = ((x*7+y*11)%9)*23;
        piece.animate([
          { transform:"translate3d(0,0,0) rotate(0deg) scale(1)", opacity:1, filter:"blur(0px)" },
          { transform:`translate3d(${(dx*0.29+spreadX).toFixed(1)}px, ${(dy*0.32+spreadY).toFixed(1)}px, 95px) rotate(${rotation*.52}deg) scale(.93)`,opacity:.97,offset:.27 },
          { transform:`translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,-160px) rotate(${rotation}deg) scale(.11)`,opacity:0,filter:"blur(3px)" }
        ], {duration:duration,delay,easing:"cubic-bezier(.29,.04,.18,1)",fill:"forwards"});
      }
      window.setTimeout(() => root.classList.add("v14-portrait-visible"), 510);
      window.setTimeout(() => root.classList.add("v14-details-visible"), 1800);
      window.setTimeout(() => {finish();overlay.remove();}, deadline);
      window.setTimeout(() => {
        root.classList.remove("v14-intro-pending", "v14-portrait-visible", "v14-details-visible");
      }, 3400);
    };
    // Decode can fail when opening from a restricted local environment; always continue.
    if (decoded.complete && decoded.naturalWidth) start();
    else Promise.race([
      decoded.decode().catch(()=>{}),
      new Promise(resolve=>window.setTimeout(resolve,450))
    ]).then(start);
  }
  window.runDashboardHandoff = runDashboardHandoff;
  document.addEventListener("DOMContentLoaded",setupPortrait);
})();
