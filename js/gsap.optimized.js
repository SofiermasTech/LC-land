gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ============================================
// УТИЛИТЫ ДЛЯ ОПТИМИЗАЦИИ
// ============================================

// Throttling для ограничения частоты вызовов
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

// Кеширование getBoundingClientRect
let cachedRects = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 100; // мс

function getCachedRect(element, key) {
  const now = performance.now();
  if (now - cacheTimestamp > CACHE_DURATION) {
    cachedRects = {};
    cacheTimestamp = now;
  }

  if (!cachedRects[key] && element) {
    cachedRects[key] = element.getBoundingClientRect();
  }
  return cachedRects[key];
}

// Оптимизация обновлений UI через requestAnimationFrame
let rafId = null;
let pendingUIUpdate = false;

function scheduleUIUpdate() {
  if (pendingUIUpdate) return;
  pendingUIUpdate = true;

  if (rafId) cancelAnimationFrame(rafId);

  rafId = requestAnimationFrame(() => {
    updateUI();
    updateClassMenu();
    pendingUIUpdate = false;
    rafId = null;
  });
}

// Проверка поддержки touch
const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// ============================================
// КОНФИГУРАЦИЯ
// ============================================

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
  get lastIndex() {
    return this.sections.length - 1;
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

  lastWrapperDesktop: document.querySelector(
    '.section#section-4 .section-last-wrapper'
  ),
  lastWrapperMobile: document.querySelector(
    '.for-mobile-wrapper .section-last-wrapper'
  ),

  desktop: Array.from(document.querySelectorAll('.section')),
  mobile: [
    document.getElementById('section-1'),
    document.getElementById('section-2'),
    document.querySelector('.for-mobile-wrapper'),
  ].filter(Boolean),
};

const sections = config.sections;
const lastIndex = config.lastIndex;
const lastWrapper = config.lastWrapper;

// состояния
let currentIndex = detectCurrentSection();
const lastSection = sections[lastIndex];
let isAnimating = false;
let isBottom = false;

// остальные кнопки + меню
const menuLinks = document.querySelectorAll('.menu__link');
const footerLinks = document.querySelectorAll('.footer__links-item.m a');

// слайдер
const sliderSectionIndex = 2;
const sliderWrapper = document.querySelector('.service-swiper__wrapper');
const slides = document.querySelectorAll('.service-swiper__slide');
let currentSlide = 0;
const lastSlide = slides.length - 1;

// mobile
let mouseMoveHandler = null;

// Настройка GSAP для оптимизации
gsap.defaults({
  force3D: true, // Аппаратное ускорение
});

updateUI();
updateClassMenu();

// ============================================
// ОСНОВНЫЕ ФУНКЦИИ
// ============================================

function goToSection(index) {
  if (isAnimating) return;
  isAnimating = true;

  const prevIndex = currentIndex;
  const nextIndex = index;

  // Анимация перехода между секциями
  const transitionTl = runSectionTransition(prevIndex, nextIndex);

  // Анимация скролла
  const scrollTween = gsap.to(window, {
    scrollTo: {y: sections[nextIndex], autoKill: false},
    duration: 1,
    ease: 'power2.inOut',
    force3D: true,
  });

  // Создаём ЕДИНЫЙ timeline, который ждёт обе анимации
  const master = gsap.timeline({
    onComplete() {
      currentIndex = nextIndex;
      updateUI();
      updateScrollLock();
      updatePaginationWhithSlides(nextIndex);

      isAnimating = false;
    },
  });

  // Добавляем переход
  master.add(transitionTl);

  // Добавляем скролл строго после перехода
  master.add(scrollTween, '-=0.6');
}

