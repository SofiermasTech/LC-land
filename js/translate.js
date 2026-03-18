const mobileSize = '(max-width: 1050px)';
function isMobile() {
  return window.matchMedia(mobileSize).matches;
}

let mobileMode = isMobile();
// console.log(mobileMode);

mobileMode = isMobile();

let currentLang = 'ru';
let translations = {};
let slidesToUse = [];
// const pp = document.querySelector('.footer__pp');

async function loadTranslations() {
  try {
    const response = await fetch('../locales/translations.json');
    translations = await response.json();

    initServiceSwiper();
    if (mobileMode) initMobileSwiper();
  } catch (error) {
    console.error('Ошибка загрузки переводов:', error);
  }
}

function getTranslatedSlide(slide) {
  const t = translations[currentLang] || translations['ru'] || {};
  console.log(t);
  let titleArray = t[slide.title];
  console.log(slidesData);

  console.log(titleArray);
  if (!Array.isArray(titleArray)) {
    titleArray = String(titleArray || '')
      .split(' ')
      .filter(Boolean);
  }
  // console.log(t[slide.text], slide.text);
  return {
    number: slide.number,
    title: titleArray,
    text: t[slide.text] || slide.text || '—',
    img: slide.img,
    btn: t[slide.btn],
  };
}

function getAllSlidesForCurrentLang() {
  if (!window.slidesData) {
    console.warn('slidesData ещё не загружены');
    return [];
  }
  console.log(window.slidesData);
  return window.slidesData.map(getTranslatedSlide);
}

function getNextButtonText(index) {
  const key = `next-btn-${index}`;
  const t = translations[currentLang] || translations.ru || {};
  return t[key] || ` `;
}

function translatePage(lang) {
  document.querySelectorAll('[data-translate]').forEach((element) => {
    const key = element.getAttribute('data-translate');
    if (translations[lang] && translations[lang][key]) {
      element.textContent = translations[lang][key];
    }
  });

  // updateSliders();
  translateImg(lang);
  // translateHref(lang);
}

function translateImg(lang) {
  document.querySelectorAll('[data-translate-img]').forEach((element) => {
    const key = element.getAttribute('data-translate-img');
    if (translations[lang] && translations[lang][key]) {
      element.setAttribute('src', translations[lang][key]);
    }
  });
}

// function translateHref(lang) {
//   const key = pp.getAttribute('data-translate-href');
//   if (translations[lang] && translations[lang][key]) {
//     pp.setAttribute('href', translations[lang][key]);
//   }
// }

function getBrowserLanguage() {
  const lang = navigator.language || navigator.userLanguage;
  return lang.substring(0, 2).toLowerCase();
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  translatePage(lang);
  updateSliders();

  document.querySelector('.current-lang span').textContent =
    lang.charAt(0).toUpperCase() + lang.slice(1);
}

async function init() {
  await loadTranslations();

  const savedLang = localStorage.getItem('language');
  const browserLang = getBrowserLanguage();

  const lang = savedLang || (translations[browserLang] ? browserLang : 'ru');
  setLanguage(lang);
  updateUI();

  document.querySelectorAll('.lang').forEach((langBtn) => {
    if (langBtn.getAttribute('data-lang') === lang) {
      langBtn.classList.add('active');
    }
  });
}
