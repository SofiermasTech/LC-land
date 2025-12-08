gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const config = {
  get sections() {
    return mobileMode ? this.mobile : this.desktop;
  },
  get lastIndex() {
    return this.sections.length - 1;
  },
  get lastWrapper() {
    return mobileMode ? this.lastWrapperMobile : this.lastWrapperDesktop;
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
    document.querySelector('.for-mobile-wrapper'), // или querySelector
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

// console.log(sections);
// console.log(currentIndex);

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
// lockScroll();

updateUI();
// updateSectionsUI(currentIndex);
updateClassMenu();
// console.log(mobileMode);
// console.log(currentIndex);

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
  // можешь регулировать момент скролла («-=0.6» означает начать на 0.6 секунды раньше)
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
    updateUI();

    // console.log('footerTop', footerTop);
    // console.log('lastHeight', lastHeight);
    // console.log(lastHeight - footerHeight - windowHeight);
    // console.log(lastHeight - windowHeight);

    if (directionUp) {
      const firstChildInSection = lastSection.children[0];
      updateClassMenu();
      // // console.log(firstChildInSection);
      const topContentInSection =
        firstChildInSection.getBoundingClientRect().top;

      // console.log(topContentInSection);
      // console.log('footerTop', footerTop);

      if (topContentInSection > 10) {
        // lockScroll();
        goToSection(lastIndex - 1);
        return;
      }
    }
  }
}

function detectCurrentSection() {
  let idx = 0;

  sections.forEach((section, i) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.5) idx = i;
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
    },
    0
  );

  // Запускаем анимацию контента параллельно
  const contentTl = animateSlide(oldIndex, index);
  if (contentTl) {
    masterTl.add(contentTl, 0); // стартуем одновременно
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

  // console.log('animateSlide нач');

  const tl = gsap.timeline({defaults: {ease: 'power2.out'}});
  animateSlide.tl = tl;

  const oldImg = oldSlide.querySelector('.slide__img');
  const oldContent = oldSlide.querySelector('.slide__content');
  const newImg = newSlide.querySelector('.slide__img');
  const newContent = newSlide.querySelector('.slide__content');

  const forward = newIndex > oldIndex;

  const oldExitX = forward ? '-150%' : '150%';
  const newEnterX = forward ? '150%' : '-150%';

  gsap.set([newImg, newContent], {x: newEnterX});
  // вперед
  if (forward) {
    tl.to(oldImg, {x: oldExitX, duration: 0.4});
    tl.to(oldContent, {x: oldExitX, duration: 0.4});

    tl.to(newImg, {x: '0%', duration: 0.4}, '-=0.15');
    tl.to(newContent, {x: '0%', duration: 0.4});
    // console.log('animateSlide конец1');
  } else {
    // назад
    tl.to(oldContent, {x: oldExitX, duration: 0.4});
    tl.to(oldImg, {x: oldExitX, duration: 0.3});

    tl.to(newContent, {x: '0%', duration: 0.3}, '-=0.05');
    tl.to(newImg, {x: '0%', duration: 0.4});

    // console.log('animateSlide конец2');
  }
  return tl;
}

const footer = document.querySelector('.footer').getBoundingClientRect();
const faq = document.querySelector('.faq').getBoundingClientRect();
const footerTop = footer.top;
const footerHeight = document.querySelector('.footer').offsetHeight;
const lastHeight = document.querySelector('.section-last-wrapper').scrollHeight;
const faqStart = faq.top;
const faqEnd = faq.bottom;
const windowHeight = window.innerHeight;
const targetY = lastWrapper.offsetHeight - windowHeight;
// // console.log('footerTop', footerTop);
// // console.log('footerBottom', footer.bottom);
// // console.log('lastHeight', lastHeight);
// // console.log('footerHeight', footerHeight);
// // console.log('faqStart', faqStart);
// // console.log('faqEnd', faqEnd);
// // console.log('isBottom', isBottom);
// // console.log(window.scrollY);
// // console.log(targetY);
// // console.log('windowHeight', windowHeight);

const lastChildInSection = lastSection.lastElementChild;
// console.log(lastChildInSection.getBoundingClientRect().bottom);

function nextScreen() {
  if (isAnimating) return;
  // checkScrollPosition();

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
    updateUI();
    gsap.to(lastWrapper, {
      scrollTo: {y: 'max', autoKill: false},
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete() {
        isAnimating = false;
        // isBottom = true;
      },
    });
  } else if (currentIndex === lastIndex && footerVisible) {
    // isBottom = false;
    goToSection(0);
  }
}

