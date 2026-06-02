(function () {
  "use strict";

  var ANIME_BREAKPOINT = 767;
  var reinitTimeout = null;
  var fancyTextTimers = new WeakMap();
  var parallaxElements = [];
  var parallaxTicking = false;

  function parseJsonAttribute(value) {
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      console.error("Error parsing template option:", error);
      return null;
    }
  }

  function getWindowWidth() {
    return window.innerWidth || document.documentElement.clientWidth || 0;
  }

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function runCallback(callback, context) {
    if (typeof callback === "function") {
      callback.call(context, context);
    }
  }

  function chainSwiperHook(existingHook, injectedHook) {
    return function () {
      runCallback(existingHook, this);
      injectedHook.call(this);
    };
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function normalizeTextContent(element) {
    return (element.textContent || "").replace(/\s+/g, " ").trim();
  }

  function cacheOriginalAnimationMarkup(element) {
    if (!element.dataset.animeOriginalHtml) {
      element.dataset.animeOriginalHtml = element.innerHTML;
    }
  }

  function restoreOriginalAnimationMarkup(element) {
    if (element.dataset.animeOriginalHtml) {
      element.innerHTML = element.dataset.animeOriginalHtml;
    }
  }

  function buildLineMarkup(element) {
    if (typeof window.Splitting === "function") {
      try {
        var lines = window.Splitting({ target: element, by: "lines" });
        if (lines && lines[0] && Array.isArray(lines[0].lines) && lines[0].lines.length) {
          var renderedLines = lines[0].lines.map(function (line) {
            return line.map(function (item) {
              return item.innerHTML;
            }).join(" ");
          });

          element.innerHTML = renderedLines
            .map(function (line) {
              return '<span class="d-inline-flex">' + line + "</span>";
            })
            .join(" ");
          return;
        }
      } catch (error) {
        console.error("Error splitting animation lines:", error);
      }
    }

    var safeText = escapeHtml(normalizeTextContent(element));
    element.innerHTML = safeText
      ? '<span class="d-inline-flex">' + safeText + "</span>"
      : "";
  }

  function buildWordMarkup(element) {
    var words = normalizeTextContent(element)
      .split(" ")
      .filter(Boolean)
      .map(function (word) {
        return '<span class="d-inline-flex">' + escapeHtml(word) + "</span>";
      });

    element.innerHTML = words.join(" ");
  }

  function resolveAnimationTargets(element, options) {
    var targets = element;

    if (options.el === "childs") {
      targets = Array.prototype.slice.call(element.children);
    }

    if (options.el === "lines") {
      buildLineMarkup(element);
      targets = Array.prototype.slice.call(element.children);
    }

    if (options.el === "words") {
      buildWordMarkup(element);
      targets = Array.prototype.slice.call(element.children);
    }

    return Array.isArray(targets) ? targets : [targets];
  }

  function applyTransitionStyles(targets, options) {
    targets.forEach(function (target) {
      target.style.transition = "none";
      if (options.willchange) {
        target.style.willChange = "transform";
      }
    });
  }

  function cleanupAnimationState(element, options) {
    if (options.el) {
      element.classList.add("anime-child");
      Array.prototype.slice.call(element.children).forEach(function (child) {
        child.style.removeProperty("opacity");
        child.style.removeProperty("transform");
        child.style.removeProperty("transition");

        if (options.el === "lines") {
          child.classList.remove("d-inline-flex");
          child.classList.add("d-inline");
          child.style.willChange = "inherit";
        }
      });
    } else {
      element.style.removeProperty("opacity");
      element.style.removeProperty("transform");
      element.style.removeProperty("transition");
    }

    element.classList.add("anime-complete");
  }

  function animateElement(element, force) {
    if (typeof window.anime === "undefined") {
      return;
    }

    if (getWindowWidth() <= ANIME_BREAKPOINT) {
      return;
    }

    if (!force && element.classList.contains("anime-complete")) {
      return;
    }

    var options = parseJsonAttribute(element.getAttribute("data-anime"));
    if (!options) {
      return;
    }

    cacheOriginalAnimationMarkup(element);
    restoreOriginalAnimationMarkup(element);

    var targets = resolveAnimationTargets(element, options);
    var staggerValue = options.staggervalue || 0;
    var initialDelay = options.delay || 0;
    var animationConfig = Object.assign({}, options);

    delete animationConfig.el;
    delete animationConfig.staggervalue;
    delete animationConfig.perspective;
    delete animationConfig.willchange;

    element.classList.add("appear");
    element.classList.remove("anime-complete");

    if (options.perspective) {
      element.style.perspective = String(options.perspective) + "px";
    }

    if (options.willchange) {
      element.style.willChange = options.willchange;
    }

    applyTransitionStyles(targets, options);

    window.anime({
      targets: targets,
      delay: window.anime.stagger(staggerValue, { start: initialDelay }),
      complete: function () {
        cleanupAnimationState(element, options);
      },
      ...animationConfig,
    });
  }

  function clearFancyTextTimer(element) {
    var timerId = fancyTextTimers.get(element);
    if (timerId) {
      window.clearTimeout(timerId);
      fancyTextTimers.delete(element);
    }
  }

  function scheduleFancyText(element, callback, delay) {
    clearFancyTextTimer(element);
    var timerId = window.setTimeout(callback, delay);
    fancyTextTimers.set(element, timerId);
  }

  function animateFancyText(element, force) {
    var options = parseJsonAttribute(element.getAttribute("data-fancy-text"));
    if (!options) {
      return;
    }

    var content = Array.isArray(options.string) ? options.string.filter(Boolean) : [];
    if (!content.length) {
      return;
    }

    if (!force && element.getAttribute("data-fancy-text-initialized") === "true") {
      return;
    }

    clearFancyTextTimer(element);

    element.setAttribute("data-fancy-text-initialized", "true");
    element.style.display = "inline-block";
    element.style.transformOrigin = "50% 50%";
    element.textContent = content[0];

    if (
      options.effect !== "rotate" ||
      content.length <= 1 ||
      typeof window.anime === "undefined" ||
      getWindowWidth() <= ANIME_BREAKPOINT
    ) {
      return;
    }

    var activeIndex = 0;

    var runRotation = function () {
      var nextIndex = (activeIndex + 1) % content.length;

      window.anime
        .timeline({
          complete: function () {
            activeIndex = nextIndex;
            scheduleFancyText(element, runRotation, 1400);
          },
        })
        .add({
          targets: element,
          opacity: [1, 0],
          rotateX: [0, 70],
          duration: 260,
          easing: "easeInQuad",
        })
        .add({
          targets: element,
          begin: function () {
            element.textContent = content[nextIndex];
          },
          opacity: [0, 1],
          rotateX: [-70, 0],
          duration: 360,
          easing: "easeOutQuad",
        });
    };

    scheduleFancyText(element, runRotation, 1400);
  }

  function animateSlideContext(swiperInstance) {
    if (!swiperInstance || !swiperInstance.slides || !swiperInstance.slides.length) {
      return;
    }

    var activeIndex = typeof swiperInstance.activeIndex === "number" ? swiperInstance.activeIndex : 0;
    var currentSlide = swiperInstance.slides[activeIndex];

    if (!currentSlide) {
      return;
    }

    currentSlide.querySelectorAll("[data-fancy-text]").forEach(function (element) {
      element.setAttribute("data-fancy-text-initialized", "false");
      animateFancyText(element, true);
    });

    currentSlide.querySelectorAll("[data-anime]").forEach(function (element) {
      animateElement(element, true);
    });
  }

  function buildSwiperOptions(element) {
    var parsedOptions = parseJsonAttribute(element.getAttribute("data-slider-options"));
    if (!parsedOptions) {
      return null;
    }

    var options = Object.assign({}, parsedOptions);
    options.on = Object.assign({}, parsedOptions.on || {});

    if (
      element.getAttribute("data-number-pagination") === "1" &&
      options.pagination
    ) {
      options.pagination = Object.assign({}, options.pagination, {
        renderBullet: function (index, className) {
          return '<span class="' + className + '">' + pad(index + 1) + "</span>";
        },
      });
    }

    options.on.init = chainSwiperHook(options.on.init, function () {
      animateSlideContext(this);
    });

    options.on.slideChange = chainSwiperHook(options.on.slideChange, function () {
      animateSlideContext(this);
    });

    return options;
  }

  function reinitSwiper() {
    if (typeof window.Swiper === "undefined") {
      return;
    }

    document.querySelectorAll(".swiper").forEach(function (element) {
      try {
        if (element.swiper) {
          return;
        }

        var options = buildSwiperOptions(element);
        if (!options) {
          return;
        }

        new window.Swiper(element, options);
      } catch (error) {
        console.error("Error initializing Swiper:", error);
      }
    });
  }

  function reinitAnimations() {
    document.querySelectorAll("[data-anime]").forEach(function (element) {
      animateElement(element, false);
    });
  }

  function reinitFancyText() {
    document.querySelectorAll("[data-fancy-text]").forEach(function (element) {
      animateFancyText(element, false);
    });
  }

  function parseTranslateYValue(value) {
    if (!value) {
      return null;
    }

    var match = value.match(/translateY\((-?\d+(?:\.\d+)?)px\)/i);
    return match ? Number(match[1]) : null;
  }

  function registerParallaxElements() {
    parallaxElements = [];

    document.querySelectorAll("[data-bottom-top][data-top-bottom]").forEach(function (element) {
      parallaxElements.push({
        type: "translateY",
        element: element,
        from: parseTranslateYValue(element.getAttribute("data-bottom-top")),
        to: parseTranslateYValue(element.getAttribute("data-top-bottom")),
      });
    });

    document.querySelectorAll("[data-parallax-background-ratio]").forEach(function (element) {
      parallaxElements.push({
        type: "background",
        element: element,
        ratio: Number(element.getAttribute("data-parallax-background-ratio") || 0.5),
      });
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function updateParallax() {
    parallaxTicking = false;

    if (!parallaxElements.length) {
      return;
    }

    var viewportHeight = window.innerHeight || 0;

    parallaxElements.forEach(function (item) {
      var rect = item.element.getBoundingClientRect();
      var progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);

      if (item.type === "translateY") {
        var start = typeof item.from === "number" ? item.from : 0;
        var end = typeof item.to === "number" ? item.to : 0;
        var current = start + (end - start) * progress;
        item.element.style.transform = "translateY(" + current.toFixed(2) + "px)";
      }

      if (item.type === "background") {
        var ratio = Number.isFinite(item.ratio) ? item.ratio : 0.5;
        var offset = (rect.top + window.scrollY) * ratio;
        item.element.style.backgroundPosition = "50% " + (-offset).toFixed(2) + "px";
      }
    });
  }

  function requestParallaxUpdate() {
    if (parallaxTicking) {
      return;
    }

    parallaxTicking = true;
    window.requestAnimationFrame(updateParallax);
  }

  function reinitParallax() {
    registerParallaxElements();
    requestParallaxUpdate();
  }

  function triggerResizeEvent() {
    window.dispatchEvent(new Event("resize"));
  }

  window.templateBridge = {
    reinitAll: function () {
      reinitSwiper();
      reinitAnimations();
      reinitFancyText();
      reinitParallax();
      triggerResizeEvent();
    },
  };

  window.initializeComponents = function () {
    if (reinitTimeout) {
      window.clearTimeout(reinitTimeout);
    }

    reinitTimeout = window.setTimeout(function () {
      window.templateBridge.reinitAll();
    }, 120);
  };

  window.addEventListener("router-navigation-end", function () {
    window.initializeComponents();
  });

  window.addEventListener("template-reinit", function () {
    window.initializeComponents();
  });

  window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
  window.addEventListener("resize", requestParallaxUpdate, { passive: true });
  window.addEventListener("load", function () {
    window.initializeComponents();
  });
})();
