gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const sections = document.querySelectorAll('.section');
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

let currentIndex = 0;
const lastIndex = sections.length - 1;
let isAnimating = false;
let isBottom = false;

// остальные кнопки + меню
const menuLinks = document.querySelectorAll('.menu__link');
const menuWrapper = document.querySelector('.menu__wrapper');
const tgBtn = document.querySelectorAll('.controls__tg');
const tgBtnText = document.querySelectorAll('.tg__text');
const footerLinks = document.querySelectorAll('.footer__links-item.m a');

// слайдер
const sliderSectionIndex = 1; // gпотом поменять
const sliderWrapper = document.querySelector('.service-swiper__wrapper');
const slides = document.querySelectorAll('.service-swiper__slide');
let currentSlide = 0;
const lastSlide = slides.length - 1;

// mobile

lockScroll();

function goToSection(index) {
  if (isAnimating) return;
  isAnimating = true;
  gsap.to(window, {
    scrollTo: {y: sections[index], autoKill: false},
    duration: 0.5,
    onComplete() {
      isAnimating = false;
      currentIndex = index;

      if (index === lastIndex) {
        unlockScroll();
      }
    },
  });
}

function onwheel(evt) {
  if (isAnimating) {
    evt.preventDefault();
    return;
  }

  const directionDown = evt.deltaY > 0;
  const directionUp = evt.deltaY < 0;

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
      currentIndex++;
      console.log(currentIndex);
      goToSection(currentIndex);
    } else if (evt.deltaY < 0 && currentIndex > 0) {
      currentIndex--;
      console.log(currentIndex);
      goToSection(currentIndex);
    }
    return;
  }

  if (currentIndex === lastIndex) {
    // unlockScroll();
    if (directionDown) return;

    if (directionUp) {
      const lastSection = sections[currentIndex];
      const topOfLastSection = lastSection.offsetTop;

      if (window.scrollY <= topOfLastSection + 20) {
        if (currentIndex > 0) {
          currentIndex--;
          goToSection(currentIndex);
        }
      }

      return;
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
      isAnimating = false;
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
  if (isAnimating) return;

  if (mobileMode && currentIndex === sliderSectionIndex) {
    window.scrollBy({top: window.innerHeight * 0.9, behavior: 'smooth'});
    return;
  }

  if (currentIndex === sliderSectionIndex && !mobileMode) {
    if (currentSlide < lastSlide) {
      goToSlide(currentSlide + 1);
      return;
    }

    if (currentSlide === lastSlide) {
      goToSection(currentIndex + 1);
      return;
    }
  }

  if (currentIndex < lastIndex) {
    goToSection(currentIndex + 1);
  } else if (currentIndex === lastIndex) {
    gsap.to(window, {
      scrollTo: {y: 'max'},
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
  const lastSection = sections[currentIndex];
  const sectionBottom = lastSection.scrollHeight; // высота контента внутри секции
  const sectionScrollTop = lastSection.scrollTop; // сколько уже проскроллено внутри
  const sectionVisibleHeight = lastSection.clientHeight; // видимая высота (100vh)

  // Проверяем, доскроллил ли пользователь до низа внутри секции
  const atBottom =
    sectionScrollTop + sectionVisibleHeight >= sectionBottom - 50;

  console.log('scrollTop:', sectionScrollTop);
  console.log('visible:', sectionVisibleHeight);
  console.log('content height:', sectionBottom);
  console.log('atBottom:', atBottom);

  if (!atBottom && !isBottom) {
    isBottom = true;
    // currentIndex = lastIndex;
    iconDown.style.display = 'none';
    iconUp.style.display = 'block';
    gsap.to(tgBtn, {
      opacity: 0,
      x: '-100%',
      duration: 1,
      ease: 'power2.out',
    });
    gsap.to(menu, {y: 'max', duration: 0.8, ease: 'power3.inOut'});
  } else {
    isBottom = false;
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
  if (isBottom) {
    isAnimating = true;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
        currentIndex = 0;
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

  if (currentIndex === lastIndex) {
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
    if (!mobileMode && currentIndex === sliderSectionIndex) {
      lockScroll();
    } else {
      unlockScroll();
    }

    if (currentIndex === 2) {
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

window.addEventListener('wheel', onwheel, {passive: false});
if (nextBtn) {
  nextBtn.addEventListener('click', handleScrollBtnClick);
}

window.addEventListener('scroll', checkScrollPosition);
window.addEventListener('resize', () => {
  const realCurrentIndex = detectCurrentSection();

  if (realCurrentIndex !== currentIndex) {
    currentIndex = realCurrentIndex;
    goToSection(currentIndex);
    console.log('Resize → corrected currentIndex to', currentIndex);
  }
});