function onwheel(evt) {
  if (isAnimating) {
    evt.preventDefault();
    return;
  }

  const directionDown = evt.deltaY > 0;
  const directionUp = evt.deltaY < 0;

  if (mobileMode && currentIndex === sliderSectionIndex) {
    // Разрешаем обычный скролл
    return;
  }

  if (currentIndex === sliderSectionIndex && !mobileMode) {
    evt.preventDefault();

    if (directionDown) {
      if (currentSlide < lastSlide) return goToSlide(currentSlide + 1);
      return goToSection(currentIndex + 1);
    }

    if (directionUp) {
      if (currentSlide > 0) return goToSlide(currentSlide - 1);
      return goToSection(currentIndex - 1);
    }
  }

  if (currentIndex < lastIndex) {
    evt.preventDefault();

    if (directionDown) {
      goToSection(currentIndex + 1);
    } else if (evt.deltaY < 0 && currentIndex > 0) {
      goToSection(currentIndex - 1);
    }
    return;
  }

  if (currentIndex === lastIndex) {
    if (directionDown) return;
    isAnimating = false;
    scheduleUIUpdate();

    if (directionUp) {
      const firstChildInSection = lastSection.children[0];
      if (!firstChildInSection) return;

      // Используем кешированный rect
      const topContentInSection = getCachedRect(
        firstChildInSection,
        'firstChildInSection'
      )?.top;

      if (topContentInSection && topContentInSection > 10) {
        goToSection(lastIndex - 1);
        return;
      }
    }
  }
}

function detectCurrentSection() {
  let idx = 0;
  const viewportCenter = window.innerHeight * 0.5;

  sections.forEach((section, i) => {
    const rect = getCachedRect(section, `section-${i}`);
    if (rect && rect.top <= viewportCenter) idx = i;
  });
  return idx;
}

function lockScroll() {
  document.documentElement.style.overflowY = 'hidden';
  document.body.style.overflowY = 'hidden';
}

function unlockScroll() {
  document.documentElement.style.overflowY = 'auto';
  document.body.style.overflowY = 'auto';
}

function goToSlide(index) {
  if (isAnimating) return;
  if (currentSlide === index) return;

  isAnimating = true;

  const oldIndex = currentSlide;

  // Главный таймлайн — управляет всем
  const masterTl = gsap.timeline({
    onComplete: () => {
      currentSlide = index;
      window.dispatchEvent(new CustomEvent('slidechange', {detail: index}));

      setTimeout(() => {
        isAnimating = false;
      }, 200);
    },
  });

  // Двигаем контейнер
  masterTl.to(
    sliderWrapper,
    {
      xPercent: -100 * index,
      duration: 0.7,
      ease: 'power2.inOut',
      force3D: true,
    },
    0
  );

  // Запускаем анимацию контента параллельно
  const contentTl = animateSlide(oldIndex, index);
  if (contentTl) {
    masterTl.add(contentTl, 0);
  }
}

function animateSlide(oldIndex, newIndex) {
  const slides = document.querySelectorAll('.service-swiper__slide');
  const oldSlide = slides[oldIndex];
  const newSlide = slides[newIndex];
  if (!oldSlide || !newSlide) return;

  if (animateSlide.tl) {
    animateSlide.tl.kill();
  }

  const tl = gsap.timeline({defaults: {ease: 'power2.out', force3D: true}});
  animateSlide.tl = tl;

  const oldImg = oldSlide.querySelector('.slide__img');
  const oldContent = oldSlide.querySelector('.slide__content');
  const newImg = newSlide.querySelector('.slide__img');
  const newContent = newSlide.querySelector('.slide__content');

  const forward = newIndex > oldIndex;

  const oldExitX = forward ? '-150%' : '150%';
  const newEnterX = forward ? '150%' : '-150%';

  gsap.set([newImg, newContent], {x: newEnterX, force3D: true});
  // вперед
  if (forward) {
    tl.to(oldImg, {x: oldExitX, duration: 0.4, force3D: true});
    tl.to(oldContent, {x: oldExitX, duration: 0.4, force3D: true});

    tl.to(newImg, {x: '0%', duration: 0.4, force3D: true}, '-=0.15');
    tl.to(newContent, {x: '0%', duration: 0.4, force3D: true});
  } else {
    // назад
    tl.to(oldContent, {x: oldExitX, duration: 0.4, force3D: true});
    tl.to(oldImg, {x: oldExitX, duration: 0.3, force3D: true});

    tl.to(newContent, {x: '0%', duration: 0.3, force3D: true}, '-=0.05');
    tl.to(newImg, {x: '0%', duration: 0.4, force3D: true});
  }
  return tl;
}

// Ленивая инициализация тяжелых вычислений
let heavyComputationInitialized = false;

