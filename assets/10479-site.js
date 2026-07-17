(function () {
  const select = (selector, root = document) => root.querySelector(selector);
  const selectAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const nav = select(".nav");
  const menu = select(".nav-menu-toggle");
  if (nav && menu) {
    const setOpen = (open) => {
      nav.classList.toggle("menu-open", open);
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
    };
    menu.addEventListener("click", () => setOpen(!nav.classList.contains("menu-open")));
    selectAll(".nav-links a", nav).forEach((link) => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (event) => event.key === "Escape" && setOpen(false));
  }

  const reveal = selectAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -7% 0px" });
    reveal.forEach((element) => observer.observe(element));
  } else {
    reveal.forEach((element) => element.classList.add("in"));
  }

  function activate(images, target) {
    images.forEach((image) => image.classList.toggle("active", image === target));
  }

  selectAll("[data-toggle]").forEach((toggle) => {
    const images = selectAll("img", toggle);
    const pills = select(".subsystem-toggle-pills", toggle.parentElement);
    if (!pills || images.length < 2) return;
    const indicator = document.createElement("span");
    indicator.className = "pill-indicator";
    indicator.setAttribute("aria-hidden", "true");
    pills.append(indicator);

    const updateIndicator = () => {
      const active = select(".pill.active", pills);
      if (!active) return;
      pills.style.setProperty("--indicator-x", `${active.offsetLeft}px`);
      pills.style.setProperty("--indicator-y", `${active.offsetTop}px`);
      pills.style.setProperty("--indicator-width", `${active.offsetWidth}px`);
      pills.style.setProperty("--indicator-height", `${active.offsetHeight}px`);
    };
    images.forEach((image, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `pill${index === 0 ? " active" : ""}`;
      button.textContent = image.dataset.label || `视图 ${index + 1}`;
      button.addEventListener("click", () => {
        activate(images, image);
        selectAll(".pill", pills).forEach((pill) => pill.classList.toggle("active", pill === button));
        updateIndicator();
      });
      pills.append(button);
    });
    requestAnimationFrame(updateIndicator);
    window.addEventListener("resize", updateIndicator);
  });

  const hero = select(".hero-stage-inner");
  if (hero) {
    const images = selectAll(".hero-stage-images img", hero);
    const callouts = selectAll(".callout", hero);
    const lines = selectAll(".leader-line", hero);
    let resetTimer;
    const show = (key) => {
      const image = images.find((candidate) => candidate.dataset.key === key) || images[0];
      activate(images, image);
      callouts.forEach((callout) => callout.classList.toggle("is-active", callout.dataset.key === key));
      lines.forEach((line) => line.classList.toggle("is-active", line.dataset.key === key));
    };
    const scheduleReset = () => {
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => show("full"), 1000);
    };
    callouts.forEach((callout) => {
      const key = callout.dataset.key || "full";
      callout.addEventListener("mouseenter", () => { window.clearTimeout(resetTimer); show(key); });
      callout.addEventListener("mouseleave", scheduleReset);
      callout.addEventListener("focus", () => { window.clearTimeout(resetTimer); show(key); });
      callout.addEventListener("blur", scheduleReset);
      callout.addEventListener("click", () => show(key));
    });
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty("--pointer-x", String((event.clientX - rect.left) / rect.width - 0.5));
      hero.style.setProperty("--pointer-y", String((event.clientY - rect.top) / rect.height - 0.5));
    });
    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--pointer-x", "0");
      hero.style.setProperty("--pointer-y", "0");
    });
    show("full");
  }

  selectAll("[data-compare]").forEach((compare) => {
    const range = select(".cad-compare-range", compare);
    if (!range) return;
    const update = () => compare.style.setProperty("--split", `${range.value}%`);
    range.addEventListener("input", update);
    update();
  });

  const lightbox = select(".lightbox");
  const lightboxImage = select(".lightbox-images img", lightbox);
  const download = select(".lightbox-download", lightbox);
  const close = select(".lightbox-close", lightbox);
  const openLightbox = (image) => {
    if (!lightbox || !lightboxImage || !download) return;
    const source = image.currentSrc || image.src;
    lightboxImage.src = source;
    lightboxImage.alt = image.alt;
    download.href = source;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  };
  const closeLightbox = () => {
    if (!lightbox || !lightboxImage) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
  };
  selectAll("[data-lightbox-group] img, .web-bento-card img, .cad-compare img").forEach((image) => {
    image.addEventListener("click", () => {
      const group = image.closest("[data-lightbox-group]");
      openLightbox(group ? select("img.active", group) || image : image);
    });
  });
  close?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => event.target === lightbox && closeLightbox());
  document.addEventListener("keydown", (event) => event.key === "Escape" && closeLightbox());
})();
