CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  price TEXT,
  status TEXT NOT NULL CHECK (status IN ('available','sold')),
  beds TEXT,
  baths TEXT,
  details TEXT,
  image TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_properties_status_updated
ON properties(status, updated_at DESC);

INSERT OR IGNORE INTO properties
(id,title,location,price,status,beds,baths,details,image)
VALUES
('meg-001','5-Bedroom Fully Detached Luxury Duplex','Megamound Estate, Lekki, Lagos','₦480,000,000','available','5 Bedrooms','6 Bathrooms','Brand-new residence with smart-home features, private swimming pool, fitted kitchen, BQ and premium finishes. Located on Roland Odewale Street, opposite The County Apartment, inside Megamound Estate.','');