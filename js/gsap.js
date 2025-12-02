document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.section');
  const lastIndex = sections.length - 1;

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
  const footerLinks = document.querySelectorAll('.footer__links-item a');

  // сладер
  const sliderSectionIndex = 2;
  const sliderWrapper = document.querySelector('.swiper__wrapper');
  const slides = document.querySelectorAll('.swiper__slide');
  let currentSlide = 0;
  const lastSlide = slides.length - 1;

  // состояния
  let isAnimating = false;
  let isIntentionalNavigation = false;
  let intentionalTargetIndex = null;
  let isBottom = false;
  let mouseMoveHandler = null;
  let currentIndex = detectCurrentSection();

  let logoAnimation = null;
  let isLogoCompact = false;

  // Первый запуск
  lockScroll();
  setStateForSection(currentIndex);

  if (currentIndex === 0) {
    animationOnStart();
  }

  changeLogo();
  updateControlsScroll();
  updateMenuColor();
  updateClassMenu();
  AOS.init({});

  // определение  текущей секции
  function detectCurrentSection() {
    let idx = 0;

    sections.forEach((section, i) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.5) idx = i;
    });
    return idx;
  }

  // начальное состояние первых экранов
  function setStateForSection(index) {
    if (index === 0) {
      gsap.set('.hero__content', {x: 0, opacity: 1});
      gsap.set('.first-wrapper__img', {opacity: 1});
      gsap.set('.hero__blur', {opacity: 0, backdropFilter: 'blur(0)'});
      gsap.set('.numbers__overlay', {opacity: 0, background: 'rgba(1,3,16,0)'});
      return;
    }

    if (index === 1) {
      gsap.set('.hero__content', {x: '-150%', opacity: 0});
      gsap.set('.first-wrapper__img', {opacity: 1});
      gsap.set('.hero__blur', {opacity: 1, backdropFilter: 'blur(20px)'});
      gsap.set('.numbers__overlay', {
        opacity: 1,
        background: 'rgba(1,3,16,0.4)',
      });
      const sec2 = document.querySelector('.numbers__overlay');
      sec2.classList.add('section-fixed');
      return;
    }

    if (index >= 2) {
      gsap.set('.hero__content', {x: '-150%', opacity: 0});
      gsap.set('.first-wrapper__img', {opacity: 0});
      gsap.set('.numbers__overlay', {opacity: 0, background: 'rgba(1,3,16,0)'});
      gsap.set('.hero__blur', {opacity: 0, backdropFilter: 'blur(0px)'});

      if (window.matchMedia('(max-width: 1300px)').matches) {
        gsap.set('.logo-main', {opacity: 0});
      }
    }
  }

  // переходу между секциями + скролл
  function goToSection(index) {
    if (isAnimating) return;

    isAnimating = true;
    sliderLocked = true;

    console.log('goToSection', index, currentIndex);

    if (currentIndex === 2 && index === 1) {
      const tl = thirdScrollUp(index);

      tl.eventCallback('onComplete', () => {
        gsap.to(window, {
          scrollTo: sections[1],
          duration: 1,
          ease: 'power2.out',
          onComplete() {
            isAnimating = false;
            sliderLocked = false;
            currentIndex = 1;
            changeLogo();
            updateMenuColor();
            updateClassMenu();
            updateControlsScroll();

            updatePaginationWhithSlides(currentIndex);
            console.log('goToSection2 начxxxxx', index, currentIndex);
          },
        });
      });

      return;
    }

    if ((currentIndex === 2 || currentIndex === 3) && index === 0) {
      gsap
        .timeline()
        .to('.service__content', {
          y: '100%',
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
        })
        .to(
          '.service__title',
          {
            y: '150%',
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out',
          },
          '-=0.2'
        );
    }

    if ((currentIndex > 2 || currentIndex < 2) && index === 2) {
      animThirdSection(currentIndex);
      console.log('врпврапрапрап', index, currentIndex);
    }

    currentIndex = index;
    updateMenuColor();
    changeLogo();

    if (currentIndex === 0) {
      animFirstSection(currentIndex);
      secondScroll(index);
    }

    if (currentIndex === 1) {
      animSecondSection(index);
      console.log('0111');
    }

    if (currentIndex === 2) {
      secondScroll(index);
    }

    if (currentIndex >= 3) {
      secondScroll(index);
      thirdScrollUp(index);
    }

    gsap.to(window, {
      scrollTo: {y: sections[index], autoKill: false},
      duration: 1,
      onComplete() {
        isAnimating = false;
        sliderLocked = false;
        currentIndex = index;
        firstScroll(index);
        updateClassMenu();
        updateControlsScroll();

        updatePaginationWhithSlides(currentIndex);
        console.log('goToSection конец', index, currentIndex);
      },
    });
  }

  function onwheel(evt) {
    if (isAnimating) {
      evt.preventDefault();
      return;
    }

    if (currentIndex === lastIndex) {
      return;
    }

    const directionDown = evt.deltaY > 0;
    const directionUp = evt.deltaY < 0;

    if (currentIndex === sliderSectionIndex) {
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

  function nextScreen() {
    if (isAnimating) return;

    sliderLocked = true;
    // isAnimating = true;

    if (currentIndex === sliderSectionIndex) {
      sliderLocked = false;

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
        scrollTo: {y: window.scrollY + window.innerHeight},
        duration: 1,
        ease: 'power2.inOut',
        onComplete() {
          isAnimating = false;
          sliderLocked = false;
        },
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
    } else if (!footerVisible && isBottom) {
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
      isIntentionalNavigation = true;
      intentionalTargetIndex = 0;
      isAnimating = true;
      sliderLocked = true;

      const tl = gsap.timeline({
        onComplete: () => {
          // Здесь уже всё закончено: анимации + скролл
          isAnimating = false;
          sliderLocked = true;
          currentIndex = 0;
          scrollImgWrapper(0);
          firstScroll(0);
          changeLogo();
          updateMenuColor();
          updateClassMenu();
          updateControlsScroll();

          updatePaginationWhithSlides(0);
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

      if (window.matchMedia('(max-width: 1300px)').matches) {
        if (currentIndex >= 2) {
          gsap.set('.logo-main', {opacity: 0});
        } else {
          gsap.to('.logo-main', {opacity: 0, duration: 0.3});
        }
      }
    }
  }

  function animationOnStart() {
    const timelineFirst = gsap.timeline();
    enableParallax();
    console.log('animationOnStart нач');
    if (currentIndex === 0) {
      timelineFirst
        .from('.hero__content', {
          duration: 0.7,
          x: '-150%',
          ease: 'power2.out',
        })
        .from(
          '.controls--left',
          {
            duration: 0.7,
            x: '-100%',
            ease: 'power2.out',
          },
          '-=0.3'
        )
        .from(
          '.controls--right',
          {
            duration: 0.7,
            x: '100%',
            ease: 'power2.out',
          },
          '<'
        )
        .add(scrollImgWrapper(currentIndex), '-=0.6')
        .from(
          '.menu',
          {
            duration: 1,
            y: '200%',
            ease: 'power2.out',
          },
          '<'
        );
    }

    console.log('animationOnStart конец');
  }

  function animFirstSection(index) {
    console.log('animFirstSection нач');
    if (index === 0) {
      enableParallax();
      scrollImgWrapper(index);
      firstScroll(index);
    }
    console.log('animFirstSection конец');
  }

  function firstScroll(index) {
    const firstScrollTL = gsap.timeline({
      onComplete: function () {
        if (index >= 2) {
          document.querySelector('.hero__blur').style.position = 'static';
        } else {
          document.querySelector('.hero__blur').style.position = 'fixed';
          // gsap.to('.logo-main', {opacity: 1, duration: 0.3});
          if (index === 0) {
            document
              .querySelector('.numbers__overlay')
              .classList.remove('section-fixed');
            console.log('4564564');
          }
        }
        console.log('firstScroll конец');
      },
    });

    console.log('firstScroll нач');
    if (index > 0) {
      firstScrollTL.to('.hero__content', {
        duration: 0.3,
        x: '-150%',
        opacity: 0,
        ease: 'power2.out',
      });
    } else {
      firstScrollTL.to('.hero__content', {
        duration: 0.7,
        x: 0,
        opacity: 1,
        ease: 'power2.out',
      });
    }
  }

  function secondScroll() {
    const secondScrollTL = gsap.timeline({
      onComplete: function () {
        const sec2 = document.querySelector('.numbers__overlay');
        // sec2.classList.remove('section-fixed');
        // console.log('secondScroll конец');
      },
    });

    console.log('secondScroll нач');
    secondScrollTL
      .to('.numbers__big-number', {
        duration: 0.2,
        opacity: 0,
        ease: 'power2.out',
      })
      .to(
        '.numbers__label',
        {
          duration: 0.2,
          opacity: 0,
          y: 0,
          ease: 'power2.out',
        },
        '<'
      )
      .set(
        '.numbers__btn',
        {
          // duration: 0.2,
          opacity: 0,
          ease: 'power2.out',
        },
        '-=0.3'
      )
      .to('.numbers__overlay', {
        duration: 0.3,
        opacity: 0,
        background: 'rgba(1, 3, 16, 0)',
        ease: 'power2.out',
      })
      .to(
        '.hero__blur',
        {
          opacity: 0,
          backdropFilter: 'blur(0px)',
          duration: 0.3,
        },
        '<'
      );
    // }
  }

  function scrollImgWrapper(index) {
    const imgScrollTL = gsap.timeline({
      onComplete: function () {
        console.log('scrollImgWrapper конец');
      },
    });

    console.log('scrollImgWrapper запущен');
    if (index === 0) {
      imgScrollTL
        .to('.first-wrapper__img', {
          opacity: 1,
          duration: 0.1,
          ease: 'power4.out',
        })
        .fromTo(
          '.first-wrapper__img img',
          // от
          {
            x: '150px',
            opacity: 0,
          },
          // до
          {
            x: 0,
            opacity: 1,
            duration: 1.3,
            ease: 'power2.out',
          },
          '-=0.1'
        );
    } else if (index === 1) {
      imgScrollTL
        .set('.first-wrapper__img img', {
          x: 0,
          opacity: 1,
        })
        .set('.first-wrapper__img', {
          opacity: 1,
        });
    } else {
      imgScrollTL
        .to('.first-wrapper__img img', {
          duration: 0.5,
          x: '250',
          ease: 'power2.out',
        })
        .to(
          '.first-wrapper__img img',
          {
            duration: 0.3,
            opacity: 0,
            ease: 'power2.out',
          },
          '-=0.2'
        )
        .to(
          '.first-wrapper__img',
          {
            opacity: 0,
            duration: 0.3,
            ease: 'back.out',
          },
          '<'
        );
    }
    return imgScrollTL;
  }

  function animSecondSection(index) {
    const timelineSecond = gsap.timeline();
    console.log('animSecondSection запущен');
    const sec2 = document.querySelector('.numbers__overlay');
    sec2.classList.add('section-fixed');

    if (index === 1) {
      disableParallax();
      firstScroll(index);

      timelineSecond
        .add(scrollImgWrapper(index))
        .to(
          '.hero__blur',
          {
            duration: 0.7,
            backdropFilter: 'blur(20px)',
            opacity: 1,
            ease: 'power2.out',
          },
          '-=0.2'
        )
        .to('.numbers__overlay', {
          duration: 0.5,
          opacity: 1,
          background: 'rgba(1, 3, 16, 0.4)',
          ease: 'power2.out',
        })
        .fromTo(
          '.numbers__big-number',
          {
            opacity: 0,
          },
          {duration: 0.3, opacity: 1, ease: 'power2.out'},
          '<'
        )
        .fromTo(
          '.numbers__label',
          {
            opacity: 0,
            y: '20px',
          },
          {
            duration: 0.3,
            opacity: 1,
            y: 0,
            ease: 'power2.out',
          }
        )
        .fromTo(
          '.numbers__btn',
          {
            opacity: 0,
          },
          {
            duration: 0.2,
            opacity: 1,
            ease: 'power2.out',
          },
          '<'
        );
    }
    console.log('animSecondSection конец');
    return timelineSecond;
  }

  function animThirdSection(currentIndex) {
    const thirdSectionTL = gsap.timeline({
      onComplete() {
        console.log('animThirdSection конец');
      },
    });
    console.log('animThirdSection нач');
    if (currentIndex < 2) {
      thirdSectionTL
        .add(scrollImgWrapper(2))
        .fromTo(
          '.service__title',
          {
            y: '150%',
            opacity: 0,
          },
          {duration: 0.7, y: 0, opacity: 1, ease: 'power2.out'}
        )
        .fromTo(
          '.service__content',
          {
            y: '100%',
            opacity: 0,
          },
          {duration: 0.7, y: 0, opacity: 1, ease: 'power2.out'}
        );
    } else if (currentIndex > 2) {
      thirdSectionTL
        .fromTo(
          '.service__content',
          {
            y: '-100%',
            opacity: 0,
          },
          {duration: 0.7, y: 0, opacity: 1, ease: 'power2.out'}
        )
        .fromTo(
          '.service__title',
          {
            y: '-100%',
            opacity: 0,
          },
          {duration: 0.7, y: 0, opacity: 1, ease: 'power2.out'},
          '-=0.2'
        )
        .add(scrollImgWrapper(2), '-=0.1');
    }
  }

  function thirdScrollUp(index) {
    const thirdScrollUpTL = gsap.timeline({
      onComplete: function () {
        updateMenuColor();
        const sec2 = document.querySelector('.numbers__overlay');
        sec2.classList.remove('section-fixed');
        console.log('thirdScrollUp конец');
      },
    });
    console.log('thirdScrollUp нач');
    if (index < 2) {
      thirdScrollUpTL
        .to('.service__content', {
          y: '100%',
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
        })
        .to(
          '.service__title',
          {
            y: '150%',
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out',
          },
          '-=0.2'
        )
        .add(scrollImgWrapper(index), '+=0.1')
        .add(animSecondSection(index), '<');

      // return thirdScrollUpTL;
    }

    if (index > 2) {
      thirdScrollUpTL
        .to('.service__title', {
          y: '-150%',
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
        })
        .to(
          '.service__content',
          {
            y: '-100%',
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out',
          },
          '-=0.2'
        )
        .add(scrollImgWrapper(index), '-=0.1');

      // return thirdScrollUpTL;
    }

    return thirdScrollUpTL;
  }

  let sliderLocked = false;

  function goToSlide(index) {
    if (sliderLocked) return;
    if (isAnimating) return;
    if (currentSlide === index) return;

    isAnimating = true;
    console.log('goToSlide нач');
    animateSlide(currentSlide, index);

    gsap.to(sliderWrapper, {
      xPercent: -100 * index,
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete() {
        currentSlide = index;
        isAnimating = false;
        console.log('goToSlide конец');
        window.dispatchEvent(new CustomEvent('slidechange', {detail: index}));
      },
    });
  }

  function animateSlide(oldIndex, newIndex) {
    const slides = document.querySelectorAll('.swiper__slide');
    const oldSlide = slides[oldIndex];
    const newSlide = slides[newIndex];
    if (!oldSlide || !newSlide) return;

    if (animateSlide.tl) {
      animateSlide.tl.kill();
    }

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

      return tl;
    }

    // назад
    tl.to(oldContent, {x: oldExitX, duration: 0.4});
    tl.to(oldImg, {x: oldExitX, duration: 0.3});

    tl.to(newContent, {x: '0%', duration: 0.3}, '-=0.05');
    tl.to(newImg, {x: '0%', duration: 0.4});

    return tl;
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

  function changeLogo() {
    const secondScreen = currentIndex >= 2;

    if (secondScreen === isLogoCompact) return;

    if (logoAnimation) logoAnimation.kill();
    logoAnimation = gsap.timeline({
      onComplete: () => {
        isLogoCompact = secondScreen;
      },
    });
    console.log('changeLogo нач');
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

  function updatePaginationWhithSlides(sectionIndex) {
    console.log('Pagination нач');

    if (sectionIndex === sliderSectionIndex) {
      // Мы ПРИХОДИМ в секцию со слайдером
      // → оставляем текущий слайд как есть (пользователь мог листать)
      return;
    }

    sliderLocked = true;

    if (sectionIndex < sliderSectionIndex) {
      // Уходим ВВЕРХ от слайдера → сбрасываем на первый слайд
      currentSlide = 0;
      gsap.set(sliderWrapper, {xPercent: 0});
    } else {
      // Уходим ВНИЗ от слайдера → ставим на последний слайд
      currentSlide = lastSlide;
      gsap.set(sliderWrapper, {xPercent: -100 * lastSlide});
    }

    // Всегда диспатчим событие — чтобы обновились пагинации, индикаторы и т.д.
    window.dispatchEvent(
      new CustomEvent('slidechange', {detail: currentSlide})
    );

    setTimeout(() => {
      sliderLocked = false;
    }, 150);
  }

  // changeLogo();
  checkScrollPosition();
  updateClassMenu();
  updateMenuColor();

  // слушатели
  menuLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const index = Number(link.dataset.index);
      sliderLocked = true;

      if (index === 2 || index === 3) {
        firstScroll(index);
      }
      console.log(sliderLocked);
      goToSection(index);
      updateControlsScroll();
    });
  });

  footerLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const index = Number(link.dataset.index);
      sliderLocked = true;
      isIntentionalNavigation = true; // ← ВКЛ
      intentionalTargetIndex = index;

      // firstScroll(index);
      // updatePaginationWhithSlides(index);

      goToSection(index);
      updateControlsScroll();
    });
  });

  if (nextBtn) {
    nextBtn.addEventListener('click', handleScrollBtnClick);
  }

  window.addEventListener('scroll', checkScrollPosition);

  let wheelTimeout = null;

  window.addEventListener(
    'wheel',
    (evt) => {
      if (isAnimating) {
        evt.preventDefault();
        return;
      }

      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        onwheel(evt);
      }, 50); // небольшая задержка — убирает спам
    },
    {passive: false}
  );

  // window.addEventListener('wheel', onwheel, {passive: false});

  // === Настройки для последней секции ===
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const last = sections[sections.length - 1];
  const prev = sections[sections.length - 2];

  // Эта переменная говорит: "мы сейчас в режиме свободного скролла (footer-zone)"
  let inFooterScroll = false;

  // ----------------------------------------
  // 1. ВХОД В ПОСЛЕДНЮЮ СЕКЦИЮ
  // Когда top последней секции коснулся вьюпорта → разрешаем нативный скролл
  // ----------------------------------------
  ScrollTrigger.create({
    trigger: last,
    start: 'top top',
    end: 'top top',
    onEnter: () => {
      // Вошли в последнюю секцию
      inFooterScroll = true;
      try {
        unlockScroll();
      } catch (e) {}
      currentIndex = sections.length - 1;

      updateMenuColor();
      changeLogo();
      updateControlsScroll();
      updateClassMenu();
    },
    once: false,
    markers: false,
  });

  // ----------------------------------------
  // 2. ВОЗВРАТ НАЗАД
  // Когда верх последней секции начинает появляться обратно в viewport
  // ----------------------------------------
  ScrollTrigger.create({
    trigger: last,
    start: 'top+=1 top',
    end: 'bottom top',

    onLeaveBack: () => {
      if (isIntentionalNavigation) {
        isIntentionalNavigation = false;
        intentionalTargetIndex = null;
        return;
      }

      if (isAnimating) return;

      isAnimating = true;
      // выходим из свободного скролла
      inFooterScroll = false;
      try {
        lockScroll();
      } catch (e) {}

      currentIndex = sections.length - 2;

      gsap.to(window, {
        scrollTo: prev,
        duration: 0.5,
        ease: 'power2.out',
        onComplete() {
          animThirdSection(3);
          console.log('фффффффффффффффффффф', currentIndex);

          isAnimating = false;
          updateMenuColor();
          changeLogo();
          updateControlsScroll();
          updateClassMenu();
          updatePaginationWhithSlides(currentIndex);
        },
      });
    },

    markers: false,
  });

  // ----------------------------------------
  // 3. Детектор футера (входит ли нижняя часть сайта в экран)
  // Он просто фиксирует, что можно нативно докрутить до конца
  // ----------------------------------------
  const footer = document.querySelector('.footer');

  if (footer) {
    ScrollTrigger.create({
      trigger: footer,
      start: 'top bottom', // футер появился снизу
      end: 'bottom bottom', // полностью виден
      onEnter: () => {
        inFooterScroll = true;
        try {
          unlockScroll();
        } catch (e) {}
      },
      markers: false,
    });
  }

  window.addEventListener('resize', () => {
    gsap.set(sliderWrapper, {xPercent: -100 * currentSlide});
  });
});
