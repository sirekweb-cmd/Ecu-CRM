const fs = require('fs');

const dbPath = 'database.json';
let db = { users: [], products: [], invoices: [], fiscalSettings: {} };

try {
  const content = fs.readFileSync(dbPath, 'utf8');
  if (content.trim()) {
    db = JSON.parse(content);
  }
} catch (e) {
  console.log('No existing DB, starting fresh.');
}

// 1. Inject Users if missing Super Admin
const superAdminExists = db.users.some(u => u.role === 'Super Admin');
if (!superAdminExists) {
  db.users.push({
    id: 'super-admin-1',
    name: 'Super Administrador',
    email: 'admin@sidcrm.com.ec',
    password: 'admin',
    role: 'Super Admin',
    avatarUrl: ''
  });
}

const depts = ['Bazar', 'Ferretería', 'Tecnología'];
depts.forEach(dept => {
  const adminExists = db.users.some(u => u.department === dept && u.role === 'Administrador');
  if (!adminExists) {
    db.users.push({
      id: `admin-${dept.toLowerCase()}`,
      name: `Admin ${dept}`,
      email: `admin.${dept.toLowerCase()}@sidcrm.com.ec`,
      password: 'admin',
      role: 'Administrador',
      department: dept,
      avatarUrl: ''
    });
  }
});

// 2. Inject Products if empty
if (!db.products || db.products.length === 0) {
  const mockProducts = [
    {
      id: 'p-b001', name: 'Libreta Universitaria Espiral', sku: 'b001', description: 'Libreta de 100 hojas a cuadros.',
      department: 'Bazar', category: 'Papelería', costPrice: 1.20, unitPrice: 2.50, discount: 0,
      stock: 10, lowStockThreshold: 5, weight: 0.2, dimensions: '20x25x1 cm',
      imageUrl: 'https://via.placeholder.com/150/ffb6c1/000000?text=Libreta'
    },
    {
      id: 'p-b002', name: 'Set de Esferos Azules', sku: 'b002', description: 'Caja de 12 esferos tinta azul.',
      department: 'Bazar', category: 'Escritura', costPrice: 2.00, unitPrice: 3.50, discount: 0,
      stock: 10, lowStockThreshold: 5, weight: 0.1, dimensions: '15x5x2 cm',
      imageUrl: 'https://via.placeholder.com/150/ffb6c1/000000?text=Esferos'
    },
    {
      id: 'p-b003', name: 'Carpeta Archivadora', sku: 'b003', description: 'Carpeta plástica tamaño oficio.',
      department: 'Bazar', category: 'Organización', costPrice: 0.80, unitPrice: 1.50, discount: 0,
      stock: 10, lowStockThreshold: 5, weight: 0.3, dimensions: '35x25x0.5 cm',
      imageUrl: 'https://via.placeholder.com/150/ffb6c1/000000?text=Carpeta'
    },
    {
      id: 'p-f001', name: 'Martillo de Acero', sku: 'f001', description: 'Martillo con mango de goma.',
      department: 'Ferretería', category: 'Herramientas', costPrice: 5.50, unitPrice: 12.00, discount: 0,
      stock: 10, lowStockThreshold: 5, weight: 1.5, dimensions: '30x15x5 cm',
      imageUrl: 'https://via.placeholder.com/150/ffd700/000000?text=Martillo'
    },
    {
      id: 'p-f002', name: 'Taladro Percutor 500W', sku: 'f002', description: 'Taladro eléctrico industrial.',
      department: 'Ferretería', category: 'Eléctricas', costPrice: 25.00, unitPrice: 45.00, discount: 0,
      stock: 10, lowStockThreshold: 5, weight: 3.0, dimensions: '25x20x8 cm',
      imageUrl: 'https://via.placeholder.com/150/ffd700/000000?text=Taladro'
    },
    {
      id: 'p-f003', name: 'Caja de Clavos 2"', sku: 'f003', description: 'Clavos de acero galvanizado (1kg).',
      department: 'Ferretería', category: 'Insumos', costPrice: 2.00, unitPrice: 4.00, discount: 0,
      stock: 10, lowStockThreshold: 5, weight: 1.0, dimensions: '10x10x10 cm',
      imageUrl: 'https://via.placeholder.com/150/ffd700/000000?text=Clavos'
    },
    {
      id: 'p-t001', name: 'Monitor 24" Full HD', sku: 't001', description: 'Monitor IPS 75Hz para oficina.',
      department: 'Tecnología', category: 'Monitores', costPrice: 90.00, unitPrice: 140.00, discount: 0,
      stock: 10, lowStockThreshold: 5, weight: 4.5, dimensions: '55x40x15 cm',
      imageUrl: 'https://via.placeholder.com/150/87cefa/000000?text=Monitor'
    },
    {
      id: 'p-t002', name: 'Teclado Mecánico', sku: 't002', description: 'Teclado RGB switches azules.',
      department: 'Tecnología', category: 'Periféricos', costPrice: 20.00, unitPrice: 45.00, discount: 0,
      stock: 10, lowStockThreshold: 5, weight: 1.2, dimensions: '45x15x4 cm',
      imageUrl: 'https://via.placeholder.com/150/87cefa/000000?text=Teclado'
    },
    {
      id: 'p-t003', name: 'Mouse Inalámbrico', sku: 't003', description: 'Mouse ergonómico 2.4GHz.',
      department: 'Tecnología', category: 'Periféricos', costPrice: 8.00, unitPrice: 18.00, discount: 0,
      stock: 10, lowStockThreshold: 5, weight: 0.2, dimensions: '10x6x4 cm',
      imageUrl: 'https://via.placeholder.com/150/87cefa/000000?text=Mouse'
    }
  ];
  db.products = mockProducts;
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Database seeded successfully.');
