CREATE TABLE IF NOT EXISTS clients (
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
);

CREATE TABLE IF NOT EXISTS client_timeline (
    id VARCHAR(255) PRIMARY KEY,
    client_id VARCHAR(255),
    title VARCHAR(255),
    content TEXT,
    date VARCHAR(255),
    addedBy VARCHAR(255),
    type VARCHAR(50),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

INSERT INTO clients (id, name, representative, company, email, phone, city, address, serviceType, status, lastContact, initials, ruc, department, notes) VALUES (
        'elian-moreirava-co',
        'Elian Moreira Vasco',
        'Elian Moreira Vasco (Representante)',
        'Elian S.A.',
        'elianmv2000@hotmail.com',
        '0999346103',
        'Quito',
        'Sauces 4',
        'Asesoría Legal Corporate',
        'nuevo lead',
        'Hoy, Justo ahora',
        'EM',
        '0940342892',
        'Bazar',
        'Sin comentarios iniciales'
    );
INSERT INTO client_timeline (id, client_id, title, content, date, addedBy, type) VALUES (
            'event-initial',
            'elian-moreirava-co',
            'Registro de Prospecto',
            'Registrado con éxito como prospecto en ECU-CRM. Notas iniciales: Ninguna',
            'Hoy, Justo ahora',
            'Erick Reyes',
            'status'
        );

CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255),
    detail TEXT,
    time VARCHAR(255),
    author VARCHAR(255),
    type VARCHAR(50),
    statusLabel VARCHAR(100),
    statusType VARCHAR(50)
);

INSERT INTO activities (id, title, detail, time, author, type, statusLabel, statusType) VALUES (
        'act-del-1780869113153',
        'Segundo Reyes',
        'cliente eliminado con autorización de PIN',
        'Hace un momento',
        'Erick Reyes',
        'complete',
        'ELIMINADO',
        'gray'
    );
INSERT INTO activities (id, title, detail, time, author, type, statusLabel, statusType) VALUES (
        'act-new-1780869102739',
        'Elian Moreira Vasco',
        'ha sido registrado',
        'Hace un momento',
        'Erick Reyes',
        'register',
        'CONTACTO INICIAL',
        'orange'
    );
INSERT INTO activities (id, title, detail, time, author, type, statusLabel, statusType) VALUES (
        'act-1780785161771',
        'Segundo Reyes',
        'Estado cambiado a CONTACTO INICIAL',
        'Hace un momento',
        'Erick Reyes',
        'proposal',
        'CONTACTO INICIAL',
        'orange'
    );
INSERT INTO activities (id, title, detail, time, author, type, statusLabel, statusType) VALUES (
        'act-1780785154837',
        'Segundo Reyes',
        'Estado cambiado a FINALIZADO',
        'Hace un momento',
        'Erick Reyes',
        'proposal',
        'FINALIZADO',
        'green'
    );
INSERT INTO activities (id, title, detail, time, author, type, statusLabel, statusType) VALUES (
        'act-new-1780785143880',
        'Segundo Reyes',
        'ha sido registrado',
        'Hace un momento',
        'Erick Reyes',
        'register',
        'CONTACTO INICIAL',
        'orange'
    );

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(50),
    avatarUrl TEXT,
    password VARCHAR(255),
    phone VARCHAR(255),
    department VARCHAR(255)
);

INSERT INTO users (id, name, email, role, avatarUrl, password, phone, department) VALUES (
        'carlos-andrade',
        'Erick Reyes',
        'sirek',
        'Super Admin',
        'data:image/jpeg;base64,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',
        'Erick1212',
        '',
        ''
    );
INSERT INTO users (id, name, email, role, avatarUrl, password, phone, department) VALUES (
        'alejandro-v',
        'Alejandro Valenzuela',
        'alejandro.v@ecuacrm.com.ec',
        'Ejecutivo de Cuentas',
        '',
        'Erick1212',
        '',
        ''
    );
INSERT INTO users (id, name, email, role, avatarUrl, password, phone, department) VALUES (
        'super-admin-1',
        'super',
        'old_admin@sidcrm.com.ec',
        'Old Admin',
        '',
        'Erick1212',
        '',
        ''
    );
INSERT INTO users (id, name, email, role, avatarUrl, password, phone, department) VALUES (
        'admin-bazar',
        'Admin Bazar',
        'admin.bazar@sidcrm.com.ec',
        'Administrador',
        '',
        'admin',
        '',
        'Bazar'
    );
INSERT INTO users (id, name, email, role, avatarUrl, password, phone, department) VALUES (
        'admin-ferretería',
        'Admin Ferretería',
        'admin.ferretería@sidcrm.com.ec',
        'Administrador',
        '',
        'admin',
        '',
        'Ferretería'
    );
INSERT INTO users (id, name, email, role, avatarUrl, password, phone, department) VALUES (
        'admin-tecnología',
        'Admin Tecnología',
        'admin.tecnología@sidcrm.com.ec',
        'Administrador',
        '',
        'admin',
        '',
        'Tecnología'
    );

CREATE TABLE IF NOT EXISTS products (
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
);

