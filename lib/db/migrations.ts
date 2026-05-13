import { getDb } from './client';
import { CREATE_VISITED_CELLS, CREATE_INDEX_COUNTRY, CREATE_INDEX_DATE, CREATE_CELL_PHOTOS } from './schema';

export async function runMigrations(): Promise<void> {
  const db = await getDb();
  await db.execAsync(CREATE_VISITED_CELLS);
  await db.execAsync(CREATE_INDEX_COUNTRY);
  await db.execAsync(CREATE_INDEX_DATE);
  await db.execAsync(CREATE_CELL_PHOTOS);
}
