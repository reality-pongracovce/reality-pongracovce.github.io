// ===== Hlavička — priehľadná nad hero, plná po odskrolovaní =====
const top_ = document.querySelector(".top");

function headerState() {
  top_.classList.toggle("solid", window.scrollY > 40);
}
headerState();
window.addEventListener("scroll", headerState, { passive: true });

// ===== Mobilné menu =====
const burger = document.querySelector(".burger");
const nav = document.querySelector(".nav");

if (burger && nav) {
  burger.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open"))
  );
}

// ===== Odhalenie sekcií pri skrolovaní =====
const revealables = document.querySelectorAll(".reveal");

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

revealables.forEach((el) => io.observe(el));

// ===== Animované počítadlá parametrov =====
function animateCount(el) {
  const locale = document.documentElement.lang === "en" ? "en-GB" : "sk-SK";
  const decimalSep = locale === "en-GB" ? "." : ",";
  const target = parseFloat(el.dataset.count.replace(",", "."));
  const decimals = el.dataset.count.includes(",") ? 2 : 0;
  const dur = 1400;
  const t0 = performance.now();

  function tick(t) {
    const p = Math.min((t - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    let val = (target * eased).toFixed(decimals);
    if (decimals > 0) val = val.replace(".", decimalSep);
    else val = Number(val).toLocaleString(locale);
    el.textContent = val;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statIo = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCount(e.target);
        statIo.unobserve(e.target);
      }
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll("[data-count]").forEach((el) => statIo.observe(el));

// ===== Galéria — lightbox =====
const figs = Array.from(document.querySelectorAll(".gallery figure"));
const lb = document.querySelector(".lightbox");

if (lb && figs.length) {
  const lbImg = lb.querySelector("img");
  const lbCap = lb.querySelector(".cap");
  let cur = 0;

  function show(i) {
    cur = (i + figs.length) % figs.length;
    const src = figs[cur].querySelector("img");
    lbImg.src = src.src;
    lbImg.alt = src.alt;
    lbCap.textContent = figs[cur].querySelector("figcaption")?.textContent || "";
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function hide() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }

  figs.forEach((f, i) => f.addEventListener("click", () => show(i)));
  lb.querySelector(".lb-close").addEventListener("click", hide);
  lb.querySelector(".lb-prev").addEventListener("click", (e) => { e.stopPropagation(); show(cur - 1); });
  lb.querySelector(".lb-next").addEventListener("click", (e) => { e.stopPropagation(); show(cur + 1); });
  lb.addEventListener("click", (e) => { if (e.target === lb) hide(); });

  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") hide();
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
}

// ===== Mapa (Leaflet) — spoľahlivý zoom, koliesko až po kliknutí =====
const mapEl = document.getElementById("mapa");

if (mapEl && window.L) {
  const poloha = [49.01745, 20.82452];
  const mapa = L.map(mapEl, {
    center: poloha,
    zoom: 13,
    scrollWheelZoom: false,
    zoomSnap: 1,
    wheelPxPerZoomLevel: 120,
  });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapa);

  L.marker(poloha).addTo(mapa).bindPopup(mapEl.dataset.popup).openPopup();

  mapa.on("click", () => mapa.scrollWheelZoom.enable());
  mapEl.addEventListener("mouseleave", () => mapa.scrollWheelZoom.disable());

  // prepočet rozmerov po scroll-reveal animácii kontajnera
  setTimeout(() => mapa.invalidateSize(), 900);
}

// ===== Formulár — odoslanie na pozadí, zákazník ostáva na webe =====
const form = document.querySelector(".form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = form.dataset.sending;

    let note = form.querySelector(".form-msg");
    if (note) note.remove();

    try {
      const res = await fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("send failed");
      form.innerHTML = `
        <div class="form-ok">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8.5 12.5 2.5 2.5 5-6"/></svg>
          <p>${form.dataset.success}</p>
        </div>`;
    } catch {
      btn.disabled = false;
      btn.textContent = original;
      btn.insertAdjacentHTML(
        "afterend",
        `<p class="form-msg form-err">${form.dataset.error}</p>`
      );
    }
  });
}
