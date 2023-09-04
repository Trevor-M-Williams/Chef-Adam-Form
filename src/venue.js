import { userInput, isAnimating, updateStep } from "./index.js";
import { hideError } from "./ui.js";

function handleVenueSelect(e) {
  if (isAnimating) return;

  const clickedOption = e.target.closest(".form-option");
  if (!clickedOption) return;

  const venueOptions = document.querySelectorAll(".venue-options .form-option");
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

export function initVenueOptions() {
  const venueOptions = document.querySelectorAll(".venue-options .form-option");

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
