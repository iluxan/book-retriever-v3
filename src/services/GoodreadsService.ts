//import { parseStringPromise } from 'xml2js';
import { XMLParser } from 'fast-xml-parser';

//import { Parser } from 'xml2js';
import { BookType } from '../types';

export class GoodreadsService {
  private static readonly CORS_PROXY = 'https://corsproxy.io/?';

  // Store the RSS URL securely in localStorage
  static async saveRssUrl(url: string): Promise<void> {
    try {
      localStorage.setItem('goodreads-rss-url', url);
    } catch (error) {
      console.error('Error saving RSS URL:', error);
      throw error;
    }
  }

  // Retrieve the RSS URL from localStorage
  static getRssUrl(): string | null {
    try {
      return localStorage.getItem('goodreads-rss-url');
    } catch (error) {
      console.error('Error retrieving RSS URL:', error);
      return null;
    }
  }

  // Fetch books from Goodreads RSS feed
  static async fetchBooks(rssUrl?: string): Promise<BookType[]> {
    try {
      const url = rssUrl || this.getRssUrl();

      if (!url) {
        throw new Error('No RSS URL provided');
      }

      // Use a CORS proxy to avoid CORS issues
      const proxyUrl = `${this.CORS_PROXY}${encodeURIComponent(url)}`;
      console.log('Fetching RSS from:', proxyUrl);

      const response = await fetch(proxyUrl);
      /*fetch(goodreadsUrl)
          .then(response => response.text())
          .then(data => {
              console.log("Raw Goodreads XML:", data); // Debugging output
          })
          .catch(error => console.error("Error fetching Goodreads data:", error));*/

      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
      }

      const xmlData = await response.text();

      if (!xmlData || xmlData.trim() === '') {
        throw new Error('Empty response from RSS feed');
      }

      console.log('Raw Goodreads XML:', xmlData);

      // Save XML to file for download
      this.saveXmlToFile(xmlData);

      console.log('RSS data received, parsing XML...');
      console.log('About to create the parser...');

      //const parser = new Parser({ explicitArray: false, trim: true });
      const parser = new XMLParser({
        ignoreAttributes: false,
        parseAttributeValue: true,
      });

      console.log('Successfully created the parser...');

      try {
        //const result = await parser.parseStringPromise(xmlData);
        const result = await parser.parse(xmlData);
        console.log('Parsed XML:', result);

        if (!result || !result.rss || !result.rss.channel) {
          console.error('Invalid RSS structure:', result);
          throw new Error('Invalid RSS feed format - missing channel');
        }

        if (!result.rss.channel.item) {
          console.log('No items found in RSS feed');
          return [];
        }

        // Handle both single item and array of items
        const items = Array.isArray(result.rss.channel.item)
          ? result.rss.channel.item
          : [result.rss.channel.item];

        console.log(`Found ${items.length} books in RSS feed`);

        // Limit to 20 books to prevent performance issues
        const limitedItems = items.slice(0, 20);
        console.log(`Processing ${limitedItems.length} books (limited to 20)`);

        return limitedItems.map((item: any) => this.parseRssItem(item));
      } catch (error) {
        console.error('XML Parsing Error:', error);
        throw error;
      }

      /*const result = await parseStringPromise(xmlData, { 
        explicitArray: false,
        trim: true
      });*/
    } catch (error) {
      console.error('Error fetching books from Goodreads:', error);
      throw error;
    }
  }

  // Save XML to file for download
  private static saveXmlToFile(xmlData: string): void {
    try {
      // Create a blob with the XML data
      const blob = new Blob([xmlData], { type: 'application/xml' });

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a download link
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'goodreads-rss.xml';
      downloadLink.textContent = 'Debug: Download XML';
      downloadLink.className = 'text-sm hover:text-white transition-colors';
      
      // Find the footer element
      const footerLinks = document.querySelector('.container .flex .flex.space-x-4');
      if (footerLinks) {
        footerLinks.appendChild(downloadLink);
      } else {
        console.log('Footer links container not found, adding to body temporarily');
        // If footer not found yet, add to body and try again later
        document.body.appendChild(downloadLink);
        
        // Try again after a short delay when DOM might be fully loaded
        setTimeout(() => {
          const footerLinks = document.querySelector('.container .flex .flex.space-x-4');
          if (footerLinks && document.body.contains(downloadLink)) {
            document.body.removeChild(downloadLink);
            footerLinks.appendChild(downloadLink);
          }
        }, 2000);
      }

      // Remove the link after 10 minutes
      setTimeout(() => {
        if (document.body.contains(downloadLink)) {
          document.body.removeChild(downloadLink);
        } else {
          const footerLinks = document.querySelector('.container .flex .flex.space-x-4');
          if (footerLinks && footerLinks.contains(downloadLink)) {
            footerLinks.removeChild(downloadLink);
          }
        }
        URL.revokeObjectURL(url);
      }, 600000); // 10 minutes

      console.log('XML file ready for download');
    } catch (error) {
      console.error('Error saving XML to file:', error);
    }
  }

  // Parse an RSS item into a BookType object
  private static parseRssItem(item: any): BookType {
    try {
      // Log the item structure to help with debugging
      console.log(
        'Parsing RSS item:',
        JSON.stringify(item).substring(0, 200) + '...'
      );

      // Extract the ISBN from the book_id field or generate a unique ID
      const id =
        item.book_id ||
        item.guid ||
        `goodreads-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Extract the title, handling potential HTML entities
      const title = this.cleanText(item.title) || 'Unknown Title';

      // Extract the author name
      const author =
        item.author_name || (item.author ? item.author.name : 'Unknown Author');

      // Extract the publication date if available
      const publishedDate = item.book_published || '';

      // Extract the ISBN if available
      const isbn = item.isbn || '';

      // Extract the cover URL
      let coverUrl = '';
      if (item.book_large_image_url) {
        coverUrl = item.book_large_image_url;
      } else if (item.book_image_url) {
        coverUrl = item.book_image_url;
      } else if (item.book_medium_image_url) {
        coverUrl = item.book_medium_image_url;
      } else if (item.book_small_image_url) {
        coverUrl = item.book_small_image_url;
      } else if (
        item.link &&
        typeof item.link === 'string' &&
        item.link.includes('goodreads.com')
      ) {
        // If we have a Goodreads link but no image, we could potentially construct a cover URL
        // This is a fallback and may not always work
        const bookIdMatch = item.link.match(/\/show\/(\d+)/);
        if (bookIdMatch && bookIdMatch[1]) {
          coverUrl = `https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/placeholder/${bookIdMatch[1]}._SX318_.jpg`;
        }
      }

      return {
        id,
        title,
        author,
        isbn,
        coverUrl,
        publishedDate,
      };
    } catch (error) {
      console.error('Error parsing RSS item:', error, item);
      // Return a minimal book object to avoid breaking the app
      return {
        id: `error-${Date.now()}`,
        title: item.title || 'Error parsing book',
        author: 'Unknown',
        isbn: '',
        coverUrl: '',
        publishedDate: '',
      };
    }
  }

  // Helper method to clean text from HTML entities and tags
  private static cleanText(text: string): string {
    if (!text) return '';

    // First remove HTML tags
    let cleaned = text.replace(/<\/?[^>]+(>|$)/g, '');

    // Then decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = cleaned;
    return textarea.value;
  }
}