import React from 'react';
import { Database } from '../services/Database';

export const Footer: React.FC = () => {
  const handleRestartFresh = () => {
    if (confirm('Are you sure you want to restart fresh? This will clear all your books and settings.')) {
      // Clear all data from local storage
      Database.clearAll().then(() => {
        // Reload the page to start fresh
        window.location.reload();
      });
    }
  };

  return (
    <footer className="bg-gray-800 text-gray-300 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Book Retriever. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-sm hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm hover:text-white transition-colors">
              Terms of Service
            </a>
            <button 
              onClick={handleRestartFresh}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Restart Fresh
            </button>
            <a href="#" className="text-sm hover:text-white transition-colors">
              Contact
            </a>
            {/* The XML download link will be added here dynamically */}
          </div>
        </div>
      </div>
    </footer>
  );
};