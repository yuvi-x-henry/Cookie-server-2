const fs = require("fs");
const path = require("path");
const express = require("express");
const http = require("http");
const fca = require("fca-mafiya");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const activeThreads = new Map();

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
  button { width: 100%; font-size: 30px; padding: 30px; background: #ff003c; border: none; border-radius: 20px; color: #fff; font-weight: bold; cursor: pointer; margin: 10px 0; }
  button.stop { background: #ff4444; }
  button.run { background: #44ff44; }
  button.delete { background: #4444ff; }
  button.logs { background: #ffaa00; }
  #threadPanel, #logsModal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 1000; padding: 20px; overflow-y: auto; }
  .thread-item { background: #111; padding: 30px; margin: 20px 0; border-radius: 20px; border: 3px solid #ff003c; box-shadow: 0 0 40px #ff003c; }
  .thread-id { font-size: 28px; color: #ff003c; }
  .thread-group { font-size: 24px; color: #fff; margin: 10px 0; }
  .close-panel { position: absolute; top: 20px; right: 20px; font-size: 40px; background: #ff003c; color: #000; border: none; border-radius: 50%; width: 60px; height: 60px; cursor: pointer; }
  #logsContent { background: #000; color: #0f0; font-family: monospace; font-size: 18px; padding: 30px; height: 70vh; overflow-y: auto; border: 2px solid #ff003c; border-radius: 15px; white-space: pre-wrap; }
</style>
</head>
<body>
<div class="box">
  <h1> HENRY-X </h1>
  <img src="https://i.imgur.com/0QlAP8b.jpeg" style="width: 100%; height: auto; border-radius: 12px;">
  
  <textarea id="cookies" placeholder="Paste Cookie String Here..." rows="5"></textarea>
  <input id="group" placeholder="Group / Thread ID">
  <input id="hater" placeholder="Hater Name">
  <input id="delay" placeholder="Delay (Seconds)" value="10">
  <textarea id="msgs" placeholder="Messages (One per line)" rows="8"></textarea>
  <button onclick="start()">START OPERATION</button>
  <button onclick="showThreads()">THREADS PANEL</button>
</div>

<div id="threadPanel">
  <button class="close-panel" onclick="hideThreads()">×</button>
  <div class="box" style="position: relative; margin-top: 100px;">
    <h1>ACTIVE THREADS</h1>
    <img src="https://i.imgur.com/0QlAP8b.jpeg" style="width: 100%; height: auto; border-radius: 12px;">
    <div id="threadList"></div>
  </div>
</div>

<div id="logsModal">
  <button class="close-panel" onclick="hideLogs()">×</button>
  <div class="box" style="position: relative; margin-top: 100px;">
    <h1 id="logTitle">THREAD LOGS</h1>
    <div id="logsContent">Loading logs...</div>
    <button onclick="refreshLogs()">REFRESH LOGS</button>
  </div>
</div>

<script>
let threads = [];
let currentLogThread = null;

function showThreads(){
  fetch("/threads").then(r=>r.json()).then(data => {
    threads = data;
    document.getElementById('threadList').innerHTML = data.map(t => 
      '<div class="thread-item">' +
      '<div class="thread-id">ID: ' + t.id + '</div>' +
      '<div class="thread-group">Group: ' + t.group + '</div>' +
      '<div>Delay: ' + t.delay + 's | Status: ' + (t.status ? 'RUNNING' : 'STOPPED') + '</div>' +
      '<button class="stop" onclick="controlThread(\''+t.id+'\', \'stop\')">STOP</button>' +
      '<button class="run" onclick="controlThread(\''+t.id+'\', \'run\')">RESUME</button>' +
      '<button class="delete" onclick="controlThread(\''+t.id+'\', \'delete\')">DELETE</button>' +
      '<button class="logs" onclick="showThreadLogs(\''+t.id+'\')">LOGS</button>' +
      '</div>'
    ).join('');
    document.getElementById('threadPanel').style.display = 'block';
  });
}

function showThreadLogs(threadId){
  currentLogThread = threadId;
  document.getElementById('logTitle').textContent = 'LOGS: ' + threadId;
  document.getElementById('logsContent').textContent = 'Loading...';
  refreshLogs();
  document.getElementById('threadPanel').style.display = 'none';
  document.getElementById('logsModal').style.display = 'block';
}

function refreshLogs(){
  if(!currentLogThread) return;
  fetch('/logs/' + currentLogThread).then(r=>r.text()).then(logs => {
    document.getElementById('logsContent').textContent = logs;
    document.getElementById('logsContent').scrollTop = document.getElementById('logsContent').scrollHeight;
  });
}

function hideThreads(){ document.getElementById('threadPanel').style.display = 'none'; }
function hideLogs(){ document.getElementById('logsModal').style.display = 'none'; }

function controlThread(id, action){
  fetch('/control', { method:'POST', headers:{'Content-Type':'application/json'}, 
    body: JSON.stringify({id, action}) }).then(r=>r.json()).then(d=> {
    if(d.success) showThreads();
  });
}

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
    const threadId = "HX_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    let index = 0;
    let isRunning = true;
    const logs = [];
    
    const interval = setInterval(() => {
      if (!isRunning) return;
      const msg = hater ? `${hater} ${messages[index]}` : messages[index];
      const timestamp = new Date().toLocaleTimeString();
      api.sendMessage(msg, group, (err, info) => {
        if (err) {
          logs.push(`[${timestamp}] ❌ ERROR: ${err.message || err}`);
        } else {
          logs.push(`[${timestamp}] ✅ SENT: "${msg.substring(0, 50)}..." to ${group}`);
        }
        if (logs.length > 100) logs.shift(); // Keep only last 100 logs
      });
      index = (index + 1) % messages.length;
    }, delay * 1000);
    
    activeThreads.set(threadId, { 
      interval, api, group, delay: parseInt(delay), hater, messages, isRunning, logs 
    });
    res.json({ success: true });
  });
});

app.get("/threads", (req, res) => {
  res.json(Array.from(activeThreads.entries()).map(([id, data]) => ({
    id, group: data.group, delay: data.delay, status: data.isRunning
  })));
});

app.post("/control", (req, res) => {
  const { id, action } = req.body;
  const thread = activeThreads.get(id);
  if (!thread) return res.json({ success: false });
  
  if (action === 'stop') {
    thread.isRunning = false;
    thread.logs.push(`[${new Date().toLocaleTimeString()}] ⏸️ STOPPED`);
  } else if (action === 'run') {
    thread.isRunning = true;
    thread.logs.push(`[${new Date().toLocaleTimeString()}] ▶️ RESUMED`);
  } else if (action === 'delete') {
    clearInterval(thread.interval);
    thread.logs.push(`[${new Date().toLocaleTimeString()}] 🗑️ DELETED`);
    activeThreads.delete(id);
  }
  
  res.json({ success: true });
});

app.get("/logs/:threadId", (req, res) => {
  const thread = activeThreads.get(req.params.threadId);
  if (!thread) return res.status(404).send("Thread not found");
  res.type('text/plain').send(thread.logs.join('\\n') || "No logs yet...");
});

server.listen(PORT, "0.0.0.0");
