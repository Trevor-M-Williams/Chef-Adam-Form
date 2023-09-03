Webflow.push(function () {
  const dev = 0;

  window.addEventListener("click", handleStepChange);
  window.addEventListener("resize", handleResize);

  let userInput = JSON.parse(sessionStorage.getItem("userInput")) || {};
  let menuState = JSON.parse(sessionStorage.getItem("menuState")) || {};

  let formSteps = [];
  let stepIndex = 0;
  let formFlow = ["service"];

  let isMobile = false;
  let isAnimating = false;
  const animationDuration = 400;

  const allSteps = document.querySelectorAll(".form-step");
  const contactInputWrappers = document.querySelectorAll(
    "[data-step='contact-info'] .input-wrapper"
  );
  const eventInputWrappers = document.querySelectorAll(
    "[data-step='event-info'] .input-wrapper"
  );

  let backButton;
  let nextButton;

  handleResize();
  initForm();

  function addLoader() {
    const loader = document.createElement("div");
    loader.className = "loader";

    const loaderIcon = document.createElement("div");
    loaderIcon.className = "loader-icon";

    loader.appendChild(loaderIcon);
    document.body.appendChild(loader);
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

  function handleFormResponse(type) {
    updateProgressBar(type);
    removeButtons();
    removeLoader();
    removeProgressBar();
    initFormMessage(type);

    const email = userInput["contact-info"]["email"];
    userInput["contact-info"]["email"] = email;

    sessionStorage.clear();
    sessionStorage.setItem("email", email);
  }

  function handleFormSubmission() {
    const form = document.querySelector(".order-form");
    const submitButton = form.querySelector("input[type='submit']");
    submitButton.click();

    hideReviewItems();
    removeButtons();
    addLoader();
    updateProgressBar("submit");

    const successElement = document.querySelector(".order-form-success");
    const errorElement = document.querySelector(".order-form-error");

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          const displayStyle = window
            .getComputedStyle(mutation.target)
            .getPropertyValue("display");

          if (mutation.target === successElement && displayStyle === "block") {
            handleFormResponse("success");
            observer.disconnect();
          }

          if (mutation.target === errorElement && displayStyle === "block") {
            handleFormResponse("error");
            observer.disconnect();
          }
        }
      });
    });

    const config = {
      attributes: true,
      attributeFilter: ["style"],
    };

    if (successElement) observer.observe(successElement, config);
    if (errorElement) observer.observe(errorElement, config);
  }

  function handleFormSubmissionDev() {
    const form = document.querySelector(".order-form");
    const formData = new FormData(form);
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    hideReviewItems();
    removeButtons();
    addLoader();
    updateProgressBar("submit");
    simulateResponse("success");
    // simulateResponse("error");

    function simulateResponse(type) {
      setTimeout(() => {
        updateProgressBar(type);
        removeLoader();
        removeProgressBar();
        initFormMessage(type);
      }, 1500);
    }
  }

  function handleInputs(property) {
    const inputs = formSteps[stepIndex].querySelectorAll("input, textarea");
    let allValid = [...inputs].every((input) => input.reportValidity());

    if (!allValid) return false;

    switch (property) {
      case "service-info":
        userInput["service-info"] = {
          service: userInput["service-info"]["service"],
          venue: userInput["service-info"]["venue"],
        };
        break;
      default:
        userInput[property] = {};
        break;
    }

    inputs.forEach((input) => {
      if (input.name === "additional-info") {
        userInput[input.name] = input.value;
        return;
      }
      if (input.type === "checkbox") {
        userInput[property][input.name] = input.checked;
      } else if (input.type === "radio") {
        if (input.checked) userInput[property][input.name] = input.value;
      } else {
        userInput[property][input.name] = input.value;
      }
    });

    if (property === "event-info") {
      const dateStr = userInput["event-info"]["date"];
      const timeStr = userInput["event-info"]["time"];
      const eventDate = new Date(`${dateStr}T${timeStr}:00`);
      const now = new Date();
      const diff = eventDate - now;
      const hours = Math.floor(diff / 1000 / 60 / 60);
      if (hours < 48) {
        showPopup("date");
        return false;
      }
    }

    sessionStorage.setItem("userInput", JSON.stringify(userInput));
    return true;
  }

  function handleMenuStep(menuType) {
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
        addToCartButton.click();
      }, i * 250 + 500);
      i++;
    }

    return true;
  }

  function handleResize() {
    if (window.innerWidth < 479) isMobile = true;

    if (isMobile) {
      backButton = document.querySelector("#back-button");
      nextButton = document.querySelector("#next-button");
    } else {
      backButton = document.querySelector("#back-arrow");
      nextButton = document.querySelector("#next-arrow");
    }
  }

  function handleServiceSelect(e) {
    if (isAnimating) return;

    const clickedOption = e.target.closest(".form-option");
    if (!clickedOption) return;

    const serviceOptions = document.querySelectorAll(
      ".service-options .form-option"
    );
    serviceOptions.forEach((option) => {
      if (option !== clickedOption) option.classList.remove("selected");
      else option.classList.add("selected");
    });

    const service = clickedOption.id;
    userInput["service-info"]["service"] = service;

    if (service !== "meal-plan") userInput["service-info"]["meal-plan"] = "";
    if (service === "performance-catering" || service === "meal-plan") {
      userInput["service-info"]["venue"] = "";
    }

    initFormSteps();
    updateStep(1);

    hideError();

    sessionStorage.setItem("userInput", JSON.stringify(userInput));
  }

  function handleStepChange(e) {
    if (isAnimating) return;

    let incrementor;

    if (e.target.matches("[data-next]") || e.target.closest("[data-next]")) {
      incrementor = 1;
    } else if (
      e.target.matches("[data-back]") ||
      e.target.closest("[data-back]")
    ) {
      incrementor = -1;
    }

    if (incrementor == null) return;
    if (incrementor < 0) {
      updateStep(incrementor);
      return;
    }

    if (stepIndex === 0 && !userInput["service-info"]["service"]) {
      showError("Please select a service");
      return;
    }

    const step = formFlow[stepIndex];
    switch (step) {
      case "venue":
        if (!userInput["service-info"]["venue"]) {
          showError("Please select a venue");
          return;
        }
        break;
      case "luxury-catering-menu":
        if (!handleMenuStep("luxury-catering-menu")) return;
        break;
      case "menu":
        break;
      case "meal-plan-pricing":
        if (!userInput["service-info"]["meal-plan"]) {
          showError("Please select a meal plan");
          return;
        }
        break;
      case "additional-info":
        const additionalInfoInput =
          formSteps[stepIndex].querySelector("textarea");
        userInput["additional-info"] = additionalInfoInput.value;
        sessionStorage.setItem("userInput", JSON.stringify(userInput));
        break;
      case "review":
        if (dev) handleFormSubmissionDev();
        else handleFormSubmission();
        return;
      default:
        if (!handleInputs(step)) return;
        break;
    }

    updateStep(incrementor);
  }

  function handleVenueSelect(e) {
    if (isAnimating) return;

    const clickedOption = e.target.closest(".form-option");
    if (!clickedOption) return;

    const venueOptions = document.querySelectorAll(
      ".venue-options .form-option"
    );
    venueOptions.forEach((option) => {
      if (option !== clickedOption) option.classList.remove("selected");
      else option.classList.add("selected");
    });

    let venue = clickedOption.id;
    userInput["service-info"]["venue"] = venue;

    hideError();
    updateStep(1);

    sessionStorage.setItem("userInput", JSON.stringify(userInput));
  }

  function hideError() {
    const errorMessage = document.querySelector(".error");
    errorMessage.classList.remove("active");
  }

  function hideReviewItems() {
    const formHeader = document.querySelector(".form-header");
    const formCardHeader = document.querySelector(".form-card-header");
    const reviewHeader = document.querySelector(".review-header");
    const reviewInfo = document.querySelector(".review-info");
    formHeader.style.opacity = "0";
    formCardHeader.style.display = "none";
    reviewHeader.style.display = "none";
    reviewInfo.style.display = "none";
  }

  function initMealPlanInfo() {
    const athleteInfoStep = document.querySelector(
      "[data-step='meal-plan-info']"
    );
    const inputs = athleteInfoStep.querySelectorAll("input, textarea");

    inputs.forEach((input) => {
      if (userInput["meal-plan-info"][input.name]) {
        if (input.type === "checkbox") {
          input.checked = userInput["meal-plan-info"][input.name];
        } else if (input.type === "radio") {
          if (input.value === userInput["meal-plan-info"][input.name])
            input.checked = true;
        } else input.value = userInput["meal-plan-info"][input.name];
      }
    });
  }

  function initContactInfo() {
    const contactInfoStep = document.querySelector(
      "[data-step='contact-info']"
    );
    contactInfoStep.innerHTML = "";

    const venue = userInput["service-info"]["venue"];
    let contactInputs;

    switch (venue) {
      case "home":
        contactInputs = ["name", "phone", "email"];
        break;
      case "yacht":
        contactInputs = ["poc-name", "poc-phone", "email"];
        break;
      default:
        contactInputs = ["name", "phone", "email"];
        break;
    }

    contactInputWrappers.forEach((wrapper) => {
      const input = wrapper.querySelector("input, textarea");
      if (contactInputs.includes(input.name)) {
        contactInfoStep.appendChild(wrapper);
        if (userInput["contact-info"][input.name]) {
          input.value = userInput["contact-info"][input.name];
        }
      }
    });
  }

  function initDevButtons() {
    const devButtons = document.createElement("div");
    devButtons.style.display = "flex";
    devButtons.style.gap = "5px";
    devButtons.style.position = "absolute";
    devButtons.style.bottom = "5px";
    devButtons.style.left = "5px";
    document.body.appendChild(devButtons);

    addDevButton("Refresh", refreshWindow);
    addDevButton("State", printState);
    addDevButton("Checkout", goToCheckout);
    addDevButton("Skip", skipToReview);

    function addDevButton(text, callback) {
      const button = document.createElement("button");
      button.textContent = text;
      button.addEventListener("click", callback);
      devButtons.appendChild(button);
    }

    function goToCheckout() {
      const checkoutLink = userInput["checkout-link"] || "/checkout";
      const win = window.open(checkoutLink, "_blank");
      win.focus();
    }

    function printState() {
      console.log(userInput);
      console.log(menuState);

      let itemSelected = false;
      for (let item in menuState["luxury-catering-menu"]) {
        if (menuState["luxury-catering-menu"][item].quantity > 0) {
          console.log(item, menuState["luxury-catering-menu"][item].quantity);
          itemSelected = true;
        }
      }
      if (!itemSelected) console.log("No items selected");
    }

    function refreshWindow() {
      sessionStorage.clear();
      window.location.reload();
    }

    function skipToReview() {
      const incrementor = formSteps.length - 1 - stepIndex;
      updateStep(incrementor);
    }
  }

  function initEventInfo() {
    let eventInfo;
    const service = userInput["service-info"]["service"];
    const venue = userInput["service-info"]["venue"];
    switch (service) {
      case "private-event":
        if (venue === "yacht")
          eventInfo = [
            "marina-address",
            "boat-name",
            "date",
            "time",
            "party-size",
          ];
        else eventInfo = ["address", "date", "time", "party-size"];
        break;
      case "luxury-catering":
        if (venue === "yacht")
          eventInfo = ["marina-address", "boat-name", "date", "time"];
        else eventInfo = ["address", "date", "time"];
        break;
      case "performance-catering":
        eventInfo = ["address", "date", "time"];
        break;
      default:
        break;
    }

    const eventInfoDiv = document.querySelector(".event-info");
    eventInfoDiv.innerHTML = "";

    eventInputWrappers.forEach((wrapper) => {
      const input = wrapper.querySelector("input, textarea");
      if (eventInfo.includes(input.name)) {
        eventInfoDiv.appendChild(wrapper);
        if (userInput["event-info"][input.name]) {
          input.value = userInput["event-info"][input.name];
        }

        if (input.name === "date") {
          const date = new Date();
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");

          input.min = `${year}-${month}-${day}`;
        }
      }
    });
  }

  function initForm() {
    if (!userInput["meal-plan-info"]) userInput["meal-plan-info"] = {};
    if (!userInput["contact-info"]) userInput["contact-info"] = {};
    if (!userInput["event-info"]) userInput["event-info"] = {};
    if (!userInput["service-info"]) userInput["service-info"] = {};

    if (!menuState["luxury-catering-menu"])
      menuState["luxury-catering-menu"] = {};
    if (!menuState["performance-catering-menu"])
      menuState["performance-catering-menu"] = {};

    const formOptionImages = document.querySelectorAll(".form-option-image");
    formOptionImages.forEach((image) => {
      image.draggable = false;
    });

    const formIcons = document.querySelectorAll(".form-icon");
    formIcons.forEach((image) => {
      image.draggable = false;
    });

    initFormSteps();
    initServiceOptions();
    updateStep(0);

    if (dev) {
      initDevButtons();
      // initLogModal();
    }

    const safariMobile = isSafariMobile();
    if (safariMobile) {
      document.body.style.overflow = "hidden";
    }

    // initialize user service selection
    const serviceLink = sessionStorage.getItem("serviceLink");
    if (serviceLink) {
      const serviceOption = document.querySelector(`#${serviceLink}`);
      serviceOption.classList.add("selected");
      userInput["service-info"]["service"] = serviceLink;
      sessionStorage.removeItem("serviceLink");
    } else if (userInput["service-info"]["service"]) {
      const service = userInput["service-info"]["service"];
      const serviceOption = document.querySelector(`#${service}`);
      serviceOption.classList.add("selected");
    }

    // scroll to selection
    if (userInput["service-info"]["service"]) {
      const serviceStep = document.querySelector("[data-step='service']");
      const service = userInput["service-info"]["service"];
      const serviceOption = document.querySelector(`#${service}`);
      const scrollAmount = serviceOption.offsetTop - 100;
      serviceStep.scrollTo(0, scrollAmount);
    }

    const styleElement = document.createElement("style");
    document.head.appendChild(styleElement);
    styleElement.innerHTML = `
      .w-webflow-badge {
        display: none !important;
      }

      .button:focus {
        outline: none;
        box-shadow: 0 0 0 1px #aaf;
      }

      .order-form-success,
      .order-form-error {
        transition: opacity 500ms ease-in-out 500ms;
      }
          
      .form-step {
        transition: transform ${animationDuration}ms ease-in-out;
      }

      .button.disabled {
        pointer-events: none;
        opacity: 0.5;
      }

      .button.hidden {
        pointer-events: none;
        opacity: 0 !important;
      }

      .form-card .button.is-secondary {
        opacity: 1;
      }

      .loader {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 100;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      
      .loader-icon {
        width: 5rem;
        height: 5rem;
        border-radius: 50%;
        border: 0.25rem solid #fff;
        border-top: 0.25rem solid #000;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .modal {
        display: none;
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
      }
      
      .modal-content {
        position: absolute;
        top: 10vh;
        left: 5vw;
        background-color: #fff;
        padding: 0.5rem;
        height: 80vh;
        width: 90vw;
      }
      
      #open-log-modal {
        position: fixed;
        bottom: 5px;
        left: 5px;
      }

      .close {
        cursor: pointer;
      }
  `;

    function isSafariMobile() {
      const chromeAgent =
        navigator.userAgent.indexOf("Chrome") > -1 ||
        navigator.userAgent.indexOf("CriOS") > -1;
      const safariAgent = navigator.userAgent.indexOf("Safari") > -1;

      return safariAgent && !chromeAgent && window.innerWidth < 991;
    }
  }

  function initFormMessage(type) {
    const reviewStep = document.querySelector("[data-step='review']");

    switch (type) {
      case "success":
        const service = userInput["service-info"]["service"];

        const successMessageText = {
          "private-event":
            "Your order has been received! Adam will be in touch shortly to help craft your event menu.",
          "luxury-catering":
            "Your order has been received! You can now proceed to checkout.",
          "performance-catering":
            "Your order has been received! Adam will be in touch shortly to help craft your menu.",
          "meal-plan":
            "Your order has been received! Please proceed to checkout.",
        };
        const successButtonText = {
          "private-event": "Home",
          "luxury-catering": "Checkout",
          "performance-catering": "Home",
          "meal-plan": "Checkout",
        };
        const successButtonLinks = {
          "private-event": "/",
          "luxury-catering": "/checkout",
          "performance-catering": "/",
          "meal-plan": userInput["checkout-link"],
        };

        const successElement = document.querySelector(".order-form-success");
        const successMessage = document.querySelector(".order-form-message");
        const successButton = document.querySelector("#success-button");

        reviewStep.style.marginTop = "2rem";
        successElement.style.display = "block";

        if (dev) {
          setTimeout(() => {
            successElement.style.opacity = 1;
          }, 25);
        } else {
          successElement.style.opacity = 1;
        }

        successMessage.textContent = successMessageText[service];
        successButton.textContent = successButtonText[service];
        successButton.href = successButtonLinks[service];

        break;
      case "error":
        const errorElement = document.querySelector(".order-form-error");
        reviewStep.style.marginTop = "2rem";
        errorElement.style.display = "block";

        if (dev) {
          setTimeout(() => {
            errorElement.style.opacity = 1;
          }, 25);
        } else {
          errorElement.style.opacity = 1;
        }

        break;
      default:
        break;
    }
  }

  function initFormSteps() {
    const formFlows = {
      "private-event": [
        "service",
        "venue",
        "contact-info",
        "event-info",
        "private-event-menu",
        "additional-info",
        "review",
      ],
      "luxury-catering": [
        "service",
        "venue",
        "contact-info",
        "event-info",
        "luxury-catering-menu",
        "additional-info",
        "review",
      ],
      "performance-catering": [
        "service",
        "contact-info",
        "event-info",
        "performance-catering-menu",
        "additional-info",
        "review",
      ],
      "meal-plan": [
        "service",
        "contact-info",
        "meal-plan-info",
        "meal-plan-pricing",
        "review",
      ],
    };

    const service = userInput["service-info"]["service"];
    if (service) formFlow = formFlows[service];

    const formStepWrapper = document.querySelector(".form-step-wrapper");
    while (formStepWrapper.children.length > 1) {
      formStepWrapper.removeChild(formStepWrapper.lastChild);
    }

    formSteps = [];
    formFlow.forEach((step) => {
      const stepElement = [...allSteps].find(
        (element) => element.dataset.step === step
      );
      formSteps.push(stepElement);
      if (step === "service") return; // skip service step
      formStepWrapper.appendChild(stepElement);
    });
  }

  function initLogModal() {
    const logModal = document.createElement("div");
    logModal.id = "logModal";
    logModal.className = "modal";

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    const closeModalBtn = document.createElement("span");
    closeModalBtn.className = "close";
    closeModalBtn.innerHTML = "&times;";

    const logContainer = document.createElement("pre");
    logContainer.id = "logContainer";

    modalContent.appendChild(closeModalBtn);
    modalContent.appendChild(logContainer);
    logModal.appendChild(modalContent);
    document.body.appendChild(logModal);

    const openLogModalBtn = document.createElement("button");
    openLogModalBtn.id = "open-log-modal";
    openLogModalBtn.textContent = "Log";
    document.body.appendChild(openLogModalBtn);

    openLogModalBtn.addEventListener("click", () => {
      logModal.style.display = "block";
    });

    closeModalBtn.addEventListener("click", () => {
      logModal.style.display = "none";
    });

    window.logToModal = function (msgOrElement) {
      let logText;
      if (typeof msgOrElement === "string") {
        logText = document.createTextNode(msgOrElement + "\n");
      } else if (msgOrElement instanceof HTMLElement) {
        let styles = window.getComputedStyle(msgOrElement);
        let attributes = msgOrElement.attributes;

        let styleInfo = "Styles:\n";
        for (let prop of styles) {
          styleInfo += `${prop}: ${styles.getPropertyValue(prop)}\n`;
        }

        let attributeInfo = "Attributes:\n";
        for (let attr of attributes) {
          attributeInfo += `${attr.name}=${attr.value}\n`;
        }

        logText = document.createTextNode(
          `Element: ${msgOrElement.tagName}\n${styleInfo}\n${attributeInfo}\n`
        );
      }

      if (logText) {
        const logContainer = document.getElementById("logContainer");
        logContainer.appendChild(logText);
      }
    };
  }

  function initMealPlanPricing() {
    const mealPlanUrls = [
      "https://buy.stripe.com/3csdRNegV3YogAU00u",
      "https://buy.stripe.com/3cs6pl4Gl1Qg0BW00t",
      "https://buy.stripe.com/5kAcNJ3Ch9iI3O86oQ",
    ];

    const pricingStep = document.querySelector(
      "[data-step='meal-plan-pricing']"
    );
    const mealPlanOptions = pricingStep.querySelectorAll(".form-option");

    const eventHandlers = [];

    mealPlanOptions.forEach((option, i) => {
      option.id = `meals-${(i + 1) * 5}`;

      const handler = (e) => handlePlanSelect(e, i);
      eventHandlers[i] = handler;
      if (eventHandlers[i]) {
        option.removeEventListener("click", eventHandlers[i]);
      }

      option.addEventListener("click", handler);
    });

    // initialize user meal plan selection
    const mealPlanLink = sessionStorage.getItem("mealPlanLink");
    if (mealPlanLink) {
      const mealPlanOption = document.querySelector(`#${mealPlanLink}`);
      mealPlanOption.classList.add("selected");
      userInput["service-info"]["meal-plan"] = mealPlanLink;
      sessionStorage.removeItem("mealPlanLink");
    } else if (userInput["service-info"]["meal-plan"]) {
      const mealPlan = userInput["service-info"]["meal-plan"];
      const mealPlanOption = document.querySelector(`#meals-${mealPlan}`);
      mealPlanOption.classList.add("selected");
    }

    //initialize custom meal plan link
    const customMealPlanLink = pricingStep.querySelector(".phone-link");
    customMealPlanLink.onclick = () => {
      showPopup("meal-plan");
    };

    function handlePlanSelect(e, i) {
      if (isAnimating) return;

      const clickedOption = e.target.closest(".form-option");
      if (!clickedOption) return;

      hideError();

      mealPlanOptions.forEach((option) => {
        if (option !== clickedOption) option.classList.remove("selected");
        else option.classList.add("selected");
      });

      const mealPlan = clickedOption
        .querySelector(".meal-plan-text")
        .textContent.toLowerCase()
        .replace("meals", "")
        .trim();
      const mealPlanUrl = mealPlanUrls[i];
      userInput["service-info"]["meal-plan"] = mealPlan;
      userInput["checkout-link"] = mealPlanUrl;

      updateStep(1);

      sessionStorage.setItem("userInput", JSON.stringify(userInput));
    }
  }

  function initMenu(menuType) {
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

    menuItems.forEach((item, i) => {
      const name = item.querySelector(".menu-item-name").textContent;
      let price = item.querySelector(".menu-item-price").textContent;
      price = price
        .replace("$", "")
        .replace(".00", "")
        .replace("USD", "")
        .trim();
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
      menuState[menuType][dish].input.value =
        menuState[menuType][dish].quantity;
      menuState[menuType][dish].input.min = 0;
    }
  }

  function initOrderForm() {
    const form = document.querySelector(".order-form");
    form.innerHTML = `
      <input
        type="submit"
        value="Submit"
        data-wait="Please wait..."
        class="w-button"
      />
    `;

    let infoCategories = ["service-info", "contact-info", "event-info"];
    if (userInput["service-info"]["service"] === "meal-plan") {
      infoCategories = ["service-info", "contact-info", "meal-plan-info"];
    }

    for (let category in infoCategories) {
      const info = userInput[infoCategories[category]];
      for (let item in info) {
        addInput(item, info[item]);
      }
    }

    if (userInput["service-info"]["service"] === "luxury-catering") {
      for (let item in menuState["luxury-catering-menu"]) {
        if (item === "total") {
          addInput(item, menuState["luxury-catering-menu"][item]);
          continue;
        }
        const quantity = menuState["luxury-catering-menu"][item].quantity;
        addInput(item, quantity);
      }
    }

    addInput("additional-info", userInput["additional-info"]);

    function addInput(name, value) {
      const input = document.createElement("input");
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }
  }

  function initReview() {
    const reviewInfo = document.querySelector(".review-info");
    const serviceHeader = document.querySelector(".review-header");
    serviceHeader.onclick = () => handleSectionClick("service");
    const serviceElement = document.querySelector(
      ".review-header .review-item-value"
    );
    const service = userInput["service-info"]["service"];
    let serviceText = service.replaceAll("-", " ");
    if (serviceText === "meal plan") {
      const mealPlan = userInput["service-info"]["meal-plan"];
      serviceText = serviceText + ` (${mealPlan} meals/week)`;
    }
    serviceElement.textContent = serviceText;
    serviceElement.classList.add("capitalize");

    reviewInfo.innerHTML = "";

    initContactSection();

    if (service === "meal-plan") initMealPlanSection();
    else initEventSection();

    if (service === "luxury-catering") initMenuSection();

    if (userInput["additional-info"]) initAdditionalSection();

    if (!isMobile) initSubmitButton();

    function initSubmitButton() {
      const submitButton = document.createElement("input");
      submitButton.onclick = handleFormSubmission;
      submitButton.value = "Submit";
      submitButton.classList.add("button", "w-button");
      reviewInfo.appendChild(submitButton);
    }

    function initAdditionalSection() {
      const additionalSection = document.createElement("div");
      additionalSection.classList.add("review-section");
      additionalSection.onclick = () => handleSectionClick("additional-info");
      reviewInfo.appendChild(additionalSection);

      const additionalTitle = document.createElement("div");
      additionalTitle.classList.add("label");
      additionalTitle.textContent = "Additional Info:";
      additionalSection.appendChild(additionalTitle);

      const additionalInfo = userInput["additional-info"];
      const reviewItem = document.createElement("div");
      reviewItem.classList.add("review-item");
      reviewItem.textContent = additionalInfo;
      additionalSection.appendChild(reviewItem);
    }

    function initMealPlanSection() {
      const athleteSection = document.createElement("div");
      athleteSection.classList.add("review-section");
      athleteSection.onclick = () => handleSectionClick("meal-plan-info");
      reviewInfo.appendChild(athleteSection);

      const athleteTitle = document.createElement("div");
      athleteTitle.classList.add("label");
      athleteTitle.textContent = "Your Profile";
      athleteSection.appendChild(athleteTitle);

      const athleteInfo = userInput["meal-plan-info"];
      for (let item in athleteInfo) {
        const reviewItem = document.createElement("div");
        const label = item.replaceAll("-", " ");
        let value = athleteInfo[item];
        if (typeof value === "string") value = value.replaceAll("-", " ");
        if (!value || item === "notice-confirmation") continue;
        reviewItem.classList.add("review-item");
        reviewItem.innerHTML = `
            <div class="review-item-name">${label}:</div>
            <div class="review-item-value capitalize">${value}</div>
        `;
        athleteSection.appendChild(reviewItem);
      }
    }

    function initContactSection() {
      const contactSection = document.createElement("div");
      contactSection.classList.add("review-section");
      contactSection.onclick = () => handleSectionClick("contact-info");
      reviewInfo.appendChild(contactSection);

      const contactTitle = document.createElement("div");
      contactTitle.classList.add("label");
      contactTitle.textContent = "Contact Info:";
      contactSection.appendChild(contactTitle);

      const contactInfo = userInput["contact-info"];

      for (let item in contactInfo) {
        const reviewItem = document.createElement("div");
        const label = item.replaceAll("-", " ");
        let value = contactInfo[item];
        if (item === "phone" || item === "poc-phone") {
          value = formatPhone(value);
        }
        reviewItem.classList.add("review-item");
        reviewItem.innerHTML = `
            <div class="review-item-name">${label}:</div>
            <div class="review-item-value">${value}</div> 
        `;
        contactSection.appendChild(reviewItem);
      }
    }

    function initEventSection() {
      const eventSection = document.createElement("div");
      eventSection.classList.add("review-section");
      eventSection.onclick = () => handleSectionClick("event-info");
      reviewInfo.appendChild(eventSection);

      const eventTitle = document.createElement("div");
      eventTitle.classList.add("label");
      eventTitle.textContent = "Event:";
      eventSection.appendChild(eventTitle);

      const eventInfo = userInput["event-info"];
      for (let item in eventInfo) {
        if (item === "event" || item === "venue") continue;
        const reviewItem = document.createElement("div");
        let label = item.replaceAll("-", " ");
        if (label === "address" && eventInfo["venue"] === "yacht") {
          label = "Marina Address";
        }
        let value = eventInfo[item];
        if (item === "date") value = formatDate(value);
        if (item === "time") value = formatTime(value);
        reviewItem.classList.add("review-item");
        reviewItem.innerHTML = `
          <div class="review-item-name">${label}:</div>
          <div class="review-item-value capitalize">${value}</div>
      `;
        eventSection.appendChild(reviewItem);
      }
    }

    function initMenuSection() {
      const menuSection = document.createElement("div");
      menuSection.classList.add("review-section");
      menuSection.onclick = () => handleSectionClick("luxury-catering-menu");
      reviewInfo.appendChild(menuSection);

      const foodTitle = document.createElement("div");
      foodTitle.classList.add("label");
      foodTitle.textContent = "Food:";
      menuSection.appendChild(foodTitle);

      for (let item in menuState["luxury-catering-menu"]) {
        if (item === "total") continue;
        const quantity = menuState["luxury-catering-menu"][item].quantity;
        if (quantity === 0) continue;

        const price = menuState["luxury-catering-menu"][item].price;

        const reviewItem = document.createElement("div");
        reviewItem.classList.add("review-item");
        reviewItem.innerHTML = `
          <div class="review-flex">
            <div class="menu-item-value">${quantity}</div>
            <div class="review-item-name">${item}</div>
          </div>
          <div class="dotted-line"></div>
          <div class="review-item-price">$${quantity * price}</div>
      `;
        menuSection.appendChild(reviewItem);
      }

      const total = document.createElement("div");
      total.classList.add("review-item", "total");
      total.innerHTML = `
        <div class="label total">Total:</div>
        <div class="dotted-line"></div>
        <div class="review-item-price total">$${menuState["luxury-catering-menu"].total}</div>
      `;
      menuSection.appendChild(total);
    }

    function handleSectionClick(section) {
      const additionalInfoStep = formSteps.find(
        (step) => step.dataset.step === section
      );

      const newStepIndex = formSteps.indexOf(additionalInfoStep);
      const incrementor = newStepIndex - stepIndex;
      updateStep(incrementor);
    }

    function formatDate(date) {
      const [year, month, day] = date.split("-").map(Number);
      const formattedDate = `${month}/${day}/${year}`;
      return formattedDate;
    }

    function formatPhone(phone) {
      phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
      return phone;
    }

    function formatTime(time) {
      const [hours, minutes] = time.split(":").map(Number);
      const period = hours < 12 ? "AM" : "PM";
      let hours12 = hours % 12;
      if (hours12 === 0) {
        hours12 = 12;
      }
      const formattedTime = `${hours12}:${
        minutes < 10 ? "0" + minutes : minutes
      } ${period}`;
      return formattedTime;
    }
  }

  function initServiceOptions() {
    const serviceOptions = document.querySelectorAll(
      ".service-options .form-option"
    );
    serviceOptions.forEach((option) => {
      option.tabIndex = 0;
      option.addEventListener("click", handleServiceSelect);
    });
  }

  function initVenueOptions() {
    const venueOptions = document.querySelectorAll(
      ".venue-options .form-option"
    );

    venueOptions.forEach((option) => {
      option.tabIndex = 0;
      option.addEventListener("click", handleVenueSelect);
    });

    // initialize user venue selection
    const venue = userInput["service-info"]["venue"] || null;
    if (!venue) {
      venueOptions.forEach((option) => {
        option.classList.remove("selected");
      });
      return;
    }
    const venueOption = document.querySelector(`#${venue}`);
    venueOption.classList.add("selected");

    // scroll to venue selection
    const venueStep = document.querySelector("[data-step='venue']");
    const scrollAmount = venueOption.offsetTop - 100;
    venueStep.scrollTo(0, scrollAmount);
  }

  function removeButtons() {
    const formButtons = document.querySelector(".form-button-group");
    formButtons.style.display = "none";
  }

  function removeLoader() {
    const loader = document.querySelector(".loader");
    if (loader) {
      loader.style.transition = `opacity 500ms ease-in-out`;
      loader.style.opacity = 0;
      setTimeout(() => {
        document.body.removeChild(loader);
      }, 500);
    }
  }

  function removeProgressBar() {
    const formProgress = document.querySelector(".form-progress");
    formProgress.style.transition = `opacity 500ms ease-in-out`;
    formProgress.style.opacity = 0;
  }

  function showError(error) {
    const errorMessage = document.querySelector(".error");
    errorMessage.innerHTML = error;
    errorMessage.classList.add("active");
  }

  function showPopup(type) {
    const popup = document.querySelector(".form-popup");
    popup.style.display = "flex";
    const textDivs = popup.querySelectorAll(`.form-popup-text`);
    textDivs.forEach((div) => {
      if (div.classList.contains(type)) div.style.display = "block";
      else div.style.display = "none";
    });
  }

  function updateButtons() {
    backButton.classList.add("disabled");
    nextButton.classList.add("disabled");

    setTimeout(() => {
      backButton.classList.remove("disabled");
      nextButton.classList.remove("disabled");
    }, 250);

    if (stepIndex === 0) {
      backButton.classList.add("hidden");
    } else {
      backButton.classList.remove("hidden");
    }

    if (isMobile) {
      if (formFlow[stepIndex] === "review") {
        nextButton.textContent = "Submit";
      } else {
        nextButton.textContent = "Next";
      }
    } else {
      if (formFlow[stepIndex] === "review") {
        nextButton.style.opacity = 0;
        nextButton.style.pointerEvents = "none";
      } else {
        nextButton.style.opacity = 1;
        nextButton.style.pointerEvents = "auto";
      }
    }
  }

  function updateHeader() {
    const formTitle = document.querySelector(".form-title");
    const formSubtitle = document.querySelector(".form-subtitle");
    const venue = userInput["service-info"]["venue"];
    const step = formFlow[stepIndex];

    const titles = {
      service: "What brings you in?",
      venue: "Where will your event be held?",
      ["luxury-catering-menu"]: "Luxury Catering Menu",
      ["performance-catering-menu"]: "Performance Catering Menu",
      ["private-event-menu"]: "Menu",
      ["contact-info"]: "Contact Information",
      ["event-info"]: "Event Information",
      ["meal-plan-info"]: "Your Profile",
      ["meal-plan-pricing"]: "Meal Plan Options",
      ["additional-info"]: "Additional information",
      review: "Review",
    };
    formTitle.textContent = titles[step];

    const subtitles = {
      service: "Select the service you're interested in.",
      venue: "Select the venue for your event.",
      ["luxury-catering-menu"]: `
        <div>View the full menu <a href="/menus/luxury-catering" style="color:#0af" target="_blank">here</a>.</div>
      `,
      ["performance-catering-menu"]: "Scroll click or tap to view our menu.",
      ["private-event-menu"]: "Scroll click or tap to view our menu.",
      ["contact-info"]:
        venue === "home"
          ? "Let us know a bit about you."
          : "Who should we conact to coordinate delivery?",
      ["event-info"]: "Tell us more about the event.",
      ["meal-plan-info"]: "Enter your information to build out your meal plan.",
      ["meal-plan-pricing"]: "Select your meal plan.",
      ["additional-info"]: "Tell us a little more about your event.",
      review: "Click/Tap a section to make changes.",
    };
    formSubtitle.innerHTML = subtitles[step];
  }

  function updateMenuState(e, menuType) {
    const quantity = parseInt(e.target.value);
    const menuItem = e.target.closest(".menu-item");
    const name = menuItem.querySelector(".menu-item-name").textContent;

    if (quantity === NaN) {
      e.target.value = 0;
      return;
    } else if (quantity > 0) menuItem.classList.add("selected");
    else menuItem.classList.remove("selected");

    menuState[menuType][name].quantity = quantity;

    const total = calculateTotal(menuType);
    menuState[menuType].total = total;
    sessionStorage.setItem("menuState", JSON.stringify(menuState));

    hideError();
  }

  function updateProgressBar(state) {
    const progressBar = document.querySelector(".form-progress-bar");

    switch (state) {
      case "submit":
        progressBar.style.transition = "width 5000ms ease";
        progressBar.style.width = `95%`;
        return;
      case "success":
        progressBar.style.transition = "width 500ms ease-in-out";
        progressBar.style.width = `100%`;
        return;
      case "error":
        progressBar.style.transition = "width 500ms ease-in-out";
        progressBar.style.width = `0%`;
        return;
      default:
        break;
    }

    const totalSteps = formSteps.length;
    const completedSteps = stepIndex;
    const progressPercentage = (completedSteps / totalSteps) * 100;
    progressBar.style.transition = `width ${animationDuration}ms ease-in-out`;
    progressBar.style.width = `${progressPercentage}%`;
  }

  function updateStep(incrementor) {
    hideError();

    if (incrementor) {
      isAnimating = true;
      setTimeout(() => {
        isAnimating = false;
      }, animationDuration);

      const oldStep = formSteps[stepIndex];
      const newStep = formSteps[stepIndex + incrementor];

      newStep.style.visibility = "visible";
      setTimeout(() => {
        oldStep.style.visibility = "hidden";
      }, animationDuration);
    }

    stepIndex += incrementor;

    setTimeout(() => {
      formSteps.forEach((step) => {
        step.style.transform = `translateX(${stepIndex * -100}%)`;
      });
    }, 25);

    updateProgressBar();
    updateHeader();
    updateButtons();

    if (stepIndex === 0) return;

    const step = formFlow[stepIndex];
    switch (step) {
      case "venue":
        initVenueOptions();
        break;
      case "luxury-catering-menu":
        initMenu("luxury-catering-menu");
        break;
      case "contact-info":
        initContactInfo();
        break;
      case "event-info":
        initEventInfo();
        break;
      case "meal-plan-info":
        initMealPlanInfo();
        break;
      case "meal-plan-pricing":
        initMealPlanPricing();
        break;
      case "review":
        initOrderForm();
        initReview();
        break;
      default:
        break;
    }
  }
});
