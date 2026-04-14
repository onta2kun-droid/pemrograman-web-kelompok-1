const scene = document.querySelector(".scene");
const items = [...document.querySelectorAll(".item")];
const stageTrack = document.querySelector(".stage-track");
const isMobile = window.matchMedia("(max-width: 768px)");

let currentStep = 0;
let ticking = false;
let touchStartX = 0;
let touchDeltaX = 0;

/* =========================================
   PROGRESS + YEAR
========================================= */
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

/* =========================================
   DESKTOP MODE
========================================= */
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
  if (!scene || !items.length) return;

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

  if (progressBar) {
    progressBar.style.width = `${progressValue * 100}%`;
  }

  ticking = false;
}

function requestDesktopTick() {
  if (!ticking) {
    requestAnimationFrame(updateDesktopScene);
    ticking = true;
  }
}

/* =========================================
   MOBILE MODE
========================================= */
function setMobileStep(index, animate = true) {
  currentStep = Math.max(0, Math.min(items.length - 1, index));

  if (stageTrack) {
    if (!animate) {
      stageTrack.style.transition = "none";
    } else {
      stageTrack.style.transition =
        "transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)";
    }

    stageTrack.style.transform = `translate3d(-${currentStep * 100}%, 0, 0)`;

    if (!animate) {
      requestAnimationFrame(() => {
        stageTrack.style.transition =
          "transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)";
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
  cornerYear.style.display = "none";
  setMobileStep(currentStep, false);
}

function applyMode() {
  if (isMobile.matches) {
    initMobile();
  } else {
    initDesktop();
  }
}

/* =========================================
   EVENT LISTENERS: DESKTOP / MOBILE
========================================= */
window.addEventListener(
  "scroll",
  () => {
    if (!isMobile.matches) requestDesktopTick();
  },
  { passive: true }
);

window.addEventListener("resize", applyMode);
window.addEventListener("load", applyMode);

if (typeof isMobile.addEventListener === "function") {
  isMobile.addEventListener("change", applyMode);
} else if (typeof isMobile.addListener === "function") {
  isMobile.addListener(applyMode);
}

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

/* =========================================
   BACKGROUND MUSIC + MUTE / UNMUTE TOGGLE
========================================= */
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const musicIcon = document.getElementById("musicIcon");

const ICON_UNMUTE = "icons/unmute.png";
const ICON_MUTE = "icons/mute.png";

let isMuted = false;
let fadeFrame = null;
const targetVolume = 0.15;

function setMusicIcon() {
  if (!musicIcon) return;

  if (isMuted) {
    musicIcon.src = ICON_MUTE;
    musicIcon.alt = "Music off";
    if (musicToggle) {
      musicToggle.setAttribute("aria-label", "Unmute music");
    }
  } else {
    musicIcon.src = ICON_UNMUTE;
    musicIcon.alt = "Music on";
    if (musicToggle) {
      musicToggle.setAttribute("aria-label", "Mute music");
    }
  }
}

function fadeAudio(to, duration = 2000, callback) {
  if (!bgMusic) return;

  if (fadeFrame) {
    cancelAnimationFrame(fadeFrame);
  }

  const from = bgMusic.volume;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    bgMusic.volume = from + (to - from) * progress;

    if (progress < 1) {
      fadeFrame = requestAnimationFrame(step);
    } else {
      fadeFrame = null;
      if (callback) callback();
    }
  }

  fadeFrame = requestAnimationFrame(step);
}

async function startMusic() {
  if (!bgMusic) return;

  try {
    if (bgMusic.paused) {
      bgMusic.volume = 0;
      await bgMusic.play();
    }
    fadeAudio(targetVolume, 2000);
    isMuted = false;
    setMusicIcon();
  } catch (error) {
    console.log("Autoplay diblokir. Menunggu interaksi user.");
  }
}

function stopMusicWithFade(pauseAfterFade = true) {
  if (!bgMusic) return;

  fadeAudio(0, 2000, () => {
    if (pauseAfterFade) {
      bgMusic.pause();
    }
  });
}

function muteMusic() {
  if (!bgMusic) return;

  if (fadeFrame) {
    cancelAnimationFrame(fadeFrame);
    fadeFrame = null;
  }

  bgMusic.volume = 0;
  bgMusic.pause();

  isMuted = true;
  setMusicIcon();
}

async function unmuteMusic() {
  if (!bgMusic) return;

  try {
    if (fadeFrame) {
      cancelAnimationFrame(fadeFrame);
      fadeFrame = null;
    }

    bgMusic.volume = targetVolume;
    await bgMusic.play();

    isMuted = false;
    setMusicIcon();
  } catch (error) {
    console.log("Gagal memutar musik.");
  }
}

if (bgMusic) {
  bgMusic.volume = 0;
  setMusicIcon();

  startMusic();

  document.addEventListener(
    "click",
    () => {
      if (bgMusic.paused && !isMuted) {
        startMusic();
      }
    },
    { once: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopMusicWithFade(false);
    } else {
      if (!isMuted) {
        if (bgMusic.paused) {
          bgMusic.play().then(() => fadeAudio(targetVolume, 2000)).catch(() => {});
        } else {
          fadeAudio(targetVolume, 2000);
        }
      }
    }
  });

  window.addEventListener("beforeunload", () => {
    stopMusicWithFade(false);
  });
}

if (musicToggle) {
  musicToggle.addEventListener("click", async () => {
    if (!bgMusic) return;

    if (isMuted || bgMusic.paused) {
      await unmuteMusic();
    } else {
      muteMusic();
    }
  });
}