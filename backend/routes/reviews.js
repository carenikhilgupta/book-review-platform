const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');

// POST /api/reviews - add review (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, rating, reviewText } = req.body;
    if (!bookId || !rating) return res.status(400).json({ message: 'bookId and rating required' });

    // prevent duplicate review by same user for same book (optional)
    const existing = await Review.findOne({ bookId, userId: req.user.id });
    if (existing) return res.status(400).json({ message: 'You already reviewed this book. Edit instead.' });

    const review = new Review({ bookId, userId: req.user.id, rating, reviewText });
    await review.save();
    res.status(201).json(review);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// PUT /api/reviews/:id - edit user's review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const { rating, reviewText } = req.body;
    if (rating) review.rating = rating;
    if (reviewText) review.reviewText = reviewText;
    await review.save();
    res.json(review);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// DELETE /api/reviews/:id - delete user's review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await review.remove();
    res.json({ message: 'Review deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
