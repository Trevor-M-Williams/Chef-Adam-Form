import { userInput, updateStep, isAnimating } from "./index.js";
import { hideError, showPopup } from "./ui.js";

export function initMealPlanInfo() {
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

export function initMealPlanOptions() {
  const mealPlanUrls = [
    "https://buy.stripe.com/3csdRNegV3YogAU00u",
    "https://buy.stripe.com/3cs6pl4Gl1Qg0BW00t",
    "https://buy.stripe.com/5kAcNJ3Ch9iI3O86oQ",
  ];

  const pricingStep = document.querySelector("[data-step='meal-plan-pricing']");
  const mealPlanOptions = pricingStep.querySelectorAll(
    ".form-option:not(.custom)"
  );

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
