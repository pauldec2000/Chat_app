const { Server } = require("socket.io");

const io = new Server({cors:"https://chat-app-ten-psi-94.vercel.app/" });

let onlineUsers=[]

io.on("connection", (socket) => {
    console.log(socket.id,"new connectoion")
  // listen a connection

  socket.on("add new user",(userId)=>{
    !onlineUsers.some(user=>user?.userId===userId)&&
onlineUsers.push({
  userId,
  socketId:socket?.id
});
io.emit("getOnlieUsers",onlineUsers)
  })

  // add message 
  socket.on("sendMessage", (message) => {
    const user = onlineUsers.find((user) => user.userId === message.recipientId);
    if (user) {
      console.log('Sending message to user with socketId:', user.socketId); // Debugging log
      io.to(user.socketId).emit("getMessage", message);
      io.to(user.socketId).emit("getNotification", {
        senderId: message.senderId,
        isRead: false,
        date: new Date(),
      });
    }
  });
  
  
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
  
});

io.listen(8000);