INSERT INTO products (id, name, sku, description, department, category, costPrice, unitPrice, discount, stock, lowStockThreshold, weight, dimensions, imageUrl) VALUES (
        'p-b001',
        'Libreta Universitaria Espiral',
        'b001',
        'Libreta de 100 hojas a cuadros.',
        'Bazar',
        'Papelería',
        1.2,
        2.5,
        0,
        10,
        5,
        0.2,
        '20x25x1 cm',
        'https://via.placeholder.com/150/ffb6c1/000000?text=Libreta'
    );
INSERT INTO products (id, name, sku, description, department, category, costPrice, unitPrice, discount, stock, lowStockThreshold, weight, dimensions, imageUrl) VALUES (
        'p-b002',
        'Set de Esferos Azules',
        'b002',
        'Caja de 12 esferos tinta azul.',
        'Bazar',
        'Escritura',
        2,
        3.5,
        0,
        10,
        5,
        0.1,
        '15x5x2 cm',
        'https://via.placeholder.com/150/ffb6c1/000000?text=Esferos'
    );
INSERT INTO products (id, name, sku, description, department, category, costPrice, unitPrice, discount, stock, lowStockThreshold, weight, dimensions, imageUrl) VALUES (
        'p-b003',
        'Carpeta Archivadora',
        'b003',
        'Carpeta plástica tamaño oficio.',
        'Bazar',
        'Organización',
        0.8,
        1.5,
        0,
        10,
        5,
        0.3,
        '35x25x0.5 cm',
        'https://via.placeholder.com/150/ffb6c1/000000?text=Carpeta'
    );
INSERT INTO products (id, name, sku, description, department, category, costPrice, unitPrice, discount, stock, lowStockThreshold, weight, dimensions, imageUrl) VALUES (
        'p-f001',
        'Martillo de Acero',
        'f001',
        'Martillo con mango de goma.',
        'Ferretería',
        'Herramientas',
        5.5,
        12,
        0,
        10,
        5,
        1.5,
        '30x15x5 cm',
        'https://via.placeholder.com/150/ffd700/000000?text=Martillo'
    );
INSERT INTO products (id, name, sku, description, department, category, costPrice, unitPrice, discount, stock, lowStockThreshold, weight, dimensions, imageUrl) VALUES (
        'p-f002',
        'Taladro Percutor 500W',
        'f002',
        'Taladro eléctrico industrial.',
        'Ferretería',
        'Eléctricas',
        25,
        45,
        0,
        10,
        5,
        3,
        '25x20x8 cm',
        'https://via.placeholder.com/150/ffd700/000000?text=Taladro'
    );
INSERT INTO products (id, name, sku, description, department, category, costPrice, unitPrice, discount, stock, lowStockThreshold, weight, dimensions, imageUrl) VALUES (
        'p-f003',
        'Caja de Clavos 2"',
        'f003',
        'Clavos de acero galvanizado (1kg).',
        'Ferretería',
        'Insumos',
        2,
        4,
        0,
        10,
        5,
        1,
        '10x10x10 cm',
        'https://via.placeholder.com/150/ffd700/000000?text=Clavos'
    );
INSERT INTO products (id, name, sku, description, department, category, costPrice, unitPrice, discount, stock, lowStockThreshold, weight, dimensions, imageUrl) VALUES (
        'p-t001',
        'Monitor 24" Full HD',
        't001',
        'Monitor IPS 75Hz para oficina.',
        'Tecnología',
        'Monitores',
        90,
        140,
        0,
        10,
        5,
        4.5,
        '55x40x15 cm',
        'https://via.placeholder.com/150/87cefa/000000?text=Monitor'
    );
INSERT INTO products (id, name, sku, description, department, category, costPrice, unitPrice, discount, stock, lowStockThreshold, weight, dimensions, imageUrl) VALUES (
        'p-t002',
        'Teclado Mecánico',
        't002',
        'Teclado RGB switches azules.',
        'Tecnología',
        'Periféricos',
        20,
        45,
        0,
        10,
        5,
        1.2,
        '45x15x4 cm',
        'https://via.placeholder.com/150/87cefa/000000?text=Teclado'
    );
INSERT INTO products (id, name, sku, description, department, category, costPrice, unitPrice, discount, stock, lowStockThreshold, weight, dimensions, imageUrl) VALUES (
        'p-t003',
        'Mouse Inalámbrico',
        't003',
        'Mouse ergonómico 2.4GHz.',
        'Tecnología',
        'Periféricos',
        8,
        18,
        0,
        10,
        5,
        0.2,
        '10x6x4 cm',
        'https://via.placeholder.com/150/87cefa/000000?text=Mouse'
    );

CREATE TABLE IF NOT EXISTS fiscal_settings (
    id INT PRIMARY KEY,
    nombreComercial VARCHAR(255),
    slogan VARCHAR(255),
    ruc VARCHAR(20),
    telefono VARCHAR(50),
    direccion VARCHAR(255),
    firmaElectronica TEXT
);

INSERT INTO fiscal_settings (id, nombreComercial, slogan, ruc, telefono, direccion, firmaElectronica) VALUES (
    1,
    '',
    '',
    '',
    '',
    '',
    ''
);

CREATE TABLE IF NOT EXISTS config (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT
);

INSERT INTO config (key, value) VALUES ('GEMINI_API_KEY', 'AIzaSyAzcxFGXDOtKtJ61jEeZ6Nc0_5TvMyOpYg');
