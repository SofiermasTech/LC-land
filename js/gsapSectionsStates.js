const UI_SECTION_STATES = {
  screen0: {
    heroFix: {x: 0, opacity: 1},
    heroBlur: {opacity: 0, blur: 0, visible: false, position: false},
    firstImg: {opacity: 1},
    // firstImg: {opacity: 0},
    numBtn: {opacity: 0},
    numbersOverlay: {opacity: 0, bg: 'rgba(1,3,16,0)', fixed: false},
    pagination: {opacity: 0, visible: false},
  },
  screen1: {
    heroFix: {x: '-150%', opacity: 0},
    heroBlur: {
      opacity: 1,
      blur: {default: 20, mobile: 13},
      visible: true,
      position: true,
    },
    firstImg: {opacity: 1},
    numBtn: {opacity: 1},
    numbersOverlay: {opacity: 1, bg: 'rgba(1,3,16,0.4)', fixed: true},
    pagination: {opacity: 0, visible: false},
    sliderTitle: {opacity: 0},
    slider: {opacity: 0},
  },
  screen2: {
    heroFix: {x: '-150%', opacity: 0},
    heroBlur: {opacity: 0, blur: 0, visible: false, position: false},
    firstImg: {opacity: 0},
    numBtn: {opacity: 0},
    numbersOverlay: {opacity: 0, bg: 'rgba(1,3,16,0)', fixed: false},
    pagination: {opacity: 1, visible: true},
    sliderTitle: {y: 0, opacity: 1},
    slider: {y: 0, opacity: 1},
  },
  screen3: {
    heroFix: {x: '-150%', opacity: 0},
    heroBlur: {opacity: 0, blur: 0, visible: false, position: false},
    firstImg: {opacity: 0},
    numBtn: {opacity: 0},
    numbersOverlay: {opacity: 0, bg: 'rgba(1,3,16,0)', fixed: false},
    pagination: {opacity: 0, visible: 'hidden'},
    sliderTitle: {opacity: 0},
  },
};

function applySectionUIState(config) {
  if (!config) return;

  const tl = gsap.timeline();

  tl.set('.hero__fix-wrapper', {
    x: config.heroFix.x,
    opacity: config.heroFix.opacity,
  });

  // gsap.set('.hero__blur', {
  //   display: config.heroBlur.visible ? 'block' : 'none',
  // });

  tl.set('.hero__blur', {
    display: config.heroBlur.visible ? 'block' : 'none',
    visibility: config.heroBlur.visible ? 'visible' : 'hidden',
    opacity: config.heroBlur.opacity,
    backdropFilter: `blur(${
      config.heroBlur.blur[mobileMode ? 'mobile' : 'default']
    }px)`,
  });

  tl.set('.first-wrapper__img', {
    opacity: config.firstImg.opacity,
  });

  if (config.numbersOverlay.fixed) {
    document.querySelector('.numbers__overlay').classList.add('section-fixed');
  } else {
    document
      .querySelector('.numbers__overlay')
      .classList.remove('section-fixed');
  }

  tl.set('.numbers__btn', {
    opacity: config.numBtn.opacity,
  });

  tl.to('.numbers__overlay', {
    opacity: config.numbersOverlay.opacity,
    background: config.numbersOverlay.bg,
  });
  tl.to('.service__title', {
    opacity: config.sliderTitle.opacity,
    y: config.sliderTitle.y,
  });
  tl.to('.service__content', {
    opacity: config.slider.opacity,
    y: config.slider.y,
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

  if (currentIndex === 2) {
    return applySectionUIState(UI_SECTION_STATES.screen2);
  }

  if (currentIndex >= 3) {
    return applySectionUIState(UI_SECTION_STATES.screen3);
  }
}

// анимации
function animationOnStart() {
  const timelineFirst = gsap.timeline();
  if (!mobileMode) {
    enableParallax();
  }
  document
    .querySelector('.first-wrapper')
    .classList.remove('no-comets-animation');
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
      .add(scrollImgState0(0), '-=0.6')
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
      )
      .to(
        '.hero__blur',
        {
          opacity: 0,
          backdropFilter: 'blur(0px)',
          visibility: 'hidden',
          duration: 0.3,
        },
        '<'
      );
  }

  console.log('animationOnStart конец');
}

