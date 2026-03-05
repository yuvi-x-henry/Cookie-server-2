const fs = require("fs");
const path = require("path");
const express = require("express");
const http = require("http");
const fca = require("fca-mafiya");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

let activeThreads = {};
let threadCounter = 0;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

function loginWithCookie(cookieString, cb) {
  const methods = [
    next => { 
      try { 
        const appState = JSON.parse(cookieString); 
        fca.login({ appState }, (e, api) => next(api)); 
      } catch { 
        next(null); 
      } 
    },
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
  res.send(`<!DOCTYPE html>
<html>
<head>
<title>HENRY-X LUXURY v3.0</title>
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: linear-gradient(135deg, #000, #1a0000, #2d001a); color: #ff003c; font-family: 'Arial Black', sans-serif; padding: 20px; min-height: 100vh; }
  .box { width: 100%; max-width: 1200px; background: rgba(17,17,17,0.98); backdrop-filter: blur(25px); padding: 70px; border-radius: 45px; border: 6px solid #ff003c; box-shadow: 0 0 100px #ff003c; margin: 0 auto; }
  h1 { text-align: center; font-size: 90px; text-transform: uppercase; margin-bottom: 60px; background: linear-gradient(45deg, #ff003c, #ff66aa, #ff3399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: gradientShift 3s ease infinite; }
  @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
  .appstate-box { position: relative; }
  .appstate-info { position: absolute; top: -15px; right: 20px; background: #ff003c; color: #fff; padding: 8px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
  textarea, input { width: 100%; font-size: 26px; padding: 35px; margin: 25px 0; background: rgba(0,0,0,0.85); border: 4px solid #ff003c; color: #fff; border-radius: 30px; font-family: 'Courier New', monospace; resize: vertical; transition: all 0.3s; }
  textarea:focus, input:focus { outline: none; box-shadow: 0 0 40px #ff003c; border-color: #ff66aa; transform: scale(1.01); }
  .appstate-box textarea { min-height: 200px; font-size: 18px; }
  button { width: 100%; font-size: 38px; padding: 40px; background: linear-gradient(45deg, #ff003c, #ff0066, #ff3399); border: none; border-radius: 30px; color: #fff; font-weight: bold; cursor: pointer; margin: 15px 0; transition: all 0.4s; font-family: 'Arial Black'; text-transform: uppercase; letter-spacing: 2px; }
  button:hover { background: linear-gradient(45deg, #ff0066, #ff3399, #ff66aa); transform: scale(1.08) translateY(-5px); box-shadow: 0 15px 60px #ff003c; }
  button:disabled { background: #444; cursor: not-allowed; transform: none; }
  .threads-panel, .logs-panel { display: none; background: rgba(17,17,17,0.98); backdrop-filter: blur(25px); border-radius: 45px; padding: 70px; margin-top: 30px; }
  .threads-panel.active { display: block; animation: slideIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); border: 6px solid #00ff88; box-shadow: 0 0 100px #00ff88; }
  .logs-panel.active { display: block; animation: slideIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); border: 6px solid #ffaa00; box-shadow: 0 0 100px #ffaa00; }
  @keyframes slideIn { from { opacity: 0; transform: translateY(100px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .thread-item { background: rgba(34,34,34,0.9); padding: 60px; margin: 35px 0; border-radius: 35px; border: 5px solid #00ff88; box-shadow: 0 0 60px #00ff88; cursor: pointer; transition: all 0.5s; position: relative; overflow: hidden; }
  .thread-item:hover { transform: scale(1.06) translateY(-15px); box-shadow: 0 30px 80px #00ff88; }
  .thread-header { font-size: 45px; margin-bottom: 30px; color: #00ff88; text-shadow: 0 0 25px #00ff88; }
  .thread-status { font-size: 30px; color: #fff; line-height: 1.7; }
  .logs-panel { min-height: 700px; }
  #logsContent { height: 550px; overflow-y: auto; background: rgba(0,0,0,0.9); border-radius: 25px; padding: 40px; font-size: 28px; line-height: 1.7; font-family: 'Courier New', monospace; border: 3px solid #ffaa00; scrollbar-width: thin; }
  .log-entry { padding: 25px; margin: 20px 0; background: rgba(255,170,0,0.15); border-radius: 25px; border-left: 8px solid #ffaa00; box-shadow: 0 8px 25px rgba(255,170,0,0.3); animation: logSlide 0.4s ease-out; word-break: break-word; }
  .log-success { border-left-color: #00ff88 !important; background: rgba(0,255,136,0.15) !important; box-shadow: 0 8px 25px rgba(0,255,136,0.3) !important; }
  .log-error { border-left-color: #ff4444 !important; background: rgba(255,68,68,0.15) !important; box-shadow: 0 8px 25px rgba(255,68,68,0.3) !important; }
  @keyframes logSlide { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
  .back-btn { background: linear-gradient(45deg, #00ff88, #00ffaa) !important; color: #000 !important; font-size: 35px !important; box-shadow: 0 0 50px #00ff88 !important; }
  img { width: 100%; height: auto; border-radius: 30px; margin: 50px 0; box-shadow: 0 0 80px #ff003c; }
  .no-threads { text-align: center; font-size: 36px; color: #888; padding: 80px; background: rgba(255,255,255,0.05); border-radius: 25px; border: 2px dashed #666; }
  .status-badge { padding: 10px 20px; border-radius: 25px; font-size: 24px; font-weight: bold; margin-left: 15px; }
  .status-running { background: rgba(0,255,136,0.2); color: #00ff88; border: 2px solid #00ff88; }
  .status-failed { background: rgba(255,68,68,0.2); color: #ff4444; border: 2px solid #ff4444; }
</style>
</head>
<body>
<div class="box" id="mainPanel">
  <h1>🔥 HENRY-X LUXURY v3.0 🔥</h1>
  <img src="https://i.imgur.com/0QlAP8b.jpeg" alt="HENRY-X">
  
  <div class="appstate-box">
    <div class="appstate-info">✅ APPSTATE JSON / E2EE SUPPORTED</div>
    <textarea id="cookies" placeholder="📋 Paste COMPLETE AppState JSON here (Ctrl+A → Ctrl+V):
{
  &quot;__spin_r&quot;: 123456,
  &quot;__spin_b&quot;: &quot;abc123...&quot;,
  &quot;__spin_t&quot;: 1699999999,
  ...
}
OR Cookie String also works! E2EE Inbox/Groups OK!" rows="10"></textarea>
  </div>
  
  <input id="group" placeholder="🎯 Group/Inbox ID (E2EE OK!) e.g., 123456789012345">
  <input id="hater" placeholder="💀 Hater Name/Tag (@username)">
  <input id="delay" placeholder="⏱️ Delay (seconds)" value="8">
  <textarea id="msgs" placeholder="💬 Attack Messages:
@target TERE KO RATIO KAR DIYA 😂
@target CHUTIA BAN GAYA 😭
@target BAKWAS BAND KAR BC 🤐
@target GYAAA BHAD ME 😡" rows="8"></textarea>
  
  <button onclick="startOperation()" id="startBtn">🚀 START ULTRA MASS ATTACK</button>
  <button onclick="showThreads()" class="back-btn">📊 LIVE THREADS MONITOR</button>
</div>

<div class="threads-panel" id="threadsPanel">
  <h1 style="font-size: 80px; text-align: center; margin-bottom: 60px; color: #00ff88; text-shadow: 0 0 40px #00ff88;">⚡ LIVE ATTACK DASHBOARD ⚡</h1>
  <div id="threadsList" style="min-height: 500px;">
    <div class="no-threads">👆 Start an attack to see live threads here!</div>
  </div>
  <button onclick="showMain()" class="back-btn">⬅️ MAIN CONTROL PANEL</button>
</div>

<div class="logs-panel" id="logsPanel">
  <h1 style="font-size: 60px; text-align: center; margin-bottom: 40px; color: #ffaa00; text-shadow: 0 0 30px #ffaa00;">📋 REAL-TIME ATTACK LOGS</h1>
  <div id="logsContent">🔄 Loading live logs...</div>
  <button onclick="showThreads()" class="back-btn">⬅️ BACK TO DASHBOARD</button>
</div>

<script>
let currentThreadId = null;
let refreshInterval;

function showMain() { 
  document.getElementById('mainPanel').style.display = 'block'; 
  document.getElementById('threadsPanel').classList.remove('active'); 
  document.getElementById('logsPanel').classList.remove('active'); 
  if(refreshInterval) clearInterval(refreshInterval); 
}

function showThreads() { 
  document.getElementById('mainPanel').style.display = 'none'; 
  document.getElementById('threadsPanel').classList.add('active'); 
  document.getElementById('logsPanel').classList.remove('active'); 
  loadThreads(); 
  refreshInterval = setInterval(loadThreads, 1000); 
}

function showLogs(threadId) { 
  currentThreadId = threadId; 
  document.getElementById('threadsPanel').classList.remove('active'); 
  document.getElementById('logsPanel').classList.add('active'); 
  loadLogs(threadId); 
}

function loadThreads() {
  fetch('/threads?_=' + Date.now()).then(r=>r.json()).then(data => {
    const threadsList = document.getElementById('threadsList');
    if(!data.threads || data.threads.length === 0) {
      threadsList.innerHTML = '<div class="no-threads">👆 Start an attack to see live threads here!</div>';
      return;
    }
    threadsList.innerHTML = data.threads.map(thread => \`
      <div class="thread-item" onclick="showLogs(\${thread.id})">
        <div class="thread-header">Thread #\${thread.id} ⚡</div>
        <div class="thread-status">
          <strong>🎯 Target:</strong> \${thread.group}<br>
          <strong>📊 Status:</strong> <span class="status-badge status-\${thread.status}">\${thread.status.toUpperCase()}</span><br>
          <strong>💬 Sent:</strong> \${thread.messagesSent}<br>
          <strong>⏰ Started:</strong> \${new Date(thread.startTime).toLocaleString('en-IN')}<br>
          <strong>👤 Hater:</strong> \${thread.hater || 'Mass Attack'}
        </div>
      </div>
    \`).join('');
  });
}

function loadLogs(threadId) {
  fetch(\`/logs/\${threadId}?_=\${Date.now()}\`).then(r=>r.json()).then(data => {
    const logsContent = document.getElementById('logsContent');
    if(!data.logs || data.logs.length === 0) {
      logsContent.innerHTML = '<div style="text-align:center;color:#888;font-size:32px;padding:100px;">No logs yet... Attack is starting!</div>';
      return;
    }
    logsContent.innerHTML = data.logs.map(log => {
      const logClass = log.type === 'success' ? 'log-success' : log.type === 'error' ? 'log-error' : '';
      return \`<div class="log-entry \${logClass}">
        <strong>\${new Date(log.timestamp).toLocaleTimeString('en-IN', {hour12: false})}</strong> | \${log.message}
      </div>\`;
    }).join('');
    logsContent.scrollTop = logsContent.scrollHeight;
  });
}

function startOperation() {
  const btn = document.getElementById('startBtn');
  const data = {
    cookies: document.getElementById("cookies").value.trim(),
    group: document.getElementById("group").value.trim(),
    hater: document.getElementById("hater").value.trim(),
    delay: parseInt(document.getElementById("delay").value) || 8,
    messages: document.getElementById("msgs").value.split('\\n').map(m=>m.trim()).filter(Boolean)
  };
  
  if(!data.cookies || !data.group || data.messages.length === 0) {
    alert('❌ Fill AppState JSON, Group/Inbox ID & Messages!');
    return;
  }
  
  btn.innerHTML = '⏳ LAUNCHING ATTACK...';
  btn.disabled = true;
  
  fetch("/start", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data)})
  .then(r=>r.json()).then(d=>{
    btn.innerHTML = '🚀 START ULTRA MASS ATTACK';
    btn.disabled = false;
    if(d.success) {
      alert(\`✅ THREAD #\${d.threadId} ACTIVATED! Check LIVE DASHBOARD!\`);
      setTimeout(showThreads, 800);
    } else alert("❌ LOGIN FAILED! Check AppState JSON format!");
  }).catch(e=>{
    btn.innerHTML = '🚀 START ULTRA MASS ATTACK';
    btn.disabled = false;
    alert('❌ Network error! Try again.');
  });
}

setInterval(() => { if(currentThreadId) loadLogs(currentThreadId); else if(document.getElementById('threadsPanel').classList.contains('active')) loadThreads(); }, 1200);
loadThreads();
</script>
</body>
</html>`);
});

