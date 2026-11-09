// Applique le thème clair/sombre mémorisé avant l'affichage (évite un flash). Chargé de façon bloquante dans <head>.
try {
  const t = localStorage.getItem('skh-theme');
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
} catch (e) { /* stockage indisponible */ }
