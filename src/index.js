import { initStyles } from "./styles.js";
import { initDevButtons, initLogModal } from "./dev.js";
import { initServiceOptions } from "./service.js";
import { initVenueOptions } from "./venue.js";
import { initContactInfo } from "./contact.js";
import { initEventInfo } from "./event.js";
import { handleMenuStep, initMenu } from "./menu.js";
import { initMealPlanInfo, initMealPlanOptions } from "./meal-plan.js";
import { initOrderForm, initReview } from "./review.js";
import { handleFormSubmission, handleFormSubmissionDev } from "./submit.js";
import {
  updateProgressBar,
  updateButtons,
  updateHeader,
  hideError,
  showError,
  showPopup,
} from "./ui.js";

window.addEventListener("click", handleStepChange);
window.addEventListener("resize", handleResize);

export const dev = 0;
export const animationDuration = 400;

export let userInput = JSON.parse(sessionStorage.getItem("userInput")) || {};
export let menuState = JSON.parse(sessionStorage.getItem("menuState")) || {};

export let formSteps = [];
export let stepIndex = 0;
export let formFlow = ["service"];
export let isMobile = false;
export let backButton;
export let nextButton;
export let isAnimating = false;
let mealPlanOpionsInitialized = false;

export const allSteps = document.querySelectorAll(".form-step");
export const contactInputWrappers = document.querySelectorAll(
  "[data-step='contact-info'] .input-wrapper"
);
export const eventInputWrappers = document.querySelectorAll(
  "[data-step='event-info'] .input-wrapper"
);

handleResize();
initForm();

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
      const cartIcon = document.querySelector(".cart-icon");
      const disclaimer = document.querySelector(".disclaimer");
      cartIcon.style.display = "none";
      disclaimer.style.display = "block";
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

function initForm() {
  initStyles();

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
    initLogModal();
    logToModal("Initialized form");
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

  function isSafariMobile() {
    const chromeAgent =
      navigator.userAgent.indexOf("Chrome") > -1 ||
      navigator.userAgent.indexOf("CriOS") > -1;
    const safariAgent = navigator.userAgent.indexOf("Safari") > -1;

    return safariAgent && !chromeAgent && window.innerWidth < 991;
  }
}

export function initFormSteps() {
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

export function updateStep(incrementor) {
  hideError();

  if (incrementor) {
    isAnimating = true;
    setTimeout(() => {
      isAnimating = false;
    }, animationDuration);

    const oldStep = formSteps[stepIndex];
    const newStep = formSteps[stepIndex + incrementor];

    if (newStep) newStep.style.visibility = "visible";
    setTimeout(() => {
      oldStep.style.visibility = "hidden";
    }, animationDuration);
  }

  stepIndex += incrementor;

  requestAnimationFrame(() => {
    formSteps.forEach((step) => {
      step.style.transform = `translateX(${stepIndex * -100}%)`;
    });
  });

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
      if (!mealPlanOpionsInitialized) {
        initMealPlanOptions();
        mealPlanOpionsInitialized = true;
      }
      break;
    case "review":
      initOrderForm();
      initReview();
      break;
    default:
      break;
  }
}
