import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function BookDetails(){
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const { user } = useAuth();

  const fetch = async () => {
    const res = await API.get(`/books/${id}`);
    setData(res.data);
  };

  useEffect(()=>{ fetch(); }, [id]);

  const addReview = async () => {
    try {
      await API.post('/reviews', { bookId: id, rating, reviewText: text });
      setText(''); setRating(5);
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding review');
    }
  };

  if (!data) return <div>Loading...</div>;
  const { book, reviews, averageRating, reviewsCount } = data;

  return (
    <div>
      <h2 className="text-2xl font-bold">{book.title}</h2>
      <div>{book.author} • {book.genre} • {book.year}</div>
      <p className="my-3">{book.description}</p>
      <div>Avg Rating: {averageRating ?? '—'} ({reviewsCount} reviews)</div>

      <div className="mt-6">
        <h3 className="font-bold">Reviews</h3>
        {reviews.map(r => (
          <div key={r._id} className="p-3 border rounded my-2">
            <div className="font-semibold">{r.userId?.name || 'User'}</div>
            <div>Rating: {r.rating}</div>
            <div>{r.reviewText}</div>
          </div>
        ))}

        {user ? (
          <div className="mt-4">
            <h4 className="font-semibold">Add Review</h4>
            <select value={rating} onChange={e=>setRating(Number(e.target.value))}>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} star</option>)}
            </select>
            <textarea className="block w-full" value={text} onChange={e=>setText(e.target.value)} />
            <button className="btn" onClick={addReview}>Submit Review</button>
          </div>
        ) : <div className="mt-4">Please <Link to="/login">login</Link> to add a review.</div>}
      </div>
    </div>
  );
}
