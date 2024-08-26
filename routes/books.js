const express = require('express');
const Book = require('../models/Books')

const router = express.Router();

const booksCtrl = require('../controllers/books');

router.post('/', booksCtrl.createBook);
router.get('/', booksCtrl.getAllBooks);

module.exports = router;