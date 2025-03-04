import { BookType, User, Library, BookAvailability } from '../types';

// Simple local storage database service
export class Database {
  private static readonly BOOKS_KEY = 'book-retriever-books';
  private static readonly USER_KEY = 'book-retriever-user';
  private static readonly LIBRARIES_KEY = 'book-retriever-libraries';
  private static readonly AVAILABILITY_KEY = 'book-retriever-availability';

  // Book methods
  static async getBooks(): Promise<BookType[]> {
    try {
      const data = localStorage.getItem(this.BOOKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting books from storage:', error);
      return [];
    }
  }

  static async saveBooks(books: BookType[]): Promise<void> {
    try {
      localStorage.setItem(this.BOOKS_KEY, JSON.stringify(books));
    } catch (error) {
      console.error('Error saving books to storage:', error);
      throw error;
    }
  }

  // User methods
  static async getUser(): Promise<User | null> {
    try {
      const data = localStorage.getItem(this.USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user from storage:', error);
      return null;
    }
  }

  static async saveUser(user: User): Promise<void> {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
      throw error;
    }
  }

  // Libraries methods
  static async getLibraries(): Promise<Library[]> {
    try {
      const data = localStorage.getItem(this.LIBRARIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting libraries from storage:', error);
      return [];
    }
  }

  static async saveLibraries(libraries: Library[]): Promise<void> {
    try {
      localStorage.setItem(this.LIBRARIES_KEY, JSON.stringify(libraries));
    } catch (error) {
      console.error('Error saving libraries to storage:', error);
      throw error;
    }
  }

  // Availability methods
  static async getAvailability(): Promise<Record<string, BookAvailability>> {
    try {
      const data = localStorage.getItem(this.AVAILABILITY_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting availability from storage:', error);
      return {};
    }
  }

  static async saveAvailability(availability: Record<string, BookAvailability>): Promise<void> {
    try {
      localStorage.setItem(this.AVAILABILITY_KEY, JSON.stringify(availability));
    } catch (error) {
      console.error('Error saving availability to storage:', error);
      throw error;
    }
  }

  // Clear all data
  static async clearAll(): Promise<void> {
    try {
      localStorage.removeItem(this.BOOKS_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.LIBRARIES_KEY);
      localStorage.removeItem(this.AVAILABILITY_KEY);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}