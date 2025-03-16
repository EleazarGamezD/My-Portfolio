(function ($) {
  "use strict";

  // Objeto global para almacenar nuestras funciones de reinicialización
  window.templateBridge = {
    // Función principal que se llamará en cada cambio de ruta
    reinitAll: function() {
      console.log("🔄 Reinicializando componentes de plantilla...");
      this.reinitSwiper();
      this.reinitAnimations();
      this.triggerResizeEvent();
      console.log("✅ Componentes reinicializados correctamente");
    },

    // Reinicializa todos los sliders Swiper
    reinitSwiper: function() {
      if (typeof window.Swiper === 'undefined') {
        console.warn("⚠️ Swiper no está cargado");
        return;
      }

      // Buscar todos los sliders Swiper
      const swipers = document.querySelectorAll('.swiper:not(.swiper-initialized)');
      console.log(`🔍 Encontrados ${swipers.length} sliders Swiper para inicializar`);

      swipers.forEach(function(el, index) {
        try {
          // Destruir instancia anterior si existe
          if (el.swiper && typeof el.swiper.destroy === 'function') {
            el.swiper.destroy(true, true);
          }

          // Inicializar con opciones
          const options = el.getAttribute('data-slider-options');
          if (options) {
            const parsedOptions = JSON.parse(options);
            new Swiper(el, parsedOptions);
            console.log(`✅ Swiper #${index} inicializado`);
          }
        } catch (err) {
          console.error(`❌ Error inicializando Swiper #${index}:`, err);
        }
      });
    },

    // Reinicializa todas las animaciones
    reinitAnimations: function() {
      if (typeof window.anime === 'undefined') {
        console.warn("⚠️ Anime.js no está cargado");
        return;
      }

      // Procesar elementos con atributo data-anime
      const animeElements = document.querySelectorAll('[data-anime]:not(.anime-complete)');
      console.log(`🔍 Encontrados ${animeElements.length} elementos con animaciones`);

      animeElements.forEach(function(el, index) {
        try {
          const options = el.getAttribute('data-anime');
          if (options) {
            const parsedOptions = JSON.parse(options);
            el.classList.add('appear');

            // Crear la animación
            const anime_animation = window.anime.timeline();
            anime_animation.add({
              targets: el,
              ...parsedOptions,
              complete: function() {
                el.classList.add('anime-complete');
              }
            });
          }
        } catch (err) {
          console.error(`❌ Error inicializando animación #${index}:`, err);
        }
      });
    },

    // Dispara evento resize para ajustar componentes
    triggerResizeEvent: function() {
      window.dispatchEvent(new Event('resize'));
    }
  };

  // Ejecutar inicialización cuando el DOM esté listo
  $(document).ready(function() {
    // Esperar un poco para asegurar que todos los elementos están en el DOM
    setTimeout(function() {
      window.templateBridge.reinitAll();
    }, 300);
  });

  // Escuchar cambios de ruta en Angular
  window.addEventListener('router-navigation-end', function() {
    // Dar tiempo a Angular para renderizar el DOM
    setTimeout(function() {
      window.templateBridge.reinitAll();
    }, 300);
  });

})(jQuery);
