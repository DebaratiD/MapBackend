const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userID:{
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    location: {
        lat: { type:Number, required: true },
        long: { type: Number, required: true },
    },
    isHost:{
        type: Boolean,
        default: false
    }
})

const mapSchema = new mongoose.Schema({
    mapID:{
        type: String,
        required: true,
        unique: true
    },
    userList: [userSchema]
})

const User = mongoose.model("User", userSchema);
const Map = mongoose.model("Map", mapSchema);

module.exports = {User, Map};