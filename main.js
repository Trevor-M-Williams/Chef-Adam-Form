Webflow.push(function () {
  window.addEventListener("click", handleStepChange);

  let menuState = JSON.parse(sessionStorage.getItem("menuState")) || {};
  let formSteps = [];
  let currentStep = 0;

  initMenu();
  initFormSteps();
  initRadios();
  updateTotal();

  function handleHomeYachtChange(e) {
    formSteps = [];
    initFormSteps();
    if (e.target.value === "home") {
      const homeSteps = document
        .getElementById("home-form")
        .querySelectorAll("[data-step]");
      homeSteps.forEach((step) => formSteps.push(step));
    } else {
      const yachtSteps = document
        .getElementById("yacht-form")
        .querySelectorAll("[data-step]");
      yachtSteps.forEach((step) => formSteps.push(step));
    }
  }

  function handleQuantityChange(e) {
    updateState(e);
    updateTotal();
  }

  function handleStepChange(e) {
    let incrementor;
    if (e.target.matches("[data-next]")) {
      incrementor = 1;
    } else if (e.target.matches("[data-back]")) {
      incrementor = -1;
    }

    if (incrementor == null) return;

    if (currentStep === 0) {
      updateCart();
      sessionStorage.setItem("menuState", JSON.stringify(menuState));
      showCurrentStep(incrementor);
      return;
    }

    const inputs = formSteps[currentStep].querySelectorAll("input, textarea");
    allValid = [...inputs].every((input) => input.reportValidity());
    if (incrementor > 0 && !allValid) return;

    showCurrentStep(incrementor);
  }

  function initCart() {
    console.log("init cart");
  }

  function initFormSteps() {
    const menuStep = document.querySelector("[data-first]");
    const radioStep = document.querySelector("[data-second]");
    formSteps.push(menuStep, radioStep);
  }

  function initMenu() {
    const menuItems = document.querySelectorAll(".menu-item");
    const quantityInputs = document.querySelectorAll(".menu-item-quantity");

    menuItems.forEach((item, i) => {
      const name = item.querySelector(".menu-item-name").textContent;
      const price = parseInt(
        item.querySelector(".menu-item-price").textContent
      );
      const input = quantityInputs[i];
      menuState[name] = {
        quantity: menuState[name]?.quantity || 0,
        price,
        input,
      };
    });

    for (let dish in menuState) {
      menuState[dish].input.addEventListener("change", handleQuantityChange);
      menuState[dish].input.value = menuState[dish].quantity;
      menuState[dish].input.min = 0;
    }
  }

  function initRadios() {
    const homeYachtRadios = document.querySelectorAll("[name=home-yacht]");
    homeYachtRadios.forEach((radio) => {
      radio.addEventListener("change", handleHomeYachtChange);
    });
  }

  function showCurrentStep(incrementor) {
    formSteps[currentStep].style.display = "none";
    currentStep += incrementor;
    formSteps[currentStep].style.display = "flex";
  }

  function updateCart() {
    const removeItemBtns = document.querySelectorAll(
      "[data-wf-cart-action='remove-item']"
    );
    removeItemBtns.forEach((btn) => btn.click());

    const qualityInputs = document.querySelectorAll(".menu-item-quantity");
    const addToCartBtns = document.querySelectorAll(
      ".w-commerce-commerceaddtocartbutton"
    );

    qualityInputs.forEach((input, i) => {
      if (parseInt(input.value) > 0) {
        setTimeout(() => {
          addToCartBtns[i].click();
        }, 1000);
      }
    });
  }

  function updateState(e) {
    const quantity = parseInt(e.target.value);
    const name = e.target
      .closest(".menu-item")
      .querySelector(".menu-item-name").textContent;
    menuState[name].quantity = quantity;
  }

  function updateTotal() {
    const total = document.querySelector(".total");
    let totalPrice = 0;
    for (let dish in menuState) {
      totalPrice += menuState[dish].quantity * menuState[dish].price;
    }
    total.textContent = "$" + totalPrice;
  }
});
