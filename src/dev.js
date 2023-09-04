import {
  userInput,
  menuState,
  formSteps,
  stepIndex,
  updateStep,
} from "./index.js";

export function initDevButtons() {
  const devButtons = document.createElement("div");
  devButtons.style.display = "flex";
  devButtons.style.gap = "5px";
  devButtons.style.position = "absolute";
  devButtons.style.bottom = "5px";
  devButtons.style.left = "5px";
  document.body.appendChild(devButtons);

  addDevButton("Refresh", refreshWindow);
  addDevButton("State", printState);
  addDevButton("Checkout", goToCheckout);
  addDevButton("Skip", skipToReview);

  function addDevButton(text, callback) {
    const button = document.createElement("button");
    button.textContent = text;
    button.addEventListener("click", callback);
    devButtons.appendChild(button);
  }

  function goToCheckout() {
    const checkoutLink = userInput["checkout-link"] || "/checkout";
    const win = window.open(checkoutLink, "_blank");
    win.focus();
  }

  function printState() {
    console.log(userInput);
    console.log(menuState);

    let itemSelected = false;
    for (let item in menuState["luxury-catering-menu"]) {
      if (menuState["luxury-catering-menu"][item].quantity > 0) {
        console.log(item, menuState["luxury-catering-menu"][item].quantity);
        itemSelected = true;
      }
    }
    if (!itemSelected) console.log("No items selected");
  }

  function refreshWindow() {
    sessionStorage.clear();
    window.location.reload();
  }

  function skipToReview() {
    const incrementor = formSteps.length - 1 - stepIndex;
    updateStep(incrementor);
  }
}

export function initLogModal() {
  const logModal = document.createElement("div");
  logModal.id = "logModal";
  logModal.className = "modal";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  const closeModalBtn = document.createElement("span");
  closeModalBtn.className = "close";
  closeModalBtn.innerHTML = "&times;";

  const logContainer = document.createElement("pre");
  logContainer.id = "logContainer";

  modalContent.appendChild(closeModalBtn);
  modalContent.appendChild(logContainer);
  logModal.appendChild(modalContent);
  document.body.appendChild(logModal);

  const openLogModalBtn = document.createElement("button");
  openLogModalBtn.id = "open-log-modal";
  openLogModalBtn.textContent = "Log";
  document.body.appendChild(openLogModalBtn);

  openLogModalBtn.addEventListener("click", () => {
    logModal.style.display = "block";
  });

  closeModalBtn.addEventListener("click", () => {
    logModal.style.display = "none";
  });

  window.logToModal = function (msgOrElement) {
    let logText;
    if (typeof msgOrElement === "string") {
      logText = document.createTextNode(msgOrElement + "\n");
    } else if (msgOrElement instanceof HTMLElement) {
      let styles = window.getComputedStyle(msgOrElement);
      let attributes = msgOrElement.attributes;

      let styleInfo = "Styles:\n";
      for (let prop of styles) {
        styleInfo += `${prop}: ${styles.getPropertyValue(prop)}\n`;
      }

      let attributeInfo = "Attributes:\n";
      for (let attr of attributes) {
        attributeInfo += `${attr.name}=${attr.value}\n`;
      }

      logText = document.createTextNode(
        `Element: ${msgOrElement.tagName}\n${styleInfo}\n${attributeInfo}\n`
      );
    }

    if (logText) {
      const logContainer = document.getElementById("logContainer");
      logContainer.appendChild(logText);
    }
  };
}
