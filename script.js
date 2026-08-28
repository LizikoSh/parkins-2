(() => {
  "use strict";

  const body = document.body;
  const root = document.documentElement;

  // ---------------------------------------------------------------------------
  // Mobile navigation
  // ---------------------------------------------------------------------------
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");

  const closeMenu = () => {
    if (!menuToggle || !siteNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  };

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      siteNav.classList.toggle("is-open", !isOpen);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (!siteNav.classList.contains("is-open")) return;
      if (siteNav.contains(event.target) || menuToggle.contains(event.target)) return;
      closeMenu();
    });
  }

  // ---------------------------------------------------------------------------
  // Accessibility: font size
  // ---------------------------------------------------------------------------
  const FONT_MIN = 0.9;
  const FONT_MAX = 1.25;
  const FONT_STEP = 0.1;
  let fontScale = Number(localStorage.getItem("parkinsFontScale")) || 1;

  const applyFontScale = () => {
    fontScale = Math.min(FONT_MAX, Math.max(FONT_MIN, fontScale));
    root.style.setProperty("--font-scale", fontScale.toFixed(2));
    localStorage.setItem("parkinsFontScale", fontScale.toFixed(2));
  };

  applyFontScale();

  document.querySelectorAll("[data-font-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.fontAction;
      if (action === "reset") {
        fontScale = 1;
      } else {
        fontScale += action === "increase" ? FONT_STEP : -FONT_STEP;
      }
      applyFontScale();
    });
  });

  // ---------------------------------------------------------------------------
  // Accessibility: high contrast
  // ---------------------------------------------------------------------------
  const contrastToggle = document.getElementById("contrastToggle");
  const savedContrast = localStorage.getItem("parkinsContrast") === "true";

  body.classList.toggle("high-contrast", savedContrast);
  contrastToggle?.setAttribute("aria-pressed", String(savedContrast));

  contrastToggle?.addEventListener("click", () => {
    const enabled = !body.classList.contains("high-contrast");
    body.classList.toggle("high-contrast", enabled);
    contrastToggle.setAttribute("aria-pressed", String(enabled));
    localStorage.setItem("parkinsContrast", String(enabled));
  });

  // ---------------------------------------------------------------------------
  // Search helpers
  // ---------------------------------------------------------------------------
  const searchInput = document.getElementById("searchInput");
  const searchClear = document.getElementById("searchClear");
  const searchStatus = document.getElementById("searchStatus");

  const normalise = (value) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, "")
      .trim();

  // ---------------------------------------------------------------------------
  // Home page: site-wide topic search
  // ---------------------------------------------------------------------------
  const searchResults = document.getElementById("searchResults");
  const SITE_SEARCH_INDEX = [
    {
      title: "Перші кроки після діагнозу",
      url: "first-steps.html",
      description: "Що робити спочатку, як підготувати запитання і не перевантажити себе інформацією.",
      keywords: "діагноз вперше початок перші кроки що робити"
    },
    {
      title: "Що таке хвороба Паркінсона",
      url: "understand.html#osnovne-pro-khvorobu",
      description: "Основне про хворобу, діагностику, паркінсонізм і поширені міфи.",
      keywords: "паркінсон що це діагноз паркінсонізм тремор міфи"
    },
    {
      title: "Ходьба, завмирання і падіння",
      url: "daily-life.html#freezing",
      description: "Що таке завмирання під час ходьби, як описати епізод і що врахувати для безпеки.",
      keywords: "ходьба завмирання падіння рівновага крок двері freezing"
    },
    {
      title: "Що робити після падіння",
      url: "daily-life.html#fall",
      description: "Короткі дії після падіння та ознаки, коли потрібна медична оцінка.",
      keywords: "падіння впав впала після падіння травма"
    },
    {
      title: "Сон і нічна безпека",
      url: "daily-life.html#sleep",
      description: "Нічні пробудження, яскраві сни, денна сонливість і нотатки для лікаря.",
      keywords: "сон безсоння сни ніч денна сонливість втома"
    },
    {
      title: "Харчування і вода",
      url: "nutrition.html",
      description: "Рідина, вага, апетит, закрепи, час їжі та зв’язок із прийманням ліків.",
      keywords: "харчування їжа вода рідина вага апетит закреп нудота"
    },
    {
      title: "Ковтання і кашель під час їжі",
      url: "nutrition.html#swallowing",
      description: "Ознаки порушення ковтання, які варто обговорити з лікарем або профільним фахівцем.",
      keywords: "ковтання кашель їжа вода голос захлинається дисфагія"
    },
    {
      title: "Лікування і команда допомоги",
      url: "treatment.html",
      description: "Роль препаратів, фізичної терапії, ерготерапії, мовлення, харчування і психічного здоров’я.",
      keywords: "лікування ліки препарати невролог терапія фахівці реабілітація"
    },
    {
      title: "Ліки діють нерівномірно",
      url: "understand.html#likuvannia-i-zminy-vprodovzh-dnia",
      description: "Що фіксувати про час приймання, початок дії та періоди кращого або гіршого контролю симптомів.",
      keywords: "ліки дія препарати on off увімкнення вимкнення час приймання"
    },
    {
      title: "Підготовка до прийому лікаря",
      url: "doctor-visit.html",
      description: "Чекліст препаратів, симптомів, падінь, змін сну і трьох головних запитань.",
      keywords: "лікар прийом консультація питання нотатки список препаратів"
    },
    {
      title: "Рух і фізична активність",
      url: "movement.html#exercise-guidance",
      description: "Безпечні орієнтири 2026: аеробна активність, сила, рівновага і рухливість.",
      keywords: "рух вправи тренування активність спорт рівновага сила фізична терапія"
    },
    {
      title: "Тривога, апатія і пригнічений настрій",
      url: "emotional-support.html",
      description: "Емоційні зміни, невеликі опори на складний день і ситуації, коли варто звернутися по допомогу.",
      keywords: "настрій тривога апатія депресія пригнічення мотивація емоції"
    },
    {
      title: "Для близьких",
      url: "relatives.html",
      description: "Як допомагати, не забираючи самостійність, і як берегти власні сили.",
      keywords: "близькі родина догляд підтримка чоловік дружина мама тато"
    },
    {
      title: "Допомога в Україні",
      url: "support-ukraine.html",
      description: "Офіційні джерела про стандарт допомоги, Доступні ліки, безоплатні послуги та оцінювання функціонування.",
      keywords: "україна моз доступні ліки безоплатно допомога програма стандарт"
    }
  ];

  const renderHomeSearch = () => {
    if (!searchInput || !searchResults || !body.classList.contains("home-page")) return;

    const query = normalise(searchInput.value || "");
    searchResults.innerHTML = "";

    if (!query) {
      searchResults.hidden = true;
      if (searchStatus) searchStatus.textContent = "";
      return;
    }

    const terms = query.split(/\s+/).filter(Boolean);
    const matches = SITE_SEARCH_INDEX.map((item) => {
      const haystack = normalise(`${item.title} ${item.description} ${item.keywords}`);
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return { item, score };
    })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 7);

    if (!matches.length) {
      const empty = document.createElement("div");
      empty.className = "search-empty";
      empty.innerHTML = "<strong>Нічого не знайшли.</strong><span>Спробуйте коротше слово: «сон», «ліки», «падіння», «ковтання».</span>";
      searchResults.append(empty);
      searchResults.hidden = false;
      if (searchStatus) searchStatus.textContent = "Матеріалів не знайдено";
      return;
    }

    matches.forEach(({ item }) => {
      const link = document.createElement("a");
      link.className = "search-result";
      link.href = item.url;
      link.innerHTML = `<strong>${item.title}</strong><span>${item.description}</span>`;
      searchResults.append(link);
    });

    searchResults.hidden = false;
    if (searchStatus) searchStatus.textContent = `Знайдено: ${matches.length}`;
  };

  // ---------------------------------------------------------------------------
  // Inner-page local search (e.g. "Про хворобу")
  // ---------------------------------------------------------------------------
  const searchableItems = Array.from(document.querySelectorAll(".searchable"));

  const runLocalSearch = () => {
    if (!searchInput || body.classList.contains("home-page")) return;
    const query = normalise(searchInput.value || "");
    let visibleCount = 0;

    searchableItems.forEach((item) => {
      const content = normalise(`${item.dataset.search || ""} ${item.textContent || ""}`);
      const matches = !query || content.includes(query);
      item.classList.toggle("is-hidden", !matches);
      if (matches) visibleCount += 1;
    });

    if (!searchStatus) return;
    if (!query) searchStatus.textContent = "";
    else if (visibleCount === 0) searchStatus.textContent = "Нічого не знайдено. Спробуйте коротше слово або іншу форму запиту.";
    else searchStatus.textContent = `Знайдено матеріалів: ${visibleCount}`;
  };

  searchInput?.addEventListener("input", () => {
    renderHomeSearch();
    runLocalSearch();
  });

  searchClear?.addEventListener("click", () => {
    if (!searchInput) return;
    searchInput.value = "";
    renderHomeSearch();
    runLocalSearch();
    searchInput.focus();
  });

  document.querySelectorAll("[data-search-query]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!searchInput) return;
      searchInput.value = button.dataset.searchQuery || "";
      renderHomeSearch();
      searchInput.focus();
    });
  });

  document.getElementById("siteSearch")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const first = searchResults?.querySelector(".search-result");
    first?.focus();
  });

  // ---------------------------------------------------------------------------
  // Accordions
  // ---------------------------------------------------------------------------
  document.querySelectorAll(".accordion__button").forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      const panel = button.closest(".accordion")?.querySelector(".accordion__panel");
      button.setAttribute("aria-expanded", String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });

  // ---------------------------------------------------------------------------
  // Exercise filters
  // ---------------------------------------------------------------------------
  const filterButtons = document.querySelectorAll(".filter-button");
  const exerciseCards = document.querySelectorAll(".exercise-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      exerciseCards.forEach((card) => {
        const matches = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-filtered", !matches);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Support-action buttons
  // ---------------------------------------------------------------------------
  document.querySelectorAll(".support-actions button").forEach((button) => {
    button.addEventListener("click", () => button.classList.toggle("is-selected"));
  });

  // ---------------------------------------------------------------------------
  // Modals with basic focus management
  // ---------------------------------------------------------------------------
  let activeModal = null;
  let previouslyFocused = null;

  const closeModal = () => {
    if (!activeModal) return;
    activeModal.hidden = true;
    body.classList.remove("is-modal-open");
    previouslyFocused?.focus();
    activeModal = null;
    previouslyFocused = null;
  };

  const openModal = (modal) => {
    if (!modal) return;
    activeModal = modal;
    previouslyFocused = document.activeElement;
    modal.hidden = false;
    body.classList.add("is-modal-open");
    modal.querySelector(".modal__close")?.focus();
  };

  document.querySelectorAll(".modal-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => openModal(document.getElementById(trigger.dataset.modal)));
  });

  document.querySelectorAll("[data-modal-close]").forEach((closeControl) => {
    closeControl.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      closeMenu();
    }

    if (event.key === "Tab" && activeModal) {
      const focusable = Array.from(
        activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter((element) => !element.hasAttribute("disabled"));

      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Print checklist
  // ---------------------------------------------------------------------------
  document.getElementById("printChecklist")?.addEventListener("click", () => window.print());

  // ---------------------------------------------------------------------------
  // Disabled demo links, if any remain
  // ---------------------------------------------------------------------------
  document.querySelectorAll(".disabled-link").forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });

  // ---------------------------------------------------------------------------
  // Footer year
  // ---------------------------------------------------------------------------
  const currentYear = document.getElementById("currentYear");
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
})();
