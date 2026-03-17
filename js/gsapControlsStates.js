// остальные кнопки + меню
const menu = document.querySelector('.menu');
const menuWrapper = document.querySelector('.menu__wrapper');
const logoNameImg = document.querySelector('.logo-main__name');
const logoText = document.querySelector('.logo-main__text');
const logoSplit = document.querySelector('.logo-main__split');
const tgBtn = document.querySelectorAll('.controls__tg');
const tgBtnText = document.querySelectorAll('.tg__text');
const nextBtn = document.querySelector('.btn-scroll');
const iconDown = document.querySelector('.icon-down');
const iconDownSvg = iconDown.querySelector('svg');
const iconUp = document.querySelector('.icon-up');
const nextBtnText = document.querySelector('.btn-scroll-text');
const nextBtnTexts = [
  'У нас условия<br> с ума сойдешь',
  'А что там за фичи<br> у вас такие?',
  'Хочу еще<br>подробностей',
];

let footerVisible = false;
let isStaticLogoApplied = false;
const isBigScreen = window.matchMedia('(min-width: 1680px)').matches;

const UI_CONTROL_STATES = {
  default: {
    menuColor: '',
    menuOffset: window.height,
    showTg: true,
    showTgText: true,
    nextBtn: {visible: true, rotate: false, textIndex: 0},
    logoVisible: true,
    mobileLogoVisible: true,
    logoMode: {desktop: 'full', laptop: 'full'},
    iconDownVisible: true,
    iconUpVisible: false,
    buttonShadow: 'dark',
    controlsLeft: {visibility: {default: true, mobile: true}, width: 'auto'},
  },

  firstIndex: {
    menuColor: '',
    menuOffset: 0,
    showTg: true,
    showTgText: true,
    nextBtn: {visible: true, rotate: false, textIndex: 1},
    logoVisible: true,
    mobileLogoVisible: true,
    logoMode: {desktop: 'full', laptop: 'full'},
    iconDownVisible: true,
    iconUpVisible: false,
    buttonShadow: 'dark',
    controlsLeft: {visibility: {default: true, mobile: true}, width: 'auto'},
  },

  afterSecond: {
    menuColor: 'white',
    menuOffset: 0,
    showTg: true,
    showTgText: false,
    nextBtn: {visible: true, rotate: true, textIndex: 2},
    logoVisible: true,
    mobileLogoVisible: false,
    logoMode: {desktop: 'middle', laptop: 'compact'},
    iconDownVisible: true,
    iconUpVisible: false,
    buttonShadow: 'light',
    controlsLeft: {visibility: {default: true, mobile: false}, width: 'auto'},
  },
  // оставила т.к. вдруг захотят вернуть особые состояния послед слайда
  // lastSlide: {
  //   menuColor: 'white',
  //   menuOffset: 0,
  //   showTg: true,
  //   showTgText: false,
  //   nextBtn: {visible: true, rotate: false, textIndex: 2},
  //   iconDownVisible: true,
  //   logoVisible: true,
  //   mobileLogoVisible: false,
  //   logoMode: {desktop: 'middle', laptop: 'compact'},
  //   iconUpVisible: false,
  //   buttonShadow: 'light',
  //   controlsLeft: {visibility: {default: true, mobile: false}, width: 'auto'},
  // },
  lastSection: {
    menuColor: 'white',
    menuOffset: 0,
    showTg: true,
    showTgText: false,
    nextBtn: {visible: false, rotate: false, textIndex: null},
    logoVisible: true,
    mobileLogoVisible: false,
    logoMode: {desktop: 'middle', laptop: 'compact'},
    iconDownVisible: true,
    iconUpVisible: false,
    buttonShadow: 'light',
    controlsLeft: {visibility: {default: true, mobile: false}, width: 'auto'},
  },

  lastSectionBottom: {
    menuColor: 'white',
    menuOffset: window.height,
    showTg: false,
    showTgText: false,
    nextBtn: {visible: false, rotate: false, textIndex: null},
    logoVisible: true,
    mobileLogoVisible: false,
    logoMode: {desktop: 'compact', laptop: 'compact'},
    iconDownVisible: false,
    iconUpVisible: true,
    buttonShadow: 'light',
    controlsLeft: {visibility: {default: true, mobile: false}, width: '80px'},
  },
};

