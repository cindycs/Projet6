const express = require('express');
const mongoose = require('mongoose');

//const booksRoutes = require('.routes/book');

const app = express();


mongoose.connect('mongodb+srv://cindycs:uLIspO4itC0z9Tdl@cluster0.9tgri.mongodb.net/')

    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
})


/*
app.use('/api/books', booksRoutes );
*/

module.exports = app;