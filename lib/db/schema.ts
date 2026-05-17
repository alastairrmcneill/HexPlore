export const CREATE_VISITED_CELLS = `
  CREATE TABLE IF NOT EXISTS visited_cells (
    h3index          TEXT    PRIMARY KEY,
    first_photo_date INTEGER,
    last_photo_date  INTEGER,
    photo_count      INTEGER DEFAULT 0,
    source           TEXT    DEFAULT 'photo',
    place_name       TEXT,
    region           TEXT,
    country          TEXT,
    country_code     TEXT,
    geocoded_at      INTEGER,
    created_at       INTEGER DEFAULT (unixepoch())
  )
`;

export const CREATE_INDEX_COUNTRY = `
  CREATE INDEX IF NOT EXISTS idx_visited_cells_country
  ON visited_cells(country_code)
`;

export const CREATE_INDEX_DATE = `
  CREATE INDEX IF NOT EXISTS idx_visited_cells_first_photo
  ON visited_cells(first_photo_date)
`;

export const CREATE_CELL_PHOTOS = `
  CREATE TABLE IF NOT EXISTS cell_photos (
    h3index  TEXT NOT NULL,
    asset_id TEXT NOT NULL,
    PRIMARY KEY (h3index, asset_id)
  )
`;
