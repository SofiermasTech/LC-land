const UI_SECTION_STATES = {
  screen0: {
    heroFix: {x: 0, opacity: 1},
    heroBlur: {opacity: 0, blur: 0, visible: false, position: false},
    firstImg: {opacity: 1},
    numbersOverlay: {opacity: 0, bg: 'rgba(1,3,16,0)', fixed: false},
    pagination: {opacity: 0, visible: false},
  },
  screen1: {
    heroFix: {x: '-150%', opacity: 0},
    heroBlur: {opacity: 1, blur: 20, visible: true, position: true},
    firstImg: {opacity: 1},
    numbersOverlay: {opacity: 1, bg: 'rgba(1,3,16,0.4)', fixed: true},
    pagination: {opacity: 0, visible: false},
  },
  screen2: {
    heroFix: {x: '-150%', opacity: 0},
    heroBlur: {opacity: 0, blur: 0, visible: false, position: false},
    firstImg: {opacity: 0},
    numbersOverlay: {opacity: 0, bg: 'rgba(1,3,16,0)', fixed: false},
    pagination: {opacity: 1, visible: true},
  },
};

function applySectionUIState(config, animate = true) {
  if (!config) return;

  const tl = gsap.timeline();

  //
  // heroFix
  //
  tl.set('.hero__fix-wrapper', {
    x: config.heroFix.x,
    opacity: config.heroFix.opacity,
    // duration: animate ? 0.6 : 0,
    // ease: 'power2.out',
  });

  //
  // heroBlur (opacity + blur + visibility)
  //
  gsap.set('.hero__blur', {
    visibility: config.heroBlur.visible ? 'visible' : 'hidden',
  });

  // if (config.heroBlur.position) {
  //   document.querySelector('.hero__blur').style.position = 'fixed';
  // } else {
  //   document.querySelector('.hero__blur').style.position = 'static';
  // }

  tl.set('.hero__blur', {
    opacity: config.heroBlur.opacity,
    backdropFilter: `blur(${config.heroBlur.blur}px)`,
    // duration: animate ? 0.6 : 0,
  });

  //
  // First image
  //
  tl.set('.first-wrapper__img', {
    opacity: config.firstImg.opacity,
    // duration: animate ? 0.6 : 0,
  });

  //
  // Numbers overlay
  //
  if (config.numbersOverlay.fixed) {
    document.querySelector('.numbers__overlay').classList.add('section-fixed');
  } else {
    document
      .querySelector('.numbers__overlay')
      .classList.remove('section-fixed');
  }

  tl.to('.numbers__overlay', {
    opacity: config.numbersOverlay.opacity,
    background: config.numbersOverlay.bg,
    // duration: animate ? 0.6 : 0,
  });

  tl.to('.service-swiper__pagination', {
    opacity: config.pagination.opacity,
    visibility: config.pagination.visible ? 'visible' : 'hidden',
  });

  return tl;
}

function updateSectionsUI(currentIndex) {
  console.log('updateSectionsUI');

  if (currentIndex === 0) {
    return applySectionUIState(UI_SECTION_STATES.screen0);
  }

  if (currentIndex === 1) {
    return applySectionUIState(UI_SECTION_STATES.screen1);
  }

  if (currentIndex >= 2) {
    return applySectionUIState(UI_SECTION_STATES.screen2);
  }
}

