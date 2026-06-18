const fs = require('fs');

const dbData = JSON.parse(fs.readFileSync('database.json', 'utf8'));
const envData = fs.readFileSync('.env', 'utf8');

let sql = '';

// Create Clients table
sql += `CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    representative VARCHAR(255),
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    city VARCHAR(255),
    address VARCHAR(255),
    serviceType VARCHAR(255),
    status VARCHAR(255),
    lastContact VARCHAR(255),
    initials VARCHAR(10),
    ruc VARCHAR(20),
    department VARCHAR(255),
    notes TEXT
);\n\n`;

// Create Client Timeline table
sql += `CREATE TABLE IF NOT EXISTS client_timeline (
    id VARCHAR(255) PRIMARY KEY,
    client_id VARCHAR(255),
    title VARCHAR(255),
    content TEXT,
    date VARCHAR(255),
    addedBy VARCHAR(255),
    type VARCHAR(50),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);\n\n`;

// Insert Clients
for (const client of dbData.clients || []) {
    sql += `INSERT INTO clients (id, name, representative, company, email, phone, city, address, serviceType, status, lastContact, initials, ruc, department, notes) VALUES (
        '${client.id || ''}',
        '${client.name || ''}',
        '${client.representative || ''}',
        '${client.company || ''}',
        '${client.email || ''}',
        '${client.phone || ''}',
        '${client.city || ''}',
        '${client.address || ''}',
        '${client.serviceType || ''}',
        '${client.status || ''}',
        '${client.lastContact || ''}',
        '${client.initials || ''}',
        '${client.ruc || ''}',
        '${client.department || ''}',
        '${(client.notes || '').replace(/'/g, "''")}'
    );\n`;

    for (const tl of client.timeline || []) {
        sql += `INSERT INTO client_timeline (id, client_id, title, content, date, addedBy, type) VALUES (
            '${tl.id || ''}',
            '${client.id || ''}',
            '${tl.title || ''}',
            '${(tl.content || '').replace(/'/g, "''")}',
            '${tl.date || ''}',
            '${tl.addedBy || ''}',
            '${tl.type || ''}'
        );\n`;
    }
}
sql += '\n';

// Create Activities table
sql += `CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255),
    detail TEXT,
    time VARCHAR(255),
    author VARCHAR(255),
    type VARCHAR(50),
    statusLabel VARCHAR(100),
    statusType VARCHAR(50)
);\n\n`;

for (const act of dbData.activities || []) {
    sql += `INSERT INTO activities (id, title, detail, time, author, type, statusLabel, statusType) VALUES (
        '${act.id || ''}',
        '${act.title || ''}',
        '${(act.detail || '').replace(/'/g, "''")}',
        '${act.time || ''}',
        '${act.author || ''}',
        '${act.type || ''}',
        '${act.statusLabel || ''}',
        '${act.statusType || ''}'
    );\n`;
}
sql += '\n';

// Create Users table
sql += `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(50),
    avatarUrl TEXT,
    password VARCHAR(255),
    phone VARCHAR(255),
    department VARCHAR(255)
);\n\n`;

for (const user of dbData.users || []) {
    sql += `INSERT INTO users (id, name, email, role, avatarUrl, password, phone, department) VALUES (
        '${user.id || ''}',
        '${user.name || ''}',
        '${user.email || ''}',
        '${user.role || ''}',
        '${(user.avatarUrl || '').replace(/'/g, "''")}',
        '${user.password || ''}',
        '${user.phone || ''}',
        '${user.department || ''}'
    );\n`;
}
sql += '\n';

// Create Products table
sql += `CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    sku VARCHAR(100),
    description TEXT,
    department VARCHAR(255),
    category VARCHAR(255),
    costPrice DECIMAL(10,2),
    unitPrice DECIMAL(10,2),
    discount DECIMAL(10,2),
    stock INT,
    lowStockThreshold INT,
    weight DECIMAL(10,2),
    dimensions VARCHAR(100),
    imageUrl TEXT
);\n\n`;

for (const p of dbData.products || []) {
    sql += `INSERT INTO products (id, name, sku, description, department, category, costPrice, unitPrice, discount, stock, lowStockThreshold, weight, dimensions, imageUrl) VALUES (
        '${p.id || ''}',
        '${(p.name || '').replace(/'/g, "''")}',
        '${p.sku || ''}',
        '${(p.description || '').replace(/'/g, "''")}',
        '${p.department || ''}',
        '${p.category || ''}',
        ${p.costPrice || 0},
        ${p.unitPrice || 0},
        ${p.discount || 0},
        ${p.stock || 0},
        ${p.lowStockThreshold || 0},
        ${p.weight || 0},
        '${p.dimensions || ''}',
        '${(p.imageUrl || '').replace(/'/g, "''")}'
    );\n`;
}
sql += '\n';

// Create Fiscal Settings table
sql += `CREATE TABLE IF NOT EXISTS fiscal_settings (
    id INT PRIMARY KEY,
    nombreComercial VARCHAR(255),
    slogan VARCHAR(255),
    ruc VARCHAR(20),
    telefono VARCHAR(50),
    direccion VARCHAR(255),
    firmaElectronica TEXT
);\n\n`;

const fsData = dbData.fiscalSettings || {};
sql += `INSERT INTO fiscal_settings (id, nombreComercial, slogan, ruc, telefono, direccion, firmaElectronica) VALUES (
    1,
    '${(fsData.nombreComercial || '').replace(/'/g, "''")}',
    '${(fsData.slogan || '').replace(/'/g, "''")}',
    '${fsData.ruc || ''}',
    '${fsData.telefono || ''}',
    '${(fsData.direccion || '').replace(/'/g, "''")}',
    '${(fsData.firmaElectronica || '').replace(/'/g, "''")}'
);\n\n`;

// Create Config / Env table
sql += `CREATE TABLE IF NOT EXISTS config (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT
);\n\n`;

const envLines = envData.split('\n');
for (const line of envLines) {
    if (line.trim() && !line.startsWith('#')) {
        const [key, ...valParts] = line.split('=');
        const value = valParts.join('=').replace(/^"|"$/g, '');
        sql += `INSERT INTO config (key, value) VALUES ('${key}', '${value.replace(/'/g, "''")}');\n`;
    }
}

fs.writeFileSync('database.sql', sql);
console.log('database.sql generated successfully.');
