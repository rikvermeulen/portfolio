import { env } from '@/env.mjs';

import Book from '@/components/Bento/types/Books';

async function getData(book_id: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(book_id)}?key=${
        env.GOOLGE_BOOKS_API_KEY
      }`,
      { cache: 'force-cache' },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch book data:', error);
  }
}

export default async function Books() {
  const data = await getData('Fse0EAAAQBAJ');

  if (!data) return <></>;

  return <Book book={data} />;
}
