// Каталог товарів
const products = [
  {
    photo: "images/braslcholchor.jpg",
    name: "Браслет Lacoste чоловічий чорний",
    price: "850 грн",
    tag: "аксесуари",
    sizes: ["20 см"],
  },
  {
    photo: "images/braslchol.jpg",
    name: "Браслет Lacoste чоловічий сріблястий",
    price: "750 грн",
    tag: "аксесуари",
    sizes: ["20 см"],
  },
  {
    photo: "images/vwskull.jpg",
    name: "Підвіска Vivienne Westwood Skull",
    price: "250 грн",
    tag: "аксесуари",
    sizes: ["60 см"],
  },
  {
    photo: "images/vwplanet.jpg",
    name: "Підвіска Vivienne Westwood Planet",
    price: "250 грн",
    tag: "аксесуари",
    sizes: ["41+5 см"],
  },
  {
    photo: "images/vwpin.jpg",
    name: "Підвіска Vivienne Westwood Pin",
    price: "250 грн",
    tag: "аксесуари",
    sizes: ["43+5 см"],
  },
  {
    photo: "images/kepkahrom.jpg",
    name: "Кепка Chrome Hearts",
    price: "400 грн",
    tag: "аксесуари",
    sizes: ["One Size"],
  },
];

const PAGE_SIZE = 6;
const TG_MANAGER = "https://t.me/pidvis";

const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const $ = (id) => document.getElementById(id);

const grid = $("catalogGrid");
const emptyMsg = $("catalogEmpty");
const loadMoreBtn = $("loadMoreBtn");
const tagButtons = document.querySelectorAll("#filterTags .tag[data-filter]");
const lightbox = $("lightbox");
const lightboxImg = $("lightboxImg");
const orderModal = $("orderModal");
const modalSizeWrapper = $("modalSizeWrapper");
const tgOrderLink = $("tgOrderLink");
const scrollTopBtn = $("scrollTopBtn");

let currentLimit = PAGE_SIZE;
let currentCategory = "all";
let filteredProducts = products;
let currentOrderProduct = null;

const isInStock = (p) => p.inStock !== false;

function syncScrollLock() {
  const open =
    lightbox.classList.contains("active") ||
    orderModal.classList.contains("active");
  document.body.classList.toggle("no-scroll", open);
}

function renderCatalog(filter, limit) {
  filteredProducts =
    filter === "all" ? products : products.filter((p) => p.tag === filter);

  emptyMsg.hidden = filteredProducts.length > 0;

  grid.innerHTML = filteredProducts
    .slice(0, limit)
    .map((p, index) => {
      const sizes =
        p.sizes && p.sizes.length
          ? `<div class="p-sizes">${p.sizes
              .map((s) => `<span class="p-size">${esc(s)}</span>`)
              .join("")}</div>`
          : "";
      const stock = isInStock(p);
      return `
        <div class="product${stock ? "" : " sold-out"}">
          <div class="photo-wrap">
            <img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy">
            <span class="badge-cat">${esc(p.tag)}</span>
            <span class="badge-stock">${stock ? "в наявності" : "немає"}</span>
          </div>
          <div class="info">
            <p class="p-name">${esc(p.name)}</p>
            <p class="p-price">${esc(p.price)}</p>
            ${sizes}
            <button class="card-order-btn" type="button" data-index="${index}"${stock ? "" : " disabled"}>Замовити</button>
          </div>
        </div>`;
    })
    .join("");

  loadMoreBtn.hidden = filteredProducts.length <= limit;
}

function updateCounts() {
  document.querySelectorAll(".count").forEach((span) => {
    const key = span.dataset.count;
    const n =
      key === "all"
        ? products.length
        : products.filter((p) => p.tag === key).length;
    span.textContent = " " + n;
  });
}

function updateTelegramLink() {
  const p = currentOrderProduct;
  if (!p) return;

  const select = $("modalSizeSelect");
  const sizeText = select ? `\n📏 Розмір: ${select.value}` : "";
  const text = `Вітаю! 👋 Хочу замовити:\n\n🛍 Товар: ${p.name}${sizeText}\n💰 Ціна: ${p.price}\n\nПідкажіть, як оформити замовлення?`;

  tgOrderLink.href = `${TG_MANAGER}?text=${encodeURIComponent(text)}`;
}

function openOrderModal(index) {
  const p = filteredProducts[index];
  if (!p || !isInStock(p)) return;
  currentOrderProduct = p;

  $("modalProductName").textContent = p.name;
  $("modalProductPrice").textContent = p.price;

  if (p.sizes && p.sizes.length) {
    const options = p.sizes
      .map((s) => `<option value="${esc(s)}">${esc(s)}</option>`)
      .join("");
    modalSizeWrapper.innerHTML = `
      <label for="modalSizeSelect">Оберіть розмір:</label>
      <select id="modalSizeSelect" class="size-select-el">${options}</select>`;
    modalSizeWrapper.hidden = false;
  } else {
    modalSizeWrapper.innerHTML = "";
    modalSizeWrapper.hidden = true;
  }

  updateTelegramLink();
  orderModal.classList.add("active");
  syncScrollLock();
  $("modalClose").focus();
}

function closeOrderModal() {
  orderModal.classList.remove("active");
  syncScrollLock();
}

function openLightbox(img) {
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightbox.classList.add("active");
  syncScrollLock();
  $("lightboxClose").focus();
}

function closeLightbox() {
  lightbox.classList.remove("active");
  syncScrollLock();
}

grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".card-order-btn");
  if (btn) {
    openOrderModal(Number(btn.dataset.index));
    return;
  }
  if (e.target.tagName === "IMG") openLightbox(e.target);
});

loadMoreBtn.addEventListener("click", () => {
  currentLimit += PAGE_SIZE;
  renderCatalog(currentCategory, currentLimit);
});

tagButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    tagButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.filter;
    currentLimit = PAGE_SIZE;
    renderCatalog(currentCategory, currentLimit);
  });
});

$("lightboxClose").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

$("modalClose").addEventListener("click", closeOrderModal);
orderModal.addEventListener("click", (e) => {
  if (e.target === orderModal) closeOrderModal();
});
orderModal.addEventListener("change", (e) => {
  if (e.target.id === "modalSizeSelect") updateTelegramLink();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (lightbox.classList.contains("active")) closeLightbox();
  else if (orderModal.classList.contains("active")) closeOrderModal();
});

window.addEventListener("scroll", () => {
  scrollTopBtn.classList.toggle("visible", window.scrollY > 300);
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  history.pushState(
    "",
    document.title,
    window.location.pathname + window.location.search,
  );
});

updateCounts();
renderCatalog(currentCategory, currentLimit);
