import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import fs from 'fs';
import path from 'path';

let dbInstance: Database | null = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  const dbPath = path.join(process.cwd(), 'sid_database.sqlite');
  const schemaPath = path.join(process.cwd(), 'sid_schema.sql');
  const jsonPath = path.join(process.cwd(), 'database.json');
  
  const isNewDb = !fs.existsSync(dbPath);

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  if (isNewDb) {
    console.log('Inicializando nueva base de datos SQLite...');
    
    // Execute Schema
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await dbInstance.exec(schemaSql);
      console.log('Esquema sid_schema.sql ejecutado correctamente.');
    } else {
      console.error('No se encontró el archivo sid_schema.sql');
    }

    // Migrate data from database.json
    if (fs.existsSync(jsonPath)) {
      try {
        console.log('Migrando datos heredados desde database.json...');
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        // Migrate Users
        if (data.users && data.users.length > 0) {
          const insertUser = await dbInstance.prepare('INSERT INTO usuarios (id, username, email, password_hash, role, departamento_enum) VALUES (?, ?, ?, ?, ?, ?)');
          for (const u of data.users) {
            let dept = u.department || null;
            if (dept === 'Herramientas') dept = 'Oficina'; // Map legacy Herramientas to Oficina
            if (dept === 'Eléctrico') dept = 'Laboratorio'; // Map legacy
            await insertUser.run(u.id, u.username || u.name, u.email, u.password || '1234', u.role, dept);
          }
          await insertUser.finalize();
        }

        // Migrate Products
        if (data.products && data.products.length > 0) {
          const insertProd = await dbInstance.prepare('INSERT INTO productos (id, codigo_sku, nombre, departamento, subcategoria, precio_venta, costo_compra, stock_actual, stock_minimo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
          for (const p of data.products) {
            let dept = p.department || null;
            if (dept === 'Herramientas') dept = 'Oficina'; // Map legacy Herramientas to Oficina
            if (dept === 'Eléctrico') dept = 'Laboratorio'; // Map legacy
            await insertProd.run(p.id, p.sku, p.name, dept, p.category, p.unitPrice, p.costPrice || p.cost, p.stock, p.lowStockThreshold || 5);
          }
          await insertProd.finalize();
        }

        // Migrate Clients
        if (data.clients && data.clients.length > 0) {
          const insertClient = await dbInstance.prepare('INSERT INTO clientes (id, name, representative, company, email, phone, city, serviceType, status, lastContact, initials, ruc, address, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
          for (const c of data.clients) {
            await insertClient.run(c.id, c.name, c.representative, c.company, c.email, c.phone, c.city, c.serviceType, c.status, c.lastContact, c.initials, c.ruc, c.address, c.department);
          }
          await insertClient.finalize();
        }

        // Migrate Invoices
        if (data.invoices && data.invoices.length > 0) {
          const insertInv = await dbInstance.prepare('INSERT INTO facturas (id, invoiceNumber, clientId, clientName, clientRuc, issueDate, dueDate, subtotal, discount, taxRate, taxAmount, retenciones, total, status, type, department, sriAccessKey, sriMessage, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
          for (const i of data.invoices) {
            await insertInv.run(i.id, i.invoiceNumber, i.clientId, i.clientName, i.clientRuc, i.issueDate, i.dueDate, i.subtotal, i.discount, i.taxRate, i.taxAmount, i.retenciones, i.total, i.status, i.type, i.department, i.sriAccessKey, i.sriMessage, JSON.stringify(i.items || []));
          }
          await insertInv.finalize();
        }

        // Migrate Projects
        if (data.projects && data.projects.length > 0) {
          const insertProj = await dbInstance.prepare('INSERT INTO proyectos (id, name, clientId, department, status, startDate, endDate, budget, progress, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
          for (const pr of data.projects) {
            await insertProj.run(pr.id, pr.name, pr.clientId, pr.department, pr.status, pr.startDate, pr.endDate, pr.budget, pr.progress, pr.description);
          }
          await insertProj.finalize();
        }

        // Initialize Plan de Cuentas if empty
        const cuentasCount = await dbInstance.get('SELECT COUNT(*) as count FROM plan_cuentas');
        if (cuentasCount.count === 0) {
          const cuentas = [
            ['1', 'Activos', 'Activo', 1],
            ['1.1', 'Activos Corrientes', 'Activo', 2],
            ['1.1.1.02', 'Bancos', 'Activo', 3],
            ['1.1.2.01', 'Inventario de Mercaderías', 'Activo', 3],
            ['1.3', 'Retenciones en la Fuente por Cobrar', 'Activo', 3],
            ['1.4', 'Retenciones de IVA por Cobrar', 'Activo', 3],
            ['2', 'Pasivos', 'Pasivo', 1],
            ['2.1.1.01', 'Cuentas por Pagar', 'Pasivo', 3],
            ['2.1.2.01', 'IVA en Ventas', 'Pasivo', 3],
            ['3', 'Patrimonio', 'Patrimonio', 1],
            ['3.1.1.01', 'Capital Social', 'Patrimonio', 3],
            ['4', 'Ingresos', 'Ingreso', 1],
            ['4.1', 'Ingresos por Ventas', 'Ingreso', 2],
            ['5', 'Costos', 'Costo', 1],
            ['5.1', 'Costo de Ventas', 'Costo', 2],
            ['6', 'Gastos', 'Gasto', 1],
            ['6.1', 'Gastos Operativos', 'Gasto', 2]
          ];
          
          const insertCuenta = await dbInstance.prepare('INSERT INTO plan_cuentas (codigo_cuenta, nombre_cuenta, tipo_cuenta, nivel) VALUES (?, ?, ?, ?)');
          for (const c of cuentas) {
            await insertCuenta.run(c[0], c[1], c[2], c[3]);
          }
          await insertCuenta.finalize();
        }

        console.log('Migración completada con éxito.');
      } catch (e) {
        console.error('Error durante la migración desde database.json:', e);
      }
    }
  } else {
    // Si la DB ya existe, asegurarnos de que la tabla lotes_producto exista
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS lotes_producto (
          id VARCHAR(255) PRIMARY KEY,
          producto_id VARCHAR(255) NOT NULL,
          numero_lote VARCHAR(100) NOT NULL,
          cantidad INT NOT NULL DEFAULT 0,
          fecha_vencimiento DATE NOT NULL,
          FOREIGN KEY (producto_id) REFERENCES productos(id)
      );
    `);

    try {
      // Add missing columns if they don't exist
      await dbInstance.exec(`ALTER TABLE productos ADD COLUMN stock_minimo INT DEFAULT 0;`);
    } catch (e) { }
    try { await dbInstance.exec(`ALTER TABLE productos ADD COLUMN subcategoria VARCHAR(255);`); } catch (e) { }
    try { await dbInstance.exec(`ALTER TABLE productos ADD COLUMN costo_compra DECIMAL(10,2) DEFAULT 0;`); } catch (e) { }
    try { await dbInstance.exec(`ALTER TABLE productos ADD COLUMN stock_actual INT DEFAULT 0;`); } catch (e) { }
    try { await dbInstance.exec(`ALTER TABLE usuarios ADD COLUMN sueldo_base DECIMAL(10,2) DEFAULT 0;`); } catch (e) { }
    try {
      await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS cotizaciones (
            id VARCHAR(255) PRIMARY KEY,
            client_id VARCHAR(255),
            client_name VARCHAR(255),
            department VARCHAR(255),
            total DECIMAL(10,2),
            items_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            pdf_url TEXT
        );
      `);
    } catch (e) { console.error("Error creating cotizaciones:", e); }

    try {
      await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS proveedores (
            id VARCHAR(255) PRIMARY KEY,
            ruc VARCHAR(50) NOT NULL,
            nombre_empresa VARCHAR(255) NOT NULL,
            condiciones_pago VARCHAR(255),
            telefono VARCHAR(50),
            email VARCHAR(255),
            department VARCHAR(50)
        );
      `);
    } catch (e) { console.error("Error creating proveedores:", e); }

    try {
      await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS compras (
            id VARCHAR(255) PRIMARY KEY,
            proveedor_id VARCHAR(255) NOT NULL,
            fecha DATE NOT NULL,
            total DECIMAL(15,2) NOT NULL DEFAULT 0,
            items_json TEXT,
            estado VARCHAR(50) DEFAULT 'Completado',
            department VARCHAR(50)
        );
      `);
    } catch (e) { console.error("Error creating compras:", e); }

    try {
      await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS gastos (
            id VARCHAR(255) PRIMARY KEY,
            fecha DATE NOT NULL,
            monto DECIMAL(15,2) NOT NULL DEFAULT 0,
            codigo_cuenta VARCHAR(50) NOT NULL,
            descripcion TEXT,
            referencia_pago VARCHAR(255),
            department VARCHAR(50)
        );
      `);
    } catch (e) { console.error("Error creating gastos:", e); }
  }

  return dbInstance;
}
