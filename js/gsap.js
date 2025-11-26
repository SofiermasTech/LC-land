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

  let currentIndex = 0;
  const lastIndex = sections.length - 1;
  let isAnimating = false;
  let isBottom = false;

  
  let horizontalSlider = null;

  lockScroll();

  gsap.set(window, {scrollTo: 0});
  updateTextButtonScroll();

  function goToSection(index) {
    if (isAnimating) return;
    isAnimating = true;

    // if (currentIndex === 2 && index > 2) {
    //   const st = horizontalSlider;

    //   if (st && st.progress < 0.99) {
    //     // Не даём уйти — скроллим до конца
    //     gsap.to(window, {
    //       scrollTo: st.end,
    //       duration: 1.5,
    //       ease: 'power2.inOut',
    //       onComplete: () => {
    //         isAnimating = false;

    //         currentIndex = 3;
    //         goToSection(3);
    //       },
    //     });
    //     return;
    //   }
    // }

    gsap.to(window, {
      scrollTo: {y: sections[index], autoKill: false},
      duration: 1,
      onComplete() {
        isAnimating = false;
        currentIndex = index;
        updateTextButtonScroll();
      },
    });
  }

  function onwheel(evt) {
    if (isAnimating) {
      evt.preventDefault();
      return;
    }

    if (currentIndex < lastIndex) {
      evt.preventDefault();

      if (evt.deltaY > 0) {
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
      unlockScroll();
      if (evt.deltaY > 0) return;

      if (evt.deltaY < 0) {
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

    if (currentIndex === 2) {
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
    const footer = document.querySelector('.footer').getBoundingClientRect();
    const windowHeight = window.innerHeight;

    const footerVisible = footer.top < windowHeight && footer.bottom > 0;

    if (footerVisible && !isBottom) {
      isBottom = true;
      iconDown.style.display = 'none';
      iconUp.style.display = 'block';
    } else if (!footerVisible && isBottom) {
      isBottom = false;
      iconDown.style.display = 'block';
      iconUp.style.display = 'none';
    }
  }

  function handleScrollBtnClick() {
    if (isBottom) {
      currentIndex = 0;
      goToSection(0);
    } else {
      nextScreen();
    }
  }

  function updateTextButtonScroll() {
    if (currentIndex === lastIndex) {
      unlockScroll();
      gsap.to(nextBtnText, {opacity: 0, y: -15, duration: 0.3});
      iconDownSvg.classList.remove('rotate');
    } else if (currentIndex < 2) {
      lockScroll();
      nextBtnText.innerHTML = nextBtnTexts[currentIndex];
      iconDownSvg.classList.remove('rotate');
      gsap.to(nextBtnText, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    } else {
      lockScroll();

      if (currentIndex === 2) {
        nextBtnText.innerHTML = nextBtnTexts[2];
        iconDownSvg.classList.add('rotate');
        gsap.to(nextBtnText, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        gsap.to(nextBtnText, {opacity: 0, y: -15, duration: 0.3});
        iconDownSvg.classList.remove('rotate');
      }
    }
  }

  function initSlider() {
    const sectionSlider = document.querySelector('#section-3');
    const slider = document.querySelector('.swiper');
    if (!slider) return;

    const sliderWrapper = document.querySelector('.swiper__wrapper');
    const slides = sliderWrapper.children;
    const sliderCount = slides.length;

    const slideWidth = slides[0].offsetWidth;
    const totalScroll = (sliderCount - 1) * slideWidth;

    if (horizontalSlider) {
      horizontalSlider.kill();
      horizontalSlider = null;
    }

    horizontalSlider = ScrollTrigger.create({
      trigger: sectionSlider, // какая секция будет "приклеена"
      start: 'top top', // когда верх секции касается верха экрана
      end: () => `+=${totalScroll}`, // на сколько "приклеить" вниз
      pin: true, // ← ВАЖНО: приклеиваем секцию к экрану
      anticipatePin: 1,
      scrub: 1, // ← плавное движение за скроллом
      animation: gsap.to(sliderWrapper, {
        x: () => -slideWidth, // двигаем контейнер влево
        ease: 'none',
      }),
      onLeave: () => {
        currentIndex = 3;
      },
      onEnterBack: () => {
        currentIndex = 2;
      },
      onLeaveBack: () => {
        currentIndex = 1; // ушли вверх из слайдера
      },
    });
  }

  checkScrollPosition();

  // слушатели
  if (nextBtn) {
    nextBtn.addEventListener('click', handleScrollBtnClick);
  }

  // Перезапускаем при ресайзе (важно!)
  window.addEventListener('resize', () => {
    if (horizontalSlider) {
      horizontalSlider.kill();
      horizontalSlider = null;
      gsap.delayedCall(0.1, initSlider);
    }
  });

  gsap.delayedCall(0.5, () => {
    initSlider();
    ScrollTrigger.refresh();
  });

  window.addEventListener('scroll', checkScrollPosition);
  window.addEventListener('wheel', onwheel, {passive: false});
});
