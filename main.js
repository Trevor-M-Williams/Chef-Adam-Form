Webflow.push(function () {
  window.addEventListener("click", handleStepChange);
  window.addEventListener("resize", initButtons);

  let userInput = JSON.parse(sessionStorage.getItem("userInput")) || {};
  let menuState = JSON.parse(sessionStorage.getItem("menuState")) || {};

  let formSteps = [];
  let stepIndex = 0;
  let formFlow = ["service"];
  let isAnimating = false;
  const animationDuration = 400;
  const allSteps = document.querySelectorAll(".form-step");

  let backButton;
  let nextButton;

  initButtons();
  initForm();

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

    const option = clickedOption.id;
    userInput["service-info"]["service"] = option;
    formFlow = formFlows[option];
    initFormSteps();
    setTimeout(() => {
      updateStep(1);
    }, 25);

    hideError();
  }

  function initButtons() {
    if (window.innerWidth > 479) {
      backButton = document.querySelector("#back-arrow");
      nextButton = document.querySelector("#next-arrow");
    } else {
      backButton = document.querySelector("#back-button");
      nextButton = document.querySelector("#next-button");
    }
  }

  function handleFormError() {
    let errorBlock = document.querySelector(".order-form-error");
    errorBlock.style.opacity = 1;

    const formProgress = document.querySelector(".form-progress");
    const formButtons = document.querySelector(".form-button-group");
    formProgress.style.display = "none";
    formButtons.style.display = "none";
  }

  function handleFormSuccess() {
    const progressBar = document.querySelector(".form-progress-bar");
    progressBar.style.width = `100%`;

    const formButtons = document.querySelector(".form-button-group");
    formButtons.style.display = "none";

    let successBlock = document.querySelector(".order-form-success");
    let successMessage = document.querySelector(".order-form-message");
    let successButton = document.querySelector("#success-button");

    switch (userInput["service-info"]["service"]) {
      case "private-event":
        console.log("Adam will be in touch");
        successBlock.style.opacity = 1;
        successMessage.textContent =
          "Thank you for your order! Adam will be in touch shortly to help craft your event menu.";
        successBlock.appendChild(homeButton);
        break;
      case "luxury-catering":
        setTimeout(() => {
          window.location.href = "/checkout";
        }, 750);
        break;
      case "performance-catering":
        setTimeout(() => {
          window.location.href = "/checkout";
        }, 750);
        break;
      case "meal-plan":
        console.log("Push to stripe page");
        successBlock.style.opacity = 1;
        successMessage.textContent =
          "Your order has been received! Please proceed to checkout.";
        successButton.textContent = "Checkout";
        successButton.onclick = () => {
          const checkoutLink = userInput["checkout-link"] || "/checkout";
          const win = window.open(checkoutLink, "_blank");
          win.focus();
        };
        break;
      default:
        break;
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
        showError("For events within 48 hours, please call 954-406-1375");
        return false;
      }
    }

    sessionStorage.setItem("userInput", JSON.stringify(userInput));
    return true;
  }

  function handleMenuStep(menuType) {
    let itemSelected = false;
    for (const key in menuState[menuType]) {
      if (menuState[menuType][key].quantity > 0) {
        itemSelected = true;
        break;
      }
    }

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
        handleSubmit();
        return;
      default:
        if (!handleInputs(step)) return;
        break;
    }

    updateStep(incrementor);
  }

  function handleSubmit() {
    const form = document.querySelector(".order-form");
    const submitButton = form.querySelector("input[type='submit']");
    submitButton.click();

    // console.log(form);

    const formHeader = document.querySelector(".form-card-header");
    const reviewHeader = document.querySelector(".review-header");
    const reviewInfo = document.querySelector(".review-info");
    formHeader.style.display = "none";
    reviewHeader.style.display = "none";
    reviewInfo.style.display = "none";

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
            handleFormSuccess();
            observer.disconnect();
          }

          if (mutation.target === errorElement && displayStyle === "block") {
            handleFormError();
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

    if (venue === "yacht") {
      formFlow = formFlow.map((step) => {
        if (step === "contact-info") return "yacht-contact-info";
        return step;
      });
    } else {
      formFlow = formFlow.map((step) => {
        if (step === "yacht-contact-info") return "contact-info";
        return step;
      });
    }

    initFormSteps();
    hideError();
    setTimeout(() => {
      updateStep(1);
    }, 25);
  }

  function hideError() {
    const errorMessage = document.querySelector(".error");
    errorMessage.classList.remove("active");
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

    function addDevButton(text, callback) {
      const button = document.createElement("button");
      button.textContent = text;
      button.addEventListener("click", callback);
      devButtons.appendChild(button);
    }

    function refreshWindow() {
      sessionStorage.clear();
      window.location.reload();
    }

    function printState() {
      console.log(userInput);
      console.log(menuState);

      let itemSelected = false;
      for (let item in menuState) {
        if (menuState[item].quantity > 0) {
          console.log(item, menuState[item].quantity);
          itemSelected = true;
        }
      }
      if (!itemSelected) console.log("No items selected");
    }

    function goToCheckout() {
      const checkoutLink = userInput["checkout-link"] || "/checkout";
      const win = window.open(checkoutLink, "_blank");
      win.focus();
    }
  }

  function initAthleteInfo() {
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

  function initContactInfo(type) {
    let contactInfoStep = document.querySelector("[data-step='contact-info']");
    if (type === "yacht") {
      contactInfoStep = document.querySelector(
        "[data-step='yacht-contact-info']"
      );
    }
    const inputs = contactInfoStep.querySelectorAll("input, textarea");

    inputs.forEach((input) => {
      if (userInput["contact-info"][input.name])
        input.value = userInput["contact-info"][input.name];
    });
  }

  function initEventInfo() {
    const eventInfoStep = document.querySelector("[data-step='event-info']");

    let eventInfo;
    switch (userInput["service-info"]["service"]) {
      case "private-event":
        if (userInput["service-info"]["venue"] === "yacht")
          eventInfo = privateEventInfoYacht;
        else eventInfo = privateEventInfo;
        break;
      case "luxury-catering":
        if (userInput["service-info"]["venue"] === "yacht")
          eventInfo = luxuryCateringInfoYacht;
        else eventInfo = luxuryCateringInfo;
        break;
      case "performance-catering":
        eventInfo = performanceCateringInfo;
        break;
      default:
        break;
    }

    eventInfoStep.innerHTML = "";

    eventInfo.forEach((item) => {
      const inputWrapper = document.createElement("div");
      inputWrapper.classList.add("input-wrapper");
      eventInfoStep.appendChild(inputWrapper);

      const label = document.createElement("label");
      label.classList.add("label");
      label.textContent = item.label;
      label.for = item.name;
      inputWrapper.appendChild(label);

      const input = document.createElement("input");
      if (input.type !== "date") input.classList.add("input", "w-input");
      input.type = item.type;
      if (item.type === "date") {
        input.min = new Date().toISOString().split("T")[0];
        input.style.width = "100% !important";
      }
      input.name = item.name;
      input.required = true;
      inputWrapper.appendChild(input);

      if (userInput["event-info"][item.name])
        input.value = userInput["event-info"][item.name];
    });
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

  function initForm() {
    const safariMobile = isSafariMobile();
    logToModal(safariMobile);
    if (safariMobile) {
      document.body.overflow = "hidden";
    }

    if (!userInput["meal-plan-info"]) userInput["meal-plan-info"] = {};
    if (!userInput["contact-info"]) userInput["contact-info"] = {};
    if (!userInput["event-info"]) userInput["event-info"] = {};
    if (!userInput["service-info"]) userInput["service-info"] = {};
    userInput["service-info"]["service"] = "";
    userInput["service-info"]["venue"] = "";
    userInput["service-info"]["meal-plan"] = "";

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
    updateStep(stepIndex);

    // DEV ONLY!
    // initDevButtons();
    initLogModal();

    const serviceLink = sessionStorage.getItem("serviceLink");
    if (serviceLink) {
      const serviceOption = document.querySelector(`#${serviceLink}`);
      setTimeout(() => {
        serviceOption.click();
      }, 250);
    }

    const mealPlanLink = sessionStorage.getItem("mealPlanLink");
    if (mealPlanLink) userInput["service-info"]["meal-plan"] = mealPlanLink;
    else userInput["service-info"]["meal-plan"] = "";

    const styleElement = document.createElement("style");
    document.head.appendChild(styleElement);
    styleElement.innerHTML = `     
      .form-step {
        transition: transform ${animationDuration}ms ease-in-out;
      }

      .w-webflow-badge {
        display: none !important;
      }

      .meal-plan-pricing-option {
        cursor: pointer;
        user-select: none;
      }

      .modal {
        display: none;
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
      }
      
      .modal-content {
        position: absolute;
        top: 5vh;
        left: 5vw;
        background-color: #fff;
        padding: 0.5rem;
        height: 90vh;
        width: 90vw;
      }
      
      .close {
        cursor: pointer;
      }
  `;

    function isSafariMobile() {
      const chromeAgent = navigator.userAgent.indexOf("Chrome") > -1;
      const safariAgent = navigator.userAgent.indexOf("Safari") > -1;

      return safariAgent && !chromeAgent && window.innerWidth < 479;
    }
  }

  function initFormSteps() {
    formSteps = [];

    const formStepWrapper = document.querySelector(".form-step-wrapper");
    while (formStepWrapper.children.length > 1) {
      formStepWrapper.removeChild(formStepWrapper.lastChild);
    }

    formFlow.forEach((step) => {
      const stepElement = [...allSteps].find(
        (element) => element.dataset.step === step
      );
      formSteps.push(stepElement);
      if (step === "service") return;
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
    openLogModalBtn.id = "openLogModal";
    openLogModalBtn.textContent = "Open Log Modal";
    document.body.appendChild(openLogModalBtn);

    openLogModalBtn.addEventListener("click", () => {
      logModal.style.display = "block";
    });

    closeModalBtn.addEventListener("click", () => {
      logModal.style.display = "none";
    });
  }

  function initMealPlanPricing() {
    const mealPlanLinks = [
      "https://buy.stripe.com/3csdRNegV3YogAU00u",
      "https://buy.stripe.com/3cs6pl4Gl1Qg0BW00t",
      "https://buy.stripe.com/5kAcNJ3Ch9iI3O86oQ",
    ];

    const pricingStep = document.querySelector(
      "[data-step='meal-plan-pricing']"
    );
    const mealPlanOptions = pricingStep.querySelectorAll(".form-option");

    mealPlanOptions.forEach((option, i) => {
      option.addEventListener("click", (e) => handlePlanSelect(e, i));
    });

    function handlePlanSelect(e, i) {
      const clickedOption = e.target.closest(".form-option");
      if (!clickedOption) return;

      hideError();

      mealPlanOptions.forEach((option) => {
        if (option !== clickedOption) option.classList.remove("selected");
        else option.classList.add("selected");
      });

      const mealPlan =
        clickedOption.querySelector(".meal-plan-text").textContent;
      const mealPlanLink = mealPlanLinks[i];
      userInput["service-info"]["meal-plan"] = mealPlan;
      userInput["checkout-link"] = mealPlanLink;

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
      const input = quantityInputs[i];
      menuState[menuType][name] = {
        quantity: menuState[menuType][name]?.quantity || 0,
        input,
        addToCartButton: addToCartButtons[i],
      };
    });

    for (let dish in menuState[menuType]) {
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
        const quantity = menuState["luxury-catering-menu"][item].quantity;
        if (quantity === 0) continue;
        const input = document.createElement("input");
        input.name = item;
        input.value = quantity;
        form.appendChild(input);
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
    const serviceElement = document.querySelector(
      ".review-header .review-item-value"
    );
    serviceElement.textContent = userInput["service-info"][
      "service"
    ].replaceAll("-", " ");

    reviewInfo.innerHTML = "";

    initContactSection();

    if (userInput["service-info"]["service"] === "meal-plan") {
      initAthleteSection();
    } else initEventSection();

    if (userInput["service-info"]["service"] === "luxury-catering") {
      initMenuSection();
    }

    if (userInput["additional-info"]) initAdditionalSection();

    addSubmitButton();

    function addSubmitButton() {
      const submitButton = document.createElement("input");
      submitButton.onclick = handleSubmit;
      submitButton.value = "Submit";
      submitButton.classList.add("button", "w-button");
      reviewInfo.appendChild(submitButton);
    }

    function initAdditionalSection() {
      const additionalTitle = document.createElement("div");
      additionalTitle.classList.add("label");
      additionalTitle.textContent = "Additional Info:";
      reviewInfo.appendChild(additionalTitle);

      const additionalInfo = userInput["additional-info"];
      const reviewItem = document.createElement("div");
      reviewItem.classList.add("review-item");
      reviewItem.textContent = additionalInfo;
      reviewInfo.appendChild(reviewItem);
    }

    function initAthleteSection() {
      const athleteTitle = document.createElement("div");
      athleteTitle.classList.add("label");
      athleteTitle.textContent = "Athlete Info:";
      reviewInfo.appendChild(athleteTitle);

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
        reviewInfo.appendChild(reviewItem);
      }
    }

    function initContactSection() {
      const contactTitle = document.createElement("div");
      contactTitle.classList.add("label");
      contactTitle.textContent = "Contact Info:";
      reviewInfo.appendChild(contactTitle);

      let contactInfo = userInput["contact-info"];
      if (userInput["service-info"]["venue"] === "yacht") {
        contactInfo = userInput["yacht-contact-info"];
      }

      for (let item in contactInfo) {
        const reviewItem = document.createElement("div");
        const label = item.replaceAll("-", " ");
        let value = contactInfo[item];
        if (item === "phone" || item === "broker-phone") {
          value = formatPhone(value);
        }
        reviewItem.classList.add("review-item");
        reviewItem.innerHTML = `
            <div class="review-item-name">${label}:</div>
            <div class="review-item-value">${value}</div> 
        `;
        reviewInfo.appendChild(reviewItem);
      }
    }

    function initEventSection() {
      const eventTitle = document.createElement("div");
      eventTitle.classList.add("label");
      eventTitle.textContent = "Event:";
      reviewInfo.appendChild(eventTitle);

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
        reviewInfo.appendChild(reviewItem);
      }
    }

    function initMenuSection() {
      const foodTitle = document.createElement("div");
      foodTitle.classList.add("label");
      foodTitle.textContent = "Food:";
      reviewInfo.appendChild(foodTitle);

      for (let item in menuState["luxury-catering-menu"]) {
        const quantity = menuState["luxury-catering-menu"][item].quantity;
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

  function initVenueOptions() {
    const venueOptions = document.querySelectorAll(
      ".venue-options .form-option"
    );

    venueOptions.forEach((option) => {
      option.tabIndex = 0;
      option.addEventListener("click", handleVenueSelect);
    });
  }

  function logToModal(msg) {
    const logText = document.createTextNode(msg + "\n");
    logContainer.appendChild(logText);
  }

  function showError(msg) {
    const errorMessage = document.querySelector(".error");
    errorMessage.textContent = msg;
    errorMessage.classList.add("active");
  }

  function updateButtons() {
    backButton.draggable = false;
    nextButton.draggable = false;

    backButton.disabled = true;
    nextButton.disabled = true;
    setTimeout(() => {
      backButton.disabled = false;
      nextButton.disabled = false;
    }, 250);

    if (stepIndex === 0) {
      backButton.style.opacity = 0;
      backButton.style.pointerEvents = "none";
    } else {
      backButton.style.opacity = 1;
      backButton.style.pointerEvents = "auto";
    }

    if (formFlow[stepIndex] === "review") {
      nextButton.style.opacity = 0;
      nextButton.style.pointerEvents = "none";
    } else {
      nextButton.style.opacity = 1;
      nextButton.style.pointerEvents = "auto";
    }
  }

  function updateHeader() {
    const formTitle = document.querySelector(".form-title");
    const formSubtitle = document.querySelector(".form-subtitle");
    let step = formFlow[stepIndex];

    let titles = {
      service: "What brings you in?",
      venue: "Where will your event be held?",
      ["luxury-catering-menu"]: "Luxury Catering Menu",
      ["performance-catering-menu"]: "Performance Catering Menu",
      ["private-event-menu"]: "Menu",
      ["contact-info"]: "Contact information",
      ["yacht-contact-info"]: "Contact Information",
      ["event-info"]: "Event information",
      ["meal-plan-info"]: "Athlete Information",
      ["meal-plan-pricing"]: "Meal Plan Options",
      ["additional-info"]: "Additional information",
      review: "Review",
    };
    formTitle.textContent = titles[step];

    let subtitles = {
      service: "Select the service you're interested in.",
      venue: "Select the venue for your event.",
      ["luxury-catering-menu"]: "Select the quantity of each item",
      ["performance-catering-menu"]: "View our performance catering menu.",
      ["private-event-menu"]: "View our private events menu.",
      ["contact-info"]: "Let us know a bit about you.",
      ["yacht-contact-info"]:
        "Enter your charter broker's contact information.",
      ["event-info"]: "Tell us more about the event.",
      ["meal-plan-info"]: "Enter your athlete's information.",
      ["meal-plan-pricing"]: "Select your meal plan.",
      ["additional-info"]: "Enter any additional information.",
      review: "Review your order and submit when ready.",
    };
    formSubtitle.textContent = subtitles[step];
  }

  function updateMenuState(e, menuType) {
    const quantity = parseInt(e.target.value);
    const name = e.target
      .closest(".menu-item")
      .querySelector(".menu-item-name").textContent;

    menuState[menuType][name].quantity = quantity;
    sessionStorage.setItem("menuState", JSON.stringify(menuState));

    hideError();
  }

  function updateProgressBar() {
    const progressBar = document.querySelector(".form-progress-bar");
    const totalSteps = formSteps.length;
    const completedSteps = stepIndex;
    const progressPercentage = (completedSteps / totalSteps) * 100;
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

    formSteps.forEach((step) => {
      step.style.transform = `translateX(${stepIndex * -100}%)`;
    });

    updateProgressBar();
    updateHeader();
    updateButtons();

    if (stepIndex === 0) return;

    if (stepIndex === formSteps.length - 1) {
      initOrderForm();
      initReview();
    }

    const step = formFlow[stepIndex];
    switch (step) {
      case "venue":
        initVenueOptions();
        break;
      case "luxury-catering-menu":
        initMenu("luxury-catering-menu");
        break;
      case "private-event-menu":
        initMenu("private-event-menu");
        break;
      case "performance-catering-menu":
        initMenu("performance-catering-menu");
        break;
      case "contact-info":
        initContactInfo();
        break;
      case "yacht-contact-info":
        initContactInfo("yacht");
        break;
      case "event-info":
        initEventInfo();
        break;
      case "meal-plan-info":
        initAthleteInfo();
        break;
      case "meal-plan-pricing":
        initMealPlanPricing();
        break;
      default:
        break;
    }
  }

  const privateEventInfo = [
    {
      name: "address",
      label: "Address",
      type: "text",
    },
    {
      name: "date",
      label: "Event Date",
      type: "date",
    },
    {
      name: "time",
      label: "Estimated Start Time",
      type: "time",
    },
    {
      name: "party-size",
      label: "Estimated Party Size",
      type: "number",
    },
  ];

  const privateEventInfoYacht = [
    {
      name: "marina-address",
      label: "Marina Address",
      type: "text",
    },
    {
      name: "date",
      label: "Event Date",
      type: "date",
    },
    {
      name: "time",
      label: "Estimated Departure Time",
      type: "time",
    },
    {
      name: "party-size",
      label: "Estimated Party Size",
      type: "number",
    },
  ];

  const luxuryCateringInfo = [
    {
      name: "date",
      label: "Event Date",
      type: "date",
    },
    {
      name: "time",
      label: "Estimated Start Time",
      type: "time",
    },
    {
      name: "address",
      label: "Address",
      type: "text",
    },
  ];

  const luxuryCateringInfoYacht = [
    {
      name: "marina-address",
      label: "Marina Address",
      type: "text",
    },
    {
      name: "date",
      label: "Event Date",
      type: "date",
    },
    {
      name: "time",
      label: "Estimated Departure Time",
      type: "time",
    },
  ];

  const performanceCateringInfo = [
    {
      name: "address",
      label: "Address",
      type: "text",
    },
    {
      name: "date",
      label: "Event Date",
      type: "date",
    },
    {
      name: "time",
      label: "Estimated Start Time",
      type: "time",
    },
  ];
});
