import React, { useState } from 'react';
import { BookType } from '../types';
import { GoodreadsService } from '../services/GoodreadsService';
import { RssIcon, AlertCircle, CheckCircle } from 'lucide-react';

interface GoodreadsImportProps {
  onBooksImported: (books: BookType[]) => void;
}

export const GoodreadsImport: React.FC<GoodreadsImportProps> = ({ onBooksImported }) => {
  const [rssUrl, setRssUrl] = useState<string>(GoodreadsService.getRssUrl() || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string>('');

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rssUrl.trim()) {
      setError('Please enter a valid Goodreads RSS URL');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    setImportStatus('Connecting to Goodreads RSS feed...');
    
    try {
      // Save the RSS URL for future use
      await GoodreadsService.saveRssUrl(rssUrl);
      
      // Fetch books from the RSS feed
      setImportStatus('Fetching books from Goodreads...');
      const books = await GoodreadsService.fetchBooks(rssUrl);
      
      setImportStatus('Processing book data...');
      
      if (books.length === 0) {
        setError('No books found in the RSS feed. Please check the URL and try again.');
      } else {
        setImportStatus(`Successfully imported ${books.length} books!`);
        onBooksImported(books);
        setIsSuccess(true);
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setError(`Failed to import books from Goodreads: ${err.message || 'Unknown error'}. Please check your RSS URL and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <RssIcon className="mr-2" size={20} />
        Import from Goodreads
      </h2>
      
      <p className="mb-4 text-gray-600">
        Enter your Goodreads "Want to Read" shelf RSS URL to import your reading list.
      </p>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
        <h3 className="font-medium">How to find your Goodreads RSS URL:</h3>
        <ol className="list-decimal ml-5 mt-2 text-sm">
          <li>Go to <a href="https://www.goodreads.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Goodreads.com</a> and log in</li>
          <li>Click on "My Books" in the top navigation</li>
          <li>Select your "Want to Read" shelf</li>
          <li>Scroll to the bottom of the page and click on the RSS icon</li>
          <li>Copy the URL from your browser's address bar</li>
        </ol>
      </div>
      
      <form onSubmit={handleImport} className="mb-6">
        <div className="mb-4">
          <label htmlFor="rss-url" className="block text-sm font-medium text-gray-700 mb-1">
            Goodreads RSS URL
          </label>
          <input
            type="text"
            id="rss-url"
            value={rssUrl}
            onChange={(e) => setRssUrl(e.target.value)}
            placeholder="https://www.goodreads.com/review/list_rss/YOUR_USER_ID?key=YOUR_KEY&shelf=to-read"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Example: https://www.goodreads.com/review/list_rss/118633?key=SoQnCMSEuLV-3Orq_plmljMZ7EDteG-ZJwIwnRsWgTdBPszP&shelf=to-read
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Importing...
            </span>
          ) : (
            'Import Books'
          )}
        </button>
      </form>

      {isLoading && importStatus && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded-md mb-4">
          <p className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {importStatus}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Success!</p>
            <p className="text-sm">Books successfully imported from Goodreads!</p>
          </div>
        </div>
      )}
    </div>
  );
};