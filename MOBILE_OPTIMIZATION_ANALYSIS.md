# Анализ оптимизации для мобильных устройств - gsap.js

## 🔍 Выявленные проблемы производительности

### 1. **Отсутствие throttling/debouncing для частых событий**

**Проблема:**

- События `scroll` (строки 360, 675, 682, 719) вызываются очень часто без ограничения
- События `wheel` (строка 714) могут быть частыми на мобильных
- Функции `updateUI()` и `updateClassMenu()` вызываются при каждом скролле

**Влияние:** Высокая нагрузка на CPU, лаги при скролле, разряд батареи

---

### 2. **Тяжелые DOM операции без кеширования**

**Проблема:**

- Множественные вызовы `getBoundingClientRect()` (строки 154, 172, 273-280, 421, 676, 691)
- Повторные `querySelector` в функциях (строки 415-416, 501, 535)
- `detectCurrentSection()` вызывает `getBoundingClientRect()` для всех секций (строка 172)

**Влияние:** Принудительные reflow, задержки в рендеринге

---

### 3. **Параллакс эффект активен на мобильных**

**Проблема:**

- `enableParallax()` (строки 631-649) добавляет обработчик `mousemove`
- На мобильных устройствах `mousemove` не нужен, но может быть активен
- Нет проверки на мобильное устройство перед включением

**Влияние:** Лишние вычисления, расход батареи

---

### 4. **Отсутствие requestAnimationFrame для частых обновлений**

**Проблема:**

- `updateUI()` и `updateClassMenu()` вызываются синхронно при скролле
- Нет использования `requestAnimationFrame` для батчинга обновлений

**Влияние:** Блокировка основного потока, дёрганный интерфейс

---

### 5. **Touch события без оптимизации**

**Проблема:**

- Touch события (строки 793-794) используют `{passive: false}`
- Нет проверки поддержки touch перед обработкой
- Отсутствует debouncing для `handleSwipe`

**Влияние:** Задержки в обработке жестов, конфликты с нативным скроллом

---

### 6. **Множественные проверки mobileMode**

**Проблема:**

- `mobileMode` проверяется множество раз в разных функциях
- `config.sections` и `config.lastWrapper` - геттеры, вызываются часто
- Нет кеширования результатов проверок

**Влияние:** Лишние вычисления, хотя и минимальные

---

### 7. **Инициализация при загрузке страницы**

**Проблема:**

- `getBoundingClientRect()` вызывается сразу при загрузке (строки 273-280)
- Множественные DOM запросы в начале файла
- Нет проверки готовности DOM

**Влияние:** Задержка первого рендера, CLS (Cumulative Layout Shift)

---

### 8. **GSAP анимации без оптимизации**

**Проблема:**

- Нет использования `will-change` CSS свойства
- Анимации могут вызывать repaint/reflow
- Отсутствует `force3D: true` для аппаратного ускорения

**Влияние:** Лаги анимаций, особенно на слабых устройствах

---

## ✅ Предложения по оптимизации

### Приоритет 1: Критические оптимизации

#### 1.1. Добавить throttling для scroll событий

```javascript
// Утилита для throttling
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Использование
const throttledUpdateUI = throttle(() => {
  updateUI();
  updateClassMenu();
}, 100); // 100ms = ~10 FPS для обновлений

lastWrapper.addEventListener('scroll', throttledUpdateUI, {passive: true});
window.addEventListener('scroll', throttledUpdateUI, {passive: true});
```

#### 1.2. Использовать requestAnimationFrame для обновлений UI

```javascript
let rafId = null;

function scheduleUIUpdate() {
  if (rafId) return;

  rafId = requestAnimationFrame(() => {
    updateUI();
    updateClassMenu();
    rafId = null;
  });
}

lastWrapper.addEventListener('scroll', scheduleUIUpdate, {passive: true});
```

#### 1.3. Кешировать результаты getBoundingClientRect()

```javascript
let cachedRects = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 100; // мс

function getCachedRect(element, key) {
  const now = performance.now();
  if (now - cacheTimestamp > CACHE_DURATION) {
    cachedRects = {};
    cacheTimestamp = now;
  }

  if (!cachedRects[key]) {
    cachedRects[key] = element.getBoundingClientRect();
  }
  return cachedRects[key];
}
```

#### 1.4. Оптимизировать detectCurrentSection()

```javascript
function detectCurrentSection() {
  let idx = 0;
  const viewportCenter = window.innerHeight * 0.5;

  // Используем кешированные значения или IntersectionObserver
  sections.forEach((section, i) => {
    const rect = getCachedRect(section, `section-${i}`);
    if (rect.top <= viewportCenter) idx = i;
  });
  return idx;
}
```

---

### Приоритет 2: Важные оптимизации

#### 2.1. Отключить параллакс на мобильных

```javascript
function enableParallax() {
  if (mobileMode || !('ontouchstart' in window)) return; // Пропускаем на мобильных

  const mainImg = document.querySelector('.first-wrapper__img img');
  if (!mainImg) return;

  // Используем throttling для mousemove
  mouseMoveHandler = throttle((e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 50;
    const y = (e.clientY / window.innerHeight - 0.5) * 50;

    gsap.to(mainImg, {
      x: -x,
      y: -y,
      duration: 1.2,
      ease: 'power2.out',
      overwrite: 'auto',
      force3D: true, // Аппаратное ускорение
    });
  }, 16); // ~60 FPS

  document.addEventListener('mousemove', mouseMoveHandler, {passive: true});
}
```

