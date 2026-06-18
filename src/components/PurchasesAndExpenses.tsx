import React, { useState, useEffect } from 'react';
import { Truck, ShoppingCart, Receipt, PlusCircle, Search, Save, X, DollarSign, Building2 } from 'lucide-react';
import { playSuccessSound } from '../utils/audio';

interface Provider {
  id: string;
  ruc: string;
  nombre_empresa: string;
  condiciones_pago: string;
  telefono: string;
  email: string;
  department: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  unitPrice: number;
  costPrice: number;
  stock: number;
}

export default function PurchasesAndExpenses({ 
  departmentContext,
  currentUserRole,
  currentUser
}: { 
  departmentContext: string;
  currentUserRole: string;
  currentUser: any;
}) {
  const [activeTab, setActiveTab] = useState<'compras' | 'gastos'>('compras');
  
  // Data States
  const [providers, setProviders] = useState<Provider[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  // Modals

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Load Data
  const loadData = async () => {
    try {
      const [provRes, prodRes, purchRes, expRes] = await Promise.all([
        fetch('/api/providers'),
        fetch('/api/products'),
        fetch('/api/purchases'),
        fetch('/api/expenses')
      ]);
      if (provRes.ok) {
        const provs = await provRes.json();
        setProviders(provs.filter((p: any) => p.department === departmentContext || departmentContext === 'Todos'));
      }
      if (prodRes.ok) {
        const prods = await prodRes.json();
        setProducts(prods.filter((p: any) => p.department === departmentContext || departmentContext === 'Todos'));
      }
      if (purchRes.ok) {
        const purchs = await purchRes.json();
        setPurchases(purchs.filter((p: any) => p.department === departmentContext || departmentContext === 'Todos'));
      }
      if (expRes.ok) {
        const exps = await expRes.json();
        setExpenses(exps.filter((e: any) => e.department === departmentContext || departmentContext === 'Todos'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [departmentContext]);


  // Purchase Form
  const [purchForm, setPurchForm] = useState({ proveedor_id: '', fecha: new Date().toISOString().split('T')[0] });
  const [purchItems, setPurchItems] = useState<{productId: string, quantity: number, unitPrice: number}[]>([]);
  
  const handleSavePurchase = async () => {
    if (!purchForm.proveedor_id || purchItems.length === 0) return alert("Seleccione un proveedor y agregue productos");
    const total = purchItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proveedor_id: purchForm.proveedor_id,
          fecha: purchForm.fecha,
          total,
          items: purchItems,
          department: departmentContext,
          userId: currentUser?.id
        })
      });
      if (res.ok) {
        playSuccessSound();
        setShowPurchaseModal(false);
        setPurchItems([]);
        loadData();
      }
    } catch(err) { console.error(err); }
  };

  // Expense Form
  const [expForm, setExpForm] = useState({ fecha: new Date().toISOString().split('T')[0], monto: '', codigo_cuenta: '6.1', descripcion: '', referencia_pago: '' });
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...expForm,
          monto: parseFloat(expForm.monto),
          department: departmentContext,
          userId: currentUser?.id
        })
      });
      if (res.ok) {
        playSuccessSound();
        setShowExpenseModal(false);
        setExpForm({ fecha: new Date().toISOString().split('T')[0], monto: '', codigo_cuenta: '6.1', descripcion: '', referencia_pago: '' });
        loadData();
      }
    } catch(err) { console.error(err); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-slide-up font-sans">


      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab('compras')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'compras' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
            <ShoppingCart className="w-4 h-4" /> Compras (Inventario)
          </button>
          <button onClick={() => setActiveTab('gastos')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'gastos' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
            <Receipt className="w-4 h-4" /> Gastos Mensuales
          </button>
        </div>

        <div className="p-6">

          {/* COMPRAS TAB */}
          {activeTab === 'compras' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Historial de Compras de Inventario</h2>
                <button onClick={() => setShowPurchaseModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Registrar Compra
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-y border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Fecha</th>
                      <th className="px-4 py-3 font-semibold">ID Compra</th>
                      <th className="px-4 py-3 font-semibold">Proveedor</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchases.map(p => {
                      const prov = providers.find(pr => pr.id === p.proveedor_id);
                      return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{p.fecha}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{p.id}</td>
                        <td className="px-4 py-3 font-bold">{prov?.nombre_empresa || p.proveedor_id}</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">{p.estado}</span></td>
                        <td className="px-4 py-3 font-bold text-right">${p.total.toFixed(2)}</td>
                      </tr>
                    )})}
                    {purchases.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-slate-400">No hay compras registradas</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GASTOS TAB */}
          {activeTab === 'gastos' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Registro de Gastos Operativos</h2>
                <button onClick={() => setShowExpenseModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Registrar Gasto
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-y border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Fecha</th>
                      <th className="px-4 py-3 font-semibold">ID Gasto</th>
                      <th className="px-4 py-3 font-semibold">Descripción</th>
                      <th className="px-4 py-3 font-semibold">Cuenta</th>
                      <th className="px-4 py-3 font-semibold text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{e.fecha}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{e.id}</td>
                        <td className="px-4 py-3 font-bold">{e.descripcion}</td>
                        <td className="px-4 py-3">{e.codigo_cuenta === '6.1' ? 'Gastos Operativos' : e.codigo_cuenta}</td>
                        <td className="px-4 py-3 font-bold text-right">${e.monto.toFixed(2)}</td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-slate-400">No hay gastos registrados</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* COMPRA MODAL */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-800 text-lg">Registrar Compra de Inventario</h3>
              <button onClick={() => setShowPurchaseModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Proveedor</label>
                  <select required value={purchForm.proveedor_id} onChange={e => setPurchForm({...purchForm, proveedor_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                    <option value="">Seleccione...</option>
                    {providers.map(p => <option key={p.id} value={p.id}>{p.nombre_empresa}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha</label>
                  <input required type="date" value={purchForm.fecha} onChange={e => setPurchForm({...purchForm, fecha: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <h4 className="font-bold text-sm text-slate-700 mb-3">Agregar Productos</h4>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <select id="prodSelect" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                      <option value="">Seleccione Producto...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                    </select>
                  </div>
                  <div className="w-24">
                    <input id="prodQty" type="number" min="1" placeholder="Cant." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  </div>
                  <div className="w-32">
                    <input id="prodPrice" type="number" min="0" step="0.01" placeholder="Costo Unit." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  </div>
                  <button type="button" onClick={() => {
                    const sel = document.getElementById('prodSelect') as HTMLSelectElement;
                    const qty = document.getElementById('prodQty') as HTMLInputElement;
                    const price = document.getElementById('prodPrice') as HTMLInputElement;
                    if(sel.value && qty.value && price.value) {
                      setPurchItems([...purchItems, { productId: sel.value, quantity: parseInt(qty.value), unitPrice: parseFloat(price.value) }]);
                      sel.value=''; qty.value=''; price.value='';
                    }
                  }} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold">Añadir</button>
                </div>

                <div className="mt-4 space-y-2">
                  {purchItems.map((item, idx) => {
                    const p = products.find(prod => prod.id === item.productId);
                    return (
                      <div key={idx} className="flex justify-between items-center text-sm bg-white p-2 border border-slate-200 rounded">
                        <span>{p?.name}</span>
                        <span className="font-medium">{item.quantity} x ${item.unitPrice.toFixed(2)} = ${(item.quantity * item.unitPrice).toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
              <div className="font-bold text-lg text-slate-800">
                Total Compra: ${purchItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toFixed(2)}
              </div>
              <button onClick={handleSavePurchase} className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">Completar e Ingresar Stock</button>
            </div>
          </div>
        </div>
      )}

      {/* EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">Registrar Gasto Mensual</h3>
              <button onClick={() => setShowExpenseModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSaveExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha</label>
                <input required type="date" value={expForm.fecha} onChange={e => setExpForm({...expForm, fecha: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción del Gasto</label>
                <input required type="text" value={expForm.descripcion} onChange={e => setExpForm({...expForm, descripcion: e.target.value})} placeholder="Ej: Arriendo mensual, Luz eléctrica" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Cuenta Contable (Gastos)</label>
                <select value={expForm.codigo_cuenta} onChange={e => setExpForm({...expForm, codigo_cuenta: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                  <option value="6.1">Gastos Operativos (6.1)</option>
                  <option value="6.1.1">Gastos de Arriendo (6.1.1)</option>
                  <option value="6.1.2">Servicios Básicos (6.1.2)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Monto ($)</label>
                  <input required type="number" step="0.01" min="0.01" value={expForm.monto} onChange={e => setExpForm({...expForm, monto: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Ref. de Pago</label>
                  <input type="text" value={expForm.referencia_pago} onChange={e => setExpForm({...expForm, referencia_pago: e.target.value})} placeholder="# Transacción" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> Registrar Gasto y Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
