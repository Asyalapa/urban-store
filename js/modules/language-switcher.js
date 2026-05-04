/**
 * @module language-switcher
 * @description Переключатель языка (для всех страниц)
 */

import { i18n } from './i18n.js';
import { wishlist } from './wishlist.js';
import { productModal } from './modal.js';

/**
 * Добавление переключателя языка в шапку
 */
export function addLanguageSwitcher() {
  const headerActions = document.querySelector('.header__actions');
  if (!headerActions) return;

  // Удаляем старый, если есть
  const oldSwitcher = document.getElementById('lang-switcher');
  if (oldSwitcher) oldSwitcher.remove();

  const switcher = document.createElement('div');
  switcher.id = 'lang-switcher';
  switcher.className = 'lang-switcher';

  const updateButtons = () => {
    const currentLang = i18n.getCurrentLocale();
    switcher.querySelectorAll('[data-lang]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  };

  switcher.innerHTML = `
    <button class="lang-switcher__btn ${i18n.getCurrentLocale() === 'ru' ? 'active' : ''}" data-lang="ru">RU</button>
    <button class="lang-switcher__btn ${i18n.getCurrentLocale() === 'en' ? 'active' : ''}" data-lang="en">EN</button>
  `;

  switcher.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;

    const lang = btn.dataset.lang;
    i18n.setLocale(lang);
    updateButtons();

    // Обновляем текст в модалке, если открыта
    if (productModal && productModal.modal && productModal.currentProduct) {
      const addBtn = productModal.modal.querySelector('.modal__add-to-cart');
      const wishBtn = productModal.modal.querySelector('.modal__wishlist');
      if (addBtn) addBtn.textContent = i18n.t('catalog.add_to_cart');
      if (wishBtn) {
        const inWishlist = wishlist.isInWishlist(productModal.currentProduct.id);
        wishBtn.textContent = inWishlist
          ? '❤️ ' + i18n.t('catalog.remove_from_wishlist')
          : '🤍 ' + i18n.t('catalog.add_to_wishlist');
      }

      // Обновляем описания
      const descEl = productModal.modal.querySelector('.modal__description p');
      if (descEl) descEl.textContent = i18n.t('modal.description');

      const specsTitle = productModal.modal.querySelector('.modal__details h3');
      if (specsTitle) specsTitle.textContent = i18n.t('modal.specifications');

      const dtCategory = productModal.modal.querySelector('.modal__details dt:first-child');
      if (dtCategory) dtCategory.textContent = i18n.t('modal.category') + ':';

      const dtSku = productModal.modal.querySelectorAll('.modal__details dt')[1];
      if (dtSku) dtSku.textContent = i18n.t('modal.sku') + ':';
    }

    // Обновляем страницу корзины, если она открыта
    const cartContainer = document.getElementById('cart-container');
    if (cartContainer && window.cartPageRender) {
      window.cartPageRender();
    }

    // Обновляем страницу избранного, если она открыта
    const wishlistContainer = document.getElementById('wishlist-container');
    if (wishlistContainer && window.wishlistPageRender) {
      window.wishlistPageRender();
    }
  });

  headerActions.appendChild(switcher);
}