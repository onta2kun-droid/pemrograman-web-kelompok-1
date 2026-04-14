const scene = document.querySelector(".scene");
const items = [...document.querySelectorAll(".item")];
const isMobile = window.matchMedia("(max-width: 768px)");

let currentStep = 0;
let ticking = false;
let touchStartX = 0;
let touchEndX = 0;

const progress = document.createElement("div");
progress.className = "progress";
progress.innerHTML = '<div class="progress-bar"></div>';
document.body.appendChild(progress);

const progressBar = progress.querySelector(".progress-bar");

const cornerYear = document.createElement("div");
cornerYear.className = "corner-year";
cornerYear.textContent = items[0]?.querySelector(".year")?.textContent || "";
document.body.appendChild(cornerYear);

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

function updateYear() {
  const year = items[currentStep]?.querySelector(".year")?.textContent || "";
  cornerYear.textContent = year;
}

function setDesktopStep(nextStep) {
  if (nextStep === currentStep) return;

  const currentItem = items[currentStep];
  const nextItem = items[nextStep];

  if (currentItem) {
    currentItem.classList.remove("active");
    currentItem.classList.add("is-exiting");
  }

  if (nextItem) {
    nextItem.classList.add("active");
    nextItem.classList.remove("is-exiting");
  }

  items.forEach((item, index) => {
    if (index !== nextStep && index !== currentStep) {
      item.classList.remove("active", "is-exiting");
    }
  });

  currentStep = nextStep;
  updateYear();
}

function updateDesktopScene() {
  const rect = scene.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const totalScroll = scene.offsetHeight - windowHeight;

  let progressValue = -rect.top / totalScroll;
  progressValue = Math.max(0, Math.min(1, progressValue));

  const stepCount = items.length;
  const nextStep = Math.min(
    stepCount - 1,
    Math.floor(progressValue * stepCount)
  );

  setDesktopStep(nextStep);
  progressBar.style.width = `${progressValue * 100}%`;

  ticking = false;
}

function requestDesktopTick() {
  if (!ticking) {
    requestAnimationFrame(updateDesktopScene);
    ticking = true;
  }
}

function setMobileStep(index) {
  currentStep = Math.max(0, Math.min(items.length - 1, index));

  items.forEach((item, i) => {
    item.classList.remove("active", "is-exiting", "mobile-visible");
    if (i === currentStep) item.classList.add("mobile-visible");
  });

  updateYear();

  if (prevBtn) prevBtn.disabled = currentStep === 0;
  if (nextBtn) nextBtn.disabled = currentStep === items.length - 1;
}

function nextMobile() {
  setMobileStep(currentStep + 1);
}

function prevMobile() {
  setMobileStep(currentStep - 1);
}

function initDesktop() {
  items.forEach((item, index) => {
    item.classList.remove("mobile-visible");
    item.classList.toggle("active", index === currentStep);
    item.classList.remove("is-exiting");
  });

  progress.style.display = "";
  cornerYear.style.display = "";
  requestDesktopTick();
}

function initMobile() {
  progress.style.display = "none";
  cornerYear.style.display = "none";
  setMobileStep(currentStep);
}

function applyMode() {
  if (isMobile.matches) {
    initMobile();
  } else {
    initDesktop();
  }
}

window.addEventListener("scroll", () => {
  if (!isMobile.matches) {
    requestDesktopTick();
  }
}, { passive: true });

window.addEventListener("resize", applyMode);
window.addEventListener("load", applyMode);
isMobile.addEventListener("change", applyMode);

if (nextBtn) {
  nextBtn.addEventListener("click", nextMobile);
}

if (prevBtn) {
  prevBtn.addEventListener("click", prevMobile);
}

const stage = document.querySelector(".stage");

if (stage) {
  stage.addEventListener("touchstart", (e) => {
    if (!isMobile.matches) return;
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  stage.addEventListener("touchend", (e) => {
    if (!isMobile.matches) return;

    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) < 40) return;

    if (diff > 0) {
      nextMobile();
    } else {
      prevMobile();
    }
  }, { passive: true });
}