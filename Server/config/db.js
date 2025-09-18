const mongoose = require ('mongoose')

const connectDB = async() => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connection created: ${conn.connection.host}`);
    }catch{
        console.log('Error connecting database: ${error.message}');
        process.exit(1)
    }
}

module.exports = connectDB;