// ===============================
// Анимации первой секции
// ===============================
function animationOnStart() {
  const timelineFirst = gsap.timeline();
  if (!mobileMode) {
    enableParallax();
  }
  console.log('animationOnStart нач');
  document.querySelector('.service-swiper__pagination').style.opacity = 0;
  document.querySelector('.service-swiper__pagination').style.visibility =
    'hidden';

  if (currentIndex === 0) {
    timelineFirst
      .from('.hero__fix-wrapper', {
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
      .fromTo(
        '.menu',
        {
          y: windowHeight,
        },
        {
          duration: 1,
          y: 0,
          ease: 'power2.out',
        },
        '<'
      );
  }

  console.log('animationOnStart конец');
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
          duration: 0.7,
          ease: 'power2.out',
        },
        '-=0.1'
      );
    // gsap.set('.controls--left', {opacity: 1, visibility: 'visible'});
    // gsap.to('.logo-main', {opacity: 1, visibility: 'visible'});
  } else if (index === 1) {
    imgScrollTL
      .set('.first-wrapper__img img', {
        x: 0,
        opacity: 1,
      })
      .set('.first-wrapper__img', {
        opacity: 1,
      });
    // gsap.set('.controls--left', {opacity: 1, visibility: 'visible'});
    // gsap.to('.logo-main', {opacity: 1, visibility: 'visible'});
  } else {
    imgScrollTL
      .to('.first-wrapper__img img', {
        duration: 0.4,
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
          duration: 0.1,
          ease: 'back.out',
        },
        '<'
      );
  }
  return imgScrollTL;
}

// вход в секцию 0 сверху
function section0_enterForward() {
  const tl = gsap.timeline();
  console.log('section0_enterForward');
  if (!mobileMode) {
    enableParallax();
  }

  // Показать фиксированный блок
  tl.from('.hero__fix-wrapper', {
    duration: 0.7,
    x: '-150%',
    ease: 'power2.out',
  });

  // Левый контрол
  tl.from(
    '.controls--left',
    {
      duration: 0.7,
      x: '-100%',
      ease: 'power2.out',
    },
    '-=0.3'
  );

  // Правый контрол
  tl.from(
    '.controls--right',
    {
      duration: 0.7,
      x: '100%',
      ease: 'power2.out',
    },
    '<'
  );

  // Плавное появление первой картинки
  tl.add(scrollImgWrapper(0), '-=0.6');

  // Появление меню
  tl.to(
    '.menu',
    {
      duration: 0.3,
      y: 0,
      ease: 'power2.out',
    },
    '<'
  );

  return tl;
}

// вход в секцию 0 снизу
function section0_enterBackward() {
  console.log('section0_enterBackward');
  const tl = gsap.timeline();

  if (!mobileMode) {
    enableParallax();
  }
  // Возвращаем картинку
  tl.add(scrollImgWrapper(0));
  // Возвращаем фиксированный блок на экран
  tl.to(
    '.hero__fix-wrapper',
    {
      duration: 0.7,
      x: 0,
      opacity: 1,
      ease: 'power2.out',
    },
    '-=0.3'
  );

  tl.to('.menu', {
    duration: 0.3,
    y: 0,
    ease: 'power2.out',
  });

  return tl;
}

// выход вниз (0 → 1)
function section0_leaveForward() {
  console.log('section0_leaveForward');
  const tl = gsap.timeline();
  disableParallax();

  // убрать фиксированный блок
  tl.to('.hero__fix-wrapper', {
    duration: 0.3,
    x: '-150%',
    opacity: 0,
    ease: 'power2.out',
  });

  // скрыть картинку
  // tl.add(scrollImgWrapper(2));

  return tl;
}

// выход вверх (1 → 0)
function section0_leaveBackward() {
  console.log('section0_leaveBackward');
  const tl = gsap.timeline();

  // убрать контент второй секции
  tl.to('.numbers__overlay', {
    duration: 0.3,
    opacity: 0,
    ease: 'power2.out',
  });

  // и вернуть картинку назад
  tl.add(scrollImgWrapper(0), '+=0.1');

  return tl;
}

function section1_enterForward() {
  console.log('section1_enterForward');
  const tl = gsap.timeline();

  const sec2 = document.querySelector('.numbers__overlay');
  sec2.classList.add('section-fixed');
  document.querySelector('.hero__blur').style.position = 'fixed';

  tl.add(scrollImgWrapper(1))
    .to('.hero__blur', {
      duration: 0.7,
      backdropFilter: 'blur(20px)',
      opacity: 1,
      visibility: 'visible',
      ease: 'power2.out',
    })
    .to('.numbers__overlay', {
      duration: 0.5,
      opacity: 1,
      background: 'rgba(1, 3, 16, 0.4)',
      ease: 'power2.out',
    })
    .fromTo('.numbers__big-number', {opacity: 0}, {opacity: 1, duration: 0.3})
    .fromTo(
      '.numbers__label',
      {opacity: 0, y: 20},
      {opacity: 1, y: 0, duration: 0.3}
    )
    .fromTo('.numbers__btn', {opacity: 0}, {opacity: 1, duration: 0.2});

  return tl;
}

