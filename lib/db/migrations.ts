import { getDb } from './client';
import { CREATE_VISITED_CELLS, CREATE_INDEX_COUNTRY, CREATE_INDEX_DATE } from './schema';

export async function runMigrations(): Promise<void> {
  const db = await getDb();
  await db.execAsync(CREATE_VISITED_CELLS);
  await db.execAsync(CREATE_INDEX_COUNTRY);
  await db.execAsync(CREATE_INDEX_DATE);
}
