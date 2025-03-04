import React, { useState } from 'react';
import { BookType } from '../types';
import { Library } from 'lucide-react';

interface LibraryCheckerProps {
  books: BookType[];
}

export const LibraryChecker: React.FC<LibraryCheckerProps> = ({ books }) => {
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  
  // This is a placeholder for future library integration
  // In Phase 4, this will be replaced with actual library checking functionality
  const checkLibraryAvailability = (book: BookType) => {
    setSelectedBook(book);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Library className="mr-2" size={20} />
        Check Library Availability
      </h2>
      
      {books.length === 0 ? (
        <p className="text-gray-500">Add books to your reading list to check availability.</p>
      ) : (
        <>
          <p className="mb-4 text-gray-600">
            Select a book from your reading list to check its availability at your local libraries.
          </p>
          
          <div className="mb-6">
            <label htmlFor="book-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select a book
            </label>
            <select
              id="book-select"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedBook?.id || ''}
              onChange={(e) => {
                const book = books.find(b => b.id === e.target.value);
                setSelectedBook(book || null);
              }}
            >
              <option value="">-- Select a book --</option>
              {books.map(book => (
                <option key={book.id} value={book.id}>
                  {book.title} by {book.author}
                </option>
              ))}
            </select>
          </div>
          
          {selectedBook && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex mb-4">
                {selectedBook.coverUrl ? (
                  <img 
                    src={selectedBook.coverUrl} 
                    alt={`Cover of ${selectedBook.title}`} 
                    className="w-20 h-30 object-cover rounded shadow-sm mr-4"
                  />
                ) : (
                  <div className="w-20 h-30 bg-gray-200 flex items-center justify-center rounded shadow-sm mr-4">
                    <span className="text-gray-400 text-xs text-center">No cover</span>
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{selectedBook.title}</h3>
                  <p className="text-gray-600 text-sm">by {selectedBook.author}</p>
                  {selectedBook.isbn && (
                    <p className="text-gray-500 text-xs">ISBN: {selectedBook.isbn}</p>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 italic mb-4">
                Library availability checking will be implemented in Phase 4.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-yellow-800">
                <p className="text-sm">
                  In the future, this section will show real-time availability at your configured libraries.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};