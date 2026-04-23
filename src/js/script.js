  /* ===============================================
  # タブ切り替え
  // =============================================== */
  function setupTabs(navItemSelector, panelSelector, navItemCurrentClass, panelCurrentClass) {
    const navItems = document.querySelectorAll(navItemSelector);
    const panels = document.querySelectorAll(panelSelector);
    if (!navItems.length || !panels.length) return;

    navItems.forEach((navItem, index) => {
      const button = navItem.querySelector("button");
      if (!button) return;
      button.addEventListener("click", () => {
        navItems.forEach((item) => item.classList.remove(navItemCurrentClass));
        panels.forEach((panel) => panel.classList.remove(panelCurrentClass));
        navItem.classList.add(navItemCurrentClass);
        if (panels[index]) panels[index].classList.add(panelCurrentClass);
      });
    });
  }

  setupTabs(
    ".js-beginner-guide-tab",
    ".js-beginner-guide-panel",
    "gas-water-heater-beginner-guide__nav-item--current",
    "gas-water-heater-beginner-guide__panel--current"
  );

  /* ===============================================
  # アコーディオン
  // =============================================== */
  function setupAccordion(triggerSelector, bodySelector, openClass) {
    const triggers = document.querySelectorAll(triggerSelector);
    if (!triggers.length) return;

    triggers.forEach((trigger) => {
      const item = trigger.parentElement;
      if (!item) return;
      const body = item.querySelector(bodySelector);
      if (!body) return;

      trigger.addEventListener("click", () => {
        const isOpen = item.classList.toggle(openClass);
        trigger.setAttribute("aria-expanded", String(isOpen));
        body.style.maxHeight = isOpen ? body.scrollHeight + "px" : "0";
      });
    });
  }

  setupAccordion(".js-sign-trigger", ".js-sign-body", "is-open");
