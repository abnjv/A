function sendMessage() {
  var msg = document.getElementById("msg").value;
  if (msg) {
    var messages = document.getElementById("messages");
    var newMsg = document.createElement("div");
    newMsg.innerText = "🧑‍💻 أنت: " + msg;
    messages.appendChild(newMsg);
    document.getElementById("msg").value = "";
  }
}