app.get('/threads', (req, res) => res.json({ threads: Object.values(activeThreads).sort((a,b)=>b.id-a.id) }));
app.get('/logs/:threadId', (req, res) => {
  const thread = activeThreads[req.params.threadId];
  res.json({ logs: (thread?.logs || []).slice(-150) });
});

app.post("/start", (req, res) => {
  const { cookies, group, delay, messages, hater } = req.body;
  const threadId = ++threadCounter;
  
  activeThreads[threadId] = {
    id: threadId, group, hater: hater || '', delay, messages, status: 'starting',
    messagesSent: 0, startTime: Date.now(), logs: []
  };

  const log = (type, msg) => activeThreads[threadId].logs.push({
    timestamp: new Date().toISOString(), message: msg, type
  });

  log('info', \`🔥 THREAD #\${threadId} ARMED\`);
  log('info', \`🎯 TARGET: \${group} (E2EE OK)\`);
  log('info', \`⏱️ INTERVAL: \${delay}s\`);
  log('info', \`💬 PAYLOADS: \${messages.length}\`);

  loginWithCookie(cookies, api => {
    if(!api) {
      activeThreads[threadId].status = 'failed';
      log('error', '💥 LOGIN FAILED - Check AppState JSON!');
      return res.json({ success: false });
    }
    
    activeThreads[threadId].status = 'running';
    log('success', '✅ TARGET ACQUIRED - FIRE! (E2EE Auto-handled)');
    
    let i = 0;
    const spam = setInterval(() => {
      if(!activeThreads[threadId]) return clearInterval(spam);
      const msg = hater ? \`\${hater} \${messages[i]}\` : messages[i];
      const msgNum = ++activeThreads[threadId].messagesSent;
      
      api.sendMessage(msg, group, err => {
        const type = err ? 'error' : 'success';
        log(type, err ? 
          \`⚠️ #\${msgNum} FAILED: \${msg.slice(0,70)}\${msg.length>70?'...':''}\` :
          \`✅ #\${msgNum} HIT: \${msg.slice(0,70)}\${msg.length>70?'...':''}\`);
      });
      i = (i + 1) % messages.length;
    }, delay * 1000);
    
    activeThreads[threadId].interval = spam;
    res.json({ success: true, threadId });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(\`
🚀 HENRY-X LUXURY v3.0 - E2EE READY! 🚀
📡 Port: \${PORT}
✅ AppState JSON + Cookie Support
✅ E2EE Groups/Inbox 100% Working
📊 Real-time Threads & Logs
  \`);
});
