export type Role = 'Super Admin' | 'Administrador';
export type Department = 'Herramientas' | 'Materiales' | 'Eléctrico' | null;

export interface MockUser {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  department: Department;
  avatarUrl?: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 'usr-super',
    username: 'admin',
    email: 'erick@sirek.online',      
    password: '123',
    name: 'Super Admin',
    role: 'Super Admin',
    department: null,
    avatarUrl: 'https://i.pravatar.cc/150?u=admin'
  },
  {
    id: 'usr-herramientas',
    username: 'herramientas',
    email: 'herramientas@sirek.online',
    password: '123',
    name: 'Admin Herramientas',
    role: 'Administrador',
    department: 'Herramientas',
    avatarUrl: 'https://i.pravatar.cc/150?u=herramientas'
  },
  {
    id: 'usr-materiales',
    username: 'materiales',
    email: 'materiales@sirek.online',
    password: '123',
    name: 'Admin Materiales',
    role: 'Administrador',
    department: 'Materiales',
    avatarUrl: 'https://i.pravatar.cc/150?u=materiales'
  },
  {
    id: 'usr-electrico',
    username: 'electrico',
    email: 'electrico@sirek.online',
    password: '123',
    name: 'Admin Eléctrico',
    role: 'Administrador',
    department: 'Eléctrico',
    avatarUrl: 'https://i.pravatar.cc/150?u=electrico'
  }
];
