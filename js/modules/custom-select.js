/**
 * @module custom-select
 * @description Кастомный стилизованный селектор с доступностью
 * @author Anastasia M. (tg: @asyalapa)
 */

class CustomSelect {
  /**
   * @param {HTMLSelectElement} nativeSelect - Нативный select для замены
   * @param {Object} options - Опции
   */
  constructor(nativeSelect, options = {}) {
    this.nativeSelect = nativeSelect;
    this.options = {
      onChange: null,
      placeholder: nativeSelect.querySelector('option')?.textContent || 'Выберите',
      ...options
    };

    this.customSelect = null;
    this.trigger = null;
    this.dropdown = null;
    this.valueElement = null;
    this.isOpen = false;

    this.init();
  }

  /**
   * Инициализация кастомного селектора
   */
  init() {
    this.hideNativeSelect();
    this.createCustomSelect();
    this.bindEvents();
    this.updateValue();
  }

  /**
   * Скрыть нативный селектор
   */
  hideNativeSelect() {
    this.nativeSelect.style.position = 'absolute';
    this.nativeSelect.style.opacity = '0';
    this.nativeSelect.style.pointerEvents = 'none';
    this.nativeSelect.style.width = '1px';
    this.nativeSelect.style.height = '1px';
  }

  /**
   * Создать кастомный селектор
   */
  createCustomSelect() {
    // Создаём контейнер
    this.customSelect = document.createElement('div');
    this.customSelect.className = 'custom-select';
    this.customSelect.setAttribute('data-select', '');

    // Создаём триггер
    this.trigger = document.createElement('button');
    this.trigger.className = 'custom-select__trigger';
    this.trigger.setAttribute('type', 'button');
    this.trigger.setAttribute('aria-haspopup', 'listbox');
    this.trigger.setAttribute('aria-expanded', 'false');

    this.valueElement = document.createElement('span');
    this.valueElement.className = 'custom-select__value';
    this.trigger.appendChild(this.valueElement);

    // Иконка стрелки
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'custom-select__icon');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('width', '16');
    icon.setAttribute('height', '16');
    icon.innerHTML = '<path fill="currentColor" d="M7 10l5 5 5-5z"/>';
    this.trigger.appendChild(icon);

    // Создаём выпадающий список
    this.dropdown = document.createElement('ul');
    this.dropdown.className = 'custom-select__dropdown';
    this.dropdown.setAttribute('role', 'listbox');
    this.dropdown.setAttribute('aria-hidden', 'true');

    // Добавляем опции
    this.populateOptions();

    // Собираем всё вместе
    this.customSelect.appendChild(this.trigger);
    this.customSelect.appendChild(this.dropdown);

    // Вставляем после нативного селектора
    this.nativeSelect.parentNode.insertBefore(this.customSelect, this.nativeSelect.nextSibling);
  }

  /**
   * Заполнить опции из нативного селектора
   */
  populateOptions() {
    const options = Array.from(this.nativeSelect.options);

    options.forEach((option, index) => {
      const li = document.createElement('li');
      li.className = 'custom-select__option';
      li.setAttribute('role', 'option');
      li.setAttribute('data-value', option.value);
      li.setAttribute('data-index', index);
      li.textContent = option.textContent;

      if (option.selected) {
        li.classList.add('custom-select__option--selected');
        this.valueElement.textContent = option.textContent;
      }

      li.addEventListener('click', () => this.selectOption(index));
      li.addEventListener('mouseenter', () => this.highlightOption(index));

      this.dropdown.appendChild(li);
    });
  }

  /**
   * Выбрать опцию
   * @param {number} index - Индекс опции
   */
  selectOption(index) {
    this.nativeSelect.selectedIndex = index;
    this.updateValue();
    this.closeDropdown();

    // Триггерим событие change на нативном селекторе
    const changeEvent = new Event('change', { bubbles: true });
    this.nativeSelect.dispatchEvent(changeEvent);

    if (this.options.onChange) {
      this.options.onChange(this.nativeSelect.value, this.nativeSelect.options[index].textContent);
    }
  }

  /**
   * Подсветить опцию при наведении
   * @param {number} index - Индекс опции
   */
  highlightOption(index) {
    const options = this.dropdown.querySelectorAll('.custom-select__option');
    options.forEach(opt => opt.classList.remove('custom-select__option--hover'));
    if (options[index]) {
      options[index].classList.add('custom-select__option--hover');
    }
  }

  /**
   * Обновить отображаемое значение
   */
  updateValue() {
    const selectedOption = this.nativeSelect.options[this.nativeSelect.selectedIndex];
    if (selectedOption) {
      this.valueElement.textContent = selectedOption.textContent;

      // Обновляем класс selected у опций
      const options = this.dropdown.querySelectorAll('.custom-select__option');
      options.forEach((opt, idx) => {
        if (idx === this.nativeSelect.selectedIndex) {
          opt.classList.add('custom-select__option--selected');
        } else {
          opt.classList.remove('custom-select__option--selected');
        }
      });
    }
  }

  /**
   * Открыть выпадающий список
   */
  openDropdown() {
    this.isOpen = true;
    this.dropdown.setAttribute('aria-hidden', 'false');
    this.trigger.setAttribute('aria-expanded', 'true');
    this.customSelect.classList.add('custom-select--open');
  }

  /**
   * Закрыть выпадающий список
   */
  closeDropdown() {
    this.isOpen = false;
    this.dropdown.setAttribute('aria-hidden', 'true');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.customSelect.classList.remove('custom-select--open');
  }

  /**
   * Переключить состояние
   */
  toggleDropdown() {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Привязка событий
   */
  bindEvents() {
    // Клик по триггеру
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Закрытие при клике вне
    document.addEventListener('click', (e) => {
      if (!this.customSelect.contains(e.target)) {
        this.closeDropdown();
      }
    });

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeDropdown();
      }
    });

    // Навигация с клавиатуры
    this.trigger.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.openDropdown();
          this.highlightOption(this.nativeSelect.selectedIndex + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.openDropdown();
          this.highlightOption(this.nativeSelect.selectedIndex - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.toggleDropdown();
          break;
      }
    });

    this.dropdown.addEventListener('keydown', (e) => {
      const currentIndex = this.nativeSelect.selectedIndex;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < this.nativeSelect.options.length - 1) {
            this.selectOption(currentIndex + 1);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            this.selectOption(currentIndex - 1);
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.closeDropdown();
          break;
        case 'Escape':
          this.closeDropdown();
          break;
      }
    });
  }

  /**
   * Обновить опции (при динамическом изменении)
   */
  refresh() {
    this.dropdown.innerHTML = '';
    this.populateOptions();
    this.updateValue();
  }

  /**
   * Уничтожить кастомный селектор
   */
  destroy() {
    this.customSelect.remove();
    this.nativeSelect.style.position = '';
    this.nativeSelect.style.opacity = '';
    this.nativeSelect.style.pointerEvents = '';
    this.nativeSelect.style.width = '';
    this.nativeSelect.style.height = '';
  }
}

/**
 * Инициализация всех кастомных селекторов на странице
 * @param {string} selector - CSS селектор для нативных select
 */
export const initCustomSelects = (selector = 'select:not([data-customized])') => {
  const selects = document.querySelectorAll(selector);

  selects.forEach(select => {
    // Избегаем повторной инициализации
    if (select.hasAttribute('data-customized')) return;

    new CustomSelect(select);
    select.setAttribute('data-customized', 'true');
  });
};

export default CustomSelect;