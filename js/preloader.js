function loadbar() {
  const progressPercentage = document.querySelector('.percentage__number');
  const loader = document.querySelector('.loader');
  const documentElements = [...document.images];
  const documentLoaderLine = document.querySelector('.progress-bar__line');
  let totalImageLength = documentElements.length;
  let percentage = 0;

  if (totalImageLength == 0) return doneLoading();

  const MIN_SHOW_TIME = 1600;
  const startTime = Date.now();
  // console.log('start load');

  function imgLoaded() {
    percentage += 1;
    var perc = ((100 / totalImageLength) * percentage) << 0;
    documentLoaderLine.style.width = perc + '%';
    progressPercentage.innerHTML = perc;

    if (percentage === totalImageLength) return doneLoading();
  }

  function doneLoading() {
    const elapsed = Date.now() - startTime;
    const remaining = MIN_SHOW_TIME - elapsed;

    setTimeout(
      () => {
        // console.log('finish load');
        loader.classList.add('hidden');
        animationOnStart();
        startLightning();
        setTimeout(function () {
          loader.style.display = 'none';
        }, 1200);
      },
      Math.max(0, remaining),
    );
  }

  documentElements.forEach((e, i) => {
    const tImg = new Image();
    tImg.onload = imgLoaded;
    tImg.onerror = imgLoaded;
    tImg.src = documentElements[i].src;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  currentIndex = 0;
  loadbar();

  // для айфона, т.к. у него особые условия 2го слайда
  // const isIOS =
  //   /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  //   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // if (isIOS) {
  updateSectionsUI(0);
  // }

  // это для всех
  // animationOnStart();
  // startLightning();
  updateScrollLock();
  updateUI();
  updateClassMenu();
});
