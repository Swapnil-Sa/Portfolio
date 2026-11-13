"use strict";

/* Sample spreadsheet values are illustrative; ! marks messy values. */
const SHEETS = [
  { name: "Sales_Data.xlsx", columns: ["Order", "Date", "Product", "Category", "Qty", "Price"], rows: [["1001", "1/5/24", "Laptop", "Electronics", "2", "899.99"], ["1002", "1/6/24", "Mouse", "Electronics", "1", "25.50"], ["1003", "1/6/24", "Keyboard", "!null", "3", "45.00"], ["1004", "1/7/24", "Monitor", "Electronics", "1", "199.99"], ["1005", "!1-8-24", "Laptop", "Electronics", "!-", "899.99"], ["1006", "1/9/24", "Chair", "Furniture", "3", "!N/A"]] },
  { name: "Customers.xlsx", columns: ["Cust_ID", "Name", "City", "Country", "Joined", "Tier"], rows: [["C001", "Aarav", "Delhi", "India", "2021-06-14", "Gold"], ["C002", "Sneha", "Mumbai", "!Unknown", "2020-11-02", "Silver"], ["C003", "Rohan", "!-", "India", "2022-01-19", "Bronze"], ["C004", "Priya", "Pune", "India", "!null", "Gold"], ["C005", "Karan", "Delhi", "!india", "2023-03-12", "Silver"], ["C006", "Anita", "Chennai", "India", "2023-08-30", "!Gold"]] },
  { name: "Marketing.xlsx", columns: ["Campaign", "Channel", "Spend", "Clicks", "CTR", "Conv."], rows: [["Summer", "Email", "5000", "2300", "2.5%", "210"], ["Diwali", "Social", "8000", "5400", "1.6%", "480"], ["NewYear", "Social", "!-", "3900", "2.0%", "90"], ["Launch", "TV", "15000", "!null", "1.4%", "70"], ["Flash", "Email", "3000", "1900", "!?", "55"], ["Retarget", "Email", "4500", "620", "2.1%", "!-"]] },
  { name: "Inventory.xlsx", columns: ["SKU", "Item", "Stock", "Reorder", "Price", "Status"], rows: [["P001", "Laptop", "50", "20", "899.99", "In Stock"], ["P002", "Mouse", "!0", "15", "25.50", "Out of Stock"], ["P003", "Keyboard", "120", "!-", "45.00", "In Stock"], ["P004", "Monitor", "5", "10", "199.99", "!Low Stock"], ["P005", "Chair", "20", "10", "149.99", "In Stock"], ["P006", "Desk", "!null", "5", "299.99", "Unknown"]] }
];

