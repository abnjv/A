
var current = 0;
var backgrounds = ["#f0f8ff", "#fff0f5", "#e6ffe6", "#ffffcc", "#e0ffff"];
function changeBackground() {
  current = (current + 1) % backgrounds.length;
  document.getElementById("mainRoom").style.background = backgrounds[current];
}
setInterval(changeBackground, 5000); // تغيير كل 5 ثوانٍ تلقائيًا
