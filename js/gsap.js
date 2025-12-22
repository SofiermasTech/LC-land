gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// состояния
let isAnimating = false;
let isBottom = false;

const config = {
  // секции и обертка различаются, т.к. на моб #section-3 и #section-4 объединяются в одну
  get sections() {
    return mobileMode ? this.mobile : this.desktop;
  },
  get lastWrapper() {
    return mobileMode ? this.lastWrapperMobile : this.lastWrapperDesktop;
  },
  get lastIndex() {
    return this.sections.length - 1;
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
const lastSection = sections[lastIndex];

let currentIndex = detectCurrentSection();
// let currentIndex = 0;

console.log('lastWrapper', lastWrapper);
console.log('lastSection', lastSection);

// остальные кнопки + меню
const menuLinks = document.querySelectorAll('.menu__link');
// const footerLinks = document.querySelectorAll('.footer__links-item.m a');

// слайдер
const sliderSectionIndex = 2;
const sliderWrapper = document.querySelector('.service-swiper__wrapper');
const slides = document.querySelectorAll('.service-swiper__slide');
let currentSlide = 0;
const lastSlide = slides.length - 1;

// mobile
let mouseMoveHandler = null;

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

  const master = gsap.timeline({
    onComplete() {
      currentIndex = nextIndex;
      updateUI();
      // updateSectionsUI(currentIndex);
      updateClassMenu();
      updateScrollLock();
      updatePaginationWhithSlides(nextIndex);

      if (currentIndex === 0) {
        startLightning();
      } else {
        stopLightning();
      }

      if (index === lastIndex) {
        lastWrapper.scrollTop = 0;
      }
      isAnimating = false;
    },
  });

  // updateUI((currentIndex = index));
  master.add(transitionTl);
  master.add(updateUI((currentIndex = index)));
  master.add(scrollTween, '-=0.6');

  // console.log(master);
  // console.log('Переход2 длится:', master.totalDuration(), 'сек');
}

// скролл для десктопа
function onwheel(evt) {
  if (isAnimating) {
    evt.preventDefault();
    return;
  }

  const directionDown = evt.deltaY > 0;
  const directionUp = evt.deltaY < 0;

  if (mobileMode && currentIndex === sliderSectionIndex) {
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
      updateClassMenu();

      const topContentInSection =
        firstChildInSection.getBoundingClientRect().top;

      if (topContentInSection > 10) {
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

function goToSlide(index) {
  if (isAnimating) return;
  if (currentSlide === index) return;

  isAnimating = true;

  const oldIndex = currentSlide;

  // Главный таймлайн
  const masterTl = gsap.timeline({
    onComplete: () => {
      currentSlide = index;
      window.dispatchEvent(new CustomEvent('slidechange', {detail: index}));

      setTimeout(() => {
        isAnimating = false;
      }, 200);
    },
  });

  masterTl.to(
    sliderWrapper,
    {
      xPercent: -100 * index,
      duration: 0.7,
      ease: 'power2.inOut',
      // force3D: true,
    },
    0
  );

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
console.log(lastSection.children[0]);
console.log(lastWrapper.children[0]);

function nextScreen() {
  if (isAnimating) return;
  // checkScrollPosition();

  // if (mobileMode && currentIndex === sliderSectionIndex) {
  //   window.scrollBy({top: window.innerHeight * 0.9, behavior: 'smooth'});
  //   return;
  // }

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

  const bottomDesk =
    scrollTop + visibleHeight >= fullHeight - footerHeight + 50;
  const bottomMob = scrollTop + visibleHeight >= fullHeight - footerHeight;
  const isAtBottom = mobileMode ? bottomMob : bottomDesk;

  // console.log('scrollTop', scrollTop);
  // console.log('visibleHeight', visibleHeight);
  // console.log('fullHeight', fullHeight);
  // console.log('isAtBottom', isAtBottom);
  // console.log('footerHeight', footerHeight);

  return isAtBottom;
}

lastWrapper.addEventListener('scroll', () => {
  footerVisible = checkInnerScroll();

  if (footerVisible) {
    gsap.to(menu, {y: '200%', duration: 0.5, ease: 'power1.out'});
  } else {
    gsap.to(menu, {y: 0, duration: 0.5, ease: 'power1.out'});
  }
  updateUI();
});

if (!mobileMode) {
  window.addEventListener('wheel', onwheel, {passive: false});

  // свободный скролл в посл. секции
  lastWrapper.addEventListener('wheel', (e) => {
    const atTop = lastWrapper.scrollTop <= 0;

    if (e.deltaY < 0) {
      if (!atTop) {
        // скроллим внутр контент до конца
        e.stopPropagation();
        return;
      } else {
        // только когда контент вверху, то переходим на предыдущую секцию
        goToSection(currentIndex - 1);
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  currentIndex = detectCurrentSection();
  // currentIndex = 0;

  if (currentIndex === 0) {
    animationOnStart();
    startLightning();
  } else {
    updateSectionsUI(currentIndex);
    stopLightning();
  }

  updateScrollLock();
  updateUI();
  updateClassMenu();
});

document.addEventListener('load', () => {
  updatePaginationWhithSlides();
  footerVisible = checkInnerScroll();
  // updateUI();
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

  // доп. условия для моб. т.к.последние 2 секции объединяются в одну
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

  // определяем позицию скролла для переключения активного пункта
  if (mobileMode && currentIndex === 2) {
    const featuresAnchor = document.querySelector('#features');
    const faqAnchor = document.querySelector('#faq');

    if (!featuresAnchor || !faqAnchor) return;

    const featuresRect = featuresAnchor.getBoundingClientRect();
    const faqRect = faqAnchor.getBoundingClientRect();

    // console.log(featuresRect.bottom);
    // console.log(faqRect.top);

    let activeLink = null;

    if (featuresRect.top === 0 || featuresRect.top > -700) {
      activeLink = menuLinks[2]; // "Фичи"
    }

    if (faqRect.top <= 700) {
      activeLink = menuLinks[3]; // "Вопросы"
    }

    // Убираем active у всех
    menuLinks.forEach((l) => l.classList.remove('active'));

    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
}

// перематывает слайдер в начало/конец в зависимости от направления перехода по ссылкам
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

// переход по меню и ссылкам в футере
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

    // доп. условия для объединенной секции
    if (mobileMode && index === 2) {
      const target = document.querySelector(href);
      if (!target) return;
      // console.log(target);
      goToSection(2);
    }

    if (mobileMode && index === 3) {
      const target = document.querySelector(href);
      if (!target) return;
      // console.log(target);
      isAnimating = true;

      const prevIndex = currentIndex;
      const nextIndex = index;

      const transitionTl = runSectionTransition(prevIndex, nextIndex);

      transitionTl.eventCallback('onComplete', () => {
        menuLinks.forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
        // переход к секции
        gsap.to(window, {
          scrollTo: sections[2],
          duration: 0.9,
          ease: 'power2.inOut',
          onComplete: () => {
            currentIndex = 2;
            updateUI();
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

// .m a - блок ссылок из меню
document.querySelectorAll('.footer__links-item.m a').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const index = Number(link.dataset.index);
    const href = link.getAttribute('href');

    if (!mobileMode) {
      goToSection(index);
      return;
    }

    if (mobileMode && index <= 2) {
      goToSection(index);
      return;
    }

    if (mobileMode && index === 3) {
      const target = document.querySelector(href);
      if (!target) return;
      // console.log(target);
      isAnimating = true;

      const prevIndex = currentIndex;
      const nextIndex = index;

      const transitionTl = runSectionTransition(prevIndex, nextIndex);

      transitionTl.eventCallback('onComplete', () => {
        // переход к секции
        gsap.to(window, {
          scrollTo: sections[2],
          duration: 0.9,
          ease: 'power2.inOut',
          onComplete: () => {
            currentIndex = 2;
            updateUI();
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

// console.log(mobileSwiperMain);

// footer.s a - блок ссылок для слайдера
document.querySelectorAll('.footer__links-item.s a').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();

    const index = Number(link.dataset.slide) - 1;
    if (isNaN(index)) return;

    isAnimating = true;

    if (!mobileMode) {
      const prevIndex = lastIndex;
      const nextIndex = sliderSectionIndex;
      const transitionTl = runSectionTransition(prevIndex, nextIndex);

      transitionTl.eventCallback('onComplete', () => {
        gsap.to(window, {
          scrollTo: sections[2],
          duration: 0.7,
          ease: 'power2.out',
          onComplete() {
            currentIndex = 2;
            isAnimating = false;

            currentSlide = index;
            gsap.set(sliderWrapper, {xPercent: -100 * index});
            gsap.set(
              '.service-swiper__slide .slide__img, .service-swiper__slide .slide__content',
              {
                x: 0,
                clearProps: 'transform,opacity', // Чистим все states для всех слайдов
              }
            );
            window.dispatchEvent(
              new CustomEvent('slidechange', {detail: index})
            );

            footerVisible = checkInnerScroll();
            updateUI();
            updateClassMenu();
          },
        });
      });
    } else {
      currentIndex = 2;
      updateClassMenu();

      gsap.to(lastWrapper, {
        scrollTo: {y: 0, offsetY: 90},
        duration: 0.8,
        onComplete: () => {
          if (mobileSwiperMain) {
            mobileSwiperMain.slideTo(index, 600);
          }
          isAnimating = false;
        },
      });
    }
  });
});

// паралакс
function enableParallax() {
  if (mobileMode) return;
  const paralaxImg = document.querySelectorAll(
    '.first-wrapper__img .img-paralax'
  );
  if (!paralaxImg) return;

  // const PARALLAX_LAYERS = [40, 34, 28, 22, 16, 10, 4];
  console.log(paralaxImg);
  mouseMoveHandler = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    paralaxImg.forEach((img) => {
      const layerShift = Number(img.dataset.parallax);
      // console.log(img, index);
      gsap.to(img, {
        x: x * layerShift,
        y: y * layerShift,
        duration: 1.5,
        ease: 'power2.out',
        overwrite: 'auto',
      });
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

// для откл скролла на ios
function preventScroll(e) {
  e.preventDefault();
}

function enableTouchBlock() {
  document.addEventListener('touchmove', preventScroll, {passive: false});
}

function disableTouchBlock() {
  document.removeEventListener('touchmove', preventScroll);
}

// function updateScrollLock() {
//   const shouldUnlock =
//     (mobileMode && currentIndex === sliderSectionIndex) ||
//     currentIndex === lastIndex ||
//     (mobileMode && currentIndex === lastIndex);

//   if (shouldUnlock) {
//     unlockScroll();
//     disableTouchBlock();
//   } else {
//     lockScroll();
//     enableTouchBlock();
//   }
// }

function updateScrollLock() {
  const shouldUnlock = currentIndex === lastIndex;

  if (!mobileMode && shouldUnlock) {
    unlockScroll();
  } else {
    lockScroll();
  }

  if (mobileMode) {
    lockScroll();
    enableTouchBlock();
    // lastSection.classList.remove('fixed-section');

    if (shouldUnlock) {
      disableTouchBlock();
      // lastSection.classList.add('fixed-section');
    }
  }
}

// === МОБИЛЬНЫЙ ПЕРЕХОД 2 → 1 ПРИ СВАЙПЕ ВВЕРХ ===

if (isMobile()) {
  let lastWrapperScrollTop = 0;

  // Следим только за внутренним scroll внутри последней секции
  lastWrapper.addEventListener('scroll', () => {
    lastWrapperScrollTop = lastWrapper.scrollTop;
    updateClassMenu();

    if (lastWrapperScrollTop < -5) goToSection(1);
    // if (lastWrapperScrollTop === 0) {
    //   goToSection(1);
    // }
    // console.log(lastWrapperScrollTop);
  });

  // Реагируем именно на свайпы, НЕ на обычный скролл!
  document.addEventListener(
    'touchend',
    (e) => {
      if (isAnimating) return;
      if (currentIndex !== 2) return; // работаем только в секции 2
      lastWrapperScrollTop = lastWrapper.scrollTop;

      const swipeDistance = touchStartY - touchEndY;
      const isSwipeUp = swipeDistance < -minSwipeDistance;

      if (!isSwipeUp) return;

      // Пользователь свайпнул вверх, но внутри секции 2
      // Разрешаем перейти на секцию 1 ТОЛЬКО если контент прокручен в самый верх
      const atTop = lastWrapperScrollTop <= 5;

      if (!atTop) return; // ещё не вверху — не трогаем секции

      // Корректный переход
      if (atTop) {
        goToSection(1);
      }
    },
    {passive: true}
  );
}

if (nextBtn) {
  nextBtn.addEventListener('click', nextScreen);
}

if (!mobileMode) {
  window.addEventListener('scroll', () => {
    updateUI();
    updateClassMenu();
  });
}
window.addEventListener('resize', () => {
  const realCurrentIndex = detectCurrentSection();

  updateScrollLock();

  if (realCurrentIndex !== currentIndex) {
    currentIndex = realCurrentIndex;
    // currentIndex = 0;
    goToSection(currentIndex);
    console.log('Resize → corrected currentIndex to', currentIndex);
  }

  footerVisible = checkInnerScroll();
  updateUI();
  updateClassMenu();
});

// ПОДДЕРЖКА СВАЙПОВ НА МОБИЛЬНЫХ
let touchStartY = 0;
let touchEndY = 0;
const minSwipeDistance = 60;

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

  if (mobileMode && currentIndex === lastIndex) {
    if (lastWrapper.scrollTop > 20) {
      console.log(lastWrapper.scrollTop);
      return;
    }
  }

  if (isAnimating) return;

  if (isDownSwipe && currentIndex < lastIndex) {
    goToSection(currentIndex + 1);
  } else if (isUpSwipe && currentIndex > 0) {
    goToSection(currentIndex - 1);
  }

  touchStartY = 0;
}

document.addEventListener('touchstart', handleTouchStart, {passive: true});
document.addEventListener('touchend', handleTouchEnd, {passive: true});

// запуск анимации 1го экрана
function startLightning() {
  if (lightningInterval) return;

  lightningInterval = setInterval(() => {
    const type = lightnings[currentLightning];
    lightningStrike(type);
    currentLightning = (currentLightning + 1) % lightnings.length;
  }, 6000);
}

function stopLightning() {
  if (!lightningInterval) return;

  clearInterval(lightningInterval);
  lightningInterval = null;

  // очищаем состояние
  scene.classList.remove(...lightnings);
}
