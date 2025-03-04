import React, { useState, useEffect } from 'react';
import { BookList } from './components/BookList';
import { BookSearch } from './components/BookSearch';
import { GoodreadsImport } from './components/GoodreadsImport';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BookType } from './types';
import { Database } from './services/Database';
import { GoodreadsService } from './services/GoodreadsService';
import { LibraryService } from './services/LibraryService';
import { BookIcon, RefreshCw, Library } from 'lucide-react';

function App() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'myBooks' | 'search'>('myBooks');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [demoMode, setDemoMode] = useState<boolean>(false);

  useEffect(() => {
    // Load books from local storage on initial render
    const loadBooks = async () => {
      try {
        setIsLoading(true);
        const storedBooks = await Database.getBooks();
        
        if (storedBooks && storedBooks.length > 0) {
          console.log(`Loaded ${storedBooks.length} books from local storage`);
          setBooks(storedBooks);
        } else {
          console.log('No books in local storage, checking for Goodreads RSS URL');
          // If no books in storage, try to load from Goodreads RSS if URL exists
          const rssUrl = GoodreadsService.getRssUrl();
          if (rssUrl) {
            try {
              console.log('Found RSS URL, fetching books from Goodreads');
              const goodreadsBooks = await GoodreadsService.fetchBooks(rssUrl);
              if (goodreadsBooks && goodreadsBooks.length > 0) {
                console.log(`Fetched ${goodreadsBooks.length} books from Goodreads RSS`);
                setBooks(goodreadsBooks);
                await Database.saveBooks(goodreadsBooks);
              } else {
                console.log('No books found in Goodreads RSS feed');
              }
            } catch (rssError) {
              console.error('Failed to load books from Goodreads RSS:', rssError);
              // Don't set error here, just fall back to empty books list
            }
          } else {
            console.log('No RSS URL found, showing import screen');
          }
        }
      } catch (err) {
        console.error('Error loading books:', err);
        setError('Failed to load your books. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, []);

  const addBook = async (book: BookType) => {
    try {
      // Check if book already exists in the list
      if (books.some(b => b.id === book.id)) {
        setError('This book is already in your reading list.');
        return;
      }
      
      const updatedBooks = [...books, book];
      setBooks(updatedBooks);
      await Database.saveBooks(updatedBooks);
    } catch (err) {
      setError('Failed to save book. Please try again.');
      console.error(err);
    }
  };

  const removeBook = async (id: string) => {
    try {
      const updatedBooks = books.filter(book => book.id !== id);
      setBooks(updatedBooks);
      await Database.saveBooks(updatedBooks);
    } catch (err) {
      setError('Failed to remove book. Please try again.');
      console.error(err);
    }
  };

  const handleBooksImported = async (importedBooks: BookType[]) => {
    try {
      setBooks(importedBooks);
      await Database.saveBooks(importedBooks);
      setIsImporting(false);
    } catch (err) {
      setError('Failed to save imported books. Please try again.');
      console.error(err);
    }
  };

  const updateBooks = (updatedBooks: BookType[]) => {
    setBooks(updatedBooks);
  };

  const handleStartDemo = async () => {
    try {
      setIsLoading(true);
      // Load some sample books for demo mode
      const demoBooks: BookType[] = [
        {
          id: 'demo-1',
          title: 'The Midnight Library',
          author: 'Matt Haig',
          isbn: '0525559477',
          isbn13: '9780525559474',
          coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1602190253i/52578297.jpg',
          publishedDate: '2020-09-29'
        },
        {
          id: 'demo-2',
          title: 'Project Hail Mary',
          author: 'Andy Weir',
          isbn: '0593135202',
          isbn13: '9780593135204',
          coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1597695864i/54493401.jpg',
          publishedDate: '2021-05-04'
        },
        {
          id: 'demo-3',
          title: 'Klara and the Sun',
          author: 'Kazuo Ishiguro',
          isbn: '059331817X',
          isbn13: '9780593318171',
          coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1603206535i/54120408.jpg',
          publishedDate: '2021-03-02'
        }
      ];
      
      setBooks(demoBooks);
      await Database.saveBooks(demoBooks);
      setDemoMode(true);
    } catch (err) {
      setError('Failed to load demo books. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
            <button 
              className="text-sm underline" 
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('myBooks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'myBooks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Books
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'search'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Search
              </button>
            </nav>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : activeTab === 'myBooks' ? (
          <div>
            {isImporting ? (
              <GoodreadsImport onBooksImported={handleBooksImported} />
            ) : books.length === 0 ? (
              <div className="text-center py-12">
                <img 
                  src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80" 
                  alt="Book illustration" 
                  className="w-32 h-32 mx-auto mb-4 rounded-full object-cover"
                />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Quickly find and check out books from your local library</h2>
                <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                  Currently supporting New York Public Library. Import your Goodreads list or explore with demo books.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setIsImporting(true)}
                  >
                    <BookIcon className="mr-2 h-5 w-5" />
                    Import my Goodreads Books
                  </button>
                  <button 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={handleStartDemo}
                  >
                    <Library className="mr-2 h-5 w-5" />
                    Explore the App (Demo)
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">My Reading List</h2>
                  <div className="flex space-x-2">
                    <button 
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setIsImporting(true)}
                    >
                      <RefreshCw size={16} className="mr-1" />
                      Re-import from Goodreads
                    </button>
                  </div>
                </div>
                <BookList 
                  books={books} 
                  onRemoveBook={removeBook} 
                  onUpdateBooks={updateBooks}
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <BookSearch onAddBook={addBook} />
            {books.length > 0 && (
              <div className="mt-8">
                <BookList 
                  books={books} 
                  onRemoveBook={removeBook} 
                  onUpdateBooks={updateBooks}
                />
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;