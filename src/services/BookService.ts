import { BookType } from '../types';

export class BookService {
  private static readonly GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

  static async searchBooks(query: string): Promise<BookType[]> {
    try {
      const response = await fetch(`${this.GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=10`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.items) {
        return [];
      }
      
      return data.items.map((item: any) => {
        const volumeInfo = item.volumeInfo;
        const identifiers = this.extractIdentifiers(volumeInfo.industryIdentifiers);
        
        return {
          id: item.id,
          title: volumeInfo.title,
          author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown',
          isbn: identifiers.isbn10 || '',
          isbn13: identifiers.isbn13 || '',
          coverUrl: volumeInfo.imageLinks?.thumbnail,
          publishedDate: volumeInfo.publishedDate
        };
      });
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  }

  static async fetchBookDetails(book: BookType): Promise<BookType> {
    // If we already have ISBN-13, no need to fetch
    if (book.isbn13) {
      return book;
    }

    try {
      // Try to search by ISBN first
      let query = book.isbn ? `isbn:${book.isbn}` : `intitle:${book.title} inauthor:${book.author}`;
      const response = await fetch(`${this.GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=1`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        // If no results with ISBN, try with title and author
        if (book.isbn) {
          return this.fetchBookDetails({
            ...book,
            isbn: '' // Clear ISBN to force title/author search
          });
        }
        return book; // Return original if no results found
      }
      
      const volumeInfo = data.items[0].volumeInfo;
      const identifiers = this.extractIdentifiers(volumeInfo.industryIdentifiers);
      
      return {
        ...book,
        isbn13: identifiers.isbn13 || book.isbn13,
        isbn: identifiers.isbn10 || book.isbn,
        coverUrl: book.coverUrl || volumeInfo.imageLinks?.thumbnail,
        publishedDate: book.publishedDate || volumeInfo.publishedDate
      };
    } catch (error) {
      console.error(`Error fetching details for book "${book.title}":`, error);
      return book; // Return original book on error
    }
  }

  private static extractIdentifiers(identifiers: any[] | undefined): { isbn10: string, isbn13: string } {
    if (!identifiers) return { isbn10: '', isbn13: '' };
    
    let isbn10 = '';
    let isbn13 = '';
    
    // Find ISBN-13 and ISBN-10
    identifiers.forEach(id => {
      if (id.type === 'ISBN_13') {
        isbn13 = id.identifier;
      } else if (id.type === 'ISBN_10') {
        isbn10 = id.identifier;
      }
    });
    
    return { isbn10, isbn13 };
  }
}