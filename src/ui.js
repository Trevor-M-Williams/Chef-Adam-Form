import {
  userInput,
  formFlow,
  formSteps,
  stepIndex,
  animationDuration,
  nextButton,
  backButton,
  isMobile,
} from "./index.js";

import { updateCart } from "./menu.js";

export function updateButtons() {
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

export function updateHeader() {
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
          <div>View the full menu <a href="/menus/luxury-catering" class="form-link" target="_blank">here</a>.</div>
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
    ["additional-info"]: "Tell us a little more about your booking.",
    review: `Click/Tap a section to make changes. ${
      isMobile ? "" : "Scroll to submit."
    }`,
  };
  formSubtitle.innerHTML = subtitles[step];
}

export function updateProgressBar(state) {
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

export function hideError() {
  const errorMessage = document.querySelector(".error");
  errorMessage.classList.remove("active");
}

export function showError(error) {
  const errorMessage = document.querySelector(".error");
  errorMessage.innerHTML = error;
  errorMessage.classList.add("active");
}

export function showPopup(type) {
  const popup = document.querySelector(".form-popup");
  popup.style.display = "flex";

  const popupWrappers = document.querySelectorAll(".form-popup-wrapper");
  popupWrappers.forEach((wrapper) => {
    console.log(wrapper);
    if (wrapper.classList) {
      wrapper.classList.remove("active");
      if (wrapper.classList.contains(type)) {
        wrapper.classList.add("active");
      }
    }
  });

  const disclaimer = document.querySelector(".disclaimer");
  if (type === "cart") disclaimer.style.display = "block";
  else disclaimer.style.display = "none";
}
