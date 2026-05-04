/**
 * @module main
 * @description Единая точка входа с роутингом по страницам
 * @author Anastasia M. (tg: @asyalapa)
 */

import { IndexPage } from './pages/index.js';
import { CartPage } from './pages/cart.js';
import { CheckoutPage } from './pages/checkout.js';
import { WishlistPage } from './pages/wishlist.js';
import { LoginPage } from './pages/login.js';
import { AdminPage } from './pages/admin.js';
import { OrderSuccessPage } from './pages/order-success.js';

/**
 * Мапа страниц: путь → класс
 */
const pages = {
  index: IndexPage,
  cart: CartPage,
  checkout: CheckoutPage,
  wishlist: WishlistPage,
  login: LoginPage,
  order_success: OrderSuccessPage,
  admin: AdminPage
};

/**
 * Определяет текущую страницу по имени файла в URL
 * @returns {string} Имя страницы
 */
function detectPage() {
  const path = window.location.pathname;
  const filename = path.split('/').pop()?.replace('.html', '') || 'index';

  if (filename === 'order-success') return 'order_success';
  if (pages[filename]) return filename;

  return 'index';
}

/**
 * Запуск приложения
 */
async function bootstrap() {
  const pageName = detectPage();
  const PageClass = pages[pageName];

  if (!PageClass) {
    console.error(`Страница "${pageName}" не найдена`);
    return;
  }

  try {
    const page = new PageClass();
    await page.init();
    console.log(`✅ Страница "${pageName}" инициализирована`);
  } catch (error) {
    console.error(`Ошибка инициализации страницы "${pageName}":`, error);
  }
}

// Запуск
bootstrap();