const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoute');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Auth Service is running');
});

app.use('/auth', authRoutes);

app.listen(3001, () => {
    console.log('Auth Service is running on port 3001');
});