function makeElement(tag, text = "", className = "") {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function buildSheets() {
  document.querySelectorAll("[data-sheet]").forEach(box => {
    const sheet = SHEETS[Number(box.dataset.sheet)];
    if (!sheet) return;
    const title = makeElement("div", sheet.name, "sheet-bar");
    const menu = makeElement("div", "", "sheet-menu");
    ["File", "Home", "Insert", "Formulas", "Data"].forEach(label => menu.appendChild(makeElement("span", label)));
    const grid = makeElement("div", "", "sheet-grid");
    sheet.columns.forEach(label => grid.appendChild(makeElement("span", label, "h")));
    sheet.rows.forEach(row => row.forEach(value => {
      const messy = value.startsWith("!");
      grid.appendChild(makeElement("span", messy ? value.slice(1) : value, messy ? "bad" : ""));
    }));
    box.replaceChildren(title, menu, grid);
  });
}

function initializeIntro() {
  const intro = document.getElementById("intro");
  const site = document.getElementById("site");
  const button = document.getElementById("flip-trigger");
  const replay = document.getElementById("replay-intro");
  if (!intro || !site || !button) return;

  const title = document.getElementById("intro-title");
  const subtitle = document.getElementById("intro-subtitle");
  const caption = document.getElementById("intro-caption");
  const label = document.getElementById("flip-button-label");
  const step = document.getElementById("intro-step");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const timers = new Set();
  let state = "ready";

  function later(fn, ms) {
    const id = window.setTimeout(() => { timers.delete(id); if (state !== "entered") fn(); }, ms);
    timers.add(id);
  }
  function clearTimers() { timers.forEach(id => clearTimeout(id)); timers.clear(); }
  function markStage(stageName, stageLabel, description) {
    intro.dataset.phase = stageName;
    step.textContent = stageLabel;
    subtitle.textContent = description;
  }
  function rememberVisit() {
    try { sessionStorage.setItem("portfolio-intro-seen", "1"); } catch (_) { /* disabled storage */ }
  }
  function revealPortfolio(options = {}) {
    if (state === "entered") return;
    const cinematic = options.cinematic === true && state === "running" &&
      intro.dataset.phase === "insight" && !reducedMotion.matches &&
      typeof window.runDashboardHandoff === "function";
    state = "entered";
    clearTimers();
    rememberVisit();
    site.removeAttribute("inert");
    const heading = site.querySelector("#home h1");
    if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
    intro.setAttribute("inert", "");
    intro.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("intro-active");

    const finish = () => {
      intro.hidden = true;
      intro.classList.remove("is-ready", "is-leaving", "is-shattering");
      window.scrollTo({top:0,behavior:"instant"});
      document.dispatchEvent(new Event("portfolio:entered"));
    };
    if (cinematic) {
      window.runDashboardHandoff({intro, site, finish});
    } else {
      document.documentElement.classList.remove("v14-intro-pending");
      intro.classList.add("is-leaving");
      document.dispatchEvent(new Event("portfolio:entering"));
      if (reducedMotion.matches) finish();
      else window.setTimeout(finish, 560);
    }
  }
  function transformOnce() {
    if (state !== "ready") return;
    state = "running";
    button.disabled = true;
    label.textContent = "Analyzing the sheets…";
    if (reducedMotion.matches) {
      markStage("insight", "05 / INSIGHT", "An illustrative report is ready.");
      title.textContent = "Now the story is clearer.";
      caption.textContent = "The real projects are next.";
      later(revealPortfolio, 500);
      return;
    }
    markStage("inspect", "02 / INSPECT", "Identifying inconsistent fields and missing values.");
    later(() => {
      markStage("clean", "03 / PREPARE", "Correct the formats. Keep the useful records.");
      label.textContent = "Preparing the data…";
    }, 650);
    later(() => {
      markStage("structure", "03 / PREPARE", "A structured dataset begins to take shape.");
    }, 1450);
    later(() => {
      markStage("visualize", "04 / VISUALIZE", "From prepared tables to charts and comparisons.");
      label.textContent = "Building the insight…";
    }, 2400);
    later(() => {
      markStage("insight", "05 / INSIGHT", "A clearer picture. A question worth exploring.");
      title.textContent = "Now the story is clearer.";
      caption.textContent = "Illustrative transformation · the real projects are next.";
      label.textContent = "Opening the portfolio…";
    }, 3250);
    later(() => revealPortfolio({cinematic:true}), 5000);
  }

  let hasSeenIntro = false;
  try { hasSeenIntro = sessionStorage.getItem("portfolio-intro-seen") === "1"; } catch (_) {}
  if (!hasSeenIntro && !window.location.hash) {
    intro.classList.add("is-ready");
    document.documentElement.classList.add("intro-active");
    site.setAttribute("inert", "");
  } else {
    state = "entered";
    intro.hidden = true;
    document.documentElement.classList.remove("v14-intro-pending");
  }
  button.addEventListener("click", transformOnce);
  document.getElementById("intro-skip")?.addEventListener("click", revealPortfolio);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && state !== "entered") revealPortfolio();
  });
  replay?.addEventListener("click", () => {
    try { sessionStorage.removeItem("portfolio-intro-seen"); } catch (_) {}
    try { history.replaceState(null, "", location.pathname + location.search); } catch (_) {}
    location.reload();
  });
}

