import React, { useEffect, useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';

export default function BookList(){
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBooks = async (p=1) => {
    const res = await API.get(`/books?page=${p}`);
    setBooks(res.data.books);
    setPage(res.data.page);
    setTotalPages(res.data.totalPages);
  };

  useEffect(()=>{ fetchBooks(1); }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Books</h2>
      <div className="grid gap-4">
        {books.map(b => (
          <div key={b._id} className="p-4 border rounded">
            <Link to={`/book/${b._id}`} className="font-bold text-lg">{b.title}</Link>
            <div>{b.author} • {b.genre} • {b.year}</div>
            <div>Avg: {b.averageRating ?? '—'} ({b.reviewsCount} reviews)</div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-x-2">
        <button disabled={page<=1} onClick={()=>fetchBooks(page-1)} className="btn">Prev</button>
        <span>Page {page} / {totalPages}</span>
        <button disabled={page>=totalPages} onClick={()=>fetchBooks(page+1)} className="btn">Next</button>
      </div>
    </div>
  );
}
