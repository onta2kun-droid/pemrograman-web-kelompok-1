const scene = document.querySelector(".scene");
const items = [...document.querySelectorAll(".item")];
const stageTrack = document.querySelector(".stage-track");
const isMobile = window.matchMedia("(max-width: 768px)");

let currentStep = 0;
let ticking = false;
let touchStartX = 0;
let touchDeltaX = 0;

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
  cornerYear.textContent =
    items[currentStep]?.querySelector(".year")?.textContent || "";
}

function updateButtons() {
  if (!prevBtn || !nextBtn) return;
  prevBtn.disabled = currentStep === 0;
  nextBtn.disabled = currentStep === items.length - 1;
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
      item.classList.remove("active", "is-exiting", "mobile-active");
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

  const nextStep = Math.min(
    items.length - 1,
    Math.floor(progressValue * items.length)
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

function setMobileStep(index, animate = true) {
  currentStep = Math.max(0, Math.min(items.length - 1, index));

  if (stageTrack) {
    if (!animate) {
      stageTrack.style.transition = "none";
    } else {
      stageTrack.style.transition = "transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)";
    }

    stageTrack.style.transform = `translate3d(-${currentStep * 100}%, 0, 0)`;

    if (!animate) {
      requestAnimationFrame(() => {
        stageTrack.style.transition = "transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)";
      });
    }
  }

  items.forEach((item, i) => {
    item.classList.toggle("mobile-active", i === currentStep);
    item.classList.remove("active", "is-exiting");
  });

  updateYear();
  updateButtons();
}

function nextMobile() {
  setMobileStep(currentStep + 1);
}

function prevMobile() {
  setMobileStep(currentStep - 1);
}

function initDesktop() {
  progress.style.display = "";
  cornerYear.style.display = "";
  if (stageTrack) {
    stageTrack.style.transform = "";
    stageTrack.style.transition = "";
  }

  items.forEach((item, index) => {
    item.classList.remove("mobile-active");
    item.classList.toggle("active", index === currentStep);
    item.classList.remove("is-exiting");
  });

  requestDesktopTick();
}

function initMobile() {
  progress.style.display = "none";
  cornerYear.style.display = "";
  setMobileStep(currentStep, false);
}

function applyMode() {
  if (isMobile.matches) {
    initMobile();
  } else {
    initDesktop();
  }
}

window.addEventListener(
  "scroll",
  () => {
    if (!isMobile.matches) requestDesktopTick();
  },
  { passive: true }
);

window.addEventListener("resize", applyMode);
window.addEventListener("load", applyMode);
isMobile.addEventListener("change", applyMode);

if (nextBtn) nextBtn.addEventListener("click", nextMobile);
if (prevBtn) prevBtn.addEventListener("click", prevMobile);

if (stageTrack) {
  stageTrack.addEventListener(
    "touchstart",
    (e) => {
      if (!isMobile.matches) return;
      touchStartX = e.touches[0].clientX;
      touchDeltaX = 0;
    },
    { passive: true }
  );

  stageTrack.addEventListener(
    "touchmove",
    (e) => {
      if (!isMobile.matches) return;
      touchDeltaX = e.touches[0].clientX - touchStartX;
    },
    { passive: true }
  );

  stageTrack.addEventListener(
    "touchend",
    () => {
      if (!isMobile.matches) return;

      if (touchDeltaX < -50) {
        nextMobile();
      } else if (touchDeltaX > 50) {
        prevMobile();
      }
    },
    { passive: true }
  );
}