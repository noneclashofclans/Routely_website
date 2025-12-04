<<<<<<< HEAD
const PORT = process.env.PORT || 5000
=======
const PORT = process.env.PORT || 3001
>>>>>>> b3616a3 (Latest changes made)
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const app = express()

<<<<<<< HEAD
=======

>>>>>>> b3616a3 (Latest changes made)
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
dotenv.config()

connectDB()

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
const pricingRoutes = require('./routes/pricing'); 
app.use('/api/pricing', pricingRoutes);


app.get('/', (req, res) => {
    res.send('Backend is running..')
});

app.listen(PORT, ()=> {
    console.log(`Conneceted to port ${PORT}`)
});

