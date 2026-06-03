import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  TrendingUp,
  Plus,
  Search,
  Bell,
  HelpCircle,
  CheckCircle2,
  DollarSign,
  History,
  UserPlus,
  Receipt,
  FileText,
  MapPin,
  Mail,
  Phone,
  Send,
  Filter,
  Download,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Settings,
  LogOut,
  RotateCcw,
  Info,
  Calendar,
  Check,
  Map,
  Sparkles,
  Edit2,
  Lock,
  PlusCircle,
  Briefcase,
  AlertCircle,
  Upload,
  Package,
  Sun,
  Moon
} from 'lucide-react';

import { Client, ClientStatus, TimelineEvent, ActivityLog, User, Project, Invoice, InvoiceItem, Product, FiscalSettings } from './types';
import { INITIAL_CLIENTS, INITIAL_ACTIVITIES } from './data';
import { validateId } from './utils/ecuadorVal';
import Login from './components/Login';
import { playClickSound, playSuccessSound, playErrorSound } from './utils/audio';

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ecu_crm_user') || sessionStorage.getItem('ecu_crm_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('ecu_crm_token') || sessionStorage.getItem('ecu_crm_token');
  });

  // Navigation State
  const [activeTab, setRawActiveTab] = useState<'dashboard' | 'clientes' | 'nuevo-cliente' | 'proyectos' | 'facturacion' | 'ajustes' | 'cotizador' | 'usuarios' | 'productos' | 'perfil'>('dashboard');
  const setActiveTab = (tab: 'dashboard' | 'clientes' | 'nuevo-cliente' | 'proyectos' | 'facturacion' | 'ajustes' | 'cotizador' | 'usuarios' | 'productos' | 'perfil') => {
    setRawActiveTab(tab);
    playClickSound();
  };

  // Theme Mode State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ecu_crm_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ecu_crm_theme', theme);
  }, [theme]);

  // Custom Settings & Personalization
  const [soundsEnabled, setSoundsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('ecu_crm_interface_sounds') !== 'false';
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    return localStorage.getItem('ecu_crm_company_logo');
  });

  // Sync corporate logo to browser favicon in real-time
  useEffect(() => {
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    if (logoUrl) {
      link.href = logoUrl;
    } else {
      link.href = '/vite.svg'; // Fallback to default
    }
  }, [logoUrl]);

  // Users and Roles State
  const [users, setUsers] = useState<User[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormRole, setUserFormRole] = useState('Vendedor');
  const [userFormPassword, setUserFormPassword] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Security PIN Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deletePin, setDeletePin] = useState('');
  const [deletePinError, setDeletePinError] = useState('');

  // Cotizador States
  const [quoteClientId, setQuoteClientId] = useState('');
  const [quoteDate, setQuoteDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [quoteValidity, setQuoteValidity] = useState('15 días');
  const [quotePaymentTerms, setQuotePaymentTerms] = useState('50% anticipo, 50% contra entrega');
  const [quoteNotes, setQuoteNotes] = useState('Cotización sujeta a términos y condiciones estándar de servicios.');
  const [quoteItems, setQuoteItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, unitPrice: 0 }]);

  // Products Inventory States
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productFormName, setProductFormName] = useState('');
  const [productFormSku, setProductFormSku] = useState('');
  const [productFormDescription, setProductFormDescription] = useState('');
  const [productFormPrice, setProductFormPrice] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Fiscal Settings States
  const [fiscalSettings, setFiscalSettings] = useState<FiscalSettings>({
    nombreComercial: '',
    slogan: '',
    ruc: '',
    telefono: '',
    direccion: '',
    firmaElectronica: ''
  });
  const [fiscalFormNombre, setFiscalFormNombre] = useState('');
  const [fiscalFormSlogan, setFiscalFormSlogan] = useState('');
  const [fiscalFormRuc, setFiscalFormRuc] = useState('');
  const [fiscalFormTelefono, setFiscalFormTelefono] = useState('');
  const [fiscalFormDireccion, setFiscalFormDireccion] = useState('');
  const [fiscalFormFirma, setFiscalFormFirma] = useState('');

  // Profile Settings States
  const [profileFormName, setProfileFormName] = useState('');
  const [profileFormEmail, setProfileFormEmail] = useState('');
  const [profileFormPhone, setProfileFormPhone] = useState('');
  const [profileFormPassword, setProfileFormPassword] = useState('');
  const [profileFormAvatar, setProfileFormAvatar] = useState('');
  
  // Clients State
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string>('roberto-martinez');

  // Activities Log State
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Invoices State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);

  // Client Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minInvoicedFilter, setMinInvoicedFilter] = useState<string>('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // New Note Creation States
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<'note' | 'status' | 'call'>('note');

  // New Client Form States
  const [formNames, setFormNames] = useState('');
  const [formSurname, setFormSurname] = useState('');
  const [formIdNumber, setFormIdNumber] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formServiceType, setFormServiceType] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formCity, setFormCity] = useState('Quito');
  const [formValidationErrors, setFormValidationErrors] = useState<string[]>([]);
  const [formSuccessMessage, setFormSuccessMessage] = useState(false);

  // Edit Client Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');

  // New Project Form Modal States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projName, setProjName] = useState('');
  const [projClientId, setProjClientId] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projBudget, setProjBudget] = useState('');
  const [projStart, setProjStart] = useState('');
  const [projEnd, setProjEnd] = useState('');
  const [projAssigned, setProjAssigned] = useState('Carlos Andrade');

  const [invClientId, setInvClientId] = useState('');
  const [invItems, setInvItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [invDueDate, setInvDueDate] = useState('');

  // Bank Receipt OCR States
  const [facturacionSubTab, setFacturacionSubTab] = useState<'list' | 'scan'>('list');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    clientName: string;
    senderName?: string;
    ruc: string;
    totalAmount: number;
    date: string;
    bankName: string;
    referenceNumber: string;
  } | null>(null);

  const [ocrFormClientName, setOcrFormClientName] = useState('');
  const [ocrFormSenderName, setOcrFormSenderName] = useState('');
  const [ocrFormRuc, setOcrFormRuc] = useState('');
  const [ocrFormAmount, setOcrFormAmount] = useState(0);
  const [ocrFormDate, setOcrFormDate] = useState('');
  const [ocrFormBank, setOcrFormBank] = useState('');
  const [ocrFormReference, setOcrFormReference] = useState('');
  const [ocrFormDetail, setOcrFormDetail] = useState('Transferencia Bancaria Recibida');
  
  const [ocrMatchClient, setOcrMatchClient] = useState<Client | null>(null);
  const [ocrErrorMsg, setOcrErrorMsg] = useState('');

  // Gemini API Key state
  const [geminiKey, setGeminiKey] = useState('');
  const [isKeyConfigured, setIsKeyConfigured] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // Check if Gemini Key is configured
  const checkGeminiKeyStatus = async () => {
    try {
      const res = await fetch('/api/settings/gemini-key');
      if (res.ok) {
        const data = await res.json();
        setIsKeyConfigured(data.isConfigured);
      }
    } catch (err) {
      console.error('Error checking Gemini key status:', err);
    }
  };

  useEffect(() => {
    checkGeminiKeyStatus();
  }, []);

  // Auto-match client when form fields change
  useEffect(() => {
    if (!ocrFormClientName.trim() && !ocrFormRuc.trim()) {
      setOcrMatchClient(null);
      return;
    }
    const cleanRuc = ocrFormRuc.replace(/\D/g, '');
    const cleanName = ocrFormClientName.trim().toLowerCase();
    
    const matched = clients.find(c => {
      if (cleanRuc && c.ruc.replace(/\D/g, '') === cleanRuc) {
        return true;
      }
      if (cleanName.length > 2 && (
        c.name.toLowerCase().includes(cleanName) ||
        cleanName.includes(c.name.toLowerCase()) ||
        c.company.toLowerCase().includes(cleanName)
      )) {
        return true;
      }
      return false;
    });
    setOcrMatchClient(matched || null);
  }, [ocrFormClientName, ocrFormRuc, clients]);

  const handleSaveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKey.trim()) {
      alert("Por favor, ingrese una clave válida.");
      return;
    }

    try {
      const res = await fetch('/api/settings/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: geminiKey })
      });

      if (res.ok) {
        setIsKeyConfigured(true);
        setGeminiKey('');
        alert("¡Clave de Gemini guardada y configurada con éxito!");
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.message || 'No se pudo guardar la clave.'}`);
      }
    } catch (err) {
      console.error("Error saving Gemini key:", err);
      alert("Error de conexión al guardar la clave.");
    }
  };

  // Receipt image selection handler
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setOcrErrorMsg('');
    setExtractedData(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;

      try {
        const response = await fetch('/api/analyze-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String, filename: file.name })
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && resJson.data) {
            const data = resJson.data;
            setExtractedData(data);
            // Por defecto: el EMISOR (quien hace la transferencia) es el nombre principal del cliente
            setOcrFormClientName(data.senderName || data.clientName || '');
            // El BENEFICIARIO queda como nombre alternativo para intercambiar si se necesita
            setOcrFormSenderName(data.clientName || '');
            setOcrFormRuc(data.ruc || '');
            setOcrFormAmount(parseFloat(data.totalAmount) || 0);
            setOcrFormDate(data.date || new Date().toISOString().split('T')[0]);
            setOcrFormBank(data.bankName || '');
            setOcrFormReference(data.referenceNumber || '');
            setOcrFormDetail(`Pago por Transferencia - Ref: ${data.referenceNumber || 'N/A'}`);
          } else {
            setOcrErrorMsg('No se pudieron extraer los datos del comprobante.');
          }
        } else {
          setOcrErrorMsg('Error en el servicio de análisis del servidor.');
        }
      } catch (error) {
        console.error("Error processing receipt:", error);
        setOcrErrorMsg('Error de red al procesar el archivo.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    reader.onerror = () => {
      setOcrErrorMsg('Error al leer el archivo de imagen.');
      setIsAnalyzing(false);
    };

    reader.readAsDataURL(file);
  };

  // Quick Client Registration from OCR Form
  const handleOcrRegisterClient = async () => {
    if (!ocrFormClientName.trim()) {
      alert("Ingrese un nombre de cliente válido.");
      return;
    }
    
    if (ocrFormRuc.trim()) {
      const valResult = validateId(ocrFormRuc);
      if (!valResult.isValid) {
        alert(valResult.message);
        return;
      }
    }

    const clientId = ocrFormClientName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const initials = ocrFormClientName.split(' ').map(n => n[0] || '').join('').substring(0, 2).toUpperCase() || 'NC';

    const newClient: Client = {
      id: clientId,
      name: ocrFormClientName,
      representative: `${ocrFormClientName} (Representante)`,
      company: ocrFormClientName,
      email: `${clientId}@ejemplo.com.ec`,
      phone: '0900000000',
      city: 'Quito',
      address: 'Dirección extraída de comprobante bancario',
      serviceType: 'Consultoría Fiscal',
      status: 'initial',
      lastContact: 'Hoy, Justo ahora',
      initials,
      ruc: ocrFormRuc || '1729483758001',
      notes: `Cliente registrado automáticamente a partir de comprobante de pago bancario de ${ocrFormBank}.`,
      timeline: [
        {
          id: 'event-ocr',
          title: 'Registro Automático OCR',
          content: `Cliente registrado automáticamente desde comprobante de transferencia bancaria del ${ocrFormBank}. Referencia: ${ocrFormReference}.`,
          date: 'Hoy, Justo ahora',
          addedBy: currentUser?.name || 'Carlos Andrade',
          type: 'status'
        }
      ]
    };

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      if (res.ok) {
        const saved = await res.json();
        setClients(prev => [saved, ...prev]);
        setOcrMatchClient(saved);
        alert(`¡Cliente "${ocrFormClientName}" registrado con éxito!`);
      }
    } catch (e) {
      setClients(prev => [newClient, ...prev]);
      setOcrMatchClient(newClient);
      alert(`¡Cliente "${ocrFormClientName}" registrado localmente!`);
    }
  };

  // Emit Invoice from OCR Form
  const handleOcrEmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ocrFormClientName.trim() || ocrFormAmount <= 0) {
      alert("Ingrese datos válidos.");
      return;
    }

    let matchedClient = ocrMatchClient;

    if (!matchedClient) {
      // Validate RUC if present
      if (ocrFormRuc.trim()) {
        const valResult = validateId(ocrFormRuc);
        if (!valResult.isValid) {
          alert(valResult.message);
          return;
        }
      }

      const clientId = ocrFormClientName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const initials = ocrFormClientName.split(' ').map(n => n[0] || '').join('').substring(0, 2).toUpperCase() || 'NC';
      const newClient: Client = {
        id: clientId,
        name: ocrFormClientName,
        representative: `${ocrFormClientName} (Representante)`,
        company: ocrFormClientName,
        email: `${clientId}@ejemplo.com.ec`,
        phone: '0900000000',
        city: 'Quito',
        address: 'Dirección extraída de comprobante bancario',
        serviceType: 'Consultoría Fiscal',
        status: 'initial',
        lastContact: 'Hoy, Justo ahora',
        initials,
        ruc: ocrFormRuc || '1729483758001',
        notes: `Cliente registrado automáticamente a partir de comprobante de pago de ${ocrFormBank}.`,
        timeline: [
          {
            id: 'event-ocr',
            title: 'Registro Automático OCR',
            content: `Cliente registrado automáticamente desde comprobante de transferencia bancaria del ${ocrFormBank}. Referencia: ${ocrFormReference}.`,
            date: 'Hoy, Justo ahora',
            addedBy: currentUser?.name || 'Carlos Andrade',
            type: 'status'
          }
        ]
      };

      try {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newClient)
        });
        if (res.ok) {
          const savedClient = await res.json();
          setClients(prev => [savedClient, ...prev]);
          matchedClient = savedClient;
        }
      } catch (e) {
        setClients(prev => [newClient, ...prev]);
        matchedClient = newClient;
      }
    }

    const subtotal = ocrFormAmount / 1.15; // Back-calculate subtotal
    const taxRate = 0.15;
    const taxAmount = ocrFormAmount - subtotal;
    const total = ocrFormAmount;

    const clientName = matchedClient ? matchedClient.company : ocrFormClientName;
    const clientRuc = matchedClient ? matchedClient.ruc : ocrFormRuc || '1729483758001';
    const clientId = matchedClient ? matchedClient.id : 'desconocido';

    const nextSequential = String(invoices.length + 8921).padStart(9, '0');

    const newInvoice: Invoice = {
      id: 'fac-' + Date.now(),
      invoiceNumber: `001-001-${nextSequential}`,
      clientId,
      clientName,
      clientRuc,
      issueDate: ocrFormDate || new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      items: [
        { description: ocrFormDetail || 'Servicios profesionales / comprobante bancario', quantity: 1, unitPrice: subtotal }
      ],
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: 'pending'
    };

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      });
      if (res.ok) {
        const saved = await res.json();
        setInvoices(prev => [saved, ...prev]);
      }
    } catch (err) {
      setInvoices(prev => [newInvoice, ...prev]);
    }

    // Add activity log
    const newAct: ActivityLog = {
      id: 'act-' + Date.now(),
      title: `Factura ${newInvoice.invoiceNumber} (Comprobante)`,
      detail: `generada de transferencia bancaria ${ocrFormBank} por $${total.toFixed(2)}`,
      time: 'Hace un momento',
      author: currentUser?.name || 'Carlos Andrade',
      type: 'payment',
      statusLabel: 'FACTURACIÓN OCR',
      statusType: 'green'
    };
    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAct)
      });
      await fetchActivities();
    } catch (err) {
      setActivities(prev => [newAct, ...prev]);
    }

    alert("¡Factura generada con éxito a partir del comprobante bancario!");
    setFacturacionSubTab('list');
    setExtractedData(null);
  };


  // Load database from API when authenticated
  useEffect(() => {
    if (currentUser && token) {
      fetchClients();
      fetchActivities();
      fetchProjects();
      fetchInvoices();
      fetchUsers();
      fetchProducts();
      fetchFiscalSettings();
    }
  }, [currentUser, token]);

  // Synchronize profile form states when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileFormName(currentUser.name || '');
      setProfileFormEmail(currentUser.email || '');
      setProfileFormPhone(currentUser.phone || '');
      setProfileFormPassword('');
      setProfileFormAvatar(currentUser.avatarUrl || '');
    }
  }, [currentUser]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.warn("Using offline products", e);
    }
  };

  const fetchFiscalSettings = async () => {
    try {
      const res = await fetch('/api/settings/fiscal');
      if (res.ok) {
        const data = await res.json();
        setFiscalSettings(data);
        setFiscalFormNombre(data.nombreComercial || '');
        setFiscalFormSlogan(data.slogan || '');
        setFiscalFormRuc(data.ruc || '');
        setFiscalFormTelefono(data.telefono || '');
        setFiscalFormDireccion(data.direccion || '');
        setFiscalFormFirma(data.firmaElectronica || '');
      }
    } catch (e) {
      console.warn("Using offline fiscal settings", e);
    }
  };

  const handleSaveFiscalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: FiscalSettings = {
      nombreComercial: fiscalFormNombre,
      slogan: fiscalFormSlogan,
      ruc: fiscalFormRuc,
      telefono: fiscalFormTelefono,
      direccion: fiscalFormDireccion,
      firmaElectronica: fiscalFormFirma
    };

    try {
      const res = await fetch('/api/settings/fiscal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setFiscalSettings(data.settings);
        } else {
          setFiscalSettings(updated);
        }
        playSuccessSound();
        alert("¡Datos fiscales del emisor actualizados con éxito!");
      } else {
        alert("Error al actualizar los datos fiscales.");
      }
    } catch (err) {
      console.error(err);
      setFiscalSettings(updated);
      playSuccessSound();
      alert("¡Datos fiscales actualizados localmente!");
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormName.trim() || !productFormSku.trim() || !productFormPrice.trim()) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    const priceNum = parseFloat(productFormPrice) || 0;
    const productData = {
      name: productFormName,
      sku: productFormSku,
      description: productFormDescription,
      unitPrice: priceNum
    };

    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        if (res.ok) {
          const updated = await res.json();
          setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
          playSuccessSound();
          alert("¡Producto actualizado con éxito!");
        }
      } else {
        const newProduct = {
          id: 'prod-' + Date.now(),
          ...productData
        };
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProduct)
        });
        if (res.ok) {
          const saved = await res.json();
          setProducts(prev => [...prev, saved]);
          playSuccessSound();
          alert("¡Producto agregado con éxito!");
        } else {
          const errData = await res.json();
          alert(errData.message || "Error al guardar el producto.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al guardar el producto.");
    } finally {
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductFormName('');
      setProductFormSku('');
      setProductFormDescription('');
      setProductFormPrice('');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este producto?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        playSuccessSound();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updatedData: Partial<User> = {
      name: profileFormName,
      email: profileFormEmail,
      phone: profileFormPhone,
      avatarUrl: profileFormAvatar
    };
    if (profileFormPassword.trim()) {
      updatedData.password = profileFormPassword;
    }

    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (res.ok) {
        const saved = await res.json();
        setCurrentUser(saved);
        if (localStorage.getItem('ecu_crm_user')) {
          localStorage.setItem('ecu_crm_user', JSON.stringify(saved));
        } else {
          sessionStorage.setItem('ecu_crm_user', JSON.stringify(saved));
        }
        playSuccessSound();
        alert("¡Tu perfil ha sido actualizado con éxito!");
      } else {
        alert("Error al actualizar tu perfil.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor.");
    }
  };

  const handleUpdateProjectStatus = async (projectId: string, newStatus: Project['status']) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const updatedProject = { ...project, status: newStatus };
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject)
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(prev => prev.map(p => p.id === data.id ? data : p));
        playSuccessSound();
      }
    } catch (err) {
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
      playSuccessSound();
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.warn("Using offline users cache", e);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (e) {
      console.warn("Using offline clients cache", e);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities');
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (e) {
      console.warn("Using offline activities cache", e);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.warn("Using offline projects cache", e);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (e) {
      console.warn("Using offline invoices cache", e);
    }
  };

  // Login callback
  const handleLoginSuccess = (user: User, userToken: string) => {
    setCurrentUser(user);
    setToken(userToken);
    setActiveTab('dashboard');
  };

  // Logout callback
  const handleLogout = () => {
    localStorage.removeItem('ecu_crm_user');
    localStorage.removeItem('ecu_crm_token');
    sessionStorage.removeItem('ecu_crm_user');
    sessionStorage.removeItem('ecu_crm_token');
    setCurrentUser(null);
    setToken(null);
  };

  // Current client selected for detail view
  const currentClientDetail = useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || clients[0] || null;
  }, [clients, selectedClientId]);

  // Handle Edit Modal Setup
  const openEditModal = (client: Client) => {
    setEditEmail(client.email);
    setEditPhone(client.phone);
    setEditAddress(client.address || '');
    setEditCity(client.city);
    setIsEditModalOpen(true);
  };

  const handleEditClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClientDetail) return;

    const updatedData = {
      email: editEmail,
      phone: editPhone,
      address: editAddress,
      city: editCity
    };

    try {
      const res = await fetch(`/api/clients/${currentClientDetail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        const updated = await res.json();
        setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
      }
    } catch (e) {
      // Offline fallback
      setClients(prev => prev.map(c => {
        if (c.id === currentClientDetail.id) {
          return { ...c, ...updatedData };
        }
        return c;
      }));
    }
    
    setIsEditModalOpen(false);
    
    // Add activity log
    const newAct: ActivityLog = {
      id: 'act-' + Date.now(),
      title: `${currentClientDetail.name}`,
      detail: 'datos de contacto modificados',
      time: 'Hace un momento',
      author: currentUser?.name || 'Carlos Andrade',
      type: 'proposal',
      statusLabel: 'ACTUALIZADO',
      statusType: 'blue'
    };
    
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAct)
      });
      if (res.ok) {
        const logged = await res.json();
        setActivities(prev => [logged, ...prev]);
      }
    } catch (e) {
      setActivities(prev => [newAct, ...prev]);
    }
  };

  // Reset demo values helper
  const handleResetData = async () => {
    if (window.confirm("¿Está seguro de que desea restablecer todos los datos iniciales del CRM en el servidor?")) {
      try {
        const res = await fetch('/api/reset', { method: 'POST' });
        if (res.ok) {
          await fetchClients();
          await fetchActivities();
          await fetchProjects();
          await fetchInvoices();
          setSelectedClientId('roberto-martinez');
          setActiveTab('dashboard');
          alert("Los datos han sido restablecidos con éxito en la base de datos.");
        }
      } catch (e) {
        alert("Error de conexión con el servidor para restablecer los datos.");
      }
    }
  };

  // Dynamic Status Distribution Calculations
  const statusCounts = useMemo(() => {
    let initialCount = 0;
    let devCount = 0;
    let finishedCount = 0;
    
    clients.forEach(c => {
      if (c.status === 'initial') initialCount++;
      else if (c.status === 'development') devCount++;
      else finishedCount++;
    });

    const total = clients.length || 1;
    return {
      prospectos: Math.round((initialCount / total) * 100),
      negociacion: Math.round((devCount / total) * 100),
      fidelizados: Math.round((finishedCount / total) * 100),
      rawInitial: initialCount,
      rawDev: devCount,
      rawFinished: finishedCount
    };
  }, [clients]);

  // Clients Filter logic
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.representative.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' ? true : c.status === statusFilter;
      const matchesCity = cityFilter === 'all' ? true : c.city === cityFilter;
      const matchesMinInvoiced = minInvoicedFilter === '' ? true : (parseFloat(c.ruc) % 5000 > parseFloat(minInvoicedFilter));

      return matchesSearch && matchesStatus && matchesCity && matchesMinInvoiced;
    });
  }, [clients, searchQuery, statusFilter, cityFilter, minInvoicedFilter]);

  // Pagination processing
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredClients, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, cityFilter, minInvoicedFilter]);

  // Status Colors helper
  const getStatusInfo = (status: ClientStatus) => {
    switch (status) {
      case 'initial':
        return {
          label: 'CONTACTO INICIAL',
          badgeClass: 'bg-orange-500/10 text-orange-500',
          borderClass: 'border-l-4 border-l-orange-500',
          indicatorColor: 'bg-orange-500'
        };
      case 'development':
        return {
          label: 'EN DESARROLLO',
          badgeClass: 'bg-blue-600/10 text-blue-600',
          borderClass: 'border-l-4 border-l-blue-600',
          indicatorColor: 'bg-blue-600'
        };
      case 'billed':
        return {
          label: 'FACTURADO',
          badgeClass: 'bg-emerald-600/10 text-emerald-600',
          borderClass: 'border-l-4 border-l-emerald-600',
          indicatorColor: 'bg-emerald-600'
        };
      case 'finished':
        return {
          label: 'FINALIZADO',
          badgeClass: 'bg-slate-600/10 text-slate-600',
          borderClass: 'border-l-4 border-l-slate-600',
          indicatorColor: 'bg-slate-600'
        };
    }
  };

  // Add a follow-up note to currentClientDetail
  const handleAddNote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNoteContent.trim() || !currentClientDetail) return;

    const newEvent: TimelineEvent = {
      id: 'event-' + Date.now(),
      title: newNoteType === 'note' ? 'Nota de Seguimiento' : newNoteType === 'call' ? 'Llamada de Seguimiento' : 'Actualización Especial',
      content: newNoteContent,
      date: 'Hoy, ' + new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      addedBy: currentUser?.name || 'Carlos Andrade',
      type: newNoteType
    };

    const updatedTimeline = [newEvent, ...currentClientDetail.timeline];
    const updatedClient = {
      ...currentClientDetail,
      lastContact: 'Hoy, ' + new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      timeline: updatedTimeline
    };

    try {
      const res = await fetch(`/api/clients/${currentClientDetail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClient)
      });
      if (res.ok) {
        const data = await res.json();
        setClients(prev => prev.map(c => c.id === data.id ? data : c));
      }
    } catch (e) {
      setClients(prev => prev.map(c => c.id === currentClientDetail.id ? updatedClient : c));
    }

    // Register Activity Log
    const newAct: ActivityLog = {
      id: 'act-' + Date.now(),
      title: `Nota registrada para ${currentClientDetail.name}`,
      detail: newNoteContent.substring(0, 30) + (newNoteContent.length > 30 ? '...' : ''),
      time: 'Hace un momento',
      author: currentUser?.name || 'Carlos Andrade',
      type: 'complete',
      statusLabel: 'NOTIFICACIÓN',
      statusType: 'blue'
    };
    
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAct)
      });
      if (res.ok) {
        const logged = await res.json();
        setActivities(prev => [logged, ...prev]);
      }
    } catch (e) {
      setActivities(prev => [newAct, ...prev]);
    }

    setNewNoteContent('');
  };

  // Change status of currentClientDetail
  const handleChangeStatus = async (statusValue: ClientStatus) => {
    if (!currentClientDetail) return;
    const oldStatusInfo = getStatusInfo(currentClientDetail.status);
    const newStatusInfo = getStatusInfo(statusValue);

    const statusEvent: TimelineEvent = {
      id: 'status-' + Date.now(),
      title: 'Estado Actualizado',
      content: `Estado cambiado de "${oldStatusInfo.label}" a "${newStatusInfo.label}".`,
      date: 'Hoy, ' + new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      type: 'status'
    };

    const updatedTimeline = [statusEvent, ...currentClientDetail.timeline];
    const updatedClient = {
      ...currentClientDetail,
      status: statusValue,
      lastContact: 'Hoy, ' + new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      timeline: updatedTimeline
    };

    try {
      const res = await fetch(`/api/clients/${currentClientDetail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClient)
      });
      if (res.ok) {
        const data = await res.json();
        setClients(prev => prev.map(c => c.id === data.id ? data : c));
      }
    } catch (e) {
      setClients(prev => prev.map(c => c.id === currentClientDetail.id ? updatedClient : c));
    }

    // Register Activity Log
    const newAct: ActivityLog = {
      id: 'act-' + Date.now(),
      title: `${currentClientDetail.name}`,
      detail: `Estado cambiado a ${newStatusInfo.label}`,
      time: 'Hace un momento',
      author: currentUser?.name || 'Carlos Andrade',
      type: 'proposal',
      statusLabel: newStatusInfo.label,
      statusType: statusValue === 'initial' ? 'orange' : statusValue === 'development' ? 'blue' : 'green'
    };

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAct)
      });
      if (res.ok) {
        const logged = await res.json();
        setActivities(prev => [logged, ...prev]);
      }
    } catch (e) {
      setActivities(prev => [newAct, ...prev]);
    }
  };

  // Save new client handler
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationErrors([]);

    const errors = [];
    if (!formNames.trim()) errors.push("Nombres es un campo obligatorio.");
    if (!formSurname.trim()) errors.push("Apellidos es un campo obligatorio.");
    if (!formIdNumber.trim()) {
      errors.push("Identificación (Cédula/RUC) es un campo obligatorio.");
    } else {
      // Validate Ecuadorian ID using ecuadorVal
      const valResult = validateId(formIdNumber);
      if (!valResult.isValid) {
        errors.push(valResult.message);
      }
    }
    if (!formEmail.trim()) errors.push("Correo Electrónico es un campo obligatorio.");
    if (!formPhone.trim()) errors.push("Teléfono o WhatsApp es un campo obligatorio.");
    if (!formServiceType) errors.push("Debe seleccionar un Tipo de Servicio.");

    if (errors.length > 0) {
      setFormValidationErrors(errors);
      return;
    }

    const clientId = (formNames + '-' + formSurname).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const initials = (formNames[0] || '') + (formSurname[0] || '');

    const newClient: Client = {
      id: clientId,
      name: `${formNames} ${formSurname}`,
      representative: `${formNames} ${formSurname} (Representante)`,
      company: `${formNames} S.A.`,
      email: formEmail,
      phone: formPhone,
      city: formCity,
      address: formAddress || 'No especificada',
      serviceType: formServiceType,
      status: 'initial',
      lastContact: 'Hoy, Justo ahora',
      initials: initials.toUpperCase() || 'NC',
      ruc: formIdNumber,
      notes: formNotes || 'Sin comentarios iniciales',
      timeline: [
        {
          id: 'event-initial',
          title: 'Registro de Prospecto',
          content: `Registrado con éxito como prospecto en ECU-CRM. Notas iniciales: ${formNotes || 'Ninguna'}`,
          date: 'Hoy, Justo ahora',
          addedBy: currentUser?.name || 'Carlos Andrade',
          type: 'status'
        }
      ]
    };

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      if (res.ok) {
        const saved = await res.json();
        setClients(prev => [saved, ...prev]);
      }
    } catch (e) {
      setClients(prev => [newClient, ...prev]);
    }

    // Track on Activity Logs
    const newAct: ActivityLog = {
      id: 'act-new-' + Date.now(),
      title: `${formNames} ${formSurname}`,
      detail: 'ha sido registrado',
      time: 'Hace un momento',
      author: currentUser?.name || 'Carlos Andrade',
      type: 'register',
      statusLabel: 'CONTACTO INICIAL',
      statusType: 'orange'
    };

    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAct)
      });
      await fetchActivities();
    } catch (e) {
      setActivities(prev => [newAct, ...prev]);
    }

    // Reset Form Fields
    setFormNames('');
    setFormSurname('');
    setFormIdNumber('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setFormServiceType('');
    setFormNotes('');
    setFormCity('Quito');

    setFormSuccessMessage(true);
    setTimeout(() => {
      setFormSuccessMessage(false);
      setSelectedClientId(clientId);
      setActiveTab('clientes');
    }, 1200);
  };

  // Remove Client handler (opens PIN security modal)
  const handleDeleteClient = (id: string, name: string) => {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    setClientToDelete(client);
    setDeletePin('');
    setDeletePinError('');
    setIsDeleteModalOpen(true);
  };

  // Safe Deletion handler after PIN input
  const handleConfirmDeleteClient = async () => {
    if (!clientToDelete) return;
    
    if (deletePin !== '1212') {
      setDeletePinError('PIN de seguridad incorrecto.');
      playErrorSound();
      return;
    }

    try {
      const res = await fetch(`/api/clients/${clientToDelete.id}`, { 
        method: 'DELETE',
        headers: { 
          'X-Security-PIN': '1212',
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
        if (selectedClientId === clientToDelete.id) {
          setSelectedClientId(clients.find(c => c.id !== clientToDelete.id)?.id || '');
        }
        playSuccessSound();
        setIsDeleteModalOpen(false);
        setClientToDelete(null);
      } else {
        const data = await res.json();
        setDeletePinError(data.message || 'Error al eliminar el cliente.');
        playErrorSound();
      }
    } catch (e) {
      // Offline fallback
      setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
      playSuccessSound();
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    }
    
    // Track on Activity Logs
    const newAct: ActivityLog = {
      id: 'act-del-' + Date.now(),
      title: `${clientToDelete.name}`,
      detail: 'cliente eliminado con autorización de PIN',
      time: 'Hace un momento',
      author: currentUser?.name || 'Carlos Andrade',
      type: 'complete',
      statusLabel: 'ELIMINADO',
      statusType: 'gray'
    };

    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAct)
      });
      await fetchActivities();
    } catch (e) {
      setActivities(prev => [newAct, ...prev]);
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Nombres,Compania,Email,Telefono,Ciudad,RUC,Servicio,Estado\n";
    
    clients.forEach(c => {
      const row = `"${c.id}","${c.name}","${c.company}","${c.email}","${c.phone}","${c.city}","${c.ruc}","${c.serviceType}","${c.status}"`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ecu_crm_clientes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick helper to get status friendly title
  const getFriendlyStatus = (status: ClientStatus) => {
    switch (status) {
      case 'initial': return 'Contacto Inicial';
      case 'development': return 'En Desarrollo';
      case 'billed': return 'Facturado';
      case 'finished': return 'Finalizado';
    }
  };

  // Project checklist toggle
  const handleToggleTask = async (projectId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedTasks = project.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    const completedCount = updatedTasks.filter(t => t.completed).length;
    const progress = Math.round((completedCount / updatedTasks.length) * 100);

    const updatedProject = {
      ...project,
      tasks: updatedTasks,
      progress
    };

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject)
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(prev => prev.map(p => p.id === data.id ? data : p));
      }
    } catch (e) {
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
    }
  };

  // Save new project
  const handleSaveProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim() || !projClientId) return;

    const client = clients.find(c => c.id === projClientId);
    if (!client) return;

    const newProject: Project = {
      id: 'proj-' + Date.now(),
      clientId: projClientId,
      clientName: client.company,
      name: projName,
      description: projDesc,
      budget: parseFloat(projBudget) || 0,
      startDate: projStart || new Date().toISOString().split('T')[0],
      endDate: projEnd || new Date().toISOString().split('T')[0],
      status: 'planning',
      progress: 0,
      tasks: [
        { id: 't1-' + Date.now(), title: 'Planificación de alcances iniciales', completed: false },
        { id: 't2-' + Date.now(), title: 'Reunión de kickoff con el cliente', completed: false },
        { id: 't3-' + Date.now(), title: 'Entrega de primera fase del servicio', completed: false }
      ],
      assignedTo: projAssigned
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      if (res.ok) {
        const saved = await res.json();
        setProjects(prev => [saved, ...prev]);
      }
    } catch (e) {
      setProjects(prev => [newProject, ...prev]);
    }

    setIsProjectModalOpen(false);
    setProjName('');
    setProjClientId('');
    setProjDesc('');
    setProjBudget('');
    setProjStart('');
    setProjEnd('');

    // Activity Log
    const newAct: ActivityLog = {
      id: 'act-' + Date.now(),
      title: `Nuevo proyecto "${newProject.name}"`,
      detail: `registrado para ${client.company}`,
      time: 'Hace un momento',
      author: currentUser?.name || 'Carlos Andrade',
      type: 'proposal',
      statusLabel: 'PROYECTO',
      statusType: 'blue'
    };
    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAct)
      });
      await fetchActivities();
    } catch (e) {
      setActivities(prev => [newAct, ...prev]);
    }
  };

  // Add invoice item
  const addInvoiceItem = () => {
    setInvItems([...invItems, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  // Remove invoice item
  const removeInvoiceItem = (index: number) => {
    if (invItems.length === 1) return;
    setInvItems(invItems.filter((_, i) => i !== index));
  };

  // Update invoice item
  const updateInvoiceItemField = (index: number, field: keyof InvoiceItem, value: any) => {
    setInvItems(invItems.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [field]: field === 'quantity' ? parseInt(value) || 0 : field === 'unitPrice' ? parseFloat(value) || 0 : value
        };
      }
      return item;
    }));
  };

  // Save new invoice
  const handleSaveInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invClientId) return;

    const client = clients.find(c => c.id === invClientId);
    if (!client) return;

    // Calculate subtotal
    const subtotal = invItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxRate = 0.15; // 15% IVA Ecuador
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Sequential number helper
    const nextSequential = String(invoices.length + 8921).padStart(9, '0');

    const newInvoice: Invoice = {
      id: 'fac-' + Date.now(),
      invoiceNumber: `001-001-${nextSequential}`,
      clientId: invClientId,
      clientName: client.company,
      clientRuc: client.ruc,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: invDueDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      items: invItems,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: 'draft'
    };

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      });
      if (res.ok) {
        const saved = await res.json();
        setInvoices(prev => [saved, ...prev]);
      }
    } catch (e) {
      setInvoices(prev => [newInvoice, ...prev]);
    }

    setIsInvoiceModalOpen(false);
    setInvClientId('');
    setInvItems([{ description: '', quantity: 1, unitPrice: 0 }]);
    setInvDueDate('');

    // Activity Log
    const newAct: ActivityLog = {
      id: 'act-' + Date.now(),
      title: `Factura ${newInvoice.invoiceNumber} borrador`,
      detail: `generada para ${client.company} por $${total.toFixed(2)}`,
      time: 'Hace un momento',
      author: currentUser?.name || 'Carlos Andrade',
      type: 'payment',
      statusLabel: 'FACTURACIÓN',
      statusType: 'orange'
    };
    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAct)
      });
      await fetchActivities();
    } catch (e) {
      setActivities(prev => [newAct, ...prev]);
    }
  };

  // Authorize SRI invoice simulation
  const handleAuthorizeSRI = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/authorize-sri`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setInvoices(prev => prev.map(inv => inv.id === data.id ? data : inv));
        
        // Add activity log
        const newAct: ActivityLog = {
          id: 'act-' + Date.now(),
          title: `Factura ${data.invoiceNumber} AUTORIZADA por SRI`,
          detail: `Clave: ${data.sriAccessKey.substring(0, 15)}...`,
          time: 'Hace un momento',
          author: 'SRI WebService',
          type: 'complete',
          statusLabel: 'AUTORIZADO',
          statusType: 'green'
        };
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAct)
        });
        await fetchActivities();
      }
    } catch (e) {
      alert("Error al simular autorización con el SRI. Verifique conexión del backend.");
    }
  };

  // Print and Export Quote to PDF
  const handlePrintQuote = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Por favor habilite las ventanas emergentes (popups) para poder imprimir la cotización.");
      return;
    }

    const client = clients.find(c => c.id === quoteClientId);
    const subtotal = quoteItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const iva = subtotal * 0.15;
    const total = subtotal * 1.15;

    const itemsHtml = quoteItems.map((item, idx) => `
      <tr>
        <td style="border: 1px solid #e2e8f0; padding: 10px; font-family: monospace; text-align: center; color: #64748b;">${idx + 1}</td>
        <td style="border: 1px solid #e2e8f0; padding: 10px; font-weight: 500;">${item.description}</td>
        <td style="border: 1px solid #e2e8f0; padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #e2e8f0; padding: 10px; text-align: right; font-family: monospace;">$${item.unitPrice.toFixed(2)}</td>
        <td style="border: 1px solid #e2e8f0; padding: 10px; text-align: right; font-family: monospace; font-weight: bold; color: #1e3a8a;">$${(item.quantity * item.unitPrice).toFixed(2)}</td>
      </tr>
    `).join('');

    const logoHtml = logoUrl ? `<img src="${logoUrl}" style="max-height: 60px; max-width: 150px; object-fit: contain; margin-bottom: 10px;" />` : `<div style="font-size: 28px; font-weight: 900; color: #2563eb; font-family: sans-serif; letter-spacing: -1px; margin-bottom: 5px;">ECU-CRM</div>`;

    const emitterName = fiscalSettings.nombreComercial || 'ECU-CRM';
    const emitterSlogan = fiscalSettings.slogan || 'Soporte Técnico SRI y Soluciones Empresariales';
    const emitterRuc = fiscalSettings.ruc ? `RUC: ${fiscalSettings.ruc}` : 'RUC: N/A';
    const emitterPhone = fiscalSettings.telefono ? `Telf: ${fiscalSettings.telefono}` : '';
    const emitterDir = fiscalSettings.direccion || 'Ecuador';

    printWindow.document.write(`
      <html>
        <head>
          <title>Cotización Comercial - ECU-CRM</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; font-size: 11px; line-height: 1.4; color: #334155; margin: 30px; background-color: #fff; }
            .container { max-width: 800px; margin: 0 auto; }
            .quote-header { display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; }
            .quote-title { font-size: 24px; font-weight: 800; color: #1e3a8a; margin: 0; text-transform: uppercase; }
            .meta-info { text-align: right; font-size: 10px; color: #64748b; line-height: 1.6; }
            .meta-info strong { color: #192a56; }
            .client-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
            .client-card h3 { margin: 0 0 10px 0; color: #1e3a8a; font-size: 12px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; }
            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .details-table th { background-color: #3b82f6; color: white; padding: 10px; font-size: 10px; text-transform: uppercase; font-weight: bold; border: 1px solid #3b82f6; }
            .totals-section { display: flex; justify-content: flex-end; margin-bottom: 30px; }
            .totals-table { width: 250px; border-collapse: collapse; }
            .totals-table td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
            .totals-table .bold { font-weight: bold; color: #0f172a; }
            .totals-table .grand-total { background-color: #eff6ff; font-weight: bold; color: #1e3a8a; border-top: 2px solid #3b82f6; }
            .footer-notes { border-top: 1px solid #cbd5e1; padding-top: 15px; margin-top: 30px; font-size: 9px; color: #94a3b8; text-align: center; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="quote-header">
              <div>
                ${logoHtml}
                <div style="font-size: 11px; font-weight: bold; color: #0f172a; margin-top: 5px;">${emitterName}</div>
                <div style="font-size: 9px; color: #64748b; font-style: italic;">${emitterSlogan}</div>
                <div style="font-size: 9px; color: #64748b; margin-top: 2px;">${emitterRuc} | ${emitterPhone}</div>
                <div style="font-size: 9px; color: #64748b;">${emitterDir}</div>
              </div>
              <div class="meta-info">
                <h1 class="quote-title">Cotización</h1>
                <p style="margin: 5px 0 0 0;"><strong>Fecha Emisión:</strong> ${quoteDate}</p>
                <p style="margin: 2px 0 0 0;"><strong>Validez:</strong> ${quoteValidity}</p>
              </div>
            </div>

            <div class="client-card">
              <h3>Información del Cliente</h3>
              <table style="width: 100%; font-size: 11px;">
                <tr>
                  <td style="width: 15%; font-weight: bold; color: #64748b;">Empresa:</td>
                  <td style="width: 35%;">${client?.company || 'N/A'}</td>
                  <td style="width: 15%; font-weight: bold; color: #64748b;">Representante:</td>
                  <td style="width: 35%;">${client?.name || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; color: #64748b;">RUC:</td>
                  <td>${client?.ruc || 'N/A'}</td>
                  <td style="font-weight: bold; color: #64748b;">Email:</td>
                  <td>${client?.email || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; color: #64748b;">Teléfono:</td>
                  <td>${client?.phone || 'N/A'}</td>
                  <td style="font-weight: bold; color: #64748b;">Dirección:</td>
                  <td>${client?.address || 'Ecuador'}</td>
                </tr>
              </table>
            </div>

            <table class="details-table">
              <thead>
                <tr>
                  <th style="width: 8%; text-align: center;">#</th>
                  <th style="width: 52%; text-align: left;">Descripción del Servicio</th>
                  <th style="width: 10%; text-align: center;">Cant.</th>
                  <th style="width: 15%; text-align: right;">Prec. Unitario</th>
                  <th style="width: 15%; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals-section">
              <table class="totals-table">
                <tr>
                  <td>Subtotal 15%</td>
                  <td style="text-align: right; font-family: monospace;">$${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>IVA 15%</td>
                  <td style="text-align: right; font-family: monospace;">$${iva.toFixed(2)}</td>
                </tr>
                <tr class="grand-total">
                  <td class="bold">VALOR TOTAL</td>
                  <td style="text-align: right; font-family: monospace; font-weight: bold; font-size: 13px;">$${total.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <div style="font-size: 10px; background-color: #f8fafc; border-left: 3px solid #3b82f6; padding: 10px; border-radius: 4px; margin-top: 20px;">
              <strong>Condiciones de Pago:</strong> ${quotePaymentTerms}<br/>
              <strong>Notas:</strong> ${quoteNotes}
            </div>

            ${fiscalSettings.firmaElectronica ? `
              <div style="margin-top: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; page-break-inside: avoid;">
                <p style="margin: 0; font-size: 9px; color: #64748b; font-weight: bold; letter-spacing: 1px;">FIRMA AUTORIZADA / SELLO DIGITAL</p>
                <img src="${fiscalSettings.firmaElectronica}" style="max-height: 80px; max-width: 200px; object-fit: contain; margin-top: 5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;" />
                <p style="margin: 5px 0 0 0; font-size: 9px; color: #334155; font-weight: bold;">${emitterName}</p>
                <p style="margin: 2px 0 0 0; font-size: 8px; color: #64748b;">Firma Electrónica Validada SRI</p>
              </div>
            ` : ''}

            <div class="footer-notes">
              Esta cotización tiene fines exclusivamente comerciales y está sujeta a la aprobación de ambas partes.<br/>
              ${emitterName} • ${emitterSlogan}
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();

    // Log this action as an activity!
    const newAct = {
      id: 'act-quote-' + Date.now(),
      title: `Cotización Generada para ${client?.company || 'Cliente'}`,
      detail: `por un valor total de $${total.toFixed(2)}`,
      time: 'Hace un momento',
      author: currentUser?.name || 'Carlos Andrade',
      type: 'proposal',
      statusLabel: 'COTIZACIÓN',
      statusType: 'blue'
    };

    fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAct)
    }).then(() => fetchActivities()).catch(() => {
      setActivities(prev => [newAct, ...prev]);
    });
  };

  // Print and Export Invoice to PDF
  const handlePrintInvoice = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Por favor habilite las ventanas emergentes (popups) para poder imprimir la factura.");
      return;
    }

    const sub = invoice.subtotal;
    const iva = invoice.taxAmount;
    const tot = invoice.total;
    const client = clients.find(c => c.id === invoice.clientId);

    // Generar barras del código de barras SVG
    const bars: string[] = [];
    let position = 10;
    const accessKey = invoice.sriAccessKey || '0000000000000000000000000000000000000000000000000';
    for (let i = 0; i < accessKey.length; i++) {
      const digit = parseInt(accessKey[i]) || 0;
      const width = (digit % 3) + 1;
      const spacing = ((digit + 3) % 3) + 1;
      bars.push(`<rect x="${position}" y="5" width="${width}" height="35" fill="black" />`);
      position += width + spacing;
    }

    const barcodeSvgString = `
      <svg width="${position + 10}" height="50" viewBox="0 0 ${position + 10} 50" style="display: block; margin: 0 auto;">
        ${bars.join('')}
        <text x="50%" y="46" font-size="7" text-anchor="middle" font-family="monospace" fill="#000">${accessKey}</text>
      </svg>
    `;

    const itemsHtml = invoice.items.map((item, idx) => `
      <tr>
        <td style="border: 1px solid #475569; padding: 6px; font-family: monospace; text-align: center;">SERV-${String(idx + 1).padStart(3, '0')}</td>
        <td style="border: 1px solid #475569; padding: 6px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #475569; padding: 6px;">${item.description}</td>
        <td style="border: 1px solid #475569; padding: 6px; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
        <td style="border: 1px solid #475569; padding: 6px; text-align: right;">$0.00</td>
        <td style="border: 1px solid #475569; padding: 6px; text-align: right;">$${(item.quantity * item.unitPrice).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>RIDE Factura - ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; font-size: 10px; line-height: 1.3; color: #1e293b; margin: 20px; }
            .container { max-width: 750px; margin: 0 auto; position: relative; }
            .header-table { width: 100%; border-collapse: separate; border-spacing: 12px 0px; margin-bottom: 10px; }
            .header-cell { width: 50%; vertical-align: top; border: 1px solid #475569; padding: 12px; border-radius: 8px; background-color: #fff; }
            .logo-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 6px; letter-spacing: -0.5px; }
            .bold { font-weight: bold; color: #0f172a; }
            .info-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; border: 1px solid #475569; border-radius: 8px; overflow: hidden; background-color: #fff; }
            .info-table td { padding: 6px 10px; vertical-align: top; border: 1px solid #475569; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; background-color: #fff; }
            .items-table th { background-color: #f8fafc; border: 1px solid #475569; padding: 6px; font-weight: bold; font-size: 9px; color: #334155; text-align: left; }
            .bottom-table { width: 100%; border-collapse: separate; border-spacing: 12px 0px; margin-top: 5px; }
            .bottom-cell-left { width: 55%; vertical-align: top; border: 1px solid #475569; padding: 10px; border-radius: 8px; background-color: #fff; }
            .bottom-cell-right { width: 45%; vertical-align: top; border: 1px solid #475569; padding: 0; border-radius: 8px; background-color: #fff; overflow: hidden; }
            .totals-table { width: 100%; border-collapse: collapse; }
            .totals-table td { padding: 5px 8px; border: 1px solid #475569; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .watermark { position: absolute; top: 40%; left: 10%; right: 10%; text-align: center; font-size: 42px; color: rgba(239, 68, 68, 0.12); transform: rotate(-25deg); font-weight: 800; pointer-events: none; z-index: 100; letter-spacing: 2px; }
            h2 { margin: 0 0 5px 0; font-size: 13px; color: #1e3a8a; }
            p { margin: 0 0 4px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            ${invoice.status !== 'authorized' ? '<div class="watermark">BORRADOR<br>SIN VALOR TRIBUTARIO</div>' : ''}
            
            <table class="header-table" style="margin-left: -12px; width: calc(100% + 24px);">
              <tr>
                <td class="header-cell">
                  <div class="logo-title">ECU-CRM S.A.</div>
                  <p class="bold">ECU-CRM SISTEMAS TRIBUTARIOS S.A.</p>
                  <p><span class="bold">Dirección Matriz:</span> Av. de los Shyris N34-24 y Portugal, Edificio Shyris Park, Quito, Ecuador</p>
                  <p><span class="bold">Dirección Sucursal:</span> Sucursal Matriz, Quito, Pichincha</p>
                  <p><span class="bold">Contribuyente Especial Nro:</span> 0000</p>
                  <p><span class="bold">OBLIGADO A LLEVAR CONTABILIDAD:</span> SÍ</p>
                </td>
                <td class="header-cell">
                  <p style="font-size: 15px; font-weight: 800; margin: 0 0 4px 0; letter-spacing: -0.3px;">R.U.C.: 1792483759001</p>
                  <p style="font-size: 13px; font-weight: 800; margin: 0 0 6px 0; color: #1e3a8a; letter-spacing: 1px;">FACTURA</p>
                  <p><span class="bold">No.:</span> ${invoice.invoiceNumber}</p>
                  <p><span class="bold">NÚMERO DE AUTORIZACIÓN:</span></p>
                  <p style="font-size: 8px; font-family: monospace; word-break: break-all; margin-bottom: 6px;">${invoice.sriAccessKey || 'PENDIENTE DE AUTORIZACIÓN'}</p>
                  <p><span class="bold">FECHA Y HORA DE AUTORIZACIÓN:</span> ${invoice.sriAccessKey ? `${invoice.issueDate} 12:00:00 (Simulado)` : 'PENDIENTE'}</p>
                  <p><span class="bold">AMBIENTE:</span> ${invoice.sriAccessKey ? 'PRODUCCIÓN' : 'PRUEBAS'}</p>
                  <p><span class="bold">EMISIÓN:</span> NORMAL</p>
                  <p><span class="bold">CLAVE DE ACCESO:</span></p>
                  <div style="margin-top: 4px; padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px; background-color: #fafafa;">
                    ${barcodeSvgString}
                  </div>
                </td>
              </tr>
            </table>

            <table class="info-table" style="margin-top: 10px;">
              <tr>
                <td style="width: 60%;">
                  <p><span class="bold">Razón Social / Nombres y Apellidos:</span> ${invoice.clientName}</p>
                  <p><span class="bold">Identificación:</span> ${invoice.clientRuc}</p>
                  <p><span class="bold">Fecha Emisión:</span> ${invoice.issueDate}</p>
                </td>
                <td style="width: 40%;">
                  <p><span class="bold">Guía de Remisión:</span> S/N</p>
                  <p><span class="bold">Dirección:</span> ${client?.address || 'Quito, Ecuador'}</p>
                </td>
              </tr>
            </table>

            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 12%; text-align: center;">Cod. Principal</th>
                  <th style="width: 8%; text-align: center;">Cant.</th>
                  <th>Descripción</th>
                  <th style="width: 14%; text-align: right;">Precio Unitario</th>
                  <th style="width: 10%; text-align: right;">Descuento</th>
                  <th style="width: 15%; text-align: right;">Precio Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <table class="bottom-table" style="margin-left: -12px; width: calc(100% + 24px);">
              <tr>
                <td class="bottom-cell-left">
                  <p class="bold" style="border-bottom: 1px solid #475569; padding-bottom: 3px; margin-bottom: 5px; font-size: 11px;">Información Adicional</p>
                  <p><span class="bold">Email:</span> ${client?.email || 'N/A'}</p>
                  <p><span class="bold">Teléfono:</span> ${client?.phone || 'N/A'}</p>
                  <p><span class="bold">Dirección:</span> ${client?.address || 'Quito, Ecuador'}</p>
                  <p><span class="bold">Forma de Pago:</span> OTROS CON UTILIZACIÓN DEL SISTEMA FINANCIERO - $${tot.toFixed(2)}</p>
                </td>
                <td class="bottom-cell-right">
                  <table class="totals-table">
                    <tr>
                      <td class="bold">SUBTOTAL 15%</td>
                      <td class="text-right">$${sub.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>SUBTOTAL 0%</td>
                      <td class="text-right">$0.00</td>
                    </tr>
                    <tr>
                      <td>SUBTOTAL No sujeto de IVA</td>
                      <td class="text-right">$0.00</td>
                    </tr>
                    <tr>
                      <td>SUBTOTAL SIN IMPUESTOS</td>
                      <td class="text-right">$${sub.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>TOTAL DESCUENTO</td>
                      <td class="text-right">$0.00</td>
                    </tr>
                    <tr>
                      <td class="bold">IVA 15%</td>
                      <td class="text-right">$${iva.toFixed(2)}</td>
                    </tr>
                    <tr style="background-color: #f1f5f9; font-weight: 800; font-size: 11px;">
                      <td class="bold">VALOR TOTAL</td>
                      <td class="text-right bold">$${tot.toFixed(2)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!currentUser || !token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* SideNavBar - Persistent on Desktop */}
      <aside className="hidden md:flex flex-col h-screen sticky left-0 top-0 py-6 gap-6 bg-white border-r border-slate-200 w-64 shrink-0 z-40">
        <div className="px-6 mb-2 flex items-center gap-3">
          {logoUrl ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shadow-xs">
              <img src={logoUrl} alt="Logo Corporativo" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl font-display shadow-md shadow-blue-500/10">
              E
            </div>
          )}
          <div className="flex flex-col">
            <h2 className="font-display text-lg font-bold text-slate-900 leading-none">ECU-CRM</h2>
            <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">Admin v1.2 • Ecuador</span>
          </div>
        </div>



        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-blue-700 bg-blue-50 border-r-4 border-blue-600 translate-x-0.5'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('clientes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'clientes'
                ? 'text-blue-700 bg-blue-50 border-r-4 border-blue-600 translate-x-0.5'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Clientes ({clients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cotizador')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'cotizador'
                ? 'text-blue-700 bg-blue-50 border-r-4 border-blue-600 translate-x-0.5'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Cotizador</span>
          </button>

          <button
            onClick={() => setActiveTab('productos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'productos'
                ? 'text-blue-700 bg-blue-50 border-r-4 border-blue-600 translate-x-0.5'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Productos / Catálogo</span>
          </button>

          {(currentUser.role === 'Gerente Comercial' || currentUser.role === 'Administrador') && (
            <>
              <button
                onClick={() => setActiveTab('proyectos')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'proyectos'
                    ? 'text-blue-700 bg-blue-50 border-r-4 border-blue-600 translate-x-0.5'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                <span>Proyectos Activos ({projects.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('facturacion')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'facturacion'
                    ? 'text-blue-700 bg-blue-50 border-r-4 border-blue-600 translate-x-0.5'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-5 h-5" />
                <span>Facturación & SRI ({invoices.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('usuarios')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'usuarios'
                    ? 'text-blue-700 bg-blue-50 border-r-4 border-blue-600 translate-x-0.5'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                <span>Accesos y Roles ({users.length})</span>
              </button>
            </>
          )}
        </nav>

        <div className="mt-auto px-3 border-t border-slate-100 pt-4 space-y-1">
          {(currentUser.role === 'Gerente Comercial' || currentUser.role === 'Administrador') && (
            <button
              onClick={() => setActiveTab('ajustes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'ajustes'
                  ? 'text-blue-700 bg-blue-50 border-r-4 border-blue-600 translate-x-0.5'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Ajustes del Sistema</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>

          <div className="pt-3 pb-1 text-center border-t border-slate-100/50 mt-2">
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              Creado por sirek.online
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        
        {/* TopNavBar Header */}
        <header className="flex justify-between items-center w-full px-6 md:px-8 h-16 sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar clientes, facturas o proyectos..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'clientes' && activeTab !== 'proyectos' && activeTab !== 'facturacion') {
                    setActiveTab('clientes');
                  }
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-0 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-4">
            <button className="relative text-slate-500 hover:text-blue-600 transition-colors p-1 cursor-pointer font-bold text-xs flex items-center gap-1" title="Localización">
              <span>EC 🇪🇨</span>
            </button>
            <button
              onClick={() => {
                setTheme(prev => prev === 'light' ? 'dark' : 'light');
                playClickSound();
              }}
              className="text-slate-500 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100/50 cursor-pointer flex items-center justify-center outline-none"
              title={theme === 'light' ? "Activar Modo Oscuro" : "Activar Modo Claro"}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
            </button>

            <button 
              className="text-slate-500 hover:text-blue-600 transition-colors p-1 cursor-pointer" 
              title="Ayuda / SRI Guía" 
              onClick={() => alert("ECU-CRM Ayuda:\n\n1. Todos los RUC/Cédula deben pasar validación ecuatoriana.\n2. La facturación electrónica aplica el 15% de IVA automáticamente.\n3. La firma digital y autorización con el SRI se simula con claves válidas de 49 dígitos.")}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            
            <div className="h-8 w-[1px] bg-slate-200"></div>

            <button
              onClick={() => setActiveTab('perfil')}
              className="flex items-center gap-3 cursor-pointer group text-left outline-none"
            >
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-sm text-slate-900 leading-none group-hover:text-blue-650 transition-colors">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">{currentUser.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-blue-100 flex items-center justify-center text-blue-700 font-bold group-hover:border-blue-500 transition-colors">
                {currentUser.avatarUrl ? (
                  <img
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    src={currentUser.avatarUrl}
                  />
                ) : (
                  currentUser.name.substring(0, 2).toUpperCase()
                )}
              </div>
            </button>
          </div>
        </header>

        {/* Dynamic Canvas Container */}
        <div className="p-6 md:p-8 flex-1">
          
          {/* VIEW 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h1 className="font-display text-3xl font-semibold text-slate-900">Panel de Control</h1>
                <p className="text-slate-500 mt-1">Bienvenido al sistema ECU-CRM. Resumen comercial y estado del SRI.</p>
              </div>

              {/* Bento Grid Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div 
                  onClick={() => setActiveTab('clientes')}
                  className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between group hover:shadow-md hover:border-blue-300 transition-all cursor-pointer min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Clientes Activos</p>
                    <p className="font-display text-2xl xl:text-3xl font-bold text-blue-600 mt-2 truncate">{clients.length}</p>
                    <p className="text-xs text-emerald-700 mt-3 flex items-center gap-1 font-semibold truncate">
                      <TrendingUp className="w-3.5 h-3.5 shrink-0" /> +12% este mes
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-full text-blue-600 group-hover:scale-105 transition-transform shrink-0 ml-3">
                    <Users className="w-7 h-7" />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('proyectos')}
                  className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between group hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Proyectos en Marcha</p>
                    <p className="font-display text-2xl xl:text-3xl font-bold text-indigo-600 mt-2 truncate">
                      {projects.filter(p => p.status === 'ongoing').length} / {projects.length}
                    </p>
                    <p className="text-xs text-slate-500 mt-3 flex items-center gap-1 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Tareas interactivas
                    </p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-full text-indigo-600 group-hover:scale-105 transition-transform shrink-0 ml-3">
                    <Briefcase className="w-7 h-7" />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('facturacion')}
                  className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between group hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Facturado (IVA 15%)</p>
                    <p className="font-display text-2xl xl:text-3xl font-bold text-emerald-700 mt-2 truncate" title={`$${invoices.reduce((sum, inv) => inv.status === 'authorized' ? sum + inv.total : sum, 0).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                      ${invoices.reduce((sum, inv) => inv.status === 'authorized' ? sum + inv.total : sum, 0).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-emerald-700 mt-3 flex items-center gap-1 font-semibold truncate">
                      <Check className="w-3.5 h-3.5 shrink-0" /> SRI Autorizado
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-full text-emerald-600 group-hover:scale-105 transition-transform shrink-0 ml-3">
                    <DollarSign className="w-7 h-7" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between group hover:shadow-md hover:border-orange-300 transition-all min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Pendiente Autorizar</p>
                    <p className="font-display text-2xl xl:text-3xl font-bold text-orange-700 mt-2 truncate" title={`${invoices.filter(i => i.status !== 'authorized').length} comprobantes pendientes`}>
                      {invoices.filter(i => i.status !== 'authorized').length}
                      <span className="text-xs font-semibold text-slate-400 ml-1.5 inline-block align-baseline font-sans">docs</span>
                    </p>
                    <p className="text-xs text-orange-700 mt-3 flex items-center gap-1 font-semibold animate-pulse truncate">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Firma digital
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-full text-orange-700 group-hover:scale-105 transition-transform shrink-0 ml-3">
                    <FileText className="w-7 h-7" />
                  </div>
                </div>
              </div>

              {/* Layout: Chart & Activity logs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Side: Recent Activity list */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-slate-900">Bitácora de Actividades</h3>
                      <button 
                        onClick={() => setActiveTab('clientes')} 
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Ver todos los clientes
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {activities.slice(0, 5).map((act) => (
                        <div key={act.id} className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            act.type === 'register' ? 'bg-amber-100 text-amber-800' :
                            act.type === 'payment' ? 'bg-emerald-100 text-emerald-800' :
                            act.type === 'proposal' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {act.type === 'register' && <UserPlus className="w-5 h-5" />}
                            {act.type === 'payment' && <Receipt className="w-5 h-5" />}
                            {act.type === 'proposal' && <FileText className="w-5 h-5" />}
                            {act.type === 'complete' && <CheckCircle2 className="w-5 h-5" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-950 truncate">
                              <strong>{act.title}</strong> {act.detail}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{act.time} • Responsable: {act.author}</p>
                          </div>

                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full shrink-0 ${
                            act.statusType === 'orange' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                            act.statusType === 'green' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            act.statusType === 'blue' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-slate-55 text-slate-700 border border-slate-200'
                          }`}>
                            {act.statusLabel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SRI Quick Info Alert */}
                  <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-[#ffffff] p-6 rounded-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6 shadow-md">
                    <div className="p-4 bg-white/10 rounded-xl">
                      <Sparkles className="w-8 h-8 text-yellow-300" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="font-display font-bold text-lg text-[#ffffff]">Facturación Electrónica Ecuatoriana</h4>
                      <p className="text-[#f8fafc] text-sm mt-1">Recuerde que a partir de 2024, el SRI exige facturación electrónica obligatoria para casi todo contribuyente. Este sistema calcula el IVA al 15% automáticamente.</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('facturacion')}
                      className="px-5 py-2.5 bg-[#ffffff] text-[#1e3a8a] hover:bg-[#f1f5f9] active:scale-95 duration-100 font-semibold text-sm rounded-lg transition-all shadow-sm cursor-pointer shrink-0"
                    >
                      Emitir Comprobante
                    </button>
                  </div>
                </div>

                {/* Right Side: Distribution Summary Card */}
                <div className="space-y-6">
                  
                  {/* Status distribution */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">Embudo de Clientes</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="font-medium text-slate-700 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                            Contacto Inicial
                          </span>
                          <span className="font-bold text-slate-900">{statusCounts.prospectos}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${statusCounts.prospectos}%` }}></div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">Total: {statusCounts.rawInitial} clientes</span>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="font-medium text-slate-700 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                            En Desarrollo / Negociación
                          </span>
                          <span className="font-bold text-slate-900">{statusCounts.negociacion}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${statusCounts.negociacion}%` }}></div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">Total: {statusCounts.rawDev} clientes</span>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="font-medium text-slate-700 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                            Finalizados / Fidelizados
                          </span>
                          <span className="font-bold text-slate-900">{statusCounts.fidelizados}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${statusCounts.fidelizados}%` }}></div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">Total: {statusCounts.rawFinished} clientes</span>
                      </div>
                    </div>
                  </div>

                  {/* Regional goals */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Meta Comercial Anual</h3>
                    
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold inline-block py-1 px-2.5 uppercase rounded-full text-emerald-800 bg-emerald-100">
                            SRI Facturación Q2
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700">
                            $84,000 / $100,000
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-4 text-xs flex rounded-full bg-emerald-50">
                        <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-600 transition-all duration-500" style={{ width: '84%' }}></div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">La proyección indica que alcanzará la meta mensual al finalizar el periodo fiscal actual.</p>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* VIEW 2: CLIENTS SCREEN (MANAGEMENT & DETAIL) */}
          {activeTab === 'clientes' && (
            <div className="space-y-8">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-slate-900">Gestión de Clientes</h2>
                  <p className="text-slate-500 mt-1">Filtre, registre y haga seguimiento a su cartera en Ecuador.</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setActiveTab('nuevo-cliente')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-sm shadow-blue-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Cliente</span>
                  </button>
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white hover:bg-slate-55 transition-colors cursor-pointer"
                  >
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span>Filtros {showAdvancedFilters ? 'Ocultar' : 'Avanzados'}</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white hover:bg-slate-55 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-400" />
                    <span>Exportar CSV</span>
                  </button>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col shadow-sm">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Clientes</span>
                  <span className="font-display text-2xl font-bold text-blue-600 mt-1">{clients.length}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col border-l-4 border-l-orange-500 shadow-sm">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Contacto Inicial</span>
                  <span className="font-display text-2xl font-bold text-slate-800 mt-1">
                    {clients.filter(c => c.status === 'initial').length}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col border-l-4 border-l-blue-600 shadow-sm">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">En Desarrollo</span>
                  <span className="font-display text-2xl font-bold text-slate-800 mt-1">
                    {clients.filter(c => c.status === 'development').length}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col border-l-4 border-l-emerald-600 shadow-sm">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Facturados</span>
                  <span className="font-display text-2xl font-bold text-emerald-650 mt-1">
                    {clients.filter(c => c.status === 'billed').length}
                  </span>
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="bg-white border border-slate-200 p-5 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm animate-slide-up">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Filtrar por Estado</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700 outline-none"
                    >
                      <option value="all">Ver Todos los Estados</option>
                      <option value="initial">Contacto Inicial</option>
                      <option value="development">En Desarrollo</option>
                      <option value="billed">Facturado</option>
                      <option value="finished">Finalizado</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Filtrar por Ciudad</label>
                    <select
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700 outline-none"
                    >
                      <option value="all">Ver Todas las Ciudades</option>
                      <option value="Quito">Quito</option>
                      <option value="Guayaquil">Guayaquil</option>
                      <option value="Cuenca">Cuenca</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Filtrar por RUC (Mínimo)</label>
                    <input
                      type="number"
                      placeholder="Ingrese RUC umbral..."
                      value={minInvoicedFilter}
                      onChange={(e) => setMinInvoicedFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700 outline-none"
                    />
                  </div>

                  <div className="md:col-span-3 flex justify-end">
                    <button 
                      onClick={() => {
                        setStatusFilter('all');
                        setCityFilter('all');
                        setMinInvoicedFilter('');
                        setSearchQuery('');
                      }} 
                      className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                    >
                      Limpiar todos los filtros
                    </button>
                  </div>
                </div>
              )}

              {/* Master-Detail Split Screen Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Client Table Listing */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cliente / RUC</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Servicio</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Estado</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedClients.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-12 text-slate-500">
                              No se encontraron clientes con los filtros seleccionados.
                            </td>
                          </tr>
                        ) : (
                          paginatedClients.map((client) => {
                            const statInfo = getStatusInfo(client.status);
                            const isSelected = selectedClientId === client.id;
                            return (
                              <tr 
                                key={client.id}
                                onClick={() => setSelectedClientId(client.id)}
                                className={`hover:bg-blue-50/20 transition-colors cursor-pointer group ${
                                  isSelected ? 'bg-blue-50/50' : ''
                                }`}
                              >
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${
                                      client.status === 'initial' ? 'bg-orange-500' :
                                      client.status === 'development' ? 'bg-blue-600' :
                                      client.status === 'billed' ? 'bg-emerald-600' : 'bg-slate-650'
                                    }`}>
                                      {client.initials}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-sm text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                                        {client.name}
                                      </p>
                                      <p className="text-xs text-slate-400 truncate mt-0.5">{client.company} • RUC: {client.ruc}</p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-6 py-5 text-sm text-slate-700 font-medium hidden sm:table-cell">
                                  {client.serviceType}
                                </td>

                                <td className="px-6 py-5">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statInfo?.badgeClass}`}>
                                    {statInfo?.label}
                                  </span>
                                </td>

                                <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => setSelectedClientId(client.id)}
                                      className="p-1 px-2 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-650 hover:text-blue-700 cursor-pointer"
                                    >
                                      Detalle
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteClient(client.id, client.name)}
                                      className="p-1 text-slate-400 hover:text-red-650 rounded transition-colors cursor-pointer"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="w-4.5 h-4.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Pagination */}
                  <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">
                      Mostrando {Math.min(filteredClients.length, (currentPage - 1) * itemsPerPage + 1)}-
                      {Math.min(filteredClients.length, currentPage * itemsPerPage)} de {filteredClients.length} clientes
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`w-8 h-8 flex items-center justify-center rounded text-xs font-semibold cursor-pointer ${
                            currentPage === p ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 border border-slate-100'
                          }`}
                        >
                          {p}
                        </button>
                      ))}

                      <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Client Profile Details */}
                <div className="lg:col-span-5 space-y-6">
                  {currentClientDetail ? (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ficha del Cliente</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg ${
                              currentClientDetail.status === 'initial' ? 'bg-orange-500' :
                              currentClientDetail.status === 'development' ? 'bg-blue-600' :
                              currentClientDetail.status === 'billed' ? 'bg-emerald-600' : 'bg-slate-650'
                            }`}>
                              {currentClientDetail.initials}
                            </div>
                            <div>
                              <h4 className="font-display font-bold text-lg text-slate-900 leading-tight truncate max-w-[180px]">{currentClientDetail.name}</h4>
                              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">{currentClientDetail.company}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${getStatusInfo(currentClientDetail.status)?.badgeClass}`}>
                              {getFriendlyStatus(currentClientDetail.status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openEditModal(currentClientDetail)}
                            className="flex-1 py-2 px-3 border border-blue-650 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Editar Datos
                          </button>
                          <select 
                            value={currentClientDetail.status}
                            onChange={(e) => handleChangeStatus(e.target.value as ClientStatus)}
                            className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-xs font-semibold outline-none cursor-pointer"
                          >
                            <option value="initial">➔ Contacto Inicial</option>
                            <option value="development">➔ En Desarrollo</option>
                            <option value="billed">➔ Facturado</option>
                            <option value="finished">➔ Finalizado</option>
                          </select>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Correo Electrónico</p>
                              <a href={`mailto:${currentClientDetail.email}`} className="text-sm text-blue-600 hover:underline">{currentClientDetail.email}</a>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp</p>
                              <p className="text-sm text-slate-800 font-medium">{currentClientDetail.phone}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Ubicación</p>
                              <p className="text-sm text-slate-800 font-medium">{currentClientDetail.city}, Ecuador</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Identificación RUC / SRI</p>
                              <p className="text-sm font-mono text-slate-850">{currentClientDetail.ruc}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Notas Iniciales</p>
                              <p className="text-xs text-slate-650 mt-1 italic">{currentClientDetail.notes || 'Ninguna nota inicial registrada.'}</p>
                            </div>
                          </div>

                          {currentClientDetail.address && (
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
                              <p className="font-bold text-slate-450 uppercase">Dirección Física</p>
                              <p className="text-slate-700">{currentClientDetail.address}</p>
                            </div>
                          )}
                        </div>

                        {/* Timeline Note */}
                        <div className="border-t border-slate-100 pt-6 space-y-4">
                          <div className="flex justify-between items-center mb-1">
                            <h5 className="font-display font-bold text-sm text-slate-800">Bitácora de Seguimiento</h5>
                            <span className="text-[11px] text-slate-450">{currentClientDetail.timeline.length} eventos</span>
                          </div>

                          <form onSubmit={handleAddNote} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Añadir nota rápida..."
                              value={newNoteContent}
                              onChange={(e) => setNewNoteContent(e.target.value)}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                            <select 
                              value={newNoteType}
                              onChange={(e) => setNewNoteType(e.target.value as 'note' | 'status' | 'call')}
                              className="bg-slate-55 border border-slate-200 rounded-lg text-xs p-1 text-slate-700 outline-none"
                            >
                              <option value="note">✏️ Nota</option>
                              <option value="call">📞 Llamar</option>
                            </select>
                            <button 
                              type="submit"
                              className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
                              title="Guardar"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </form>

                          <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                            {currentClientDetail.timeline.map((event) => (
                              <div key={event.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                                    event.type === 'note' ? 'bg-blue-50 text-blue-700' :
                                    event.type === 'status' ? 'bg-orange-50 text-orange-700' :
                                    'bg-emerald-50 text-emerald-700'
                                  }`}>
                                    {event.type === 'note' ? 'Nota' : event.type === 'status' ? 'Estado' : 'Llamada'}
                                  </span>
                                  <span className="text-[10px] text-slate-400">{event.date}</span>
                                </div>
                                <h6 className="font-bold text-xs text-slate-800">{event.title}</h6>
                                <p className="text-xs text-slate-600 leading-relaxed">{event.content}</p>
                                {event.addedBy && (
                                  <p className="text-[9px] text-slate-450 italic text-right">Por: {event.addedBy}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-500">
                      Seleccione un cliente para ver su perfil.
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* VIEW 3: NUEVO CLIENTE */}
          {activeTab === 'nuevo-cliente' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div>
                <h2 className="font-display text-3xl font-semibold text-slate-900">Registrar Cliente</h2>
                <p className="text-slate-500 mt-2">Añada un prospecto a la cartera. El identificador será validado con las reglas tributarias de Ecuador.</p>
              </div>

              {formSuccessMessage && (
                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-3 animate-slide-up">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h5 className="font-bold">¡Guardado con éxito!</h5>
                    <p className="text-sm">El nuevo cliente ha sido agregado a la base de datos del sistema.</p>
                  </div>
                </div>
              )}

              {formValidationErrors.length > 0 && (
                <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl space-y-1 animate-slide-up">
                  <h5 className="font-bold">Se encontraron errores en el formulario:</h5>
                  <ul className="list-disc list-inside text-xs pl-2 space-y-0.5">
                    {formValidationErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSaveClient} className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-8">
                
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-slate-100">
                  <div className="md:col-span-4">
                    <h3 className="font-display font-semibold text-blue-700 text-sm uppercase tracking-wider">Identificación y Nombres</h3>
                    <p className="text-xs text-slate-400 mt-1">El documento ingresado se verificará contra el formato oficial ecuatoriano.</p>
                  </div>
                  <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500">Nombres <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={formNames}
                        onChange={(e) => setFormNames(e.target.value)}
                        placeholder="Ej: Roberto Carlos"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500">Apellidos <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={formSurname}
                        onChange={(e) => setFormSurname(e.target.value)}
                        placeholder="Ej: Martínez Rosales"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500">Identificación Ecuatoriana (Cédula o RUC) <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={formIdNumber}
                        onChange={(e) => setFormIdNumber(e.target.value)}
                        placeholder="Ej: 1729483759001 o 1729483759"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-slate-100">
                  <div className="md:col-span-4">
                    <h3 className="font-display font-semibold text-blue-700 text-sm uppercase tracking-wider">Contacto</h3>
                    <p className="text-xs text-slate-400 mt-1">Medios de comunicación directa.</p>
                  </div>
                  <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500">Correo Electrónico <span className="text-red-500">*</span></label>
                      <input 
                        type="email" 
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="ejemplo@empresa.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500">WhatsApp <span className="text-red-500">*</span></label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 text-slate-500 text-xs rounded-l-lg font-semibold">+593</span>
                        <input 
                          type="text" 
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="0987654321"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-r-lg px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500">Ciudad</label>
                      <select 
                        value={formCity} 
                        onChange={(e) => setFormCity(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                      >
                        <option value="Quito">Quito</option>
                        <option value="Guayaquil">Guayaquil</option>
                        <option value="Cuenca">Cuenca</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500">Dirección Física Completa</label>
                      <textarea 
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        placeholder="Calle Principal y Secundaria, Edificio..."
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6">
                  <div className="md:col-span-4">
                    <h3 className="font-display font-semibold text-blue-700 text-sm uppercase tracking-wider">Requerimiento</h3>
                    <p className="text-xs text-slate-400 mt-1">Tipo de consultoría inicial y notas explicativas.</p>
                  </div>
                  <div className="md:col-span-8 grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500">Tipo de Servicio Solicitado <span className="text-red-500">*</span></label>
                      <select 
                        value={formServiceType}
                        onChange={(e) => setFormServiceType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                      >
                        <option value="">Seleccione una opción...</option>
                        <option value="Consultoría Fiscal">Consultoría Fiscal & Contable</option>
                        <option value="Auditoría IT">Auditoría IT & Cyberseguridad</option>
                        <option value="Gestión de Nómina">Gestión de Nómina Electrónica</option>
                        <option value="Asesoría Legal Corporate">Asesoría Legal Corporate</option>
                        <option value="Marketing Digital">Estrategia & Marketing Digital</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500">Antecedentes o Notas Internas</label>
                      <textarea 
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        placeholder="Detalle los objetivos del cliente o plazos comerciales..."
                        rows={4}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('clientes')}
                    className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm shadow-blue-200 transition-all cursor-pointer"
                  >
                    Guardar Cliente
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW 4: PROYECTOS ACTIVOS */}
          {activeTab === 'proyectos' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-slate-900">Proyectos Activos</h2>
                  <p className="text-slate-500 mt-1">Monitoree las tareas y avances de los proyectos contratados.</p>
                </div>
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95 duration-100 shadow-sm cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Crear Proyecto
                </button>
              </div>

              {/* Kanban Board of Projects */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* 1. PLANIFICACIÓN */}
                <div className="bg-slate-100/80 p-4 rounded-xl space-y-4 border border-slate-200">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Planificación</span>
                    <span className="px-2 py-0.5 bg-slate-250 text-slate-600 rounded-full text-[10px] font-bold">
                      {projects.filter(p => p.status === 'planning').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {projects.filter(p => p.status === 'planning').map(project => (
                      <ProjectCard key={project.id} project={project} onSelect={setSelectedProjectId} onToggleTask={handleToggleTask} onChangeStatus={handleUpdateProjectStatus} />
                    ))}
                  </div>
                </div>

                {/* 2. EN MARCHA */}
                <div className="bg-blue-50/50 p-4 rounded-xl space-y-4 border border-blue-100">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">En Marcha</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">
                      {projects.filter(p => p.status === 'ongoing').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {projects.filter(p => p.status === 'ongoing').map(project => (
                      <ProjectCard key={project.id} project={project} onSelect={setSelectedProjectId} onToggleTask={handleToggleTask} onChangeStatus={handleUpdateProjectStatus} />
                    ))}
                  </div>
                </div>

                {/* 3. EN PRUEBAS */}
                <div className="bg-purple-50/50 p-4 rounded-xl space-y-4 border border-purple-100">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Pruebas / QA</span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[10px] font-bold">
                      {projects.filter(p => p.status === 'testing').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {projects.filter(p => p.status === 'testing').map(project => (
                      <ProjectCard key={project.id} project={project} onSelect={setSelectedProjectId} onToggleTask={handleToggleTask} onChangeStatus={handleUpdateProjectStatus} />
                    ))}
                  </div>
                </div>

                {/* 4. COMPLETADO */}
                <div className="bg-emerald-50/50 p-4 rounded-xl space-y-4 border border-emerald-100">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Completados</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                      {projects.filter(p => p.status === 'completed').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {projects.filter(p => p.status === 'completed').map(project => (
                      <ProjectCard key={project.id} project={project} onSelect={setSelectedProjectId} onToggleTask={handleToggleTask} onChangeStatus={handleUpdateProjectStatus} />
                    ))}
                  </div>
                </div>

              </div>

              {/* Selected Project Detailed View */}
              {selectedProjectId && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-slide-up space-y-6">
                  {(() => {
                    const project = projects.find(p => p.id === selectedProjectId);
                    if (!project) return null;
                    return (
                      <>
                        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Detalle del Proyecto</span>
                            <h3 className="font-display font-bold text-2xl text-slate-900 mt-2">{project.name}</h3>
                            <p className="text-sm text-slate-500 mt-1">{project.clientName} • Presupuesto: ${project.budget.toLocaleString('es-EC')}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <select 
                              value={project.status}
                              onChange={(e) => handleUpdateProjectStatus(project.id, e.target.value as Project['status'])}
                              className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 cursor-pointer"
                            >
                              <option value="planning">➔ Planificación</option>
                              <option value="ongoing">➔ En Marcha</option>
                              <option value="testing">➔ Pruebas / QA</option>
                              <option value="completed">➔ Completado</option>
                            </select>
                            <button 
                              onClick={() => setSelectedProjectId(null)}
                              className="px-3 py-1.5 bg-slate-150 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                            >
                              Cerrar detalle
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Left: tasks */}
                          <div className="space-y-4">
                            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4.5 h-4.5 text-indigo-500" />
                              Hitos y Tareas del Proyecto
                            </h4>
                            <p className="text-xs text-slate-500">Marque las tareas completadas para incrementar el progreso general del proyecto de manera dinámica.</p>
                            
                            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
                              {project.tasks.map(task => (
                                <label key={task.id} className="flex items-start gap-3 p-2 bg-white rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors select-none cursor-pointer">
                                  <input 
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => handleToggleTask(project.id, task.id)}
                                    className="rounded border-slate-300 text-indigo-650 focus:ring-0 mt-0.5"
                                  />
                                  <span className={`text-xs ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                    {task.title}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Right: info */}
                          <div className="space-y-4">
                            <h4 className="font-bold text-sm text-slate-800">Descripción General</h4>
                            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-150">
                              {project.description || 'Sin descripción adicional para este proyecto comercial.'}
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Fecha Inicio</span>
                                <p className="text-xs font-semibold text-slate-800 mt-1">{project.startDate}</p>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Fecha Entrega</span>
                                <p className="text-xs font-semibold text-slate-800 mt-1">{project.endDate}</p>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Asignado a</span>
                                <p className="text-xs font-semibold text-slate-800 mt-1 truncate">{project.assignedTo}</p>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Progreso</span>
                                <p className="text-xs font-bold text-indigo-700 mt-1">{project.progress}%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

            </div>
          )}

          {/* VIEW 5: FACTURACIÓN & SRI */}
          {activeTab === 'facturacion' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-slate-900">Facturación & SRI</h2>
                  <p className="text-slate-500 mt-1">Emisión de facturas electrónicas con cálculo de IVA al 15% y firma del SRI.</p>
                </div>
                
                {/* Sub-tab selection */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button 
                    onClick={() => setFacturacionSubTab('list')}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${facturacionSubTab === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Historial de Facturas
                  </button>
                  <button 
                    onClick={() => setFacturacionSubTab('scan')}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${facturacionSubTab === 'scan' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Escanear Comprobante
                  </button>
                </div>
              </div>

              {/* SUBTAB 1: LIST OF INVOICES */}
              {facturacionSubTab === 'list' && (
                <div className="space-y-6 animate-slide-up">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-sm font-semibold text-slate-700">Listado histórico de ventas</span>
                    <button
                      onClick={() => setIsInvoiceModalOpen(true)}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Emitir Factura Manual
                    </button>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-150">
                      <h3 className="font-bold text-slate-850">Historial de Comprobantes Autorizados</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nº Factura</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cliente / RUC</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fecha Emisión</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total (15% IVA)</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado SRI</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Firma / Autorización</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 text-sm">
                          {invoices.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-12 text-slate-500">
                                Ninguna factura emitida en el historial local.
                              </td>
                            </tr>
                          ) : (
                            invoices.map((inv) => (
                              <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono font-bold text-slate-900">
                                  {inv.invoiceNumber}
                                </td>
                                <td className="px-6 py-4">
                                  <p className="font-semibold text-slate-950">{inv.clientName}</p>
                                  <span className="text-xs text-slate-400 font-mono">RUC: {inv.clientRuc}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-650">
                                  {inv.issueDate}
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-900">
                                  ${inv.total.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2.5 py-1 text-[9px] font-extrabold rounded-full ${
                                    inv.status === 'authorized' ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' :
                                    inv.status === 'pending' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                                    'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}>
                                    {inv.status === 'authorized' ? 'AUTORIZADO SRI' :
                                     inv.status === 'pending' ? 'PENDIENTE AUTORIZAR' : 'BORRADOR'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {inv.status !== 'authorized' ? (
                                    <div className="flex justify-end gap-2 items-center">
                                      <button
                                        onClick={() => setSelectedInvoiceForView(inv)}
                                        className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1"
                                      >
                                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                                        Ver PDF
                                      </button>
                                      <button
                                        onClick={() => handleAuthorizeSRI(inv.id)}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
                                      >
                                        Autorizar SRI
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex justify-end gap-3 items-center">
                                      <button
                                        onClick={() => alert(`Información SRI Ecuador:\n\nClave de Acceso (49 dígitos):\n${inv.sriAccessKey}\n\nMensaje SRI:\n${inv.sriMessage}`)}
                                        className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                                      >
                                        Ver Clave Acceso
                                      </button>
                                      <button
                                        onClick={() => setSelectedInvoiceForView(inv)}
                                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                                      >
                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                        Ver PDF
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: SCAN RECEIPT DROPAREA & PROCESSOR */}
              {facturacionSubTab === 'scan' && (
                <div className="space-y-8 animate-slide-up">
                  
                  {/* Dropzone Card */}
                  {!extractedData && !isAnalyzing && (
                    <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center relative hover:border-blue-500 transition-colors group">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform mb-4 border border-slate-100">
                        <Upload className="w-8 h-8 text-slate-500" />
                      </div>
                      <h3 className="font-bold text-slate-800 text-base mb-1">Subir Comprobante de Pago</h3>
                      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
                        Sube la captura de pantalla de la transferencia o comprobante de tu banca móvil (Banco Pichincha, Guayaquil, etc.). Nuestro motor de IA extraerá los datos automáticamente.
                      </p>
                      <div className="mb-6 text-[10px] text-slate-400 max-w-md bg-slate-50 p-2 rounded-lg border border-slate-200/60 flex items-center justify-center gap-1">
                        <span className="font-bold text-blue-600">Tip de simulación:</span> Si no usas API Key, renombra el archivo como <code className="bg-slate-200/80 text-slate-700 px-1 py-0.5 rounded font-mono font-bold">banco_pichincha-juan_perez-250.jpg</code> para extraer esos datos.
                      </div>
                      
                      <label className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm cursor-pointer transition-all active:scale-95">
                        Seleccionar Archivo
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleReceiptUpload} 
                          className="hidden" 
                        />
                      </label>
                      <span className="text-[10px] text-slate-400 mt-3">Formatos admitidos: PNG, JPG, JPEG, WebP</span>
                    </div>
                  )}

                  {/* Loading State */}
                  {isAnalyzing && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-sm animate-pulse">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">Procesando Comprobante con IA...</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs">Gemini está analizando los textos del comprobante para extraer nombres, identificaciones y montos del depósito.</p>
                      </div>
                    </div>
                  )}

                  {ocrErrorMsg && (
                    <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl flex items-center gap-3 animate-slide-up">
                      <AlertCircle className="w-5 h-5 text-red-650 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-bold">No se pudo procesar la imagen</p>
                        <p className="text-xs mt-0.5">{ocrErrorMsg}</p>
                      </div>
                      <button 
                        onClick={() => setOcrErrorMsg('')}
                        className="text-xs text-slate-400 hover:text-slate-655 cursor-pointer font-bold"
                      >
                        Intentar de nuevo
                      </button>
                    </div>
                  )}

                  {/* Extracted Prefilled Review Form */}
                  {extractedData && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-slide-up">
                      
                      {/* Left: Prefilled fields form */}
                      <form onSubmit={handleOcrEmitInvoice} className="lg:col-span-8 bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                        <div className="border-b border-slate-105 pb-3 flex justify-between items-center">
                          <h3 className="font-display font-bold text-lg text-slate-900">Revisión de Datos del Comprobante</h3>
                          <span className="text-[10px] bg-indigo-50 text-indigo-755 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Verificado por IA</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-500">Nombre / Razón Social Extraída</label>
                            <input 
                              type="text"
                              value={ocrFormClientName}
                              onChange={(e) => setOcrFormClientName(e.target.value)}
                              className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-xs outline-none font-semibold text-slate-900"
                              required
                            />
                            {ocrFormSenderName && ocrFormSenderName !== ocrFormClientName && (
                              <button
                                type="button"
                                onClick={() => {
                                  const temp = ocrFormClientName;
                                  setOcrFormClientName(ocrFormSenderName);
                                  setOcrFormSenderName(temp);
                                }}
                                className="mt-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline flex items-center gap-1 self-start select-none"
                              >
                                🔄 Cambiar al beneficiario: {ocrFormSenderName}
                              </button>
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500">Identificación Ecuatoriana (RUC o Cédula)</label>
                            <input 
                              type="text"
                              value={ocrFormRuc}
                              onChange={(e) => setOcrFormRuc(e.target.value)}
                              className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-xs outline-none font-mono font-bold text-slate-800"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500">Monto del Pago ($USD)</label>
                            <input 
                              type="number"
                              value={ocrFormAmount}
                              onChange={(e) => setOcrFormAmount(parseFloat(e.target.value) || 0)}
                              className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-xs outline-none font-bold text-slate-900"
                              step="0.01"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500">Banco de Origen</label>
                            <input 
                              type="text"
                              value={ocrFormBank}
                              onChange={(e) => setOcrFormBank(e.target.value)}
                              className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-xs outline-none"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500">Referencia / Nº Documento</label>
                            <input 
                              type="text"
                              value={ocrFormReference}
                              onChange={(e) => setOcrFormReference(e.target.value)}
                              className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-xs outline-none font-mono"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-500">Detalle o Concepto de Factura</label>
                            <input 
                              type="text"
                              value={ocrFormDetail}
                              onChange={(e) => setOcrFormDetail(e.target.value)}
                              className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-xs outline-none"
                              required
                            />
                          </div>
                        </div>

                        {/* Calculations preview */}
                        <div className="bg-slate-55 p-4 rounded-xl border border-slate-150 text-xs flex justify-between items-center">
                          <div>
                            <p className="text-slate-500">Total Pago: <span className="font-bold text-slate-800">${ocrFormAmount.toFixed(2)}</span></p>
                            <p className="text-[10px] text-slate-400 mt-0.5">(Incluye 15% IVA desglosado automáticamente)</p>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-500">Subtotal: <span className="font-semibold text-slate-705">${(ocrFormAmount / 1.15).toFixed(2)}</span></p>
                            <p className="text-slate-500">IVA 15%: <span className="font-semibold text-slate-705">${(ocrFormAmount - (ocrFormAmount / 1.15)).toFixed(2)}</span></p>
                          </div>
                        </div>

                        <div className="flex justify-between pt-4 border-t border-slate-100">
                          <button 
                            type="button" 
                            onClick={() => {
                              setExtractedData(null);
                              setOcrMatchClient(null);
                            }}
                            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs text-slate-600 font-semibold cursor-pointer"
                          >
                            Subir otro comprobante
                          </button>
                          <button 
                            type="submit"
                            className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm cursor-pointer"
                          >
                            Emitir Factura Electrónica
                          </button>
                        </div>
                      </form>

                      {/* Right: Matches, warning and actions */}
                      <div className="lg:col-span-4 space-y-6">
                        
                        {/* Client Status card */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Asociación de Cliente</h4>
                          
                          {ocrMatchClient ? (
                            <div className="space-y-3">
                              <div className="p-3 bg-emerald-50 text-emerald-805 border border-emerald-100 rounded-xl flex items-start gap-2.5">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <div className="text-xs">
                                  <p className="font-bold">Cliente Identificado</p>
                                  <p className="mt-0.5">Se encontró una coincidencia para **{ocrMatchClient.company}** (RUC: {ocrMatchClient.ruc}).</p>
                                </div>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-2">
                                <p className="text-[10px] font-bold text-slate-450 uppercase">Datos Registrados</p>
                                <p className="text-xs font-semibold text-slate-805">{ocrMatchClient.name}</p>
                                <p className="text-xs text-slate-500 font-mono">RUC: {ocrMatchClient.ruc}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="p-3 bg-orange-50 text-orange-805 border border-orange-100 rounded-xl flex items-start gap-2.5">
                                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                                <div className="text-xs">
                                  <p className="font-bold">Cliente Nuevo</p>
                                  <p className="mt-0.5">La identificación del comprobante no coincide con ningún cliente registrado en tu cartera.</p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleOcrRegisterClient}
                                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                              >
                                <UserPlus className="w-4 h-4" />
                                Registrar Cliente Automáticamente
                              </button>
                            </div>
                          )}

                        </div>

                        {/* OCR Information Tips */}
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-500 leading-relaxed space-y-2">
                          <p className="font-bold text-slate-700 flex items-center gap-1">
                            <Info className="w-4 h-4 text-blue-500" />
                            ¿Cómo funciona la IA?
                          </p>
                          <p>
                            Gemini escanea la imagen para aislar bloques de texto y detectar patrones del remitente de la transferencia. 
                          </p>
                          <p>
                            Por seguridad, revisa siempre los montos y el RUC del adquirente antes de emitir y firmar digitalmente la factura para el SRI.
                          </p>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* VIEW 6: AJUSTES SYSTEM */}
          {activeTab === 'ajustes' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-slide-up font-sans">
              <div>
                <h1 className="font-display text-3xl font-semibold text-slate-900">Ajustes del CRM</h1>
                <p className="text-slate-500 mt-1">Configuración comercial, personalización e identidad corporativa.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Personalización e Imagen Corporativa */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="font-display font-semibold text-slate-900 text-base flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                      Imagen Corporativa
                    </h3>
                    <div className="flex items-center gap-4 py-2">
                      <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-350 flex items-center justify-center bg-slate-50 overflow-hidden relative group">
                        {logoUrl ? (
                          <>
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                            <button 
                              type="button"
                              onClick={() => {
                                localStorage.removeItem('ecu_crm_company_logo');
                                setLogoUrl(null);
                                playSuccessSound();
                              }}
                              className="absolute inset-0 bg-red-600/90 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </>
                        ) : (
                          <Upload className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="block">
                          <span className="sr-only">Seleccionar logo</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  const base64 = reader.result as string;
                                  localStorage.setItem('ecu_crm_company_logo', base64);
                                  setLogoUrl(base64);
                                  playSuccessSound();
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-550 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                          />
                        </label>
                        <p className="text-[10px] text-slate-400">PNG o JPG recomendado (máx. 2MB)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sonidos de Interfaz */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="font-display font-semibold text-slate-900 text-base flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-500" />
                      Efectos de Sonido
                    </h3>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-xs font-bold text-slate-700 font-sans">Sonidos de Interfaz</p>
                        <p className="text-[10px] text-slate-400 mt-1">Reproducir tonos al navegar o realizar acciones.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={soundsEnabled}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setSoundsEnabled(val);
                            localStorage.setItem('ecu_crm_interface_sounds', val ? 'true' : 'false');
                            if (val) {
                              // Temporarily set context to play test success sound
                              localStorage.setItem('ecu_crm_interface_sounds', 'true');
                              playSuccessSound();
                            }
                          }}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Persistencia de Datos */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                  <h3 className="font-display font-semibold text-slate-900 text-base flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-500" />
                    Persistencia Base de Datos
                  </h3>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-700">Restablecer database.json</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{clients.length} clientes, {projects.length} proyectos, {invoices.length} facturas.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        handleResetData();
                        playSuccessSound();
                      }}
                      className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-red-200 flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restablecer
                    </button>
                  </div>
                </div>

                {/* Gemini OCR Config */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                  <h3 className="font-display font-semibold text-slate-900 text-base flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    Motor de Inteligencia Artificial (SRI OCR)
                  </h3>
                  <form onSubmit={handleSaveGeminiKey} className="space-y-3">
                    <div className="flex flex-col gap-1.5 font-sans">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700">Google Gemini API Key</label>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isKeyConfigured ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                          {isKeyConfigured ? 'ACTIVO (Modo Real)' : 'SIMULADOR ACTIVO (Demo)'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showGeminiKey ? "text" : "password"}
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            placeholder={isKeyConfigured ? "••••••••••••••••••••••••••••••••" : "Ingresa tu API Key de Gemini..."}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-800 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowGeminiKey(!showGeminiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 text-xs font-semibold cursor-pointer"
                          >
                            {showGeminiKey ? 'Ocultar' : 'Mostrar'}
                          </button>
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Configuración de Emisor Fiscal */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 md:col-span-2">
                  <h3 className="font-display font-semibold text-slate-900 text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Configuración de Emisor Fiscal y Firma
                  </h3>
                  <form onSubmit={handleSaveFiscalSettings} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">Nombre Comercial / Razón Social</label>
                        <input 
                          type="text"
                          value={fiscalFormNombre}
                          onChange={(e) => setFiscalFormNombre(e.target.value)}
                          placeholder="Ej. ECUTECH S.A."
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-blue-500 text-slate-800"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">Slogan o Subtítulo</label>
                        <input 
                          type="text"
                          value={fiscalFormSlogan}
                          onChange={(e) => setFiscalFormSlogan(e.target.value)}
                          placeholder="Ej. Soluciones tecnológicas del futuro"
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-blue-500 text-slate-800"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">RUC Emisor</label>
                        <input 
                          type="text"
                          value={fiscalFormRuc}
                          onChange={(e) => setFiscalFormRuc(e.target.value)}
                          placeholder="Ej. 1792837465001"
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-blue-500 text-slate-800"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">Teléfono</label>
                        <input 
                          type="text"
                          value={fiscalFormTelefono}
                          onChange={(e) => setProfileFormPhone(e.target.value)}
                          placeholder="Ej. 0998877665"
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-blue-500 text-slate-800"
                        />
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="font-bold text-slate-700">Dirección Matriz</label>
                        <input 
                          type="text"
                          value={fiscalFormDireccion}
                          onChange={(e) => setFiscalFormDireccion(e.target.value)}
                          placeholder="Ej. Av. Amazonas N24-100 y Wilson, Quito"
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-blue-500 text-slate-800"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 sm:col-span-2 border-t border-slate-100 pt-4">
                        <label className="font-bold text-slate-700">Firma Electrónica (Imagen o Archivo .p12)</label>
                        <div className="flex items-center gap-4 py-2">
                          <div className="w-24 h-20 rounded-xl border-2 border-dashed border-slate-350 flex items-center justify-center bg-slate-50 overflow-hidden relative group">
                            {fiscalFormFirma ? (
                              <>
                                <img src={fiscalFormFirma} alt="Firma Electrónica" className="w-full h-full object-contain p-1" />
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setFiscalFormFirma('');
                                    playSuccessSound();
                                  }}
                                  className="absolute inset-0 bg-red-650/90 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                  Eliminar
                                </button>
                              </>
                            ) : (
                              <Upload className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    const base64 = reader.result as string;
                                    setFiscalFormFirma(base64);
                                    playSuccessSound();
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                            <p className="text-[10px] text-slate-400">Seleccione una imagen con fondo transparente o firma digitalizada (máx. 2MB)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs cursor-pointer"
                      >
                        Guardar Datos Fiscales
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* VIEW 7: ACCESOS Y ROLES */}
          {activeTab === 'usuarios' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-slide-up font-sans">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-display text-3xl font-semibold text-slate-900">Accesos y Roles</h1>
                  <p className="text-slate-500 mt-1">Gestione las cuentas de usuario y asigne roles de acceso al CRM.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setUserFormName('');
                    setUserFormEmail('');
                    setUserFormRole('Vendedor');
                    setUserFormPassword('');
                    setIsUserModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all shadow-sm shadow-blue-200"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Usuario
                </button>
              </div>

              {/* Users List Grid */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                      <th className="p-4">Usuario</th>
                      <th className="p-4">Correo / Usuario</th>
                      <th className="p-4">Rol</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                            {u.name.substring(0, 2)}
                          </div>
                          <span className="font-semibold text-slate-800">{u.name}</span>
                        </td>
                        <td className="p-4 text-slate-500">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            u.role === 'Administrador' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                            u.role === 'Gerente Comercial' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUser(u);
                                setUserFormName(u.name);
                                setUserFormEmail(u.email);
                                setUserFormRole(u.role);
                                setUserFormPassword(u.password || '');
                                setIsUserModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                              title="Editar usuario"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={u.id === currentUser.id}
                              onClick={async () => {
                                if (window.confirm(`¿Seguro que desea eliminar la cuenta de ${u.name}?`)) {
                                  try {
                                    const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
                                    if (res.ok) {
                                      setUsers(prev => prev.filter(x => x.id !== u.id));
                                      playSuccessSound();
                                    }
                                  } catch (err) {
                                    setUsers(prev => prev.filter(x => x.id !== u.id));
                                    playSuccessSound();
                                  }
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                              title={u.id === currentUser.id ? "No puedes eliminarte a ti mismo" : "Eliminar usuario"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 8: COTIZADOR */}
          {activeTab === 'cotizador' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-slide-up font-sans">
              <div>
                <h1 className="font-display text-3xl font-semibold text-slate-900">Cotizador de Servicios</h1>
                <p className="text-slate-500 mt-1">Genere cotizaciones comerciales de forma ágil para sus clientes.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
                
                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5 font-sans">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asignar a Cliente</label>
                    <select
                      value={quoteClientId}
                      onChange={(e) => setQuoteClientId(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-xs outline-none cursor-pointer"
                    >
                      <option value="">Seleccione un cliente...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.company} ({c.name})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 font-sans">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Validez de Oferta</label>
                    <input
                      type="text"
                      value={quoteValidity}
                      onChange={(e) => setQuoteValidity(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-xs outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 font-sans">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de Emisión</label>
                    <input
                      type="date"
                      value={quoteDate}
                      onChange={(e) => setQuoteDate(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5 font-sans">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Condiciones de Pago</label>
                    <input
                      type="text"
                      value={quotePaymentTerms}
                      onChange={(e) => setQuotePaymentTerms(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-xs outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 font-sans">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notas Adicionales</label>
                    <input
                      type="text"
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-xs outline-none"
                    />
                  </div>
                </div>

                <hr className="border-t border-slate-150" />

                {/* Quote Items List */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 text-sm">Ítems de la Cotización</h3>
                    <button
                      type="button"
                      onClick={() => setQuoteItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0 }])}
                      className="px-3 py-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Añadir Línea
                    </button>
                  </div>

                  <div className="space-y-3 font-sans">
                    {quoteItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <div className="flex-1">
                          <select
                            value={item.description}
                            onChange={(e) => {
                              const selectedDesc = e.target.value;
                              const matchedProd = products.find(p => p.name === selectedDesc);
                              const updated = [...quoteItems];
                              updated[idx].description = selectedDesc;
                              if (matchedProd) {
                                updated[idx].unitPrice = matchedProd.unitPrice;
                              }
                              setQuoteItems(updated);
                            }}
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="">Seleccione un producto o servicio...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.name}>
                                {p.name} ({p.sku}) - ${p.unitPrice.toFixed(2)}
                              </option>
                            ))}
                            {item.description && !products.some(p => p.name === item.description) && (
                              <option value={item.description}>{item.description}</option>
                            )}
                          </select>
                        </div>
                        <div className="w-20">
                          <input
                            type="number"
                            min="1"
                            placeholder="Cant."
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...quoteItems];
                              updated[idx].quantity = parseInt(e.target.value) || 1;
                              setQuoteItems(updated);
                            }}
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none bg-slate-50 focus:bg-white text-center"
                          />
                        </div>
                        <div className="w-32">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={item.unitPrice || ''}
                              onChange={(e) => {
                                const updated = [...quoteItems];
                                updated[idx].unitPrice = parseFloat(e.target.value) || 0;
                                setQuoteItems(updated);
                              }}
                              className="w-full border border-slate-200 rounded-lg pl-6 pr-2 py-2 text-xs outline-none bg-slate-50 focus:bg-white"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={quoteItems.length <= 1}
                          onClick={() => {
                            setQuoteItems(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 cursor-pointer disabled:opacity-30 disabled:hover:text-slate-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="border-t border-slate-150" />

                {/* Calculation Totals */}
                <div className="flex justify-between items-start gap-4">
                  <div className="text-xs text-slate-400 leading-relaxed max-w-sm">
                    El IVA es calculado a la tasa vigente del 15% aplicable en Ecuador para servicios profesionales y consultoría.
                  </div>
                  <div className="w-72 border border-slate-200 rounded-lg bg-slate-50/50 overflow-hidden divide-y divide-slate-150 text-xs">
                    <div className="flex justify-between p-3">
                      <span className="font-semibold text-slate-600">Subtotal</span>
                      <span className="font-mono text-slate-900">${
                        quoteItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toFixed(2)
                      }</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="font-semibold text-slate-600">IVA 15%</span>
                      <span className="font-mono text-slate-900">${
                        (quoteItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0) * 0.15).toFixed(2)
                      }</span>
                    </div>
                    <div className="flex justify-between p-3 bg-blue-50/50 font-bold border-t border-slate-250">
                      <span className="text-slate-900">Total a Cotizar</span>
                      <span className="font-mono text-blue-900 text-sm">${
                        (quoteItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0) * 1.15).toFixed(2)
                      }</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setQuoteItems([{ description: '', quantity: 1, unitPrice: 0 }]);
                      setQuoteClientId('');
                    }}
                    className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Limpiar Todo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!quoteClientId) {
                        alert("Por favor seleccione un cliente para la cotización.");
                        return;
                      }
                      if (quoteItems.some(i => !i.description.trim() || i.unitPrice <= 0)) {
                        alert("Por favor complete correctamente los ítems de la cotización.");
                        return;
                      }
                      handlePrintQuote();
                    }}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Generar y Descargar PDF
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* VIEW 9: PRODUCTOS/CATÁLOGO */}
          {activeTab === 'productos' && (
            <div className="space-y-8 animate-slide-up font-sans">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-slate-900">Catálogo de Productos / Inventario</h2>
                  <p className="text-slate-500 mt-1">Gestione los servicios y productos ofertados en las cotizaciones.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductFormName('');
                    setProductFormSku('');
                    setProductFormDescription('');
                    setProductFormPrice('');
                    setIsProductModalOpen(true);
                  }}
                  className="py-2.5 px-4 bg-indigo-650 hover:bg-indigo-750 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95 duration-100 shadow-sm cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Crear Producto
                </button>
              </div>

              {/* Product Grid / List */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                {products.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-semibold text-sm">No hay productos en el catálogo.</p>
                    <p className="text-xs text-slate-400 mt-1">Haga clic en "Crear Producto" para agregar el primero.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                          <th className="p-4">SKU / Código</th>
                          <th className="p-4">Nombre del Producto / Servicio</th>
                          <th className="p-4">Descripción</th>
                          <th className="p-4">Precio Unitario</th>
                          <th className="p-4 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 text-sm">
                        {products.map(product => (
                          <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-mono font-bold text-xs text-slate-500">{product.sku}</td>
                            <td className="p-4 font-semibold text-slate-800">{product.name}</td>
                            <td className="p-4 text-slate-500 text-xs max-w-xs truncate">{product.description || 'Sin descripción'}</td>
                            <td className="p-4 font-bold text-blue-750">${product.unitPrice.toFixed(2)}</td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setProductFormName(product.name);
                                    setProductFormSku(product.sku);
                                    setProductFormDescription(product.description);
                                    setProductFormPrice(product.unitPrice.toString());
                                    setIsProductModalOpen(true);
                                  }}
                                  className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-650 rounded text-slate-600 transition-colors cursor-pointer"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-650 rounded text-slate-600 transition-colors cursor-pointer"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 10: PERFIL DE USUARIO */}
          {activeTab === 'perfil' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-slide-up font-sans">
              <div>
                <h1 className="font-display text-3xl font-semibold text-slate-900">Mi Perfil</h1>
                <p className="text-slate-500 mt-1">Gestione sus credenciales, información de contacto y foto de perfil.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm">
                <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Left Column: Avatar */}
                  <div className="flex flex-col items-center space-y-4 md:border-r md:border-slate-100 md:pr-8">
                    <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md bg-blue-100 flex items-center justify-center text-blue-700 text-3xl font-bold">
                      {profileFormAvatar ? (
                        <img src={profileFormAvatar} alt={profileFormName} className="w-full h-full object-cover" />
                      ) : (
                        profileFormName.substring(0, 2).toUpperCase()
                      )}
                      
                      <label className="absolute inset-0 bg-black/60 text-white text-[10px] font-bold flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="w-5 h-5 mb-1" />
                        Cambiar Foto
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setProfileFormAvatar(reader.result as string);
                                playSuccessSound();
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    {profileFormAvatar && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileFormAvatar('');
                          playSuccessSound();
                        }}
                        className="text-xs text-red-650 hover:underline cursor-pointer font-bold"
                      >
                        Eliminar foto
                      </button>
                    )}
                    <div className="text-center">
                      <h3 className="font-bold text-slate-800 text-sm">{currentUser.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{currentUser.role}</p>
                    </div>
                  </div>

                  {/* Right Column: Form fields */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">Nombre Completo</label>
                        <input 
                          type="text"
                          value={profileFormName}
                          onChange={(e) => setProfileFormName(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-blue-500 text-slate-800"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">Correo Electrónico / Usuario</label>
                        <input 
                          type="email"
                          value={profileFormEmail}
                          onChange={(e) => setProfileFormEmail(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-blue-500 text-slate-800"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">Teléfono de Contacto</label>
                        <input 
                          type="text"
                          value={profileFormPhone}
                          onChange={(e) => setProfileFormPhone(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-blue-500 text-slate-800"
                          placeholder="Ej: 0991234567"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">Cambiar Contraseña (opcional)</label>
                        <input 
                          type="password"
                          value={profileFormPassword}
                          onChange={(e) => setProfileFormPassword(e.target.value)}
                          placeholder="Nueva contraseña..."
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-blue-500 text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <button
                        type="submit"
                        className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs cursor-pointer"
                      >
                        Guardar Perfil
                      </button>
                    </div>
                  </div>

                </form>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* NEW PROJECT MODAL */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-lg p-6 space-y-6 shadow-xl leading-normal animate-modal">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h4 className="font-display font-bold text-lg text-slate-900">Crear Nuevo Proyecto</h4>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-slate-450 hover:text-slate-700 font-semibold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveProjectSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Nombre del Proyecto</label>
                <input 
                  type="text" 
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  placeholder="Ej: Auditoría Anual de Seguridad IT"
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Cliente Asociado</label>
                <select 
                  value={projClientId}
                  onChange={(e) => setProjClientId(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none cursor-pointer"
                  required
                >
                  <option value="">Seleccione un cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company} ({c.name})</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Descripción / Alcance</label>
                <textarea 
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Describa el alcance de la consultoría contratada..."
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Presupuesto ($USD)</label>
                  <input 
                    type="number" 
                    value={projBudget}
                    onChange={(e) => setProjBudget(e.target.value)}
                    placeholder="Ej: 5000"
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Responsable</label>
                  <select 
                    value={projAssigned}
                    onChange={(e) => setProjAssigned(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none cursor-pointer"
                  >
                    <option value="Carlos Andrade">Carlos Andrade</option>
                    <option value="Alejandro Valenzuela">Alejandro Valenzuela</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Fecha Inicio</label>
                  <input 
                    type="date" 
                    value={projStart}
                    onChange={(e) => setProjStart(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Fecha Fin</label>
                  <input 
                    type="date" 
                    value={projEnd}
                    onChange={(e) => setProjEnd(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Regresar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Guardar Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW INVOICE MODAL */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-2xl p-6 space-y-6 shadow-xl leading-normal animate-modal">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h4 className="font-display font-bold text-lg text-slate-900">Emitir Comprobante de Venta (IVA 15%)</h4>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="text-slate-450 hover:text-slate-700 font-semibold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveInvoiceSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Cliente Adquiriente</label>
                  <select 
                    value={invClientId}
                    onChange={(e) => setInvClientId(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none cursor-pointer"
                    required
                  >
                    <option value="">Seleccione un cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company} (RUC: {c.ruc})</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Fecha de Vencimiento</label>
                  <input 
                    type="date" 
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Detalles de Factura</span>
                  <button
                    type="button"
                    onClick={addInvoiceItem}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    + Añadir Ítem
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {invItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => updateInvoiceItemField(idx, 'description', e.target.value)}
                        placeholder="Descripción del servicio o artículo..."
                        className="flex-1 border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2 text-xs outline-none"
                        required
                      />
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItemField(idx, 'quantity', e.target.value)}
                        placeholder="Cant"
                        className="w-16 border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2 text-xs outline-none"
                        min="1"
                        required
                      />
                      <input 
                        type="number" 
                        value={item.unitPrice}
                        onChange={(e) => updateInvoiceItemField(idx, 'unitPrice', e.target.value)}
                        placeholder="P. Unit"
                        className="w-24 border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2 text-xs outline-none"
                        min="0"
                        step="0.01"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeInvoiceItem(idx)}
                        disabled={invItems.length === 1}
                        className="text-red-600 hover:text-red-800 disabled:opacity-40 cursor-pointer p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Preview */}
              <div className="bg-slate-50 p-4 rounded-lg flex justify-end text-xs space-y-1.5 flex-col items-end border border-slate-150">
                {(() => {
                  const sub = invItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
                  const iva = sub * 0.15;
                  const tot = sub + iva;
                  return (
                    <>
                      <p className="text-slate-650">Subtotal: <span className="font-bold text-slate-800">${sub.toFixed(2)}</span></p>
                      <p className="text-slate-650">IVA 15% (Ecuador): <span className="font-bold text-slate-800">${iva.toFixed(2)}</span></p>
                      <p className="text-slate-900 border-t border-slate-200 pt-1.5 font-extrabold text-sm">TOTAL FACTURA: <span>${tot.toFixed(2)}</span></p>
                    </>
                  );
                })()}
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Guardar como Borrador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CLIENT MODAL */}
      {isEditModalOpen && currentClientDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-lg p-6 space-y-6 shadow-xl leading-normal animate-modal">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h4 className="font-display font-bold text-lg text-slate-900">Modificar Datos de {currentClientDetail.name}</h4>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-450 hover:text-slate-700 font-semibold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleEditClientSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">WhatsApp de Contacto</label>
                <input 
                  type="text" 
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Ciudad</label>
                <select 
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none cursor-pointer"
                >
                  <option value="Quito">Quito</option>
                  <option value="Guayaquil">Guayaquil</option>
                  <option value="Cuenca">Cuenca</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Dirección Física</label>
                <textarea 
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Regresar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE RIDE / PDF VIEWER MODAL */}
      {selectedInvoiceForView && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-4xl p-6 space-y-6 shadow-xl leading-normal overflow-y-auto max-h-[90vh] animate-modal">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-display font-bold text-lg text-slate-900">
                  Vista Previa RIDE - Factura {selectedInvoiceForView.invoiceNumber}
                </h4>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePrintInvoice(selectedInvoiceForView)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF / Imprimir
                </button>
                <button 
                  onClick={() => setSelectedInvoiceForView(null)} 
                  className="px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* RIDE Render Frame */}
            <div className="border border-slate-300 rounded-lg p-6 bg-slate-50 relative select-none">
              {/* Draft Watermark */}
              {selectedInvoiceForView.status !== 'authorized' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-10">
                  <div className="text-red-500/10 font-black text-6xl md:text-8xl tracking-widest uppercase border-4 border-red-500/10 p-4 rounded-xl rotate-[-25deg]">
                    Borrador
                  </div>
                </div>
              )}

              {/* RIDE Content Container */}
              <div className="bg-white p-6 shadow-xs border border-slate-200 max-w-[800px] mx-auto text-[10px] md:text-xs text-slate-800 space-y-6 font-sans">
                
                {/* Header Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Issuer Info */}
                  <div className="border border-slate-200 rounded-lg p-4 space-y-2 bg-white">
                    <div className="font-display font-extrabold text-slate-900 text-base md:text-lg tracking-tight">ECU-CRM S.A.</div>
                    <div className="font-bold text-slate-700 text-[10px] md:text-xs uppercase">ECU-CRM SISTEMAS TRIBUTARIOS S.A.</div>
                    <p className="mt-1">
                      <span className="font-bold">Dirección Matriz: </span> 
                      Av. de los Shyris N34-24 y Portugal, Edificio Shyris Park, Quito, Ecuador
                    </p>
                    <p>
                      <span className="font-bold">Dirección Sucursal: </span> 
                      Sucursal Matriz, Quito, Pichincha
                    </p>
                    <p>
                      <span className="font-bold">Contribuyente Especial Nro: </span> 
                      0000
                    </p>
                    <p>
                      <span className="font-bold">OBLIGADO A LLEVAR CONTABILIDAD: </span> 
                      SÍ
                    </p>
                  </div>

                  {/* Document & SRI Info */}
                  <div className="border border-slate-200 rounded-lg p-4 space-y-2 bg-white">
                    <p className="text-slate-900 font-extrabold text-sm md:text-base">
                      R.U.C.: <span className="font-mono">1792483759001</span>
                    </p>
                    <div className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded text-xs font-bold inline-block uppercase tracking-wider">
                      Factura Electrónica
                    </div>
                    <p className="mt-1">
                      <span className="font-bold">No. </span> 
                      <span className="font-mono font-bold text-slate-900">{selectedInvoiceForView.invoiceNumber}</span>
                    </p>
                    <div>
                      <span className="font-bold block text-[10px] text-slate-400">NÚMERO DE AUTORIZACIÓN:</span>
                      <span className="font-mono text-[9px] break-all block leading-tight text-slate-700">
                        {selectedInvoiceForView.sriAccessKey || 'PENDIENTE DE AUTORIZACIÓN TRIBUTARIA'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="font-bold block text-slate-400">AMBIENTE:</span>
                        <span>{selectedInvoiceForView.sriAccessKey ? 'PRODUCCIÓN' : 'PRUEBAS'}</span>
                      </div>
                      <div>
                        <span className="font-bold block text-slate-400">EMISIÓN:</span>
                        <span>NORMAL</span>
                      </div>
                    </div>
                    <p>
                      <span className="font-bold">FECHA AUTORIZACIÓN: </span>
                      {selectedInvoiceForView.sriAccessKey ? `${selectedInvoiceForView.issueDate} 12:00:00 (Simulado)` : 'PENDIENTE'}
                    </p>

                    {/* Barcode representation */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col items-center">
                      <span className="font-bold text-[9px] text-slate-400 self-start mb-1">CLAVE DE ACCESO:</span>
                      <div className="w-full bg-slate-50 p-2 rounded border border-slate-200">
                        {(() => {
                          const key = selectedInvoiceForView.sriAccessKey || '0000000000000000000000000000000000000000000000000';
                          const barsList = [];
                          let xPos = 5;
                          for (let i = 0; i < key.length; i++) {
                            const digitVal = parseInt(key[i]) || 0;
                            const barW = (digitVal % 3) + 1;
                            const barS = ((digitVal + 3) % 3) + 1;
                            barsList.push(
                              <rect key={i} x={xPos} y={4} width={barW} height={30} fill="black" />
                            );
                            xPos += barW + barS;
                          }
                          return (
                            <div className="flex flex-col items-center w-full">
                              <svg width="100%" height="38" viewBox={`0 0 ${xPos + 5} 38`} preserveAspectRatio="none" className="h-9 w-full">
                                {barsList}
                              </svg>
                              <span className="font-mono text-[8px] tracking-[1.5px] mt-1 select-all">{key}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buyer / Client Section */}
                <div className="border border-slate-200 rounded-lg p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p>
                      <span className="font-bold text-slate-500">Razón Social:</span>{' '}
                      <span className="font-bold text-slate-900">{selectedInvoiceForView.clientName}</span>
                    </p>
                    <p>
                      <span className="font-bold text-slate-500">Identificación:</span>{' '}
                      <span className="font-mono font-bold text-slate-800">{selectedInvoiceForView.clientRuc}</span>
                    </p>
                    <p>
                      <span className="font-bold text-slate-500">Fecha Emisión:</span>{' '}
                      <span>{selectedInvoiceForView.issueDate}</span>
                    </p>
                  </div>
                  <div className="space-y-1 md:pl-4 md:border-l border-slate-100">
                    <p>
                      <span className="font-bold text-slate-500">Guía Remisión:</span>{' '}
                      <span className="text-slate-400">S/N</span>
                    </p>
                    <p>
                      <span className="font-bold text-slate-500">Dirección:</span>{' '}
                      <span>
                        {clients.find(c => c.id === selectedInvoiceForView.clientId)?.address || 'Quito, Ecuador'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full border-collapse text-left text-[10px] md:text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-3 font-bold text-slate-600 text-center" style={{ width: '12%' }}>Cod.</th>
                        <th className="p-3 font-bold text-slate-600 text-center" style={{ width: '8%' }}>Cant</th>
                        <th className="p-3 font-bold text-slate-600">Descripción</th>
                        <th className="p-3 font-bold text-slate-600 text-right" style={{ width: '15%' }}>P. Unit</th>
                        <th className="p-3 font-bold text-slate-600 text-right" style={{ width: '10%' }}>Desc</th>
                        <th className="p-3 font-bold text-slate-600 text-right" style={{ width: '15%' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {selectedInvoiceForView.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 text-center font-mono text-slate-500">
                            SERV-{String(idx + 1).padStart(3, '0')}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-900">{item.quantity}</td>
                          <td className="p-3 text-slate-800 font-semibold">{item.description}</td>
                          <td className="p-3 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono">$0.00</td>
                          <td className="p-3 text-right font-bold font-mono">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Details & Totals */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Additional Info (left) */}
                  <div className="md:col-span-7 border border-slate-200 rounded-lg p-4 bg-white space-y-3">
                    <div className="font-bold border-b border-slate-100 pb-1 text-slate-700">Información Adicional</div>
                    <div className="space-y-1.5 text-[10px] md:text-xs">
                      <p>
                        <span className="font-bold text-slate-500">Email:</span>{' '}
                        <span>{clients.find(c => c.id === selectedInvoiceForView.clientId)?.email || 'N/A'}</span>
                      </p>
                      <p>
                        <span className="font-bold text-slate-500">Teléfono:</span>{' '}
                        <span>{clients.find(c => c.id === selectedInvoiceForView.clientId)?.phone || 'N/A'}</span>
                      </p>
                      <p>
                        <span className="font-bold text-slate-500">Dirección:</span>{' '}
                        <span>{clients.find(c => c.id === selectedInvoiceForView.clientId)?.address || 'Quito, Ecuador'}</span>
                      </p>
                      <p className="pt-2 border-t border-slate-100">
                        <span className="font-bold text-slate-850">Forma de Pago:</span>
                        <span className="block mt-0.5 text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                          OTROS CON UTILIZACIÓN DEL SISTEMA FINANCIERO (Transferencia Bancaria) - $
                          {selectedInvoiceForView.total.toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Totals Box (right) */}
                  <div className="md:col-span-5 border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-left text-[10px] md:text-xs border-collapse">
                      <tbody className="divide-y divide-slate-150">
                        <tr>
                          <td className="p-2.5 font-bold text-slate-600">SUBTOTAL 15%</td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            ${selectedInvoiceForView.subtotal.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-slate-500">SUBTOTAL 0%</td>
                          <td className="p-2.5 text-right font-mono text-slate-550">$0.00</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-slate-500">SUBTOTAL no sujeto de IVA</td>
                          <td className="p-2.5 text-right font-mono text-slate-550">$0.00</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-semibold text-slate-600">SUBTOTAL SIN IMPUESTOS</td>
                          <td className="p-2.5 text-right font-mono text-slate-800">
                            ${selectedInvoiceForView.subtotal.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-slate-500">TOTAL DESCUENTO</td>
                          <td className="p-2.5 text-right font-mono text-slate-550">$0.00</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-600">IVA 15%</td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            ${selectedInvoiceForView.taxAmount.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="bg-slate-50 font-bold border-t border-slate-200">
                          <td className="p-2.5 font-extrabold text-slate-900">VALOR TOTAL</td>
                          <td className="p-2.5 text-right font-mono font-extrabold text-blue-900 text-sm">
                            ${selectedInvoiceForView.total.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setSelectedInvoiceForView(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY PIN DELETE MODAL */}
      {isDeleteModalOpen && clientToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-md p-6 space-y-6 shadow-xl leading-normal text-center animate-modal">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 text-left">
              <h4 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Confirmación de Seguridad
              </h4>
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setClientToDelete(null);
                }} 
                className="text-slate-450 hover:text-slate-700 font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-600 leading-relaxed text-left font-sans">
                Para eliminar permanentemente al cliente <strong className="text-slate-900">"{clientToDelete.name}"</strong> y todos sus datos asociados, por favor ingrese su PIN de seguridad de 4 dígitos.
              </p>
              
              <div className="flex flex-col gap-1.5 pt-2">
                <input
                  type="password"
                  placeholder="••••"
                  maxLength={4}
                  value={deletePin}
                  onChange={(e) => {
                    setDeletePin(e.target.value);
                    setDeletePinError('');
                  }}
                  className="w-32 mx-auto text-center font-mono font-bold tracking-widest text-lg bg-slate-50 border border-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:bg-white text-slate-800 rounded-lg p-2.5 outline-none"
                  autoFocus
                />
                {deletePinError && (
                  <p className="text-xs text-red-600 font-semibold mt-1">{deletePinError}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setClientToDelete(null);
                }}
                className="px-4 py-2 border border-slate-250 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteClient}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER EDIT/CREATE MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-md p-6 space-y-6 shadow-xl leading-normal animate-modal">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h4 className="font-display font-bold text-lg text-slate-900">
                {editingUser ? 'Modificar Usuario' : 'Crear Nuevo Usuario'}
              </h4>
              <button 
                onClick={() => {
                  setIsUserModalOpen(false);
                  setEditingUser(null);
                }} 
                className="text-slate-450 hover:text-slate-700 font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!userFormName.trim() || !userFormEmail.trim() || !userFormPassword.trim()) {
                  alert("Complete todos los campos.");
                  return;
                }

                const userData = {
                  name: userFormName,
                  email: userFormEmail,
                  role: userFormRole,
                  password: userFormPassword,
                  avatarUrl: editingUser?.avatarUrl || ''
                };

                try {
                  if (editingUser) {
                    const res = await fetch(`/api/users/${editingUser.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(userData)
                    });
                    if (res.ok) {
                      const updated = await res.json();
                      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
                      if (editingUser.id === currentUser.id) {
                        setCurrentUser(updated);
                        localStorage.setItem('ecu_crm_user', JSON.stringify(updated));
                      }
                      playSuccessSound();
                    }
                  } else {
                    const res = await fetch('/api/users', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(userData)
                    });
                    if (res.ok) {
                      const saved = await res.json();
                      setUsers(prev => [...prev, saved]);
                      playSuccessSound();
                    } else {
                      const errData = await res.json();
                      alert(`Error: ${errData.message}`);
                      playErrorSound();
                    }
                  }
                } catch (err) {
                  const mockId = editingUser ? editingUser.id : userFormName.toLowerCase().replace(/\s+/g, '-');
                  const saved = { ...userData, id: mockId };
                  if (editingUser) {
                    setUsers(prev => prev.map(u => u.id === editingUser.id ? saved : u));
                  } else {
                    setUsers(prev => [...prev, saved]);
                  }
                  playSuccessSound();
                }

                setIsUserModalOpen(false);
                setEditingUser(null);
              }}
              className="space-y-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Nombre Completo</label>
                <input 
                  type="text" 
                  value={userFormName}
                  onChange={(e) => setUserFormName(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Usuario / Correo Electrónico</label>
                <input 
                  type="text" 
                  value={userFormEmail}
                  onChange={(e) => setUserFormEmail(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Rol Asignado</label>
                <select
                  value={userFormRole}
                  onChange={(e) => setUserFormRole(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none cursor-pointer"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Gerente Comercial">Gerente Comercial</option>
                  <option value="Vendedor">Vendedor (Acceso Limitado)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Contraseña</label>
                <input 
                  type="password" 
                  value={userFormPassword}
                  onChange={(e) => setUserFormPassword(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-550 rounded-lg p-2.5 text-sm outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsUserModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT EDIT/CREATE MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-md p-6 space-y-6 shadow-xl leading-normal animate-modal">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h4 className="font-display font-bold text-lg text-slate-900">
                {editingProduct ? 'Modificar Producto' : 'Crear Nuevo Producto'}
              </h4>
              <button 
                onClick={() => {
                  setIsProductModalOpen(false);
                  setEditingProduct(null);
                }} 
                className="text-slate-450 hover:text-slate-700 font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Nombre del Producto / Servicio</label>
                <input 
                  type="text" 
                  value={productFormName}
                  onChange={(e) => setProductFormName(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none"
                  placeholder="Ej: Licencia Anual ERP"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Código / SKU</label>
                <input 
                  type="text" 
                  value={productFormSku}
                  onChange={(e) => setProductFormSku(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none"
                  placeholder="Ej: ERP-LIC-01"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Precio Unitario ($USD)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={productFormPrice}
                  onChange={(e) => setProductFormPrice(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Descripción</label>
                <textarea 
                  value={productFormDescription}
                  onChange={(e) => setProductFormDescription(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg p-2.5 text-sm outline-none"
                  placeholder="Detalles sobre el producto o servicio comercial..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Regresar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {editingProduct ? 'Actualizar' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center px-2 z-40 shadow-lg shadow-black/10">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px]">Dashboard</span>
        </button>

        <button 
          onClick={() => setActiveTab('clientes')} 
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'clientes' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px]">Clientes</span>
        </button>

        <button 
          onClick={() => setActiveTab('cotizador')} 
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'cotizador' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[9px]">Cotizador</span>
        </button>

        {(currentUser.role === 'Gerente Comercial' || currentUser.role === 'Administrador') && (
          <>
            <button 
              onClick={() => setActiveTab('proyectos')} 
              className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'proyectos' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
            >
              <Briefcase className="w-5 h-5" />
              <span className="text-[9px]">Proyectos</span>
            </button>

            <button 
              onClick={() => setActiveTab('facturacion')} 
              className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'facturacion' ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}
            >
              <Receipt className="w-5 h-5" />
              <span className="text-[9px]">Facturas</span>
            </button>

            <button 
              onClick={() => setActiveTab('ajustes')} 
              className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'ajustes' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[9px]">Ajustes</span>
            </button>
          </>
        )}
      </nav>

    </div>
  );
}

// Subcomponents helper
interface ProjectCardProps {
  key?: string;
  project: Project;
  onSelect: (id: string) => void;
  onToggleTask: (projId: string, taskId: string) => void;
  onChangeStatus: (projId: string, status: Project['status']) => void;
}

function ProjectCard({ project, onSelect, onToggleTask, onChangeStatus }: ProjectCardProps) {
  const completedTasks = project.tasks.filter(t => t.completed).length;
  return (
    <div 
      onClick={() => onSelect(project.id)}
      className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-350 transition-all cursor-pointer space-y-3"
    >
      <div className="flex justify-between items-start gap-2">
        <h5 className="font-semibold text-slate-900 text-xs line-clamp-2 leading-tight group-hover:text-blue-700">{project.name}</h5>
      </div>
      <p className="text-[10px] text-slate-500 font-medium truncate">{project.clientName}</p>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[9px] font-bold">
          <span className="text-slate-400">{completedTasks}/{project.tasks.length} hitos</span>
          <span className="text-slate-700">{project.progress}%</span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-indigo-600 h-full rounded-full transition-all duration-350" style={{ width: `${project.progress}%` }}></div>
        </div>
      </div>

      {/* Status Selector */}
      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[9px]">
        <select
          value={project.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            onChangeStatus(project.id, e.target.value as Project['status']);
          }}
          className="py-0.5 px-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[9px] text-slate-650 cursor-pointer outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
        >
          <option value="planning">Planificación</option>
          <option value="ongoing">En Marcha</option>
          <option value="testing">Pruebas / QA</option>
          <option value="completed">Completado</option>
        </select>
        
        <span className="text-slate-400 font-medium truncate max-w-[70px]">👤 {project.assignedTo.split(' ')[0]}</span>
      </div>
    </div>
  );
}
