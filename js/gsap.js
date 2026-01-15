gsap.registerPlugin(ScrollToPlugin);

// const originalTo = gsap.to;
// gsap.to = function (targets, vars) {
//   console.log('GSAP.to', {
//     targets,
//     vars,
//     stack: new Error().stack.split('\n')[2],
//   });
//   return originalTo.call(this, targets, vars);
// };

// состояния
let isAnimating = false;
let currentIndex = 0;
let reachedTopLock = false;

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
const windowHeight = window.innerHeight;

// console.log('lastWrapper', lastWrapper);
// console.log('lastSection', lastSection);

// остальные элм + меню
const menuLinks = document.querySelectorAll('.menu__link');
const menuIndicator = document.querySelectorAll('.menu__indicator');
const footer = document.querySelector('.footer').getBoundingClientRect();
const footerHeight = document.querySelector('.footer').offsetHeight;
let footerTriggerY = null;

// слайдер
const sliderSectionIndex = 2;
const sliderWrapper = document.querySelector('.service-swiper__wrapper');
const slides = document.querySelectorAll('.service-swiper__slide');
let currentSlide = 0;
const lastSlide = slides.length - 1;

// mobile
let mouseMoveHandler = null;
const themeMeta = document.querySelector('meta[name="theme-color"]');

// переход мкжду секциями + таймлайн анимаций
function goToSection(index) {
  if (isAnimating) return;
  isAnimating = true;

  // console.group('goToSection');
  // console.log('from → to', currentIndex, '→', index);
  // console.log('isAnimating', isAnimating);
  // console.groupEnd();

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
      updateScrollLock();
      updatePaginationWhithSlides(nextIndex);

      // аним комет
      if (currentIndex === 0) {
        startLightning();
      } else {
        stopLightning();
      }

      // убираем прозрачность 1го слайда
      if (currentIndex === sliderSectionIndex && !mobileMode) {
        setActiveSlide(currentSlide);
      }

      // поднимаем контент секц. со свободным скролом, чтоб не залипал
      if (index === lastIndex && !mobileMode) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            lastWrapper.scrollTop = 0;
          });
        });
      }

      // попвтка покрасить ui-bar
      if (mobileMode) {
        updateThemeColor(currentIndex);
      }
      isAnimating = false;
    },
  });

  master.add(transitionTl);
  master.add(() => {
    updateClassMenu((currentIndex = index));
    updateUI((currentIndex = index));
  }, '<');
  master.add(scrollTween, '-=0.6');
  // console.log(master);
}

