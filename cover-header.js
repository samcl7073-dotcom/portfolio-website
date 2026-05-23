(function() {
  'use strict';

  var header = document.querySelector('.site-header');

  function getHeaderHeight() {
    return header ? header.offsetHeight : 56;
  }

  function initCoverHeader(coverEl) {
    if (!coverEl || coverEl._coverInit) return;
    coverEl._coverInit = true;

    var minHeight = getHeaderHeight();
    var vh = window.innerHeight;
    var scrollDistance = vh * 0.9;

    coverEl.style.position = 'fixed';
    coverEl.style.top = '0';
    coverEl.style.left = '0';
    coverEl.style.width = '100%';
    coverEl.style.zIndex = '10';
    coverEl.style.overflow = 'hidden';
    coverEl.style.height = vh + 'px';

    if (coverEl.classList.contains('project-hero-banner')) {
      coverEl.classList.add('as-cover');
    }

    var spacer = document.createElement('div');
    spacer.className = 'cover-spacer';
    spacer.style.height = vh + 'px';
    coverEl.parentNode.insertBefore(spacer, coverEl.nextSibling);

    if (header) {
      header.classList.add('header-over-cover');
    }

    var contentOverlay = coverEl.querySelector('.carousel-title-overlay') ||
                         coverEl.querySelector('.hero-content-overlay') ||
                         coverEl.querySelector('.cover-card-content') ||
                         coverEl.querySelector('.about-cover-inner');
    var arrows = coverEl.querySelectorAll('.carousel-arrow');
    var counter = coverEl.querySelector('.carousel-counter');
    var gradientOverlay = coverEl.querySelector('.carousel-overlay');

    var ticking = false;

    function update() {
      ticking = false;
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      var progress = Math.min(Math.max(scrollY / scrollDistance, 0), 1);

      var height = vh - (vh - minHeight) * progress;
      coverEl.style.height = height + 'px';

      var imgs = coverEl.getElementsByTagName('img');
      for (var i = 0; i < imgs.length; i++) {
        imgs[i].style.objectPosition = '50% ' + (progress * 40) + '%';
      }

      if (contentOverlay) {
        var fade = Math.max(1 - progress * 2.5, 0);
        contentOverlay.style.opacity = fade;
        contentOverlay.style.transform = 'translateY(' + (-progress * 50) + 'px)';
        contentOverlay.style.visibility = fade < 0.1 ? 'hidden' : '';
        contentOverlay.style.pointerEvents = fade < 0.1 ? 'none' : '';
      }

      for (var j = 0; j < arrows.length; j++) {
        arrows[j].style.visibility = progress > 0.5 ? 'hidden' : '';
      }
      if (counter) {
        counter.style.visibility = progress > 0.5 ? 'hidden' : '';
      }

      if (gradientOverlay) {
        gradientOverlay.style.opacity = Math.max(1 - progress * 1.5, 0.2);
      }

      if (header) {
        if (progress > 0.3) {
          header.classList.remove('header-over-cover');
        } else {
          header.classList.add('header-over-cover');
        }
      }
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    window.addEventListener('resize', function() {
      vh = window.innerHeight;
      scrollDistance = vh * 0.9;
      minHeight = getHeaderHeight();
      spacer.style.height = vh + 'px';
      update();
    });

    update();
  }

  window.initCoverHeader = initCoverHeader;

  document.addEventListener('DOMContentLoaded', function() {
    var cover = document.querySelector('.hero-carousel-section') ||
                document.querySelector('.cover-card');
    if (cover) {
      initCoverHeader(cover);
    }
  });
})();
