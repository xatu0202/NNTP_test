const net = require("net")
const fs = require("fs")
const ws = require('ws')
const execSync = require('child_process').execSync

const NHOST = "localhost"//"nh1.u-aizu.ac.jp"//
const NPORT = 9119//119//
const PORT = 8119
server = new ws.Server({port: PORT})

server.on("connection", wsock=>{
  const nntpConnection = net.connect(NPORT, NHOST).setKeepAlive(true)
  nntpConnection.on("data", d=>{
    fs.writeFileSync("tmp", d)
    wsock.send(execSync("nkf -w tmp").toString())
  })
  nntpConnection.on("close", ()=>console.log("NNTPConnection closed."))
  nntpConnection.on("error", (a)=>console.log("error in NNTPConnection", a))
  wsock.on("message", msg=>{
    console.log(msg)
    nntpConnection.write(msg)
  })
})
