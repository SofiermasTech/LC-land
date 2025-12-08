gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const sections = Array.from(document.querySelectorAll('.section'));
const nextBtn = document.querySelector('.btn-scroll');
const iconDown = document.querySelector('.icon-down');
const iconDownSvg = iconDown.querySelector('svg');
const iconUp = document.querySelector('.icon-up');
const nextBtnText = document.querySelector('.btn-scroll-text');
const nextBtnTexts = [
  'У нас условия<br> с ума сойдешь',
  'А что там за фичи<br> у вас такие?',
  'Хочешь, покажем<br> еще одну фичу?',
];

// остальные кнопки + меню
const menuLinks = document.querySelectorAll('.menu__link');
const menuWrapper = document.querySelector('.menu__wrapper');
const tgBtn = document.querySelectorAll('.controls__tg');
const tgBtnText = document.querySelectorAll('.tg__text');
const footerLinks = document.querySelectorAll('.footer__links-item.m a');

const lastIndex = sections.length - 1;

// сладер
const sliderSectionIndex = 2;
const sliderWrapper = document.querySelector('.service-swiper__wrapper');
const slides = Array.from(
  document.querySelectorAll('.service-swiper__slide') || []
);
let currentSlide = 0;
const lastSlide = slides.length - 1;

const state = {
  currentIndex: 0,
  isAnimating: false,
  isBottom: false,
  mode: null, // mob - desk
};

function updateMode() {
  state.mode = isMobile() ? 'mobile' : 'desktop';
}

/** Возвращает абсолютную позицию секции относительно документа */
function getSectionTop(index) {
  const el = sections[index];
  return el ? el.getBoundingClientRect().top + window.scrollY : 0;
}

/** Проверяет, имеет ли элемент внутренний скролл (overflow + scrollable content) */
function isElementScrollable(el) {
  if (!el) return false;
  const overflowY = getComputedStyle(el).overflowY;
  return (
    (overflowY === 'auto' || overflowY === 'scroll') &&
    el.scrollHeight > el.clientHeight
  );
}

lockScroll();

function goToSection(index) {
  if (state.isAnimating) return;
  state.isAnimating = true;

  gsap.to(window, {
    scrollTo: {y: sections[index], autoKill: false},
    duration: 0.5,
    onComplete() {
      state.currentIndex = index;
      state.isAnimating = false;
      updateAfterSectionChange();

      if (index === lastIndex && state.mode === 'desktop') {
        unlockScroll();
      } else if (index < lastIndex ) {
        lockScroll();
      }
    },
    onInterrupt() {
      state.isAnimating = false;
    },
  });
}

function onwheel(evt) {
  if (isMobile()) return;

  if (state.isAnimating) {
    evt.preventDefault();
    return;
  }

  if (evt.deltaY < 5) return;

  const directionDown = evt.deltaY > 0;
  const directionUp = evt.deltaY < 0;

  if (state.currentIndex === sliderSectionIndex) {
    evt.preventDefault();

    if (directionDown) {
      if (currentSlide < lastSlide) return goToSlide(currentSlide + 1);
      return goToSection(state.currentIndex + 1);
    }

    if (directionUp) {
      if (currentSlide > 0) return goToSlide(currentSlide - 1);
      return goToSection(state.currentIndex - 1);
    }
  }

  if (state.currentIndex < lastIndex) {
    evt.preventDefault();

    if (directionDown) {
      // state.currentIndex++;
      // console.log(state.currentIndex);
      goToSection(state.currentIndex + 1);
    }

    if (directionUp && state.currentIndex > 0) {
      // state.currentIndex--;
      // console.log(state.currentIndex);
      goToSection(state.currentIndex - 1);
    }
    return;
  }

  if (state.currentIndex === lastIndex) {
    if (directionDown) return;

    if (directionUp) {
      const lastSection = sections[state.currentIndex];
      const topOfLastSection = lastSection.offsetTop;

      if (window.scrollY <= topOfLastSection + 20) {
        if (state.currentIndex > 0) {
          // state.currentIndex--;
         return goToSection(lastIndex - 1);
        }
      }

      
    }
  }
}