let logoModeCurrent = 'full';
let logoAnimation = null;

function animateLogo(mode) {
  if (mode === logoModeCurrent) return;

  if (logoAnimation) logoAnimation.kill();

  logoAnimation = gsap.timeline({
    onComplete: () => {
      logoModeCurrent = mode;
    },
  });

  if (mode === 'compact') {
    logoAnimation
      .to(
        '.logo-main__text',
        {
          width: 0,
          opacity: 0,
          display: 'none',
          duration: 0.4,
          ease: 'power2.in',
        },
        0,
      )
      .to(
        '.logo-main__name',
        {
          width: 0,
          opacity: 0,
          display: 'none',
          duration: 0.5,
          ease: 'power2.in',
        },
        0,
      )
      .to(
        '.logo-main__split',
        {
          width: 0,
          opacity: 0,
          display: 'none',
          duration: 0.4,
          ease: 'power2.in',
        },
        0,
      )
      .to(
        '.logo-main__icon',
        {width: 64, height: 40, duration: 0.6, ease: 'back.out(1.4)'},
        '-=0.3',
      );

    document.querySelector('.logo-main__icon').style.borderRadius = '10px';
  }

  if (mode === 'middle') {
    console.log('mmmmm');

    logoAnimation
      .set('.logo-main__name', {
        display: 'inline-flex',
        width: 110,
        filter: 'brightness(0.1)',
      })
      .to(
        '.logo-main__text',
        {
          width: 0,
          opacity: 0,
          display: 'none',
          duration: 0.3,
          ease: 'power2.in',
        },
        0,
      )
      .fromTo(
        '.logo-main__name',
        {opacity: 0},
        {opacity: 1, duration: 0.3, ease: 'power2.out'},
        0,
      )
      .to(
        '.logo-main__split',
        {
          width: 0,
          opacity: 0,
          display: 'none',
          duration: 0.3,
          ease: 'power2.in',
        },
        0,
      );

    document.querySelector('.logo-main__icon').style.borderRadius = '0';
  }

  if (mode === 'full') {
    logoAnimation
      .set(
        ['.logo-main__text', '.logo-main__name', '.logo-main__split'],
        {display: 'inline-flex'},
        0,
      )
      .set('.logo-main__name', {
        filter: 'brightness(1)',
      })
      .to(
        '.logo-main__icon',
        {width: 26, height: 16, duration: 0.5, ease: 'power2.out'},
        0,
      )
      .to(
        '.logo-main__text',
        {width: 'auto', opacity: 1, duration: 0.6, ease: 'power2.out'},
        0.3,
      )
      .to(
        '.logo-main__name',
        {
          width: 110,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
        },
        0.3,
      )
      .to(
        '.logo-main__split',
        {width: 'auto', opacity: 1, duration: 0.6, ease: 'power2.out'},
        0.3,
      );

    document.querySelector('.logo-main__icon').style.borderRadius = '0';
  }
}

