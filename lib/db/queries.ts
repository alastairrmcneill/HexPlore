import { getDb } from './client';

export type VisitedCell = {
  h3index: string;
  first_photo_date: number | null;
  last_photo_date: number | null;
  photo_count: number;
  source: 'photo' | 'manual';
  place_name: string | null;
  region: string | null;
  country: string | null;
  country_code: string | null;
  geocoded_at: number | null;
  created_at: number;
};

export async function upsertCell(
  h3index: string,
  photoDateMs: number,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO visited_cells (h3index, first_photo_date, last_photo_date, photo_count, source)
     VALUES (?, ?, ?, 1, 'photo')
     ON CONFLICT(h3index) DO UPDATE SET
       first_photo_date = MIN(first_photo_date, excluded.first_photo_date),
       last_photo_date  = MAX(last_photo_date,  excluded.last_photo_date),
       photo_count      = photo_count + 1`,
    [h3index, photoDateMs, photoDateMs],
  );
}

export async function insertManualCell(h3index: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR IGNORE INTO visited_cells
       (h3index, first_photo_date, last_photo_date, photo_count, source)
     VALUES (?, ?, ?, 0, 'manual')`,
    [h3index, Date.now(), Date.now()],
  );
}

export async function getAllCells(): Promise<VisitedCell[]> {
  const db = await getDb();
  return db.getAllAsync<VisitedCell>('SELECT * FROM visited_cells');
}

export async function getCellByIndex(h3index: string): Promise<VisitedCell | null> {
  const db = await getDb();
  return db.getFirstAsync<VisitedCell>(
    'SELECT * FROM visited_cells WHERE h3index = ?',
    [h3index],
  );
}

export async function updateGeocode(
  h3index: string,
  fields: Pick<VisitedCell, 'place_name' | 'region' | 'country' | 'country_code'>,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE visited_cells
     SET place_name = ?, region = ?, country = ?, country_code = ?, geocoded_at = ?
     WHERE h3index = ?`,
    [
      fields.place_name,
      fields.region,
      fields.country,
      fields.country_code,
      Date.now(),
      h3index,
    ],
  );
}

export async function getCellCountByCountry(): Promise<
  { country_code: string; count: number }[]
> {
  const db = await getDb();
  return db.getAllAsync<{ country_code: string; count: number }>(
    `SELECT country_code, COUNT(*) as count
     FROM visited_cells
     WHERE country_code IS NOT NULL
     GROUP BY country_code`,
  );
}

export async function insertCellPhoto(h3index: string, assetId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR IGNORE INTO cell_photos (h3index, asset_id) VALUES (?, ?)',
    [h3index, assetId],
  );
}

export async function getPhotoIdsByCell(h3index: string): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ asset_id: string }>(
    'SELECT asset_id FROM cell_photos WHERE h3index = ? LIMIT 20',
    [h3index],
  );
  return rows.map(r => r.asset_id);
}

export async function getCellsGroupedByYear(): Promise<
  { year: number; count: number }[]
> {
  const db = await getDb();
  return db.getAllAsync<{ year: number; count: number }>(
    `SELECT strftime('%Y', first_photo_date / 1000, 'unixepoch') as year,
            COUNT(*) as count
     FROM visited_cells
     WHERE first_photo_date IS NOT NULL
     GROUP BY year
     ORDER BY year ASC`,
  );
}
