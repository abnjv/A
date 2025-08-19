function sendGift() {
  var messages = document.getElementById("messages");
  var gift = document.createElement("div");
  gift.innerText = "🎁 أرسلت هدية جميلة!";
  gift.style.color = "green";
  messages.appendChild(gift);
}
