// ==========================================
// 🔥 HENRY+ LUXURY v4.2 - COMPACT COOL 🔥
// Render FREE | Cookie Only | Perfect Size
// ==========================================

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fca = require("fca-mafiya");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Websocket for REAL-TIME updates
const wss = new WebSocket.Server({ server });
function broadcast(data) {
  wss.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(data));
  });
}

// Storage
let activeThreads = {};
let threadCounter = 0;

// Session management
const sessions = new Map();
function saveSession(threadId, api) {
  try {
    const file = path.join(__dirname, `henry_session_${threadId}.json`);
    fs.writeFileSync(file, JSON.stringify(api.getAppState(), null, 2));
  } catch(e) { console.log(`Session save error ${threadId}:`, e.message); }
}

function loadSession(threadId) {
  try {
    const file = path.join(__dirname, `henry_session_${threadId}.json`);
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch(e) {}
  return null;
}

// COOKIE ONLY LOGIN (Simple + Fast)
function loginWithCookie(cookieString, threadId, callback) {
  fca.login(cookieString, {}, (error, api) => {
    if (api) {
      saveSession(threadId, api);
      console.log(`✅ Cookie login success for thread ${threadId}`);
    }
    callback(api, error);
  });
}

// HTML UI - COMPACT + COOL SIZES
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🔥 HENRY+ LUXURY v4.2 🔥</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
  background: linear-gradient(135deg, #1a0000, #2d0010, #400020, #1a0000); 
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
  color: #ff1493; 
  font-family: 'Arial Black', sans-serif; 
  min-height: 100vh;
  padding: 15px;
}
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.container { max-width: 1200px; margin: 0 auto; }
.panel { 
  background: rgba(0,0,0,0.92); 
  backdrop-filter: blur(25px); 
  border-radius: 20px; 
  padding: 30px; 
  margin-bottom: 20px; 
  border: 3px solid; 
  box-shadow: 0 0 40px rgba(255,20,147,0.5);
  animation: panelGlow 2.5s ease-in-out infinite alternate;
}
@keyframes panelGlow { 
  from { box-shadow: 0 0 40px rgba(255,20,147,0.5); } 
  to { box-shadow: 0 0 60px rgba(255,20,147,0.8); } 
}
.main-panel { border-color: #ff1493; }
.threads-panel { border-color: #00ff88; background: rgba(0,20,0,0.92); }
.logs-panel { border-color: #ffaa00; background: rgba(20,10,0,0.92); }
h1 { 
  font-size: clamp(28px, 6vw, 45px); 
  text-align: center; 
  margin-bottom: 25px; 
  background: linear-gradient(45deg, #ff1493, #ff69b4, #ff1493); 
  -webkit-background-clip: text; 
  -webkit-text-fill-color: transparent; 
  text-shadow: 0 0 30px #ff1493;
}
input, textarea { 
  width: 100%; 
  font-size: clamp(14px, 2.5vw, 18px); 
  padding: 15px; 
  margin: 12px 0; 
  background: rgba(0,0,0,0.85); 
  border: 2px solid #ff1493; 
  color: #fff; 
  border-radius: 12px; 
  font-family: monospace;
  resize: vertical;
}
input:focus, textarea:focus { 
  outline: none; 
  border-color: #ff69b4; 
  box-shadow: 0 0 25px #ff1493; 
  transform: scale(1.01);
}
.btn { 
  width: 100%; 
  font-size: clamp(16px, 3vw, 22px); 
  padding: 18px; 
  background: linear-gradient(45deg, #ff1493, #ff69b4); 
  border: none; 
  border-radius: 15px; 
  color: #fff; 
  font-weight: bold; 
  cursor: pointer; 
  margin: 10px 0;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.btn:hover { 
  transform: scale(1.02) translateY(-3px); 
  box-shadow: 0 10px 30px rgba(255,20,147,0.7); 
}
.btn-threads { background: linear-gradient(45deg, #00ff88, #00ffaa) !important; }
.thread-item { 
  background: rgba(0,25,0,0.9); 
  padding: 25px; 
  margin: 15px 0; 
  border-radius: 15px; 
  border: 2px solid #00ff88; 
  cursor: pointer; 
  transition: all 0.3s;
  font-size: clamp(14px, 2vw, 18px);
}
.thread-item:hover { transform: scale(1.02); box-shadow: 0 0 30px #00ff88; }
.log-entry { 
  padding: 15px; 
  margin: 10px 0; 
  background: rgba(255,165,0,0.15); 
  border-radius: 12px; 
  border-left: 4px solid #ffaa00; 
  font-family: monospace;
  font-size: clamp(13px, 2vw, 16px);
}
.log-success { border-left-color: #00ff88 !important; background: rgba(0,255,136,0.15) !important; }
.log-error { border-left-color: #ff4444 !important; background: rgba(255,68,68,0.15) !important; }
#logsContent { 
  height: 400px; 
  overflow-y: auto; 
  padding: 20px; 
  background: rgba(0,0,0,0.85); 
  border-radius: 15px; 
  border: 2px solid #ffaa00; 
}
.hidden { display: none !important; }
.cookie-info { 
  background: rgba(255,20,147,0.15); 
  padding: 18px; 
  border-radius: 12px; 
  margin: 15px 0; 
  border-left: 4px solid #ff1493;
  font-size: clamp(13px, 2.2vw, 16px);
}
@media (max-width: 768px) { 
  .panel { padding: 25px 20px; } 
  body { padding: 10px; }
}
</style>
</head>
<body>
<div class="container">
  <!-- MAIN PANEL -->
  <div id="mainPanel" class="panel main-panel">
    <h1>HENRY-X</h1>
    <div class="cookie-info">
      <strong>🍪 COOKIE:</strong> F12 → Application → Cookies → Copy value<br>
      <strong>📝 MULTI:</strong> One cookie per line = Multiple accounts!
    </div>
    <textarea id="cookies" rows="6" placeholder="🍪 FB Cookies (ONE PER LINE)&#10;c_user=1000123456789; xs=1%3A...&#10;c_user=1000987654321; xs=1%3A..."></textarea>
    <input id="group" placeholder="🎯 Group/Inbox ID">
    <input id="hater" placeholder="💀 Hater Name (@username)">
    <input id="delay" placeholder="⏱️ Delay (seconds)" value="10">
    <textarea id="messages" rows="4" placeholder="💬 Messages&#10;@target RATIO 😂&#10;@target CHUTIA 😭"></textarea>
    <button class="btn" onclick="startAttack()">🚀 START ATTACK</button>
    <button class="btn btn-threads" onclick="showThreads()">📊 LIVE THREADS</button>
  </div>

  <!-- THREADS PANEL -->
  <div id="threadsPanel" class="panel threads-panel hidden">
    <h1>⚡ LIVE THREADS ⚡</h1>
    <div id="threadsList">Start attack to see threads! 🚀</div>
    <button class="btn btn-threads" onclick="showMain()">⬅️ MAIN</button>
  </div>

  <!-- LOGS PANEL -->
  <div id="logsPanel" class="panel logs-panel hidden">
    <h1>📋 REAL LOGS</h1>
    <div id="logsContent">Loading logs...</div>
    <button class="btn btn-threads" onclick="showThreads()">⬅️ THREADS</button>
  </div>
</div>

<script>
let currentThreadId = null;
let refreshTimer;

function showMain() {
  document.getElementById('mainPanel').classList.remove('hidden');
  document.getElementById('threadsPanel').classList.add('hidden');
  document.getElementById('logsPanel').classList.add('hidden');
  if(refreshTimer) clearInterval(refreshTimer);
}

function showThreads() {
  document.getElementById('mainPanel').classList.add('hidden');
  document.getElementById('threadsPanel').classList.remove('hidden');
  document.getElementById('logsPanel').classList.add('hidden');
  loadThreads();
  refreshTimer = setInterval(loadThreads, 1500);
}

function showLogs(threadId) {
  currentThreadId = threadId;
  document.getElementById('threadsPanel').classList.add('hidden');
  document.getElementById('logsPanel').classList.remove('hidden');
  loadLogs(threadId);
}

function loadThreads() {
  fetch('/threads?_=' + Date.now()).then(r => r.json()).then(data => {
    const list = document.getElementById('threadsList');
    if (!data.threads?.length) {
      list.innerHTML = '<div style="text-align:center;padding:40px;color:#888;font-size:clamp(16px,3vw,20px);">No threads. Start attack! 🚀</div>';
      return;
    }
    list.innerHTML = data.threads.map(t => \`
      <div class="thread-item" onclick="showLogs(\${t.id})">
        <div style="font-size:clamp(18px,3.5vw,24px);color:#00ff88;margin-bottom:12px;">#${t.id}</div>
        <div><strong>🎯</strong> ${t.group}</div>
        <div><strong>📊</strong> ${t.status === 'running' ? '<span style="color:#00ff88">LIVE</span>' : '<span style="color:#ff4444">STOPPED</span>'}</div>
        <div><strong>💬</strong> ${t.messagesSent}</div>
      </div>
    \`).join('');
  });
}

function loadLogs(threadId) {
  fetch(\`/logs/\${threadId}?_=\${Date.now()}\`).then(r => r.json()).then(data => {
    const content = document.getElementById('logsContent');
    if (!data.logs?.length) {
      content.innerHTML = '<div style="text-align:center;padding:50px;color:#888;font-size:clamp(14px,2.5vw,18px);">No logs yet...</div>';
      return;
    }
    content.innerHTML = data.logs.slice(-30).map(log => {
      const cls = log.type === 'success' ? 'log-success' : log.type === 'error' ? 'log-error' : '';
      return \`<div class="\${cls} log-entry">
        <strong>${new Date(log.timestamp).toLocaleTimeString('en-IN')}:</strong> ${log.message}
      </div>\`;
    }).join('');
    content.scrollTop = content.scrollHeight;
  });
}

function startAttack() {
  const data = {
    cookies: document.getElementById('cookies').value.trim(),
    group: document.getElementById('group').value.trim(),
    hater: document.getElementById('hater').value.trim(),
    delay: parseInt(document.getElementById('delay').value) || 10,
    messages: document.getElementById('messages').value.split('\\n').map(m=>m.trim()).filter(Boolean)
  };
  
  if (!data.cookies || !data.group || !data.messages.length) {
    alert('❌ Fill ALL: Cookies + Group + Messages!');
    return;
  }
  
  const btn = event.target;
  btn.textContent = '🚀 LAUNCHING...';
  btn.disabled = true;
  
  fetch('/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()).then(result => {
    btn.textContent = '🚀 START ATTACK';
    btn.disabled = false;
    if (result.success) {
      alert(\`✅ THREAD #\${result.threadId} LIVE! Check THREADS!\`);
      setTimeout(showThreads, 300);
    } else {
      alert('❌ Cookie login failed!');
    }
  }).catch(() => {
    btn.textContent = '🚀 START ATTACK';
    btn.disabled = false;
  });
}

// Auto refresh
setInterval(() => {
  if (currentThreadId) loadLogs(currentThreadId);
}, 2000);
loadThreads();
</script>
</body></html>`);
});

// API Endpoints (SAME AS BEFORE)
app.get('/threads', (req, res) => {
  res.json({ threads: Object.values(activeThreads).sort((a,b) => b.id - a.id) });
});

app.get('/logs/:id', (req, res) => {
  const thread = activeThreads[req.params.id];
  res.json({ logs: thread?.logs?.slice(-100) || [] });
});

app.post('/start', (req, res) => {
  const { cookies, group, hater, delay, messages } = req.body;
  const threadId = ++threadCounter;
  
  activeThreads[threadId] = {
    id: threadId,
    group, hater: hater || 'HENRY+',
    delay,
    messages,
    status: 'starting',
    messagesSent: 0,
    startTime: Date.now(),
    logs: []
  };

  const logEntry = (type, msg) => {
    const log = { timestamp: new Date().toISOString(), type, message: msg };
    activeThreads[threadId].logs.push(log);
    console.log(`[Thread #${threadId}] ${msg}`);
    broadcast({ type: 'log', threadId, log });
  };

  logEntry('info', `🔥 HENRY+ THREAD #${threadId} START`);
  logEntry('info', `🎯 TARGET: ${group}`);
  
  const cookieLines = cookies.split('\n').map(c => c.trim()).filter(Boolean);
  let successCount = 0;
  
  cookieLines.forEach((singleCookie, index) => {
    loginWithCookie(singleCookie, `sub_${threadId}_${index}`, (api, error) => {
      if (!api) {
        logEntry('error', `❌ Cookie ${index + 1}: Invalid`);
        return;
      }
      
      successCount++;
      logEntry('success', `✅ Cookie ${index + 1}: LIVE`);
      
      let msgIndex = 0;
      const spamInterval = setInterval(() => {
        if (!activeThreads[threadId]) return clearInterval(spamInterval);
        
        const finalMsg = hater ? `${hater} ${messages[msgIndex]}` : messages[msgIndex];
        const msgNum = ++activeThreads[threadId].messagesSent;
        
        api.sendMessage(finalMsg, group, err => {
          logEntry(err ? 'error' : 'success', 
            err ? `⚠️ #${msgNum}(${index+1}): Failed` : 
            `✅ #${msgNum}(${index+1}): OK`
          );
        });
        
        msgIndex = (msgIndex + 1) % messages.length;
      }, delay * 1000);
      
      activeThreads[threadId].intervals = activeThreads[threadId].intervals || [];
      activeThreads[threadId].intervals.push(spamInterval);
    });
  });

  res.json({ success: true, threadId });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
🔥 HENRY+ LUXURY v4.2 - COMPACT COOL! 🔥
📡 Port: ${PORT}
✅ Cookie Only Login
✅ Perfect Compact Size
✅ Multi-Cookie Power
✅ Real Time Logs
  `);
});
