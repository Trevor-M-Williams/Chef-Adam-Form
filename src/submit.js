import { dev, userInput } from "./index.js";
import { updateProgressBar } from "./ui.js";
import { db } from "./firebase.js";
import { doc, setDoc } from "firebase/firestore";

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
  updateProgressBar(type);
  removeButtons();
  removeLoader();
  removeProgressBar();

  setTimeout(() => {
    initFormMessage(type);
  }, 250);

  setTimeout(() => {
    if (userInput["service-info"]["service"] === "meal-plan") {
      window.location.href = userInput["checkout-link"];
    }
  }, 3000);

  const email = userInput["contact-info"]["email"];
  userInput["contact-info"]["email"] = email;

  sessionStorage.clear();
  sessionStorage.setItem("email", email);
}

export async function handleFormSubmission() {
  hideReviewItems();
  removeButtons();
  addLoader();
  updateProgressBar("submit");

  const docID = Date.now().toString();
  const docRef = doc(db, "orders", docID);

  try {
    await setDoc(docRef, userInput);
    console.log("Document written with ID: ", docID);

    handleFormResponse("success");
  } catch (e) {
    console.error("Error adding document: ", e);
    handleFormResponse("error");
  }
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

      setTimeout(() => {
        if (userInput["service-info"]["service"] === "meal-plan") {
          window.location.href = userInput["checkout-link"];
        }
      }, 3000);
    }, 1500);
  }
}

function hideReviewItems() {
  const formCardHeader = document.querySelector(".form-card-header");
  const reviewHeader = document.querySelector(".review-header");
  const reviewInfo = document.querySelector(".review-info");
  formCardHeader.style.display = "none";
  reviewHeader.style.display = "none";
  reviewInfo.style.display = "none";
}

function initFormMessage(type) {
  switch (type) {
    case "success":
      const service = userInput["service-info"]["service"];

      const successMessageText = {
        "private-event":
          "Your order has been received! Our team will be in touch shortly to help craft your event menu.",
        "luxury-catering": "Please proceed to checkout to complete your order.",
        "performance-catering":
          "Your order has been received! Our team will be in touch shortly to help craft your menu.",
        "meal-plan":
          "You will now be redirected to checkout. Our team will be in touch shortly to help craft your meal plan.",
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
  formButtons.style.opacity = "0";
  formButtons.style.pointerEvents = "none";
}

function removeLoader() {
  const loader = document.querySelector(".loader");
  if (loader) {
    loader.style.transition = `opacity 250ms ease`;
    loader.style.opacity = 0;
    setTimeout(() => {
      loader.remove();
    }, 500);
  }
}

function removeProgressBar() {
  const formProgress = document.querySelector(".form-progress");
  formProgress.style.transition = `opacity 250ms ease`;
  formProgress.style.opacity = 0;
}
