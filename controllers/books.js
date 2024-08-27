const Book = require('../models/Books');
const fs = require('fs');  // Module pour manipuler le système de fichiers

//Création d'un livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  book.save()
  .then(() => res.status(201).json ({message: 'Livre enregistré'}))
  .catch(error => res.status(400).json({ error }));
}

//Suppression d'un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })  // Trouve le livre pour obtenir l'image
    .then(book => {
      if (!book) {
        return res.status(404).json({ error: 'Livre non trouvé' });
      }
      // Récupère le chemin complet de l'image
      const filename = book.imageUrl.split('/images/')[1];
      // Supprime le fichier image du serveur
      fs.unlink(`images/${filename}`, (err) => {
        if (err) {
          console.error("Erreur lors de la suppression de l'image :", err);
          return res.status(500).json({ error: 'Erreur lors de la suppression de l\'image' });
        }
        // Supprime le livre de la base de données après avoir supprimé l'image
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre supprimé' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error: 'Erreur lors de la suppression du livre' }));
};

// Modification d'un livre
exports.modifyBook = (req, res, next) => {
  Book.updateOne({ _id: req.params.id }, {...req.body, _id: req.params.id})
  .then(() => res.status(200).json({ message: 'Livre mis à jour'}))
  .catch(error => res.status(400).json({ error }));
}

//Affichage d'un livre par rapport à son ID
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
  .then(book => res.status(200).json(book))
  .catch(error => res.status(404).json({ error }));
}

// Affichage de tous les livres
exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
}

//Affichages des 3 livres les mieux notés 
exports.getBestBooks = (req, res, next) => {
  Book.find()
  .sort({ ratings: -1 })
  .limit(3)
  .then(book => res.status(200).json(book))
  .catch(error => res.status(404).json({ error }))
}