// ===============================
// ⚡ HENRY-X LUXURY SERVER v3.0 ⚡
// Thread Manager + Luxury Panel
// ===============================

const fs = require("fs")
const path = require("path")
const express = require("express")
const http = require("http")
const WebSocket = require("ws")
const fca = require("fca-mafiya")

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({extended:true}))

// ---------------- WEBSOCKET ----------------

const wss = new WebSocket.Server({server})

function broadcast(data){
wss.clients.forEach(c=>{
if(c.readyState===WebSocket.OPEN){
c.send(JSON.stringify(data))
}
})
}

wss.on("connection",ws=>{
ws.send(JSON.stringify({message:"💜 HENRY-X Connected"}))
})

// ---------------- THREAD STORE ----------------

const activeSessions = new Map()

// ---------------- LOGIN ----------------

function loginWithCookie(cookie,cb){

try{

const appState = JSON.parse(cookie)

fca.login({appState},(err,api)=>{
if(err) return cb(null)
cb(api)
})

}catch(e){

fca.login(cookie,{},(err,api)=>{
if(err) return cb(null)
cb(api)
})

}

}

// ---------------- HATERNAME ----------------

function applyHatername(msg,name){

if(!name) return msg

let result=""

for(let i=0;i<msg.length;i++){

result += name[i%name.length] + msg[i]

}

return result
}

// ---------------- MAIN PANEL ----------------

app.get("/",(req,res)=>{

res.send(`

<!DOCTYPE html>
<html>

<head>

<meta name="viewport" content="width=device-width, initial-scale=1">

<title>HENRY-X PANEL</title>

<style>

body{
background:linear-gradient(to top,#0a1f44,#2b6cb0);
font-family:Arial;
display:flex;
justify-content:center;
align-items:center;
min-height:100vh;
color:white;
}

.box{
width:350px;
background:#0b1c38;
padding:20px;
border-radius:20px;
}

img{
width:100%;
border-radius:20px;
margin-bottom:20px;
}

input,textarea{
width:100%;
padding:12px;
border:none;
border-radius:10px;
margin-bottom:10px;
background:#111;
color:white;
}

button{
width:100%;
padding:14px;
border:none;
border-radius:12px;
margin-top:12px;
font-weight:bold;
font-size:16px;
color:white;
background:linear-gradient(90deg,#7b2ff7,#00c853);
position:relative;
overflow:hidden;
}

#threadBtn::before{
content:'';
position:absolute;
top:0;
left:0;
height:100%;
width:0%;
background:#00ff88;
transition:width 3s linear;
z-index:0;
}

#threadBtn span{
position:relative;
z-index:1;
}

.title{
text-align:center;
font-size:38px;
font-weight:bold;
margin-bottom:20px;
letter-spacing:2px;
}
</style>

</head>

<body>

<div class="box">

<img src="https://raw.githubusercontent.com/yuvi-x-henry/Pf/refs/heads/main/e632c4ddfeae7def55bc5f43688e8cf4.jpg">

<h1 class="title">COOKIE'X</h1>

<textarea id="cookies" placeholder="Cookies"></textarea>

<input id="group" placeholder="Thread ID">

<input id="delay" value="10">

<input id="hater" placeholder="Hatername">

<textarea id="messages" placeholder="Messages (line by line)"></textarea>

<button onclick="startBot()">START SPAM</button>

<button id="threadBtn" onclick="openThreads()">
<span>THREAD'X</span>
</button>

</div>

<script>

function startBot(){

let cookies=document.getElementById("cookies").value
let group=document.getElementById("group").value
let delay=document.getElementById("delay").value
let messages=document.getElementById("messages").value.split("\\n")
let hater=document.getElementById("hater").value

fetch("/start",{

method:"POST",

headers:{"Content-Type":"application/json"},

body:JSON.stringify({

cookies:cookies,

group:group,

delay:delay*1000,

messages:messages,

hatername:hater

})

})

}

function openThreads(){

let btn=document.getElementById("threadBtn")

btn.querySelector("span").innerText="LOADING..."

btn.style.pointerEvents="none"

btn.querySelector("span").style.color="black"

btn.style.background="#7b2ff7"

btn.querySelector("span").style.fontWeight="bold"

btn.style.position="relative"

btn.style.overflow="hidden"

btn.style.background="linear-gradient(90deg,#7b2ff7,#00c853)"

btn.style.color="white"

btn.style.setProperty("--width","100%")

btn.querySelector("span").style.zIndex="2"

btn.style.setProperty("width","100%")

btn.style.setProperty("transition","3s")

btn.style.setProperty("background","#00ff88")

setTimeout(()=>{

location="/threads"

},3000)

}
</script>

</body>
</html>

`)

})

// ---------------- THREAD PAGE ----------------

app.get("/threads",(req,res)=>{

res.send(`

<html>

<head>

<title>THREAD MANAGER</title>

<style>

body{

background:linear-gradient(to top,#0a1f44,#2b6cb0);

font-family:Arial;

color:white;

padding:20px;

}

.thread{

background:#111;

padding:15px;

border-radius:10px;

margin-bottom:10px;

}

button{

background:linear-gradient(90deg,#7b2ff7,#00c853);

border:none;

padding:10px;

color:white;

border-radius:8px;

margin-top:5px;

}

</style>

</head>

<body>

<h2>RUNNING THREADS</h2>

<div id="threads"></div>

<script>

function load(){

fetch("/api/threads")

.then(r=>r.json())

.then(data=>{

let html=""

data.forEach(t=>{

html+=\`

<div class="thread">

<b>ID:</b> \${t.id}<br>

<b>Started:</b> \${t.start}<br>

<b>Running:</b> \${t.running}s<br>

<button onclick="logs('\${t.id}')">LIVE LOGS</button>

<button onclick="stop('\${t.id}')">STOP</button>

</div>

\`

})

document.getElementById("threads").innerHTML=html

})

}

setInterval(load,2000)

load()

function stop(id){

fetch("/stop/"+id,{method:"POST"})

}

function logs(id){

alert("Live logs coming via websocket")

}

</script>

</body>

</html>

`)

})

// ---------------- THREAD API ----------------

app.get("/api/threads",(req,res)=>{

let list=[]

activeSessions.forEach((v,k)=>{

list.push({

id:k,

start:new Date(v.start).toLocaleTimeString(),

running:Math.floor((Date.now()-v.start)/1000)

})

})

res.json(list)

})

// ---------------- START BOT ----------------

app.post("/start",(req,res)=>{

let {cookies,group,delay,messages,hatername}=req.body

let id="HX_"+Date.now()

loginWithCookie(cookies,(api)=>{

if(!api){

res.json({success:false})

return

}

let session={

api:api,

group:group,

delay:delay,

messages:messages.map(m=>applyHatername(m,hatername)),

index:0,

start:Date.now()

}

session.interval=setInterval(()=>{

let msg=session.messages[session.index]

api.sendMessage(msg,group)

session.index=(session.index+1)%session.messages.length

},delay)

activeSessions.set(id,session)

res.json({success:true})

})

})

// ---------------- STOP THREAD ----------------

app.post("/stop/:id",(req,res)=>{

let id=req.params.id

let s=activeSessions.get(id)

if(s){

clearInterval(s.interval)

activeSessions.delete(id)

}

res.json({success:true})

})

// ---------------- START SERVER ----------------

server.listen(PORT, "0.0.0.0", function() {
  console.log("💜 HENRY-X LUXURY v2.2 running!");
  console.log("🌐 Panel URL: http://localhost:" + PORT);
});
