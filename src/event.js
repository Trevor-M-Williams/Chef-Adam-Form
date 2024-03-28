import { userInput, eventInputWrappers } from "./index.js";

export function initEventInfo() {
  let eventInfo;
  const service = userInput["service-info"]["service"];
  const venue = userInput["service-info"]["venue"];
  switch (service) {
    case "private-event":
      if (venue === "yacht")
        eventInfo = [
          "marina-address",
          "boat-name",
          "date",
          "time",
          "party-size",
        ];
      else eventInfo = ["address", "date", "time", "party-size"];
      break;
    case "luxury-catering":
      if (venue === "yacht")
        eventInfo = ["marina-address", "boat-name", "date", "time"];
      else eventInfo = ["address", "date", "time"];
      break;
    case "team-catering":
      eventInfo = ["address", "date", "time"];
      break;
    default:
      break;
  }

  const eventInfoDiv = document.querySelector(".event-info");
  eventInfoDiv.innerHTML = "";

  eventInputWrappers.forEach((wrapper) => {
    const input = wrapper.querySelector("input, textarea");
    if (eventInfo.includes(input.name)) {
      eventInfoDiv.appendChild(wrapper);
      if (userInput["event-info"][input.name]) {
        input.value = userInput["event-info"][input.name];
      }

      if (input.name === "date") {
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");

        input.min = `${year}-${month}-${day}`;
      }
    }
  });
}
