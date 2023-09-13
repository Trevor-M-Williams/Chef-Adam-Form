import { animationDuration } from "./index.js";

export function initStyles() {
  const styleElement = document.createElement("style");
  document.head.appendChild(styleElement);
  styleElement.innerHTML = `
      .w-webflow-badge {
        display: none !important;
      }

      .button:focus {
        outline: none;
        box-shadow: 0 0 0 1px #aaf;
      }

      .order-form-success,
      .order-form-error {
        transition: opacity 500ms ease-in-out 500ms;
      }
          
      .form-step {
        transition: transform ${animationDuration}ms ease-in-out;
      }

      .button.disabled {
        pointer-events: none;
      }

      .button.hidden {
        pointer-events: none;
        opacity: 0 !important;
      }

      .form-button.disabled {
        pointer-events: none;
      }

      .form-button.hidden {
        pointer-events: none;
        opacity: 0 !important;
      }

      .form-card .button.is-secondary {
        opacity: 1;
      }

      .loader {
        position: absolute;
        inset: 0;
        z-index: 100;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      
      .loader-icon {
        width: 5rem;
        height: 5rem;
        border-radius: 50%;
        border: 0.25rem solid #fff;
        border-top: 0.25rem solid #000;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .modal {
        display: none;
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
      }
      
      .modal-content {
        position: absolute;
        top: 10vh;
        left: 5vw;
        background-color: #fff;
        padding: 0.5rem;
        height: 80vh;
        width: 90vw;
      }
      
      #open-log-modal {
        position: absolute;
        bottom: 5px;
        right: 5px;
      }

      .close {
        cursor: pointer;
      }
  `;
}
