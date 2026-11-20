(() => {
    "use strict";
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ================= MENÚ ================= */
    const nav = $(".nav");
    const toggle = $(".nav-toggle");
    const cerrarMenu = () => {
        nav.classList.remove("abierto");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menú");
        toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    };
    toggle.addEventListener("click", () => {
        const abierto = nav.classList.toggle("abierto");
        toggle.setAttribute("aria-expanded", abierto);
        toggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
        toggle.innerHTML = `<i class="fa-solid fa-${abierto ? "xmark" : "bars"}"></i>`;
    });
    $$(".tiene-sub > a").forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarMenu(); });

    /* ================= PESTAÑAS DE TITULARES ================= */
    const tabs = $$(".tab");
    const mostrarTab = (id) => {
        tabs.forEach((t) => {
            const on = t.dataset.panel === id;
            t.classList.toggle("activa", on);
            t.setAttribute("aria-selected", on);
            t.tabIndex = on ? 0 : -1;
            $("#" + t.dataset.panel).hidden = !on;
        });
    };
    tabs.forEach((t, i) => {
        t.addEventListener("click", () => mostrarTab(t.dataset.panel));
        t.addEventListener("keydown", (e) => {
            if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
            const n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
            mostrarTab(n.dataset.panel); n.focus();
        });
    });
    const irATitular = (id) => {
        mostrarTab(id);
        $("#titulares").scrollIntoView({ behavior: reducido ? "auto" : "smooth" });
    };
    $$('a[href="#bondad"], a[href="#reina"]').forEach((a) =>
        a.addEventListener("click", (e) => { e.preventDefault(); cerrarMenu(); irATitular(a.getAttribute("href").slice(1)); })
    );
    $$('.nav a[href^="#"]:not([href="#"])').forEach((a) => a.addEventListener("click", cerrarMenu));
    if (["#bondad", "#reina"].includes(location.hash)) setTimeout(() => irATitular(location.hash.slice(1)), 150);

    /* ================= NAV SÓLIDO + BOTÓN SUBIR ================= */
    const subir = $("#subir");
    let espera = false;
    const alScroll = () => {
        nav.classList.toggle("solido", scrollY > 60);
        subir.classList.toggle("visible", scrollY > 900);
        espera = false;
    };
    addEventListener("scroll", () => { if (!espera) { espera = true; requestAnimationFrame(alScroll); } }, { passive: true });
    subir.addEventListener("click", () => scrollTo({ top: 0, behavior: reducido ? "auto" : "smooth" }));
    alScroll();

    /* ================= SECCIÓN ACTIVA EN EL MENÚ ================= */
    const items = $$(".nav-lista > li[data-secciones]");
    const obsSec = new IntersectionObserver((entradas) => {
        entradas.forEach((en) => {
            if (!en.isIntersecting) return;
            items.forEach((li) => li.classList.toggle("activo", li.dataset.secciones.split(" ").includes(en.target.id)));
        });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main > section[id]").forEach((s) => obsSec.observe(s));

    /* ================= SLIDER DE LA CABECERA ================= */
    const hero = $(".hero");
    const slides = $$(".hero-fondo .slide");
    const contSeg = $("#segmentos");
    const leyenda = $("#heroLeyenda");
    const btnPausa = $("#heroPausa");
    const INTERVALO = 5500; // milisegundos entre fotos

    if (slides.length) {
        // Detecta si cada foto es vertical (se muestra entera) u horizontal (llena la pantalla)
        slides.forEach((s) => {
            const img = $("img", s);
            const medir = () => {
                if (img.naturalWidth && img.naturalHeight) {
                    s.classList.toggle("vert", img.naturalWidth / img.naturalHeight < 1.3);
                }
            };
            if (img.complete) medir(); else img.addEventListener("load", medir);
        });

        let actual = 0, timer = null, pausaUsuario = false, pausaHover = false;
        hero.style.setProperty("--intervalo", INTERVALO + "ms");

        const segs = slides.map((_, i) => {
            const b = document.createElement("button");
            b.type = "button"; b.className = "seg";
            b.setAttribute("aria-label", "Ir a la imagen " + (i + 1));
            b.addEventListener("click", () => { ir(i); arrancar(); });
            contSeg.appendChild(b);
            return b;
        });

        function ir(n) {
            slides[actual].classList.remove("activa");
            actual = (n + slides.length) % slides.length;
            slides[actual].classList.add("activa");
            segs.forEach((s, i) => { s.classList.toggle("pasado", i < actual); s.classList.remove("activo"); });
            void segs[actual].offsetWidth;
            segs[actual].classList.add("activo");
            leyenda.classList.add("cambia");
            setTimeout(() => { leyenda.textContent = slides[actual].dataset.leyenda || ""; leyenda.classList.remove("cambia"); }, 250);
        }
        const parar = () => { clearInterval(timer); timer = null; hero.classList.add("pausa"); };
        function arrancar() {
            parar();
            if (pausaUsuario || pausaHover || document.hidden) return;
            hero.classList.remove("pausa");
            segs[actual].classList.remove("activo"); void segs[actual].offsetWidth; segs[actual].classList.add("activo");
            timer = setInterval(() => ir(actual + 1), INTERVALO);
        }

        $("#heroPrev").addEventListener("click", () => { ir(actual - 1); arrancar(); });
        $("#heroNext").addEventListener("click", () => { ir(actual + 1); arrancar(); });
        btnPausa.addEventListener("click", () => {
            pausaUsuario = !pausaUsuario;
            btnPausa.innerHTML = `<i class="fa-solid fa-${pausaUsuario ? "play" : "pause"}"></i>`;
            btnPausa.setAttribute("aria-label", pausaUsuario ? "Reanudar el cambio de imágenes" : "Pausar el cambio de imágenes");
            arrancar();
        });
        hero.addEventListener("mouseenter", () => { pausaHover = true; parar(); });
        hero.addEventListener("mouseleave", () => { pausaHover = false; arrancar(); });
        document.addEventListener("visibilitychange", arrancar);

        let x0 = 0;
        hero.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
        hero.addEventListener("touchend", (e) => {
            const d = e.changedTouches[0].clientX - x0;
            if (Math.abs(d) > 50) { ir(d < 0 ? actual + 1 : actual - 1); arrancar(); }
        });

        ir(0);
        arrancar();
    }

    /* ================= CONTADORES ================= */
    const animar = (el) => {
        const fin = +el.dataset.contar, pre = el.dataset.prefijo || "";
        if (reducido) { el.textContent = pre + fin; return; }
        const t0 = performance.now(), dur = 1700;
        const paso = (t) => {
            const p = Math.min((t - t0) / dur, 1);
            el.textContent = pre + Math.round(fin * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(paso);
        };
        requestAnimationFrame(paso);
    };
    const obsCifras = new IntersectionObserver((es) => {
        es.forEach((en) => { if (en.isIntersecting) { animar(en.target); obsCifras.unobserve(en.target); } });
    }, { threshold: 0.6 });
    $$("[data-contar]").forEach((c) => { c.textContent = (c.dataset.prefijo || "") + "0"; obsCifras.observe(c); });

    /* ================= APARICIÓN SUAVE AL HACER SCROLL ================= */
    const obsRev = new IntersectionObserver((es) => {
        es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visto"); obsRev.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    $$(".rev").forEach((el) => obsRev.observe(el));

    /* ================= VISOR DE FOTOS ================= */
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Visor de imágenes");
    lb.innerHTML = `
        <button class="lb-cerrar" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
        <button class="lb-prev" aria-label="Foto anterior"><i class="fa-solid fa-chevron-left"></i></button>
        <img alt="">
        <button class="lb-next" aria-label="Foto siguiente"><i class="fa-solid fa-chevron-right"></i></button>
        <p class="lb-info"></p>`;
    document.body.appendChild(lb);
    const lbImg = $("img", lb), lbInfo = $(".lb-info", lb);
    let grupo = [], idx = 0, origen = null;

    const pintar = () => {
        const f = grupo[idx];
        lbImg.src = f.currentSrc || f.src; lbImg.alt = f.alt;
        lbInfo.textContent = f.alt + (grupo.length > 1 ? `  ·  ${idx + 1} / ${grupo.length}` : "");
        $(".lb-prev", lb).hidden = $(".lb-next", lb).hidden = grupo.length < 2;
    };
    const abrir = (img) => {
        origen = img;
        const cont = img.closest(".mosaico");
        grupo = cont ? $$("img", cont) : [img];
        idx = grupo.indexOf(img);
        pintar();
        lb.classList.add("abierto");
        document.body.style.overflow = "hidden";
        $(".lb-cerrar", lb).focus();
    };
    const cerrar = () => { lb.classList.remove("abierto"); document.body.style.overflow = ""; if (origen) origen.focus(); };
    const mover = (d) => { idx = (idx + d + grupo.length) % grupo.length; pintar(); };

    $$("img[data-lb]").forEach((img) => {
        img.tabIndex = 0; img.setAttribute("role", "button");
        img.addEventListener("click", () => abrir(img));
        img.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(img); } });
    });
    $(".lb-cerrar", lb).addEventListener("click", cerrar);
    $(".lb-prev", lb).addEventListener("click", () => mover(-1));
    $(".lb-next", lb).addEventListener("click", () => mover(1));
    lb.addEventListener("click", (e) => { if (e.target === lb) cerrar(); });
    document.addEventListener("keydown", (e) => {
        if (!lb.classList.contains("abierto")) return;
        if (e.key === "Escape") cerrar();
        if (e.key === "ArrowLeft") mover(-1);
        if (e.key === "ArrowRight") mover(1);
    });
    let lx = 0;
    lb.addEventListener("touchstart", (e) => { lx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
        const d = e.changedTouches[0].clientX - lx;
        if (Math.abs(d) > 50) mover(d < 0 ? 1 : -1);
    });
})();