function section1_leaveForward() {
  console.log('section1_leaveForward');
  const tl = gsap.timeline();

  tl.to('.numbers__big-number', {opacity: 0, duration: 0.2})
    .to('.numbers__label', {opacity: 0, y: 0, duration: 0.2}, '<')
    .set('.numbers__btn', {opacity: 0}, '-=0.3')
    .to('.numbers__overlay', {
      opacity: 0,
      background: 'rgba(1, 3, 16, 0)',
      duration: 0.2,
    })
    .to(
      '.hero__blur',
      {
        opacity: 0,
        backdropFilter: 'blur(0px)',
        visibility: 'hidden',
        duration: 0.2,
      },
      '<'
    )
    .add(scrollImgWrapper(2), '-=0.3');

  return tl;
}

function section1_enterBackward() {
  console.log('section1_enterBackward');
  const tl = gsap.timeline();
  const sec2 = document.querySelector('.numbers__overlay');
  sec2.classList.add('section-fixed');
  document.querySelector('.hero__blur').style.position = 'fixed';

  // .add(scrollImgWrapper(1))
  // .to('.service__content', {y: '100%', opacity: 0, duration: 0.5})
  //   .to('.service__title', {y: '150%', opacity: 0, duration: 0.3}, '-=0.2')

  tl.add(section1_enterForward(), '-=0.3');

  return tl;
}

function section1_leaveBackward() {
  console.log('section1_leaveBackward');
  const tl = gsap.timeline();

  tl.to('.numbers__overlay', {opacity: 0, duration: 0.2}).to(
    '.hero__blur',
    {
      opacity: 0,
      backdropFilter: 'blur(0px)',
      visibility: 'hidden',
      duration: 0.2,
    },
    '<'
  );

  return tl;
}

function section2_enterForward() {
  console.log('section2_enterForward');
  const tl = gsap.timeline();
  document.querySelector('.service-swiper__pagination').style.opacity = 1;
  document.querySelector('.service-swiper__pagination').style.visibility =
    'visible';
  // Заголовок выезжает снизу вверх
  tl.add(scrollImgWrapper(2)).fromTo(
    '.service__title',
    {y: '150%', opacity: 0},
    {y: 0, opacity: 1, duration: 0.2, ease: 'power2.out'}
  );

  // Контент выезжает снизу
  tl.fromTo(
    '.service__content',
    {y: '150%', opacity: 0},
    {y: 0, opacity: 1, duration: 0.4, ease: 'power2.out'},
    '-=0.1'
  );

  setTimeout(() => {
    document.querySelector('.hero__blur').style.position = 'static';
    const sec2 = document.querySelector('.numbers__overlay');
    sec2.classList.remove('section-fixed');
  }, 350);

  return tl;
}

function section2_enterBackward() {
  console.log('section2_enterForward');
  const tl = gsap.timeline();
  document.querySelector('.service-swiper__pagination').style.opacity = 1;
  document.querySelector('.service-swiper__pagination').style.visibility =
    'visible';

  // Контент выезжает снизу
  tl.fromTo(
    '.service__content',
    {y: '-100%', opacity: 0},
    {y: 0, opacity: 1, duration: 0.4, ease: 'power2.out'}
  );

  // Заголовок выезжает сверху
  tl.fromTo(
    '.service__title',
    {y: '-150%', opacity: 0},
    {y: 0, opacity: 1, duration: 0.3, ease: 'power2.out'}
  );

  return tl;
}

function section2_leaveForward() {
  console.log('section2_leaveForward');
  const tl = gsap.timeline();
  document.querySelector('.service-swiper__pagination').style.opacity = 0;
  document.querySelector('.service-swiper__pagination').style.visibility =
    'hidden';
  tl.to('.service__title', {
    y: '-150%',
    opacity: 0,
    duration: 0.3,
    ease: 'power2.out',
  });

  tl.to(
    '.service__content',
    {
      y: '-100%',
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
    },
    '-=0.2'
  );

  // tl.add(scrollImgWrapper(2), '-=0.1');

  return tl;
}

