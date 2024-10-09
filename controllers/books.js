const Book = require('../models/Books');
const fs = require('fs');  // Module pour manipuler le système de fichiers
const sharp = require('sharp'); //Assure la compression d'image

//Création d'un livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  //Nom du fichier généré par multer
  const filename = req.file.filename;
  //Chemin d'accès au fichier téléchargé
  const inputPath = `images/${filename}`;
  //Chemin où le fichier compressé dsera enregistré
  const outputPath = `images/compress_${filename}`;

  //compression de l'image 
  sharp.cache(false);
  sharp(inputPath)
    .resize(800)
    .jpeg({ quality: 80})
    .toFile(outputPath)
    .then(() => {
      fs.unlinkSync(inputPath);
      const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/${outputPath}`
      });
      book.save()
      .then(() => res.status(201).json ({message: 'Livre enregistré'}))
      .catch(error => res.status(400).json({ error }));
    })
    .catch(error => {
      console.error('Erreur lors de la sauvegarde du livre:', error);
      res.status(500).json({ error: 'Erreur lors de la compression de l\'image' })
    });  
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

//Ajout d'une notation 
exports.addBookRating = (req, res) => {
  const bookId = req.params.id;  // L'ID du livre
  const userId = req.body.userId;
  const grade = req.body.rating;

  Book.findOne({ _id: bookId })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé.' });
      }

      // Cherche si l'utilisateur a déjà noté le livre
      const userRating = book.ratings.find(rating => rating.userId === userId);

      if (userRating) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
      }

      // Ajoute une nouvelle note
      book.ratings.push({ userId, grade });

      // Recalcule la note moyenne
      const totalRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      book.averageRating = totalRatings / book.ratings.length;
      // Sauvegarde les changements
     book.save();
     return book;

    })
    .then(book  => res.status(200).json(book))
    .catch(error => res.status(500).json({message: 'Erreur lors de l\'ajout de la note.', error }));
};

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
  .catch(error => {
    console.log(error)
    res.status(404).json({ error })
    
  })
}