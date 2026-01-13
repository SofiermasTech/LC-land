// scroll-up
const btnUp = document.querySelector('.btn-scroll--second');

if (btnUp) {
  window.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (scrollTop + clientHeight >= scrollHeight - clientHeight) {
      btnUp.classList.add('show');
    } else {
      btnUp.classList.remove('show');
    }
  });

  btnUp.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}
