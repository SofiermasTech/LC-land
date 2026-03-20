const mobileSize = '(max-width: 1050px)';
function isMobile() {
  return window.matchMedia(mobileSize).matches;
}

let mobileMode = isMobile();
// console.log(mobileMode);

mobileMode = isMobile();

let currentLang = initialLang;
let translations = {};
let slidesToUse = [];
const pp = document.querySelectorAll('.footer-pp a');

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

  translateMeta(lang);
  translateImg(lang);
  translateHref(lang);
}

function translateMeta(lang) {
  const t = translations[lang] || translations.ru;

  document.title = t['meta.title'] || document.title;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && t['meta.description']) {
    metaDesc.setAttribute('content', t['meta.description']);
  }

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && t['meta.og_title']) {
    ogTitle.setAttribute('content', t['meta.og_title']);
  }

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && t['meta.og_description']) {
    ogDesc.setAttribute('content', t['meta.og_description']);
  }

  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) {
    ogLocale.setAttribute('content', t['html.locale']);
  }
}

function translateImg(lang) {
  document.querySelectorAll('[data-translate-img]').forEach((element) => {
    const key = element.getAttribute('data-translate-img');
    if (translations[lang] && translations[lang][key]) {
      element.setAttribute('src', translations[lang][key]);
    }
  });
}

function translateHref(lang) {
  console.log(pp);
  pp.forEach((item) => {
    const key = item.getAttribute('data-translate-href');
    console.log(item);
    console.log(key);
    if (translations[lang] && translations[lang][key]) {
      item.setAttribute('href', translations[lang][key]);
    }
  });
}

function getBrowserLanguage() {
  const lang = navigator.language || navigator.userLanguage;
  return lang.substring(0, 2).toLowerCase();
}

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
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