function checkInnerScroll() {
  const scrollTop = lastWrapper.scrollTop; // текущий скролл
  const visibleHeight = lastWrapper.offsetHeight; // видимая область
  const fullHeight = lastWrapper.scrollHeight; // полная высота контента

  // const featuresAnchor = document.querySelector('#features');
  // const faqAnchor = document.querySelector('#faq');

  // if (!featuresAnchor || !faqAnchor) return;

  // const featuresRect = featuresAnchor.getBoundingClientRect();
  // const faqRect = faqAnchor.getBoundingClientRect();
  const bottomDesk =
    scrollTop + visibleHeight >= fullHeight - footerHeight + 100;
  const bottomMob = scrollTop + visibleHeight >= fullHeight - footerHeight;
  const isAtBottom = mobileMode ? bottomMob : bottomDesk;

  // console.log('scrollTop', scrollTop);
  // console.log('visibleHeight', visibleHeight);
  // console.log('fullHeight', fullHeight);
  // console.log('isAtBottom', isAtBottom);
  // console.log('footerHeight', footerHeight);
  // // console.log('isBottom', isBottom);
  // // console.log('featuresRect.top', featuresRect.top);
  // // console.log('faqRect.top', faqRect.top);
  return isAtBottom;
}

lastWrapper.addEventListener('scroll', () => {
  footerVisible = checkInnerScroll();
  updateUI();
});

