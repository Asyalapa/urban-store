/**
 * @module common
 * @description Общая инициализация для всех страниц
 * @author Anastasia M. (tg: @asyalapa)
 */

import { cart } from './modules/cart.js';
import { wishlist } from './modules/wishlist.js';
import { ui } from './modules/ui.js';
import { auth } from './modules/auth.js';
import { cookieConsent } from './modules/cookie.js';
import { i18n, translatePage } from './modules/i18n.js';
import { addLanguageSwitcher } from './modules/language-switcher.js';
import { catalog } from './modules/catalog.js';
import { escapeHtml } from './utils/helpers.js';

/**
 * Инициализация общих компонентов для всех страниц
 * @param {Object} options - Опции инициализации
 * @param {boolean} options.skipCounters - Пропустить обновление счётчиков (для страниц без корзины)
 * @param {boolean} options.skipCookie - Пропустить cookie consent
 * @returns {Promise<void>}
 */
export async function initCommon(options = {}) {
  ui.init();

  await i18n.loadLocales();

  translatePage();

  addLanguageSwitcher();

  if (!options.skipCookie) {
    if (cookieConsent && typeof cookieConsent.init === 'function') {
      cookieConsent.init();
    }
  }

  if (!options.skipCounters) {
    updateCountersAndSubscribe();
  }

  updateUserInfoInHeader();

  initCartDrawer();
}

function updateCountersAndSubscribe() {
  const updateCounters = () => {
    ui.updateCounters(cart.getCartCount(), wishlist.getWishlistCount());
  };

  updateCounters();

  cart.subscribe(updateCounters);
  wishlist.subscribe(updateCounters);
}

function updateUserInfoInHeader() {
  const headerActions = document.querySelector('.header__actions');
  if (!headerActions) return;

  const user = auth.getUser();
  const existingUserInfo = document.querySelector('.header__user-info');

  if (existingUserInfo) {
    existingUserInfo.remove();
  }

  const userInfo = document.createElement('div');
  userInfo.className = 'header__user-info';

  if (user) {
    userInfo.innerHTML = `
      <span class="header__user-name">👤 ${escapeHtml(user.name)}</span>
      <button class="header__logout-btn" id="common-logout" aria-label="${i18n.t('auth.logout')}">🚪</button>
    `;

    const logoutBtn = userInfo.querySelector('#common-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
        window.location.reload();
      });
    }
  } else {
    // Показываем кнопку входа, если не авторизован
    userInfo.innerHTML = `
      <a href="login.html" class="button button--secondary header__login-btn" aria-label="${i18n.t('auth.login')}">
        🔐 ${i18n.t('auth.login')}
      </a>
    `;
  }

  headerActions.insertBefore(userInfo, headerActions.firstChild);
}

function initCartDrawer() {
  const cartBtn = document.querySelector('.header__action-button');
  if (!cartBtn) return;

  cartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    ui.openDrawer(cart.getFullCart(), (items) => {
      if (catalog.renderDrawerContent) {
        catalog.renderDrawerContent(items);
      }
    });
  });
}