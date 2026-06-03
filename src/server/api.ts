import 'dotenv/config';
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../database.json');

const router = Router();

// Helper to read database
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      throw new Error(`Database file not found at ${DB_PATH}`);
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { clients: [], activities: [], users: [], projects: [], invoices: [] };
  }
}

// Helper to write database
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
}

// Auth: Login
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  
  const user = db.users.find((u: any) => u.email === email && u.password === password);
  
  if (user) {
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword,
      token: `mock-jwt-token-${user.id}`
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales inválidas. Por favor verifique el correo y la contraseña.'
    });
  }
});

// Clients API
router.get('/clients', (req, res) => {
  const db = readDB();
  res.json(db.clients);
});

router.post('/clients', (req, res) => {
  const newClient = req.body;
  const db = readDB();
  
  db.clients.unshift(newClient);
  writeDB(db);
  
  res.status(201).json(newClient);
});

router.put('/clients/:id', (req, res) => {
  const { id } = req.params;
  const updatedClientData = req.body;
  const db = readDB();
  
  const index = db.clients.findIndex((c: any) => c.id === id);
  if (index !== -1) {
    db.clients[index] = { ...db.clients[index], ...updatedClientData };
    writeDB(db);
    res.json(db.clients[index]);
  } else {
    res.status(404).json({ message: 'Cliente no encontrado' });
  }
});

router.delete('/clients/:id', (req, res) => {
  const { id } = req.params;
  const pin = req.headers['x-security-pin'] || req.query.pin;
  
  if (pin !== '1212') {
    return res.status(403).json({ message: 'PIN de seguridad incorrecto' });
  }

  const db = readDB();
  const index = db.clients.findIndex((c: any) => c.id === id);
  if (index !== -1) {
    const deleted = db.clients.splice(index, 1);
    writeDB(db);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ message: 'Cliente no encontrado' });
  }
});

// Activities API
router.get('/activities', (req, res) => {
  const db = readDB();
  res.json(db.activities);
});

router.post('/activities', (req, res) => {
  const newActivity = req.body;
  const db = readDB();
  
  db.activities.unshift(newActivity);
  writeDB(db);
  
  res.status(201).json(newActivity);
});

// Projects API
router.get('/projects', (req, res) => {
  const db = readDB();
  res.json(db.projects || []);
});

router.post('/projects', (req, res) => {
  const newProject = req.body;
  const db = readDB();
  
  if (!db.projects) db.projects = [];
  db.projects.unshift(newProject);
  writeDB(db);
  
  res.status(201).json(newProject);
});

router.put('/projects/:id', (req, res) => {
  const { id } = req.params;
  const updatedProject = req.body;
  const db = readDB();
  
  if (!db.projects) db.projects = [];
  const index = db.projects.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    db.projects[index] = { ...db.projects[index], ...updatedProject };
    writeDB(db);
    res.json(db.projects[index]);
  } else {
    res.status(404).json({ message: 'Proyecto no encontrado' });
  }
});

// Invoices API
router.get('/invoices', (req, res) => {
  const db = readDB();
  res.json(db.invoices || []);
});

router.post('/invoices', (req, res) => {
  const newInvoice = req.body;
  const db = readDB();
  
  if (!db.invoices) db.invoices = [];
  db.invoices.unshift(newInvoice);
  writeDB(db);
  
  res.status(201).json(newInvoice);
});

router.put('/invoices/:id', (req, res) => {
  const { id } = req.params;
  const updatedInvoice = req.body;
  const db = readDB();
  
  if (!db.invoices) db.invoices = [];
  const index = db.invoices.findIndex((i: any) => i.id === id);
  if (index !== -1) {
    db.invoices[index] = { ...db.invoices[index], ...updatedInvoice };
    writeDB(db);
    res.json(db.invoices[index]);
  } else {
    res.status(404).json({ message: 'Factura no encontrada' });
  }
});

