function loadbar() {
  const progressPercentage = document.querySelector('.percentage__number');
  const loader = document.querySelector('.loader');
  const documentElements = [...document.images];
  const documentLoaderLine = document.querySelector('.progress-bar__line');
  let totalImageLength = documentElements.length;
  let percentage = 0;

  if (totalImageLength == 0) return doneLoading();

  const MIN_SHOW_TIME = 1200;
  const startTime = Date.now();
  console.log(documentElements);

  function imgLoaded() {
    percentage += 1;
    var perc = (((100 / totalImageLength) * percentage) << 0);
    documentLoaderLine.style.maxWidth = perc;
    progressPercentage.innerHTML = perc;
    if (percentage === totalImageLength) return doneLoading();
  }

  function doneLoading() {
    const elapsed = Date.now() - startTime;
    const remaining = MIN_SHOW_TIME - elapsed;

    setTimeout(
      () => {
        loader.style.opacity = 0;

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
document.addEventListener('DOMContentLoaded', loadbar, false);
