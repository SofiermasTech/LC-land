document.addEventListener('DOMContentLoaded', () => {
  let mobileSwiperMain = null;
  let mobileSwiperImg = null;

  const isMobile = () => window.innerWidth <= 1050;
  let mobileMode = isMobile();
  console.log(mobileMode);

  mobileMode = isMobile();
  updateSliders();

  // render slide
  function initServiceSwiper() {
    if (!mobileMode) {
      const template = document.getElementById('slide-template');
      const containerSlides = document.querySelector(
        '.service-swiper__wrapper'
      );
      const containerPagination = document.querySelector(
        '.service-swiper__pagination'
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
        '.service-swiper__pagination-dot'
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
    // if (mobileMode) {
    if (!mobileMode) return;
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
      '.slider-main .slider-main__wrapper'
    );
    const sliderThumbs = containerMob.querySelector(
      '.slider-img .slider-img__wrapper'
    );
    const slideTemplateMain = templateMob.content.querySelector(
      '.slider-main__slide'
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
});

//  section faq
const faqItems = document.querySelector('.faq__questions');
const faqHead = document.querySelectorAll('.faq__item-head');

faqItems.addEventListener('click', (event) => {
  // console.log(event);
  // console.log(event.target);
  // console.log(event.currentTarget);
  const item = event.target.closest('.faq__item');
  if (!item) return;

  item.classList.toggle('open');
});

// console.log(window.innerWidth, window.innerHeight);
