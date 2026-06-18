-- sid_schema.sql
-- S.I.D. (Sistema de Innovación Digital) - ERP & CRM
-- Compatible con PostgreSQL / MySQL

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    departamento_enum VARCHAR(50) CHECK (departamento_enum IN ('Ferretería', 'Oficina', 'Florería', 'Laboratorio', 'Todos'))
);

-- 2. Tabla de Productos
CREATE TABLE IF NOT EXISTS productos (
    id VARCHAR(255) PRIMARY KEY,
    codigo_sku VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    departamento VARCHAR(50) CHECK (departamento IN ('Ferretería', 'Oficina', 'Florería', 'Laboratorio')),
    subcategoria VARCHAR(255),
    precio_venta DECIMAL(10, 2) NOT NULL,
    costo_compra DECIMAL(10, 2) NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 0,
    numero_lote VARCHAR(100),
    fecha_vencimiento DATE,
    es_publico INTEGER DEFAULT 0,
    proveedor_id VARCHAR(255)
);

-- 2.1 Tabla de Lotes de Producto (Control de Caducidad)
CREATE TABLE IF NOT EXISTS lotes_producto (
    id VARCHAR(255) PRIMARY KEY,
    producto_id VARCHAR(255) NOT NULL,
    numero_lote VARCHAR(100) NOT NULL,
    cantidad INT NOT NULL DEFAULT 0,
    fecha_vencimiento DATE NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- 3. Plan de Cuentas Contables
CREATE TABLE IF NOT EXISTS plan_cuentas (
    codigo_pk VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('Activo', 'Pasivo', 'Patrimonio', 'Ingreso', 'Costo', 'Gasto')),
    nivel INT NOT NULL DEFAULT 1
);

-- 4. Libro Diario (Asientos Contables - Cabecera)
CREATE TABLE IF NOT EXISTS libro_diario (
    id_asiento VARCHAR(255) PRIMARY KEY,
    fecha DATETIME NOT NULL,
    glosa TEXT NOT NULL,
    usuario_id VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'Activo'
);

-- 5. Detalles de Asiento (Partida Doble)
CREATE TABLE IF NOT EXISTS asiento_detalles (
    id_detalle VARCHAR(255) PRIMARY KEY,
    id_asiento VARCHAR(255) NOT NULL,
    codigo_cuenta VARCHAR(50) NOT NULL,
    debe DECIMAL(15, 2) NOT NULL DEFAULT 0,
    haber DECIMAL(15, 2) NOT NULL DEFAULT 0,
    FOREIGN KEY (id_asiento) REFERENCES libro_diario(id_asiento),
    FOREIGN KEY (codigo_cuenta) REFERENCES plan_cuentas(codigo_pk),
    -- Validación Estricta de Partida Doble: Un apunte no puede tener debe y haber al mismo tiempo
    CHECK ((debe > 0 AND haber = 0) OR (haber > 0 AND debe = 0) OR (debe = 0 AND haber = 0))
);

-- 6. Tabla de Cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
    id VARCHAR(255) PRIMARY KEY,
    cliente_id VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    validez VARCHAR(100),
    condiciones_pago VARCHAR(255),
    notas TEXT,
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
    porcentaje_iva NUMERIC(5,2) NOT NULL DEFAULT 15.00,
    valor_iva DECIMAL(15, 2) NOT NULL DEFAULT 0,
    porcentaje_ret_fuente NUMERIC(5,2) NOT NULL DEFAULT 0,
    valor_ret_fuente DECIMAL(15, 2) NOT NULL DEFAULT 0,
    porcentaje_ret_iva NUMERIC(5,2) NOT NULL DEFAULT 0,
    valor_ret_iva DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_neto DECIMAL(15, 2) NOT NULL DEFAULT 0,
    estado VARCHAR(50) DEFAULT 'Borrador'
);