/* Progressive disclosure: keep confirmed skills visible and give visitors practical context. */
const SKILL_DETAILS = {
  business: { eyebrow: "BUSINESS CONTEXT / DECISION MAKING", title: "Define the question clearly.", description: "Understand the business question, choose metrics that explain it, and turn observations into an actionable recommendation.", flow: ["Business question", "Relevant KPI", "Decision"], example: "Investigate whether delivery delays are associated with customer satisfaction in the Olist analysis." },
  statistics: { eyebrow: "STATISTICAL THINKING / INTERPRETATION", title: "Understand the signal behind the numbers.", description: "Use descriptive statistics, distributions, variation and relationships to describe patterns carefully and interpret uncertainty.", flow: ["Distribution", "Comparison", "Interpretation"], example: "Compare delivery-delay distributions and customer-rating patterns rather than relying on a single average." },
  planning: { eyebrow: "BUSINESS ANALYSIS / WORK IN PROGRESS", title: "Document the business requirement.", description: "The next BA case study will connect a business question to KPI definitions, user stories, acceptance criteria and UAT scenarios. These deliverables are planned, not completed.", flow: ["Requirements", "Acceptance criteria", "UAT plan"], example: "Planned case study: document who uses a delivery-performance report, how KPIs are defined and how to test the report against those definitions." },
  python: { eyebrow: "DATA PREPARATION / EXPLORATION", title: "Make messy datasets analysis-ready.", description: "Work with tabular data through cleaning, joins, grouping, feature preparation and exploratory data analysis.", flow: ["Load data", "Clean & transform", "Explore"], example: "Prepare related order records and delivery-delay indicators for e-commerce analysis." },
  sql: { eyebrow: "QUERYING / RELATIONAL DATA", title: "Ask structured questions of the data.", description: "Practice SQL queries, joins, filters and aggregations. A full SQL case study with query files and validation checks is being developed.", flow: ["Related tables", "JOIN & GROUP BY", "Summary"], example: "Build category-level summaries from relational tables without changing the source records." },
  powerbi: { eyebrow: "REPORTING / BUSINESS INTELLIGENCE", title: "Design reports for decisions.", description: "Create useful KPIs, comparisons and interactive reports with Power BI, Power Query and DAX.", flow: ["Model", "Measure", "Report"], example: "Compare market performance using standardized revenue in the Tailwind Traders project." },
  excel: { eyebrow: "SPREADSHEETS / POWER QUERY", title: "Organize information into something usable.", description: "Prepare and structure spreadsheet data. A dedicated Excel reporting case study with formulas, Power Query and an audit trail is being developed.", flow: ["Import", "Transform", "Summarize"], example: "Standardize formats and prepare a clean table before creating a meaningful summary." }
};
function initializeSkillExplorer() {
  const tabs = Array.from(document.querySelectorAll(".skill-tab"));
  const panel = document.getElementById("skill-preview");
  if (!tabs.length || !panel) return;
  function activate(tab, focus = false) {
    const details = SKILL_DETAILS[tab.dataset.skill];
    if (!details) return;
    tabs.forEach(item => { const selected = item === tab; item.classList.toggle("is-selected", selected); item.setAttribute("aria-selected", String(selected)); item.tabIndex = selected ? 0 : -1; });
    panel.setAttribute("aria-labelledby", tab.id);
    const signal = document.getElementById("skill-signal");
    if (signal) signal.dataset.mode = tab.dataset.skill === "planning" ? "automation" : tab.dataset.skill;
    const signalCode = document.getElementById("skill-signal-code");
    if (signalCode) signalCode.textContent = ({business:"01 / DEFINE THE QUESTION",excel:"02 / PREPARE → CLEAN",sql:"03 / RELATE → SUMMARIZE",python:"04 / TRANSFORM → EXPLORE",statistics:"05 / COMPARE DISTRIBUTIONS",powerbi:"06 / MODEL → REPORT",planning:"07 / REQUIREMENTS → UAT"})[tab.dataset.skill] || "ANALYSIS WORKFLOW";
    document.getElementById("skill-preview-eyebrow").textContent = details.eyebrow;
    document.getElementById("skill-preview-title").textContent = details.title;
    document.getElementById("skill-preview-description").textContent = details.description;
    document.getElementById("skill-preview-example").textContent = details.example;
    const flow = document.getElementById("skill-preview-flow");
    flow.replaceChildren();
    details.flow.forEach((item, index) => { if (index) { const arrow = document.createElement("i"); arrow.textContent = "→"; arrow.setAttribute("aria-hidden", "true"); flow.append(arrow); } const step = document.createElement("span"); step.textContent = item; flow.append(step); });
    if (focus) tab.focus();
  }
  const mobileTabs = window.matchMedia("(max-width: 760px)");
  const tablist = document.querySelector(".skill-tabs");
  function updateOrientation() {
    tablist?.setAttribute("aria-orientation", mobileTabs.matches ? "horizontal" : "vertical");
  }
  updateOrientation();
  mobileTabs.addEventListener("change", updateOrientation);
  tabs.forEach((tab, index) => {
    // Mouse/pen pointer hover previews the approach immediately, without clicking.
    // Touch continues to select on tap, and keyboard arrows remain available.
    tab.addEventListener("pointerenter", event => {
      if (event.pointerType === "mouse" || event.pointerType === "pen") activate(tab);
    });
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", event => {
      const forward = mobileTabs.matches ? "ArrowRight" : "ArrowDown";
      const backward = mobileTabs.matches ? "ArrowLeft" : "ArrowUp";
      if (![forward, backward, "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === forward ? 1 : -1) + tabs.length) % tabs.length;
      activate(tabs[next], true);
    });
  });
}


