import { getDb } from "./client";

export type VisitedCell = {
  h3index: string;
  first_photo_date: number | null;
  last_photo_date: number | null;
  photo_count: number;
  source: "photo" | "manual";
  place_name: string | null;
  region: string | null;
  country: string | null;
  country_code: string | null;
  geocoded_at: number | null;
  rep_lat: number | null;
  rep_lng: number | null;
  deleted_at: number | null;
  created_at: number;
};

// A soft-deleted cell stays suppressed against the SAME photo re-appearing
// (e.g. a shared album rescanned from scratch) — asset_id is checked against
// cell_photos, which a delete never clears. A genuinely new photo (an asset_id
// never linked to this cell before) revives it: that's a real future visit.
export async function upsertCell(
  h3index: string,
  photoDateMs: number,
  assetId: string,
  lat?: number,
  lng?: number,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO visited_cells (h3index, first_photo_date, last_photo_date, photo_count, source, rep_lat, rep_lng)
     VALUES (?, ?, ?, 1, 'photo', ?, ?)
     ON CONFLICT(h3index) DO UPDATE SET
       first_photo_date = MIN(first_photo_date, excluded.first_photo_date),
       last_photo_date  = MAX(last_photo_date,  excluded.last_photo_date),
       rep_lat          = COALESCE(rep_lat, excluded.rep_lat),
       rep_lng          = COALESCE(rep_lng, excluded.rep_lng),
       geocoded_at      = CASE WHEN rep_lat IS NULL THEN NULL ELSE geocoded_at END,
       deleted_at       = NULL
     WHERE deleted_at IS NULL
        OR NOT EXISTS (
             SELECT 1 FROM cell_photos
             WHERE h3index = visited_cells.h3index AND asset_id = ?
           )`,
    [h3index, photoDateMs, photoDateMs, lat ?? null, lng ?? null, assetId],
  );
}

// Manual re-mark explicitly revives a soft-deleted cell (undoes the delete).
export async function insertManualCell(h3index: string, countryCode?: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO visited_cells
       (h3index, first_photo_date, last_photo_date, photo_count, source, country_code)
     VALUES (?, ?, ?, 0, 'manual', ?)
     ON CONFLICT(h3index) DO UPDATE SET deleted_at = NULL`,
    [h3index, Date.now(), Date.now(), countryCode ?? null],
  );
}

export async function deleteCell(h3index: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE visited_cells SET deleted_at = ? WHERE h3index = ?", [Date.now(), h3index]);
}

export async function getDeletedCells(): Promise<VisitedCell[]> {
  const db = await getDb();
  return db.getAllAsync<VisitedCell>(
    "SELECT * FROM visited_cells WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC",
  );
}

export async function restoreCell(h3index: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE visited_cells SET deleted_at = NULL WHERE h3index = ?", [h3index]);
}

export async function getAllCells(): Promise<VisitedCell[]> {
  const db = await getDb();
  return db.getAllAsync<VisitedCell>("SELECT * FROM visited_cells WHERE deleted_at IS NULL");
}

export async function getCellByIndex(h3index: string): Promise<VisitedCell | null> {
  const db = await getDb();
  return db.getFirstAsync<VisitedCell>(
    `SELECT v.*,
       (SELECT COUNT(*) FROM cell_photos cp WHERE cp.h3index = v.h3index) AS photo_count
     FROM visited_cells v WHERE v.h3index = ? AND v.deleted_at IS NULL`,
    [h3index],
  );
}

export async function updateGeocode(
  h3index: string,
  fields: Pick<VisitedCell, "place_name" | "region" | "country" | "country_code">,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE visited_cells
     SET place_name = ?, region = ?, country = ?, country_code = ?, geocoded_at = ?
     WHERE h3index = ?`,
    [fields.place_name, fields.region, fields.country, fields.country_code, Date.now(), h3index],
  );
}

export async function getCellCountByCountry(): Promise<{ country_code: string; count: number }[]> {
  const db = await getDb();
  return db.getAllAsync<{ country_code: string; count: number }>(
    `SELECT country_code, COUNT(*) as count
     FROM visited_cells
     WHERE country_code IS NOT NULL AND deleted_at IS NULL
     GROUP BY country_code`,
  );
}

export async function getUngeocodedCells(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ h3index: string }>(
    "SELECT h3index FROM visited_cells WHERE geocoded_at IS NULL AND deleted_at IS NULL",
  );
  return rows.map(r => r.h3index);
}

export async function insertCellPhoto(h3index: string, assetId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("INSERT OR IGNORE INTO cell_photos (h3index, asset_id) VALUES (?, ?)", [h3index, assetId]);
}

export async function getPhotoIdsByCell(h3index: string): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ asset_id: string }>(
    "SELECT asset_id FROM cell_photos WHERE h3index = ? LIMIT 5",
    [h3index],
  );
  return rows.map((r) => r.asset_id);
}

export async function getCellsGroupedByYear(): Promise<{ year: number; count: number }[]> {
  const db = await getDb();
  return db.getAllAsync<{ year: number; count: number }>(
    `SELECT strftime('%Y', first_photo_date / 1000, 'unixepoch') as year,
            COUNT(*) as count
     FROM visited_cells
     WHERE first_photo_date IS NOT NULL AND deleted_at IS NULL
     GROUP BY year
     ORDER BY year ASC`,
  );
}