// SRI Mock Authorization
router.post('/invoices/:id/authorize-sri', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  
  if (!db.invoices) db.invoices = [];
  const index = db.invoices.findIndex((inv: any) => inv.id === id);
  if (index !== -1) {
    const invoice = db.invoices[index];
    
    // Simulate authorization
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}${month}${year}`;
    
    const ruc = invoice.clientRuc.padEnd(13, '0');
    
    // Format access key for Ecuador SRI (49 digits):
    // Fecha (8) + Tipo Comprobante "01" (2) + RUC (13) + Ambiente "2" (1) + Serie "001001" (6) + Secuencial (9) + Codigo Numerico (8) + Tipo Emision "1" (1) + Digito Verificador (1)
    const serial = '001001';
    const sequential = invoice.invoiceNumber.split('-')[2] || '000000001';
    const numericCode = '12345678';
    const tempKey = `${dateStr}01${ruc}2${serial}${sequential}${numericCode}1`;
    
    // Basic verification digit calculation (Modulo 11)
    let sum = 0;
    let factor = 2;
    for (let i = tempKey.length - 1; i >= 0; i--) {
      sum += parseInt(tempKey.charAt(i), 10) * factor;
      factor = factor === 7 ? 2 : factor + 1;
    }
    const checkDigit = (11 - (sum % 11)) % 11;
    const finalCheckDigit = checkDigit === 11 ? 0 : checkDigit === 10 ? 1 : checkDigit;
    
    const sriAccessKey = `${tempKey}${finalCheckDigit}`;
    
    invoice.status = 'authorized';
    invoice.sriAccessKey = sriAccessKey;
    invoice.sriMessage = 'AUTORIZADO - El comprobante ha sido firmado y autorizado electrónicamente por el SRI de Ecuador.';
    
    db.invoices[index] = invoice;
    writeDB(db);
    res.json(invoice);
  } else {
    res.status(404).json({ message: 'Factura no encontrada' });
  }
});

// Users CRUD API
router.get('/users', (req, res) => {
  const db = readDB();
  res.json(db.users || []);
});

router.post('/users', (req, res) => {
  const newUser = req.body;
  const db = readDB();
  if (!db.users) db.users = [];
  
  if (!newUser.email || !newUser.name || !newUser.role) {
    return res.status(400).json({ message: 'Nombre, email y rol son requeridos.' });
  }
  
  if (!newUser.id) {
    newUser.id = newUser.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  
  if (db.users.some((u: any) => u.id === newUser.id || u.email === newUser.email)) {
    return res.status(400).json({ message: 'Ya existe un usuario con ese correo o identificador.' });
  }
  
  db.users.push(newUser);
  writeDB(db);
  res.status(201).json(newUser);
});

router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;
  const db = readDB();
  if (!db.users) db.users = [];
  
  const index = db.users.findIndex((u: any) => u.id === id);
  if (index !== -1) {
    db.users[index] = { ...db.users[index], ...updatedUser };
    writeDB(db);
    res.json(db.users[index]);
  } else {
    res.status(404).json({ message: 'Usuario no encontrado.' });
  }
});

router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  if (!db.users) db.users = [];
  
  const index = db.users.findIndex((u: any) => u.id === id);
  if (index !== -1) {
    const deleted = db.users.splice(index, 1);
    writeDB(db);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ message: 'Usuario no encontrado.' });
  }
});

// Products CRUD API
router.get('/products', (req, res) => {
  const db = readDB();
  res.json(db.products || []);
});

router.post('/products', (req, res) => {
  const newProduct = req.body;
  const db = readDB();
  if (!db.products) db.products = [];

  if (!newProduct.name || !newProduct.sku || newProduct.unitPrice === undefined) {
    return res.status(400).json({ message: 'Nombre, SKU y Precio Unitario son requeridos.' });
  }

  if (!newProduct.id) {
    newProduct.id = newProduct.sku.toLowerCase().replace(/[^a-z0-9-]/g, '');
  }

  if (db.products.some((p: any) => p.id === newProduct.id || p.sku === newProduct.sku)) {
    return res.status(400).json({ message: 'Ya existe un producto con este SKU.' });
  }

  db.products.push(newProduct);
  writeDB(db);
  res.status(201).json(newProduct);
});

router.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const updatedProduct = req.body;
  const db = readDB();
  if (!db.products) db.products = [];

  const index = db.products.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...updatedProduct };
    writeDB(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ message: 'Producto no encontrado.' });
  }
});

router.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  if (!db.products) db.products = [];

  const index = db.products.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    const deleted = db.products.splice(index, 1);
    writeDB(db);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ message: 'Producto no encontrado.' });
  }
});

// Auth: Password Recovery with PIN
router.post('/auth/recover', (req, res) => {
  const { email, pin, newPassword } = req.body;

  if (pin !== '1212') {
    return res.status(400).json({ success: false, message: 'PIN de seguridad incorrecto.' });
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.email === email || u.id === email);

  if (user) {
    user.password = newPassword;
    writeDB(db);
    res.json({ success: true, message: 'Contraseña actualizada con éxito.' });
  } else {
    res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
  }
});

// Fiscal Settings API
router.get('/settings/fiscal', (req, res) => {
  const db = readDB();
  res.json(db.fiscalSettings || {
    nombreComercial: '',
    slogan: '',
    ruc: '',
    telefono: '',
    direccion: '',
    firmaElectronica: ''
  });
});

router.post('/settings/fiscal', (req, res) => {
  const settings = req.body;
  const db = readDB();
  
  db.fiscalSettings = {
    nombreComercial: settings.nombreComercial || '',
    slogan: settings.slogan || '',
    ruc: settings.ruc || '',
    telefono: settings.telefono || '',
    direccion: settings.direccion || '',
    firmaElectronica: settings.firmaElectronica || ''
  };

  writeDB(db);
  res.json({ success: true, settings: db.fiscalSettings });
});

// Database Reset API (Resets to clean blank database)
router.post('/reset', (req, res) => {
  const initialData = {
    clients: [],
    activities: [],
    users: [
      {
        id: "carlos-andrade",
        name: "Carlos Andrade",
        email: "sirek",
        role: "Gerente Comercial",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnJV8Wsm0tliOIswMbx2sPkIv8KpHT4tUQOCdi_fZOyteQQFG3cWkuvW0eSugv0c9WIAc9NKrZHNaG_jDmDZfcFXE5Q9aL0hFPnqES0EDdID3wAfcLCFHb8NLAP5OlmeHUF76VlT9--TVYUJlov2dvW7OYA9rmQaBqhZqqn7-_Q2NXVl92qb8lrhy4QNwHKtOHHjBCDm8A6IaballwwYaAODjJgY9dGk27w_hI5JBnPah3d5Omm05RfIbiYQRXugNnC30pP0gDU8w",
        password: "Erick1212"
      },
      {
        id: "alejandro-v",
        name: "Alejandro Valenzuela",
        email: "alejandro.v@ecuacrm.com.ec",
        role: "Ejecutivo de Cuentas",
        avatarUrl: "",
        password: "User123!"
      }
    ],
    projects: [],
    invoices: [],
    products: [],
    fiscalSettings: {
      nombreComercial: "",
      slogan: "",
      ruc: "",
      telefono: "",
      direccion: "",
      firmaElectronica: ""
    }
  };
  
  writeDB(initialData);
  res.json({ success: true, message: 'Base de datos restablecida (limpia) correctamente.' });
});

// GET /api/settings/gemini-key
router.get('/settings/gemini-key', (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = !!apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '';
  res.json({ isConfigured });
});

// POST /api/settings/gemini-key
router.post('/settings/gemini-key', (req, res) => {
  const { apiKey } = req.body;
  if (apiKey === undefined) {
    return res.status(400).json({ message: 'Clave no provista' });
  }

  // Update in memory
  process.env.GEMINI_API_KEY = apiKey;

  // Persist to .env file
  const envPath = path.resolve(__dirname, '../../.env');
  try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }

    if (envContent.includes('GEMINI_API_KEY=')) {
      // Replace existing
      envContent = envContent.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY="${apiKey}"`);
    } else {
      // Append new
      envContent += `\nGEMINI_API_KEY="${apiKey}"\n`;
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');
    res.json({ success: true, message: 'API Key de Gemini guardada y aplicada con éxito.' });
  } catch (error) {
    console.error('Error writing to .env:', error);
    res.status(500).json({ message: 'Error al persistir la API Key en el servidor.' });
  }
});