function scrollImgState0(index) {
  const tl = gsap.timeline();

  gsap.set('.hero__blur', {
    display: UI_SECTION_STATES.screen0.heroBlur.visible ? 'block' : 'none',
  });

  console.log('scrollImgWrapper0 запущен');
  if (index === 0) {
    tl.to('.first-wrapper__img', {
      opacity: 1,
      duration: 0.1,
      ease: 'power4.out',
    }).fromTo(
      '.first-wrapper__img .img-paralax--l4-d',
      {x: '150px', opacity: 0},
      {x: 0, opacity: 1, duration: 0.7, ease: 'power2.out'},
      '-=0.1'
    );

    return tl;
  }
}

function scrollImgState1(index) {
  const tl = gsap.timeline();
  gsap.set('.hero__blur', {
    display: UI_SECTION_STATES.screen1.heroBlur.visible ? 'block' : 'none',
  });

  console.log('scrollImgWrapper1 запущен');
  if (index === 1) {
    tl.to('.first-wrapper__img .img-paralax--l4-d', {
      x: 0,
      opacity: 1,
    }).to('.first-wrapper__img', {
      opacity: 1,
    });

    return tl;
  }
}

function scrollImgStateOther() {
  const tl = gsap.timeline();
  gsap.set('.hero__blur', {
    display: UI_SECTION_STATES.screen2.heroBlur.visible ? 'block' : 'none',
  });
  console.log('scrollImgWrapper2 запущен');
  tl.to('.first-wrapper__img .img-paralax--l4-d', {
    opacity: 0,
    duration: 0.8,
    ease: 'power2.inOut',
    stagger: 0.05,
  }).to(
    '.first-wrapper__img',
    {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
      stagger: 0.05,
    },
    '<'
  );

  return tl;
}

// вход в секцию 0 сверху
function section0_enterForward() {
  const tl = gsap.timeline();
  console.log('section0_enterForward');
  if (!mobileMode) {
    enableParallax();
  }

  tl.from('.hero__fix-wrapper', {
    duration: 0.7,
    x: '-150%',
    ease: 'power2.out',
  });

  tl.from(
    '.controls--left',
    {
      duration: 0.7,
      x: '-100%',
      ease: 'power2.out',
    },
    '-=0.3'
  );

  tl.from(
    '.controls--right',
    {
      duration: 0.7,
      x: '100%',
      ease: 'power2.out',
    },
    '<'
  );

  tl.add(scrollImgState0(0), '-=0.6');

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

  if (currentIndex !== 1) {
    tl.add(scrollImgState0(0));
  }

  document
    .querySelector('.first-wrapper')
    .classList.remove('no-comets-animation');

  tl.fromTo(
    '.hero__fix-wrapper',
    {
      x: '-150%',
      opacity: 0,
    },
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
  }).to(
    '.hero__blur',
    {
      opacity: 0,
      backdropFilter: 'blur(0px)',
      visibility: 'hidden',
      duration: 0.3,
    },
    '<'
  );

  setTimeout(() => {
    const sec2 = document.querySelector('.numbers__overlay');
    sec2.classList.remove('section-fixed');
  }, 1000);

  return tl;
}

function section0_leaveForward() {
  console.log('section0_leaveForward');
  const tl = gsap.timeline();
  if (!mobileMode) {
    disableParallax();
  }

  document.querySelector('.first-wrapper').classList.add('no-comets-animation');

  tl.to('.hero__fix-wrapper', {
    duration: 0.5,
    x: '-150%',
    opacity: 0,
    ease: 'power2.out',
  });

  // if (currentIndex >= 2) {
  //   tl.add(scrollImgStateOther(), '-=0.15');
  // }

  return tl;
}