function initHeavyComputations() {
  if (heavyComputationInitialized) return;

  const footerEl = document.querySelector('.footer');
  const faqEl = document.querySelector('.faq');
  const lastWrapperEl = document.querySelector('.section-last-wrapper');

  if (footerEl) {
    const footer = footerEl.getBoundingClientRect();
    window.footerTop = footer.top;
    window.footerHeight = footerEl.offsetHeight;
  }

  if (faqEl) {
    const faq = faqEl.getBoundingClientRect();
    window.faqStart = faq.top;
    window.faqEnd = faq.bottom;
  }

  if (lastWrapperEl) {
    window.lastHeight = lastWrapperEl.scrollHeight;
  }

  window.windowHeight = window.innerHeight;
  if (lastWrapper) {
    window.targetY = lastWrapper.offsetHeight - window.windowHeight;
  }

  heavyComputationInitialized = true;
}

// Инициализируем при первом взаимодействии
document.addEventListener(
  'touchstart',
  initHeavyComputations,
  {once: true, passive: true}
);
document.addEventListener('wheel', initHeavyComputations, {once: true});

const lastChildInSection = lastSection?.lastElementChild;

function nextScreen() {
  if (isAnimating) return;

  if (mobileMode && currentIndex === sliderSectionIndex) {
    window.scrollBy({top: window.innerHeight * 0.9, behavior: 'smooth'});
    return;
  }

  if (currentIndex === sliderSectionIndex && !mobileMode) {
    if (currentSlide < lastSlide) return goToSlide(currentSlide + 1);

    if (currentSlide === lastSlide) return goToSection(currentIndex + 1);
  }

  if (currentIndex < lastIndex) {
    goToSection(currentIndex + 1);
  }

  if (currentIndex === lastIndex && !footerVisible) {
    scheduleUIUpdate();
    gsap.to(lastWrapper, {
      scrollTo: {y: 'max', autoKill: false},
      duration: 0.7,
      ease: 'power2.inOut',
      force3D: true,
      onComplete() {
        isAnimating = false;
      },
    });
  } else if (currentIndex === lastIndex && footerVisible) {
    goToSection(0);
  }
}

function checkInnerScroll() {
  if (!lastWrapper) return false;

  const scrollTop = lastWrapper.scrollTop;
  const visibleHeight = lastWrapper.offsetHeight;
  const fullHeight = lastWrapper.scrollHeight;
  const footerHeight = window.footerHeight || 0;

  const bottomDesk =
    scrollTop + visibleHeight >= fullHeight - footerHeight + 100;
  const bottomMob = scrollTop + visibleHeight >= fullHeight - footerHeight;
  const isAtBottom = mobileMode ? bottomMob : bottomDesk;

  return isAtBottom;
}

// Оптимизированный обработчик скролла с throttling
const throttledScrollHandler = throttle(() => {
  footerVisible = checkInnerScroll();
  scheduleUIUpdate();
}, 100);

lastWrapper?.addEventListener('scroll', throttledScrollHandler, {
  passive: true,
});

window.addEventListener('load', () => {
  initHeavyComputations();
  currentIndex = detectCurrentSection();

  if (currentIndex === 0) {
    animationOnStart();
  } else {
    updateSectionsUI(currentIndex);
  }
  updateScrollLock();

  footerVisible = checkInnerScroll();
  updateUI();
});

