const { User, Map } = require("./schema");


async function createUser(user){
    try{
        const u = new User(user);
        await u.save();
        console.log("User record created.");
        return u;
    }
    catch(error){
        console.log(`Could not create User: ${error}`);
    }   
}

async function createMap(user, mapID){
    //check if user already exists in db
    try{
        const m = new Map({
            mapID: mapID,
            userList: [user]
        });
        await m.save();
        console.log("Map created for user.");
        return m;
    }
    catch(error){
        console.log(`Could not create Map: ${error}`);
    }   
}

async function joinMap(user, mapID){
    try{
        const m = await Map.findOneAndUpdate(
            {'mapID':mapID},
            {$push: {userList: user}},
            {new: true}
        );
        
        if (!m) {
            console.log("Map not found");
            return null;
        }
    
        console.log("User added successfully to map:", m);
        return m;
    }
    catch(error){
        console.log(`Could not join Map: ${error}`);
    } 
}

async function deleteMap(mapID){
    try{
        const m = await Map.findOneAndDelete(
            {'mapID':mapID},
            {new: true}
        );
        
        if (!m) {
            console.log("Map not found");
            return null;
        }
    
        console.log("Map deleted successfully:", m);
        return m;
    }
    catch(error){
        console.log(`Could not delete Map: ${error}`);
    }
}

async function updateUserLocation(userid, mapID, lat, long){
    try{
        const m = await Map.findOneAndUpdate(
            {'mapID':mapID, 'userList.userID':userid},
            {'$set': {'userList.$.location': {lat:lat, long:long}}},
            {new: true}
        );
        
        if (!m) {
            console.log("Map not found");
            return null;
        }
    
        console.log("User location updated:", m);
        return m;
    }
    catch(error){
        console.log(`Could not update user location: ${error}`);
    }

}

async function removeUserfromMap(userid, mapID){
    try{
        const m = await Map.findOneAndUpdate(
            {'mapID':mapID},
            {$pull: {userList: {userID: userid}}},
            {new: true}
        );
        
        if (!m) {
            console.log("Map not found");
            return null;
        }
    
        console.log("User removed from map:", m);
        return true;
    }
    catch(error){
        console.log(`Could not remove from Map: ${error}`);
    } 
}

module.exports = { createMap, createUser, joinMap, deleteMap, updateUserLocation, removeUserfromMap}