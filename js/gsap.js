document.addEventListener('DOMContentLoaded', (event) => {
  const sections = document.querySelectorAll('.section');
  // элм кнопки скролла
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

  const lastIndex = sections.length - 1;
  let isAnimating = false;
  let isBottom = false;
  let logoAnimation = null;
  let isLogoCompact = false;

  // сладер
  const sliderSectionIndex = 2;
  const sliderWrapper = document.querySelector('.swiper__wrapper');
  const slides = document.querySelectorAll('.swiper__slide');
  let currentSlide = 0;
  const lastSlide = slides.length - 1;

  function detectCurrentSection() {
    let idx = 0;
    sections.forEach((section, i) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.5) idx = i;
    });
    return idx;
  }

  lockScroll();
  let currentIndex = detectCurrentSection();

  animationOnStart();
  animFirstSection(currentIndex);
  changeLogo();
  updateControlsScroll();
  updateMenuColor();
  updateClassMenu();
  AOS.init({});

  function goToSection(index) {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex = index;
    updateMenuColor();
    changeLogo();
    updateControlsScroll();
    animFirstSection(index);
    animSecondSection(index);

    gsap.to(window, {
      scrollTo: {y: sections[index], autoKill: false},
      duration: 1,
      onComplete() {
        isAnimating = false;
        currentIndex = index;
        updateClassMenu();
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

    if (currentIndex === sliderSectionIndex) {
      evt.preventDefault();

      if (directionDown) {
        if (currentSlide < lastSlide) {
          goToSlide(currentSlide + 1);
        } else {
          goToSection(currentIndex + 1);
        }
        return;
      }

      if (directionUp) {
        if (currentSlide > 0) {
          goToSlide(currentSlide - 1);
        } else {
          goToSection(currentIndex - 1);
        }
        return;
      }
    }

    if (directionDown && currentIndex < lastIndex) {
      evt.preventDefault();
      goToSection(currentIndex + 1);
    }

    if (directionUp && currentIndex > 0) {
      evt.preventDefault();
      goToSection(currentIndex - 1);
    }
  }

  function lockScroll() {
    document.documentElement.style.overflowY = 'hidden';
    document.body.style.overflowY = 'hidden';
  }

  function unlockScroll() {
    document.documentElement.style.overflowY = 'auto';
    document.body.style.overflowY = 'auto';
  }

  function nextScreen() {
    if (isAnimating) return;

    if (currentIndex === sliderSectionIndex) {
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
      currentIndex++;
      goToSection(currentIndex);
    } else if (currentIndex === lastIndex) {
      gsap.to(window, {
        scrollTo: {y: window.scrollY + window.innerHeight},
        duration: 1,
        ease: 'power2.inOut',
      });
    }
  }

  function checkScrollPosition() {
    const menu = document.querySelector('.menu');
    const footer = document.querySelector('.footer').getBoundingClientRect();
    const windowHeight = window.innerHeight;

    const footerVisible = footer.top < windowHeight && footer.bottom > 0;

    if (footerVisible && !isBottom) {
      isBottom = true;
      iconDown.style.display = 'none';
      iconUp.style.display = 'block';
      gsap.to(tgBtn, {
        opacity: 0,
        x: '-100%',
        duration: 1,
        ease: 'power2.out',
      });
      gsap.to(menu, {y: windowHeight, duration: 0.8, ease: 'power3.inOut'});
    } else if (!footerVisible && isBottom) {
      isBottom = false;
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
      currentIndex = 0;
      currentSlide = 0;
      gsap.set(sliderWrapper, {
        xPercent: 0,
      });
      goToSection(0);
    } else {
      nextScreen();
    }
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
      lockScroll();

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
    }
  }

  function animationOnStart() {
    const timelineFirst = gsap.timeline();
    if (currentIndex === 0) {
      timelineFirst.from('.hero__content', {
        duration: 0.7,
        x: '-150%',
        ease: 'power2.out',
      });
      timelineFirst.from(
        '.controls--left',
        {
          duration: 0.7,
          x: '-100%',
          ease: 'power2.out',
        },
        '-=0.3'
      );
      timelineFirst.from(
        '.controls--right',
        {
          duration: 0.7,
          x: '100%',
          ease: 'power2.out',
        },
        '<'
      );
      timelineFirst.from(
        '.first-wrapper__img img',
        {
          duration: 1,
          x: '100px',
          opacity: 0,
          ease: 'power2.out',
        },
        '-=0.4'
      );
      timelineFirst.from(
        '.menu',
        {
          duration: 1,
          y: '200%',
          ease: 'power2.out',
        },
        '<'
      );
    }
  }

  function animFirstSection(index) {
    const main = document.querySelector('.first-wrapper__img');
    const mainImg = document.querySelector('.first-wrapper__img img');
    const overlay = document.querySelector('.numbers__overlay');

    if (index === 0) {
      document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 50;
        const y = (e.clientY / window.innerHeight - 0.5) * 50;

        gsap.to(mainImg, {
          x: -x,
          y: -y,
          duration: 1.2,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    }

    // убираем темный фон и мужика
    if (index >= 2) {
      gsap.to(main, {
        opacity: 0,
        background: 'transparent',
        // y: 0,
        duration: 0.9,
        ease: 'back.out',
        // onStart: () => overlay.classList.add('opacity'),
      });
      gsap.to(
        overlay,
        {
          duration: 0.2,
          opacity: 0,
          background: 'rgba(1, 3, 16, 0)',
          ease: 'power2.out',
        },
        '<'
      );
    } else {
      gsap.to(main, {
        opacity: 1,
        // y: 0,
        duration: 0.9,
        ease: 'power4.out',
        // onStart: () => overlay.classList.remove('opacity'),
      });
    }
  }

  function animSecondSection(index) {
    const timelineSecond = gsap.timeline();

    if (index === 1) {
      timelineSecond.to('.hero__content', {
        duration: 0.5,
        x: '-150%',
        opacity: 0,
        ease: 'power2.out',
      });
      timelineSecond.to(
        '.hero__blur',
        {
          duration: 0.7,
          backdropFilter: 'blur(20px)',
          opacity: 1,
          ease: 'power2.out',
        },
        '-=0.2'
      );
      timelineSecond.to('.numbers__overlay', {
        duration: 0.5,
        opacity: 1,
        background: 'rgba(1, 3, 16, 0.4)',
        ease: 'power2.out',
      });
      timelineSecond.from(
        '.numbers__big-number',
        {
          duration: 0.5,
          opacity: 0,
          ease: 'power2.out',
        },
        '<'
      );
      timelineSecond.from('.numbers__label', {
        duration: 0.5,
        opacity: 0,
        y: '20px',
        ease: 'power2.out',
      });
      timelineSecond.from('.numbers__btn', {
        duration: 0.5,
        opacity: 1,
        y: '40px',
        ease: 'power2.out',
      }, '>');
    } else if (index === 0) {
      gsap.to('.numbers__overlay', {
        duration: 0.3,
        opacity: 0,
        background: 'rgba(1, 3, 16, 0)',
        ease: 'power2.out',
      });
      gsap.to(
        '.hero__blur',
        {
          duration: 0.7,
          backdropFilter: 'blur(0)',
          opacity: 0,
          ease: 'power2.out',
        },
        '<'
      );
      gsap.to('.hero__content', {
        duration: 0.7,
        x: 0,
        opacity: 1,
        ease: 'power2.out',
      });
    }
  }

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

        window.dispatchEvent(new CustomEvent('slidechange', {detail: index}));
      },
    });
  }

  function updateClassMenu() {
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
    if (currentIndex >= 2) {
      menuWrapper.classList.add('white');
    } else {
      menuWrapper.classList.remove('white');
    }
  }

  function changeLogo() {
    const secondScreen = currentIndex > 1;

    if (secondScreen === isLogoCompact) return;

    if (logoAnimation) logoAnimation.kill();
    logoAnimation = gsap.timeline({
      onComplete: () => {
        isLogoCompact = secondScreen;
      },
    });

    if (secondScreen) {
      logoAnimation
        .to(
          '.logo-main__text',
          {width: 0, opacity: 0, duration: 0.4, ease: 'power2.in'},
          0
        )
        .to(
          '.logo-main__name',
          {width: 0, opacity: 0, duration: 0.5, ease: 'power2.in'},
          0
        )
        .to(
          '.logo-main__split',
          {width: 0, opacity: 0, duration: 0.4, ease: 'power2.in'},
          0
        )
        .to(
          '.logo-main__icon',
          {width: 64, height: 40, duration: 0.6, ease: 'back.out(1.4)'},
          '-=0.3'
        );
    } else {
      // Возврат НА первый экран → показываем всё обратно
      logoAnimation
        .fromTo(
          '.logo-main__icon',
          {width: 64, height: 40},
          {width: 26, height: 16, duration: 0.5, ease: 'power2.out'},
          0
        )
        .to(
          '.logo-main__text',
          {width: 'auto', opacity: 1, duration: 0.6, ease: 'power2.out'},
          0.3
        )
        .to(
          '.logo-main__name',
          {width: 110, opacity: 1, duration: 0.6, ease: 'power2.out'},
          0.3
        )
        .to(
          '.logo-main__split',
          {width: 'auto', opacity: 1, duration: 0.6, ease: 'power2.out'},
          0.3
        );
    }
  }

  changeLogo();
  checkScrollPosition();
  updateClassMenu();
  updateMenuColor();

  // слушатели
  if (nextBtn) {
    nextBtn.addEventListener('click', handleScrollBtnClick);
  }

  window.addEventListener('scroll', checkScrollPosition);
  window.addEventListener('wheel', onwheel, {passive: false});
});