function updateClassMenu() {
  if (!mobileMode) {
    menuLinks.forEach((link, index) => {
      if (index === currentIndex) {
        gsap.to(link, {
          duration: 0.3,
          ease: 'power2.out',
          overwrite: true,
          force3D: true,
          onStart: () => link.classList.add('active'),
        });
      } else {
        gsap.to(link, {
          duration: 0.3,
          ease: 'power2.out',
          overwrite: true,
          force3D: true,
          onStart: () => link.classList.remove('active'),
        });
      }
    });
  }

  if (mobileMode && currentIndex < 2) {
    menuLinks.forEach((link, index) => {
      const isActive = index === currentIndex;
      gsap.to(link, {
        duration: 0.6,
        ease: 'power2.out',
        overwrite: true,
        force3D: true,
        onStart: () => link.classList.toggle('active', isActive),
      });
    });
    return;
  }

  if (currentIndex === 2) {
    const featuresAnchor = document.querySelector('#features');
    const faqAnchor = document.querySelector('#faq');

    if (!featuresAnchor || !faqAnchor) return;

    const featuresRect = getCachedRect(featuresAnchor, 'features');
    const faqRect = getCachedRect(faqAnchor, 'faq');
    const windowHeight = window.innerHeight;

    // Определяем, что ближе к верху экрана (или уже прошло)
    let activeLink = null;

    // Если #features в зоне видимости или выше середины экрана
    if (featuresRect && (featuresRect.top === 0 || featuresRect.top > -400)) {
      activeLink = menuLinks[2]; // "Фичи"
    }

    // Если #faq уже виден или прошёл верх экрана
    if (faqRect && faqRect.top <= 1000) {
      activeLink = menuLinks[3]; // "Вопросы"
    }

    // Убираем active у всех
    menuLinks.forEach((l) => l.classList.remove('active'));

    // Добавляем нужному
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
}

function updatePaginationWhithSlides(sectionIndex) {
  if (sectionIndex === sliderSectionIndex) return;

  let targetSlide;

  if (sectionIndex < sliderSectionIndex) {
    targetSlide = 0;
  } else {
    targetSlide = lastSlide;
  }

  if (currentSlide === targetSlide) return;

  currentSlide = targetSlide;

  if (targetSlide === 0) {
    gsap.set(sliderWrapper, {xPercent: 0, force3D: true});
  } else {
    gsap.set(sliderWrapper, {xPercent: -100 * lastSlide, force3D: true});
  }

  // Обязательно сбрасываем внутренние элементы!
  if (!mobileMode) {
    gsap.set(
      '.service-swiper__slide .slide__img, .service-swiper__slide .slide__content',
      {
        x: 0,
        clearProps: 'transform,opacity',
        force3D: true,
      }
    );
  }
  window.dispatchEvent(new CustomEvent('slidechange', {detail: targetSlide}));
}

menuLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const index = Number(link.dataset.index);
    const href = link.getAttribute('href');

    if (!mobileMode) {
      goToSection(index);
      return;
    }

    if (mobileMode && index < 2) {
      goToSection(index);
    }

    if (mobileMode && index === 2) {
      const target = document.querySelector(href);
      if (!target) return;
      isAnimating = true;

      const prevIndex = currentIndex;
      const nextIndex = index;

      const transitionTl = runSectionTransition(prevIndex, nextIndex);

      transitionTl.eventCallback('onComplete', () => {
        gsap.to(window, {
          scrollTo: sections[2],
          duration: 0.9,
          ease: 'power2.inOut',
          force3D: true,
          onComplete: () => {
            currentIndex = 2;
            updateClassMenu();
            updateScrollLock();

            gsap.to(lastWrapper, {
              scrollTo: {y: target, offsetY: 90},
              duration: 0.8,
              force3D: true,
              onComplete: () => {
                isAnimating = false;
              },
            });
          },
        });
      });
    }
    if (mobileMode && index === 3) {
      const target = document.querySelector(href);
      if (!target) return;
      isAnimating = true;

      const prevIndex = currentIndex;
      const nextIndex = index;

      const transitionTl = runSectionTransition(prevIndex, nextIndex);

      transitionTl.eventCallback('onComplete', () => {
        menuLinks.forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
        gsap.to(window, {
          scrollTo: sections[2],
          duration: 0.9,
          ease: 'power2.inOut',
          force3D: true,
          onComplete: () => {
            currentIndex = 2;
            updateScrollLock();
            setTimeout(() => {
              isAnimating = false;
            }, 150);
            gsap.to(lastWrapper, {
              scrollTo: {y: target, offsetY: 90},
              duration: 0.8,
              force3D: true,
              onComplete: () => {},
            });
          },
        });
      });
    }
  });
});

footerLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const index = Number(link.dataset.index);

    if (!mobileMode) {
      goToSection(index);
      return;
    }

    if (mobileMode && index < 2) {
      goToSection(index);
      return;
    }
  });
});

document.querySelectorAll('.footer__links-item.s a').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();

    const index = Number(link.dataset.slide) - 1;
    if (isNaN(index)) return;

    // Скролл к секции со слайдером
    isAnimating = true;
    gsap.to(window, {
      scrollTo: sections[2],
      duration: 0.7,
      ease: 'power2.out',
      force3D: true,
      onComplete() {
        if (!mobileMode) {
          currentIndex = 2;
          updatePaginationWhithSlides(index);

          footerVisible = checkInnerScroll();
          updateUI();

          updateClassMenu();
          isAnimating = false;
          goToSlide(index);
        } else {
          currentIndex = 2;
          updateClassMenu();
        }
      },
    });
  });
});

// ============================================
// ПАРАЛЛАКС (ОПТИМИЗИРОВАН)
// ============================================