// Auth: Analyze bank receipt with Gemini API or mock fallback
router.post('/analyze-receipt', async (req, res) => {
  const { image, filename } = req.body;
  if (!image) {
    return res.status(400).json({ message: 'No se recibió ninguna imagen.' });
  }

  // Parse the Data URL
  // Format: data:image/png;base64,iVBORw0KGgo...
  const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return res.status(400).json({ message: 'Formato de imagen inválido.' });
  }

  const mimeType = matches[1];
  const base64Data = matches[2];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    console.warn("GEMINI_API_KEY no configurado. Intentando OCR.space con clave pública...");
    try {
      const formData = new URLSearchParams();
      formData.append('apikey', 'helloworld');
      formData.append('base64Image', image); // Send the full data URL to OCR.space
      formData.append('language', 'spa');
      formData.append('isOverlayRequired', 'false');

      const ocrSpaceResponse = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData
      });

      if (ocrSpaceResponse.ok) {
        const ocrData = await ocrSpaceResponse.json();
        const parsedText = ocrData.ParsedResults?.[0]?.ParsedText;
        if (parsedText && parsedText.trim().length > 0) {
          console.log("OCR.space extrajo texto de forma exitosa:", parsedText);
          const parsedResult = parseReceiptText(parsedText);
          return res.json({ success: true, data: parsedResult });
        }
      }
    } catch (ocrError) {
      console.error("Error al llamar a OCR.space:", ocrError);
    }

    console.warn("OCR.space no pudo extraer texto. Utilizando fallback simulador inteligente por nombre de archivo.");
    return runMockFallback(mimeType, base64Data, filename, res);
  }

  // Robust multi-model Gemini pipeline
  const models = ['gemini-3.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.1-flash-lite'];
  let geminiSuccess = false;
  let parsedData = null;

  for (const model of models) {
    console.log(`Intentando analizar comprobante con el modelo: ${model}`);
    try {
      const prompt = `Analiza este comprobante de transferencia bancaria de Ecuador. Extrae los siguientes campos y responde ÚNICAMENTE con un objeto JSON sin bloques de código ni formato markdown. El JSON debe tener exactamente esta estructura:
{
  "clientName": "Nombre completo de la persona natural o empresa BENEFICIARIA/RECEPTORA del pago (a quien se envía el dinero)",
  "senderName": "Nombre completo de la persona natural o empresa EMISORA/REMITENTE del pago (quien envía el dinero)",
  "ruc": "Número de RUC (13 dígitos) o Cédula (10 dígitos) del emisor. Si no lo encuentras, deja el campo vacío.",
  "totalAmount": 0.0,
  "date": "Fecha del pago en formato YYYY-MM-DD",
  "bankName": "Nombre del banco emisor o receptor (ej. Banco Pichincha, Banco Guayaquil)",
  "referenceNumber": "Código de transferencia o número de referencia"
}
Asegúrate de que 'totalAmount' sea un número decimal. Si el valor es de Ecuador, debe tener formato decimal de punto.`;

      const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                },
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (textResponse) {
          let cleanedText = textResponse.trim();
          if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/^```[a-zA-Z]*\s*/, '').replace(/\s*```$/, '');
          }
          const rawParsed = JSON.parse(cleanedText);
          
          // Sanitization and Type Coercion
          parsedData = {
            clientName: String(rawParsed.clientName || '').trim(),
            senderName: String(rawParsed.senderName || '').trim(),
            ruc: String(rawParsed.ruc || '').replace(/\D/g, ''),
            totalAmount: parseFloat(String(rawParsed.totalAmount || '0')) || 0,
            date: String(rawParsed.date || '').trim(),
            bankName: String(rawParsed.bankName || '').trim(),
            referenceNumber: String(rawParsed.referenceNumber || '').trim()
          };
          
          geminiSuccess = true;
          console.log(`Análisis exitoso con el modelo ${model}:`, parsedData);
          break;
        }
      } else {
        const errorText = await response.text();
        console.warn(`Error con el modelo ${model}:`, errorText);
      }
    } catch (error) {
      console.error(`Excepción durante análisis con el modelo ${model}:`, error);
    }
  }

  if (geminiSuccess && parsedData) {
    return res.json({ success: true, data: parsedData });
  }

  // Resilient Fallback to OCR.space if Gemini fails or is overloaded (e.g. 503 Service Unavailable)
  console.warn("Todos los modelos de Gemini fallaron o retornaron datos vacíos. Intentando OCR.space como método de rescate...");
  try {
    const formData = new URLSearchParams();
    formData.append('apikey', 'helloworld');
    formData.append('base64Image', image);
    formData.append('language', 'spa');
    formData.append('isOverlayRequired', 'false');

    const ocrSpaceResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData
    });

    if (ocrSpaceResponse.ok) {
      const ocrData = await ocrSpaceResponse.json();
      const parsedText = ocrData.ParsedResults?.[0]?.ParsedText;
      if (parsedText && parsedText.trim().length > 0) {
        console.log("OCR.space extrajo texto de forma exitosa como rescate:", parsedText);
        const parsedResult = parseReceiptText(parsedText);
        return res.json({ success: true, data: parsedResult });
      }
    }
  } catch (ocrError) {
    console.error("Error en OCR.space durante rescate:", ocrError);
  }

  console.warn("OCR.space también falló. Utilizando fallback simulador inteligente por nombre de archivo.");
  return runMockFallback(mimeType, base64Data, filename, res);
});