const PROJECTS = {
  olist: {
    tag: "BUSINESS ANALYTICS · PUBLIC DATA",
    title: "Olist E-Commerce Analysis",
    problem: "Which delivery regions have the greatest customer-experience risk, and how do delays relate to ratings?",
    dataset: "Olist historical Brazilian e-commerce data: 99,441 orders, with order, delivery, customer, item, payment and review tables. The uploaded clean-orders workbook and linked README were checked.",
    approach: "Created delivery-delay and elapsed-day fields with Python/Pandas, aggregated payments, prepared the related datasets, and built Power BI reports for orders, revenue, geography and customer ratings.",
    result: "Cleaned workbooks confirm R$16.01M in payments. Among 96,470 delivered orders with actual and estimated delivery dates, 8.11% arrived late; Rio de Janeiro was 13.47% late (12,350 delivered orders). On the delivered-order/review rows checked, late-order ratings were about 1.73 points lower on average. The project dashboard reports 1.65 under its own report context.",
    recommendation: "Prioritize an RJ delivery investigation: compare carrier performance, order mix and delivery routes, then track late-delivery rate alongside customer ratings. Test the proposed intervention before attributing any improvement to it.",
    limitations: "These are descriptive associations, not causal effects. Results depend on order status, date completeness, review joins and the report’s filter context. Payment totals are not accounting-recognized profit or realized business impact.",
    tools: "Python · Pandas · Excel data files · Power BI · DAX",
    link: "https://github.com/Swapnil-Sa/Olist_Brazilian_E-Commerce"
  },
  tailwind: {
    tag: "MICROSOFT POWER BI COURSE PROJECT",
    title: "Tailwind Traders Revenue Dashboard",
    problem: "How can standardized currencies reveal differences in market revenue in a multi-country training dataset?",
    dataset: "Microsoft Power BI course dataset with sales, country and purchase tables. It is training material, not live company data.",
    approach: "Worked with Excel source tables, transformed and normalized currencies in Power Query, and developed Power BI / DAX reports to compare country revenue, products and post-tax measures.",
    result: "The supplied report shows approximately USD 866.98K of net revenue, and the UAE accounts for about 58% of the course dataset’s reported revenue. The reported net-to-gross ratio is around 93% under the exercise’s tax treatment.",
    recommendation: "Investigate why the UAE dominates the sample revenue, compare order value and product mix across countries, and consider diversification only after validating demand and acquisition costs.",
    limitations: "This is a course exercise with synthetic/training business context. A post-tax net/gross ratio is not a profit margin, and operating costs are unavailable. No production refresh, financial outcome or company deployment is claimed.",
    tools: "Power BI · Power Query · DAX · Excel source files",
    link: "https://github.com/Swapnil-Sa/Tailwind-Trades-Revenue-Analysis"
  },
  breast: {
    tag: "MACHINE LEARNING · RESEARCH EXERCISE",
    title: "Breast Cancer Classification with PCA",
    problem: "How do selected features and PCA affect classification experiments on the Wisconsin Breast Cancer Diagnostic dataset?",
    dataset: "Wisconsin Breast Cancer Diagnostic research dataset: 569 samples, 30 diagnostic measurements and a benign/malignant label.",
    approach: "Explored the source data and compared feature-selection methods, principal component analysis, supervised classifiers, classification metrics and K-Means in separate exploratory scripts.",
    result: "The repository contains feature-selection, PCA and model-comparison workflows. It does not provide a single independently verified, leakage-safe headline score across all experiments; the portfolio therefore avoids advertising the resume’s 98% result as validated.",
    recommendation: "Rebuild a reproducible pipeline with train-only scaling/selection, stratified cross-validation and a held-out test set, then document sensitivity, precision and threshold trade-offs.",
    limitations: "The supplied scripts rely on Google Colab paths and some exploratory preprocessing is performed before splitting. This is not a clinically validated model or diagnostic tool.",
    tools: "Python · Pandas · NumPy · Scikit-learn · PCA · Random Forest · Matplotlib · Seaborn",
    link: "https://github.com/Swapnil-Sa/Breast-Cancer-ML-Analysis-With-PCA"
  },
  survival: {
    tag: "STATISTICS · SURVIVAL ANALYSIS",
    title: "Breast Cancer Survival Analysis",
    problem: "How do recorded alive-at-follow-up proportions and Kaplan–Meier curves differ across race categories in this research dataset?",
    dataset: "Supplied SEER-derived breast cancer workbook, 4,024 rows, including the dataset’s Black (291), White (3,413) and Other (320) race categories.",
    approach: "Checked group proportions, investigated stage and tumor-size strata, plotted Kaplan–Meier survival estimates and used a multigroup log-rank test in a Python notebook.",
    result: "Verified from the supplied workbook: alive at follow-up was 74.91% (Black), 85.06% (White) and 89.69% (Other). The White–Black gap was 10.14 percentage points. The notebook reports a multigroup log-rank statistic around 30.98 (p about 1.9×10⁻⁷).",
    recommendation: "Examine clinical-stage composition, treatment details, follow-up periods and subgroup sample sizes before drawing policy or operational conclusions. A multivariable survival analysis would be a useful next methodological step.",
    limitations: "Race is the dataset label, not a measure of ethnicity. Alive-at-follow-up percentages are not fixed-time survival probabilities or adjusted causal effects. Small strata may be unstable, and the original notebook uses Colab-specific input paths.",
    tools: "Python · Pandas · Lifelines · Kaplan–Meier · Matplotlib · Seaborn",
    link: "https://github.com/Swapnil-Sa/Ethnicity-Based-Survival-Analysis"
  }
};