// выход вверх (1 → 0)
function section0_leaveBackward() {
  console.log('section0_leaveBackward');
  const tl = gsap.timeline();

  tl.to('.numbers__overlay', {
    duration: 0.3,
    opacity: 0,
    ease: 'power2.out',
  });

  tl.add(scrollImgState0(0), '+=0.1');

  return tl;
}

function section1_enterForward() {
  console.log('section1_enterForward');
  const tl = gsap.timeline();

  gsap.set('.hero__blur', {
    display: UI_SECTION_STATES.screen1.heroBlur.visible ? 'block' : 'none',
  });

  const sec2 = document.querySelector('.numbers__overlay');
  sec2.classList.add('section-fixed');
  document.querySelector('.hero__blur').style.position = 'fixed';

  if (currentIndex >= 2) {
    tl.add(scrollImgState1(1));
  }
  tl.to('.hero__blur', {
    duration: 0.4,
    backdropFilter: 'blur(20px)',
    opacity: 1,
    visibility: 'visible',
    ease: 'power2.out',
  })
    .to('.numbers__overlay', {
      duration: 0.4,
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
  console.log('section1_leaveForward — плавный fade + slide');
  const tl = gsap.timeline();

  tl.to(
    [
      '.hero__blur',
      '.numbers__overlay',
      '.first-wrapper__img',
      '.first-wrapper__img .img-paralax--l4-d',
    ],
    {
      // x: -150,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.inOut',
      // stagger: 0.05,
    },
    0
  );

  // Убираем фиксацию
  // tl.set('.numbers__overlay', {className: '-=section-fixed'}, 0);
  // tl.set('.hero__blur', {position: 'static'}, 0.2);

  return tl;
}

function section1_enterBackward() {
  console.log('section1_enterBackward');
  const tl = gsap.timeline();
  const sec2 = document.querySelector('.numbers__overlay');
  sec2.classList.add('section-fixed');
  document.querySelector('.hero__blur').style.position = 'fixed';

  tl.add(section1_enterForward());
  tl.to('.menu', {
    duration: 0.3,
    y: 0,
    ease: 'power2.out',
  });

  return tl;
}

function section1_leaveBackward() {
  console.log('section1_leaveBackward');
  const tl = gsap.timeline();

  tl.to('.numbers__overlay', {opacity: 0, duration: 0.3}).to(
    '.hero__blur',
    {
      opacity: 0,
      backdropFilter: 'blur(0px)',
      visibility: 'hidden',
      duration: 0.3,
    },
    '<'
  );

  return tl;
}

function section2_enterForward() {
  console.log('section2_enterForward — плавный вход');
  const tl = gsap.timeline();

  if (currentIndex === 0) {
    tl.add(scrollImgStateOther());
  }

  // Заголовок и контент выезжают снизу
  tl.fromTo(
    '.service__title',
    {
      y: '120%',
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out',
    }
  );

  tl.fromTo(
    '.service__content',
    {
      y: 100,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out',
    }
  );
  // Показываем пагинацию сразу
  tl.set('.service-swiper__pagination', {
    opacity: 1,
    visibility: 'visible',
  });

  setTimeout(() => {
    document.querySelector('.hero__blur').style.position = 'static';
    const sec2 = document.querySelector('.numbers__overlay');
    sec2.classList.remove('section-fixed');

    if (mobileMode) {
      lastSection.classList.add('fixed-section');
    }
  }, 1500);

  console.log(tl);
  return tl;
}

function section2_enterBackward() {
  console.log('section2_enterBackward');
  const tl = gsap.timeline();

  tl.fromTo(
    '.service__content',
    {y: '150', opacity: 0},
    {y: 0, opacity: 1, duration: 0.4, ease: 'power2.in'}
  );
  tl.fromTo(
    '.service__title',
    {y: '150', opacity: 0},
    {y: 0, opacity: 1, duration: 0.3, ease: 'power2.in'}
  );
  tl.to('.menu', {
    duration: 0.5,
    y: 0,
    ease: 'power2.out',
  });

  document.querySelector('.service-swiper__pagination').style.opacity = 1;
  document.querySelector('.service-swiper__pagination').style.visibility =
    'visible';

  return tl;
}

function section2_leaveForward() {
  console.log('section2_leaveForward');
  const tl = gsap.timeline();
  document.querySelector('.service-swiper__pagination').style.opacity = 0;
  document.querySelector('.service-swiper__pagination').style.visibility =
    'hidden';

  if (!mobileMode) {
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
        duration: 0.3,
        ease: 'power2.out',
      },
      '-=0.2'
    );
  }

  return tl;
}