function section2_leaveBackward() {
  console.log('section2_leaveBackward');
  const tl = gsap.timeline();
  document.querySelector('.service-swiper__pagination').style.opacity = 0;
  document.querySelector('.service-swiper__pagination').style.visibility =
    'hidden';
  document.querySelector('.hero__blur').style.position = 'fixed';
  tl.to('.service__content', {
    y: '100%',
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out',
  });

  tl.to(
    '.service__title',
    {
      y: '150%',
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
    },
    '-=0.2'
  );

  // убираем картинку
  // tl.add(scrollImgWrapper(0), '+=0.1');

  // затем вызываем анимацию секции 1
  // tl.add(section1_enterForward(), '<');

  return tl;
}

function section3_enterForward() {
  console.log('section3_enterForward');
  const tl = gsap.timeline();

  // Заголовок выезжает снизу вверх
  tl.add(scrollImgWrapper(3)).fromTo(
    '.together',
    {y: '150%', opacity: 0},
    {y: 0, opacity: 1, duration: 0.2, ease: 'power2.out'}
  );

  setTimeout(() => {
    document.querySelector('.hero__blur').style.position = 'static';
    const sec2 = document.querySelector('.numbers__overlay');
    sec2.classList.remove('section-fixed');
  }, 150);

  return tl;
}

function section3_leaveBackward() {
  console.log('section3_leaveBackward');
  const tl = gsap.timeline();
  updateUI();
  // Заголовок выезжает снизу вверх
  // tl.fromTo(
  //   '.together',
  //   {y: '150%', opacity: 0},
  //   {y: 0, opacity: 1, duration: 0.2, ease: 'power2.out'}
  // );

  // setTimeout(() => {
  //   document.querySelector('.hero__blur').style.position = 'static';
  //   const sec2 = document.querySelector('.numbers__overlay');
  //   sec2.classList.remove('section-fixed');
  // }, 150);

  return tl;
}
const sectionsMap = {
  0: {
    enterForward: section0_enterForward,
    enterBackward: section0_enterBackward,
    leaveForward: section0_leaveForward,
    leaveBackward: section0_leaveBackward,
  },
  1: {
    enterForward: section1_enterForward,
    enterBackward: section1_enterBackward,
    leaveForward: section1_leaveForward,
    leaveBackward: section1_leaveBackward,
  },
  2: {
    enterForward: section2_enterForward,
    enterBackward: section2_enterBackward,
    leaveForward: section2_leaveForward,
    leaveBackward: section2_leaveBackward,
  },
  3: {
    enterForward: () => section3_enterForward,
    enterBackward: () => gsap.timeline({duration: 0.2}),
    leaveForward: () => gsap.timeline({duration: 0.2}),
    leaveBackward: section3_leaveBackward,
  },
};

function runSectionTransition(prevIndex, nextIndex) {
  const direction = nextIndex > prevIndex ? 'forward' : 'backward';

  const prevSection = sectionsMap[prevIndex];
  const nextSection = sectionsMap[nextIndex];

  let tl = gsap.timeline({
    onComplete: () => {
      // Это сработает, когда и уход, и приход — полностью завершены
    },
  });

  if (direction === 'forward') {
    // Сначала полностью уходит старая секция
    if (prevSection.leaveForward) {
      tl.add(prevSection.leaveForward(prevIndex, nextIndex));
    }
    // Потом — только после этого — появляется новая
    if (nextSection.enterForward) {
      tl.add(nextSection.enterForward(prevIndex, nextIndex));
    }
  } else {
    // То же самое для движения назад
    if (prevSection.leaveBackward) {
      tl.add(prevSection.leaveBackward(prevIndex, nextIndex));
    }
    if (nextSection.enterBackward) {
      tl.add(nextSection.enterBackward(prevIndex, nextIndex));
    }
  }

  return tl;
}
