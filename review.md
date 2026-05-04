# Code Review: UrbanStore

**Дата:** 03.05.2026
**Проект:** Демонстрационный интернет-магазин (портфолио)
**Автор:** Анастасия М. (tg: @asyalapa)
**Стек:** Vanilla HTML/CSS/JS, без фреймворков

---

## Общая оценка

Проект производит очень хорошее впечатление для портфолио. Видна системность мышления, понимание современных подходов (CSS-переменные, БЭМ, модульный JS, паттерн «подписчик», i18n, accessibility). Код в целом чистый, хорошо структурирован. Ниже — детальный разбор того, что можно улучшить, упростить или исправить.

---

## 1. CSS — Архитектура и дублирование

### 1.1. Дублирование паттерна «overlay + visibility + анимация»

Три компонента реализуют один и тот же механизм показа/скрытия через `visibility` + `opacity` + `transition`:
- `_modal.css` (`.modal`)
- `_cart-drawer.css` (`.cart-drawer`)
- `_notification.css` (`.notification`)

**Проблема:** Один и тот же паттерн реализован трижды с небольшими вариациями. При изменении логики (например, добавить `pointer-events: none`) придётся править три места.

**Решение:** Вынести общий миксин в `abstracts/` или создать утилитарный класс `.overlay-panel`.

```css
/* abstracts/_mixins.css — пример миксина (можно через PostCSS или вручную) */
.overlay-panel {
  position: fixed;
  visibility: hidden;
  transition: visibility var(--transition-base);
}
.overlay-panel--open {
  visibility: visible;
}
.overlay-panel__backdrop {
  opacity: 0;
  transition: opacity var(--transition-base);
}
.overlay-panel--open .overlay-panel__backdrop {
  opacity: 1;
}
```

---

### 1.2. Хардкод значений цвета в `rgba()`

| Файл | Код |
|------|-----|
| `_catalog.css:21` | `rgba(30, 57, 53, 0.1)` |
| `_cart-drawer.css:22` | `rgba(0, 0, 0, 0.5)` |
| `_modal.css:22` | `rgba(0, 0, 0, 0.6)` |
| `_cookie-banner.css:9` | `rgba(0, 0, 0, 0.15)` |

**Проблема:** Эти значения не вынесены в CSS-переменные. Если дизайнер захочет поменять прозрачность оверлея — придётся искать по всему проекту.

**Решение:**
```css
:root {
  --overlay-light: rgba(0, 0, 0, 0.15);
  --overlay-medium: rgba(0, 0, 0, 0.5);
  --overlay-dark: rgba(0, 0, 0, 0.6);
  --focus-ring: rgba(30, 57, 53, 0.1);
}
```

---

### 1.3. Хардкод `z-index` в `_modal.css`

```css
.modal { z-index: 1000; }  /* ← хардкод */
```

В то время как остальные компоненты используют переменные:
- `var(--z-drawer)` в `_cart-drawer.css`
- `var(--z-notification)` в `_notification.css`

**Проблема:** Непонятно, почему 1000. Если переменные `--z-*` используются везде, то и здесь должна быть переменная.

**Решение:** Добавить `--z-modal: 1000` в переменные и использовать её.

---

### 1.4. Конфликт transition и animation в `_cookie-banner.css`

```css
.cookie-banner {
  transition: transform var(--transition-base);  /* строка 11 */
}
.cookie-banner--visible {
  transform: translateY(0);                       /* строка 16 */
  animation: slideUp var(--transition-base) ease-out; /* строка 95 */
}
```

Один и тот же элемент имеет и `transition`, и `animation` на `transform`. Это работает, но непредсказуемо: браузер может применить transition при первом показе, а animation — при повторном. Нужно выбрать что-то одно.

**Решение:** Оставить только `transition` (он проще и уже работает через класс `.cookie-banner--visible`). Удалить `@keyframes slideUp` и свойство `animation`.

---

### 1.5. `_modal.css` — хардкод размера шрифта

```css
.modal__price-current {
  font-size: 28px;  /* ← хардкод */
}
```

**Решение:** Использовать переменную, например `var(--font-size-2xl)` или создать `--font-size-3xl`.

---

### 1.6. Несоответствие селекторов в `_custom-select.css`

```css
/* CSS управляет через класс .custom-select--open */
.custom-select.custom-select--open .custom-select__dropdown { ... }

/* Но есть также атрибутный селектор (видимо, legacy) */
.custom-select__trigger[aria-expanded="true"] { ... }
```

Сейчас JS использует только класс `.custom-select--open`, атрибут `aria-expanded` не меняется. Это dead code.

**Решение:** Если атрибут не используется — удалить селекторы с `[aria-expanded]`. Либо (лучше) — убрать класс и управлять ТОЛЬКО через ARIA-атрибут. Это семантичнее, доступнее для скринридеров и сократит CSS.