function applyUIState(config) {
  menuWrapper.classList.toggle('white', config.menuColor === 'white');

  gsap.to('.menu', {
    y: window.height,
    duration: 0.3,
    ease: 'power3.inOut',
  });

  gsap.to(tgBtn, {
    opacity: config.showTg ? 1 : 0,
    x: config.showTg ? 0 : '-100%',
    visibility: config.showTg ? 'visible' : 'hidden',
    duration: 0.6,
    ease: 'power2.out',
  });

  gsap.to(tgBtnText, {
    opacity: config.showTgText ? 1 : 0,
    y: config.showTgText ? 0 : -15,
    display: config.showTgText ? 'inline-flex' : 'none',
    duration: 0.6,
    ease: 'power2.out',
  });

  iconDownSvg.classList.toggle('rotate', config.nextBtn.rotate);

  if (config.nextBtn.visible) {
    nextBtn.style.display = 'inline-flex';

    if (mobileMode) {
      nextBtn.style.display = 'none';
    }
  }

  if (config.nextBtn.textIndex !== null) {
    const targetColor = currentIndex === 2 ? 'var(--light)' : 'var(--white)';
    let textIndex = config.nextBtn.textIndex;
    const newText = nextBtnTexts[textIndex];

    if (nextBtnText.innerHTML !== newText) {
      nextBtnText.innerHTML = newText;
    }

    gsap.to(nextBtnText, {
      color: targetColor,
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  } else {
    gsap.to(nextBtnText, {
      opacity: 0,
      y: -15,
      duration: 0.3,
    });
  }

  iconDown.style.display = config.iconDownVisible ? 'block' : 'none';
  iconUp.style.display = config.iconUpVisible ? 'block' : 'none';

  const shadow =
    config.buttonShadow === 'dark'
      ? '0 16px 24px 0 rgba(0,0,0,0.4)'
      : '0 16px 24px 0 rgba(0,0,0,0.1)';

  gsap.to('.tg .base-btn', {boxShadow: shadow, duration: 0.3});
  gsap.to('.controls__btn-reg .base-btn', {boxShadow: shadow, duration: 0.3});
  gsap.to('.btn-scroll', {boxShadow: shadow, duration: 0.3});

  const isLaptop = window.matchMedia('(max-width: 1400px)').matches;

  const finalLogoVisible = isLaptop
    ? config.mobileLogoVisible
    : config.logoVisible;

  const isScreen = isBigScreen
    ? config.logoMode.desktop
    : config.logoMode.laptop;

  gsap.set('.logo-main', {
    opacity: finalLogoVisible ? 1 : 0,
    visibility: finalLogoVisible ? 'visible' : 'hidden',
  });

  animateLogo(isScreen);

  const controlsVisible = mobileMode
    ? config.controlsLeft.visibility.mobile
    : config.controlsLeft.visibility.default;

  gsap.to('.controls--left', {
    visibility: controlsVisible ? 'visible' : 'hidden',
    opacity: controlsVisible ? 1 : 0,
    width: config.controlsLeft.width || 'auto',
    duration: 0.3,
    ease: 'power2.out',
  });
}

function updateNextButtonRotate() {
  if (currentSlide !== lastSlide) {
    iconDownSvg.classList.add('rotate');
  } else {
    iconDownSvg.classList.remove('rotate');
  }
}

function updateUI() {
  if (!mobileMode) {
    // console.log('start ui');
    if (currentIndex === 0) return applyUIState(UI_CONTROL_STATES.default);
    if (currentIndex === 1) return applyUIState(UI_CONTROL_STATES.firstIndex);
    if (currentIndex === 2) return applyUIState(UI_CONTROL_STATES.afterSecond);

    if (currentIndex === lastIndex && !footerVisible)
      return applyUIState(UI_CONTROL_STATES.lastSection);
    if (currentIndex === lastIndex && footerVisible)
      return applyUIState(UI_CONTROL_STATES.lastSectionBottom);
  }

  if (mobileMode) {
    if (currentIndex === 0) return applyUIState(UI_CONTROL_STATES.default);
    if (currentIndex === 1) return applyUIState(UI_CONTROL_STATES.firstIndex);

    if (currentIndex === lastIndex && !footerVisible)
      return applyUIState(UI_CONTROL_STATES.afterSecond);

    if (currentIndex === lastIndex && footerVisible)
      return applyUIState(UI_CONTROL_STATES.lastSectionBottom);
  }

  return applyUIState(UI_CONTROL_STATES.default);
}
