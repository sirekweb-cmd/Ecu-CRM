import React, { useState } from 'react';
import { Product } from '../types';
import { Wrench, HardHat, Zap, ChevronLeft, ShoppingCart } from 'lucide-react';

interface PublicPortalProps {
  products: Product[];
  onShowLogin: () => void;
  onSubmitQuote: (quoteData: any) => Promise<void>;
}

export default function PublicPortal({ products, onShowLogin, onSubmitQuote }: PublicPortalProps) {
  const [department, setDepartment] = useState<'Herramientas' | 'Materiales' | 'Eléctrico' | null>(null);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [clientInfo, setClientInfo] = useState({ name: '', email: '', phone: '', city: 'Quito' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = [
    { name: 'Herramientas', icon: <Wrench className="w-12 h-12 mb-4 text-slate-400 group-hover:text-amber-500 transition-colors" /> },
    { name: 'Materiales', icon: <HardHat className="w-12 h-12 mb-4 text-slate-400 group-hover:text-yellow-500 transition-colors" /> },
    { name: 'Eléctrico', icon: <Zap className="w-12 h-12 mb-4 text-slate-400 group-hover:text-blue-500 transition-colors" /> }
  ];

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.product.id === product.id);
      if (existing) {
        return prev.map(p => p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(p => p.product.id !== productId));
  };

  const total = cart.reduce((sum, item) => sum + (item.product.unitPrice * item.quantity), 0);

  const handleGenerateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Agregue productos a su cotización.");
      return;
    }
    setIsSubmitting(true);
    
    const quoteItems = cart.map(item => ({
      description: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: item.product.unitPrice
    }));

    try {
      await onSubmitQuote({
        department,
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        clientPhone: clientInfo.phone,
        city: clientInfo.city,
        items: quoteItems,
        subtotal: total / 1.15,
        taxRate: 0.15,
        taxAmount: total - (total / 1.15),
        total: total,
        type: 'quote'
      });
      alert("¡Su cotización ha sido enviada con éxito! Nos pondremos en contacto pronto.");
      setCart([]);
      setDepartment(null);
    } catch (err) {
      alert("Hubo un error al enviar la cotización.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!department) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <button onClick={onShowLogin} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors text-sm font-medium">
          Acceso Administrativo
        </button>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">SID-CRM Portal Público</h1>
          <p className="text-slate-400">Seleccione el departamento para generar su cotización</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {departments.map(dept => (
            <button
              key={dept.name}
              onClick={() => setDepartment(dept.name as any)}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 group"
            >
              <div className="group-hover:scale-110 transition-transform duration-300">
                {dept.icon}
              </div>
              <h2 className="text-2xl font-semibold text-white">{dept.name}</h2>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const deptProducts = products.filter(p => p.department === department && p.isPublic);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => setDepartment(null)} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            Volver a Departamentos
          </button>
          <h1 className="text-xl font-bold text-white">{department} - Cotizador</h1>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Catálogo de Productos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {deptProducts.map(p => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col">
                <div className="flex-1">
                  <h3 className="text-white font-medium">{p.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{p.description || 'Sin descripción'}</p>
                  <p className="text-xs text-slate-500 mt-2">SKU: {p.sku}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-400">${p.unitPrice.toFixed(2)}</span>
                  <button onClick={() => addToCart(p)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Añadir
                  </button>
                </div>
              </div>
            ))}
            {deptProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                No hay productos disponibles en este departamento aún.
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit sticky top-24">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Su Cotización
          </h2>
          
          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto custom-scrollbar pr-2">
            {cart.map(item => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <div className="flex-1 text-slate-300">
                  <span className="text-slate-500 mr-2">{item.quantity}x</span>
                  {item.product.name}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white">${(item.product.unitPrice * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-300">×</button>
                </div>
              </div>
            ))}
            {cart.length === 0 && <p className="text-slate-500 text-sm">Agregue productos para comenzar</p>}
          </div>

          <div className="border-t border-slate-800 pt-4 mb-6">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Total a Cotizar:</span>
              <span className="text-emerald-400">${total.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleGenerateQuote} className="space-y-4">
            <div>
              <input type="text" required placeholder="Nombre Completo" value={clientInfo.name} onChange={e => setClientInfo({...clientInfo, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <input type="email" required placeholder="Correo Electrónico" value={clientInfo.email} onChange={e => setClientInfo({...clientInfo, email: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <input 
                type="tel" 
                required 
                placeholder="Teléfono (9 o 10 dígitos)" 
                value={clientInfo.phone} 
                pattern="^[0-9]{9,10}$"
                title="El teléfono debe tener 9 o 10 dígitos numéricos"
                maxLength={10}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  setClientInfo({...clientInfo, phone: val});
                }} 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" 
              />
            </div>
            <div>
              <select value={clientInfo.city} onChange={e => setClientInfo({...clientInfo, city: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none">
                <option value="Quito">Quito</option>
                <option value="Guayaquil">Guayaquil</option>
                <option value="Cuenca">Cuenca</option>
                <option value="Santo Domingo">Santo Domingo</option>
                <option value="Machala">Machala</option>
                <option value="Durán">Durán</option>
                <option value="Manta">Manta</option>
                <option value="Portoviejo">Portoviejo</option>
              </select>
            </div>
            <button type="submit" disabled={cart.length === 0 || isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium py-2 rounded-lg transition-colors">
              {isSubmitting ? 'Enviando...' : 'Solicitar Cotización'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
