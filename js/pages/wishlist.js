/**
 * @module wishlist-page
 * @description Логика страницы избранного
 */

import { cart } from '../modules/cart.js';
import { wishlist } from '../modules/wishlist.js';
import { inventory } from '../modules/inventory.js';
import { ui } from '../modules/ui.js';
import { formatPrice, escapeHtml } from '../utils/helpers.js';
import { initCommon } from '../common.js';

class WishlistPage {
  constructor() {
    this.container = document.getElementById('wishlist-container');
    this.addAllBtn = document.getElementById('add-all-to-cart');

    if (this.container) {
      this.init();
    }
  }

  async init() {
    await initCommon({ skipCounters: false });
    
    this.render();
    this.initEventListeners();

    // Подписка на обновления
    wishlist.subscribe(() => this.render());
  }

  initEventListeners() {
    if (this.container) {
      this.container.addEventListener('click', (e) => this.handleClick(e));
    }

    if (this.addAllBtn) {
      this.addAllBtn.addEventListener('click', () => this.handleAddAll());
    }
  }

  render() {
    const wishlistItems = wishlist.getWishlistProducts();

    if (!wishlistItems.length) {
      this.renderEmpty();
      return;
    }

    this.renderWishlist(wishlistItems);

    if (this.addAllBtn) {
      this.addAllBtn.style.display = 'block';
    }
  }

  renderEmpty() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state__icon">❤️</div>
        <h3 class="empty-state__title">Избранное пусто</h3>
        <p class="empty-state__text">Добавляйте товары в избранное, чтобы не потерять их</p>
        <a href="index.html" class="button button--primary">Перейти в каталог</a>
      </div>
    `;

    if (this.addAllBtn) {
      this.addAllBtn.style.display = 'none';
    }
  }

  renderWishlist(items) {
    if (!this.container) return;

    this.container.innerHTML = items.map(product => {
      const qty = inventory.getQuantity(product.id, 100);
      const isAvailable = product.inStock && qty > 0;
      
      return `
        <article class="card" data-id="${product.id}">
          <div class="card__image-wrapper">
            <img src="${product.image}" alt="${escapeHtml(product.name)}" class="card__image" loading="lazy">
          </div>
          
          <div class="card__body">
            <h3 class="card__title">${escapeHtml(product.name)}</h3>
            
            <div class="card__price">
              <span class="card__price-current">${formatPrice(product.price)}</span>
              ${product.oldPrice ? `<span class="card__price-old">${formatPrice(product.oldPrice)}</span>` : ''}
            </div>
            
            <div class="card__actions">
              <button class="button button--primary add-to-cart-btn" 
                      ${!isAvailable ? 'disabled' : ''}
                      data-id="${product.id}">
                В корзину
              </button>
              
              <button class="button button--secondary remove-from-wishlist-btn" data-id="${product.id}">
                Удалить
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  handleClick(e) {
    const card = e.target.closest('.card');
    if (!card) return;

    const id = card.dataset.id;

    // Добавление в корзину
    if (e.target.closest('.add-to-cart-btn')) {
      cart.addToCart(id);
      wishlist.removeFromWishlist(id);
      ui.showToast('Товар добавлен в корзину и удалён из избранного');
      this.render();
      ui.updateCounters(cart.getCartCount(), wishlist.getWishlistCount());
    }

    // Удаление из избранного
    if (e.target.closest('.remove-from-wishlist-btn')) {
      wishlist.removeFromWishlist(id);
      ui.showToast('Товар удалён из избранного');
      this.render();
      ui.updateCounters(cart.getCartCount(), wishlist.getWishlistCount());
    }
  }

  handleAddAll() {
    const count = wishlist.addAllToCart((id, qty) => cart.addToCart(id, qty));
    ui.showToast(`Добавлено ${count} товаров в корзину`);
    this.render();
    ui.updateCounters(cart.getCartCount(), wishlist.getWishlistCount());
  }
}

export { WishlistPage };
