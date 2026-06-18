import React, { useState } from 'react';
import { Users, Briefcase, FileText, DollarSign, Plus, Settings, Edit2, Trash2 } from 'lucide-react';

// Locally define User so we don't depend on App.tsx export if it's missing or complex
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  password?: string;
  baseSalary?: number;
  status?: string;
  position?: string;
  overtime?: number;
  bonuses?: number;
  advances?: number;
}

interface HumanResourcesProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User | null;
  logoUrl?: string;
  initialTab?: 'directorio' | 'accesos' | 'nomina';
}

export const HumanResources: React.FC<HumanResourcesProps> = ({ users, setUsers, currentUser, logoUrl, initialTab = 'directorio' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Custom Dialog States
  const [confirmDialog, setConfirmDialog] = useState<{message: string, onConfirm: () => void} | null>(null);
  const [alertDialog, setAlertDialog] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('Vendedor');
  const [formDepartment, setFormDepartment] = useState('Herramientas');
  const [formSalary, setFormSalary] = useState<string>('0');
  const [formStatus, setFormStatus] = useState('Activo');
  const [formPosition, setFormPosition] = useState('Empleado');

  const totalNomina = users.reduce((acc, u) => acc + (u.baseSalary || 0), 0);
  const activeDepartments = new Set(users.map(u => u.department).filter(Boolean)).size || 1;

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormName(user.name);
      setFormEmail(user.email);
      setFormPassword('');
      setFormRole(user.role || 'Vendedor');
      setFormDepartment(user.department || 'Herramientas');
      setFormSalary((user.baseSalary || 0).toString());
      setFormStatus(user.status || 'Activo');
      setFormPosition(user.position || 'Empleado');
    } else {
      setEditingUser(null);
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      setFormRole('Vendedor');
      setFormDepartment('Herramientas');
      setFormSalary('0');
      setFormStatus('Activo');
      setFormPosition('Empleado');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || (!editingUser && !formPassword.trim())) {
      setAlertDialog("Por favor, complete los campos obligatorios.");
      return;
    }

    const payload = {
      id: editingUser ? editingUser.id : `user-${Date.now()}`,
      name: formName,
      email: formEmail,
      password: formPassword,
      role: formRole,
      department: formDepartment,
      baseSalary: parseFloat(formSalary) || 0,
      status: formStatus,
      position: formPosition
    };

    try {
      if (editingUser) {
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
          setAlertDialog("Usuario actualizado correctamente.");
        }
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const saved = await res.json();
          setUsers(prev => [...prev, saved]);
          setAlertDialog("Usuario creado correctamente.");
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setAlertDialog("Error al guardar: " + err.message);
    }
  };

  const handleDelete = async (u: User) => {
    if (u.id === currentUser?.id) {
      setAlertDialog("No puedes eliminar tu propio usuario.");
      return;
    }
    setConfirmDialog({
      message: `¿Seguro que desea eliminar a ${u.name}?`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
          if (res.ok) {
            setUsers(prev => prev.filter(x => x.id !== u.id));
          }
        } catch (err) {
          setAlertDialog("Error al eliminar.");
        }
        setConfirmDialog(null);
      }
    });
  };

  const generarNomina = async () => {
    if (totalNomina === 0) {
      setAlertDialog("No hay sueldos configurados para generar nómina.");
      return;
    }
    setConfirmDialog({
      message: `¿Seguro que desea generar la nómina por $${totalNomina.toLocaleString()} de sueldos base? Esto descargará los PDFs y automáticamente enviará los roles por correo a los empleados. IMPORTANTE: Las variables del mes se volverán cero para el siguiente mes.`,
      onConfirm: async () => {
        try {
          const res = await fetch('/api/nomina/generar', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logoUrl })
          });
          if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Roles_Pago_${new Date().toISOString().slice(0, 7)}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            console.log("¡Nómina generada exitosamente!");
          } else {
            const data = await res.json();
            setAlertDialog("Error: " + data.error);
          }
        } catch (err: any) {
          setAlertDialog("Error de conexión.");
        }
        setConfirmDialog(null);
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in font-sans pb-24">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-slate-900">Recursos Humanos</h2>
          <p className="text-slate-500 mt-1">Gestión de expedientes de empleados, accesos y nómina.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm font-bold shadow-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Empleado
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Empleados</p>
            <p className="text-3xl font-black text-slate-800">{users.length}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-full text-blue-600">
            <Users className="w-8 h-8" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Nómina Mensual</p>
            <p className="text-3xl font-black text-slate-800">${totalNomina.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-full text-emerald-600">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Departamentos</p>
            <p className="text-3xl font-black text-slate-800">{activeDepartments}</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-full text-indigo-600">
            <Briefcase className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {(initialTab === 'directorio' || initialTab === 'accesos') && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="p-4">Empleado / Usuario</th>
                  <th className="p-4">Cargo / Depto</th>
                  <th className="p-4">Estatus</th>
                  <th className="p-4">Sueldo Base</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-700">{u.position || 'Empleado'}</p>
                      <p className="text-xs text-slate-500">{u.department || 'Matriz'}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        u.status === 'Activo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        u.status === 'Vacaciones' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {u.status || 'Activo'}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-emerald-600 font-semibold">
                      ${(u.baseSalary || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openModal(u)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(u)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {initialTab === 'nomina' && (
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-100 rounded-full text-yellow-600 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-yellow-800 text-lg">Generación de Nómina de {new Date().toLocaleString('es', { month: 'long', year: 'numeric' })}</h4>
                  <p className="text-sm text-yellow-700 mt-1 max-w-xl">
                    Revise las variables del mes (horas extras, bonos, anticipos) en la tabla inferior antes de proceder.
                  </p>
                </div>
              </div>
              <button 
                onClick={generarNomina}
                disabled={totalNomina === 0}
                className={`px-6 py-3 text-white rounded-lg font-bold shadow transition-colors shrink-0 ${totalNomina > 0 ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-slate-300 cursor-not-allowed'}`}
              >
                Generar y Enviar Roles por Correo
              </button>
            </div>
            
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
                  <tr>
                    <th className="p-3">Empleado</th>
                    <th className="p-3">Sueldo Base</th>
                    <th className="p-3">Horas Extras ($)</th>
                    <th className="p-3">Bonos ($)</th>
                    <th className="p-3">Anticipos ($)</th>
                    <th className="p-3 text-right">Neto a Recibir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.filter(u => (!u.status || u.status === 'Activo')).map(u => {
                    const sueldo = u.baseSalary || 0;
                    const extras = u.overtime || 0;
                    const bonos = u.bonuses || 0;
                    const anticipos = u.advances || 0;
                    const neto = (sueldo + extras + bonos) - (sueldo * 0.0945) - anticipos;
                    
                    const updateVariable = async (field: string, val: string) => {
                      const num = parseFloat(val) || 0;
                      const updatedUser = { ...u, [field]: num };
                      setUsers(prev => prev.map(x => x.id === u.id ? updatedUser : x));
                      try {
                        await fetch(`/api/users/${u.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(updatedUser)
                        });
                      } catch(e) {}
                    };

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-800">{u.name}</td>
                        <td className="p-3 font-mono text-emerald-600">${sueldo.toFixed(2)}</td>
                        <td className="p-3">
                          <input type="number" step="0.01" value={u.overtime || ''} placeholder="0.00" onChange={(e) => updateVariable('overtime', e.target.value)} className="w-24 border border-slate-200 rounded p-1 text-sm font-mono" />
                        </td>
                        <td className="p-3">
                          <input type="number" step="0.01" value={u.bonuses || ''} placeholder="0.00" onChange={(e) => updateVariable('bonuses', e.target.value)} className="w-24 border border-slate-200 rounded p-1 text-sm font-mono" />
                        </td>
                        <td className="p-3">
                          <input type="number" step="0.01" value={u.advances || ''} placeholder="0.00" onChange={(e) => updateVariable('advances', e.target.value)} className="w-24 border border-slate-200 rounded p-1 text-sm font-mono text-red-500" />
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">${neto.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-xl text-slate-900">
                {editingUser ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nombre Completo</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Correo (Usuario)</label>
                  <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Contraseña {editingUser && '(Opcional)'}</label>
                  <input type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Cargo Funcional</label>
                  <input type="text" value={formPosition} onChange={e => setFormPosition(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" placeholder="Ej. Vendedor Senior" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Estatus</label>
                  <select value={formStatus} onChange={e => setFormStatus(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white">
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Vacaciones">Vacaciones</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Rol en Sistema (Permisos)</label>
                  <select value={formRole} onChange={e => setFormRole(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white">
                    <option value="Vendedor">Vendedor</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Contador">Contador</option>
                    {currentUser?.role === 'Super Admin' && <option value="Super Admin">Super Admin</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Departamento</label>
                  <select value={formDepartment} onChange={e => setFormDepartment(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white">
                    <option value="Herramientas">Herramientas</option>
                    <option value="Materiales">Materiales</option>
                    <option value="Oficina">Oficina</option>
                    <option value="Florería">Florería</option>
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Eléctrico">Eléctrico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Sueldo Base Mensual ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="number" step="0.01" value={formSalary} onChange={e => setFormSalary(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 pl-9 text-sm font-mono font-bold text-emerald-600" required />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Guardar Empleado</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Custom Alert Dialog */}
      {alertDialog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">!</span>
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 mb-2">Atención</h3>
            <p className="text-sm text-slate-600 mb-6">{alertDialog}</p>
            <button 
              onClick={() => setAlertDialog(null)} 
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">?</span>
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 mb-2">Confirmación</h3>
            <p className="text-sm text-slate-600 mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDialog(null)} 
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDialog.onConfirm} 
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
