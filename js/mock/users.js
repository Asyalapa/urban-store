/**
 * @module mock-users
 * @description Mock-пользователи для демонстрации
 */

export const mockUsers = [
  {
    id: 'user_1',
    email: 'user@example.com',
    password: '123456', // В реальном проекте хэшируем!
    name: 'Анастасия',
    role: 'user',
    avatar: 'https://ui-avatars.com/api/?background=1E3935&color=fff&name=Анастасия'
  },
  {
    id: 'admin_1',
    email: 'admin@urbanstore.com',
    password: 'admin123',
    name: 'Admin',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?background=C17A59&color=fff&name=Admin'
  }
];

// Текущий сеанс (sessionStorage)
export const getCurrentUser = () => {
  const userJson = sessionStorage.getItem('urban_current_user');
  return userJson ? JSON.parse(userJson) : null;
};

export const setCurrentUser = (user) => {
  if (user) {
    sessionStorage.setItem('urban_current_user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('urban_current_user');
  }
};

export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};