function enableParallax() {
  // Отключаем параллакс на мобильных и touch устройствах
  if (mobileMode || hasTouch) return;

  const mainImg = document.querySelector('.first-wrapper__img img');
  if (!mainImg) return;

  // Throttling для mousemove (~60 FPS)
  mouseMoveHandler = throttle((e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 50;
    const y = (e.clientY / window.innerHeight - 0.5) * 50;

    gsap.to(mainImg, {
      x: -x,
      y: -y,
      duration: 1.2,
      ease: 'power2.out',
      overwrite: 'auto',
      force3D: true,
    });
  }, 16);

  document.addEventListener('mousemove', mouseMoveHandler, {passive: true});
}

function disableParallax() {
  if (mouseMoveHandler) {
    document.removeEventListener('mousemove', mouseMoveHandler);
    mouseMoveHandler = null;
  }
}

function updateScrollLock() {
  const shouldUnlock =
    (mobileMode && currentIndex === sliderSectionIndex) ||
    currentIndex === lastIndex;

  if (shouldUnlock) {
    unlockScroll();
  } else {
    lockScroll();
  }
}

// ============================================
// МОБИЛЬНЫЕ ОПТИМИЗАЦИИ
// ============================================

if (isMobile()) {
  let lastScrollY = window.scrollY;
  let userWasInSection2 = false;

  // Throttled обработчик для отслеживания входа в секцию 2
  const throttledSection2Check = throttle(() => {
    if (sections[2]) {
      const rect = getCachedRect(sections[2], 'section-2-check');
      if (rect && rect.top <= window.innerHeight * 0.6) {
        userWasInSection2 = true;
      }
    }
  }, 100);

  window.addEventListener('scroll', throttledSection2Check, {passive: true});

  // Throttled обработчик для скролла вверх
  const throttledScrollUp = throttle(() => {
    if (isAnimating) return;
    if (!userWasInSection2) return;

    const goingUp = window.scrollY < lastScrollY;
    lastScrollY = window.scrollY;
    if (!goingUp) return;

    if (currentIndex === 2 && sections[2]) {
      const rect = getCachedRect(sections[2], 'section-2-scroll');
      if (rect && rect.top > 30) {
        isAnimating = true;

        gsap.to(window, {
          scrollTo: sections[1],
          duration: 0.5,
          ease: 'power2.out',
          force3D: true,
          onComplete() {
            currentIndex = 1;
            scheduleUIUpdate();
            isAnimating = false;
            userWasInSection2 = false;
            lockScroll();
          },
        });
      }
    }
  }, 100);

  window.addEventListener('scroll', throttledScrollUp, {passive: true});
}

window.addEventListener('wheel', onwheel, {passive: false});
if (nextBtn) {
  nextBtn.addEventListener('click', nextScreen);
}

// Оптимизированный обработчик скролла окна
window.addEventListener('scroll', scheduleUIUpdate, {passive: true});

// Оптимизированный обработчик resize
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
}, 250);

window.addEventListener('resize', optimizedResize, {passive: true});

// ============================================
// TOUCH СОБЫТИЯ (ОПТИМИЗИРОВАНЫ)
// ============================================

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
    if (mobileMode && currentIndex === lastSection) {
      return;
    }

    if (!touchStartY || isAnimating) return;

    touchEndY = evt.changedTouches[0].screenY;

    // Debounce для предотвращения множественных срабатываний
    if (touchTimeout) clearTimeout(touchTimeout);
    touchTimeout = setTimeout(() => {
      handleSwipe();
      touchTimeout = null;
    }, 50);
  }

  function handleSwipe() {
    const distance = touchStartY - touchEndY;
    const isDownSwipe = distance > minSwipeDistance;
    const isUpSwipe = distance < -minSwipeDistance;

    // Игнорируем слабые движения
    if (!isDownSwipe && !isUpSwipe) return;

    if (!mobileMode) return;

    if (mobileMode && currentIndex === sliderSectionIndex) {
      return;
    }

    if (isAnimating) return;

    if (isDownSwipe && currentIndex < lastIndex) {
      goToSection(currentIndex + 1);
    } else if (isUpSwipe && currentIndex > 0) {
      goToSection(currentIndex - 1);
    }

    touchStartY = 0;
  }

  // Используем passive: true где возможно
  document.addEventListener('touchstart', handleTouchStart, {passive: true});
  document.addEventListener('touchend', handleTouchEnd, {passive: true});
}

