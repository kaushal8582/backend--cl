const mongodb = require('mongoose');


const connectDb = async () => {
    return mongodb.connect(process.env.MONGO_URI);
}; 
 

  
module.exports = connectDb;