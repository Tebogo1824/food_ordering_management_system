// Shop WhatsApp number: international format, no +, spaces, or leading 0.
const SHOP_NUMBER = "27836700719";
const CART_STORAGE_KEY = "junxion-cafe-cart";
const DELIVERY_FEES = {
  collection: 0,
  kanana: 30,
  orkney: 35,
};

// Keep the menu in one place; the menu and cart are both rendered from this list.
const MENU = [
  { name: "Vienna Kota", price: 25, includes: "Chips, polony, Vienna, lettuce" },
  { name: "Egg or Cheese Kota", price: 34, includes: "Chips, polony, Vienna, lettuce, egg or cheese" },
  { name: "Russian or Beef Patty Kota", price: 38, includes: "Chips, polony, cheese, egg, lettuce, Russian or beef patty" },
  { name: "Ham Kota", price: 42, includes: "Chips, polony, cheese, egg, ham, lettuce, Russian or beef patty" },
  { name: "Double Cheese Kota", price: 45, includes: "Chips, polony, double cheese, egg, lettuce, Russian or beef patty" },
  { name: "Rib Burger Kota", price: 53, includes: "Chips, rib burger, cheese, ham, lettuce" },
  { name: "Loaded Rib Burger Kota - R60", price: 60, includes: "Chips, polony, cheese, egg, lettuce, Russian or beef patty, rib burger" },
  { name: "Loaded Rib Burger Kota - R70", price: 70, includes: "Chips, polony, cheese, egg, lettuce, Russian or beef patty, rib burger" },
];

const menuDiv = document.getElementById("menu");
const cartItemsDiv = document.getElementById("cartItems");
const errorDiv = document.getElementById("error");

function loadQuantities() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    if (!Array.isArray(saved)) return MENU.map(() => 0);

    return MENU.map((_, index) => {
      const quantity = saved[index];
      return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 0;
    });
  } catch (error) {
    console.warn("Could not load the saved cart.", error);
    return MENU.map(() => 0);
  }
}

const quantities = loadQuantities();

function saveQuantities() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(quantities));
  } catch (error) {
    console.error("Could not save the cart in this browser.", error);
    errorDiv.textContent = "Your cart changed, but this browser could not save it.";
  }
}

function renderMenu() {
  MENU.forEach((item, index) => {
    const row = document.createElement("article");
    row.className = "item";
    row.innerHTML = `
      <div class="item-details">
        <h2 class="name">${item.name}</h2>
        <p class="includes">Includes: ${item.includes}</p>
        <p class="price">R${item.price}</p>
      </div>
      <div class="qty" aria-label="${item.name} quantity">
        <button type="button" data-i="${index}" data-change="-1" aria-label="Remove one ${item.name}">−</button>
        <span id="qty-${index}" aria-live="polite">${quantities[index]}</span>
        <button type="button" data-i="${index}" data-change="1" aria-label="Add one ${item.name}">+</button>
      </div>`;
    menuDiv.appendChild(row);
  });
}

function getSubtotal() {
  return MENU.reduce((sum, item, index) => sum + item.price * quantities[index], 0);
}

function getDeliveryFee() {
  const fulfilment = document.getElementById("fulfilment").value;
  return DELIVERY_FEES[fulfilment] || 0;
}

