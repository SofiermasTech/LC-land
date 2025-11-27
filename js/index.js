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

console.log(window.innerWidth, window.innerHeight)