// скролл для десктопа
function onwheel(evt) {
  if (isAnimating) {
    evt.preventDefault();
    return;
  }

  // console.log('WHEEL', {
  //   deltaY: evt.deltaY,
  //   currentIndex,
  //   scrollTop: lastWrapper.scrollTop,
  //   scrollHeight: lastWrapper.scrollHeight,
  //   isAnimating,
  // });

  const directionDown = evt.deltaY > 0;
  const directionUp = evt.deltaY < 0;

  if (mobileMode && currentIndex === sliderSectionIndex) {
    return;
  }

  if (currentIndex === sliderSectionIndex && !mobileMode) {
    evt.preventDefault();
    setActiveSlide(currentSlide);

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

// определение секции
// function detectCurrentSection() {
//   let idx = 0;

//   sections.forEach((section, i) => {
//     const rect = section.getBoundingClientRect();
//     if (rect.top <= window.innerHeight * 0.5) idx = i;
//   });
//   return idx;
// }

function lockScroll() {
  document.documentElement.style.overflowY = 'hidden';
  document.body.style.overflowY = 'hidden';
}

function unlockScroll() {
  document.documentElement.style.overflowY = 'auto';
  document.body.style.overflowY = 'auto';
}

// Оптимизация обновлений UI через requestAnimationFrame
// было в приступе отчаяния. наверное потом уберу
let rafId = null;
let pendingUIUpdate = false;

function scheduleUIUpdate() {
  if (pendingUIUpdate) return;
  pendingUIUpdate = true;
  // console.log('scheduleUIUpdate');
  if (rafId) cancelAnimationFrame(rafId);

  rafId = requestAnimationFrame(() => {
    updateUI();
    updateClassMenu();
    pendingUIUpdate = false;
    rafId = null;
  });
}

// убирает opacity актив.слайда (изначально оно 0, т.к.
// обертка свайпера без overflow:hidden, чтобы слайды уезжали за экран и не было видно след.слайд)
function setActiveSlide(index) {
  if (currentIndex !== sliderSectionIndex) return;

  console.log('active slie', index);
  slides.forEach((slide, i) => {
    const img = slide.querySelector('.slide__img');
    const content = slide.querySelector('.slide__content');

    if (i === index) {
      gsap.to([img, content], {
        opacity: 1,
      });
    } else {
      gsap.set([img, content], {
        opacity: 0,
      });
    }
  });
}

// ширина нужна для корректного перелистывания без сдивогов
function getSlideWidth() {
  return slides[0]?.getBoundingClientRect().width || 0;
}

function goToSlide(index) {
  if (isAnimating) return;
  if (currentSlide === index) return;

  isAnimating = true;

  const oldIndex = currentSlide;
  const slideWidth = getSlideWidth();
  const targetX = -slideWidth * index;

  // Главный таймлайн
  const masterTl = gsap.timeline({
    onComplete: () => {
      // console.log(index);
      currentSlide = index;
      // для обновления пагинации
      window.dispatchEvent(new CustomEvent('slidechange', {detail: index}));

      // след. два пункта - меняем надпись у кнопки на последнем слайде
      if (currentSlide === lastSlide) {
        updateUI();
      }

      if (oldIndex === lastSlide && index === lastSlide - 1) {
        updateUI();
      }

      setActiveSlide(currentSlide);

      // таймаут для мышек с сильной инерцией
      setTimeout(() => {
        isAnimating = false;
      }, 200);
    },
  });

  masterTl.to(
    sliderWrapper,
    {
      x: targetX,
      duration: 0.7,
      ease: 'power2.inOut',
    },
    0
  );

  const contentTl = animateSlide(oldIndex, index);
  if (contentTl) {
    masterTl.add(contentTl, 0);
  }
}

function animateSlide(oldIndex, newIndex) {
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

  gsap.set([newImg, newContent], {x: newEnterX, opacity: 1});
  // вперед
  if (forward) {
    tl.to(oldImg, {x: oldExitX, opacity: 0, duration: 0.4});
    tl.to(oldContent, {x: oldExitX, opacity: 0, duration: 0.4});

    tl.to(newImg, {x: '0%', opacity: 1, duration: 0.4}, '-=0.15');
    tl.to(newContent, {x: '0%', opacity: 1, duration: 0.4});
    // console.log('animateSlide конец1');
  } else {
    // назад
    tl.to(oldContent, {x: oldExitX, opacity: 0, duration: 0.4});
    tl.to(oldImg, {x: oldExitX, opacity: 0, duration: 0.3});

    tl.to(newContent, {x: '0%', opacity: 1, duration: 0.3}, '-=0.05');
    tl.to(newImg, {x: '0%', opacity: 1, duration: 0.4});
    // console.log('animateSlide конец2');
  }
  return tl;
}

// переход по кнопке
function nextScreen() {
  if (isAnimating) return;

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
      },
    });
  } else if (currentIndex === lastIndex && footerVisible) {
    goToSection(0);
  }
}

if (nextBtn) {
  nextBtn.addEventListener('click', nextScreen);
}

// определяем позицию скролла в последней секции
function checkInnerScroll() {
  const scrollTop = lastWrapper.scrollTop; // текущий скролл
  const visibleHeight = lastWrapper.offsetHeight; // видимая область
  const fullHeight = lastWrapper.scrollHeight; // полная высота контента

  const bottomDesk =
    scrollTop + visibleHeight >= fullHeight - footerHeight + 150;
  const bottomMob = scrollTop + visibleHeight >= fullHeight - footerHeight;
  const isAtBottom = mobileMode ? bottomMob : bottomDesk;

  // console.log('start checkInnerScroll')

  return isAtBottom;
}

function showMenu() {
  gsap.to(menu, {
    y: 0,
    duration: 0.5,
    ease: 'power1.out',
    // overwrite: 'auto',
  });
}

function hideMenu() {
  gsap.to(menu, {
    y: '200%',
    duration: 0.5,
    ease: 'power1.out',
    // overwrite: 'auto',
  });
}

// убираем меню в конце
lastWrapper.addEventListener('scroll', () => {
  if (isLayoutChanging) return;

  footerVisible = safeCheckInnerScroll();

  if (footerVisible === lastFooterState) return;

  lastFooterState = footerVisible;
  console.log(footerVisible);

  if (footerVisible) {
    hideMenu();
    updateUI();
  } else {
    showMenu();
    updateUI();
  }
});

// переход из посл.секции назад
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
  currentIndex = 0;
  updateSectionsUI(0);
  animationOnStart();
  startLightning();
  updateScrollLock();
  updateUI();
  updateClassMenu();
});

document.addEventListener('load', () => {
  updatePaginationWhithSlides();
  footerVisible = checkInnerScroll();
});

