(function () {
  // === Password lock ===
  const LOCK_PASSWORD = "marie"; // comparison is case-insensitive
  const lockOverlay = document.getElementById("lockOverlay");
  const lockDialog = document.getElementById("lockDialog");
  const lockForm = document.getElementById("lockForm");
  const lockAnswerInput = document.getElementById("lockAnswer");
  const lockError = document.getElementById("lockError");

  function showError(message) {
    lockError.textContent = message;
    lockError.classList.add("visible");
    lockDialog.classList.remove("shake");
    void lockDialog.offsetWidth;
    lockDialog.classList.add("shake");
  }

  lockDialog.addEventListener("animationend", (e) => {
    if (e.animationName === "shake") {
      lockDialog.classList.remove("shake");
    }
  });

  lockForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const value = (lockAnswerInput.value || "").trim().toLocaleLowerCase();
    if (!value) {
      showError("Type your answer first, love.");
      return;
    }
    if (value !== String(LOCK_PASSWORD).toLocaleLowerCase()) {
      showError("Come on you know this");
      return;
    }
    lockError.classList.remove("visible");
    document.body.classList.remove("locked");

    // Fade lock overlay with GSAP if available, else fallback to CSS class
    if (window.gsap) {
      gsap.to(lockOverlay, {
        opacity: 0,
        y: -10,
        scale: 0.98,
        duration: 0.5,
        ease: "power2.out",
        onComplete() {
          lockOverlay.style.display = "none";
        },
      });
    } else {
      lockOverlay.classList.add("hidden");
      setTimeout(() => {
        lockOverlay.style.display = "none";
      }, 550);
    }
  });

  window.addEventListener("load", () => {
    document.body.classList.add("locked");
    setTimeout(() => {
      lockAnswerInput.focus();
    }, 400);
  });

  // === Hero scroll animation (GSAP) ===
  const heroSection = document.getElementById("hero");

  function initGsapAnimations() {
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(
        "#hero .hero-text",
        { autoAlpha: 1, y: 0 },
        {
          autoAlpha: 0,
          y: -60,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      );
      
      gsap.fromTo(
        "#heroHappy .hero-text",
        { autoAlpha: 0, y: 60 },
        {
          autoAlpha: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#heroHappy",
            start: "top 80%",
            end: "top 40%",
            scrub: true,
          },
        }
      );
      
      // Fade-in cards/sections on scroll
      gsap.utils.toArray(".fade-in").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
            },
          }
        );
      });
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    initGsapAnimations();
  } else {
    window.addEventListener("DOMContentLoaded", initGsapAnimations);
  }

  // === Heart explosion ===
  const heartLayer = document.getElementById("heartLayer");
  const heartButton = document.getElementById("heartBurstButton");

  function createHeart(x, y) {
    const heart = document.createElement("div");
    heart.className = "heart";

    const layerRect = heartLayer.getBoundingClientRect();
    const relX = x - layerRect.left;
    const relY = y - layerRect.top;

    heart.style.left = relX + "px";
    heart.style.top = relY + "px";

    const angle = Math.random() * Math.PI * 2;
    const distance = 90 + Math.random() * 90;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    heart.style.setProperty("--dx", dx + "px");
    heart.style.setProperty("--dy", dy + "px");

    const scale = 0.7 + Math.random() * 0.8;
    heart.style.transform = "translate3d(0,0,0) scale(" + scale + ") rotate(45deg)";
    const duration = 700 + Math.random() * 600;

    if (window.gsap) {
      // Use GSAP for smoother heart movement
      heart.style.opacity = "1";
      heartLayer.appendChild(heart);
      gsap.fromTo(
        heart,
        { x: 0, y: 0, scale, opacity: 0 },
        {
          x: dx,
          y: dy,
          scale: scale * 1.1,
          opacity: 1,
          duration: duration / 1000,
          ease: "power2.out",
          onComplete() {
            gsap.to(heart, {
              opacity: 0,
              duration: 0.25,
              onComplete() {
                heart.remove();
              },
            });
          },
        }
      );
    } else {
      heart.style.animation = "heartBurst " + duration + "ms ease-out forwards";
      heartLayer.appendChild(heart);
      setTimeout(() => {
        heart.remove();
      }, duration + 80);
    }
  }

  function heartBurstAtCenter() {
    const rect = heartLayer.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height * 0.45;
    for (let i = 0; i < 14; i++) {
      setTimeout(() => {
        createHeart(x, y);
      }, i * 35);
    }
  }

  heartButton.addEventListener("click", heartBurstAtCenter);
  heartButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    heartBurstAtCenter();
  });

  heroSection.addEventListener("click", (e) => {
    createHeart(e.clientX, e.clientY);
  });

  heroSection.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    createHeart(touch.clientX, touch.clientY);
  });

  // === Time together (count-up timer) ===
  const LOVE_START_DATE = new Date("2022-09-14T00:00:00");

  const yearsEl = document.getElementById("timerYears");
  const monthsEl = document.getElementById("timerMonths");
  const daysEl = document.getElementById("timerDays");
  
  function updateTimer() {
    const start = new Date(LOVE_START_DATE);
    const now = new Date();
  
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
  
    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
  
    if (months < 0) {
      years--;
      months += 12;
    }
  
    yearsEl.textContent = years;
    monthsEl.textContent = months;
    daysEl.textContent = days;
  }
  

  updateTimer();
  setInterval(updateTimer, 1000 * 60 * 60);

  // === Letter modal ===
  const letterModal = document.getElementById("letterModal");
  const openLetterBtn = document.getElementById("openLetterBtn");
  const letterPreview = document.getElementById("letterPreview");

  function openModal(modal) {
    modal.classList.add("visible");
  }

  function closeModal(modal) {
    modal.classList.remove("visible");
  }

  openLetterBtn.addEventListener("click", () => openModal(letterModal));
  letterPreview.addEventListener("click", () => openModal(letterModal));

  // Close modal on backdrop click
  [letterModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Close with specific buttons (data-close-modal)
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-close-modal");
      const modal = document.getElementById(id);
      if (modal) closeModal(modal);
    });
  });

  // === Memory modal ===
  const memoryModal = document.getElementById("memoryModal");
  const memoryImg = document.getElementById("memoryImg");
  const memoryCaption = document.getElementById("memoryCaption");

  const memoriesGrid = document.getElementById("memoriesGrid");
  memoriesGrid.querySelectorAll(".polaroid").forEach((card) => {
    card.addEventListener("click", () => {
      const img = card.getAttribute("data-image");
      const caption = card.getAttribute("data-caption") || "";
      memoryImg.src = img || "";
      memoryCaption.textContent = caption;
      openModal(memoryModal);
    });
  });

  memoryModal.addEventListener("click", (e) => {
    if (e.target === memoryModal) {
      closeModal(memoryModal);
    }
  });

  // === Audio player ===
  const audio = document.getElementById("voiceMessage");
  const playBtn = document.getElementById("audioPlay");
  const barProgress = document.getElementById("audioProgress");
  const currentEl = document.getElementById("audioCurrent");
  const durationEl = document.getElementById("audioDuration");
  const yesButton = document.getElementById("yesButton");

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ":" + s.toString().padStart(2, "0");
  }

  audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration || 0);
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const progress = (audio.currentTime / audio.duration) * 100;
    barProgress.style.width = progress + "%";
    currentEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("ended", () => {
    playBtn.textContent = "▶";
    barProgress.style.width = "100%";
    currentEl.textContent = formatTime(audio.duration || 0);
  });

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(() => {});
      playBtn.textContent = "⏸";
    } else {
      audio.pause();
      playBtn.textContent = "▶";
    }
  });

  // Allow tapping on progress to seek
  const audioBar = barProgress.parentElement;
  audioBar.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const rect = audioBar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = Math.max(0, Math.min(audio.duration, ratio * audio.duration));
  });

  // Basic keyboard accessibility for play button
  playBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      playBtn.click();
    }
  });

  // === YES button heart explosion ===
