import { menuState } from "./index.js";
import { hideError, showError } from "./ui.js";

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
}

function updateMenuState(e, menuType) {
  e.preventDefault();
  console.log("updateMenuState");

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

  hideError();
}

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
