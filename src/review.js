import {
  userInput,
  menuState,
  isMobile,
  formSteps,
  stepIndex,
  updateStep,
} from "./index.js";

export function initOrderForm() {
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

export function initReview() {
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
