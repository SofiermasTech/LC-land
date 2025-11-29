document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.section');
  const lastIndex = sections.length - 1;

  // элементы
  const nextBtn = document.querySelector('.btn-scroll');
  const iconDown = document.querySelector('.icon-down');
  const iconDownSvg = iconDown?.querySelector('svg');
  const iconUp = document.querySelector('.icon-up');
  const nextBtnText = document.querySelector('.btn-scroll-text');

  const nextBtnTexts = [
    'У нас условия<br> с ума сойдешь',
    'А что там за фичи<br> у вас такие?',
    'Хочешь, покажем<br> еще одну фичу?',
  ];

  const menuLinks = document.querySelectorAll('.menu__link');
  const menuWrapper = document.querySelector('.menu__wrapper');
  const tgBtn = document.querySelectorAll('.controls__tg');
  const tgBtnText = document.querySelectorAll('.tg__text');

  // состояния
  let currentIndex = detectCurrentSection();
  let isAnimating = false;
  let isBottom = false;

  // слайдер
  const sliderSectionIndex = 2;
  const sliderWrapper = document.querySelector('.swiper__wrapper');
  const slides = document.querySelectorAll('.swiper__slide');
  let currentSlide = 0;
  const lastSlide = slides.length - 1;

  // мужик-параллакс
  let mouseMoveHandler = null;

  // первый запуск
  lockScroll();
  applyStaticSectionState(currentIndex);
  changeLogo();
  updateMenuColor();
  updateControlsScroll();
  updateMenuActive();
  AOS.init({});

  // ------------------------------
  // ОПРЕДЕЛЕНИЕ ТЕКУЩЕЙ СЕКЦИИ
  // ------------------------------
  function detectCurrentSection() {
    let idx = 0;

    sections.forEach((section, i) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.5) idx = i;
    });

    return idx;
  }

  // ------------------------------
  // ПРИ ЗАГРУЗКЕ СТРАНИЦЫ: ВОССТАНОВЛЕНИЕ СОСТОЯНИЙ
  // ------------------------------
  function applyStaticSectionState(index) {
    const heroContent = document.querySelector('.hero__content');
    const heroBlur = document.querySelector('.hero__blur');
    const main = document.querySelector('.first-wrapper__img');
    const overlay = document.querySelector('.numbers__overlay');

    // секция 0 — начальная
    if (index === 0) {
      gsap.set(heroContent, {x: 0, opacity: 1});
      gsap.set(heroBlur, {opacity: 0, backdropFilter: 'blur(0px)'});
      gsap.set(main, {opacity: 1});
      gsap.set(overlay, {opacity: 0, background: 'rgba(1,3,16,0)'});
      return;
    }

    // секция 1 — цифры + blur
    if (index === 1) {
      gsap.set(heroContent, {x: '-150%', opacity: 0});
      gsap.set(heroBlur, {opacity: 1, backdropFilter: 'blur(20px)'});
      gsap.set(main, {opacity: 1});
      gsap.set(overlay, {opacity: 1, background: 'rgba(1,3,16,0.4)'});
      return;
    }

    // секция 2+ — мужик исчезает
    if (index >= 2) {
      gsap.set(heroContent, {x: '-150%', opacity: 0});
      gsap.set(heroBlur, {opacity: 0, backdropFilter: 'blur(0px)'});
      gsap.set(main, {opacity: 0});
      gsap.set(overlay, {opacity: 0, background: 'rgba(1,3,16,0)'});
    }
  }

  // ------------------------------
  // ОСНОВНОЙ ПЕРЕХОД МЕЖДУ СЕКЦИЯМИ
  // ------------------------------
  function goToSection(index) {
    if (isAnimating) return;
    isAnimating = true;

    currentIndex = index;

    // управление состояниями
    updateMenuColor();
    updateControlsScroll();
    changeLogo();

    animFirstSection(index);
    animSecondSection(index);

    gsap.to(window, {
      scrollTo: {y: sections[index], autoKill: false},
      duration: 1,
      ease: 'power2.inOut',
      onComplete() {
        isAnimating = false;
        updateMenuActive();
      },
    });
  }

  // ------------------------------
  // СКРОЛЛ МЫШЬЮ
  // ------------------------------
  function onwheel(evt) {
    if (isAnimating) {
      evt.preventDefault();
      return;
    }

    const down = evt.deltaY > 0;
    const up = evt.deltaY < 0;

    // внутри горизонтального слайдера
    if (currentIndex === sliderSectionIndex) {
      evt.preventDefault();

      if (down) {
        if (currentSlide < lastSlide) return goToSlide(currentSlide + 1);
        return goToSection(currentIndex + 1);
      }

      if (up) {
        if (currentSlide > 0) return goToSlide(currentSlide - 1);
        return goToSection(currentIndex - 1);
      }
    }

    if (down && currentIndex < lastIndex) {
      evt.preventDefault();
      goToSection(currentIndex + 1);
    }

    if (up && currentIndex > 0) {
      evt.preventDefault();
      goToSection(currentIndex - 1);
    }
  }

  // ------------------------------
  // ЛОГИКА ЭФФЕКТА МУЖИКА (только секция 0)
  // ------------------------------
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

  // ------------------------------
  // АНИМАЦИЯ ПЕРВОЙ СЕКЦИИ
  // ------------------------------
  function animFirstSection(index) {
    const main = document.querySelector('.first-wrapper__img');
    const overlay = document.querySelector('.numbers__overlay');

    if (index === 0) {
      enableParallax();
      gsap.to(main, {opacity: 1, duration: 0.6});
      gsap.to(overlay, {
        opacity: 0,
        background: 'rgba(1,3,16,0)',
        duration: 0.4,
      });
      return;
    }

    disableParallax();

    if (index >= 2) {
      gsap.to(main, {opacity: 0, duration: 0.6});
      gsap.to(overlay, {opacity: 0, duration: 0.4});
    } else {
      gsap.to(main, {opacity: 1, duration: 0.6});
    }
  }

  // ------------------------------
  // АНИМАЦИЯ ВТОРОЙ СЕКЦИИ
  // ------------------------------
  function animSecondSection(index) {
    const heroContent = document.querySelector('.hero__content');
    const heroBlur = document.querySelector('.hero__blur');
    const overlay = document.querySelector('.numbers__overlay');

    if (index === 1) {
      const tl = gsap.timeline();

      tl.to(heroContent, {
        x: '-150%',
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      });

      tl.to(
        heroBlur,
        {
          backdropFilter: 'blur(20px)',
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
        },
        '-=0.2'
      );

      tl.to(overlay, {
        opacity: 1,
        background: 'rgba(1,3,16,0.4)',
        duration: 0.5,
      });
      return;
    }

    // обратный переход
    if (index === 0) {
      gsap.to(heroContent, {x: 0, opacity: 1, duration: 0.6});
      gsap.to(heroBlur, {
        opacity: 0,
        backdropFilter: 'blur(0px)',
        duration: 0.6,
      });
      gsap.to(overlay, {
        opacity: 0,
        background: 'rgba(1,3,16,0)',
        duration: 0.3,
      });
      return;
    }

    // переход к секциям 2+
    if (index >= 2) {
      gsap.to(heroBlur, {opacity: 0, backdropFilter: 'blur(0)', duration: 0.4});
    }
  }

  // ------------------------------
  // СЛАЙДЕР
  // ------------------------------
  function goToSlide(index) {
    if (isAnimating) return;
    isAnimating = true;

    gsap.to(sliderWrapper, {
      xPercent: -100 * index,
      duration: 1,
      ease: 'power2.inOut',
      onComplete() {
        currentSlide = index;
        isAnimating = false;
      },
    });
  }

  // ------------------------------
  // МЕНЮ
  // ------------------------------
  function updateMenuActive() {
    menuLinks.forEach((link, idx) => {
      link.classList.toggle('active', idx === currentIndex);
    });
  }

  function updateMenuColor() {
    if (currentIndex >= 2) menuWrapper.classList.add('white');
    else menuWrapper.classList.remove('white');
  }

  // ------------------------------
  // КНОПКА СКРОЛЛА
  // ------------------------------
  function updateControlsScroll() {
    const color = currentIndex === 2 ? 'var(--light)' : 'var(--white)';

    if (currentIndex === lastIndex) {
      unlockScroll();
      gsap.to(nextBtnText, {opacity: 0, y: -15, duration: 0.3});
      iconDownSvg?.classList.remove('rotate');
      return;
    }

    lockScroll();
    nextBtnText.innerHTML = nextBtnTexts[Math.min(currentIndex, 2)];

    gsap.to(nextBtnText, {
      color,
      opacity: 1,
      y: 0,
      duration: 0.6,
    });

    if (currentIndex === 2) {
      iconDownSvg?.classList.add('rotate');
      gsap.to(tgBtnText, {opacity: 0, y: -15});
    } else {
      iconDownSvg?.classList.remove('rotate');
      gsap.to(tgBtnText, {opacity: 1, y: 0});
    }
  }

  // ------------------------------
  // ЛОГОТИП
  // ------------------------------
  let isLogoCompact = false;
  let logoAnim = null;

  function changeLogo() {
    const compact = currentIndex > 1;
    if (compact === isLogoCompact) return;

    if (logoAnim) logoAnim.kill();

    logoAnim = gsap.timeline({
      onComplete: () => (isLogoCompact = compact),
    });

    if (compact) {
      logoAnim
        .to('.logo-main__text', {width: 0, opacity: 0, duration: 0.4}, 0)
        .to('.logo-main__name', {width: 0, opacity: 0, duration: 0.5}, 0)
        .to('.logo-main__split', {width: 0, opacity: 0, duration: 0.4}, 0)
        .to(
          '.logo-main__icon',
          {width: 64, height: 40, duration: 0.6},
          '-=0.3'
        );
    } else {
      logoAnim
        .fromTo(
          '.logo-main__icon',
          {width: 64, height: 40},
          {width: 26, height: 16, duration: 0.5},
          0
        )
        .to('.logo-main__text', {width: 'auto', opacity: 1, duration: 0.6}, 0.3)
        .to('.logo-main__name', {width: 110, opacity: 1, duration: 0.6}, 0.3)
        .to(
          '.logo-main__split',
          {width: 'auto', opacity: 1, duration: 0.6},
          0.3
        );
    }
  }

  // ------------------------------
  // СЛУШАТЕЛИ
  // ------------------------------
  nextBtn?.addEventListener('click', () => {
    if (isBottom) {
      currentIndex = 0;
      currentSlide = 0;
      gsap.set(sliderWrapper, {xPercent: 0});
      goToSection(0);
    } else {
      if (currentIndex === sliderSectionIndex && currentSlide < lastSlide)
        return goToSlide(currentSlide + 1);
      goToSection(currentIndex + 1);
    }
  });

  window.addEventListener('wheel', onwheel, {passive: false});
});
