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

  function reinitFancyText() {
    const fancyTextElements = document.querySelectorAll(
      "[data-fancy-text]:not([data-fancy-text-initialized='true'])"
    );

    fancyTextElements.forEach(function (el) {
      try {
        const options = el.getAttribute("data-fancy-text");
        if (!options) {
          return;
        }

        const parsedOptions = JSON.parse(options);
        const content = Array.isArray(parsedOptions.string)
          ? parsedOptions.string.filter(Boolean)
          : [];

        if (!content.length) {
          return;
        }

        el.setAttribute("data-fancy-text-initialized", "true");
        el.style.display = "inline-block";
        el.style.transformOrigin = "50% 50%";
        el.textContent = content[0];

        if (
          parsedOptions.effect !== "rotate" ||
          content.length <= 1 ||
          typeof window.anime === "undefined"
        ) {
          return;
        }

        let activeIndex = 0;

        const runRotation = function () {
          const nextIndex = (activeIndex + 1) % content.length;

          const timeline = window.anime.timeline({
            complete: function () {
              activeIndex = nextIndex;
              window.setTimeout(runRotation, 1400);
            },
          });

          timeline
            .add({
              targets: el,
              opacity: [1, 0],
              rotateX: [0, 70],
              duration: 260,
              easing: "easeInQuad",
            })
            .add({
              targets: el,
              begin: function () {
                el.textContent = content[nextIndex];
              },
              opacity: [0, 1],
              rotateX: [-70, 0],
              duration: 360,
              easing: "easeOutQuad",
            });
        };

        window.setTimeout(runRotation, 1400);
      } catch (err) {
        console.error("Error initializing fancy text:", err);
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
      reinitFancyText();
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