// передвигает активный пункт меню
function moveIndicatorMenu(link) {
  const nav = link.parentElement;
  const navRect = nav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();

  const x = linkRect.left - navRect.left - 4;

  gsap.to(menuIndicator, {
    x,
    duration: 0.5,
    ease: 'power3.out',
  });
  // console.log('меню конец');
}

// добавляет актив класс для css + вызов индикатора
function updateClassMenu() {
  // console.log('меню нач');

  let activeLink = null;

  if (!mobileMode) {
    activeLink = menuLinks[currentIndex];

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

    moveIndicatorMenu(activeLink);
    return;
  }

  // доп. условия для моб. т.к.последние 2 секции объединяются в одну
  if (mobileMode && currentIndex < 2) {
    activeLink = menuLinks[currentIndex];

    menuLinks.forEach((link, index) => {
      const isActive = index === currentIndex;
      gsap.to(link, {
        duration: 0.6,
        ease: 'power2.out',
        overwrite: true,
        onStart: () => link.classList.toggle('active', isActive),
      });
    });

    moveIndicatorMenu(activeLink);
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

    moveIndicatorMenu(activeLink);
  }
}

// перематывает слайдер в начало/конец в зависимости от направления перехода по ссылкам
function updatePaginationWhithSlides(sectionIndex) {
  if (mobileMode) return;
  if (sectionIndex === sliderSectionIndex) return;

  let targetSlide;

  if (sectionIndex < sliderSectionIndex) {
    targetSlide = 0;
  } else {
    targetSlide = lastSlide;
    updateUI();
  }

  if (currentSlide === targetSlide) return;

  currentSlide = targetSlide;
  const slideWidth = getSlideWidth();
  const targetX = -slideWidth * targetSlide;

  if (targetSlide === 0) {
    gsap.set(sliderWrapper, {x: 0});
  } else {
    gsap.set(sliderWrapper, {x: targetX});
  }

  gsap.set(
    '.service-swiper__slide .slide__img, .service-swiper__slide .slide__content',
    {
      x: 0,
      clearProps: 'transform,opacity',
    }
  );

  setActiveSlide(currentSlide);
  window.dispatchEvent(new CustomEvent('slidechange', {detail: targetSlide}));
}