function renderCart() {
  const selectedItems = MENU
    .map((item, index) => ({ item, index, quantity: quantities[index] }))
    .filter((entry) => entry.quantity > 0);

  cartItemsDiv.replaceChildren();
  if (selectedItems.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-cart";
    emptyMessage.textContent = "Your cart is empty. Add a kota to get started.";
    cartItemsDiv.appendChild(emptyMessage);
  } else {
    selectedItems.forEach(({ item, index, quantity }) => {
      const row = document.createElement("article");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="cart-item-details">
          <h3>${item.name}</h3>
          <p>R${item.price} each</p>
        </div>
        <div class="cart-qty" aria-label="${item.name} quantity controls">
          <button type="button" data-i="${index}" data-change="-1" aria-label="Remove one ${item.name}">−</button>
          <span>${quantity}</span>
          <button type="button" data-i="${index}" data-change="1" aria-label="Add one ${item.name}">+</button>
        </div>
        <button class="remove-item" type="button" data-i="${index}" data-remove="true" aria-label="Remove ${item.name} from cart">×</button>`;
      cartItemsDiv.appendChild(row);
    });
  }

  const itemCount = quantities.reduce((sum, quantity) => sum + quantity, 0);
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  document.getElementById("cartCount").textContent = itemCount;
  document.getElementById("subtotal").textContent = `R${subtotal}`;
  document.getElementById("deliveryFee").textContent = `R${deliveryFee}`;
  document.getElementById("total").textContent = `R${subtotal + deliveryFee}`;
}

function updateCart() {
  MENU.forEach((_, index) => {
    document.getElementById(`qty-${index}`).textContent = quantities[index];
  });
  renderCart();
  saveQuantities();
}

function setCartVisibility(isVisible) {
  document.getElementById("cart").classList.toggle("is-collapsed", !isVisible);
  document.body.classList.toggle("cart-collapsed", !isVisible);
  document.getElementById("cartToggle").setAttribute("aria-expanded", String(isVisible));
}

function handleQuantityClick(event) {
  const button = event.target.closest("button[data-i]");
  if (!button) return;

  const index = Number(button.dataset.i);
  if (!Number.isInteger(index) || index < 0 || index >= MENU.length) return;

  if (button.dataset.remove === "true") {
    quantities[index] = 0;
  } else {
    quantities[index] = Math.max(0, quantities[index] + Number(button.dataset.change));
  }
  errorDiv.textContent = "";
  updateCart();
}

function updateFulfilmentFields() {
  const fulfilment = document.getElementById("fulfilment").value;
  const addressField = document.getElementById("deliveryAddressField");
  const addressInput = document.getElementById("deliveryAddress");
  const requiresAddress = fulfilment === "kanana" || fulfilment === "orkney";

  addressField.hidden = !requiresAddress;
  addressInput.required = requiresAddress;
  renderCart();
}

renderMenu();
updateCart();
setCartVisibility(!window.matchMedia("(max-width: 900px)").matches);
updateFulfilmentFields();

menuDiv.addEventListener("click", handleQuantityClick);
cartItemsDiv.addEventListener("click", handleQuantityClick);
document.getElementById("cartClose").addEventListener("click", () => setCartVisibility(false));
document.getElementById("cartToggle").addEventListener("click", () => {
  const isVisible = !document.getElementById("cart").classList.contains("is-collapsed");
  setCartVisibility(!isVisible);
});
document.getElementById("fulfilment").addEventListener("change", () => {
  errorDiv.textContent = "";
  updateFulfilmentFields();
});

document.getElementById("orderForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const contactNumber = document.getElementById("contactNumber").value.trim();
  const fulfilment = document.getElementById("fulfilment").value;
  const deliveryAddress = document.getElementById("deliveryAddress").value.trim();
  const notes = document.getElementById("notes").value.trim();

  if (getSubtotal() === 0) {
    errorDiv.textContent = "Please add at least one kota to your cart.";
    return;
  }
  if (!name) {
    errorDiv.textContent = "Please enter your name.";
    document.getElementById("name").focus();
    return;
  }
  const phoneDigits = contactNumber.replace(/\D/g, "");
  if (!/^[0-9+() -]+$/.test(contactNumber) || phoneDigits.length < 7 || phoneDigits.length > 15) {
    errorDiv.textContent = "Please enter a valid contact number.";
    document.getElementById("contactNumber").focus();
    return;
  }
  if (!fulfilment) {
    errorDiv.textContent = "Please choose delivery or collection.";
    document.getElementById("fulfilment").focus();
    return;
  }
  if ((fulfilment === "kanana" || fulfilment === "orkney") && !deliveryAddress) {
    errorDiv.textContent = "Please enter the full delivery address.";
    document.getElementById("deliveryAddress").focus();
    return;
  }

  const selectedItems = MENU
    .map((item, index) => quantities[index] > 0 ? { item, quantity: quantities[index] } : null)
    .filter(Boolean);
  const orderLines = selectedItems.map(
    ({ item, quantity }) => `- ${quantity} × ${item.name} — R${item.price * quantity} (R${item.price} each)`
  );
  const itemCount = selectedItems.reduce((sum, entry) => sum + entry.quantity, 0);
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = subtotal + deliveryFee;
  const deliveryArea = fulfilment === "kanana" ? "Kanana" : "Orkney";
  const fulfilmentDescription = fulfilment === "collection"
    ? "Collection"
    : `Delivery to ${deliveryAddress} (${deliveryArea})`;

  const message = [
    "Hi! I’d like to place an order:",
    "",
    "*Item(s):*",
    ...orderLines,
    `*Quantity:* ${itemCount}`,
    `*Delivery / Collection:* ${fulfilmentDescription}`,
    `*Contact Name & Number:* ${name} – ${contactNumber}`,
    `*Subtotal:* R${subtotal}`,
    `*Delivery:* R${deliveryFee}`,
    `*Total:* R${total}`,
    "",
    "Please confirm availability and the total amount (including delivery). Thank you!",
    notes ? `Notes: ${notes}` : null,
  ].filter(Boolean).join("\n");

  errorDiv.textContent = "";
  const link = `https://wa.me/${SHOP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(link, "_blank", "noopener,noreferrer");
});
