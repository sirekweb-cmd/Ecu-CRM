import 'dotenv/config';
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './db';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Auth: Login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const db = await getDb();
  
  // En ambiente real usar bcrypt.compare. Aquí es texto plano para mock.
  const user = await db.get('SELECT * FROM usuarios WHERE (LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)) AND password_hash = ?', [email, email, password]);

  if (user) {
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role,
        department: user.departamento_enum
      },
      token: 'mock-jwt-token-' + user.id
    });
  } else {
    res.status(401).json({ success: false, message: 'Credenciales inválidas' });
  }
});

// Users API
router.get('/users', async (req, res) => {
  const db = await getDb();
  const users = await db.all('SELECT id, username as name, email, role, departamento_enum as department, sueldo_base as baseSalary, estatus as status, cargo_funcional as position, horas_extras as overtime, bonos as bonuses, anticipos as advances FROM usuarios');
  res.json(users);
});

router.post('/users', async (req, res) => {
  const u = req.body;
  const db = await getDb();
  try {
    await db.run('INSERT INTO usuarios (id, username, email, password_hash, role, departamento_enum, sueldo_base, estatus, cargo_funcional, horas_extras, bonos, anticipos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [u.id, u.name, u.email, u.password || '1234', u.role, u.department, u.baseSalary || 0, u.status || 'Activo', u.position || 'Empleado', u.overtime || 0, u.bonuses || 0, u.advances || 0]);
    res.status(201).json(u);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const u = req.body;
  const db = await getDb();
  try {
    if (u.password) {
      await db.run('UPDATE usuarios SET username = ?, email = ?, password_hash = ?, role = ?, departamento_enum = ?, sueldo_base = ?, estatus = ?, cargo_funcional = ?, horas_extras = ?, bonos = ?, anticipos = ? WHERE id = ?', 
        [u.name, u.email, u.password, u.role, u.department, u.baseSalary || 0, u.status || 'Activo', u.position || 'Empleado', u.overtime || 0, u.bonuses || 0, u.advances || 0, id]);
    } else {
      await db.run('UPDATE usuarios SET username = ?, email = ?, role = ?, departamento_enum = ?, sueldo_base = ?, estatus = ?, cargo_funcional = ?, horas_extras = ?, bonos = ?, anticipos = ? WHERE id = ?', 
        [u.name, u.email, u.role, u.department, u.baseSalary || 0, u.status || 'Activo', u.position || 'Empleado', u.overtime || 0, u.bonuses || 0, u.advances || 0, id]);
    }
    res.json(u);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  const db = await getDb();
  try {
    await db.run('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Nómina API
router.post('/nomina/generar', async (req, res) => {
  const db = await getDb();
  try {
    const { logoUrl } = req.body;
    await db.run('BEGIN TRANSACTION');
    
    // Solo generar para empleados activos
    const users = await db.all('SELECT id, username, email, sueldo_base, horas_extras, bonos, anticipos, cargo_funcional FROM usuarios WHERE sueldo_base > 0 AND estatus = "Activo"');
    
    if (users.length === 0) {
      throw new Error("No hay empleados activos con sueldo configurado.");
    }

    const mesAnio = new Date().toISOString().slice(0, 7); // YYYY-MM
    // const existing = await db.get('SELECT id FROM nomina_mensual WHERE mes_anio = ?', [mesAnio]);
    // 
    // if (existing) {
    //   throw new Error(`La nómina para ${mesAnio} ya fue generada previamente.`);
    // }

    let totalIngresos = 0;
    let totalDeducciones = 0;
    let totalNeto = 0;
    let totalAportePatronal = 0;
    let totalBeneficios = 0;
    let totalIESS = 0;
    let totalAnticipos = 0;

    users.forEach(u => {
      const sueldo = u.sueldo_base || 0;
      const extras = u.horas_extras || 0;
      const bonos = u.bonos || 0;
      const anticipos = u.anticipos || 0;
      
      const ingresos = sueldo + extras + bonos;
      const iessPersonal = sueldo * 0.0945;
      const deducciones = iessPersonal + anticipos;
      const neto = ingresos - deducciones;

      const aportePatronal = sueldo * 0.1215;
      const decimoTercero = sueldo / 12;
      const decimoCuarto = 460 / 12;
      const fondosReserva = sueldo * 0.0833;
      const beneficios = decimoTercero + decimoCuarto + fondosReserva;

      totalIngresos += ingresos;
      totalDeducciones += deducciones;
      totalNeto += neto;
      totalAportePatronal += aportePatronal;
      totalBeneficios += beneficios;
      totalIESS += (iessPersonal + aportePatronal);
      totalAnticipos += anticipos;
    });

    const nominaId = 'NOM-' + Date.now();
    await db.run('INSERT INTO nomina_mensual (id, mes_anio, total_pagado, estado) VALUES (?, ?, ?, ?)',
      [nominaId, mesAnio, totalNeto, 'Pagado']);

    // Crear Asiento Contable
    const idAsiento = 'AS-NOM-' + Date.now();
    await db.run('INSERT INTO libro_diario (id_asiento, fecha, glosa, usuario_id, estado) VALUES (?, date("now"), ?, ?, ?)', 
      [idAsiento, `Pago y Provisión de Nómina - ${mesAnio}`, 'sistema', 'Aprobado']);
    
    // DEBES (Gastos)
    let detId = Date.now();
    await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)', 
      ['DET-NOM-' + (detId++), idAsiento, '6.1.01', totalIngresos, 0]); // Gasto Sueldos y Salarios
    await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)', 
      ['DET-NOM-' + (detId++), idAsiento, '6.1.02', totalAportePatronal, 0]); // Gasto Aporte Patronal
    await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)', 
      ['DET-NOM-' + (detId++), idAsiento, '6.1.03', totalBeneficios, 0]); // Gasto Beneficios Sociales

    // HABERES (Pasivos y Activos reducidos)
    await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)', 
      ['DET-NOM-' + (detId++), idAsiento, '1.1.1.02', 0, totalNeto]); // Bancos (Líquido)
    await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)', 
      ['DET-NOM-' + (detId++), idAsiento, '2.1.1.02', 0, totalIESS]); // IESS por Pagar (Personal + Patronal)
    await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)', 
      ['DET-NOM-' + (detId++), idAsiento, '2.1.1.03', 0, totalBeneficios]); // Beneficios por Pagar
    
    if (totalAnticipos > 0) {
      await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)', 
        ['DET-NOM-' + (detId++), idAsiento, '1.1.2.02', 0, totalAnticipos]); // Anticipos (Cruce)
    }

    // Encerar variables del mes
    await db.run('UPDATE usuarios SET horas_extras = 0, bonos = 0, anticipos = 0 WHERE sueldo_base > 0 AND estatus = "Activo"');

    await db.run('COMMIT');

    const JSZip = (await import('jszip')).default || await import('jszip');
    const zip = new JSZip();

    const fetchLogo = async (url: string) => {
      try {
        if (!url) return null;
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } catch (e) {
        return null;
      }
    };
    
    const logoBuffer = await fetchLogo(logoUrl);

    const createPdf = (user: any, mesAnio: string): Promise<Buffer> => {
      return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 50 });
        let buffers: any[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        if (logoBuffer) {
          try {
            doc.image(logoBuffer, 50, 40, { width: 100 });
            doc.moveDown(2);
          } catch(e) {}
        } else {
          doc.fontSize(20).text('S.I.D. EMPRESARIAL', { align: 'center' });
        }
        
        doc.moveDown(logoBuffer ? 1 : 0);
        doc.fontSize(16).text('COMPROBANTE DE ROL DE PAGO', { align: 'center' });
        doc.fontSize(10).text(`Periodo: ${mesAnio}`, { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).font('Helvetica-Bold').text('DATOS DEL EMPLEADO');
        doc.font('Helvetica').fontSize(10);
        doc.text(`Nombre: ${user.username}`);
        doc.text(`Cargo: ${user.cargo_funcional || 'Empleado'}`);
        doc.text(`Correo: ${user.email}`);
        doc.moveDown();

        const sueldo = user.sueldo_base || 0;
        const extras = user.horas_extras || 0;
        const bonos = user.bonos || 0;
        const anticipos = user.anticipos || 0;
        const ingresos = sueldo + extras + bonos;
        const iessPersonal = sueldo * 0.0945;
        const deducciones = iessPersonal + anticipos;
        const neto = ingresos - deducciones;

        const startY = doc.y;
        
        // Columna Ingresos
        doc.font('Helvetica-Bold').text('INGRESOS', 50, startY);
        doc.font('Helvetica').text(`Sueldo Base:`, 50, startY + 20);
        doc.text(`$${sueldo.toFixed(2)}`, 200, startY + 20, { width: 50, align: 'right' });
        doc.text(`Horas Extras:`, 50, startY + 35);
        doc.text(`$${extras.toFixed(2)}`, 200, startY + 35, { width: 50, align: 'right' });
        doc.text(`Bonos:`, 50, startY + 50);
        doc.text(`$${bonos.toFixed(2)}`, 200, startY + 50, { width: 50, align: 'right' });
        doc.font('Helvetica-Bold').text(`Total Ingresos:`, 50, startY + 70);
        doc.text(`$${ingresos.toFixed(2)}`, 200, startY + 70, { width: 50, align: 'right' });

        // Columna Deducciones
        doc.font('Helvetica-Bold').text('DEDUCCIONES', 300, startY);
        doc.font('Helvetica').text(`Aporte IESS (9.45%):`, 300, startY + 20);
        doc.text(`$${iessPersonal.toFixed(2)}`, 450, startY + 20, { width: 50, align: 'right' });
        doc.text(`Anticipos:`, 300, startY + 35);
        doc.text(`$${anticipos.toFixed(2)}`, 450, startY + 35, { width: 50, align: 'right' });
        doc.font('Helvetica-Bold').text(`Total Deducciones:`, 300, startY + 70);
        doc.text(`$${deducciones.toFixed(2)}`, 450, startY + 70, { width: 50, align: 'right' });

        doc.moveDown(6);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
        
        doc.fontSize(14).font('Helvetica-Bold').text(`NETO A RECIBIR: $${neto.toFixed(2)}`, { align: 'right' });
        
        doc.moveDown(4);
        const signY = doc.y;
        doc.moveTo(100, signY).lineTo(250, signY).stroke();
        doc.moveTo(350, signY).lineTo(500, signY).stroke();
        doc.fontSize(10).font('Helvetica');
        doc.text('Firma Empleador', 130, signY + 5);
        doc.text('Firma Empleado', 380, signY + 5);

        // Aportes y beneficios note
        doc.moveDown(4);
        doc.fontSize(8).fillColor('gray').text(`Nota: La empresa ha provisionado adicionalmente $${(sueldo * 0.1215).toFixed(2)} por Aporte Patronal y $${(sueldo/12 + 460/12 + sueldo*0.0833).toFixed(2)} por Beneficios Sociales correspondientes a este periodo. Las variables mensuales (horas extras, bonos, anticipos) han sido enceradas para el próximo ciclo.`, { align: 'justify' });

        doc.end();
      });
    };

    for (const user of users) {
      const pdfBuffer = await createPdf(user, mesAnio);
      zip.file(`Rol_Pago_${user.username.replace(/[^a-zA-Z0-9]/g, '_')}_${mesAnio}.pdf`, pdfBuffer);
    }

    let emailsSent = 0;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      
      for (const user of users) {
        if (!user.email || !user.email.includes('@')) continue;
        const pdfBuffer = await createPdf(user, mesAnio);
        try {
          await transporter.sendMail({
            from: `"S.I.D-CRM Recursos Humanos" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: `Tu Rol de Pago - ${mesAnio}`,
            text: `Estimado/a ${user.username},\n\nAdjunto encontrarás tu rol de pago en formato PDF correspondiente al periodo de ${mesAnio}.\n\nCualquier novedad, no dudes en consultarnos.\n\nAtentamente,\nRecursos Humanos`,
            attachments: [
              {
                filename: `Rol_Pago_${mesAnio}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
              }
            ]
          });
          emailsSent++;
        } catch(e) {
          console.error("No se pudo enviar correo a " + user.email, e);
        }
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="Roles_Pago_${mesAnio}.zip"`);
    res.setHeader('X-Emails-Sent', emailsSent.toString());
    res.send(zipBuffer);

  } catch (err: any) {
    try { await db.run('ROLLBACK'); } catch (e) {}
    res.status(400).json({ error: err.message });
  }
});

// Clients API
router.get('/clients', async (req, res) => {
  const db = await getDb();
  const clients = await db.all('SELECT * FROM clientes');
  res.json(clients);
});

router.post('/clients', async (req, res) => {
  const c = req.body;
  const db = await getDb();
  await db.run('INSERT INTO clientes (id, name, representative, company, email, phone, city, serviceType, status, lastContact, initials, ruc, address, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
    [c.id, c.name, c.representative, c.company, c.email, c.phone, c.city, c.serviceType, c.status, c.lastContact, c.initials, c.ruc, c.address, c.department]);
  res.status(201).json(c);
});

router.put('/clients/:id', async (req, res) => {
  const { id } = req.params;
  const c = req.body;
  const db = await getDb();
  await db.run(
    'UPDATE clientes SET name = ?, representative = ?, company = ?, email = ?, phone = ?, city = ?, serviceType = ?, status = ?, lastContact = ?, initials = ?, ruc = ?, address = ?, department = ? WHERE id = ?',
    [c.name, c.representative, c.company, c.email, c.phone, c.city, c.serviceType, c.status, c.lastContact, c.initials, c.ruc, c.address, c.department, id]
  );
  res.json({ id, ...c });
});

router.delete('/clients/:id', async (req, res) => {
  const { id } = req.params;
  const db = await getDb();
  await db.run('DELETE FROM clientes WHERE id = ?', [id]);
  res.json({ id });
});

// Invoices API
router.get('/invoices', async (req, res) => {
  const db = await getDb();
  const invoices = await db.all('SELECT * FROM facturas');
  const formatted = invoices.map(i => ({
    ...i,
    items: JSON.parse(i.items_json || '[]')
  }));
  res.json(formatted);
});

router.post('/invoices', async (req, res) => {
  const i = req.body;
  const db = await getDb();
  try {
    await db.run('BEGIN TRANSACTION');

    await db.run('INSERT INTO facturas (id, invoiceNumber, clientId, clientName, clientRuc, issueDate, dueDate, subtotal, discount, taxRate, taxAmount, retenciones, total, status, type, department, sriAccessKey, sriMessage, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [i.id || `quote-${Date.now()}`, i.invoiceNumber || `REQ-${Date.now()}`, i.clientId || 'public-portal', i.clientName, i.clientRuc || '9999999999999', i.issueDate || new Date().toISOString().split('T')[0], i.dueDate || new Date().toISOString().split('T')[0], i.subtotal, i.discount || 0, i.taxRate, i.taxAmount, i.retenciones || 0, i.total, i.status || 'draft', i.type || 'quote', i.department, i.sriAccessKey, i.sriMessage, JSON.stringify(i.items || [])]);

    if (i.type === 'invoice') {
      // Process items: decrement stock and calculate total cost
      let totalCost = 0;
      const items = i.items || [];
      for (const item of items) {
        if (item.id) {
          const product = await db.get('SELECT costo_compra FROM productos WHERE id = ?', [item.id]);
          const unitCost = product ? parseFloat(product.costo_compra || 0) : 0;
          totalCost += unitCost * item.quantity;
          
          await db.run('UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?', [item.quantity, item.id]);
        }
      }

      // 1. Asiento Comercial (Bancos vs Ingresos por Ventas)
      const idAsientoComercial = `AS-VTA-${Date.now()}-1`;
      const issueDate = i.issueDate || new Date().toISOString().split('T')[0];
      await db.run('INSERT INTO libro_diario (id_asiento, fecha, glosa, usuario_id, estado) VALUES (?, ?, ?, ?, ?)', 
        [idAsientoComercial, issueDate, `Venta s/Factura ${i.invoiceNumber} - ${i.clientName}`, i.userId || 'Sistema', 'Aprobado']);
      
      await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)', 
        [`DET-VTA1-${Date.now()}`, idAsientoComercial, '1.1.1.02', i.total, 0]); // Bancos
      
      await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)', 
        [`DET-VTA2-${Date.now()}`, idAsientoComercial, '4.1', 0, i.total]); // Ingresos

      // 2. Asiento Costo de Ventas
      if (totalCost > 0) {
        const idAsientoCosto = `AS-VTA-${Date.now()}-2`;
        await db.run('INSERT INTO libro_diario (id_asiento, fecha, glosa, usuario_id, estado) VALUES (?, ?, ?, ?, ?)', 
          [idAsientoCosto, issueDate, `Costo de Ventas s/Factura ${i.invoiceNumber}`, i.userId || 'Sistema', 'Aprobado']);
        
        await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)', 
          [`DET-CST1-${Date.now()}`, idAsientoCosto, '5.1', totalCost, 0]); // Costo de Ventas
        
        await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)', 
          [`DET-CST2-${Date.now()}`, idAsientoCosto, '1.1.2.01', 0, totalCost]); // Inventario
      }
    }

    await db.run('COMMIT');
    res.status(201).json(i);
  } catch (err: any) {
    try { await db.run('ROLLBACK'); } catch(e) {}
    res.status(400).json({ error: err.message });
  }
});

// Products API
router.get('/products', async (req, res) => {
  const db = await getDb();
  const products = await db.all('SELECT id, codigo_sku as sku, nombre as name, departamento as department, subcategoria as category, precio_venta as unitPrice, costo_compra as costPrice, stock_actual as stock, stock_minimo as lowStockThreshold, es_publico as isPublic, proveedor_id as providerId FROM productos');
  // convert 1/0 to boolean
  const formatted = products.map(p => ({ ...p, isPublic: p.isPublic === 1 }));
  res.json(formatted);
});

router.post('/products', async (req, res) => {
  const p = req.body;
  const db = await getDb();
  const id = p.id || 'prod-' + Date.now();
  try {
    await db.run('BEGIN TRANSACTION');
    
    await db.run('INSERT INTO productos (id, codigo_sku, nombre, departamento, subcategoria, precio_venta, costo_compra, stock_actual, stock_minimo, es_publico, proveedor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, p.sku, p.name, p.department, p.category, p.unitPrice, p.costPrice || 0, p.stock || 0, p.lowStockThreshold || 0, p.isPublic ? 1 : 0, p.providerId || null]);

    const initialStock = parseFloat(p.stock) || 0;
    const cost = parseFloat(p.costPrice) || 0;
    const totalValue = initialStock * cost;

    if (totalValue > 0) {
      const idAsiento = 'AS-APERTURA-' + Date.now();
      await db.run('INSERT INTO libro_diario (id_asiento, fecha, glosa, usuario_id, estado) VALUES (?, date("now"), ?, ?, ?)', 
        [idAsiento, `Asiento de Apertura - Inventario Inicial (${p.sku})`, 'sistema', 'Aprobado']);
      
      const idDet1 = 'DET-' + Date.now() + '1';
      await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)', 
        [idDet1, idAsiento, '1.1.2.01', totalValue, 0]); // Inventario de Mercaderías

      const idDet2 = 'DET-' + Date.now() + '2';
      await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)', 
        [idDet2, idAsiento, '3.1.1.01', 0, totalValue]); // Capital Social (como contrapartida de apertura)
    }

    await db.run('COMMIT');
    res.status(201).json({ ...p, id });
  } catch (err: any) {
    try { await db.run('ROLLBACK'); } catch (e) {}
    res.status(400).json({ error: err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const p = req.body;
  const db = await getDb();
  try {
    await db.run('UPDATE productos SET codigo_sku = ?, nombre = ?, departamento = ?, subcategoria = ?, precio_venta = ?, costo_compra = ?, stock_minimo = ?, es_publico = ?, proveedor_id = ? WHERE id = ?',
      [p.sku, p.name, p.department, p.category, p.unitPrice, p.costPrice || 0, p.lowStockThreshold || 0, p.isPublic ? 1 : 0, p.providerId || null, id]);
    res.json({ ...p, id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  const db = await getDb();
  try {
    await db.run('DELETE FROM lotes_producto WHERE producto_id = ?', [id]);
    await db.run('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Product Lots API
router.get('/products/:id/lots', async (req, res) => {
  const { id } = req.params;
  const db = await getDb();
  const lots = await db.all('SELECT id, producto_id as productId, numero_lote as lotNumber, cantidad as quantity, fecha_vencimiento as expirationDate FROM lotes_producto WHERE producto_id = ? ORDER BY fecha_vencimiento ASC', [id]);
  res.json(lots);
});

router.post('/products/:id/lots', async (req, res) => {
  const { id } = req.params;
  const lot = req.body;
  const db = await getDb();
  const lotId = 'lot-' + Date.now();
  try {
    await db.run('BEGIN TRANSACTION');
    await db.run('INSERT INTO lotes_producto (id, producto_id, numero_lote, cantidad, fecha_vencimiento) VALUES (?, ?, ?, ?, ?)',
      [lotId, id, lot.lotNumber, lot.quantity, lot.expirationDate]);
    // Actualizar stock total
    await db.run('UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?', [lot.quantity, id]);
    await db.run('COMMIT');
    res.status(201).json({ ...lot, id: lotId, productId: id });
  } catch (err: any) {
    try { await db.run('ROLLBACK'); } catch (e) {}
    res.status(400).json({ error: err.message });
  }
});

// Inventory Alerts
router.get('/alerts/inventory', async (req, res) => {
  const db = await getDb();
  
  // Productos bajo stock mínimo
  const lowStock = await db.all(`
    SELECT id, codigo_sku as sku, nombre as name, stock_actual as stock, stock_minimo as threshold, departamento as department
    FROM productos 
    WHERE stock_actual <= stock_minimo AND stock_minimo > 0
  `);

  // Lotes próximos a caducar (en los próximos 30 días) o ya caducados
  const expiringLots = await db.all(`
    SELECT l.id, p.nombre as productName, p.departamento as department, l.numero_lote as lotNumber, l.cantidad as quantity, l.fecha_vencimiento as expirationDate
    FROM lotes_producto l
    JOIN productos p ON l.producto_id = p.id
    WHERE l.cantidad > 0 AND l.fecha_vencimiento <= date('now', '+30 days')
    ORDER BY l.fecha_vencimiento ASC
  `);

  res.json({ lowStock, expiringLots });
});

// Asientos API (Accounting Core)
router.get('/data/asientos', async (req, res) => {
  const db = await getDb();
  // Fetch details joining with header for date and glosa
  const detalles = await db.all(`
    SELECT d.id_detalle, d.id_asiento, d.codigo_cuenta, p.nombre as nombre_cuenta, d.debe, d.haber, a.fecha, a.glosa 
    FROM asiento_detalles d
    JOIN libro_diario a ON d.id_asiento = a.id_asiento
    JOIN plan_cuentas p ON d.codigo_cuenta = p.codigo_pk
  `);

  // Dynamically calculate actual inventory value to always sync with catalog edits
  const catalog = await db.all('SELECT stock_actual, costo_compra FROM productos');
  let realInventoryValue = catalog.reduce((acc, p) => acc + ((p.stock_actual || 0) * (p.costo_compra || 0)), 0);

  // Remove any static Apertura entries for inventory to avoid double counting
  const filteredDetalles = detalles.filter(d => !(d.codigo_cuenta === '1.1.2.01' && d.glosa.includes('Apertura')));

  if (realInventoryValue > 0) {
    filteredDetalles.push({
      id_detalle: 'DET-SYNC-INV',
      id_asiento: 'AS-SYNC',
      codigo_cuenta: '1.1.2.01',
      nombre_cuenta: 'Inventario de Mercaderías',
      debe: realInventoryValue,
      haber: 0,
      fecha: new Date().toISOString().split('T')[0],
      glosa: 'Asiento de Sincronización Automática de Inventario'
    });
    filteredDetalles.push({
      id_detalle: 'DET-SYNC-CAP',
      id_asiento: 'AS-SYNC',
      codigo_cuenta: '3.1.1.01',
      nombre_cuenta: 'Capital Social',
      debe: 0,
      haber: realInventoryValue,
      fecha: new Date().toISOString().split('T')[0],
      glosa: 'Asiento de Sincronización Automática de Inventario'
    });
  }

  res.json(filteredDetalles);
});

router.post('/data/asientos', async (req, res) => {
  const { asientoVenta, asientoCosto } = req.body;
  const db = await getDb();
  
  try {
    await db.run('BEGIN TRANSACTION');

    const saveAsiento = async (asiento: any) => {
      const idAsiento = 'AS-' + Date.now() + Math.floor(Math.random() * 1000);
      await db.run('INSERT INTO libro_diario (id_asiento, fecha, glosa, usuario_id, estado) VALUES (?, ?, ?, ?, ?)', [idAsiento, asiento.fecha, asiento.glosa, asiento.usuario_id || null, asiento.estado]);
      
      for (const d of asiento.detalles) {
        const idDetalle = 'DET-' + Date.now() + Math.floor(Math.random() * 1000);
        await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)', [idDetalle, idAsiento, d.codigo_cuenta, d.debe, d.haber]);
      }
    };

    if (asientoVenta) await saveAsiento(asientoVenta);
    if (asientoCosto) await saveAsiento(asientoCosto);

    await db.run('COMMIT');
    res.json({ success: true });
  } catch (err: any) {
    try { await db.run('ROLLBACK'); } catch (e) {}
    res.status(500).json({ error: err.message });
  }
});

// Projects API
router.get('/projects', async (req, res) => {
  const db = await getDb();
  const projects = await db.all('SELECT * FROM proyectos');
  res.json(projects);
});

router.post('/projects', async (req, res) => {
  const p = req.body;
  const db = await getDb();
  const id = 'proj-' + Date.now();
  await db.run('INSERT INTO proyectos (id, name, clientId, department, status, startDate, endDate, budget, progress, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
    [id, p.name, p.clientId, p.department, p.status, p.startDate, p.endDate, p.budget || 0, p.progress || 0, p.description || '']);
  res.status(201).json({ ...p, id });
});

router.put('/projects/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = await getDb();
  await db.run('UPDATE proyectos SET status = ? WHERE id = ?', [status, id]);
  res.json({ success: true });
});

// Cotizaciones API
router.get('/cotizaciones', async (req, res) => {
  const db = await getDb();
  try {
    const { department } = req.query;
    let query = 'SELECT * FROM cotizaciones ORDER BY created_at DESC';
    let params: any[] = [];
    if (department && department !== 'Todos') {
      query = 'SELECT * FROM cotizaciones WHERE department = ? ORDER BY created_at DESC';
      params.push(department);
    }
    const cots = await db.all(query, params);
    res.json(cots.map(c => ({...c, items: JSON.parse(c.items_json)})));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/cotizaciones', async (req, res) => {
  const db = await getDb();
  const c = req.body;
  try {
    const id = 'COT-' + Date.now();
    await db.run(
      'INSERT INTO cotizaciones (id, client_id, client_name, department, total, items_json) VALUES (?, ?, ?, ?, ?, ?)',
      [id, c.clientId || 'N/A', c.clientName || 'Consumidor Final', c.department || 'General', c.total || 0, JSON.stringify(c.items || [])]
    );
    res.json({ id, success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- PROVEEDORES ---
router.get('/providers', async (req, res) => {
  const db = await getDb();
  const providers = await db.all('SELECT * FROM proveedores');
  res.json(providers);
});
router.post('/providers', async (req, res) => {
  const db = await getDb();
  const p = req.body;
  const id = `PROV-${Date.now()}`;
  try {
    await db.run('INSERT INTO proveedores (id, ruc, nombre_empresa, condiciones_pago, telefono, email, department, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, p.ruc, p.nombre_empresa, p.condiciones_pago || '', p.telefono || '', p.email || '', p.department || 'General', p.logo_url || '']);
    res.json({ id, ...p });
  } catch(e:any) { res.status(400).json({error: e.message}) }
});
router.put('/providers/:id', async (req, res) => {
  const { id } = req.params;
  const p = req.body;
  const db = await getDb();
  try {
    await db.run('UPDATE proveedores SET ruc = ?, nombre_empresa = ?, condiciones_pago = ?, telefono = ?, email = ?, department = ?, logo_url = ? WHERE id = ?',
      [p.ruc, p.nombre_empresa, p.condiciones_pago, p.telefono, p.email, p.department, p.logo_url || '', id]);
    res.json({ ...p, id });
  } catch(e:any) { res.status(400).json({error: e.message}) }
});
router.delete('/providers/:id', async (req, res) => {
  const { id } = req.params;
  const db = await getDb();
  try {
    await db.run('DELETE FROM proveedores WHERE id = ?', [id]);
    res.json({ success: true });
  } catch(e:any) { res.status(400).json({error: e.message}) }
});

// --- COMPRAS ---
router.get('/purchases', async (req, res) => {
  const db = await getDb();
  const purchases = await db.all('SELECT * FROM compras ORDER BY fecha DESC');
  res.json(purchases);
});
router.post('/purchases', async (req, res) => {
  const db = await getDb();
  const { proveedor_id, fecha, total, items, department, userId } = req.body;
  const id = `COMP-${Date.now()}`;
  try {
    await db.run('BEGIN TRANSACTION');
    
    await db.run('INSERT INTO compras (id, proveedor_id, fecha, total, items_json, estado, department) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, proveedor_id, fecha, total, JSON.stringify(items), 'Completado', department || 'General']);

    // Update inventory
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await db.run('UPDATE productos SET stock_actual = stock_actual + ?, costo_compra = ? WHERE id = ?',
          [item.quantity, item.unitPrice, item.productId]);
      }
    }

    // Accounting Entry
    const idAsiento = `AST-${Date.now()}-COMP`;
    await db.run('INSERT INTO libro_diario (id_asiento, fecha, glosa, usuario_id) VALUES (?, ?, ?, ?)',
      [idAsiento, fecha, `Compra de Inventario #${id}`, userId || 'Sistema']);
      
    await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)',
      [`DET-${Date.now()}-1`, idAsiento, '1.1.2.01', total, 0]);
      
    await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)',
      [`DET-${Date.now()}-2`, idAsiento, '1.1.1.02', 0, total]);

    await db.run('COMMIT');
    res.json({ success: true, id });
  } catch(e:any) {
    await db.run('ROLLBACK');
    res.status(400).json({error: e.message});
  }
});

