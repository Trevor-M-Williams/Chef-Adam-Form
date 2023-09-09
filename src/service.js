import { userInput, isAnimating, initFormSteps, updateStep } from "./index.js";
import { hideError } from "./ui.js";

function handleServiceSelect(e) {
  if (isAnimating) return;

  const clickedOption = e.target.closest(".form-option");
  if (!clickedOption) return;

  const serviceStep = document.querySelector("[data-step='service']");
  const serviceOptions = serviceStep.querySelectorAll(".form-option");
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

export function initServiceOptions() {
  const serviceStep = document.querySelector("[data-step='service']");
  const serviceOptions = serviceStep.querySelectorAll(".form-option");
  serviceOptions.forEach((option) => {
    option.tabIndex = 0;
    option.addEventListener("click", handleServiceSelect);
  });
}
