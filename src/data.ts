import { Client, ActivityLog, User, Project, Invoice } from './types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'roberto-martinez',
    name: 'Roberto Martínez',
    representative: 'Roberto Martínez (Director General)',
    company: 'Corporación El Rosado S.A.',
    email: 'roberto.martinez@elrosado.com.ec',
    phone: '+593 4-259-8700',
    city: 'Guayaquil',
    address: 'Av. 9 de Octubre y Boyacá, Guayaquil, Ecuador',
    serviceType: 'Asesoría Legal Corporate',
    status: 'development',
    lastContact: 'Hoy, 10:45 AM',
    initials: 'RM',
    ruc: '0990001234001',
    notes: 'Cliente corporativo clave desde 2024. Buscan renovar servicios legales recurrentes y contratos de consultoría laboral.',
    timeline: [
      {
        id: 'n1',
        title: 'Seguimiento de Propuesta',
        content: 'Se conversó sobre los ajustes al presupuesto del Q4. El cliente solicita incluir una cláusula de mantenimiento extendido por 12 meses. Se agendó revisión para el próximo martes.',
        date: 'Hoy, 10:45 AM',
        addedBy: 'Alejandro V.',
        type: 'note'
      },
      {
        id: 'n2',
        title: 'Estado Actualizado',
        content: 'Estado cambiado de "Contacto Inicial" a "En Desarrollo".',
        date: 'Ayer, 3:20 PM',
        type: 'status'
      },
      {
        id: 'n3',
        title: 'Llamada de Prospección',
        content: 'Llamada inicial para conocer necesidades de CRM en la sucursal Guayaquil. Interés alto en automatización de reportes de ventas.',
        date: '15 Oct, 2023',
        type: 'call'
      }
    ]
  },
  {
    id: 'agro-logistica',
    name: 'AgroLogística del Ecuador',
    representative: 'Juan Pérez (Gerente Financiero)',
    company: 'AgroLogística del Ecuador S.A.',
    email: 'juan.perez@agrologistica.ec',
    phone: '+593 2-234-5678',
    city: 'Quito',
    address: 'Av. de los Shyris N34-24 y Portugal, Edificio Shyris Park, Quito',
    serviceType: 'Consultoría Fiscal',
    status: 'initial',
    lastContact: 'Hoy, 10:30 AM',
    initials: 'AL',
    ruc: '1792483759001',
    notes: 'Interés inicial a través de referido bancario para auditoría tributaria y consolidada fiscal.',
    timeline: [
      {
        id: 'a1',
        title: 'Registro de Prospecto',
        content: 'Registrado con éxito desde el formulario web de Andean CRM.',
        date: 'Hoy, 10:30 AM',
        addedBy: 'Carlos Andrade',
        type: 'status'
      }
    ]
  },
  {
    id: 'banco-electrico',
    name: 'Banco Eléctrico',
    representative: 'Maria Torres (Directora de TI)',
    company: 'Banco Eléctrico S.A.',
    email: 'maria.torres@bancoelectrico.fin.ec',
    phone: '+593 2-395-9000',
    city: 'Quito',
    address: 'Av. Eloy Alfaro N30-100 y Amazonas, Quito',
    serviceType: 'Auditoría IT',
    status: 'development',
    lastContact: 'Ayer, 4:15 PM',
    initials: 'BE',
    ruc: '1790123456001',
    notes: 'Auditoría de seguridad y sistemas en entornos de nube híbrida.',
    timeline: [
      {
        id: 'b1',
        title: 'Planificación de Auditoría',
        content: 'Se entregó la hoja de ruta técnica e inicio de recolección de credenciales inicial.',
        date: 'Ayer, 4:15 PM',
        addedBy: 'María L.',
        type: 'note'
      }
    ]
  },
  {
    id: 'sierra-motors',
    name: 'Sierra Motors S.A.',
    representative: 'Carlos Lasso (Auditor de Ventas)',
    company: 'Sierra Motors S.A.',
    email: 'carlos.lasso@sierramotors.com.ec',
    phone: '+593 4-263-4000',
    city: 'Guayaquil',
    address: 'Av. Juan Tanca Marengo Km 2.5, Guayaquil',
    serviceType: 'Gestión de Nómina',
    status: 'billed', // Represents Cobrado/Facturado as green standard
    lastContact: 'Oct 12, 2023',
    initials: 'SM',
    ruc: '0990234561001',
    notes: 'Cliente recurrente con 150 empleados. Servicio de nómina mensual en periodo de renovación.',
    timeline: [
      {
        id: 's1',
        title: 'Factura Emitida',
        content: 'Emitida factura mensual por honorarios de ciclo administrativo.',
        date: 'Oct 12, 2023',
        addedBy: 'Facturación Automática',
        type: 'status'
      }
    ]
  },
  {
    id: 'tele-ecuador',
    name: 'TeleEcuador Corp',
    representative: 'Ana Belén (Gerente de Marketing)',
    company: 'TeleEcuador Corp',
    email: 'ana.belen@teleecuador.com',
    phone: '+593 2-250-1000',
    city: 'Quito',
    address: 'Av. de los Granados E12-10 y de las Azucenas, Quito',
    serviceType: 'Marketing Digital',
    status: 'finished',
    lastContact: 'Oct 05, 2023',
    initials: 'TE',
    ruc: '1790876543001',
    notes: 'Campaña completada. Presentaron solicitud de KPI optimizada para el Q4.',
    timeline: [
      {
        id: 't1',
        title: 'Cierre de Campaña',
        content: 'Se entregó informe final con tasa de conversión superior al 3.4%.',
        date: 'Oct 05, 2023',
        addedBy: 'Ana Belén',
        type: 'status'
      }
    ]
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act1',
    title: 'Corporación Favorita',
    detail: 'ha sido registrado',
    time: 'Hace 2 horas',
    author: 'Carlos Andrade',
    type: 'register',
    statusLabel: 'CONTACTO INICIAL',
    statusType: 'orange'
  },
  {
    id: 'act2',
    title: 'Factura #8920 pagada por',
    detail: 'Banco Pichincha',
    time: 'Hace 5 horas',
    author: 'Automático',
    type: 'payment',
    statusLabel: 'FACTURADO',
    statusType: 'green'
  },
  {
    id: 'act3',
    title: 'Propuesta enviada a',
    detail: 'CNT Ecuador',
    time: 'Ayer, 4:30 PM',
    author: 'María L.',
    type: 'proposal',
    statusLabel: 'EN DESARROLLO',
    statusType: 'blue'
  },
  {
    id: 'act4',
    title: 'Proyecto "Mantenimiento 2024"',
    detail: 'marcado como completado',
    time: 'Ayer, 11:15 AM',
    author: 'Sistema',
    type: 'complete',
    statusLabel: 'FINALIZADO',
    statusType: 'gray'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'carlos-andrade',
    name: 'Carlos Andrade',
    email: 'sirek',
    role: 'Gerente Comercial',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnJV8Wsm0tliOIswMbx2sPkIv8KpHT4tUQOCdi_fZOyteQQFG3cWkuvW0eSugv0c9WIAc9NKrZHNaG_jDmDZfcFXE5Q9aL0hFPnqES0EDdID3wAfcLCFHb8NLAP5OlmeHUF76VlT9--TVYUJlov2dvW7OYA9rmQaBqhZqqn7-_Q2NXVl92qb8lrhy4QNwHKtOHHjBCDm8A6IaballwwYaAODjJgY9dGk27w_hI5JBnPah3d5Omm05RfIbiYQRXugNnC30pP0gDU8w',
    password: 'Erick1212' // In a real app this would be hashed
  },
  {
    id: 'alejandro-v',
    name: 'Alejandro Valenzuela',
    email: 'alejandro.v@ecuacrm.com.ec',
    role: 'Ejecutivo de Cuentas',
    avatarUrl: '',
    password: 'User123!'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj1',
    clientId: 'roberto-martinez',
    clientName: 'Corporación El Rosado S.A.',
    name: 'Asesoría de Reestructuración Q4',
    description: 'Revisión y actualización de los contratos laborales corporativos y el protocolo de fusiones de El Rosado.',
    budget: 8500.00,
    startDate: '2026-05-01',
    endDate: '2026-06-15',
    status: 'ongoing',
    progress: 60,
    tasks: [
      { id: 't1', title: 'Reunión inicial de requerimientos', completed: true },
      { id: 't2', title: 'Análisis de contratos actuales', completed: true },
      { id: 't3', title: 'Borrador de nuevas cláusulas', completed: false },
      { id: 't4', title: 'Aprobación del departamento legal del cliente', completed: false }
    ],
    assignedTo: 'Alejandro Valenzuela'
  },
  {
    id: 'proj2',
    clientId: 'banco-electrico',
    clientName: 'Banco Eléctrico S.A.',
    name: 'Auditoría IT de Seguridad',
    description: 'Evaluación técnica integral del entorno en la nube y pruebas de penetración en los sistemas core transaccionales.',
    budget: 15000.00,
    startDate: '2026-05-10',
    endDate: '2026-06-30',
    status: 'ongoing',
    progress: 40,
    tasks: [
      { id: 't5', title: 'Mapeo de arquitectura en nube', completed: true },
      { id: 't6', title: 'Análisis de vulnerabilidades externas', completed: true },
      { id: 't7', title: 'Pruebas internas e inyección', completed: false },
      { id: 't8', title: 'Informe de remediación', completed: false }
    ],
    assignedTo: 'Carlos Andrade'
  },
  {
    id: 'proj3',
    clientId: 'tele-ecuador',
    clientName: 'TeleEcuador Corp',
    name: 'Campaña Digital Q2',
    description: 'Desarrollo de estrategia SEO y pauta digital para el lanzamiento del nuevo plan de fibra del cliente.',
    budget: 5000.00,
    startDate: '2026-04-01',
    endDate: '2026-05-15',
    status: 'completed',
    progress: 100,
    tasks: [
      { id: 't9', title: 'Plan de pauta aprobado', completed: true },
      { id: 't10', title: 'Diseño de piezas gráficas', completed: true },
      { id: 't11', title: 'Ejecución y optimización', completed: true },
      { id: 't12', title: 'Entrega de informe final de KPIs', completed: true }
    ],
    assignedTo: 'Alejandro Valenzuela'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'fac1',
    invoiceNumber: '001-001-000008920',
    clientId: 'banco-electrico',
    clientName: 'Banco Eléctrico S.A.',
    clientRuc: '1790123456001',
    issueDate: '2026-05-20',
    dueDate: '2026-06-20',
    items: [
      { description: 'Fase I: Planificación y Análisis de Riesgos Cloud', quantity: 1, unitPrice: 4000.00 }
    ],
    subtotal: 4000.00,
    taxRate: 0.15,
    taxAmount: 600.00,
    total: 4600.00,
    status: 'authorized',
    sriAccessKey: '2005202601179012345600120010010000089201234567812',
    sriMessage: 'AUTORIZADO - El comprobante ha sido autorizado por el SRI'
  },
  {
    id: 'fac2',
    invoiceNumber: '001-001-000008921',
    clientId: 'sierra-motors',
    clientName: 'Sierra Motors S.A.',
    clientRuc: '0990234561001',
    issueDate: '2026-05-25',
    dueDate: '2026-06-25',
    items: [
      { description: 'Honorarios Mensuales de Nómina (Abril 2026)', quantity: 1, unitPrice: 1500.00 }
    ],
    subtotal: 1500.00,
    taxRate: 0.15,
    taxAmount: 225.00,
    total: 1725.00,
    status: 'authorized',
    sriAccessKey: '2505202601099023456100120010010000089211234567819',
    sriMessage: 'AUTORIZADO - El comprobante ha sido autorizado por el SRI'
  },
  {
    id: 'fac3',
    invoiceNumber: '001-001-000008922',
    clientId: 'roberto-martinez',
    clientName: 'Corporación El Rosado S.A.',
    clientRuc: '0990001234001',
    issueDate: '2026-05-28',
    dueDate: '2026-06-28',
    items: [
      { description: 'Anticipo 50% - Asesoría Reestructuración Laboral', quantity: 1, unitPrice: 4250.00 }
    ],
    subtotal: 4250.00,
    taxRate: 0.15,
    taxAmount: 637.50,
    total: 4887.50,
    status: 'pending'
  }
];

