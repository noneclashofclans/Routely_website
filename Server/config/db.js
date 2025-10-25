const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const dbName = process.env.MONGO_DB_NAME || 'routely_db';
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName,
            // you can add other options here if needed
        });
        console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;