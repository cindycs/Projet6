const Book = require('../models/Books');


exports.createBook = (req, res, next) => {
    delete req.body._id;
    const book = new Book({
      ...req.body //copie les champs de la requete 
    });
    book.save()
    .then(() => res.status(201).json({message: 'Objet enregistré !'}))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then()
    .catch(error => res.status(400).json({ error }));
}