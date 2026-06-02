(function () {
  "use strict";

  let reinitTimeout = null;

  function reinitSwiper() {
    if (typeof window.Swiper === "undefined") {
      return;
    }

    const swipers = document.querySelectorAll(".swiper:not(.swiper-initialized)");

    swipers.forEach(function (el) {
      try {
        if (el.swiper) {
          return;
        }

        const options = el.getAttribute("data-slider-options");
        if (!options) {
          return;
        }

        const parsedOptions = JSON.parse(options);
        new window.Swiper(el, parsedOptions);
      } catch (err) {
        console.error("Error initializing Swiper:", err);
      }
    });
  }

  function reinitAnimations() {
    if (typeof window.anime === "undefined") {
      return;
    }

    const animeElements = document.querySelectorAll("[data-anime]:not(.anime-complete)");

    animeElements.forEach(function (el) {
      try {
        const options = el.getAttribute("data-anime");
        if (!options) {
          return;
        }

        const parsedOptions = JSON.parse(options);
        el.classList.add("appear");

        const animation = window.anime.timeline();
        animation.add({
          targets: el,
          ...parsedOptions,
          complete: function () {
            el.classList.add("anime-complete");
          },
        });
      } catch (err) {
        console.error("Error initializing animation:", err);
      }
    });
  }

  function triggerResizeEvent() {
    window.dispatchEvent(new Event("resize"));
  }

  window.templateBridge = {
    reinitAll: function () {
      reinitSwiper();
      reinitAnimations();
      triggerResizeEvent();
    },
  };

  window.initializeComponents = function () {
    if (reinitTimeout) {
      clearTimeout(reinitTimeout);
    }

    reinitTimeout = window.setTimeout(function () {
      window.templateBridge.reinitAll();
    }, 180);
  };

  window.addEventListener("router-navigation-end", function () {
    window.initializeComponents();
  });

  window.addEventListener("template-reinit", function () {
    window.initializeComponents();
  });
})();
