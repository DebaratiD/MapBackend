const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const http = require("http");
const connectToDB = require("./db/database");
const { User, Map } = require("./db/schema");
const { createUser, createMap, joinMap, updateUserLocation, removeUserfromMap, deleteMap } = require("./db/crud");

dotenv.config();

const app = express();

const server = http.createServer(app).listen(5000,()=>{
    console.log("server listening on 5000");
});
const io = new Server(server, { cors:{
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"], 
    }
});

app.use(cors());
app.use(express.json());

connectToDB();

function generateID(){
    let id = "";
    for(let i=0;i<3;i++){
        id += String.fromCharCode(Math.round(Math.random()*26) + 'a'.charCodeAt(0));
    }
    id += Math.round((Math.random()*1000)).toString();
    for(let i=0;i<3;i++){
        id += String.fromCharCode(Math.round(Math.random()*26) + 'a'.charCodeAt(0));
    }
    return id;
}

app.get("/", (req,res)=>{
    res.send("Welcome to the backend!");
});

io.on("connection", (socket)=>{
    console.log("Connected to websocket.io");
    
    socket.on("create_map", ({ name, lat, long }) => {
        const mapID = generateID();
        const user = new User({
            userID:socket.id,
            name: name,
            location:{
                lat:lat, long: long
            },
            isHost: true
        });
        const res = createUser(user);
        if(res){

            const map = createMap(user, mapID);
            socket.join(mapID);
            socket.emit("map_created", {map: mapID, isHost:true, user: user});
        }
        else{
            console.log("User could not be added");
        }
    });

    socket.on("join_map", async ({ mapId, name, lat, long }) => {
        try{
            const user = new User({
                userID:socket.id,
                name: name,
                location:{
                    lat:lat, long: long
                },
                isHost: true
            });
            const m = await Map.findOne({mapID: mapId});
            if(m){
                const map = joinMap(user, mapId);
                socket.join(mapId);
                io.to(mapId).emit("map_joined",map);
            }
            else{
                socket.emit("map_join_failed", "Map does not exist");
            }
        }
        catch(err){
            socket.emit("error",err);
        }
    });

    socket.on("updateLocation", async ({mapId, userID, lat, long})=>{
        try{
            const res = await updateUserLocation(userID, mapId, lat, long);
            if(res){
                socket.emit("updatedLocation",{userID: userID, lat: lat, long: long});
                console.log(`User location updated for ${userID}`);
            }
            else{
                console.log("Could not update user location");
            }
        }
        catch(err){
            socket.emit("error",err);
        }
    });

    socket.on("disconnect", async({mapId, userId})=>{
        const res = removeUserfromMap(userId, mapId);
        if(res){
            
            io.to(mapId).emit("userLeft",userId);

            const m = await Map.findOne({mapID: mapId, userList: {$eq: []}});
            if(m){
                await deleteMap();
                socket.emit("map_closed");
            }
            socket.emit("userRemoved",userId);
            socket.leave(mapId);
        }
    });
})

