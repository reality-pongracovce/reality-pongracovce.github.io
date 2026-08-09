// Mobilné menu
const menuTlacidlo = document.querySelector(".menu-tlacidlo");
const menu = document.querySelector(".menu");

if (menuTlacidlo && menu) {
  menuTlacidlo.addEventListener("click", () => {
    menu.classList.toggle("otvorene");
  });
}

// Lightbox galérie
const polozky = Array.from(document.querySelectorAll(".galeria-mriezka figure"));
const lightbox = document.querySelector(".lightbox");

if (lightbox && polozky.length > 0) {
  const obrazok = lightbox.querySelector("img");
  const popisok = lightbox.querySelector(".popisok");
  let aktualny = 0;

  function zobraz(i) {
    aktualny = (i + polozky.length) % polozky.length;
    const zdroj = polozky[aktualny].querySelector("img");
    obrazok.src = zdroj.dataset.plne || zdroj.src;
    obrazok.alt = zdroj.alt;
    popisok.textContent = polozky[aktualny].querySelector("figcaption")?.textContent || "";
    lightbox.classList.add("otvoreny");
    document.body.style.overflow = "hidden";
  }

  function zavri() {
    lightbox.classList.remove("otvoreny");
    document.body.style.overflow = "";
  }

  polozky.forEach((figura, i) => {
    figura.addEventListener("click", () => zobraz(i));
  });

  lightbox.querySelector(".zavriet").addEventListener("click", zavri);
  lightbox.querySelector(".predchadzajuci").addEventListener("click", (e) => {
    e.stopPropagation();
    zobraz(aktualny - 1);
  });
  lightbox.querySelector(".nasledujuci").addEventListener("click", (e) => {
    e.stopPropagation();
    zobraz(aktualny + 1);
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) zavri();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("otvoreny")) return;
    if (e.key === "Escape") zavri();
    if (e.key === "ArrowLeft") zobraz(aktualny - 1);
    if (e.key === "ArrowRight") zobraz(aktualny + 1);
  });
}
