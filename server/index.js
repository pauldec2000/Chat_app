const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoute = require("./Routes/userRoutes");
const chatRoute=require("./Routes/chatRoute");
const messageRoute=require("./Routes/messageRoute");
const app = express();
require('dotenv').config();
const password = encodeURIComponent("Satyam@0017");

app.use(express.json());
app.use(cors());
app.use("/api/users", userRoute);
app.use("/api/chats",chatRoute);
app.use("/api/messages",messageRoute)

app.get("/", (req, res) => {
    res.send("welcome our chat app api..");
});

const port = process.env.PORT || 9000;
const uri = `mongodb+srv://satyampal:${password}@cluster0.ocnr6wu.mongodb.net/chatapp?retryWrites=true&w=majority`;


mongoose.connect(uri)
    .then(() => {
        console.log("MongoDB connection established");
    })
    .catch((error) => {
        console.log("MongoDB connection failed", error.message);
    });

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