function initializeProjectDialog() {
  const dialog = document.getElementById("project-dialog");
  if (!dialog) return;
  const tag = document.getElementById("pd-tag");
  const title = document.getElementById("pd-title");
  const problem = document.getElementById("pd-problem");
  const dataset = document.getElementById("pd-dataset");
  const limitations = document.getElementById("pd-limitations");
  const recommendation = document.getElementById("pd-recommendation");
  const approach = document.getElementById("pd-approach");
  const result = document.getElementById("pd-result");
  const tools = document.getElementById("pd-tools");
  const linkBox = document.getElementById("pd-link");
  const closeButton = dialog.querySelector(".dialog-close");
  let opener = null;

  function openProject(key, trigger) {
    const project = PROJECTS[key];
    if (!project) return;
    opener = trigger;
    tag.textContent = project.tag;
    title.textContent = project.title;
    problem.textContent = project.problem;
    dataset.textContent = project.dataset;
    limitations.textContent = project.limitations;
    approach.textContent = project.approach;
    result.textContent = project.result;
    recommendation.textContent = project.recommendation;
    tools.textContent = project.tools;
    linkBox.replaceChildren();

    if (project.link) {
      const link = makeElement("a", "View project on GitHub ↗");
      link.href = project.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      linkBox.appendChild(link);
      if (key === "survival") {
        const notebook = makeElement("a", "Download original Jupyter notebook ↓");
        notebook.href = "assets/notebooks/Ethnicity_based_analysis.ipynb";
        notebook.download = "Ethnicity_based_analysis.ipynb";
        notebook.classList.add("dialog-notebook-link");
        linkBox.appendChild(notebook);
      }
    } else {
      linkBox.appendChild(makeElement("p", "Project link to be added.", "dialog-link-note"));
    }
    if (!dialog.open) dialog.showModal();
  }

  document.querySelectorAll("[data-project]").forEach(button => {
    button.addEventListener("click", () => openProject(button.dataset.project, button));
  });
  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (opener) opener.focus();
  });
}

