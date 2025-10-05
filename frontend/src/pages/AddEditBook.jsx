import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate, useParams } from 'react-router-dom';

export default function AddEditBook(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'', author:'', description:'', genre:'', year:'' });

  useEffect(()=>{
    if (id) {
      API.get(`/books/${id}`).then(res => {
        setForm({
          title: res.data.book.title,
          author: res.data.book.author,
          description: res.data.book.description || '',
          genre: res.data.book.genre || '',
          year: res.data.book.year || ''
        });
      });
    }
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await API.put(`/books/${id}`, form);
      } else {
        await API.post('/books', form);
      }
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">{id ? 'Edit' : 'Add'} Book</h2>
      <form onSubmit={submit} className="space-y-3">
        <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
        <input placeholder="Author" value={form.author} onChange={e=>setForm({...form, author:e.target.value})} />
        <input placeholder="Genre" value={form.genre} onChange={e=>setForm({...form, genre:e.target.value})} />
        <input placeholder="Published Year" value={form.year} onChange={e=>setForm({...form, year:e.target.value})} />
        <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        <button className="btn">{id ? 'Update' : 'Add'}</button>
      </form>
    </div>
  );
}