// --- GASTOS ---
router.get('/expenses', async (req, res) => {
  const db = await getDb();
  const expenses = await db.all('SELECT * FROM gastos ORDER BY fecha DESC');
  res.json(expenses);
});
router.post('/expenses', async (req, res) => {
  const db = await getDb();
  const { fecha, monto, codigo_cuenta, descripcion, referencia_pago, department, userId } = req.body;
  const id = `GAST-${Date.now()}`;
  try {
    await db.run('BEGIN TRANSACTION');
    
    await db.run('INSERT INTO gastos (id, fecha, monto, codigo_cuenta, descripcion, referencia_pago, department) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, fecha, monto, codigo_cuenta, descripcion || '', referencia_pago || '', department || 'General']);

    // Accounting Entry
    const idAsiento = `AST-${Date.now()}-GAST`;
    await db.run('INSERT INTO libro_diario (id_asiento, fecha, glosa, usuario_id) VALUES (?, ?, ?, ?)',
      [idAsiento, fecha, `Gasto: ${descripcion}`, userId || 'Sistema']);
      
    await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)',
      [`DET-${Date.now()}-1`, idAsiento, codigo_cuenta, monto, 0]);
      
    await db.run('INSERT INTO asiento_detalles (id_detalle, id_asiento, codigo_cuenta, debe, haber) VALUES (?, ?, ?, ?, ?)',
      [`DET-${Date.now()}-2`, idAsiento, '1.1.1.02', 0, monto]);

    await db.run('COMMIT');
    res.json({ success: true, id });
  } catch(e:any) {
    await db.run('ROLLBACK');
    res.status(400).json({error: e.message});
  }
});

export default router;
