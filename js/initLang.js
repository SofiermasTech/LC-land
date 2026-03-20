(function setInitialLang() {
  const preferred = navigator.languages?.[0] || navigator.language || 'ru';
  lang = preferred.split('-')[0]; // 'es-ES' → 'es', 'ru-RU' → 'ru'

  const supported = ['ru', 'en', 'es', 'pt'];
  if (!supported.includes(lang)) {
    lang = 'ru';
  }
  console.log(lang);
  console.log(document.documentElement.lang);
  document.documentElement.lang = lang;
  window.initialLang = lang;
})();