---

### 1.7. Устаревший padding-хак вместо `aspect-ratio`

```css
.card__image-wrapper {
  padding-top: 100%;  /* хак для соотношения 1:1 */
}
```

**Решение (опционально):** Для современных браузеров лучше `aspect-ratio: 1 / 1`. Padding-хак — наследие IE, он уже не нужен. Можно оставить как fallback, но тогда стоит добавить оба:
```css
.card__image-wrapper {
  aspect-ratio: 1 / 1;
}
```

---

## 2. JavaScript — Дублирование и архитектура

### 2.1. Дублирование функции `escapeHtml`

Функция определена в двух местах:
- `js/utils/helpers.js` (экспортируется)
- `js/common.js` (приватная, дубликат)

**Решение:** В `common.js` заменить локальное определение на импорт из `helpers.js`:
```js
import { escapeHtml } from './utils/helpers.js';
```

---

### 2.2. `cart.js` и `wishlist.js` — идентичный паттерн «подписчик»

Оба модуля содержат:
- `subscribers = []`
- `subscribe(callback)`
- `notifySubscribers()`
- `initEventListeners()` со слушателем `window.addEventListener('storage', ...)`

Это классический случай для выделения базового класса.

**Решение:**
```js
// js/modules/StoreModule.js
export class StoreModule {
  subscribers = [];

  constructor(storageKey) {
    this.storageKey = storageKey;
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) this.notifySubscribers();
    });
  }

  subscribe(cb) { this.subscribers.push(cb); }
  notifySubscribers(data) { this.subscribers.forEach(cb => cb(data)); }
}
```

Тогда `CartModule` и `WishlistModule` наследуются от него — экономия ~25 строк дублирования в каждом.

---

### 2.3. `auth.js` — мёртвые импорты

```js
import { mockUsers, getCurrentUser, setCurrentUser, isAuthenticated, isAdmin } from '../mock/users.js';
```

Функции `isAuthenticated` и `isAdmin` импортируются, но **не используются** — в классе есть свои методы с теми же именами.

**Решение:** Убрать неиспользуемые импорты.

---

### 2.4. `promo.js` — избыточный метод-обёртка

```js
getCurrentDiscount(subtotal = 0) {
  if (!this.currentPromo) return 0;
  return this.getDiscountAmount(subtotal);  // ← просто обёртка
}
```

Метод `getCurrentDiscount` делает то же самое, что и `getDiscountAmount` (проверка `this.currentPromo` уже внутри `getDiscountAmount`). Разница только в параметре по умолчанию.

**Решение:** Оставить один метод. Добавить `subtotal = 0` в `getDiscountAmount`, удалить `getCurrentDiscount`.

---

### 2.5. Страничные классы — самозапуск при импорте (антипаттерн)

```js
// js/pages/cart.js (конец файла)
const page = new CartPage();
page.init().catch(console.error);
```

Модуль не только экспортирует класс, но и сразу создаёт экземпляр + вызывает `init()`. Это антипаттерн по двум причинам:
1. **Побочный эффект при импорте**: если кто-то сделает `import { CartPage } from './cart.js'` — код страницы выполнится, даже если это не страница корзины.
2. **Нет контроля над жизненным циклом**: нельзя передать параметры, переинициализировать и т.д.

**Решение:** Экспортировать только класс. Точку входа (`main.js`) сделать ответственной за определение текущей страницы и вызов `init()`:

```js
// js/main.js
import { IndexPage } from './pages/index.js';
import { CartPage } from './pages/cart.js';

const pages = {
  'index.html': IndexPage,
  'cart.html': CartPage,
};

const pageName = window.location.pathname.split('/').pop() || 'index.html';
const PageClass = pages[pageName];
if (PageClass) {
  new PageClass().init().catch(console.error);
}
```

Это даст централизованный контроль и избавит от неожиданных сайд-эффектов.

---

### 2.6. `common.js` — динамический импорт как костыль от циклической зависимости

```js
// common.js
import('./modules/catalog.js').then(({ catalog }) => { ... });
```

Это красный флаг архитектуры. Динамический импорт здесь — костыль, чтобы избежать циклической зависимости между `common.js` ↔ `catalog.js` ↔ `index.js`.

**Решение:** Пересмотреть структуру зависимостей:
- `catalog.js` не должен зависеть от `common.js`
- `common.js` не должен инициализировать drawer (это ответственность страницы)
- Вынести рендер drawer в отдельный модуль `drawer-renderer.js`, который импортируется обоими без циклов

---

### 2.7. `i18n.js` — отсутствие fallback при ошибке загрузки JSON