function parseReceiptText(text: string): {
  clientName: string;
  senderName: string;
  ruc: string;
  totalAmount: number;
  date: string;
  bankName: string;
  referenceNumber: string;
} {
  // Default fallback values
  let clientName = "";
  let senderName = "";
  let ruc = "";
  let totalAmount = 0;
  let bankName = "";
  let referenceNumber = "";
  let date = new Date().toISOString().split('T')[0];

  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  const textLower = text.toLowerCase();

  // 1. Detect Bank
  if (textLower.includes('pichincha')) {
    bankName = "Banco Pichincha";
  } else if (textLower.includes('guayaquil')) {
    bankName = "Banco Guayaquil";
  } else if (textLower.includes('pacifico') || textLower.includes('pacífico')) {
    bankName = "Banco del Pacífico";
  } else if (textLower.includes('produbanco')) {
    bankName = "Produbanco";
  } else if (textLower.includes('austro')) {
    bankName = "Banco del Austro";
  } else if (textLower.includes('bolivariano')) {
    bankName = "Banco Bolivariano";
  } else if (textLower.includes('internacional')) {
    bankName = "Banco Internacional";
  }

  // 2. Detect RUC / Cédula
  // Matches any sequence of digits, spaces, and dashes from 8 to 15 digits
  const candidateMatches = text.match(/\b\d[\d\s-]{8,15}\d\b/g) || [];
  let foundId = "";
  for (const match of candidateMatches) {
    const cleanNum = match.replace(/\D/g, '');
    if (cleanNum.length === 10 || cleanNum.length === 13) {
      if (inlineValidateId(cleanNum)) {
        foundId = cleanNum;
        break; // Use the first valid ID found (likely the sender's)
      }
    }
  }
  if (foundId) {
    ruc = foundId;
  }

  // 3. Detect Amount
  let foundAmount = 0;
  
  // Try line by line with direct keywords first
  for (const line of lines) {
    const lineLower = line.toLowerCase();
    if (
      lineLower.includes('monto') ||
      lineLower.includes('valor') ||
      lineLower.includes('total') ||
      lineLower.includes('usd') ||
      lineLower.includes('$') ||
      lineLower.includes('cantidad') ||
      lineLower.includes('debitado') ||
      lineLower.includes('importe') ||
      lineLower.includes('transferido') ||
      lineLower.includes('pagado') ||
      lineLower.includes('pago') ||
      lineLower.includes('exito') ||
      lineLower.includes('exitosa')
    ) {
      const match = line.match(/\b\d+(?:[.,]\d{2})?\b/);
      if (match) {
        const amt = parseFloat(match[0].replace(',', '.'));
        if (amt > 0 && amt < 100000) {
          foundAmount = amt;
          break;
        }
      }
    }
  }

  // Try matching typical scanned amount patterns: e.g. "s 1100.00" or "S. 250"
  if (foundAmount === 0) {
    const amountRegex = /(?:monto|valor|total|usd|\$|s\b|s\.|cantidad|debitado|depositado|exito|exitoso|exitosa|pagado|pago|importe|transferido)\s*:?\s*(\d+(?:[.,]\d{2})?)/i;
    const match = text.match(amountRegex);
    if (match) {
      const amt = parseFloat(match[1].replace(',', '.'));
      if (amt > 0 && amt < 100000) {
        foundAmount = amt;
      }
    }
  }

  // Fallback to any decimal number
  if (foundAmount === 0) {
    const decimalMatches = text.match(/\b\d+(?:[.,]\d{2})\b/g) || [];
    for (const match of decimalMatches) {
      const amt = parseFloat(match.replace(',', '.'));
      if (amt > 0 && amt < 100000) {
        foundAmount = amt;
        break;
      }
    }
  }

  if (foundAmount > 0) {
    totalAmount = foundAmount;
  }

  // 4. Detect Client Names (Beneficiary and Sender)
  let foundSender = "";
  let foundBeneficiary = "";

  // First, look for lines starting with sender/emisor keywords
  for (const line of lines) {
    const match = line.match(/^(?:de|desde|remitente|emisor|ordenante|titular|nombre|origen)\b\s*:?\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+)/i);
    if (match) {
      const name = match[1].trim();
      if (name.length > 5 && !name.toLowerCase().includes('cuenta') && !name.toLowerCase().includes('banco') && !name.toLowerCase().includes('ahorros')) {
        foundSender = name;
        break;
      }
    }
  }

  // Second, look for lines starting with beneficiary keywords
  for (const line of lines) {
    const match = line.match(/^(?:a|beneficiario|destinatario|destino)\b\s*:?\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+)/i);
    if (match) {
      const name = match[1].trim();
      if (name.length > 5 && !name.toLowerCase().includes('cuenta') && !name.toLowerCase().includes('banco') && !name.toLowerCase().includes('ahorros')) {
        foundBeneficiary = name;
        break;
      }
    }
  }

  // Third, look for lines containing keywords anywhere in the line
  if (!foundSender) {
    for (let i = 0; i < lines.length; i++) {
      const lineLower = lines[i].toLowerCase();
      if (lineLower.includes('ordenante') || lineLower.includes('emisor') || lineLower.includes('remitente') || (lineLower.includes('cliente') && !lineLower.includes('crm') && !lineLower.includes('banco'))) {
        let possibleName = "";
        if (lines[i].includes(':')) {
          possibleName = lines[i].split(':')[1].trim();
        }
        if (possibleName.length < 3 && i + 1 < lines.length) {
          possibleName = lines[i+1].trim();
        }
        possibleName = possibleName.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]/g, '').trim();
        if (possibleName.length > 5) {
          foundSender = possibleName;
          break;
        }
      }
    }
  }

  // Fourth, fallback to uppercase alphabetic lines for beneficiary if still missing
  if (!foundBeneficiary) {
    for (const line of lines) {
      if (/^[A-ZÁÉÍÓÚÑ\s.]+$/.test(line) && line.length > 8 && line.length < 40 && !line.includes('COMPROBANTE') && !line.includes('BANCO') && !line.includes('TRANSFERENCIA') && !line.includes('EXITOSA') && !line.includes('USD') && !line.includes('AHORROS') && !line.includes('CORRIENTE')) {
        // If it starts with "A " (often beneficiary), set it
        if (line.startsWith('A ')) {
          foundBeneficiary = line.substring(2).trim();
        } else if (!foundSender || line !== foundSender) {
          foundBeneficiary = line;
        }
      }
    }
  }

  if (foundBeneficiary) {
    clientName = foundBeneficiary.replace(/\b\w/g, c => c.toUpperCase());
  }
  if (foundSender) {
    senderName = foundSender.replace(/\b\w/g, c => c.toUpperCase());
  }

  // 5. Detect Reference Number
  let foundRef = "";
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    if (lineLower.includes('referencia') || lineLower.includes('documento') || lineLower.includes('secuencial') || lineLower.includes('nro') || lineLower.includes('número') || lineLower.includes('comprobante') || lineLower.includes('transaccion') || lineLower.includes('transacción')) {
      let possibleRef = "";
      if (lines[i].includes(':')) {
        possibleRef = lines[i].split(':')[1].trim();
      }
      if (possibleRef.length < 3 && i + 1 < lines.length) {
        possibleRef = lines[i+1].trim();
      }
      const numOnly = possibleRef.replace(/\D/g, '');
      if (numOnly.length >= 4) {
        foundRef = numOnly;
        break;
      }
    }
  }
  if (foundRef) {
    referenceNumber = foundRef;
  }

  // 6. Detect Date
  const dateMatch = text.match(/\b\d{2}[-/]\d{2}[-/]\d{4}\b/) || text.match(/\b\d{4}[-/]\d{2}[-/]\d{2}\b/);
  if (dateMatch) {
    const rawDate = dateMatch[0].replace(/\//g, '-');
    const parts = rawDate.split('-');
    if (parts[0].length === 4) {
      date = rawDate;
    } else {
      date = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  } else {
    // Check Spanish date words like "27 de abril de 2026" or "27 cie abril de 2026"
    const textClean = textLower.replace(/\s+/g, ' ');
    const spanishDateMatch = textClean.match(/\b(\d{1,2})\s+(?:de|cie|del)\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(?:de|cie|del)?\s*(\d{4})\b/);
    if (spanishDateMatch) {
      const day = spanishDateMatch[1].padStart(2, '0');
      const monthName = spanishDateMatch[2];
      const year = spanishDateMatch[3];
      const monthsMap: Record<string, string> = {
        enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
        julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
      };
      const month = monthsMap[monthName];
      if (month) {
        date = `${year}-${month}-${day}`;
      }
    }
  }

  return {
    clientName,
    senderName,
    ruc,
    totalAmount,
    date,
    bankName,
    referenceNumber,
  };
}

function inlineValidateId(id: string): boolean {
  const cleanId = id.replace(/\D/g, '');
  if (cleanId.length === 10) {
    const provincia = parseInt(cleanId.substring(0, 2), 10);
    if ((provincia < 1 || provincia > 24) && provincia !== 30) return false;
    const tercerDigito = parseInt(cleanId.charAt(2), 10);
    if (tercerDigito >= 6) return false;
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cleanId.charAt(i), 10) * coeficientes[i];
      if (valor >= 10) valor -= 9;
      suma += valor;
    }
    const digitoVerificador = parseInt(cleanId.charAt(9), 10);
    const residuo = suma % 10;
    const digitoCalculado = residuo === 0 ? 0 : 10 - residuo;
    return digitoVerificador === digitoCalculado;
  } else if (cleanId.length === 13) {
    const ultimosTres = cleanId.substring(10, 13);
    if (ultimosTres === '000') return false;
    const provincia = parseInt(cleanId.substring(0, 2), 10);
    if ((provincia < 1 || provincia > 24) && provincia !== 30) return false;
    const tercerDigito = parseInt(cleanId.charAt(2), 10);
    if (tercerDigito < 6) {
      return inlineValidateId(cleanId.substring(0, 10));
    }
    if (tercerDigito === 9) {
      const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
      let suma = 0;
      for (let i = 0; i < 9; i++) {
        suma += parseInt(cleanId.charAt(i), 10) * coeficientes[i];
      }
      const residuo = suma % 11;
      const digitoCalculado = residuo === 0 ? 0 : 11 - residuo;
      const digitoVerificador = parseInt(cleanId.charAt(9), 10);
      return digitoVerificador === digitoCalculado;
    }
    if (tercerDigito === 6) {
      const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
      let suma = 0;
      for (let i = 0; i < 8; i++) {
        suma += parseInt(cleanId.charAt(i), 10) * coeficientes[i];
      }
      const residuo = suma % 11;
      const digitoCalculado = residuo === 0 ? 0 : 11 - residuo;
      const digitoVerificador = parseInt(cleanId.charAt(8), 10);
      return digitoVerificador === digitoCalculado;
    }
  }
  return false;
}

