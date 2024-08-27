const express = require('express');
const Book = require('../models/Books');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const router = express.Router();

const booksCtrl = require('../controllers/books');


router.get('/', booksCtrl.getAllBooks);
router.get('/:id', booksCtrl.getOneBook);
router.post('/',auth , multer, booksCtrl.createBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.put('/:id', auth, booksCtrl.modifyBook);


module.exports = router;