Если загрузка `fetch` провалилась — `isLoading = false`, но `this.locales = {}`. Метод `t()` вернёт ключ, но если JSON-файлы не загрузились совсем, весь интерфейс будет показывать ключи вместо текста.

**Решение:** Добавить хардкод-значения для критичных ключей на случай полного отказа загрузки:

```js
const FALLBACK_TEXTS = {
  'cart.empty': 'Корзина пуста',
  'cart.total': 'Итого',
  'notifications.added_to_cart': 'Товар добавлен в корзину',
  // ...
};

t(key, params = {}) {
  if (!this.locales[this.currentLocale]) {
    return FALLBACK_TEXTS[key] || key;
  }
  // ...
}
```

---

### 2.8. `ui.js` `flyToCart` — чтение `offsetHeight` без комментария

```js
clone.offsetHeight;  // ← форсирует reflow перед анимацией
```

Это рабочий приём, но без комментария выглядит как баг или мусорный код. Любой разработчик, читающий это, подумает: «зачем читать свойство и никуда не сохранять?»

**Решение:** Добавить поясняющий комментарий:
```js
// Принудительный reflow, чтобы браузер применил начальные стили перед анимацией
void clone.offsetHeight;
```

---

### 2.9. `storage.js` — отсутствие `try/catch` вокруг `JSON.parse`

```js
getCart() {
  const raw = localStorage.getItem(this.keys.CART);
  return raw ? JSON.parse(raw) : [];
}
```

Если данные в localStorage повреждены (редко, но бывает), `JSON.parse` выбросит исключение, которое уронит весь скрипт.

**Решение:**
```js
getCart() {
  try {
    const raw = localStorage.getItem(this.keys.CART);
    return raw ? JSON.parse(raw) : [];
  } catch {
    localStorage.removeItem(this.keys.CART);
    return [];
  }
}
```

То же самое для всех методов чтения из localStorage.

---

### 2.10. `products.js` — данные и код в одном файле

Файл `js/data/products.js` содержит ~120 строк хардкод-данных (массив товаров с названиями, ценами, URL-картинок). Это нормально для демо-проекта, но для портфолио стоит показать, что ты понимаешь разделение данных и кода.

**Рекомендация:** Вынести данные в `js/data/products.json` и загружать через `fetch`:
```js
// js/data/products-loader.js
export async function loadProducts() {
  const res = await fetch('./js/data/products.json');
  return res.json();
}
```

Это покажет, что ты умеешь работать с асинхронной загрузкой данных. В реальном проекте эти данные приходят с бэкенда.

---

## 3. HTML — Семантика и доступность

### 3.1. `index.html` — `<div class="header__nav">` вместо `<nav>`

```html
<div class="header__nav">
  <button class="header__category ...">Все</button>
  ...
</div>
```

**Проблема:** Навигация по категориям — семантически это `<nav>` с `aria-label`, а не `<div>`.

**Решение:**
```html
<nav class="header__nav" aria-label="Категории товаров">
  ...
</nav>
```

---

### 3.2. `cart.html` — кнопка очистки создаётся через JS, а не в HTML

```js
// js/pages/cart.js:257-273
initClearButton() {
  const clearBtn = document.createElement('button');
  clearBtn.id = 'clear-cart-btn';
  // ...
  summary.prepend(clearBtn);
}
```

**Проблема:** Кнопка очистки корзины создаётся динамически. Если JS не загрузится — кнопки не будет. Лучше держать статические элементы в HTML, а в JS только навешивать обработчики.

**Решение:** Перенести кнопку в `cart.html`, скрыть по умолчанию через CSS, показывать через JS когда корзина не пуста.

---

### 3.3. `login.html` — `<h2 class="auth__title">` пропущен уровень заголовка

```html
<h2 class="auth__title">Вход</h2>
```

На странице нет `<h1>`. По структуре документа заголовок страницы должен быть `<h1>`.

**Решение:** Заменить на `<h1 class="auth__title">`. То же самое для `admin.html`.

---

## 4. Общие архитектурные замечания

### 4.1. Отсутствует `js/main.js` как единая точка входа

Каждая HTML-страница подключает свой скрипт отдельно (`<script type="module" src="js/pages/cart.js">`). Это работает, но:
- Нет единого места для глобальной инициализации
- Код инициализации размазан по страничным модулям

**Рекомендация:** Сделать `main.js` точкой входа, которая:
1. Определяет текущую страницу
2. Загружает нужный Page-класс
3. Вызывает `init()`

---

### 4.2. Нет обработки состояния загрузки (loading state)

При загрузке данных (i18n JSON) пользователь видит "мигание" текста: сначала ключи, потом переводы. Нет индикации загрузки.

**Рекомендация:** Показать скелетон или спиннер на время `i18n.loadLocales()