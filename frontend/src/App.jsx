import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import BookList from './pages/BookList';
import BookDetails from './pages/BookDetails';
import AddEditBook from './pages/AddEditBook';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav className="p-4 bg-gray-100 flex justify-between">
      <div><Link to="/" className="font-bold">BookReview</Link></div>
      <div className="space-x-3">
        {user ? (
          <>
            <span>Hi, {user.name}</span>
            <button onClick={logout} className="underline">Logout</button>
            <Link to="/add" className="ml-2">Add Book</Link>
          </>
        ) : (
          <>
            <Link to="/signup">Signup</Link>
            <Link to="/login" className="ml-2">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App(){
  return (
    <AuthProvider>
      <Nav />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<BookList/>} />
          <Route path="/book/:id" element={<BookDetails/>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/add" element={<ProtectedRoute><AddEditBook/></ProtectedRoute>} />
          <Route path="/edit/:id" element={<ProtectedRoute><AddEditBook/></ProtectedRoute>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
