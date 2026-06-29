/**
 * VERSION Streetwear — Main Application
 */

const formatPrice = (price) => `₱${price.toLocaleString()}`;

const encodeImagePath = (path) => path.split("/").map(encodeURIComponent).join("/");

function createProductCard(product, buttonLabel = "View Details") {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.category = product.category;
  card.dataset.id = product.id;

  const badges = SITE.shopComingSoon
    ? '<span class="product-badge product-badge--soon">Coming Soon</span>'
    : product.isNew
      ? '<span class="product-badge">New</span>'
      : "";

  const priceMarkup = SITE.shopComingSoon
    ? '<span class="product-card__status">Coming Soon</span>'
    : `<span class="product-card__price">${formatPrice(product.price)}</span>`;

  const ctaMarkup = SITE.shopComingSoon
    ? `<a href="${SITE.tiktok}" target="_blank" rel="noopener noreferrer" class="btn btn--white btn--sm">Buy on TikTok</a>`
    : `<button class="btn btn--outline btn--sm" data-action="view-product" data-id="${product.id}">Shop Now</button>`;

  card.innerHTML = `
    <div class="product-card__image-wrap">
      ${badges}
      <img src="${encodeImagePath(product.image)}" alt="${product.name} — VERSION Streetwear" loading="lazy" />
      <div class="product-card__overlay">
        <button class="btn btn--white btn--sm" data-action="view-product" data-id="${product.id}">
          ${buttonLabel}
        </button>
      </div>
    </div>
    <div class="product-card__body">
      <h3 class="product-card__name">${product.name}</h3>
      <p class="product-card__desc">${product.description}</p>
      <div class="product-card__footer">
        ${priceMarkup}
        ${ctaMarkup}
      </div>
    </div>
  `;

  return card;
}

function renderProducts(containerId, products, buttonLabel) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  products.forEach((product) => {
    container.appendChild(createProductCard(product, buttonLabel));
  });
}

function renderFeatured() {
  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 8);
  renderProducts("featured-products", featured, "View Details");
}

function renderShopGrid(filter = "all") {
  const filtered =
    filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);
  renderProducts("shop-grid", filtered, "View Details");
  updateFilterButtons(filter);
}

function renderShowcase() {
  const showcase = PRODUCTS.slice(0, 12);
  renderProducts("showcase-grid", showcase, "View Details");
}

function renderComingSoon() {
  const container = document.getElementById("coming-soon-grid");
  if (!container) return;

  container.innerHTML = COMING_SOON.map(
    (item) => `
    <div class="coming-soon-card">
      <span class="coming-soon-card__label">${item.date}</span>
      <h3 class="coming-soon-card__title">${item.name}</h3>
      <p class="coming-soon-card__desc">${item.description}</p>
    </div>
  `
  ).join("");
}

function updateFilterButtons(activeFilter) {
  document.querySelectorAll("[data-filter]").forEach((btn) => {
    btn.classList.toggle("filter-btn--active", btn.dataset.filter === activeFilter);
  });
}

function openProductModal(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const modal = document.getElementById("product-modal");
  if (!modal) return;

  document.getElementById("modal-image").src = encodeImagePath(product.image);
  document.getElementById("modal-image").alt = product.name;
  document.getElementById("modal-title").textContent = product.name;
  document.getElementById("modal-description").textContent = product.description;
  const priceEl = document.getElementById("modal-price");
  if (SITE.shopComingSoon) {
    priceEl.textContent = "Coming Soon";
    priceEl.classList.add("modal__price--soon");
  } else {
    priceEl.textContent = formatPrice(product.price);
    priceEl.classList.remove("modal__price--soon");
  }

  const modalTiktok = document.getElementById("modal-tiktok");
  if (modalTiktok) modalTiktok.href = SITE.tiktok;

  const soonNote = document.getElementById("modal-soon-note");
  if (soonNote) soonNote.hidden = !SITE.shopComingSoon;

  const tagsContainer = document.getElementById("modal-tags");
  tagsContainer.innerHTML = product.tags
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join("");

  const sizesContainer = document.getElementById("modal-sizes");
  sizesContainer.innerHTML = SIZES.map(
    (size, i) =>
      `<button class="size-btn${i === 1 ? " size-btn--active" : ""}" type="button">${size}</button>`
  ).join("");

  sizesContainer.querySelectorAll(".size-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      sizesContainer.querySelectorAll(".size-btn").forEach((b) => b.classList.remove("size-btn--active"));
      btn.classList.add("size-btn--active");
    });
  });

  modal.classList.add("modal--open");
  document.body.classList.add("no-scroll");
}

function closeProductModal() {
  const modal = document.getElementById("product-modal");
  if (!modal) return;
  modal.classList.remove("modal--open");
  document.body.classList.remove("no-scroll");
}

function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  const overlay = document.getElementById("nav-overlay");

  if (!toggle || !nav) return;

  const closeNav = () => {
    toggle.classList.remove("nav-toggle--active");
    nav.classList.remove("nav--open");
    overlay?.classList.remove("nav-overlay--visible");
    document.body.classList.remove("no-scroll");
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("nav--open");
    toggle.classList.toggle("nav-toggle--active", isOpen);
    overlay?.classList.toggle("nav-overlay--visible", isOpen);
    document.body.classList.toggle("no-scroll", isOpen);
  });

  overlay?.addEventListener("click", closeNav);

  nav.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", closeNav);
  });
}

function initFilters() {
  document.querySelectorAll("[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      renderShopGrid(btn.dataset.filter);
    });
  });
}

function initModal() {
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-action='view-product']");
    if (trigger) {
      openProductModal(trigger.dataset.id);
      return;
    }

    if (e.target.closest("[data-action='close-modal']")) {
      closeProductModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProductModal();
  });
}

function initScrollEffects() {
  const header = document.getElementById("site-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("header--scrolled", window.scrollY > 40);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal--visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  elements.forEach((el) => observer.observe(el));
}

function initNewsletterForm() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input[type='email']");
    const feedback = document.getElementById("newsletter-feedback");

    if (feedback) {
      feedback.textContent = "Thanks for subscribing. We'll keep you posted on the next drop.";
      feedback.classList.add("newsletter-feedback--visible");
    }

    if (input) input.value = "";
  });
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const feedback = document.getElementById("contact-feedback");

    if (feedback) {
      feedback.textContent = "Message received. We'll get back to you soon.";
      feedback.classList.add("form-feedback--visible");
    }

    form.reset();
  });
}

function initFooterFilterLinks() {
  document.querySelectorAll("[data-filter-link]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const filter = link.dataset.filterLink;
      if (!filter) return;
      renderShopGrid(filter);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderFeatured();
  renderShopGrid("all");
  renderShowcase();
  renderComingSoon();
  initMobileNav();
  initFilters();
  initModal();
  initScrollEffects();
  initRevealAnimations();
  initNewsletterForm();
  initContactForm();
  initFooterFilterLinks();
});
