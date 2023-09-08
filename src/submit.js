import { dev, userInput } from "./index.js";
import { updateProgressBar } from "./ui.js";

function addLoader() {
  const reviewStep = document.querySelector("[data-step='review']");
  const loader = document.createElement("div");
  loader.className = "loader";

  const loaderIcon = document.createElement("div");
  loaderIcon.className = "loader-icon";

  loader.appendChild(loaderIcon);
  reviewStep.appendChild(loader);
}

function handleFormResponse(type) {
  console.log(type);

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

export function handleFormSubmission() {
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

export function handleFormSubmissionDev() {
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

function initFormMessage(type) {
  const reviewStep = document.querySelector("[data-step='review']");

  switch (type) {
    case "success":
      const service = userInput["service-info"]["service"];

      const successMessageText = {
        "private-event":
          "Your order has been received! Our team will be in touch shortly to help craft your event menu.",
        "luxury-catering":
          "Your order has been received! You can now proceed to checkout.",
        "performance-catering":
          "Your order has been received! Our team will be in touch shortly to help craft your menu.",
        "meal-plan":
          "Your order has been received! Our team will be in touch shortly to help craft your meal plan. You can now proceed to checkout.",
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
      loader.remove();
    }, 500);
  }
}

function removeProgressBar() {
  const formProgress = document.querySelector(".form-progress");
  formProgress.style.transition = `opacity 500ms ease-in-out`;
  formProgress.style.opacity = 0;
}