function initializeNavigation() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  function closeMenu() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
  }
  toggle.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });
  document.addEventListener("pointerdown", event => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
  document.addEventListener("focusin", event => {
    if (nav.classList.contains("is-open") && !nav.contains(event.target) && event.target !== toggle) closeMenu();
  });
  window.matchMedia("(min-width: 761px)").addEventListener("change", event => {
    if (event.matches) closeMenu();
  });

  // Determine the active section from its actual viewport position.
  // IntersectionObserver entry batches can be incomplete and used to mark
  // Contact active while a long Projects section is still on screen.
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  let scheduled = false;
  let currentSection = '';

  function updateActiveSection() {
    scheduled = false;
    if (!sections.length) return;
    // An upper-viewport reading line matches what the visitor is viewing,
    // rather than triggering a new section as soon as it touches the screen.
    const readingLine = Math.min(window.innerHeight * 0.34, 320);
    let selected = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= readingLine) selected = section;
      else break;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3) {
      selected = sections[sections.length - 1];
    }
    if (selected.id === currentSection) return;
    currentSection = selected.id;
    for (const link of links) {
      const active = link.getAttribute('href') === `#${currentSection}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  function requestActiveSection() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateActiveSection);
    }
  }
  window.addEventListener('scroll', requestActiveSection, { passive: true });
  window.addEventListener('resize', requestActiveSection, { passive: true });
  window.addEventListener('hashchange', requestActiveSection);
  document.addEventListener('portfolio:entering', requestActiveSection);
  requestActiveSection();
}

function initializeProjectImages() {
  const viewer = document.getElementById("project-image-viewer");
  if (!viewer) return;
  const expanded = viewer.querySelector("img");
  let opener = null;

  viewer.querySelector(".viewer-close").addEventListener("click", () => viewer.close());
  viewer.addEventListener("click", event => {
    if (event.target === viewer) viewer.close();
  });
  viewer.addEventListener("close", () => {
    expanded.removeAttribute("src");
    if (opener?.isConnected) opener.focus();
    opener = null;
  });

  document.querySelectorAll(".project-image-trigger").forEach(trigger => {
    const img = trigger.querySelector("img");
    const frame = trigger.parentElement;
    const fallback = frame.querySelector(".image-fallback");
    if (!img) return;

    function updateImageState(failed) {
      trigger.hidden = failed;
      if (fallback) fallback.hidden = !failed;
      frame.classList.toggle("has-image", !failed);
    }
    img.addEventListener("error", () => updateImageState(true));
    img.addEventListener("load", () => updateImageState(false));
    if (img.complete) updateImageState(img.naturalWidth === 0);

    trigger.addEventListener("click", () => {
      if (!img.naturalWidth) return;
      opener = trigger;
      expanded.src = img.currentSrc || img.src;
      expanded.alt = img.alt;
      viewer.setAttribute("aria-label", "Expanded: " + img.alt);
      if (!viewer.open) viewer.showModal();
    });
  });
}


/* V13 — viewport-triggered reveals with real-duration smoothing.
   A rapid scroll cannot skip the animation. Reveals are one-shot and never
   reset on upward scroll. Hero continues to start with the intro fade. */
function initializeScrollStory() {
  if (!document.documentElement.classList.contains('motion-enabled')) return;
  const targets = [...document.querySelectorAll('[data-scroll-reveal]')];
  const heroes = targets.filter(el => el.closest('#home'));
  const sections = targets.filter(el => !el.closest('#home'));
  let started = false;
  let observer = null;
  function reveal(el) {
    if (el.classList.contains('is-revealed')) return;
    el.classList.add('is-revealed');
    el.addEventListener('transitionend', () => {
      el.style.willChange = 'auto';
    }, {once:true});
  }
  function start() {
    if (started) return;
    started = true;
    // Intro fade and hero entrance remain synchronized.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      heroes.forEach(reveal);
    }));
    sections.forEach(el => {
      const n = Math.min(3, Math.max(0, Number(el.dataset.revealStagger || 0)));
      el.style.setProperty('--reveal-delay', `${n * 105}ms`);
    });
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      }, {root:null, rootMargin:'0px 0px -12% 0px', threshold:0.03});
      sections.forEach(el => observer.observe(el));
    } else {
      // Functional fallback for older browsers.
      const check = () => {
        for (const el of sections) {
          if (el.getBoundingClientRect().top < innerHeight * .88) reveal(el);
        }
      };
      window.addEventListener('scroll', check, {passive:true});
      check();
    }
  }
  document.addEventListener('portfolio:entering', start, {once:true});
  document.addEventListener('portfolio:entered', start, {once:true});
  if (document.getElementById('intro')?.hidden) start();
  const pref = window.matchMedia('(prefers-reduced-motion: reduce)');
  pref.addEventListener('change', event => {
    if (event.matches) {
      observer?.disconnect();
      targets.forEach(reveal);
      document.documentElement.classList.remove('motion-enabled');
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  buildSheets();
  initializeIntro();
  initializeProjectDialog();
  initializeNavigation();
  initializeProjectImages();
  initializeSkillExplorer();
  initializeScrollStory();
});


