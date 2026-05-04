/**
 * @module cookie
 * @description Cookie consent banner (согласно 152-ФЗ РФ)
 * @author Anastasia M. (tg: @asyalapa)
 */

import { storage } from './storage.js';

class CookieConsent {
  constructor() {
    this.banner = null;
    this.isConsentGiven = false;
    this.init();
  }

  /**
   * Инициализация cookie consent
   */
  init() {
    // Проверяем, дано ли уже согласие
    this.isConsentGiven = storage.getCookieConsent();

    if (!this.isConsentGiven) {
      this.createBanner();
    } else {
      this.enableCookies();
    }
  }

  /**
   * Создание DOM-элемента баннера
   */
  createBanner() {
    this.banner = document.createElement('div');
    this.banner.className = 'cookie-banner';
    this.banner.setAttribute('role', 'dialog');
    this.banner.setAttribute('aria-label', 'Согласие на использование cookies');

    this.banner.innerHTML = `
      <div class="cookie-banner__container">
        <p class="cookie-banner__text">
          🍪 Мы используем cookies для улучшения работы сайта, 
          анализа трафика и персонализации. 
          <a href="/privacy-policy" class="cookie-banner__link" target="_blank">Подробнее о политике обработки данных</a>
        </p>
        <div class="cookie-banner__actions">
          <button class="cookie-banner__accept button button--primary" data-cookie="accept">
            Принять
          </button>
          <button class="cookie-banner__reject button button--secondary" data-cookie="reject">
            Отказаться
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.banner);

    // Анимация появления
    requestAnimationFrame(() => {
      this.banner.classList.add('cookie-banner--visible');
    });

    this.bindEvents();
  }

  /**
   * Привязка обработчиков событий
   */
  bindEvents() {
    const acceptBtn = this.banner.querySelector('[data-cookie="accept"]');
    const rejectBtn = this.banner.querySelector('[data-cookie="reject"]');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => this.acceptCookies());
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => this.rejectCookies());
    }
  }

  /**
   * Принятие cookies
   */
  acceptCookies() {
    storage.setCookieConsent(true);
    this.isConsentGiven = true;
    this.hideBanner();
    this.enableCookies();

    // Отправляем событие в аналитику (если есть)
    console.log('🍪 Cookies accepted by user');
  }

  /**
   * Отказ от cookies
   */
  rejectCookies() {
    storage.setCookieConsent(false);
    this.isConsentGiven = false;
    this.hideBanner();
    this.disableCookies();

    console.log('🍪 Cookies rejected by user');
  }

  /**
   * Скрыть баннер с анимацией
   */
  hideBanner() {
    if (!this.banner) return;

    this.banner.classList.remove('cookie-banner--visible');

    setTimeout(() => {
      if (this.banner) {
        this.banner.remove();
        this.banner = null;
      }
    }, 300);
  }

  /**
   * Включить cookies (разрешить сбор)
   */
  enableCookies() {
    // Здесь можно инициализировать аналитику
    window.__COOKIES_ENABLED__ = true;

    // Устанавливаем куки для аналитики (пример)
    document.cookie = "analytics_consent=true; max-age=31536000; path=/; SameSite=Lax";
  }

  /**
   * Отключить cookies (запретить сбор)
   */
  disableCookies() {
    window.__COOKIES_ENABLED__ = false;

    // Удаляем аналитические куки
    document.cookie = "analytics_consent=; max-age=0; path=/";
  }
}

// Создаём экземпляр при импорте
export const cookieConsent = new CookieConsent();