// переход по меню и ссылкам в футере
menuLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const index = Number(link.dataset.index);
    const href = link.getAttribute('href');

    if (!mobileMode) {
      if (currentIndex === index) return;
      goToSection(index);
      return;
    }

    if (mobileMode && index < 2) {
      if (currentIndex === index) return;
      gsap.to(lastWrapper, {
        scrollTo: {y: 0},
      });
      goToSection(index);
    }

    // доп. условия для объединенной секции
    if (mobileMode && index === 2) {
      if (currentIndex === index && lastWrapper.scrollTop < 600) return;
      const target = document.querySelector(href);
      if (!target) return;

      if (lastWrapper.scrollTop > 600) {
        isAnimating = true;
        updateSectionsUI(2);
        gsap.to(lastWrapper, {
          scrollTo: {y: 0},
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            currentIndex = 2;
            // updateSectionsUI(currentIndex);
            updateUI();
            updateScrollLock();
            setTimeout(() => {
              isAnimating = false;
            }, 150);
          },
        });

        return;
      }

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
        // переход к секции
        gsap.to(window, {
          scrollTo: sections[2],
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            currentIndex = 2;
            updateUI();
            updateScrollLock();
            menuLinks.forEach((l) => l.classList.remove('active'));
            link.classList.add('active');
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

// footer.m a - блок ссылок из меню
document.querySelectorAll('.footer__links-item.m a').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const index = Number(link.dataset.index);
    const href = link.getAttribute('href');

    if (!mobileMode) {
      goToSection(index);
      return;
    }

    if (mobileMode && index <= 1) {
      gsap.to(lastWrapper, {
        scrollTo: {y: 0},
      });
      goToSection(index);
      return;
    }

    if (mobileMode && index === 2) {
      const target = document.querySelector(href);
      if (!target) return;

      if (lastWrapper.scrollTop > 600) {
        isAnimating = true;

        gsap.to(lastWrapper, {
          scrollTo: {y: 0},
          duration: 0.9,
          ease: 'power2.out',
          onComplete: () => {
            currentIndex = 2;
            updateUI();
            updateScrollLock();
            setTimeout(() => {
              isAnimating = false;
            }, 150);
          },
        });

        return;
      }

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
        // переход к секции
        gsap.to(window, {
          scrollTo: sections[2],
          duration: 0.9,
          ease: 'power2.inOut',
          onComplete: () => {
            currentIndex = 2;
            updateSectionsUI(currentIndex);
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
            const slideWidth = getSlideWidth();
            const targetX = -slideWidth * index;

            gsap.set(sliderWrapper, {x: targetX});
            gsap.set(
              '.service-swiper__slide .slide__img, .service-swiper__slide .slide__content',
              {
                x: 0,
                clearProps: 'transform,opacity',
              }
            );
            setActiveSlide(currentSlide);
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
      updateSectionsUI(currentIndex);
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

// для откл скролла на ios - фиксила баги (вроде длинный скролл)
function preventScroll(e) {
  e.preventDefault();
}

function enableTouchBlock() {
  document.addEventListener('touchmove', preventScroll, {passive: false});
}

function disableTouchBlock() {
  document.removeEventListener('touchmove', preventScroll);
}

// управление скроллом
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

    if (shouldUnlock) {
      disableTouchBlock();
      unlockScroll();
    }
  }
}

// попытка покрасить ui-bar
function updateThemeColor(currentIndex) {
  if (!themeMeta) return;

  if (currentIndex <= 1) {
    themeMeta.setAttribute('content', '#000015');
  } else {
    themeMeta.setAttribute('content', '#f2f2f2');
  }
}

// === МОБИЛЬНЫЙ ПЕРЕХОД 2 → 1 ПРИ СВАЙПЕ ВВЕРХ ===
if (isMobile()) {
  let lastWrapperScrollTop = 0;

  lastWrapper.addEventListener('scroll', () => {
    lastWrapperScrollTop = lastWrapper.scrollTop;
    updateClassMenu();
    // console.log(lastWrapper.scrollTop);
    // принудительная остановка в нач.секции, только потом переход назад
    if (lastWrapperScrollTop <= 0) {
      reachedTopLock = true;
    } else {
      reachedTopLock = false;
    }
  });

  document.addEventListener(
    'touchend',
    () => {
      if (isAnimating) return;
      if (currentIndex !== 2) return; // free-scroll секция

      const duration = Date.now() - touchStartTime;
      if (duration > MAX_SWIPE_DURATION) return;

      const swipeDistance = touchStartY - touchEndY;
      const isSwipeUp = swipeDistance < -minSwipeDistance;

      if (!isSwipeUp) return;

      // сначала должны упереться
      if (!reachedTopLock) return;

      // Осознанный второй свайп
      reachedTopLock = false;
      goToSection(1);
    },
    {passive: true}
  );
}

// if (!mobileMode) {
//   window.addEventListener('scroll', () => {
//     updateUI();
//     updateClassMenu();
//   });
// }

function hardResetOnResize() {
  isAnimating = true;
  // Останавливаем gsap
  gsap.globalTimeline.clear();
  gsap.killTweensOf('*');

  currentIndex = 0;
  currentSlide = 0;
  footerVisible = false;

  // Скроллим в самый верх
  window.scrollTo({top: 0, left: 0, behavior: 'instant'});
  // принудительная перезагрузка при ресайзе
  location.reload();
}

let lastWidth = window.innerWidth;
// let lastHeight = window.innerHeight;

window.addEventListener('resize', () => {
  if (Math.abs(window.innerWidth - lastWidth) < 25) return;

  lastWidth = window.innerWidth;
  // lastHeight = window.innerHeight;
  hardResetOnResize();
});

// ПОДДЕРЖКА СВАЙПОВ НА МОБИЛЬНЫХ
// привязка свайпа к дате - это последняя стадия отчаяния багов
let touchStartY = 0;
let touchEndY = 0;
const minSwipeDistance = 90;
let touchStartTime = 0;
const MAX_SWIPE_DURATION = 400;

function handleTouchStart(evt) {
  touchStartY = evt.changedTouches[0].clientY;
  touchStartTime = Date.now();
}

function handleTouchEnd(evt) {
  if (mobileMode && currentIndex === lastSection) {
    return;
  }

  if (!touchStartY) return;

  touchEndY = evt.changedTouches[0].clientY;
  handleSwipe();
}

function handleSwipe(evt) {
  const duration = Date.now() - touchStartTime;

  // медленный жест — считаем скроллом
  if (duration > MAX_SWIPE_DURATION) {
    resetTouch();
    return;
  }

  const distance = touchStartY - touchEndY;
  const isDownSwipe = distance > minSwipeDistance;
  const isUpSwipe = distance < -minSwipeDistance;

  // Игнорируем слабые движения
  if (!isDownSwipe && !isUpSwipe) {
    resetTouch();
    return;
  }

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

  resetTouch();
}

function resetTouch() {
  touchStartY = 0;
  touchEndY = 0;
  touchStartTime = 0;
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

// остановка аним для других секций
function stopLightning() {
  if (!lightningInterval) return;

  clearInterval(lightningInterval);
  lightningInterval = null;

  // очищаем состояние
  scene.classList.remove(...lightnings);
}