function updateAfterSectionChange() {}

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
  if (state.isAnimating) return;
  if (currentSlide === index) return;

  state.isAnimating = true;

  const oldIndex = currentSlide;

  // Главный таймлайн — управляет всем
  const masterTl = gsap.timeline({
    onComplete: () => {
      state.isAnimating = false;
      currentSlide = index;
      window.dispatchEvent(new CustomEvent('slidechange', {detail: index}));
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

  console.log('animateSlide нач');

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
    console.log('animateSlide конец1');
  } else {
    // назад
    tl.to(oldContent, {x: oldExitX, duration: 0.4});
    tl.to(oldImg, {x: oldExitX, duration: 0.3});

    tl.to(newContent, {x: '0%', duration: 0.3}, '-=0.05');
    tl.to(newImg, {x: '0%', duration: 0.4});

    console.log('animateSlide конец2');
  }
  return tl;
}

function nextScreen() {
  if (state.isAnimating) return;

  if (mobileMode && state.currentIndex === sliderSectionIndex) {
    window.scrollBy({top: window.innerHeight * 0.9, behavior: 'smooth'});
    return;
  }

  if (state.currentIndex === sliderSectionIndex && !mobileMode) {
    if (currentSlide < lastSlide) {
      goToSlide(currentSlide + 1);
      return;
    }

    if (currentSlide === lastSlide) {
      goToSection(state.currentIndex + 1);
      return;
    }
  }

  if (state.currentIndex < lastIndex) {
    goToSection(state.currentIndex + 1);
  } else if (state.currentIndex === lastIndex) {
    gsap.to(window, {
      scrollTo: {y: window.scrollY + window.innerHeight},
      duration: 1,
      ease: 'power2.inOut',
      onComplete() {
        isAnimating = false;
      },
    });
  }
}

function checkScrollPosition() {
  const menu = document.querySelector('.menu');
  const footer = document.querySelector('.footer').getBoundingClientRect();
  const windowHeight = window.innerHeight;

  const footerVisible = footer.top < windowHeight && footer.bottom > 0;

  // console.log(footer.top);
  // console.log(footer.bottom);
  // console.log(footerVisible);
  // console.log(windowHeight);

  if (footerVisible && !state.isBottom) {
    state.isBottom = true;
    // currentIndex = lastIndex;
    iconDown.style.display = 'none';
    iconUp.style.display = 'block';
    gsap.to(tgBtn, {
      opacity: 0,
      x: '-100%',
      duration: 1,
      ease: 'power2.out',
    });
    gsap.to(menu, {y: windowHeight, duration: 0.8, ease: 'power3.inOut'});
  } else if (!footerVisible && state.isBottom) {
    state.isBottom = false;
    // currentIndex = lastIndex;
    gsap.to(tgBtn, {
      opacity: 1,
      x: 0,
      duration: 1,
      ease: 'power2.out',
    });
    gsap.to(menu, {y: 0, duration: 0.7, ease: 'power3.out'});
    iconDown.style.display = 'block';
    iconUp.style.display = 'none';
  }
}

function handleScrollBtnClick() {
  if (state.isBottom) {
    state.isAnimating = true;

    const tl = gsap.timeline({
      onComplete: () => {
        state.isAnimating = false;
        state.currentIndex = 0;
        // updatePaginationWhithSlides(0);
        console.log('Всё завершено: анимации + скролл наверх');
      },
    });

    tl.to(window, {
      scrollTo: sections[0],
      duration: 0.7,
      ease: 'power2.out',
    });

    console.log('0100 — запущена полная цепочка анимаций + скролл');
  }

  nextScreen();
}

function updateControlsScroll() {
  const targetColor = currentIndex === 2 ? 'var(--light)' : 'var(--white)';

  if (state.currentIndex === lastIndex) {
    unlockScroll();
    gsap.to(nextBtnText, {opacity: 0, y: -15, duration: 0.3});
    iconDownSvg.classList.remove('rotate');
  } else if (currentIndex < 2) {
    lockScroll();
    nextBtnText.innerHTML = nextBtnTexts[currentIndex];
    iconDownSvg.classList.remove('rotate');
    gsap.to(nextBtnText, {
      color: targetColor,
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
    });
    gsap.to(tgBtnText, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
    });
  } else {
    if (!mobileMode && state.currentIndex === sliderSectionIndex) {
      lockScroll();
    } else {
      unlockScroll();
    }

    if (state.currentIndex === 2) {
      nextBtnText.innerHTML = nextBtnTexts[2];
      iconDownSvg.classList.add('rotate');
      gsap.to(tgBtnText, {
        opacity: 0,
        y: -15,
        duration: 0.6,
        ease: 'power2.out',
      });
      gsap.to(nextBtnText, {
        color: targetColor,
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      });
    } else {
      gsap.to(nextBtnText, {opacity: 0, y: -15, duration: 0.3});
      iconDownSvg.classList.remove('rotate');
    }

    if (window.matchMedia('(max-width: 1300px)').matches) {
      if (currentIndex >= 2) {
        gsap.set('.logo-main', {opacity: 0, visibility: 'hidden'});
        gsap.set('.controls--left', {opacity: 0, visibility: 'hidden'});
      } else {
        gsap.set('.controls--left', {opacity: 1, visibility: 'visible'});
        gsap.to('.logo-main', {
          opacity: 1,
          duration: 0.3,
          visibility: 'visible',
        });
      }
    }
  }
}

function updateClassMenu() {
  console.log('меню нач');
  menuLinks.forEach((link, index) => {
    if (index === currentIndex) {
      gsap.to(link, {
        duration: 0.6,
        ease: 'power2.out',
        overwrite: true,
        onStart: () => link.classList.add('active'),
      });
    } else {
      gsap.to(link, {
        duration: 0.6,
        ease: 'power2.out',
        overwrite: true,
        onStart: () => link.classList.remove('active'),
      });
    }
  });
}

function updateMenuColor() {
  console.log('меню колор нач');
  if (currentIndex >= 2) {
    menuWrapper.classList.add('white');
  } else {
    menuWrapper.classList.remove('white');
  }
}

function updatePaginationWhithSlides(sectionIndex) {
  console.log('Pagination нач');

  if (sectionIndex === sliderSectionIndex) {
    return;
  }

  if (sectionIndex < sliderSectionIndex) {
    currentSlide = 0;
    gsap.set(sliderWrapper, {xPercent: 0});
  } else {
    currentSlide = lastSlide;
    gsap.set(sliderWrapper, {xPercent: -100 * lastSlide});
  }

  // Всегда диспатчим событие — чтобы обновились пагинации, индикаторы и т.д.
  window.dispatchEvent(new CustomEvent('slidechange', {detail: currentSlide}));

  // setTimeout(() => {
  //   sliderLocked = false;
  // }, 150);
}

updateMode();

window.addEventListener('wheel', onwheel, {passive: false});
if (nextBtn) {
  nextBtn.addEventListener('click', handleScrollBtnClick);
}

window.addEventListener('scroll', checkScrollPosition);
window.addEventListener('resize', () => {
  updateMode();
  const realCurrentIndex = detectCurrentSection();

  if (realCurrentIndex !== currentIndex) {
    currentIndex = realCurrentIndex;
    goToSection(currentIndex);
    console.log('Resize → corrected currentIndex to', currentIndex);
  }
});
