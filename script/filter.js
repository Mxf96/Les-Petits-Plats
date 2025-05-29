// Activer/désactiver l'ouverture au clic
document.querySelectorAll(".select-header").forEach((header) => {
  header.addEventListener("click", () => {
    const parent = header.closest(".custom-select");
    parent.classList.toggle("active");
  });
});

// Fermer les autres menus si on clique ailleurs
document.addEventListener("click", (e) => {
  document.querySelectorAll(".custom-select").forEach((select) => {
    if (!select.contains(e.target)) {
      select.classList.remove("active");
    }
  });
});