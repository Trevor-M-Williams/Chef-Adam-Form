import { userInput, contactInputWrappers } from "./index.js";

export function initContactInfo() {
  const contactInfoStep = document.querySelector("[data-step='contact-info']");
  contactInfoStep.innerHTML = "";

  const venue = userInput["service-info"]["venue"];
  let contactInputs;

  switch (venue) {
    case "home":
      contactInputs = ["name", "phone", "email"];
      break;
    case "yacht":
      contactInputs = ["poc-name", "poc-phone", "email"];
      break;
    default:
      contactInputs = ["name", "phone", "email"];
      break;
  }

  contactInputWrappers.forEach((wrapper) => {
    const input = wrapper.querySelector("input, textarea");
    if (contactInputs.includes(input.name)) {
      contactInfoStep.appendChild(wrapper);
      if (userInput["contact-info"][input.name]) {
        input.value = userInput["contact-info"][input.name];
      }
    }
  });
}
