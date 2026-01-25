// загрузка swiper lib только на моб
let swiperLoadingPromise = null;

function loadSwiper() {
  if (window.Swiper) {
    return Promise.resolve();
  }

  if (swiperLoadingPromise) {
    return swiperLoadingPromise;
  }

  swiperLoadingPromise = new Promise((resolve) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'lib/swiper-bundle.min.css';

    const js = document.createElement('script');
    js.src = 'lib/swiper-bundle.min.js';
    js.onload = resolve;

    document.head.appendChild(css);
    document.body.appendChild(js);
  });

  return swiperLoadingPromise;
}

// управление свайперами на десктоп - gsap, на моб. - swiper
let mobileSwiperMain = null;
let mobileSwiperImg = null;

const mobileSize = '(max-width: 1050px)';
function isMobile() {
  return window.matchMedia(mobileSize).matches;
}

let mobileMode = isMobile();
// console.log(mobileMode);

mobileMode = isMobile();
updateSliders();

// render slide
function initServiceSwiper() {
  if (!mobileMode) {
    const template = document.getElementById('slide-template');
    const containerSlides = document.querySelector('.service-swiper__wrapper');
    const containerPagination = document.querySelector(
      '.service-swiper__pagination',
    );

    if (!template || !containerSlides) return;

    const fragment = document.createDocumentFragment();
    const dotsFragment = document.createDocumentFragment();

    slidesData.forEach((data, index) => {
      const slide = template.content.cloneNode(true);
      const slideItem = slide.querySelector('.service-swiper__slide');
      const slideTitle = slide.querySelector('.slide__title');

      slideItem.classList.add(`slide--${index + 1}`);
      slideItem.id = `slide-${index + 1}`;
      slide.querySelector('.slide__number').textContent = data.number;
      slide.querySelector('.slide__img img').src = data.img;
      slideTitle.innerHTML = '';
      data.title.forEach((elm) => {
        const span = document.createElement('span');
        span.textContent = elm;
        slideTitle.appendChild(span);
      });
      slide.querySelector('.slide__text').textContent = data.text;

      fragment.appendChild(slide);

      const dot = document.createElement('span');
      dot.className = 'service-swiper__pagination-dot';
      if (index === 0) dot.classList.add('active');
      dot.dataset.index = index;
      dotsFragment.appendChild(dot);
    });

    containerSlides.innerHTML = '';
    containerSlides.appendChild(fragment);

    containerPagination.innerHTML = '';
    containerPagination.appendChild(dotsFragment);

    const dots = containerPagination.querySelectorAll(
      '.service-swiper__pagination-dot',
    );

    function updatePagination(activeIndex) {
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
      });
    }

    window.addEventListener('slidechange', (e) => {
      updatePagination(e.detail);
    });

    updatePagination(0);
  }
}

