const fs = require("fs");
const path = require("path");
const express = require("express");
const http = require("http");
const fca = require("fca-mafiya");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- TRIPLE-METHOD LOGIC (Most Stable for your cookies) ---
function loginWithCookie(cookieString, cb) {
  const methods = [
    next => { try { const appState = JSON.parse(cookieString); fca.login({ appState }, (e, api) => next(api)); } catch { next(null); } },
    next => { fca.login({ appState: cookieString }, (e, api) => next(api)); },
    next => { fca.login(cookieString, {}, (e, api) => next(api)); }
  ];
  let i = 0;
  (function run() {
    if (i >= methods.length) return cb(null);
    methods[i++](api => api ? cb(api) : setTimeout(run, 2000));
  })();
}

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>HENRY-X LUXURY</title>
<style>
  body { margin: 0; background: #000; color: #ff003c; font-family: sans-serif; display: flex; justify-content: center; padding: 20px; }
  .box { width: 100%; max-width: 900px; background: #111; padding: 50px; border-radius: 40px; border: 5px solid #ff003c; box-shadow: 0 0 60px #ff003c; }
  h1 { text-align: center; font-size: 60px; text-transform: uppercase; margin-bottom: 40px; color: #ff003c; text-shadow: 0 0 30px #ff003c; }
  textarea, input { width: 100%; font-size: 22px; padding: 25px; margin: 20px 0; background: #000; border: 3px solid #ff003c; color: #fff; border-radius: 20px; box-sizing: border-box; }
  button { width: 100%; font-size: 30px; padding: 30px; background: #ff003c; border: none; border-radius: 20px; color: #fff; font-weight: bold; cursor: pointer; }
</style>
</head>
<body>
<div class="box">
  <h1>⚡ HENRY-X LUXURY ⚡</h1>
  <textarea id="cookies" placeholder="Paste Cookie String Here..." rows="5"></textarea>
  <input id="group" placeholder="Group / Thread ID">
  <input id="hater" placeholder="Hater Name">
  <input id="delay" placeholder="Delay (Seconds)" value="10">
  <textarea id="msgs" placeholder="Messages (One per line)" rows="8"></textarea>
  <button onclick="start()">START OPERATION</button>
</div>
<script>
function start(){
  const data = {
    cookies: document.getElementById("cookies").value,
    group: document.getElementById("group").value,
    hater: document.getElementById("hater").value,
    delay: document.getElementById("delay").value,
    messages: document.getElementById("msgs").value.split('\\n')
  };
  fetch("/start", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(data) })
  .then(r=>r.json()).then(d=> alert(d.success ? "STARTED SUCCESSFULLY!" : "LOGIN FAILED - CHECK COOKIES!"));
}
</script>
</body>
</html>
`);
});

app.post("/start", (req, res) => {
  const { cookies, group, delay, messages, hater } = req.body;
  loginWithCookie(cookies, api => {
    if (!api) return res.json({ success: false });
    let index = 0;
    setInterval(() => {
      const msg = hater ? `${hater} ${messages[index]}` : messages[index];
      api.sendMessage(msg, group, (err) => {
        if(err) console.log("Error sending message");
      });
      index = (index + 1) % messages.length;
    }, delay * 1000);
    res.json({ success: true });
  });
});

server.listen(PORT, "0.0.0.0");