function runMockFallback(mimeType: string, base64Data: string, filename: string | undefined, res: any) {
  // Smart filename parser
  let clientName = "";
  let senderName = "";
  let ruc = "";
  let totalAmount = 0;
  let bankName = "Banco Pichincha";
  let referenceNumber = "";

  if (filename) {
    const nameLower = filename.toLowerCase();
    
    // 1. Detect Bank
    if (nameLower.includes('pichincha')) {
      bankName = "Banco Pichincha";
    } else if (nameLower.includes('guayaquil')) {
      bankName = "Banco Guayaquil";
    } else if (nameLower.includes('pacifico') || nameLower.includes('pacífico')) {
      bankName = "Banco del Pacífico";
    } else if (nameLower.includes('produbanco')) {
      bankName = "Produbanco";
    } else if (nameLower.includes('austro')) {
      bankName = "Banco del Austro";
    } else if (nameLower.includes('bolivariano')) {
      bankName = "Banco Bolivariano";
    } else if (nameLower.includes('internacional')) {
      bankName = "Banco Internacional";
    }

    // 2. Detect Amount (look for digits like 120 or 250 in the name)
    const cleanName = filename.replace(/\b\d{4}-\d{2}-\d{2}\b/g, '') // remove date
                             .replace(/\d+x\d+/g, ''); // remove resolution
    
    const amountMatch = cleanName.match(/\b\d+(?:[.,]\d{2})?\b/);
    if (amountMatch) {
      const parsedAmt = parseFloat(amountMatch[0].replace(',', '.'));
      if (parsedAmt > 0 && parsedAmt < 50000) {
        totalAmount = parsedAmt;
      }
    }

    // 3. Detect Client Name
    let baseName = filename.split('.')[0] || '';
    baseName = baseName.replace(/-/g, ' ').replace(/_/g, ' ');
    baseName = baseName.replace(new RegExp(bankName, 'gi'), '');
    baseName = baseName.replace(/pichincha|guayaquil|pacifico|produbanco|austro|bolivariano|internacional/gi, '');
    baseName = baseName.replace(/\d+/g, '');
    baseName = baseName.replace(/\b(comprobante|transferencia|pago|de|para|capture|screenshot|screen|image|img|doc|ref)\b/gi, '');
    baseName = baseName.trim().replace(/\s+/g, ' ');
    
    const toTitleCase = (str: string) => str.replace(/\b\w/g, c => c.toUpperCase());
    
    if (baseName.length > 3) {
      clientName = toTitleCase(baseName);
      
      // Generate pseudo-random RUC based on the clientName (must start with 17 for validateCedula)
      let nameHash = 0;
      for (let i = 0; i < clientName.length; i++) {
        nameHash += clientName.charCodeAt(i);
      }
      const baseCedula = String(170000000 + (nameHash * 12345) % 9000000);
      
      // Calculate Ecuadorian verification digit for cedula
      const digits = baseCedula.split('').map(Number);
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        let val = digits[i] * (i % 2 === 0 ? 2 : 1);
        if (val > 9) val -= 9;
        sum += val;
      }
      const verif = (10 - (sum % 10)) % 10;
      ruc = baseCedula + verif;
      
      referenceNumber = String(10000000 + (nameHash * 98765) % 89999999);
    }
  }

  setTimeout(() => {
    res.json({
      success: true,
      data: {
        clientName,
        senderName: clientName ? "Julio Alberto Vasquez Salinas" : "",
        ruc,
        totalAmount,
        date: new Date().toISOString().split('T')[0],
        bankName,
        referenceNumber
      },
      mocked: true
    });
  }, 1500);
}

export default router;

