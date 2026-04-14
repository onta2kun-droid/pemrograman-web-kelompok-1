const scene = document.querySelector(".scene");
const items = [...document.querySelectorAll(".item")];

let currentStep = 0;
let ticking = false;

const progress = document.createElement("div");
progress.className = "progress";
progress.innerHTML = '<div class="progress-bar"></div>';
document.body.appendChild(progress);

const progressBar = progress.querySelector(".progress-bar");

const cornerYear = document.createElement("div");
cornerYear.className = "corner-year";
cornerYear.textContent = items[0]?.querySelector(".year")?.textContent || "";
document.body.appendChild(cornerYear);

function setActiveStep(nextStep) {
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
  cornerYear.textContent =
    nextItem?.querySelector(".year")?.textContent || "";
}

function updateScene() {
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

  setActiveStep(nextStep);
  progressBar.style.width = `${progressValue * 100}%`;

  items.forEach((item, index) => {
    const distance = Math.abs(index - nextStep);
    const img = item.querySelector("img");
    if (!img) return;

    const scale =
      index === nextStep ? 1.015 : Math.max(0.94, 1 - distance * 0.03);

    img.style.transform = `translate3d(0, ${index === nextStep ? -4 : 0}px, 0) scale(${scale})`;
    item.style.zIndex = index === nextStep ? 3 : 1;
  });

  ticking = false;
}

function requestTick() {
  if (!ticking) {
    requestAnimationFrame(updateScene);
    ticking = true;
  }
}

window.addEventListener("scroll", requestTick, { passive: true });
window.addEventListener("resize", requestTick);
window.addEventListener("load", () => {
  items[0]?.classList.add("active");
  requestTick();
});