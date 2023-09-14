import { menuState } from "./index.js";
import { hideError, showError, showPopup } from "./ui.js";

function calculateTotal(menuType) {
  let total = 0;
  for (let item in menuState[menuType]) {
    if (item === "total") continue;

    const quantity = menuState[menuType][item].quantity;
    if (quantity === 0) continue;

    const price = parseFloat(menuState[menuType][item].price);
    total += quantity * price;
  }
  return total;
}

export function handleMenuStep(menuType) {
  let itemSelected = false;
  for (const key in menuState[menuType]) {
    if (key === "Service Fee") continue;
    if (menuState[menuType][key].quantity > 0) {
      itemSelected = true;
      break;
    }
  }

  // check if order is above $500 minimum
  const serviceFee = 199;
  const foodTotal = calculateTotal(menuType) - serviceFee;
  if (foodTotal < 500) {
    showError("$500 food minimum");
    return false;
  }

  // check if at least one item is selected
  if (!itemSelected) {
    showError("Please select at least one item");
    return false;
  }

  const removeButtons = document.querySelectorAll(
    "[data-wf-cart-action='remove-item']"
  );
  removeButtons.forEach((button) => button.click());

  let i = 0;
  const items = menuState[menuType];
  for (const key in items) {
    const quantity = items[key].quantity;
    if (!quantity) continue;
    if (quantity === 0) continue;
    const addToCartButton = items[key].addToCartButton;

    setTimeout(() => {
      addToCartButton.disabled = false;
      addToCartButton.click();
      addToCartButton.disabled = true;
    }, i * 250 + 500);
    i++;
  }

  return true;
}

export function initMenu(menuType) {
  if (
    menuType === "private-event-menu" ||
    menuType === "performance-catering-menu"
  ) {
    return;
  }

  // add cart event listener
  const cartIcon = document.querySelector(".cart-icon");
  cartIcon.style.display = "block";
  cartIcon.addEventListener("click", () => showPopup("cart"));

  // initialize menuState
  const step = document.querySelector(`[data-step='${menuType}']`);
  const menuItems = step.querySelectorAll(".menu-item");
  const quantityInputs = step.querySelectorAll(".menu-item-quantity");
  const addToCartButtons = step.querySelectorAll(
    "[data-node-type='commerce-add-to-cart-button']"
  );

  addToCartButtons.forEach((button) => {
    button.disabled = true;
  });

  menuItems.forEach((item, i) => {
    const name = item.querySelector(".menu-item-name").textContent;
    let price = item.querySelector(".menu-item-price").textContent;
    price = price.replace("$", "").replace(".00", "").replace("USD", "").trim();
    const input = quantityInputs[i];

    let quantity;
    if (name === "Service Fee") {
      quantity = 1;
    } else {
      quantity = menuState[menuType][name]?.quantity || 0;
    }

    if (quantity > 0) item.classList.add("selected");
    else item.classList.remove("selected");

    menuState[menuType][name] = {
      price,
      quantity,
      input,
      addToCartButton: addToCartButtons[i],
    };
  });

  for (let dish in menuState[menuType]) {
    if (dish === "total") continue;
    menuState[menuType][dish].input.addEventListener("change", (e) =>
      updateMenuState(e, menuType)
    );
    menuState[menuType][dish].input.value = menuState[menuType][dish].quantity;
    menuState[menuType][dish].input.min = 0;
  }

  initMenuState(menuType);
}

function initMenuState(menuType) {
  const total = calculateTotal(menuType);
  menuState[menuType].total = total;
  updateCart(menuType);
  sessionStorage.setItem("menuState", JSON.stringify(menuState));
}

export function updateCart(menuType) {
  const cartContent = document.querySelector(".review-section.cart");
  cartContent.innerHTML = `
    <div class="label cart">Cart</div>
    <div class="cart-items"></div>
  `;
  const cartItems = cartContent.querySelector(".cart-items");

  const items = menuState[menuType];
  for (const key in items) {
    if (key === "Service Fee") continue;
    const quantity = items[key]?.quantity || null;
    if (!quantity) continue;
    if (quantity === 0) continue;

    const price = parseFloat(items[key].price);

    const reviewItem = document.createElement("div");
    reviewItem.classList.add("review-item");
    reviewItem.innerHTML = `
            <div class="review-flex">
              <div class="menu-item-value">${quantity}</div>
              <div class="review-item-name">${key}</div>
            </div>
            <div class="dotted-line"></div>
            <div class="review-item-price">$${quantity * price}</div>
        `;
    cartItems.appendChild(reviewItem);
  }

  const total = document.createElement("div");
  total.classList.add("review-item", "total", "cart");
  total.innerHTML = `
          <div class="label total">Food Total:</div>
          <div class="dotted-line"></div>
          <div class="review-item-price total">$${
            menuState["luxury-catering-menu"]["total"] - 199
          }</div>
        `;
  cartContent.appendChild(total);
}

function updateMenuState(e, menuType) {
  e.preventDefault();
  hideError();

  const quantity = parseInt(e.target.value) || 0;
  const menuItem = e.target.closest(".menu-item");
  const name = menuItem.querySelector(".menu-item-name").textContent;

  if (quantity > 0) menuItem.classList.add("selected");
  else {
    menuItem.classList.remove("selected");
    e.target.value = 0;
  }

  menuState[menuType][name].quantity = quantity;

  const total = calculateTotal(menuType);
  menuState[menuType].total = total;
  sessionStorage.setItem("menuState", JSON.stringify(menuState));

  updateCart(menuType);
}