-- 7. Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    representative VARCHAR(255),
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    city VARCHAR(100),
    serviceType VARCHAR(255),
    status VARCHAR(50),
    lastContact VARCHAR(255),
    initials VARCHAR(10),
    ruc VARCHAR(50),
    address TEXT,
    department VARCHAR(50)
);

-- 8. Tabla de Proyectos
CREATE TABLE IF NOT EXISTS proyectos (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    clientId VARCHAR(255) NOT NULL,
    department VARCHAR(50),
    status VARCHAR(50) DEFAULT 'En Planificación',
    startDate VARCHAR(50),
    endDate VARCHAR(50),
    budget DECIMAL(15,2) DEFAULT 0,
    progress INT DEFAULT 0,
    description TEXT
);

-- 9. Tabla de Facturas
CREATE TABLE IF NOT EXISTS facturas (
    id VARCHAR(255) PRIMARY KEY,
    invoiceNumber VARCHAR(100),
    clientId VARCHAR(255) NOT NULL,
    clientName VARCHAR(255),
    clientRuc VARCHAR(50),
    issueDate VARCHAR(50),
    dueDate VARCHAR(50),
    subtotal DECIMAL(15,2),
    discount DECIMAL(15,2),
    taxRate DECIMAL(5,2),
    taxAmount DECIMAL(15,2),
    retenciones DECIMAL(15,2),
    total DECIMAL(15,2),
    status VARCHAR(50),
    type VARCHAR(50),
    department VARCHAR(50),
    sriAccessKey VARCHAR(255),
    sriMessage TEXT,
    items_json TEXT
);

-- Datos Iniciales (Ejemplo de Plan de Cuentas Básico)
INSERT INTO plan_cuentas (codigo_pk, nombre, tipo, nivel) VALUES
('1', 'Activos', 'Activo', 1),
('1.1', 'Caja y Bancos', 'Activo', 2),
('1.2', 'Inventarios', 'Activo', 2),
('1.3', 'Retenciones en la Fuente por Cobrar', 'Activo', 2),
('1.4', 'Retenciones de IVA por Cobrar', 'Activo', 2),
('2', 'Pasivos', 'Pasivo', 1),
('2.1', 'Cuentas por Pagar', 'Pasivo', 2),
('2.2', 'IESS por Pagar', 'Pasivo', 2),
('3', 'Patrimonio', 'Patrimonio', 1),
('4', 'Ingresos', 'Ingreso', 1),
('4.1', 'Ingresos por Ventas', 'Ingreso', 2),
('5', 'Costos', 'Costo', 1),
('5.1', 'Costo de Ventas', 'Costo', 2),
('6', 'Gastos', 'Gasto', 1),
('6.1', 'Gasto de Sueldos', 'Gasto', 2);

-- 10. Tabla de Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id VARCHAR(255) PRIMARY KEY,
    ruc VARCHAR(50) NOT NULL,
    nombre_empresa VARCHAR(255) NOT NULL,
    condiciones_pago VARCHAR(255),
    telefono VARCHAR(50),
    email VARCHAR(255),
    department VARCHAR(50),
    logo_url TEXT
);

-- 11. Tabla de Compras
CREATE TABLE IF NOT EXISTS compras (
    id VARCHAR(255) PRIMARY KEY,
    proveedor_id VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    total DECIMAL(15,2) NOT NULL DEFAULT 0,
    items_json TEXT,
    estado VARCHAR(50) DEFAULT 'Completado',
    department VARCHAR(50)
);

-- 12. Tabla de Gastos
CREATE TABLE IF NOT EXISTS gastos (
    id VARCHAR(255) PRIMARY KEY,
    fecha DATE NOT NULL,
    monto DECIMAL(15,2) NOT NULL DEFAULT 0,
    codigo_cuenta VARCHAR(50) NOT NULL,
    descripcion TEXT,
    referencia_pago VARCHAR(255),
    department VARCHAR(50)
);
