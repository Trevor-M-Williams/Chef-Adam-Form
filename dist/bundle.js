(() => {
  "use strict";
  var e = {
    d: (t, n) => {
      for (var o in n)
        e.o(n, o) &&
          !e.o(t, o) &&
          Object.defineProperty(t, o, { enumerable: !0, get: n[o] });
    },
    o: (e, t) => Object.prototype.hasOwnProperty.call(e, t),
  };
  function t(e) {
    const t = document.querySelector(".form-progress-bar");
    switch (e) {
      case "submit":
        return (
          (t.style.transition = "width 5000ms ease"),
          void (t.style.width = "95%")
        );
      case "success":
        return (
          (t.style.transition = "width 500ms ease-in-out"),
          void (t.style.width = "100%")
        );
      case "error":
        return (
          (t.style.transition = "width 500ms ease-in-out"),
          void (t.style.width = "0%")
        );
    }
    const n = x.length,
      o = (q / n) * 100;
    (t.style.transition = `width ${C}ms ease-in-out`),
      (t.style.width = `${o}%`);
  }
  function n() {
    document.querySelector(".error").classList.remove("active");
  }
  function o(e) {
    const t = document.querySelector(".error");
    (t.innerHTML = e), t.classList.add("active");
  }
  function i(e) {
    (document.querySelector(".form-popup").style.display = "flex"),
      document.querySelectorAll(".form-popup-wrapper").forEach((t) => {
        t.classList &&
          (t.classList.remove("active"),
          t.classList.contains(e) && t.classList.add("active"));
      });
    document.querySelector(".disclaimer").style.display =
      "cart" === e ? "block" : "none";
  }
  function r(e) {
    if (T) return;
    const t = e.target.closest(".form-option");
    if (!t) return;
    document
      .querySelector("[data-step='service']")
      .querySelectorAll(".form-option")
      .forEach((e) => {
        e !== t ? e.classList.remove("selected") : e.classList.add("selected");
      });
    const o = t.id;
    (b["service-info"].service = o),
      "meal-plan" !== o && (b["service-info"]["meal-plan"] = ""),
      ("team-catering" !== o && "meal-plan" !== o) ||
        (b["service-info"].venue = ""),
      N(),
      O(1),
      n(),
      sessionStorage.setItem("userInput", JSON.stringify(b));
  }
  function a(e) {
    if (T) return;
    const t = e.target.closest(".form-option");
    if (!t) return;
    document
      .querySelector("[data-step='venue']")
      .querySelectorAll(".form-option")
      .forEach((e) => {
        e !== t ? e.classList.remove("selected") : e.classList.add("selected");
      });
    let o = t.id;
    (b["service-info"].venue = o),
      n(),
      O(1),
      sessionStorage.setItem("userInput", JSON.stringify(b));
  }
  function c(e) {
    let t = 0;
    for (let n in L[e]) {
      if ("total" === n) continue;
      const o = L[e][n].quantity;
      0 !== o && (t += o * parseFloat(L[e][n].price));
    }
    return t;
  }
  function s(e) {
    const t = document.querySelector(".review-section.cart");
    t.innerHTML =
      '\n    <div class="label cart">Cart</div>\n    <div class="cart-items"></div>\n  ';
    const n = t.querySelector(".cart-items"),
      o = L[e];
    for (const e in o) {
      if ("Service Fee" === e) continue;
      const t = o[e]?.quantity || null;
      if (!t) continue;
      if (0 === t) continue;
      const i = parseFloat(o[e].price),
        r = document.createElement("div");
      r.classList.add("review-item"),
        (r.innerHTML = `\n            <div class="review-flex">\n              <div class="menu-item-value">${t}</div>\n              <div class="review-item-name">${e}</div>\n            </div>\n            <div class="dotted-line"></div>\n            <div class="review-item-price">$${
          t * i
        }</div>\n        `),
        n.appendChild(r);
    }
    const i = document.createElement("div");
    i.classList.add("review-item", "total", "cart"),
      (i.innerHTML = `\n          <div class="label total">Food Total:</div>\n          <div class="dotted-line"></div>\n          <div class="review-item-price total">$${
        L["luxury-catering-menu"].total - 199
      }</div>\n        `),
      t.appendChild(i);
  }
  function l(e, t) {
    e.preventDefault(), n();
    const o = parseInt(e.target.value) || 0,
      i = e.target.closest(".menu-item"),
      r = i.querySelector(".menu-item-name").textContent;
    o > 0
      ? i.classList.add("selected")
      : (i.classList.remove("selected"), (e.target.value = 0)),
      (L[t][r].quantity = o);
    const a = c(t);
    (L[t].total = a),
      sessionStorage.setItem("menuState", JSON.stringify(L)),
      s(t);
  }
  function d() {
    const e = document.querySelector("[data-step='review']"),
      t = document.createElement("div");
    t.className = "loader";
    const n = document.createElement("div");
    (n.className = "loader-icon"), t.appendChild(n), e.appendChild(t);
  }
  function u(e) {
    t(e),
      y(),
      h(),
      g(),
      f(e),
      setTimeout(() => {
        "meal-plan" === b["service-info"].service &&
          (window.location.href = b["checkout-link"]);
      }, 3e3);
    const n = b["contact-info"].email;
    (b["contact-info"].email = n),
      sessionStorage.clear(),
      sessionStorage.setItem("email", n);
  }
  function m() {
    document
      .querySelector(".order-form")
      .querySelector("input[type='submit']")
      .click(),
      v(),
      y(),
      d(),
      t("submit");
    const e = document.querySelector(".order-form-success"),
      n = document.querySelector(".order-form-error"),
      o = new MutationObserver((t) => {
        t.forEach((t) => {
          if ("attributes" === t.type && "style" === t.attributeName) {
            const i = window
              .getComputedStyle(t.target)
              .getPropertyValue("display");
            t.target === e && "block" === i && (u("success"), o.disconnect()),
              t.target === n && "block" === i && (u("error"), o.disconnect());
          }
        });
      }),
      i = { attributes: !0, attributeFilter: ["style"] };
    e && o.observe(e, i), n && o.observe(n, i);
  }
  function p() {
    const e = document.querySelector(".order-form"),
      n = new FormData(e);
    for (let e of n.entries()) console.log(e[0] + ": " + e[1]);
    var o;
    v(),
      y(),
      d(),
      t("submit"),
      (o = "success"),
      setTimeout(() => {
        t(o),
          h(),
          g(),
          f(o),
          setTimeout(() => {
            "meal-plan" === b["service-info"].service &&
              (window.location.href = b["checkout-link"]);
          }, 3e3);
      }, 1500);
  }
  function v() {
    const e = document.querySelector(".form-card-header"),
      t = document.querySelector(".review-header"),
      n = document.querySelector(".review-info");
    (e.style.display = "none"),
      (t.style.display = "none"),
      (n.style.display = "none");
  }
  function f(e) {
    switch (e) {
      case "success":
        const e = b["service-info"].service,
          t = {
            "private-event":
              "Your order has been received! Our team will be in touch shortly to help craft your event menu.",
            "luxury-catering":
              "Please proceed to checkout to complete your order.",
            "team-catering":
              "Your order has been received! Our team will be in touch shortly to help craft your menu.",
            "meal-plan":
              "You will now be redirected to checkout. Our team will be in touch shortly to help craft your meal plan.",
          },
          n = {
            "private-event": "Home",
            "luxury-catering": "Checkout",
            "team-catering": "Home",
            "meal-plan": "Checkout",
          },
          o = {
            "private-event": "/",
            "luxury-catering": "/checkout",
            "team-catering": "/",
            "meal-plan": b["checkout-link"],
          },
          i = document.querySelector(".order-form-success"),
          r = document.querySelector(".order-form-message"),
          a = document.querySelector("#success-button");
        (i.style.display = "block"),
          w
            ? setTimeout(() => {
                i.style.opacity = 1;
              }, 25)
            : (i.style.opacity = 1),
          (r.textContent = t[e]),
          (a.textContent = n[e]),
          (a.href = o[e]);
        break;
      case "error":
        const c = document.querySelector(".order-form-error");
        (c.style.display = "block"),
          w
            ? setTimeout(() => {
                c.style.opacity = 1;
              }, 25)
            : (c.style.opacity = 1);
    }
  }
  function y() {
    const e = document.querySelector(".form-button-group");
    (e.style.opacity = "0"), (e.style.pointerEvents = "none");
  }
  function h() {
    const e = document.querySelector(".loader");
    e &&
      ((e.style.transition = "opacity 500ms ease-in-out"),
      (e.style.opacity = 0),
      setTimeout(() => {
        e.remove();
      }, 500));
  }
  function g() {
    const e = document.querySelector(".form-progress");
    (e.style.transition = "opacity 500ms ease-in-out"), (e.style.opacity = 0);
  }
  e.d(
    {},
    {
      wy: () => C,
      Rw: () => k,
      Fg: () => V,
      WI: () => w,
      W_: () => A,
      Jm: () => E,
      wt: () => x,
      X1: () => N,
      nq: () => T,
      tq: () => $,
      Te: () => L,
      F2: () => S,
      ju: () => q,
      d: () => O,
      o7: () => b,
    }
  ),
    window.addEventListener("click", function (e) {
      if (T) return;
      let t;
      if (
        (e.target.matches("[data-next]") || e.target.closest("[data-next]")
          ? (t = 1)
          : (e.target.matches("[data-back]") ||
              e.target.closest("[data-back]")) &&
            (t = -1),
        null == t)
      )
        return;
      if (t < 0) {
        if (0 === q) return;
        return void O(t);
      }
      if (0 === q && !b["service-info"].service)
        return void o("Please select a service");
      const n = E[q];
      switch (n) {
        case "venue":
          if (!b["service-info"].venue) return void o("Please select a venue");
          break;
        case "luxury-catering-menu":
          if (
            !(function (e) {
              let t = !1;
              for (const n in L[e])
                if ("Service Fee" !== n && L[e][n].quantity > 0) {
                  t = !0;
                  break;
                }
              if (c(e) - 199 < 500) return o("$500 food minimum"), !1;
              if (!t) return o("Please select at least one item"), !1;
              document
                .querySelectorAll("[data-wf-cart-action='remove-item']")
                .forEach((e) => e.click());
              let n = 0;
              const i = L[e];
              for (const e in i) {
                const t = i[e].quantity;
                if (!t) continue;
                if (0 === t) continue;
                const o = i[e].addToCartButton;
                setTimeout(() => {
                  (o.disabled = !1), o.click(), (o.disabled = !0);
                }, 250 * n + 500),
                  n++;
              }
              return !0;
            })("luxury-catering-menu")
          )
            return;
          const e = document.querySelector(".cart-icon"),
            t = document.querySelector(".disclaimer");
          (e.style.display = "none"), (t.style.display = "block");
          break;
        case "menu":
          break;
        case "meal-plan-pricing":
          if (!b["service-info"]["meal-plan"])
            return void o("Please select a meal plan");
          break;
        case "additional-info":
          const r = x[q].querySelector("textarea");
          (b["additional-info"] = r.value),
            sessionStorage.setItem("userInput", JSON.stringify(b));
          break;
        case "review":
          return void (w ? p() : m());
        default:
          if (
            !(function (e) {
              const t = x[q].querySelectorAll("input, textarea");
              if (![...t].every((e) => e.reportValidity())) return !1;
              if (
                ("service-info" === e
                  ? (b["service-info"] = {
                      service: b["service-info"].service,
                      venue: b["service-info"].venue,
                    })
                  : (b[e] = {}),
                t.forEach((t) => {
                  "additional-info" !== t.name
                    ? "checkbox" === t.type
                      ? (b[e][t.name] = t.checked)
                      : "radio" === t.type
                      ? t.checked && (b[e][t.name] = t.value)
                      : (b[e][t.name] = t.value)
                    : (b[t.name] = t.value);
                }),
                "event-info" === e)
              ) {
                const e = b["event-info"].date,
                  t = b["event-info"].time,
                  n = new Date(`${e}T${t}:00`) - new Date();
                if (Math.floor(n / 1e3 / 60 / 60) < 48) return i("date"), !1;
              }
              return sessionStorage.setItem("userInput", JSON.stringify(b)), !0;
            })(n)
          )
            return;
      }
      O(t);
    }),
    window.addEventListener("resize", I);
  const w = !1;
  w && console.log("dev mode active");
  const C = 400;
  let k,
    S,
    b = JSON.parse(sessionStorage.getItem("userInput")) || {},
    L = JSON.parse(sessionStorage.getItem("menuState")) || {},
    x = [],
    q = 0,
    E = ["service"],
    $ = !1,
    T = !1,
    M = !1;
  const H = document.querySelectorAll(".form-step"),
    V = document.querySelectorAll("[data-step='contact-info'] .input-wrapper"),
    A = document.querySelectorAll("[data-step='event-info'] .input-wrapper");
  function I() {
    window.innerWidth < 479 && ($ = !0),
      $
        ? ((k = document.querySelector("#back-button")),
          (S = document.querySelector("#next-button")))
        : ((k = document.querySelector("#back-arrow")),
          (S = document.querySelector("#next-arrow")));
  }
  function N() {
    const e = b["service-info"].service;
    e &&
      (E = {
        "private-event": [
          "service",
          "venue",
          "contact-info",
          "event-info",
          "private-event-menu",
          "additional-info",
          "review",
        ],
        "luxury-catering": [
          "service",
          "venue",
          "contact-info",
          "event-info",
          "luxury-catering-menu",
          "additional-info",
          "review",
        ],
        "team-catering": [
          "service",
          "contact-info",
          "event-info",
          "team-catering-menu",
          "additional-info",
          "review",
        ],
        "meal-plan": [
          "service",
          "contact-info",
          "meal-plan-info",
          "meal-plan-pricing",
          "review",
        ],
      }[e]);
    const t = document.querySelector(".form-step-wrapper");
    for (; t.children.length > 1; ) t.removeChild(t.lastChild);
    (x = []),
      E.forEach((e) => {
        const n = [...H].find((t) => t.dataset.step === e);
        x.push(n), "service" !== e && t.appendChild(n);
      });
  }
  function O(e) {
    if ((n(), e)) {
      (T = !0),
        setTimeout(() => {
          T = !1;
        }, C);
      const t = x[q],
        n = x[q + e];
      n && (n.style.visibility = "visible"),
        t &&
          setTimeout(() => {
            t.style.visibility = "hidden";
          }, C);
    }
    if (
      ((q += e),
      requestAnimationFrame(() => {
        x.forEach((e) => {
          e.style.transform = `translateX(${-100 * q}%)`;
        });
      }),
      t(),
      (function () {
        const e = document.querySelector(".form-title"),
          t = document.querySelector(".form-subtitle"),
          n = b["service-info"].venue,
          o = E[q];
        e.textContent = {
          service: "What brings you in?",
          venue: "Where will your event be held?",
          "luxury-catering-menu": "Luxury Catering Menu",
          "team-catering-menu": "Team Catering Menu",
          "private-event-menu": "Menu",
          "contact-info": "Contact Information",
          "event-info": "Event Information",
          "meal-plan-info": "Your Profile",
          "meal-plan-pricing": "Meal Plan Options",
          "additional-info": "Additional Information",
          review: "Review",
        }[o];
        const i = {
          service: "Select the service you're interested in.",
          venue: "Select the venue for your event.",
          "luxury-catering-menu":
            '\n          <div>View the full menu <a href="/menus/luxury-catering" class="form-link" target="_blank">here</a>.</div>\n        ',
          "team-catering-menu": "Scroll click or tap to view our menu.",
          "private-event-menu": "Scroll click or tap to view our menu.",
          "contact-info":
            "home" === n
              ? "Let us know a bit about you."
              : "Who should we conact to coordinate delivery?",
          "event-info": "Tell us more about the event.",
          "meal-plan-info":
            "Enter your information to build out your meal plan.",
          "meal-plan-pricing": "Select your meal plan.",
          "additional-info": "Tell us a little more about your booking.",
          review:
            "Click/Tap a section to make changes. " +
            ($ ? "" : "Scroll to submit."),
        };
        t.innerHTML = i[o];
      })(),
      k.classList.add("disabled"),
      S.classList.add("disabled"),
      setTimeout(() => {
        k.classList.remove("disabled"), S.classList.remove("disabled");
      }, 250),
      0 === q ? k.classList.add("hidden") : k.classList.remove("hidden"),
      $
        ? "review" === E[q]
          ? (S.textContent = "Submit")
          : (S.textContent = "Next")
        : "review" === E[q]
        ? ((S.style.opacity = 0), (S.style.pointerEvents = "none"))
        : ((S.style.opacity = 1), (S.style.pointerEvents = "auto")),
      0 !== q)
    )
      switch (E[q]) {
        case "venue":
          !(function () {
            const e = document.querySelector("[data-step='venue']"),
              t = e.querySelectorAll(".form-option");
            t.forEach((e) => {
              (e.tabIndex = 0), e.addEventListener("click", a);
            });
            const n = b["service-info"].venue || null;
            if (!n)
              return void t.forEach((e) => {
                e.classList.remove("selected");
              });
            const o = document.querySelector(`#${n}`);
            o.classList.add("selected");
            const i = o.offsetTop - 100;
            e.scrollTo(0, i);
          })();
          break;
        case "luxury-catering-menu":
          !(function (e) {
            if ("private-event-menu" === e || "team-catering-menu" === e)
              return;
            const t = document.querySelector(".cart-icon");
            (t.style.display = "block"),
              t.addEventListener("click", () => i("cart"));
            const n = document.querySelector(`[data-step='${e}']`),
              o = n.querySelectorAll(".menu-item"),
              r = n.querySelectorAll(".menu-item-quantity"),
              a = n.querySelectorAll(
                "[data-node-type='commerce-add-to-cart-button']"
              );
            a.forEach((e) => {
              e.disabled = !0;
            }),
              o.forEach((t, n) => {
                const o = t.querySelector(".menu-item-name").textContent;
                let i = t.querySelector(".menu-item-price").textContent;
                i = i
                  .replace("$", "")
                  .replace(".00", "")
                  .replace("USD", "")
                  .trim();
                const c = r[n];
                let s;
                (s = "Service Fee" === o ? 1 : L[e][o]?.quantity || 0),
                  s > 0
                    ? t.classList.add("selected")
                    : t.classList.remove("selected"),
                  (L[e][o] = {
                    price: i,
                    quantity: s,
                    input: c,
                    addToCartButton: a[n],
                  });
              });
            for (let t in L[e])
              "total" !== t &&
                (L[e][t].input.addEventListener("change", (t) => l(t, e)),
                (L[e][t].input.value = L[e][t].quantity),
                (L[e][t].input.min = 0));
            !(function (e) {
              const t = c(e);
              (L[e].total = t),
                s(e),
                sessionStorage.setItem("menuState", JSON.stringify(L));
            })(e);
          })("luxury-catering-menu");
          break;
        case "contact-info":
          !(function () {
            const e = document.querySelector("[data-step='contact-info']");
            let t;
            switch (((e.innerHTML = ""), b["service-info"].venue)) {
              case "home":
              default:
                t = ["name", "phone", "email"];
                break;
              case "yacht":
                t = ["poc-name", "poc-phone", "email"];
            }
            V.forEach((n) => {
              const o = n.querySelector("input, textarea");
              t.includes(o.name) &&
                (e.appendChild(n),
                b["contact-info"][o.name] &&
                  (o.value = b["contact-info"][o.name]));
            });
          })();
          break;
        case "event-info":
          !(function () {
            let e;
            const t = b["service-info"].service,
              n = b["service-info"].venue;
            switch (t) {
              case "private-event":
                e =
                  "yacht" === n
                    ? [
                        "marina-address",
                        "boat-name",
                        "date",
                        "time",
                        "party-size",
                      ]
                    : ["address", "date", "time", "party-size"];
                break;
              case "luxury-catering":
                e =
                  "yacht" === n
                    ? ["marina-address", "boat-name", "date", "time"]
                    : ["address", "date", "time"];
                break;
              case "team-catering":
                e = ["address", "date", "time"];
            }
            const o = document.querySelector(".event-info");
            (o.innerHTML = ""),
              A.forEach((t) => {
                const n = t.querySelector("input, textarea");
                if (
                  e.includes(n.name) &&
                  (o.appendChild(t),
                  b["event-info"][n.name] &&
                    (n.value = b["event-info"][n.name]),
                  "date" === n.name)
                ) {
                  const e = new Date(),
                    t = e.getFullYear(),
                    o = (e.getMonth() + 1).toString().padStart(2, "0"),
                    i = e.getDate().toString().padStart(2, "0");
                  n.min = `${t}-${o}-${i}`;
                }
              });
          })();
          break;
        case "meal-plan-info":
          document
            .querySelector("[data-step='meal-plan-info']")
            .querySelectorAll("input, textarea")
            .forEach((e) => {
              b["meal-plan-info"][e.name] &&
                ("checkbox" === e.type
                  ? (e.checked = b["meal-plan-info"][e.name])
                  : "radio" === e.type
                  ? e.value === b["meal-plan-info"][e.name] && (e.checked = !0)
                  : (e.value = b["meal-plan-info"][e.name]));
            });
          break;
        case "meal-plan-pricing":
          M ||
            ((function () {
              const e = [
                  "https://buy.stripe.com/3csdRNegV3YogAU00u",
                  "https://buy.stripe.com/3cs6pl4Gl1Qg0BW00t",
                  "https://buy.stripe.com/5kAcNJ3Ch9iI3O86oQ",
                ],
                t = document
                  .querySelector("[data-step='meal-plan-pricing']")
                  .querySelectorAll(".form-option:not(.custom)"),
                o = [];
              t.forEach((i, r) => {
                i.id = "meals-" + 5 * (r + 1);
                const a = (o) =>
                  (function (o, i) {
                    if (T) return;
                    const r = o.target.closest(".form-option");
                    if (!r) return;
                    n(),
                      t.forEach((e) => {
                        e !== r
                          ? e.classList.remove("selected")
                          : e.classList.add("selected");
                      });
                    const a = r
                        .querySelector(".meal-plan-text")
                        .textContent.toLowerCase()
                        .replace("meals", "")
                        .trim(),
                      c = e[i];
                    (b["service-info"]["meal-plan"] = a),
                      (b["checkout-link"] = c),
                      O(1),
                      sessionStorage.setItem("userInput", JSON.stringify(b));
                  })(o, r);
                (o[r] = a),
                  o[r] && i.removeEventListener("click", o[r]),
                  i.addEventListener("click", a);
              });
              const i = sessionStorage.getItem("mealPlanLink");
              if (i)
                document.querySelector(`#meals-${i}`).classList.add("selected"),
                  (b["service-info"]["meal-plan"] = i),
                  sessionStorage.removeItem("mealPlanLink");
              else if (b["service-info"]["meal-plan"]) {
                const e = b["service-info"]["meal-plan"];
                document.querySelector(`#meals-${e}`).classList.add("selected");
              }
            })(),
            (M = !0));
          break;
        case "review":
          !(function () {
            const e = document.querySelector(".order-form");
            e.innerHTML =
              '\n    <input\n      type="submit"\n      value="Submit"\n      data-wait="Please wait..."\n      class="w-button"\n    />\n  ';
            let t = ["service-info", "contact-info", "event-info"];
            "meal-plan" === b["service-info"].service &&
              (t = ["service-info", "contact-info", "meal-plan-info"]);
            for (let e in t) {
              const o = b[t[e]];
              for (let e in o) n(e, o[e]);
            }
            if ("luxury-catering" === b["service-info"].service)
              for (let e in L["luxury-catering-menu"])
                n(
                  e,
                  "total" !== e
                    ? L["luxury-catering-menu"][e].quantity
                    : L["luxury-catering-menu"][e]
                );
            function n(t, n) {
              const o = document.createElement("input");
              (o.name = t), (o.value = n), e.appendChild(o);
            }
            n("additional-info", b["additional-info"]);
          })(),
            (function () {
              const e = document.querySelector(".review-info");
              document.querySelector(".review-header").onclick = () =>
                i("service");
              const t = document.querySelector(
                  ".review-header .review-item-value"
                ),
                n = b["service-info"].service;
              let o = n.replaceAll("-", " ");
              function i(e) {
                const t = x.find((t) => t.dataset.step === e);
                O(x.indexOf(t) - q);
              }
              function r(e) {
                const [t, n, o] = e.split("-").map(Number);
                return `${n}/${o}/${t}`;
              }
              function a(e) {
                const [t, n] = e.split(":").map(Number);
                let o = t % 12;
                return (
                  0 === o && (o = 12),
                  `${o}:${n < 10 ? "0" + n : n} ${t < 12 ? "AM" : "PM"}`
                );
              }
              "meal plan" === o &&
                (o += ` (${b["service-info"]["meal-plan"]} meals/week)`),
                (t.textContent = o),
                t.classList.add("capitalize"),
                (e.innerHTML = ""),
                (function () {
                  const t = document.createElement("div");
                  t.classList.add("review-section"),
                    (t.onclick = () => i("contact-info")),
                    e.appendChild(t);
                  const n = document.createElement("div");
                  n.classList.add("label"),
                    (n.textContent = "Contact Info:"),
                    t.appendChild(n);
                  const o = document.createElement("div");
                  o.classList.add("edit-icon"),
                    (o.innerHTML =
                      '\n      <svg height="100%" width="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>\n    '),
                    t.appendChild(o);
                  const r = b["contact-info"];
                  for (let e in r) {
                    const n = document.createElement("div"),
                      o = e.replaceAll("-", " ");
                    let i = r[e];
                    ("phone" !== e && "poc-phone" !== e) ||
                      (i = i.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")),
                      n.classList.add("review-item"),
                      (n.innerHTML = `\n              <div class="review-item-name">${o}:</div>\n              <div class="review-item-value">${i}</div> \n          `),
                      t.appendChild(n);
                  }
                })(),
                "meal-plan" === n
                  ? (function () {
                      const t = document.createElement("div");
                      t.classList.add("review-section"),
                        (t.onclick = () => i("meal-plan-info")),
                        e.appendChild(t);
                      const n = document.createElement("div");
                      n.classList.add("label"),
                        (n.textContent = "Your Profile"),
                        t.appendChild(n);
                      const o = document.createElement("div");
                      o.classList.add("edit-icon"),
                        (o.innerHTML =
                          '\n      <svg height="100%" width="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>\n    '),
                        t.appendChild(o);
                      const r = b["meal-plan-info"];
                      for (let e in r) {
                        if ("height-ft" === e) {
                          const e = document.createElement("div"),
                            n = "Height";
                          let o = r["height-ft"] + "'" + r["height-in"] + '"';
                          e.classList.add("review-item"),
                            (e.innerHTML = `\n              <div class="review-item-name">${n}:</div>\n              <div class="review-item-value capitalize">${o}</div>\n          `),
                            t.appendChild(e);
                          continue;
                        }
                        const n = document.createElement("div"),
                          o = e.replaceAll("-", " ");
                        let i = r[e];
                        "string" == typeof i && (i = i.replaceAll("-", " ")),
                          i &&
                            "notice-confirmation" !== e &&
                            "height-in" !== e &&
                            (n.classList.add("review-item"),
                            (n.innerHTML = `\n              <div class="review-item-name">${o}:</div>\n              <div class="review-item-value capitalize">${i}</div>\n          `),
                            t.appendChild(n));
                      }
                    })()
                  : (function () {
                      const t = document.createElement("div");
                      t.classList.add("review-section"),
                        (t.onclick = () => i("event-info")),
                        e.appendChild(t);
                      const n = document.createElement("div");
                      n.classList.add("label"),
                        (n.textContent = "Event:"),
                        t.appendChild(n);
                      const o = document.createElement("div");
                      o.classList.add("edit-icon"),
                        (o.innerHTML =
                          '\n      <svg height="100%" width="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>\n    '),
                        t.appendChild(o);
                      const c = b["event-info"];
                      for (let e in c) {
                        if ("event" === e || "venue" === e) continue;
                        const n = document.createElement("div");
                        let o = e.replaceAll("-", " ");
                        "address" === o &&
                          "yacht" === c.venue &&
                          (o = "Marina Address");
                        let i = c[e];
                        "date" === e && (i = r(i)),
                          "time" === e && (i = a(i)),
                          n.classList.add("review-item"),
                          (n.innerHTML = `\n            <div class="review-item-name">${o}:</div>\n            <div class="review-item-value capitalize">${i}</div>\n        `),
                          t.appendChild(n);
                      }
                    })(),
                "luxury-catering" === n &&
                  (function () {
                    const t = document.createElement("div");
                    t.classList.add("review-section"),
                      (t.onclick = () => i("luxury-catering-menu")),
                      e.appendChild(t);
                    const n = document.createElement("div");
                    n.classList.add("label"),
                      (n.textContent = "Food:"),
                      t.appendChild(n);
                    const o = document.createElement("div");
                    o.classList.add("edit-icon"),
                      (o.innerHTML =
                        '\n      <svg height="100%" width="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>\n    '),
                      t.appendChild(o);
                    for (let e in L["luxury-catering-menu"]) {
                      if ("total" === e) continue;
                      const n = L["luxury-catering-menu"][e].quantity;
                      if (0 === n) continue;
                      const o = L["luxury-catering-menu"][e].price,
                        i = document.createElement("div");
                      i.classList.add("review-item"),
                        (i.innerHTML = `\n            <div class="review-flex">\n              <div class="menu-item-value">${n}</div>\n              <div class="review-item-name">${e}</div>\n            </div>\n            <div class="dotted-line"></div>\n            <div class="review-item-price">$${
                          n * o
                        }</div>\n        `),
                        t.appendChild(i);
                    }
                    const r = document.createElement("div");
                    r.classList.add("review-item", "total"),
                      (r.innerHTML = `\n          <div class="label total">Total:</div>\n          <div class="dotted-line"></div>\n          <div class="review-item-price total">$${L["luxury-catering-menu"].total}</div>\n        `),
                      t.appendChild(r);
                  })(),
                b["additional-info"] &&
                  (function () {
                    const t = document.createElement("div");
                    t.classList.add("review-section"),
                      (t.onclick = () => i("additional-info")),
                      e.appendChild(t);
                    const n = document.createElement("div");
                    n.classList.add("label"),
                      (n.textContent = "Additional Info:"),
                      t.appendChild(n);
                    const o = document.createElement("div");
                    o.classList.add("edit-icon"),
                      (o.innerHTML =
                        '\n      <svg height="100%" width="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>\n    '),
                      t.appendChild(o);
                    const r = b["additional-info"],
                      a = document.createElement("div");
                    a.classList.add("review-item"),
                      (a.textContent = r),
                      t.appendChild(a);
                  })(),
                $ ||
                  (function () {
                    const t = document.createElement("input");
                    (t.onclick = w ? p : m),
                      (t.value = "Submit"),
                      t.classList.add("button", "w-button"),
                      e.appendChild(t);
                  })();
            })();
      }
  }
  I(),
    (function () {
      (function () {
        const e = document.createElement("style");
        document.head.appendChild(e),
          (e.innerHTML = `\n      .w-webflow-badge {\n        display: none !important;\n      }\n\n      .form-option.selected {\n        box-shadow: 0 0 0 2px #202947;\n      }\n\n      .button:focus {\n        outline: none;\n        box-shadow: 0 0 0 1px #aaf;\n      }\n\n      .order-form-success,\n      .order-form-error {\n        transition: opacity 500ms ease-in-out 500ms;\n      }\n          \n      .form-step {\n        transition: transform ${C}ms ease-in-out;\n      }\n\n      .button.disabled {\n        pointer-events: none;\n      }\n\n      .button.hidden {\n        pointer-events: none;\n        opacity: 0 !important;\n      }\n\n      .form-button.disabled {\n        pointer-events: none;\n      }\n\n      .form-button.hidden {\n        pointer-events: none;\n        opacity: 0 !important;\n      }\n\n      .form-card .button.is-secondary {\n        opacity: 1;\n      }\n\n      .loader {\n        position: absolute;\n        inset: 0;\n        z-index: 100;\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n      }\n      \n      .loader-icon {\n        width: 5rem;\n        height: 5rem;\n        border-radius: 50%;\n        border: 0.25rem solid #fff;\n        border-top: 0.25rem solid #000;\n        animation: spin 1s linear infinite;\n      }\n      \n      @keyframes spin {\n        0% { transform: rotate(0deg); }\n        100% { transform: rotate(360deg); }\n      }\n\n      .modal {\n        display: none;\n        position: fixed;\n        inset: 0;\n        background-color: rgba(0, 0, 0, 0.5);\n      }\n      \n      .modal-content {\n        position: absolute;\n        top: 10vh;\n        left: 5vw;\n        background-color: #fff;\n        padding: 0.5rem;\n        height: 80vh;\n        width: 90vw;\n      }\n      \n      #open-log-modal {\n        position: absolute;\n        bottom: 5px;\n        right: 5px;\n      }\n\n      .close {\n        cursor: pointer;\n      }\n  `);
      })(),
        b["meal-plan-info"] || (b["meal-plan-info"] = {}),
        b["contact-info"] || (b["contact-info"] = {}),
        b["event-info"] || (b["event-info"] = {}),
        b["service-info"] || (b["service-info"] = {}),
        L["luxury-catering-menu"] || (L["luxury-catering-menu"] = {}),
        L["team-catering-menu"] || (L["team-catering-menu"] = {}),
        document.querySelectorAll(".form-option-image").forEach((e) => {
          e.draggable = !1;
        }),
        document.querySelectorAll(".form-icon").forEach((e) => {
          e.draggable = !1;
        }),
        w &&
          ((function () {
            const e = document.createElement("div");
            function t(t, n) {
              const o = document.createElement("button");
              (o.textContent = t),
                o.addEventListener("click", n),
                e.appendChild(o);
            }
            (e.style.display = "flex"),
              (e.style.gap = "5px"),
              (e.style.position = "absolute"),
              (e.style.bottom = "5px"),
              (e.style.left = "5px"),
              document.body.appendChild(e),
              t("Refresh", function () {
                sessionStorage.clear(), window.location.reload();
              }),
              t("State", function () {
                console.log(b), console.log(L);
                let e = !1;
                for (let t in L["luxury-catering-menu"])
                  L["luxury-catering-menu"][t].quantity > 0 &&
                    (console.log(t, L["luxury-catering-menu"][t].quantity),
                    (e = !0));
                e || console.log("No items selected");
              }),
              t("Checkout", function () {
                const e = b["checkout-link"] || "/checkout";
                window.open(e, "_blank").focus();
              }),
              t("Skip", function () {
                O(x.length - 1 - q);
              });
          })(),
          (function () {
            const e = document.createElement("div");
            (e.id = "logModal"), (e.className = "modal");
            const t = document.createElement("div");
            t.className = "modal-content";
            const n = document.createElement("span");
            (n.className = "close"), (n.innerHTML = "&times;");
            const o = document.createElement("pre");
            (o.id = "logContainer"),
              t.appendChild(n),
              t.appendChild(o),
              e.appendChild(t),
              document.body.appendChild(e);
            const i = document.createElement("button");
            (i.id = "open-log-modal"),
              (i.textContent = "Log"),
              document.body.appendChild(i),
              i.addEventListener("click", () => {
                e.style.display = "block";
              }),
              n.addEventListener("click", () => {
                e.style.display = "none";
              }),
              (window.logToModal = function (e) {
                let t;
                if ("string" == typeof e) t = document.createTextNode(e + "\n");
                else if (e instanceof HTMLElement) {
                  let n = window.getComputedStyle(e),
                    o = e.attributes,
                    i = "Styles:\n";
                  for (let e of n) i += `${e}: ${n.getPropertyValue(e)}\n`;
                  let r = "Attributes:\n";
                  for (let e of o) r += `${e.name}=${e.value}\n`;
                  t = document.createTextNode(
                    `Element: ${e.tagName}\n${i}\n${r}\n`
                  );
                }
                t && document.getElementById("logContainer").appendChild(t);
              });
          })(),
          logToModal("Initialized form")),
        (function () {
          const e =
            navigator.userAgent.indexOf("Chrome") > -1 ||
            navigator.userAgent.indexOf("CriOS") > -1;
          return (
            navigator.userAgent.indexOf("Safari") > -1 &&
            !e &&
            window.innerWidth < 991
          );
        })() && (document.body.style.overflow = "hidden");
      const e = sessionStorage.getItem("serviceLink");
      if (e)
        document.querySelector(`#${e}`).classList.add("selected"),
          (b["service-info"].service = e),
          sessionStorage.removeItem("serviceLink");
      else if (b["service-info"].service) {
        const e = b["service-info"].service;
        document.querySelector(`#${e}`).classList.add("selected");
      }
      if (b["service-info"].service) {
        const e = document.querySelector("[data-step='service']"),
          t = b["service-info"].service,
          n = document.querySelector(`#${t}`).offsetTop - 100;
        e.scrollTo(0, n);
      }
      N(),
        document
          .querySelector("[data-step='service']")
          .querySelectorAll(".form-option")
          .forEach((e) => {
            (e.tabIndex = 0), e.addEventListener("click", r);
          }),
        O(0);
    })();
})();