// Мобильный слайдер
function initMobileSwiper() {
  if (!mobileMode) return;

  loadSwiper().then(() => {
    const containerMob = document.querySelector('.swiper-mob__wrapper');

    if (mobileSwiperMain) {
      mobileSwiperMain.destroy(true, true);
      mobileSwiperMain = null;
    }
    if (mobileSwiperImg) {
      mobileSwiperImg.destroy(true, true);
      mobileSwiperImg = null;
    }

    containerMob.innerHTML = '';

    const templateMob = document.getElementById('slide-template-mob');
    const sliderSection = templateMob.content.cloneNode(true);
    containerMob.appendChild(sliderSection);

    const sliderMain = containerMob.querySelector(
      '.slider-main .slider-main__wrapper',
    );
    const sliderThumbs = containerMob.querySelector(
      '.slider-img .slider-img__wrapper',
    );
    const slideTemplateMain = templateMob.content.querySelector(
      '.slider-main__slide',
    );
    const slideTemplateImg =
      templateMob.content.querySelector('.slider-img__img');

    sliderMain.innerHTML = '';
    sliderThumbs.innerHTML = '';

    slidesData.forEach((data, index) => {
      // Основной слайд с контентом
      const mainSlide = slideTemplateMain.cloneNode(true);

      const titleNode = mainSlide.querySelector('.slider-main__title');
      titleNode.innerHTML = '';
      data.title.forEach((elm) => {
        const span = document.createElement('span');
        span.textContent = elm;
        titleNode.appendChild(span);
      });
      mainSlide.querySelector('.slider-main__text').textContent = data.text;
      mainSlide.classList.add(`slider-main__slide--${index + 1}`);
      mainSlide.id = `slide-${index + 1}`;

      sliderMain.appendChild(mainSlide);

      // Картинка
      const thumb = slideTemplateImg.cloneNode(true);
      const thumbImg = thumb.querySelector('img');
      // console.log(thumbImg)
      thumbImg.src = data.img;
      thumb.querySelector('.number-slide').textContent = data.number;
      sliderThumbs.appendChild(thumb);
    });

    // Инициализация свайпера миниатюр
    mobileSwiperImg = new Swiper('.slider-img', {
      slideClass: 'slider-img__img',
      wrapperClass: 'slider-img__wrapper',
      slidesPerView: 1,
      spaceBetween: 16,
      freeMode: true,
      allowTouchMove: false,
      watchSlidesProgress: true,
    });

    // Инициализация основного слайдера
    mobileSwiperMain = new Swiper('.slider-main', {
      slideClass: 'slider-main__slide',
      wrapperClass: 'slider-main__wrapper',
      spaceBetween: 4,
      slidesPerView: 'auto',
      loop: false,
      thumbs: {
        swiper: mobileSwiperImg,
      },
      breakpoints: {
        990: {
          spaceBetween: 16,
        },
      },
    });

    mobileSwiperMain.on('slideChangeTransitionEnd', function () {
      const slides = sliderMain.querySelectorAll('.slider-main__slide');

      slides.forEach((slide) => {
        const button = slide.querySelector('.slide__btn');
        if (slide.classList.contains('swiper-slide-active')) {
          button.style.opacity = '1';
        } else {
          button.style.opacity = '0';
        }
      });
    });

    if (mobileSwiperMain) {
      const activeSlide = sliderMain.querySelector('.swiper-slide-active');
      if (activeSlide) {
        const activeBtn = activeSlide.querySelector('.slide__btn');
        if (activeBtn) {
          activeBtn.style.opacity = '1';
        }
      }
    }
  });
}

function updateSliders() {
  if (mobileMode) {
    initMobileSwiper();
  } else {
    initServiceSwiper();
  }
}

window.addEventListener('resize', () => {
  mobileMode = isMobile();
  updateSliders();
});
// });

//  section faq переделала чере gsap, т.к.
// при одновремен. анимации ширины и высоты было дрожание на десктопе
const faqItems = document.querySelectorAll('.faq__item');
let isLayoutChanging = false;
let lastFooterState = null;

function safeCheckInnerScroll() {
  if (isLayoutChanging) return lastFooterState;
  return checkInnerScroll();
}

faqItems.forEach((item) => {
  const head = item.querySelector('.faq__item-head');
  const body = item.querySelector('.faq__item-body');
  const content = item.querySelector('.faq__wrapper-body');

  let isOpen = false;

  // стартовое состояние
  gsap.set(body, {height: 0, opacity: 0});

  head.addEventListener('click', () => {
    if (isLayoutChanging) return;
    isLayoutChanging = true;

    const tl = gsap.timeline({
      defaults: {
        ease: 'power2.out',
        duration: 0.6,
      },
      onComplete: () => {
        requestAnimationFrame(() => {
          footerVisible = checkInnerScroll();

          if (footerVisible) {
            hideMenu();
            updateUI();
          } else {
            showMenu();
            updateUI();
          }
        });

        isLayoutChanging = false;
      },
    });

    if (!isOpen) {
      tl
        // ширина
        .set(item, {maxWidth: '100%'})

        // измеряем ПРАВИЛЬНУЮ высоту
        .set(body, {
          height: () => content.scrollHeight,
        })

        // схлопываем обратно
        // .set(body, {height: 0, opacity: 0})

        // анимируем высоту
        .to(
          body,
          {height: () => content.scrollHeight, opacity: 1, duration: 0.3},
          '+=0.1',
        );

      item.classList.add('open');
      isOpen = true;
    } else {
      tl.set(
        body,
        {
          height: 0,
          opacity: 0,
        },
        0,
      ).to(
        item,
        {
          maxWidth: getCollapsedWidth(item),
        },
        0,
      );

      item.classList.remove('open');
      isOpen = false;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        footerVisible = safeCheckInnerScroll();
      });
    });
  });
});

