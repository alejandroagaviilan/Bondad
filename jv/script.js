document.addEventListener('DOMContentLoaded', () => {

    /* ============================
       1. MENÚ MÓVIL (hamburguesa)
       ============================ */
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('nav > ul');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const abierto = navMenu.classList.toggle('nav-abierto');
            navToggle.setAttribute('aria-expanded', abierto);
        });
    }

    /* ============================
       2. SUBMENÚS EN MÓVIL/TÁCTIL
       (en escritorio se abren con :hover vía CSS;
       en pantallas táctiles no existe hover, así que
       los abrimos con un toque sobre el enlace padre)
       ============================ */
    const itemsConSubmenu = document.querySelectorAll('nav > ul > li');

    itemsConSubmenu.forEach((item) => {
        const submenu = item.querySelector('ul');
        if (!submenu) return;

        const enlacePadre = item.querySelector('a');

        enlacePadre.addEventListener('click', (evento) => {
            const esMovil = window.matchMedia('(max-width: 768px)').matches;
            if (!esMovil) return;

            evento.preventDefault();

            // Cierra el resto de submenús abiertos
            itemsConSubmenu.forEach((otro) => {
                if (otro !== item) otro.classList.remove('submenu-abierto');
            });

            item.classList.toggle('submenu-abierto');
        });
    });

    // Cerrar el menú móvil al pulsar un enlace final (sin submenú)
    document.querySelectorAll('nav a').forEach((enlace) => {
        enlace.addEventListener('click', () => {
            if (enlace.parentElement.querySelector('ul')) return; // tiene submenú, no cerrar aún
            navMenu?.classList.remove('nav-abierto');
            navToggle?.setAttribute('aria-expanded', 'false');
        });
    });

    /* ============================
       3. RESALTAR SECCIÓN ACTIVA
       ============================ */
    const secciones = document.querySelectorAll('main section[id], body > section[id]');
    const enlacesMenu = document.querySelectorAll('nav a[href^="#"]');

    if (secciones.length && enlacesMenu.length && 'IntersectionObserver' in window) {
        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (!entrada.isIntersecting) return;

                const id = entrada.target.getAttribute('id');

                enlacesMenu.forEach((enlace) => {
                    enlace.classList.toggle('activo', enlace.getAttribute('href') === `#${id}`);
                });
            });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

        secciones.forEach((seccion) => observador.observe(seccion));
    }

    /* ============================
       4. LIGHTBOX PARA GALERÍAS
       ============================ */
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <button class="lightbox-cerrar" aria-label="Cerrar imagen">&times;</button>
        <img src="" alt="">
    `;
    document.body.appendChild(overlay);

    const imagenOverlay = overlay.querySelector('img');
    const botonCerrar = overlay.querySelector('.lightbox-cerrar');

    function abrirLightbox(src, alt) {
        imagenOverlay.src = src;
        imagenOverlay.alt = alt || '';
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function cerrarLightbox() {
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.galeria img').forEach((img) => {
        img.addEventListener('click', () => abrirLightbox(img.src, img.alt));
    });

    botonCerrar.addEventListener('click', cerrarLightbox);
    overlay.addEventListener('click', (evento) => {
        if (evento.target === overlay) cerrarLightbox();
    });
    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') cerrarLightbox();
    });

    /* ============================
       5. BOTÓN "VOLVER ARRIBA"
       ============================ */
    const botonArriba = document.createElement('button');
    botonArriba.className = 'volver-arriba';
    botonArriba.setAttribute('aria-label', 'Volver arriba');
    botonArriba.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    document.body.appendChild(botonArriba);

    window.addEventListener('scroll', () => {
        botonArriba.classList.toggle('visible', window.scrollY > 500);
    });

    botonArriba.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

});