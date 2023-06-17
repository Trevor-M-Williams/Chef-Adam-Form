Webflow.push(function () {
  window.addEventListener("click", handleStepChange);

  let userInput = JSON.parse(sessionStorage.getItem("userInput")) || {};
  let menuState = JSON.parse(sessionStorage.getItem("menuState")) || {};
  let formSteps = [];
  let currentStep = 0;

  initMenu();
  initFormSteps();
  initHomeYachtCards();

  function handleHomeYachtSelect(e) {
    formSteps = [];
    initFormSteps();
    const card = e.target.parentNode;
    card.classList.add("selected");
    if (card.id === "home-card") {
      const homeStep = document.getElementById("home-form");
      formSteps.push(homeStep);

      const yachtCard = document.getElementById("yacht-card");
      yachtCard.classList.remove("selected");
    } else {
      const yachtStep = document.getElementById("yacht-form");
      formSteps.push(yachtStep);

      const homeCard = document.getElementById("home-card");
      homeCard.classList.remove("selected");
    }
    const lastStep = document.querySelector("[data-last]");
    formSteps.push(lastStep);
  }

  function handleQuantityChange(e) {
    updateState(e);
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

    if (currentStep === 2) {
      inputs.forEach((input) => {
        userInput[input.name] = input.value;
      });
      sessionStorage.setItem("userInput", JSON.stringify(userInput));
    }

    showCurrentStep(incrementor);
    if (currentStep === formSteps.length - 1) initForm();
  }

  function initForm() {
    const lastStep = document.querySelector("[data-last]");
    const form = lastStep.querySelector("form");

    // create inputs for userInput items
    for (let item in userInput) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = item;
      input.value = userInput[item];
      form.appendChild(input);
    }

    // create inputs for menuState items
    for (let item in menuState) {
      const quantity = menuState[item].quantity;
      if (quantity === 0) continue;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = item;
      input.value = quantity;
      form.appendChild(input);
    }
  }

  function initFormSteps() {
    const firstStep = document.querySelector("[data-first]");
    const secondStep = document.querySelector("[data-second]");
    formSteps.push(firstStep, secondStep);
  }

  function initMenu() {
    const menuItems = document.querySelectorAll(".menu-item");
    const quantityInputs = document.querySelectorAll(".menu-item-quantity");

    menuItems.forEach((item, i) => {
      const name = item.querySelector(".menu-item-name").textContent;
      const input = quantityInputs[i];
      menuState[name] = {
        quantity: menuState[name]?.quantity || 0,
        input,
      };
    });

    for (let dish in menuState) {
      menuState[dish].input.addEventListener("change", handleQuantityChange);
      menuState[dish].input.value = menuState[dish].quantity;
      menuState[dish].input.min = 0;
    }
  }

  function initHomeYachtCards() {
    const homeYachtCards = document.querySelectorAll(".home-yacht-card");
    homeYachtCards.forEach((card) => {
      card.addEventListener("click", handleHomeYachtSelect);
    });
  }

  function showCurrentStep(incrementor) {
    formSteps[currentStep].style.display = "none";
    currentStep += incrementor;
    formSteps[currentStep].style.display = "block";
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
});
