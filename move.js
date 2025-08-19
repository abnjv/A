
document.addEventListener("keydown", function(event) {
  let mics = document.querySelectorAll(".mic");
  if (!mics.length) return;
  let mic = mics[0]; // نختار أول مايك كمثال

  let style = window.getComputedStyle(mic);
  let top = parseInt(style.top || 100);
  let left = parseInt(style.left || 100);
  mic.style.position = "absolute";

  if (event.key === "ArrowUp") top -= 10;
  else if (event.key === "ArrowDown") top += 10;
  else if (event.key === "ArrowLeft") left -= 10;
  else if (event.key === "ArrowRight") left += 10;

  mic.style.top = top + "px";
  mic.style.left = left + "px";
});
