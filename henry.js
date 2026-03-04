const fs = require("fs");
const path = require("path");
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fca = require("fca-mafiya");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());

const activeSessions = new Map(); // Sessions track karne ke liye

// Login Logic (Preserved)
function loginWithCookie(cookieString, cb) {
  const methods = [
    next => { try { const appState = JSON.parse(cookieString); fca.login({ appState }, (e, api) => next(api)); } catch { next(null); } },
    next => fca.login({ appState: cookieString }, (e, api) => next(api)),
    next => fca.login(cookieString, {}, (e, api) => next(api)),
  ];
  let i = 0;
  (function run() { if (i >= methods.length) return cb(null); methods[i++](api => api ? cb(api) : setTimeout(run, 2000)); })();
}

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>HENRY-X LUXURY</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron&display=swap" rel="stylesheet">
<style>
  body { background: #050510; color: #00ffe0; font-family: 'Orbitron', sans-serif; display: flex; justify-content: center; padding: 20px; }
  .box { width: 100%; max-width: 600px; background: rgba(10, 10, 20, 0.9); padding: 20px; border-radius: 20px; border: 1px solid #00ffe0; }
  .btn { width: 48%; padding: 12px; background: #00ffe0; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
  input, textarea { width: 100%; padding: 10px; margin: 5px 0; background: #000; border: 1px solid #00ffe0; color: #fff; border-radius: 5px; }
  /* Modal Style */
  #threadPanel { display: none; position: fixed; top: 10%; left: 10%; width: 80%; height: 80%; background: #080815; border: 2px solid #00ffe0; padding: 20px; overflow-y: auto; border-radius: 15px; }
</style>
</head>
<body>
<div class="box">
  <h1>⚡ HENRY-X ⚡</h1>
  <input id="cookies" placeholder="AppState">
  <input id="group" placeholder="Group ID">
  <input id="hater" placeholder="Hater Name">
  <input id="delay" placeholder="Delay" value="10">
  <textarea id="msgs" placeholder="Messages (Per line)"></textarea>
  <button class="btn" onclick="start()">START</button>
  <button class="btn" onclick="openThreads()">THREADS</button>
</div>

<div id="threadPanel">
  <h2 style="text-align:center">ACTIVE THREADS</h2>
  <div id="threadList"></div>
  <button onclick="document.getElementById('threadPanel').style.display='none'">CLOSE</button>
</div>

<script>
async function openThreads(){
  const res = await fetch("/threads");
  const data = await res.json();
  const list = document.getElementById("threadList");
  list.innerHTML = data.map(t => \`<div onclick="showLogs('\${t.id}')" style="border:1px solid #00ffe0; padding:10px; margin:5px; cursor:pointer">Thread: \${t.id} - Group: \${t.group}</div>\`).join('');
  document.getElementById('threadPanel').style.display = 'block';
}

function start(){
  fetch("/start", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({
    cookies: cookies.value, group: group.value, hater: hater.value, delay: delay.value, messages: msgs.value.split('\\n')
  })}).then(r=>alert("Started!"));
}

function showLogs(id) { alert("Monitor: " + id); }
</script>
</body>
</html>
`);
});

// APIs
app.post("/start", (req, res) => {
  const { cookies, group, delay, messages, hater } = req.body;
  const threadId = "TH_" + Date.now();
  
  loginWithCookie(cookies, api => {
    if (!api) return res.json({ success: false });
    
    let logs = [];
    const interval = setInterval(() => {
      const msg = hater ? `${hater} ${messages[0]}` : messages[0];
      api.sendMessage(msg, group);
      logs.push(new Date().toLocaleTimeString() + ": Sent to " + group);
    }, delay * 1000);

    activeSessions.set(threadId, { group, logs, interval });
    res.json({ success: true, threadId });
  });
});

app.get("/threads", (req, res) => {
  const threads = Array.from(activeSessions.entries()).map(([id, data]) => ({ id, group: data.group }));
  res.json(threads);
});

server.listen(PORT, "0.0.0.0");