function section2_leaveBackward() {
  console.log('section2_leaveBackward');
  const tl = gsap.timeline();
  document.querySelector('.service-swiper__pagination').style.opacity = 0;
  document.querySelector('.service-swiper__pagination').style.visibility =
    'hidden';
  document.querySelector('.hero__blur').style.position = 'fixed';
  if (mobileMode) {
    lastSection.classList.remove('fixed-section');
  }
  if (!mobileMode) {
    tl.to('.service__content', {
      y: '100%',
      opacity: 0,
      duration: 0.3,
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
  }

  return tl;
}

function section3_enterForward() {
  console.log('section3_enterForward');
  const tl = gsap.timeline();

  tl.add(scrollImgStateOther());

  if (!mobileMode) {
    tl.fromTo(
      '.t1',
      {y: '150%', opacity: 0},
      {y: 0, opacity: 1, duration: 0.6, ease: 'power1.out'}
    )
      .fromTo(
        '.t2',
        {y: '150%', opacity: 0},
        {y: 0, opacity: 1, duration: 0.4, ease: 'power1.out'},
        '-=0.2'
      )
      .fromTo(
        '.faq__title',
        {y: '250%', opacity: 0},
        {y: 0, opacity: 1, duration: 0.3, ease: 'power1.out'}
      )
      .fromTo(
        '.faq__questions',
        {y: '150%', opacity: 0},
        {y: 0, opacity: 1, duration: 0.4, ease: 'power1.out'},
        '<'
      )
      // .fromTo(
      //   '.a2',
      //   {y: '240', opacity: 0},
      //   {y: 0, opacity: 1, duration: 0.2, ease: 'power1.out'}
      // )
      // .fromTo(
      //   '.a3',
      //   {y: window.innerHeight, opacity: 0},
      //   {y: 0, opacity: 1, duration: 0.2, ease: 'power1.out'}
      // )
      // .fromTo(
      //   '.a4',
      //   {y: window.innerHeight, opacity: 0},
      //   {y: 0, opacity: 1, duration: 0.2, ease: 'power1.out'}
      // )
      // .fromTo(
      //   '.a5',
      //   {y: window.innerHeight, opacity: 0},
      //   {y: 0, opacity: 1, duration: 0.1, ease: 'power1.out'}
      // )
      .fromTo(
        '.faq__else-ask',
        {y: '150%', opacity: 0},
        {y: 0, opacity: 1, duration: 0.3, ease: 'power1.out'},
        '+=0.1'
      );
    // document.querySelector('.controls--left').style.width = '85px';
  }

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
  // updateUI();
  // document.querySelector('.controls--left').style.width = 'auto';
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

  let tl = gsap.timeline({});

  if (direction === 'forward') {
    // prevIndex → nextIndex
    tl.add(prevSection.leaveForward(prevIndex, nextIndex));

    if (
      (prevIndex === 1 && nextIndex === 2) ||
      (prevIndex === 0 && nextIndex === 2)
    ) {
      tl.add(nextSection.enterForward(prevIndex, nextIndex), '-=0.7');
    } else {
      tl.add(nextSection.enterForward(prevIndex, nextIndex));
    }
  } else {
    // nextIndex < prevIndex
    tl.add(prevSection.leaveBackward(prevIndex, nextIndex)).add(
      nextSection.enterBackward(prevIndex, nextIndex),
      '+=0.1'
    );
  }
  console.log('Переход1 длится:', tl.totalDuration(), 'сек');
  return tl;
}
