// Simple scroll effect for header background
document.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  header.style.background = window.scrollY > 80 ? "rgba(10,14,25,0.95)" : "rgba(10,14,25,0.7)";
});
