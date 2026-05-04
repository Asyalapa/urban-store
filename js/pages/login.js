/**
 * @module login-page
 * @description Страница входа и регистрации
 * @author Anastasia M. (tg: @asyalapa)
 */

import { auth } from '../modules/auth.js';
import { initCommon } from '../common.js';
import { ui } from '../modules/ui.js';
import { i18n } from '../modules/i18n.js';

class LoginPage {
  constructor() {
    this.activeTab = 'login';
  }

  /**
   * Инициализация страницы
   */
  async init() {
    // Общая инициализация
    await initCommon({ skipCounters: true, skipCookie: false });

    // Проверяем, возможно уже авторизован
    if (auth.isAuthenticated()) {
      const redirect = localStorage.getItem('redirect_after_login') || 'index.html';
      localStorage.removeItem('redirect_after_login');
      window.location.href = redirect;
      return;
    }

    // Рендер формы
    this.render();

    // Инициализация обработчиков
    this.bindEvents();
  }

  /**
   * Рендер формы входа/регистрации
   */
  render() {
    const container = document.getElementById('auth-container');
    if (!container) return;

    container.innerHTML = `
      <div class="auth-form">
        <div class="auth-form__tabs">
          <button class="auth-form__tab ${this.activeTab === 'login' ? 'active' : ''}" data-tab="login">
            ${i18n.t('auth.login') || 'Вход'}
          </button>
          <button class="auth-form__tab ${this.activeTab === 'register' ? 'active' : ''}" data-tab="register">
            ${i18n.t('auth.register') || 'Регистрация'}
          </button>
        </div>
        
        <!-- Форма входа -->
        <form id="login-form" class="auth-form__panel ${this.activeTab === 'login' ? 'active' : ''}">
          <h2 class="auth-form__title">${i18n.t('auth.welcome_back') || 'Добро пожаловать'}</h2>
          
          <div class="auth-form__field">
            <label>${i18n.t('auth.email') || 'Email'}</label>
            <input type="email" id="login-email" placeholder="user@example.com" required autocomplete="email">
          </div>
          
          <div class="auth-form__field">
            <label>${i18n.t('auth.password') || 'Пароль'}</label>
            <input type="password" id="login-password" placeholder="••••••" required autocomplete="current-password">
          </div>
          
          <button type="submit" class="button button--primary auth-form__submit">
            ${i18n.t('auth.login_btn') || 'Войти'}
          </button>
          
          <div class="auth-form__demo">
            <p>🎭 ${i18n.t('auth.demo_access') || 'Демо-доступ:'}</p>
            <p>📧 user@example.com / 123456</p>
            <p>👑 admin@urbanstore.com / admin123</p>
          </div>
        </form>
        
        <!-- Форма регистрации -->
        <form id="register-form" class="auth-form__panel ${this.activeTab === 'register' ? 'active' : ''}">
          <h2 class="auth-form__title">${i18n.t('auth.create_account') || 'Создать аккаунт'}</h2>
          
          <div class="auth-form__field">
            <label>${i18n.t('auth.name') || 'Имя'}</label>
            <input type="text" id="register-name" placeholder="Анастасия" required autocomplete="name">
          </div>
          
          <div class="auth-form__field">
            <label>${i18n.t('auth.email') || 'Email'}</label>
            <input type="email" id="register-email" placeholder="user@example.com" required autocomplete="email">
          </div>
          
          <div class="auth-form__field">
            <label>${i18n.t('auth.password') || 'Пароль'}</label>
            <input type="password" id="register-password" placeholder="••••••" required autocomplete="new-password">
          </div>
          
          <button type="submit" class="button button--primary auth-form__submit">
            ${i18n.t('auth.register_btn') || 'Зарегистрироваться'}
          </button>
        </form>
      </div>
    `;
  }

  /**
   * Привязка событий
   */
  bindEvents() {
    // Переключение табов
    const tabs = document.querySelectorAll('.auth-form__tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.activeTab = tab.dataset.tab;
        this.render();
        this.bindEvents(); // Перепривязываем события после рендера
      });
    });

    // Логин
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const result = await auth.login(email, password);
        if (result.success) {
          const redirect = localStorage.getItem('redirect_after_login') || 'index.html';
          localStorage.removeItem('redirect_after_login');
          window.location.href = redirect;
        }
      });
    }

    // Регистрация
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        if (!name || !email || !password) {
          ui.showToast(i18n.t('auth.fill_fields') || 'Заполните все поля', 'error');
          return;
        }

        if (password.length < 4) {
          ui.showToast(i18n.t('auth.password_length') || 'Пароль должен быть не менее 4 символов', 'error');
          return;
        }

        const result = await auth.register({ name, email, password });
        if (result.success) {
          window.location.href = 'index.html';
        }
      });
    }
  }
}

export { LoginPage };
