import {
  userInput,
  menuState,
  isMobile,
  formSteps,
  stepIndex,
  updateStep,
} from "./index.js";
import { handleFormSubmission } from "./submit.js";

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

    const editIcon = document.createElement("div");
    editIcon.classList.add("edit-icon");
    editIcon.innerHTML = `
      <svg height="100%" width="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
    `;
    additionalSection.appendChild(editIcon);

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

    const editIcon = document.createElement("div");
    editIcon.classList.add("edit-icon");
    editIcon.innerHTML = `
      <svg height="100%" width="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
    `;
    athleteSection.appendChild(editIcon);

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

    const editIcon = document.createElement("div");
    editIcon.classList.add("edit-icon");
    editIcon.innerHTML = `
      <svg height="100%" width="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
    `;
    contactSection.appendChild(editIcon);

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

    const editIcon = document.createElement("div");
    editIcon.classList.add("edit-icon");
    editIcon.innerHTML = `
      <svg height="100%" width="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
    `;
    eventSection.appendChild(editIcon);

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

    const editIcon = document.createElement("div");
    editIcon.classList.add("edit-icon");
    editIcon.innerHTML = `
      <svg height="100%" width="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
    `;
    menuSection.appendChild(editIcon);

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
