const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const addressRoutes = require('./routes/address');

const app = express();

app.use(cors({
    origin: 'http://localhost:4200', // Port du frontend Angular
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

mongoose.connect('mongodb+srv://Ikram_elfi:6hyhZ3Hb0SUitT3j@cluster0.ryd7t.mongodb.net/projet_6?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/address', addressRoutes);

const PORT = process.env.PORT || 3001; // Changez le port du backend

module.exports = app;