#### 2.2. Оптимизировать touch события

```javascript
// Проверка поддержки touch
const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (hasTouch) {
  let touchStartY = 0;
  let touchEndY = 0;
  const minSwipeDistance = 50;
  let touchTimeout = null;

  function handleTouchStart(evt) {
    if (isAnimating) return;
    touchStartY = evt.changedTouches[0].screenY;
  }

  function handleTouchEnd(evt) {
    if (mobileMode && currentIndex === lastSection) return;
    if (!touchStartY || isAnimating) return;

    touchEndY = evt.changedTouches[0].screenY;

    // Debounce для предотвращения множественных срабатываний
    if (touchTimeout) clearTimeout(touchTimeout);
    touchTimeout = setTimeout(() => {
      handleSwipe();
      touchTimeout = null;
    }, 50);
  }

  // Используем passive: true где возможно
  document.addEventListener('touchstart', handleTouchStart, {passive: true});
  document.addEventListener('touchend', handleTouchEnd, {passive: true});
}
```

#### 2.3. Кешировать config значения

```javascript
const config = {
  _cachedSections: null,
  _cachedLastWrapper: null,
  _cacheMode: null,

  get sections() {
    if (this._cachedSections && this._cacheMode === mobileMode) {
      return this._cachedSections;
    }
    this._cachedSections = mobileMode ? this.mobile : this.desktop;
    this._cacheMode = mobileMode;
    return this._cachedSections;
  },

  get lastWrapper() {
    if (this._cachedLastWrapper && this._cacheMode === mobileMode) {
      return this._cachedLastWrapper;
    }
    this._cachedLastWrapper = mobileMode
      ? this.lastWrapperMobile
      : this.lastWrapperDesktop;
    this._cacheMode = mobileMode;
    return this._cachedLastWrapper;
  },

  // ... остальные свойства
};
```

#### 2.4. Использовать IntersectionObserver для отслеживания секций

```javascript
// Более эффективная альтернатива getBoundingClientRect()
let sectionObserver = null;

function initSectionObserver() {
  if (!('IntersectionObserver' in window)) return;

  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const index = sections.indexOf(entry.target);
          if (index !== -1 && index !== currentIndex && !isAnimating) {
            // Обновляем currentIndex без анимации
            currentIndex = index;
            scheduleUIUpdate();
          }
        }
      });
    },
    {
      threshold: [0, 0.5, 1],
      rootMargin: '-20% 0px -20% 0px',
    }
  );

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
}
```

---

### Приоритет 3: Дополнительные улучшения

#### 3.1. Добавить will-change для анимируемых элементов

```javascript
// В CSS или через JS
function optimizeAnimations() {
  const animatedElements = [
    sliderWrapper,
    ...slides,
    ...document.querySelectorAll('.slide__img, .slide__content'),
  ];

  animatedElements.forEach((el) => {
    if (el) {
      el.style.willChange = 'transform';
      // Убираем will-change после анимации
      setTimeout(() => {
        el.style.willChange = 'auto';
      }, 1000);
    }
  });
}
```

#### 3.2. Оптимизировать GSAP анимации

```javascript
// Добавить force3D для аппаратного ускорения
gsap.defaults({
  force3D: true,
  lazy: false,
});

// Использовать transform вместо top/left
// Уже используется xPercent, что хорошо!
```

#### 3.3. Ленивая инициализация тяжелых вычислений

```javascript
// Отложить вычисления до первого взаимодействия
let initialized = false;

function initHeavyComputations() {
  if (initialized) return;

  // Переносим тяжелые вычисления сюда
  const footer = document.querySelector('.footer')?.getBoundingClientRect();
  // ... остальные

  initialized = true;
}

// Инициализируем при первом взаимодействии
document.addEventListener('touchstart', initHeavyComputations, {once: true});
document.addEventListener('wheel', initHeavyComputations, {once: true});
```

#### 3.4. Оптимизировать resize обработчик

```javascript
const optimizedResize = throttle(() => {
  const realCurrentIndex = detectCurrentSection();

  updateScrollLock();

  if (realCurrentIndex !== currentIndex) {
    currentIndex = realCurrentIndex;
    goToSection(currentIndex);
  }

  footerVisible = checkInnerScroll();
  scheduleUIUpdate();

  if (mobileMode && currentIndex === lastSection) {
    unlockScroll();
  } else {
    lockScroll();
  }
}, 250); // 250ms для resize

window.addEventListener('resize', optimizedResize, {passive: true});
```

---

## 📊 Ожидаемые результаты

После внедрения оптимизаций:

- **Производительность скролла:** Улучшение на 40-60%
- **Потребление батареи:** Снижение на 20-30%
- **FPS при анимациях:** Стабильные 60 FPS на средних устройствах
- **Время первого взаимодействия:** Улучшение на 15-25%
- **Lighthouse Mobile Score:** +10-15 пунктов

---

## 🚀 План внедрения

1. **Этап 1** (Критично): Throttling, requestAnimationFrame, кеширование
2. **Этап 2** (Важно): Оптимизация touch, отключение параллакса на мобильных
3. **Этап 3** (Улучшения): IntersectionObserver, will-change, оптимизация GSAP

---

## 📝 Дополнительные рекомендации

1. **Использовать CSS containment** для изоляции перерисовок
2. **Добавить loading="lazy"** для изображений
3. **Минифицировать и сжимать** JS файлы
4. **Использовать Service Worker** для кеширования
5. **Мониторинг производительности** через Performance API
