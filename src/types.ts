export interface BookType {
  id: string;
  title: string;
  author: string;
  isbn: string;
  isbn13?: string;
  coverUrl?: string;
  publishedDate?: string;
  availability?: BookAvailability;
}

export interface BookAvailability {
  lastChecked: number; // timestamp
  libraries: LibraryAvailability[];
}

export interface LibraryAvailability {
  libraryId: string;
  name: string;
  available: boolean;
  format: 'ebook' | 'audiobook' | 'both' | 'none';
  url?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  libraries: UserLibrary[];
}

export interface UserLibrary {
  libraryId: string;
  cardNumber?: string;
  pin?: string;
}

export interface Library {
  id: string;
  name: string;
  website: string;
  apiEndpoint?: string;
}