window.addEventListener('load', () => {
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
  // console.log('меню нач');
  if (!mobileMode) {
    menuLinks.forEach((link, index) => {
      if (index === currentIndex) {
        gsap.to(link, {
          duration: 0.3,
          ease: 'power2.out',
          overwrite: true,
          onStart: () => link.classList.add('active'),
        });
      } else {
        gsap.to(link, {
          duration: 0.3,
          ease: 'power2.out',
          overwrite: true,
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
        onStart: () => link.classList.toggle('active', isActive),
      });
    });
    return;
  }

  if (currentIndex === 2) {
    const featuresAnchor = document.querySelector('#features');
    const faqAnchor = document.querySelector('#faq');

    if (!featuresAnchor || !faqAnchor) return;

    const featuresRect = featuresAnchor.getBoundingClientRect();
    const faqRect = faqAnchor.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // console.log(featuresRect.bottom);
    // console.log(faqRect.top);

    // Определяем, что ближе к верху экрана (или уже прошло)
    let activeLink = null;

    // Если #features в зоне видимости или выше середины экрана
    if (featuresRect.top === 0 || featuresRect.top > -400) {
      activeLink = menuLinks[2]; // "Фичи"
    }

    // Если #faq уже виден или прошёл верх экрана
    if (faqRect.top <= 1000) {
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
    gsap.set(sliderWrapper, {xPercent: 0});
  } else {
    gsap.set(sliderWrapper, {xPercent: -100 * lastSlide});
  }

  // Обязательно сбрасываем внутренние элементы!
  if (!mobileMode) {
    gsap.set(
      '.service-swiper__slide .slide__img, .service-swiper__slide .slide__content',
      {
        x: 0,
        clearProps: 'transform,opacity',
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
      // return;
    }
    // console.log(href);
    if (mobileMode && index === 2) {
      const target = document.querySelector(href);
      if (!target) return;
      // console.log(target);
      isAnimating = true;

      const prevIndex = currentIndex;
      const nextIndex = index;

      const transitionTl = runSectionTransition(prevIndex, nextIndex);

      // 2. Ждём, пока анимация перехода полностью завершится
      transitionTl.eventCallback('onComplete', () => {
        gsap.to(window, {
          scrollTo: sections[2], // сначала к секции
          duration: 0.9,
          ease: 'power2.inOut',
          onComplete: () => {
            currentIndex = 2;
            updateClassMenu();
            updateScrollLock();

            // потом к якорю
            gsap.to(lastWrapper, {
              scrollTo: {y: target, offsetY: 90},
              duration: 0.8,
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
      // console.log(target);
      isAnimating = true;

      const prevIndex = currentIndex;
      const nextIndex = index;

      const transitionTl = runSectionTransition(prevIndex, nextIndex);

      // 2. Ждём, пока анимация перехода полностью завершится
      transitionTl.eventCallback('onComplete', () => {
        menuLinks.forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
        gsap.to(window, {
          scrollTo: sections[2], // сначала к секции
          duration: 0.9,
          ease: 'power2.inOut',
          onComplete: () => {
            currentIndex = 2;
            // updateClassMenu();
            updateScrollLock();
            setTimeout(() => {
              isAnimating = false;
            }, 150);
            // потом к якорю
            gsap.to(lastWrapper, {
              scrollTo: {y: target, offsetY: 90},
              duration: 0.8,
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

    // currentIndex = 3;
    // console.log(link);
    // console.log(currentIndex);
    // console.log(Number(link.dataset.slide));
    const index = Number(link.dataset.slide) - 1;
    if (isNaN(index)) return;

    // Скролл к секции со слайдером
    isAnimating = true;
    gsap.to(window, {
      scrollTo: sections[2],
      duration: 0.7,
      ease: 'power2.out',
      onComplete() {
        // isAnimating = false;
        if (!mobileMode) {
          currentIndex = 2;
          updatePaginationWhithSlides(index);

          footerVisible = checkInnerScroll();
          updateUI();

          updateClassMenu();
          // setTimeout(() => {
          isAnimating = false;
          // }, 350);
          goToSlide(index);
        } else {
          currentIndex = 2;
          updateClassMenu();
        }
      },
    });
  });
});

// паралакс
function enableParallax() {
  const mainImg = document.querySelector('.first-wrapper__img img');
  if (!mainImg) return;

  mouseMoveHandler = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 50;
    const y = (e.clientY / window.innerHeight - 0.5) * 50;

    gsap.to(mainImg, {
      x: -x,
      y: -y,
      duration: 1.2,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  document.addEventListener('mousemove', mouseMoveHandler);
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

if (isMobile()) {
  let lastScrollY = window.scrollY;
  let userWasInSection2 = false;

  // Фиксируем факт входа в секцию 2
  window.addEventListener('scroll', () => {
    if (sections[2].getBoundingClientRect().top <= window.innerHeight * 0.6) {
      userWasInSection2 = true;
    }
  });

  window.addEventListener(
    'scroll',
    () => {
      if (isAnimating) return;
      if (!userWasInSection2) return;

      const goingUp = window.scrollY < lastScrollY;
      lastScrollY = window.scrollY;
      if (!goingUp) return;

      if (currentIndex === 2 && sections[2].getBoundingClientRect().top > 30) {
        // console.log('start');
        isAnimating = true;

        gsap.to(window, {
          scrollTo: sections[1],
          duration: 0.5,
          ease: 'power2.out',
          onComplete() {
            currentIndex = 1;
            updateUI();
            updateClassMenu();
            isAnimating = false;
            userWasInSection2 = false;
            lockScroll();
          },
        });
      }
    },
    {passive: true}
  );
}

window.addEventListener('wheel', onwheel, {passive: false});
if (nextBtn) {
  nextBtn.addEventListener('click', nextScreen);
}

window.addEventListener('scroll', () => {
  updateUI();
  updateClassMenu();
});
window.addEventListener('resize', () => {
  const realCurrentIndex = detectCurrentSection();

  updateScrollLock();

  if (realCurrentIndex !== currentIndex) {
    currentIndex = realCurrentIndex;
    goToSection(currentIndex);
    // console.log('Resize → corrected currentIndex to', currentIndex);
  }

  footerVisible = checkInnerScroll();
  updateUI();

  if (mobileMode && currentIndex === lastSection) {
    unlockScroll();
  } else {
    lockScroll();
  }
});

// document.addEventListener('DOMContentLoaded', (evt) => {
// ПОДДЕРЖКА СВАЙПОВ НА МОБИЛЬНЫХ
let touchStartY = 0;
let touchEndY = 0;
const minSwipeDistance = 50;

function handleTouchStart(evt) {
  touchStartY = evt.changedTouches[0].screenY;
}

function handleTouchEnd(evt) {
  if (mobileMode && currentIndex === lastSection) {
    return;
  }

  if (!touchStartY) return;

  touchEndY = evt.changedTouches[0].screenY;
  handleSwipe();
}

function handleSwipe(evt) {
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
    // evt.preventDefault();
    goToSection(currentIndex + 1);
  } else if (isUpSwipe && currentIndex > 0) {
    // evt.preventDefault();
    goToSection(currentIndex - 1);
  }

  touchStartY = 0;
}

// Подписываемся на touch-события
document.addEventListener('touchstart', handleTouchStart, {passive: false});
document.addEventListener('touchend', handleTouchEnd, {passive: false});
// });
