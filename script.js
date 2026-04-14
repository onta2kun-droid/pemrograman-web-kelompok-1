const scene = document.querySelector(".scene");
const items = [...document.querySelectorAll(".item")];

let currentStep = 0;

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

  const year = nextItem?.querySelector(".year")?.textContent || "";
  cornerYear.textContent = year;
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

    const scale = index === nextStep ? 1.015 : Math.max(0.92, 1 - distance * 0.04);
    img.style.transform = `translateY(${index === nextStep ? -4 : 0}px) scale(${scale})`;
    item.style.zIndex = index === nextStep ? 3 : 1;
  });
}

window.addEventListener("scroll", updateScene, { passive: true });
window.addEventListener("resize", updateScene);
window.addEventListener("load", () => {
  items[0]?.classList.add("active");
  updateScene();
});