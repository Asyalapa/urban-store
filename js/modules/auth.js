/**
 * @module auth
 * @description Аутентификация (mock)
 * @author Anastasia M. (tg: @asyalapa)
 */

import { mockUsers, getCurrentUser, setCurrentUser } from '../mock/users.js';
import { ui } from './ui.js';
import { i18n } from './i18n.js';

class AuthModule {
  constructor() {
    this.currentUser = getCurrentUser();
    this.subscribers = [];
  }

  /**
   * Вход в систему
   * @param {string} email - Email
   * @param {string} password - Пароль
   * @returns {Promise<Object>}
   */
  async login(email, password) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      this.currentUser = userWithoutPassword;
      setCurrentUser(userWithoutPassword);
      this.notifySubscribers();

      ui.showToast(i18n.t('auth.login_success') || 'Добро пожаловать!');
      return { success: true, user: userWithoutPassword };
    }

    ui.showToast(i18n.t('auth.login_error') || 'Неверный email или пароль', 'error');
    return { success: false, error: 'Invalid credentials' };
  }

  /**
   * Регистрация
   * @param {Object} userData - Данные пользователя
   * @returns {Promise<Object>}
   */
  async register(userData) {
    await new Promise(resolve => setTimeout(resolve, 500));

    const existing = mockUsers.find(u => u.email === userData.email);
    if (existing) {
      ui.showToast(i18n.t('auth.register_error'), 'error');
      return { success: false, error: 'User exists' };
    }

    const newUser = {
      id: 'user_' + Date.now(),
      email: userData.email,
      name: userData.name,
      role: 'user',
      avatar: `https://ui-avatars.com/api/?background=1E3935&color=fff&name=${userData.name}`
    };

    mockUsers.push({ ...newUser, password: userData.password });
    this.currentUser = newUser;
    setCurrentUser(newUser);
    this.notifySubscribers();

    ui.showToast(i18n.t('auth.register_success'));
    return { success: true, user: newUser };
  }

  /**
   * Выход из системы
   */
  logout() {
    this.currentUser = null;
    setCurrentUser(null);
    this.notifySubscribers();
    ui.showToast(i18n.t('auth.logout_success'));

    // Перенаправляем на главную
    if (window.location.pathname.includes('admin.html') || window.location.pathname.includes('checkout.html')) {
      window.location.href = 'index.html';
    }
  }

  /**
   * Получить текущего пользователя
   */
  getUser() {
    return this.currentUser;
  }

  /**
   * Проверить, авторизован ли пользователь
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Проверить, является ли пользователь админом
   */
  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  /**
   * Подписка на изменения
   */
  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => cb(this.currentUser));
  }

  /**
   * Защита роута (перенаправление, если не авторизован)
   */
  requireAuth(redirectUrl = 'login.html') {
    if (!this.isAuthenticated()) {
      localStorage.setItem('redirect_after_login', window.location.pathname);
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }

  /**
   * Защита роута для админа
   */
  requireAdmin(redirectUrl = 'index.html') {
    if (!this.isAuthenticated()) {
      this.requireAuth('login.html');
      return false;
    }
    if (!this.isAdmin()) {
      ui.showToast(i18n.t('auth.admin_denied'), 'error');
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }
}

export const auth = new AuthModule();