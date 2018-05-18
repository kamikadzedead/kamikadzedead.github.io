window.dataLayer = window.dataLayer || [];

function gtag() {
  dataLayer.push(arguments);
}

gtag('js', new Date());

gtag('config', 'UA-58031952-13');

document.addEventListener('DOMContentLoaded', function () {
  if ('kamikadzedead.github.io' !== location.hostname) {
    document.querySelector('.container').remove()
  }
})
