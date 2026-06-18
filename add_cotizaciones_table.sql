CREATE TABLE IF NOT EXISTS cotizaciones (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    department TEXT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    items_json TEXT NOT NULL, -- JSON array of items
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    pdf_url TEXT
);
