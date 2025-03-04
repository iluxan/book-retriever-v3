import React, { useState } from 'react';
import { BookType } from '../types';
import { BookOpen, Headphones, ExternalLink, RefreshCw, Library, Plus } from 'lucide-react';
import { LibraryService } from '../services/LibraryService';
import { Database } from '../services/Database';
import { BookService } from '../services/BookService';

interface BookListProps {
  books: BookType[];
  onRemoveBook: (id: string) => void;
  onUpdateBooks: (books: BookType[]) => void;
}

export const BookList: React.FC<BookListProps> = ({ books, onRemoveBook, onUpdateBooks }) => {
  const [checkingBooks, setCheckingBooks] = useState<Record<string, boolean>>({});
  const [updatingIsbn, setUpdatingIsbn] = useState<Record<string, boolean>>({});

  // Limit to first 20 books for display and operations
  const limitedBooks = books.slice(0, 20);

  const handleCheckLibraryAvailability = async (book: BookType) => {
    try {
      // Set loading state for this specific book
      setCheckingBooks(prev => ({ ...prev, [book.id]: true }));
      
      // Check availability for this book
      const updatedBook = await LibraryService.checkBookAvailability(book);
      
      // Update the books list with the new availability information
      const updatedBooks = books.map(b => b.id === updatedBook.id ? updatedBook : b);
      
      // Save to database and update state
      await Database.saveBooks(updatedBooks);
      onUpdateBooks(updatedBooks);
    } catch (error) {
      console.error(`Error checking availability for book "${book.title}":`, error);
    } finally {
      // Clear loading state for this book
      setCheckingBooks(prev => ({ ...prev, [book.id]: false }));
    }
  };

  const handleUpdateIsbn13 = async (book: BookType) => {
    try {
      // Set loading state for this specific book
      setUpdatingIsbn(prev => ({ ...prev, [book.id]: true }));
      
      // Fetch ISBN-13 for this book
      const updatedBook = await BookService.fetchBookDetails(book);
      
      // Update the books list with the new ISBN-13
      const updatedBooks = books.map(b => b.id === updatedBook.id ? updatedBook : b);
      
      // Save to database and update state
      await Database.saveBooks(updatedBooks);
      onUpdateBooks(updatedBooks);
    } catch (error) {
      console.error(`Error updating ISBN-13 for book "${book.title}":`, error);
    } finally {
      // Clear loading state for this book
      setUpdatingIsbn(prev => ({ ...prev, [book.id]: false }));
    }
  };

  if (books.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">My Reading List</h2>
      {books.length > 20 && (
        <div className="mb-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
          Showing only the first 20 books. You have {books.length} books in total.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {limitedBooks.map((book) => {
          // Get availability information
          const ebookAvailable = book.availability?.libraries.some(
            lib => lib.available && (lib.format === 'ebook' || lib.format === 'both')
          );
          
          const audiobookAvailable = book.availability?.libraries.some(
            lib => lib.available && (lib.format === 'audiobook' || lib.format === 'both')
          );
          
          // Get the library URL if available
          const libraryUrl = book.availability?.libraries[0]?.url;
          
          // Format the last checked time if available
          const lastChecked = book.availability?.lastChecked 
            ? new Date(book.availability.lastChecked).toLocaleString() 
            : null;
          
          // Check if this book is currently being checked
          const isChecking = checkingBooks[book.id] || false;
          const isUpdatingIsbn = updatingIsbn[book.id] || false;
          
          // Determine which ISBN to use for library search
          const searchIsbn = book.isbn13 || book.isbn;
          
          return (
            <div key={book.id} className="bg-gray-50 rounded-lg p-4 flex flex-col">
              <div className="flex mb-4">
                {book.coverUrl ? (
                  <img 
                    src={book.coverUrl} 
                    alt={`Cover of ${book.title}`} 
                    className="w-24 h-36 object-cover rounded shadow-sm mr-4"
                  />
                ) : (
                  <div className="w-24 h-36 bg-gray-200 flex items-center justify-center rounded shadow-sm mr-4">
                    <span className="text-gray-400 text-xs text-center">No cover available</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-lg line-clamp-2">{book.title}</h3>
                  <p className="text-gray-600 text-sm mb-1">by {book.author}</p>
                  {book.publishedDate && (
                    <p className="text-gray-500 text-xs mb-1">{book.publishedDate}</p>
                  )}
                  {book.isbn && (
                    <p className="text-gray-500 text-xs">ISBN-10: {book.isbn}</p>
                  )}
                  <div className="flex items-center">
                    <p className="text-gray-500 text-xs">
                      ISBN-13: {book.isbn13 || 'Not available'}
                    </p>
                    {!book.isbn13 && !isUpdatingIsbn && (
                      <button 
                        onClick={() => handleUpdateIsbn13(book)}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Get ISBN-13
                      </button>
                    )}
                    {isUpdatingIsbn && (
                      <span className="ml-2 text-xs text-blue-600 flex items-center">
                        <RefreshCw size={10} className="mr-1 animate-spin" />
                        Updating...
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Library availability buttons */}
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen size={16} className="mr-2 text-blue-600" />
                    <span className="text-sm font-medium">eBook:</span>
                  </div>
                  {book.availability ? (
                    <a
                      href={libraryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-1 rounded-md text-xs font-medium flex items-center ${
                        ebookAvailable
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {ebookAvailable ? 'Borrow eBook' : 'Waitlist eBook'}
                      <ExternalLink size={12} className="ml-1" />
                    </a>
                  ) : (
                    <button
                      className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                      disabled
                    >
                      Not checked
                    </button>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Headphones size={16} className="mr-2 text-purple-600" />
                    <span className="text-sm font-medium">Audiobook:</span>
                  </div>
                  {book.availability ? (
                    <a
                      href={libraryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-1 rounded-md text-xs font-medium flex items-center ${
                        audiobookAvailable
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {audiobookAvailable ? 'Borrow eAudiobook' : 'Waitlist eAudiobook'}
                      <ExternalLink size={12} className="ml-1" />
                    </a>
                  ) : (
                    <button
                      className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                      disabled
                    >
                      Not checked
                    </button>
                  )}
                </div>
                
                {lastChecked && (
                  <div className="mt-1 text-xs text-gray-500">
                    Last checked: {lastChecked}
                  </div>
                )}
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between">
                <button
                  onClick={() => handleCheckLibraryAvailability(book)}
                  disabled={isChecking}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
                >
                  {isChecking ? (
                    <>
                      <RefreshCw size={14} className="mr-1 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Library size={14} className="mr-1" />
                      Check library
                    </>
                  )}
                </button>
                <button
                  onClick={() => onRemoveBook(book.id)}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center"
                >
                  Remove from list
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};