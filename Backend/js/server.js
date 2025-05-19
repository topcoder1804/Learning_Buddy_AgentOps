require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
