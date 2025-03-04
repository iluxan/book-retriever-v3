import React from 'react';
import { BookOpen } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <BookOpen className="h-8 w-8 mr-2" />
          <h1 className="text-2xl font-bold">Instant Gratification Book Retriever</h1>
        </div>
      </div>
    </header>
  );
};