function getCollapsedWidth(item) {
  if (!mobileMode) {
    if (item.classList.contains('a1')) return 480 + 'px';
    if (item.classList.contains('a2')) return 450 + 'px';
    if (item.classList.contains('a3')) return 405 + 'px';
    if (item.classList.contains('a4')) return 390 + 'px';
    if (item.classList.contains('a5')) return 370 + 'px';
    if (item.classList.contains('a6')) return 425 + 'px';
    if (item.classList.contains('a7')) return 430 + 'px';
    if (item.classList.contains('a8')) return 460 + 'px';
    if (item.classList.contains('a9')) return 315 + 'px';
  }

  return '100%';
}

// анимация с молниями и статуей
const scene = document.querySelector('.lightning-scene');

let currentLightning = 0;
let lightningInterval = null;
const lightnings = ['lightning-center-active', 'lightning-right-active'];

function lightningStrike(typeClass) {
  // основной удар
  scene.classList.add(typeClass);

  // микро-мерцание
  setTimeout(() => {
    scene.classList.remove(typeClass);
  }, 150);

  setTimeout(() => {
    scene.classList.add(typeClass);
  }, 300);

  // затухание
  setTimeout(() => {
    scene.classList.remove(typeClass);
  }, 500);
}

// динамическое title на первом моб экране
const mqSmall = window.matchMedia('(max-width: 600px)');
const mqMedium = window.matchMedia('(max-width: 1030px)');
let roRaf = null;

function getTitleCorrection() {
  if (mqSmall.matches) return 110;
  if (mqMedium.matches) return 96;
  return 0;
}

function fitHeroTitle() {
  const content = document.querySelector('.hero__content');
  const title = document.querySelector('.hero__title');

  if (!content || !title) return;

  // все элементы кроме заголовка
  const siblings = [...content.children].filter((el) => el !== title);

  // сколько высоты занято НЕ заголовком
  const occupiedHeight = siblings.reduce((sum, el) => sum + el.offsetHeight, 0);

  // на айфоне не правильно вычисляет свободное пространство, костыль для него
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const HERO_UI_OFFSET = 76;

  let contentHeight;
  // console.log(isIOS);
  if (isIOS && window.visualViewport) {
    contentHeight = window.visualViewport.height - HERO_UI_OFFSET;
  } else {
    contentHeight = content.clientHeight;
  }

  // padding-top у заголовка
  const titleStyles = getComputedStyle(title);
  const paddingTop = parseFloat(titleStyles.paddingTop) || 154;

  const availableHeight = contentHeight - occupiedHeight - paddingTop;

  if (availableHeight <= 0) return;

  // бинарный поиск размера шрифта
  let min = 24;
  let max = 160;
  let best = min;

  while (min <= max) {
    const mid = Math.floor((min + max) / 2);
    title.style.fontSize = `${mid}px`;
    title.offsetHeight;

    const correction = getTitleCorrection();
    const titleSize = title.scrollHeight - correction;

    if (titleSize <= availableHeight) {
      best = mid;
      min = mid + 1;
    } else {
      max = mid - 1;
    }

    // console.log(titleSize);
    // console.log(best);
  }

  if (isIOS && window.visualViewport) {
    title.style.fontSize = `${best * 0.63}px`;
  } else {
    title.style.fontSize = `${best}px`;
  }
}

if (mobileMode) {
  const ro = new ResizeObserver(() => {
    fitHeroTitle();
  });

  ro.observe(document.documentElement);
  window.addEventListener('orientationchange', fitHeroTitle);
  window.addEventListener('load', fitHeroTitle);
}

// изменение viewBox у svg в секции 2 (с цифрами) на айфоне
const svgViewbox = document.querySelectorAll('.svg-text');

const mobileMQ = window.matchMedia('(max-width: 415px)');
function updateViewBox() {
  if (mobileMQ.matches) {
    svgViewbox.forEach((svg) => {
      svg.setAttribute('viewBox', '0 0 1000 380');
    });
  } else {
    svgViewbox.forEach((svg) => {
      svg.setAttribute('viewBox', '0 0 1000 440');
    });
  }
}

updateViewBox();
mobileMQ.addEventListener('change', updateViewBox);
