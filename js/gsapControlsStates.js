// остальные кнопки + меню
const menu = document.querySelector('.menu');
const menuWrapper = document.querySelector('.menu__wrapper');
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
  'Хочешь, покажем<br> еще одну фичу?',
];

let footerVisible = false;

const UI_CONTROL_STATES = {
  default: {
    menuColor: '',
    menuOffset: window.height,
    showTg: true,
    showTgText: true,
    nextBtn: {visible: true, rotate: false, textIndex: 0},
    logoVisible: true,
    mobileLogoVisible: true,
    logoMode: 'full',
    iconDownVisible: true,
    iconUpVisible: false,
    buttonShadow: 'dark',
    controlsLeft: {visibility: {default: true, mobile: true}},
  },

  firstIndex: {
    menuColor: '',
    menuOffset: 0,
    showTg: true,
    showTgText: true,
    nextBtn: {visible: true, rotate: false, textIndex: 1},
    logoVisible: true,
    mobileLogoVisible: true,
    logoMode: 'full',
    iconDownVisible: true,
    iconUpVisible: false,
    buttonShadow: 'dark',
    controlsLeft: {visibility: {default: true, mobile: true}},
  },

  afterSecond: {
    menuColor: 'white',
    menuOffset: 0,
    showTg: true,
    showTgText: false,
    nextBtn: {visible: true, rotate: true, textIndex: 2},
    logoVisible: true,
    mobileLogoVisible: false, // <— важно
    logoMode: 'compact',
    iconDownVisible: true,
    iconUpVisible: false,
    buttonShadow: 'light',
    controlsLeft: {visibility: {default: true, mobile: false}},
  },

  lastSection: {
    menuColor: 'white',
    menuOffset: 0,
    showTg: false,
    showTgText: false,
    nextBtn: {visible: false, rotate: false, textIndex: null},
    logoVisible: true,
    mobileLogoVisible: false,
    logoMode: 'compact',
    iconDownVisible: true,
    iconUpVisible: false,
    buttonShadow: 'light',
    controlsLeft: {visibility: {default: true, mobile: false}},
  },

  lastSectionBottom: {
    menuColor: 'white',
    menuOffset: window.height,
    showTg: false,
    showTgText: false,
    nextBtn: {visible: false, rotate: false, textIndex: null},
    logoVisible: true,
    mobileLogoVisible: false,
    logoMode: 'compact',
    iconDownVisible: false,
    iconUpVisible: true,
    buttonShadow: 'light',
    controlsLeft: {visibility: {default: true, mobile: false}},
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
  }

  if (mode === 'full') {
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

function applyUIState(config) {
  menuWrapper.classList.toggle('white', config.menuColor === 'white');

  gsap.to('.menu', {
    y: window.height,
    duration: 0.3,
    ease: 'power3.inOut',
  });

  // tgBtn.forEach((btn) => {
  gsap.to(tgBtn, {
    opacity: config.showTg ? 1 : 0,
    x: config.showTg ? 0 : '-100%',
    duration: 0.6,
    ease: 'power2.out',
  });
  // });

  tgBtnText.forEach((txt) => {
    gsap.to(txt, {
      opacity: config.showTgText ? 1 : 0,
      y: config.showTgText ? 0 : -15,
      duration: 0.6,
      ease: 'power2.out',
    });
  });

  iconDownSvg.classList.toggle('rotate', config.nextBtn.rotate);

  if (config.nextBtn.visible) {
    nextBtn.style.display = 'inline-flex';

    if (mobileMode) {
      nextBtn.style.display = 'none';
    }

    let textIndex = config.nextBtn.textIndex;

    if (textIndex !== null) {
      nextBtnText.innerHTML = nextBtnTexts[textIndex];
    }

    const targetColor = currentIndex === 2 ? 'var(--light)' : 'var(--white)';

    gsap.to(nextBtnText, {
      color: targetColor,
      duration: 0.6,
      ease: 'power2.out',
    });

    gsap.to(nextBtnText, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
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

  const isMobile = window.matchMedia('(max-width: 1300px)').matches;

  const finalLogoVisible = isMobile
    ? config.mobileLogoVisible
    : config.logoVisible;

  gsap.set('.logo-main', {
    opacity: finalLogoVisible ? 1 : 0,
    visibility: finalLogoVisible ? 'visible' : 'hidden',
  });

  animateLogo(config.logoMode);

  gsap.set('.controls--left', {
    visibility: isMobile ? 'hidden' : 'visible',
  });
}

function updateUI() {
  console.log('updateUI');

  if (!mobileMode) {
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
