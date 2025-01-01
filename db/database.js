const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const uri = process.env.MONGODB_CONN_URI;


function connectToDB(){
    if(uri == undefined){
        console.log("Environment variable not loaded.");
    }
    else{
        mongoose.connect(uri).then(()=>{
            console.log("Connected to MongoDB cluster");
        })
        .catch((err)=>{
            console.log(`Couldn't connect: ${err}`);
        });
    }
    
}


module.exports = connectToDB ;