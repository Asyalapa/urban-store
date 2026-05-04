/**
 * @module i18n
 * @description Интернационализация (EN/RU) с загрузкой JSON
 * @author Anastasia M. (tg: @asyalapa)
 */

class I18nModule {
  constructor() {
    this.locales = {};
    this.currentLocale = 'ru';
    this.subscribers = [];
    this.isLoading = true;
    this.fallbackTexts = {
      'app.name': 'UrbanStore',
      'app.tagline': 'Магазин для дома и уюта',
      'nav.all': 'Все',
      'nav.candles': 'Свечи',
      'nav.plants': 'Растения',
      'nav.decor': 'Декор',
      'nav.aroma': 'Ароматы',
      'nav.textile': 'Текстиль',
      'nav.lighting': 'Освещение',
      'search.placeholder': 'Поиск товаров...',
      'search.aria_label': 'Поиск по названию',
      'sort.default': 'По умолчанию',
      'sort.price_asc': 'Цена ↑',
      'sort.price_desc': 'Цена ↓',
      'sort.name': 'Название',
      'catalog.search': 'Поиск товаров...',
      'catalog.sort': 'Сортировка',
      'catalog.sort_default': 'По умолчанию',
      'catalog.sort_price_asc': 'Цена ↑',
      'catalog.sort_price_desc': 'Цена ↓',
      'catalog.sort_name': 'Название',
      'catalog.in_stock': 'В наличии',
      'catalog.out_of_stock': 'Нет в наличии',
      'catalog.add_to_cart': 'В корзину',
      'catalog.add_to_wishlist': 'В избранное',
      'catalog.remove_from_wishlist': 'Из избранного',
      'catalog.products_found': 'товаров найдено',
      'catalog.no_products': 'Товары не найдены',
      'catalog.empty_category': 'В этой категории пока нет товаров',
      'cart.title': 'Корзина',
      'cart.empty': 'Корзина пуста',
      'cart.empty_text': 'Добавьте товары из каталога',
      'cart.total': 'Итого',
      'cart.checkout': 'Оформить заказ',
      'cart.clear': 'Очистить корзину',
      'cart.remove': 'Удалить',
      'cart.go_to_cart': 'Перейти в корзину',
      'cart.subtotal': 'Товары',
      'cart.discount': 'Скидка',
      'cart.delivery': 'Доставка',
      'cart.promo_placeholder': 'Промокод',
      'cart.apply': 'Применить',
      'cart.promo_applied': 'Применён промокод',
      'cart.decrease': 'Уменьшить количество',
      'cart.increase': 'Увеличить количество',
      'cart.quantity': 'Количество',
      'cart.remove_item': 'Удалить товар',
      'cart.free_from': 'Бесплатно от',
      'cart.cart_summary': 'Сводка корзины',
      'wishlist.title': 'Избранное',
      'wishlist.empty': 'Избранное пусто',
      'wishlist.empty_text': 'Добавляйте товары в избранное, чтобы не потерять их',
      'wishlist.add_all_to_cart': 'Добавить всё в корзину',
      'wishlist.remove': 'Удалить',
      'wishlist.go_to_catalog': 'Перейти в каталог',
      'wishlist.added_to_cart_removed': 'Товар добавлен в корзину и удалён из избранного',
      'wishlist.removed': 'Товар удалён из избранного',
      'wishlist.added_count': 'Добавлено {{count}} товаров в корзину',
      'notifications.added_to_cart': 'Товар добавлен в корзину',
      'notifications.removed_from_cart': 'Товар удалён из корзины',
      'notifications.added_to_wishlist': 'Добавлено в избранное',
      'notifications.removed_from_wishlist': 'Удалено из избранного',
      'notifications.cart_cleared': 'Корзина очищена',
      'notifications.promo_applied': 'Промокод применён',
      'notifications.promo_removed': 'Промокод удалён',
      'notifications.promo_invalid': 'Недействительный промокод',
      'notifications.order_success': 'Заказ успешно оформлен',
      'notifications.order_number': 'Номер заказа',
      'notifications.order_redirect': 'Сейчас вы будете перенаправлены на главную',
      'notifications.back_to_home': 'Вернуться на главную',
      'notifications.form_error': 'Пожалуйста, проверьте правильность заполнения полей',
      'notifications.cart_empty_checkout': 'Нет товаров для оформления заказа',
      'cookie.title': 'Мы используем cookies',
      'cookie.text': 'Мы используем cookies для улучшения работы сайта, анализа трафика и персонализации.',
      'cookie.learn_more': 'Подробнее',
      'cookie.accept': 'Принять',
      'cookie.reject': 'Отказаться',
      'footer.demo': 'Демонстрационный проект интернет-магазина',
      'footer.developer': 'Разработчик: Анастасия М.',
      'footer.telegram': 'Telegram:',
      'footer.copyright': '© 2026 UrbanStore — учебный проект, все товары вымышлены',
      'auth.login': 'Вход',
      'auth.register': 'Регистрация',
      'auth.login_tab': 'Вход',
      'auth.register_tab': 'Регистрация',
      'auth.login_title': 'Вход в аккаунт',
      'auth.register_title': 'Регистрация',
      'auth.welcome_back': 'Добро пожаловать',
      'auth.create_account': 'Создать аккаунт',
      'auth.email': 'Email',
      'auth.password': 'Пароль',
      'auth.name': 'Имя',
      'auth.login_btn': 'Войти',
      'auth.login_button': 'Войти',
      'auth.register_btn': 'Зарегистрироваться',
      'auth.register_button': 'Зарегистрироваться',
      'auth.demo_access': '🎭 Демо-доступ:',
      'auth.fill_fields': 'Заполните все поля',
      'auth.password_length': 'Пароль должен быть не менее 4 символов',
      'auth.login_success': 'Вход выполнен успешно',
      'auth.register_success': 'Регистрация успешна',
      'auth.logout': 'Выйти',
      'auth.invalid_credentials': 'Неверный email или пароль',
      'auth.user_exists': 'Пользователь с таким email уже существует',
      'checkout.title': 'Оформление заказа',
      'checkout.contact_info': 'Контактная информация',
      'checkout.name': 'Имя',
      'checkout.phone': 'Телефон',
      'checkout.email': 'Email',
      'checkout.delivery_address': 'Адрес доставки',
      'checkout.city': 'Город',
      'checkout.city_placeholder': 'Москва',
      'checkout.address': 'Улица, дом, квартира',
      'checkout.address_placeholder': 'ул. Тверская, д. 1, кв. 1',
      'checkout.entrance': 'Подъезд',
      'checkout.floor': 'Этаж',
      'checkout.intercom': 'Код домофона',
      'checkout.comment': 'Комментарий к заказу',
      'checkout.comment_placeholder': 'Дополнительная информация',
      'checkout.payment_method': 'Способ оплаты',
      'checkout.payment_card': 'Банковская карта (онлайн)',
      'checkout.payment_cash': 'Наличные при получении',
      'checkout.payment_sbp': 'СБП (Система быстрых платежей)',
      'checkout.your_order': 'Ваш заказ',
      'checkout.confirm': 'Подтвердить заказ',
      'admin.title': 'Панель управления',
      'admin.logout': 'Выйти',
      'admin.access_denied': 'Доступ запрещён',
      'admin.total_orders': 'Всего заказов',
      'admin.revenue': 'Выручка',
      'admin.average_order': 'Средний чек',
      'admin.pending': 'В обработке',
      'admin.reset_demo': 'Сбросить демо-данные',
      'admin.orders': 'Заказы',
      'admin.no_orders': 'Нет заказов',
      'admin.order_id': 'ID',
      'admin.date': 'Дата',
      'admin.customer': 'Клиент',
      'admin.total': 'Сумма',
      'admin.status': 'Статус',
      'admin.actions': 'Действия',
      'admin.status_pending': 'Ожидает',
      'admin.status_paid': 'Оплачен',
      'admin.status_shipped': 'Отправлен',
      'admin.status_delivered': 'Доставлен',
      'admin.status_cancelled': 'Отменён',
      'admin.view': 'Просмотр',
      'admin.reset_confirm': 'Сбросить все демо-данные (заказы, корзину, избранное)?',
      'admin.status_updated': 'Статус обновлён',
      'order_success.title': 'Заказ успешно оформлен!',
      'order_success.message': 'Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время.',
      'order_success.back_to_home': 'Вернуться на главную'
    };
  }

