Webflow.push(function () {
  window.addEventListener("click", handleStepChange);

  let userInput = JSON.parse(sessionStorage.getItem("userInput")) || {};
  let menuState = JSON.parse(sessionStorage.getItem("menuState")) || {};
  let formSteps = [];
  let currentStep = 0;
  let homeYacht;

  initMenu();
  initFormSteps();
  initHomeYachtCards();

  function handleHomeYachtSelect(e) {
    formSteps = [];
    initFormSteps();

    const card = e.target.parentNode;
    card.classList.add("selected");

    const homeYachtErrorMessage = document.querySelector(".error.home-yacht");
    homeYachtErrorMessage.classList.remove("active");

    if (card.id === "home-card") {
      homeYacht = "home";
      const homeStep = document.getElementById("home-form");
      formSteps.push(homeStep);
      const yachtCard = document.getElementById("yacht-card");
      yachtCard.classList.remove("selected");
    } else {
      homeYacht = "yacht";
      const yachtStep = document.getElementById("yacht-form");
      formSteps.push(yachtStep);
      const homeCard = document.getElementById("home-card");
      homeCard.classList.remove("selected");
    }

    const lastStep = document.querySelector("[data-last]");
    formSteps.push(lastStep);
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
      if (!homeYacht) {
        const homeYachtErrorMessage =
          document.querySelector(".error.home-yacht");
        homeYachtErrorMessage.classList.add("active");
        return;
      }
    }

    if (currentStep === 1 && incrementor > 0) {
      let itemSelected = false;
      for (let item in menuState) {
        if (menuState[item].quantity > 0) {
          itemSelected = true;
          break;
        }
      }

      if (!itemSelected) {
        const menuErrorMessage = document.querySelector(".error.menu");
        menuErrorMessage.classList.add("active");
        return;
      }

      const removeButtons = document.querySelectorAll(
        "[data-wf-cart-action='remove-item']"
      );
      removeButtons.forEach((button) => button.click());

      for (let item in menuState) {
        if (menuState[item].quantity > 0) {
          setTimeout(() => {
            menuState[item].addToCartButton.click();
          }, 1000);
        }
      }
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
    if (currentStep === formSteps.length - 1) {
      initForm();
      initReview();
    }
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
    const addToCartButtons = document.querySelectorAll(
      "[data-node-type='commerce-add-to-cart-button']"
    );

    menuItems.forEach((item, i) => {
      const name = item.querySelector(".menu-item-name").textContent;
      const input = quantityInputs[i];
      menuState[name] = {
        quantity: menuState[name]?.quantity || 0,
        input,
        addToCartButton: addToCartButtons[i],
      };
    });

    for (let dish in menuState) {
      menuState[dish].input.addEventListener("change", updateMenuState);
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

  function initReview() {
    const reviewInfo = document.querySelector(".review-info");
    // create review items for userInput items
    for (let item in userInput) {
      const reviewItem = document.createElement("div");
      reviewItem.classList.add("review-item");
      reviewItem.innerHTML = `
          <div class="review-item-name">${item}</div>
          <div class="review-item-value">${userInput[item]}</div>
      `;
      reviewInfo.appendChild(reviewItem);
    }

    // create review items for menuState items
    for (let item in menuState) {
      const quantity = menuState[item].quantity;
      if (quantity === 0) continue;
      const reviewItem = document.createElement("div");
      reviewItem.classList.add("review-item");
      reviewItem.innerHTML = `
          <div class="review-item-name">${item}</div>
          <div class="review-item-value">${quantity}</div>
      `;
      reviewInfo.appendChild(reviewItem);
    }
  }

  function showCurrentStep(incrementor) {
    formSteps[currentStep].style.display = "none";
    currentStep += incrementor;
    formSteps[currentStep].style.display = "block";
  }

  function updateMenuState(e) {
    const quantity = parseInt(e.target.value);
    const name = e.target
      .closest(".menu-item")
      .querySelector(".menu-item-name").textContent;
    menuState[name].quantity = quantity;
    sessionStorage.setItem("menuState", JSON.stringify(menuState));

    const menuErrorMessage = document.querySelector(".error.menu");
    menuErrorMessage.classList.remove("active");
  }
});
