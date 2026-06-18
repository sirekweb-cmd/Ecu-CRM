import React, { createContext, useContext, useState } from 'react';

type Department = 'Herramientas' | 'Materiales' | 'Eléctrico' | null;

interface DepartmentContextType {
  activeDepartment: Department;
  setDepartmentContext: (dept: Department) => void;
  clearDepartmentContext: () => void;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializamos leyendo de sessionStorage (por si recarga la página)
  const [activeDepartment, setActiveDepartment] = useState<Department>(() => {
    return (sessionStorage.getItem('ecu_crm_active_dept') as Department) || null;
  });

  // Cada vez que cambia, lo guardamos
  const setDepartmentContext = (dept: Department) => {
    setActiveDepartment(dept);
    if (dept) sessionStorage.setItem('ecu_crm_active_dept', dept);
    else sessionStorage.removeItem('ecu_crm_active_dept');
  };

  const clearDepartmentContext = () => setDepartmentContext(null);

  return (
    <DepartmentContext.Provider value={{ activeDepartment, setDepartmentContext, clearDepartmentContext }}>
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (!context) throw new Error("useDepartment debe usarse dentro de un DepartmentProvider");
  return context;
};