function spawnLoveHeart() {
  const heart = document.createElement("div");
  heart.className = "love-heart";

  const text = document.createElement("span");
  text.textContent = "I LOVE YOU";
  heart.appendChild(text);

  // Random position
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.top = Math.random() * 100 + "vh";

  // Random color
  const colors = ["#ff4b8b", "#ff7ba7", "#ff2b6d", "#ff9ad5", "#ffa3c4"];
  heart.style.background = colors[Math.floor(Math.random() * colors.length)];

  document.body.appendChild(heart);

  // Animate
  if (window.gsap) {
    gsap.fromTo(
      heart,
      { scale: 0.6, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
        onComplete() {
          gsap.to(heart, {
            opacity: 0,
            y: -30,
            duration: 1.2,
            delay: 0.6,
            onComplete: () => heart.remove(),
          });
        },
      }
    );
  } else {
    setTimeout(() => heart.remove(), 1800);
  }
}

function unleashLoveStorm() {
  let count = 0;
  const interval = setInterval(() => {
    spawnLoveHeart();
    count++;
    if (count > 25) clearInterval(interval);
  }, 120);
}

// Single heart per click
if (yesButton) {
  yesButton.addEventListener("click", () => {
    spawnLoveHeart();
  });
}
})();

const audio = document.getElementById('valentineAudio');
const playButton = document.getElementById('audioPlay');

playButton.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playButton.textContent = "⏸"; // change button icon to pause
  } else {
    audio.pause();
    playButton.textContent = "▶"; // change button icon back to play
  }
});

// Optional: update time and progress bar
audio.addEventListener('timeupdate', () => {
  const progress = (audio.currentTime / audio.duration) * 100;
  document.getElementById('audioProgress').style.width = progress + "%";

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  document.getElementById('audioCurrent').textContent = formatTime(audio.currentTime);
  document.getElementById('audioDuration').textContent = formatTime(audio.duration || 0);
});
