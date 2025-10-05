const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Book = require('../models/Book');
const Review = require('../models/Review');

// POST /api/books - add book (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { title, author, description, genre, year } = req.body;
    if (!title || !author) return res.status(400).json({ message: 'Title and author required' });

    const book = new Book({ title, author, description, genre, year, addedBy: req.user.id });
    await book.save();
    res.status(201).json(book);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// GET /api/books?page=1&limit=5 - list with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const total = await Book.countDocuments();
    const books = await Book.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    // compute average rating for each book
    const bookIds = books.map(b => b._id);
    const reviews = await Review.aggregate([
      { $match: { bookId: { $in: bookIds } } },
      { $group: { _id: "$bookId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    const reviewsMap = {};
    reviews.forEach(r => { reviewsMap[r._id.toString()] = r; });

    const booksWithRating = books.map(b => {
      const meta = reviewsMap[b._id.toString()];
      return { ...b, averageRating: meta ? Number(meta.avgRating.toFixed(2)) : null, reviewsCount: meta ? meta.count : 0 };
    });

    res.json({ books: booksWithRating, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// GET /api/books/:id - book details + reviews + avg rating
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const reviews = await Review.find({ bookId: book._id }).populate('userId', 'name').sort({ createdAt: -1 }).lean();
    const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : null;
    res.json({ book, reviews, averageRating: avg ? Number(avg.toFixed(2)) : null, reviewsCount: reviews.length });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// PUT /api/books/:id - edit (only creator)
router.put('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.addedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const updates = (({ title, author, description, genre, year }) => ({ title, author, description, genre, year }))(req.body);
    Object.assign(book, updates);
    await book.save();
    res.json(book);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// DELETE /api/books/:id - delete (only creator)
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.addedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await Review.deleteMany({ bookId: book._id }); // remove associated reviews
    await book.remove();
    res.json({ message: 'Book deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
