document.addEventListener('DOMContentLoaded', () => {
  // render slide
  const template = document.getElementById('slide-template');
  const containerSlides = document.querySelector('.swiper__wrapper');
  const containerPagination = document.querySelector('.swiper__pagination');

  if (!template || !containerSlides) return;

  const fragment = document.createDocumentFragment();
  const dotsFragment = document.createDocumentFragment();

  slidesData.forEach((data, index) => {
    const slide = template.content.cloneNode(true);
    const slideItem = slide.querySelector('.swiper__slide');
    const slideTitle = slide.querySelector('.slide__title');

    slideItem.classList.add(`slide--${index + 1}`);
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
    dot.className = 'swiper__pagination-dot';
    if (index === 0) dot.classList.add('active');
    dot.dataset.index = index;
    dotsFragment.appendChild(dot);
  });

  containerSlides.innerHTML = '';
  containerSlides.appendChild(fragment);

  containerPagination.innerHTML = '';
  containerPagination.appendChild(dotsFragment);

  const dots = containerPagination.querySelectorAll('.swiper__pagination-dot');

  function updatePagination(activeIndex) {
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
    });
  }

  window.addEventListener('slidechange', (e) => {
    updatePagination(e.detail);
  });

  updatePagination(0);
});

//  section faq
const faqItems = document.querySelector('.faq__questions');
const faqHead = document.querySelectorAll('.faq__item-head');

faqItems.addEventListener('click', (event) => {
  console.log(event);
  console.log(event.target);
  console.log(event.currentTarget);
  const item = event.target.closest('.faq__item');
  if (!item) return;

  item.classList.toggle('open');
});

// faqHead.forEach((item) => {
//   addEventListener('click', () => {
//     item.classList.toggle('open');
//   });
// });

console.log(window.innerWidth, window.innerHeight);
