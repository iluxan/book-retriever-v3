import React, { useState } from 'react';
import { BookType } from '../types';
import { BookService } from '../services/BookService';
import { Search } from 'lucide-react';

interface BookSearchProps {
  onAddBook: (book: BookType) => void;
}

export const BookSearch: React.FC<BookSearchProps> = ({ onAddBook }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const books = await BookService.searchBooks(query);
      setResults(books);
      if (books.length === 0) {
        setError('No books found. Try a different search term.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search books. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBook = (book: BookType) => {
    onAddBook(book);
    // Remove the book from results to prevent duplicate additions
    setResults(results.filter(b => b.id !== book.id));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Search for Books</h2>
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
          >
            {isLoading ? (
              <span>Searching...</span>
            ) : (
              <span className="flex items-center">
                <Search size={18} className="mr-1" /> Search
              </span>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">Search Results</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {results.map((book) => (
              <div key={book.id} className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                {book.coverUrl ? (
                  <img 
                    src={book.coverUrl} 
                    alt={`Cover of ${book.title}`} 
                    className="w-16 h-24 object-cover rounded shadow-sm mr-4"
                  />
                ) : (
                  <div className="w-16 h-24 bg-gray-200 flex items-center justify-center rounded shadow-sm mr-4">
                    <span className="text-gray-400 text-xs text-center">No cover</span>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{book.title}</h4>
                  <p className="text-gray-600 text-sm">by {book.author}</p>
                  {book.publishedDate && (
                    <p className="text-gray-500 text-xs">{book.publishedDate}</p>
                  )}
                  {book.isbn && (
                    <p className="text-gray-500 text-xs">ISBN-10: {book.isbn}</p>
                  )}
                  {book.isbn13 && (
                    <p className="text-gray-500 text-xs">ISBN-13: {book.isbn13}</p>
                  )}
                </div>
                <button
                  onClick={() => handleAddBook(book)}
                  className="ml-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};