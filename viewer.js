const sock = new WebSocket("ws://localhost:8119")
sock.addEventListener("open", e =>
  console.log("WebSocketに接続しました")
)
window.addEventListener("load", () => {
  sock.addEventListener("message", handleMessage, {once: true})
  document.getElementById("show_list").addEventListener("click", e =>{
    sendMessage("LIST\n")
  })
})

const sendMessage = mes => sock.send(mes)
const getResponseCode = str => str.split(" ")[0]
const hasMessageEnd = msg => /\r\n\.\r\n/.test(msg)

const updateList = str => {
  const list = document.getElementById("groups")
  list.innerHTML = ""
  for(let line of str.split("\r\n.\r\n")[0].replace(/^[1-9].+\r\n/mg, "").split("\r\n")) {
    list.innerHTML += `<li onclick="sendMessage('GROUP ' + this.innerHTML.split(' ')[0]+'\\n')">${line.split(" ")[0]}</li>`
  }
}
const setHandler = () => sock.addEventListener("message", handleMessage, {once: true})
const handleMessage = msg => {
  const responseCode = getResponseCode(msg.data)
  switch (responseCode) {
    case "100":
      console.log("help")
      setHandler()
      break
    case "200":
      console.log("connected")
      setHandler()
      break
    case "205":
      console.log("connection closed")
      break
    case "211":
      document.getElementById("article").innerHTML = ""
      const articleList = document.getElementById("article_list")
      articleList.innerHTML = ""
      if(Number(msg.data.split(" ")[2]) > Number(msg.data.split(" ")[3])) console.log(msg.data.split(" ")[4] + "there is no article")
      else {
        console.log(msg.data.split(" ")[4] + msg.data.split(" ")[2] +" to "+ msg.data.split(" ")[3])
        for(let i = Number(msg.data.split(" ")[2]);i <= Number(msg.data.split(" ")[3]); i++)
          articleList.innerHTML += "<span onclick='sendMessage(`ARTICLE `+`" + i + "\n`)'>" + i + " </span>"
      }
      setHandler()
      break
    case "215":
      console.log("list received")
      if(!hasMessageEnd(msg.data)) sock.addEventListener("message", nextMessage(msg.data, listReceived), {once: true})
      else listReceived(msg.data)
      break
    case "220":
      console.log("article received")
      if(!hasMessageEnd(msg.data)) sock.addEventListener("message", nextMessage(msg.data, articleReceived), {once: true})
      else articleReceived(msg.data)
      break
    default:
      console.log(msg.data)
      setHandler()
  }
}
const nextMessage = (prevMsg, callback) => (msg) => {
  msg = prevMsg + msg.data
  console.log(callback)
  if(!hasMessageEnd(msg)) sock.addEventListener("message", nextMessage(msg, callback), {once: true})
  else callback(msg)
}
const listReceived = msg => {
  updateList(msg)
  setHandler()
}
const articleReceived = msg => {
  document.getElementById("article").innerHTML = "<pre>" + msg + "</pre>"
  setHandler()
}
