import { BookType, BookAvailability, LibraryAvailability, Library } from '../types';
import { Database } from './Database';

export class LibraryService {
  private static readonly DEFAULT_LIBRARY: Library = {
    id: 'nypl',
    name: 'New York Public Library',
    website: 'https://www.nypl.org',
    apiEndpoint: 'https://borrow.nypl.org/search'
  };

  // Initialize default library if none exists
  static async initializeDefaultLibrary(): Promise<void> {
    const libraries = await Database.getLibraries();
    if (libraries.length === 0) {
      await Database.saveLibraries([this.DEFAULT_LIBRARY]);
    }
  }

  // Check availability for a single book
  static async checkBookAvailability(book: BookType): Promise<BookType> {
    // Prefer ISBN-13 for searching, fall back to ISBN-10
    const searchIsbn = book.isbn13 || book.isbn;
    
    if (!searchIsbn) {
      console.warn(`Book "${book.title}" has no ISBN, skipping availability check`);
      return book;
    }

    try {
      // Initialize libraries if needed
      await this.initializeDefaultLibrary();
      
      // Get the NYPL library
      const libraries = await Database.getLibraries();
      const nypl = libraries.find(lib => lib.id === 'nypl');
      
      if (!nypl) {
        throw new Error('NYPL library not found');
      }

      // Create the search URL
      const searchUrl = `https://borrow.nypl.org/search?query=${encodeURIComponent(searchIsbn)}&searchType=everything&pageSize=10&mode=advanced&materialTypeIds=z,n&pageNum=0`;
      
      // Use a CORS proxy to avoid CORS issues
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(searchUrl)}`;
      
      console.log(`Checking availability for "${book.title}" (ISBN: ${searchIsbn})`);
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from NYPL: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Parse the HTML to determine availability
      const isEbookAvailable = html.includes('Available to borrow') && html.includes('eBook');
      const isAudiobookAvailable = html.includes('Available to borrow') && html.includes('Audiobook');
      
      let format: 'ebook' | 'audiobook' | 'both' | 'none' = 'none';
      
      if (isEbookAvailable && isAudiobookAvailable) {
        format = 'both';
      } else if (isEbookAvailable) {
        format = 'ebook';
      } else if (isAudiobookAvailable) {
        format = 'audiobook';
      }
      
      // Create availability object
      const libraryAvailability: LibraryAvailability = {
        libraryId: nypl.id,
        name: nypl.name,
        available: isEbookAvailable || isAudiobookAvailable,
        format,
        url: searchUrl
      };
      
      // Update book availability
      const updatedBook = { 
        ...book, 
        availability: {
          lastChecked: Date.now(),
          libraries: [libraryAvailability]
        }
      };
      
      return updatedBook;
    } catch (error) {
      console.error(`Error checking availability for "${book.title}":`, error);
      
      // Return book with error status
      return {
        ...book,
        availability: {
          lastChecked: Date.now(),
          libraries: [{
            libraryId: 'nypl',
            name: 'New York Public Library',
            available: false,
            format: 'none',
            url: `https://borrow.nypl.org/search?query=${encodeURIComponent(searchIsbn)}&searchType=everything&pageSize=10&mode=advanced&materialTypeIds=z,n&pageNum=0`
          }]
        }
      };
    }
  }

  // Check availability for all books
  static async checkAllBooksAvailability(): Promise<BookType[]> {
    try {
      const books = await Database.getBooks();
      const updatedBooks: BookType[] = [];
      
      // Process books sequentially to avoid overwhelming the API
      for (const book of books) {
        const updatedBook = await this.checkBookAvailability(book);
        updatedBooks.push(updatedBook);
        
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Save updated books
      await Database.saveBooks(updatedBooks);
      
      return updatedBooks;
    } catch (error) {
      console.error('Error checking availability for all books:', error);
      throw error;
    }
  }

  // Clear availability data for all books
  static async clearAvailabilityData(): Promise<BookType[]> {
    try {
      const books = await Database.getBooks();
      
      const updatedBooks = books.map(book => ({
        ...book,
        availability: undefined
      }));
      
      await Database.saveBooks(updatedBooks);
      
      return updatedBooks;
    } catch (error) {
      console.error('Error clearing availability data:', error);
      throw error;
    }
  }
}