  /**
   * Загрузка файлов локализации
   * @returns {Promise<void>}
   */
  async loadLocales() {
    try {
      const [ru, en] = await Promise.all([
        fetch('/js/locales/ru.json').then(res => res.json()),
        fetch('/js/locales/en.json').then(res => res.json())
      ]);

      this.locales = { ru, en };
      this.currentLocale = this.detectLocale();
      this.isLoading = false;

      // Обновляем HTML атрибут
      document.documentElement.lang = this.currentLocale;

      // Уведомляем подписчиков
      this.notifySubscribers();

      console.log('🌍 Локализации загружены:', this.currentLocale);
    } catch (error) {
      console.error('Ошибка загрузки локалей:', error);
      this.isLoading = false;
    }
  }

  /**
   * Определение языка пользователя
   * @returns {string} Код языка (ru/en)
   */
  detectLocale() {
    // Проверяем сохранённый язык в localStorage
    const savedLocale = localStorage.getItem('urban_locale');
    if (savedLocale && this.locales[savedLocale]) {
      return savedLocale;
    }

    // Проверяем язык браузера
    const browserLang = navigator.language.split('-')[0];
    if (this.locales[browserLang]) {
      return browserLang;
    }

    // По умолчанию русский
    return 'ru';
  }

  /**
   * Получить перевод по ключу
   * @param {string} key - Ключ перевода (например, "cart.title")
   * @param {Object} params - Параметры для подстановки
   * @returns {string} Переведённая строка
   */
  t(key, params = {}) {
    // Если локализация ещё не загружена или её нет — используем fallback
    if (this.isLoading || !this.locales[this.currentLocale]) {
      return this.fallbackTexts[key] || key;
    }

    const keys = key.split('.');
    let value = this.locales[this.currentLocale];

    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return this.fallbackTexts[key] || key;
      }
    }

    // Подстановка параметров {{param}}
    if (typeof value === 'string' && Object.keys(params).length) {
      return value.replace(/{{(\w+)}}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
      });
    }

    return value;
  }

  /**
   * Сменить язык
   * @param {string} locale - Код языка (ru/en)
   */
  setLocale(locale) {
    if (!this.locales[locale]) return;

    this.currentLocale = locale;
    localStorage.setItem('urban_locale', locale);

    // Уведомляем подписчиков
    this.notifySubscribers();

    // Обновляем HTML атрибут
    document.documentElement.lang = locale;

    // Триггерим событие
    window.dispatchEvent(new CustomEvent('localeChange', { detail: { locale } }));

    console.log(`🌍 Language changed to: ${locale}`);
  }

  /**
   * Подписаться на изменение языка
   * @param {Function} callback
   */
  subscribe(callback) {
    this.subscribers.push(callback);
  }

  /**
   * Уведомить подписчиков
   */
  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.currentLocale));
  }

  /**
   * Получить текущий язык
   * @returns {string}
   */
  getCurrentLocale() {
    return this.currentLocale;
  }

  /**
   * Получить список доступных языков
   * @returns {Array}
   */
  getAvailableLocales() {
    return Object.keys(this.locales).map(code => ({
      code,
      name: code === 'ru' ? 'Русский' : 'English'
    }));
  }

  /**
   * Проверить, загружена ли локализация
   * @returns {boolean}
   */
  isReady() {
    return !this.isLoading;
  }
}

// Создаём и экспортируем экземпляр
export const i18n = new I18nModule();

/**
 * Хелпер для перевода в HTML элементах (атрибут data-i18n)
 */
export const translatePage = () => {
  const elements = document.querySelectorAll('[data-i18n]');

  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = i18n.t(key);

    if (translation && translation !== key) {
      if (el.tagName === 'INPUT' && el.placeholder !== undefined) {
        el.placeholder = translation;
      } else if (el.tagName === 'BUTTON' && el.hasAttribute('value')) {
        el.value = translation;
      } else {
        el.textContent = translation;
      }
    }
  });

  // Обновляем атрибуты aria-label
  const ariaElements = document.querySelectorAll('[data-i18n-aria]');
  ariaElements.forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    const translation = i18n.t(key);
    if (translation && translation !== key) {
      el.setAttribute('aria-label', translation);
    }
  });
};

// Подписываемся на изменение языка
i18n.subscribe(() => {
  translatePage();
});