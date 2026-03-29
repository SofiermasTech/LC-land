(function setInitialLang() {
  const preferred =
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    'ru';

  // console.log(preferred);
  lang = preferred.split('-')[0]; // 'es-ES' → 'es', 'ru-RU' → 'ru'
  // console.log(lang);
  const supported = ['ru', 'en', 'es', 'hi'];
  if (!supported.includes(lang)) {
    lang = 'ru';
  }
  // console.log(lang);
  // console.log(document.documentElement.lang);
  document.documentElement.lang = lang;
  window.initialLang = lang;
})();
