const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealLoadItems = document.querySelectorAll(".reveal-load");
requestAnimationFrame(() => {
  revealLoadItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 90}ms`;
    item.classList.add("is-visible");
  });
});

const title = document.querySelector("#typedTitle");

function typeTitle() {
  if (!title) return;

  const text = title.dataset.text || "";

  if (reducedMotion) {
    title.textContent = text;
    return;
  }

  let index = 0;
  const timer = window.setInterval(() => {
    title.textContent = text.slice(0, index);
    index += 1;

    if (index > text.length) {
      window.clearInterval(timer);
    }
  }, 38);
}

typeTitle();

const quote = document.querySelector("[data-animate-quote]");

if (quote) {
  const words = quote.textContent.trim().split(/\s+/);
  quote.setAttribute("aria-label", words.join(" "));
  quote.innerHTML = words
    .map((word, index) => `<span style="--word-index:${index}">${word}&nbsp;</span>`)
    .join("");
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  },
);

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

document.querySelectorAll(".magnetic").forEach((element) => {
  if (reducedMotion) return;

  element.addEventListener("pointermove", (event) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    element.style.transform = `translate(${x * 0.05}px, ${y * 0.08}px) translateY(-3px)`;
  });

  element.addEventListener("pointerleave", () => {
    element.style.transform = "";
  });
});

const hoursElement = document.querySelector("#hours");
const minutesElement = document.querySelector("#minutes");
const secondsElement = document.querySelector("#seconds");
const timerNote = document.querySelector("#timerNote");

function getMeetingTime() {
  const meeting = new Date();
  meeting.setHours(22, 30, 0, 0);
  return meeting;
}

function updateCountdown() {
  const meeting = getMeetingTime();
  const now = new Date();
  const distance = meeting.getTime() - now.getTime();

  if (distance <= 0) {
    if (hoursElement) hoursElement.textContent = "00";
    if (minutesElement) minutesElement.textContent = "00";
    if (secondsElement) secondsElement.textContent = "00";
    if (timerNote) timerNote.textContent = "Meeting time has arrived. Please join in the living room.";
    return;
  }

  const hours = Math.floor(distance / (1000 * 60 * 60));
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  if (hoursElement) hoursElement.textContent = String(hours).padStart(2, "0");
  if (minutesElement) minutesElement.textContent = String(minutes).padStart(2, "0");
  if (secondsElement) secondsElement.textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const value = Number(entry.target.dataset.count || 0);
      const duration = reducedMotion ? 1 : 1200;
      const start = performance.now();

      function animate(currentTime) {
        const progress = Math.min((currentTime - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(value * eased);
        entry.target.textContent = currentValue.toLocaleString("en-IN");

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }

      requestAnimationFrame(animate);
      statObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.4 },
);

document.querySelectorAll("[data-count]").forEach((item) => statObserver.observe(item));

const nav = document.querySelector("#primaryNav");
const menuToggle = document.querySelector(".menu-toggle");

menuToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open") || false;
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.innerHTML = isOpen
    ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
    : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    if (menuToggle) {
      menuToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    }
  });
});

const modal = document.querySelector("#attendanceModal");
const modalTitle = document.querySelector("#modalTitle");
const modalMessage = document.querySelector("#modalMessage");
const modalIcon = document.querySelector("#modalIcon");
const reasonForm = document.querySelector("#reasonForm");
const reasonInput = document.querySelector("#reasonInput");
const closeModal = document.querySelector("#closeModal");

function openModal(type) {
  if (!modal || !modalTitle || !modalMessage || !modalIcon || !reasonForm) return;

  const isUnable = type === "unable";
  modal.classList.add("is-visible");
  modal.setAttribute("aria-hidden", "false");
  modalIcon.classList.toggle("warning", isUnable);
  modalIcon.innerHTML = isUnable
    ? '<i class="fa-solid fa-circle-xmark"></i>'
    : '<i class="fa-solid fa-circle-check"></i>';
  modalTitle.textContent = isUnable ? "Unable to Attend" : "Attendance Confirmed";
  modalMessage.textContent = isUnable
    ? "Please enter the reason so the group is informed before the meeting."
    : "Thank you for confirming your attendance.";
  reasonForm.classList.toggle("is-visible", isUnable);

  if (isUnable && reasonInput) {
    reasonInput.value = "";
    setTimeout(() => reasonInput.focus(), 80);
  } else {
    setTimeout(() => closeModal?.focus(), 80);
  }
}

function closeAttendanceModal() {
  if (!modal) return;
  modal.classList.remove("is-visible");
  modal.setAttribute("aria-hidden", "true");
}

document.querySelectorAll("[data-attendance]").forEach((button) => {
  button.addEventListener("click", () => openModal(button.dataset.attendance));
});

closeModal?.addEventListener("click", closeAttendanceModal);

modal?.addEventListener("click", (event) => {
  if (event.target === modal) closeAttendanceModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeAttendanceModal();
});

reasonForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!modalTitle || !modalMessage || !modalIcon || !reasonForm) return;

  modalIcon.classList.remove("warning");
  modalIcon.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
  modalTitle.textContent = "Reason Submitted";
  modalMessage.textContent = "Thank you. Your reason has been noted for the group discussion.";
  reasonForm.classList.remove("is-visible");
});

const printButton = document.querySelector("#printSummary");
printButton?.addEventListener("click", () => window.print());

const scrollTop = document.querySelector("#scrollTop");

function updateScrollButton() {
  if (!scrollTop) return;
  scrollTop.classList.toggle("is-visible", window.scrollY > 520);
}

window.addEventListener("scroll", updateScrollButton, { passive: true });
updateScrollButton();

scrollTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
});

const canvas = document.querySelector("#particleCanvas");
const context = canvas?.getContext("2d");
let particles = [];
let animationFrame = 0;

function resizeCanvas() {
  if (!canvas || !context) return;

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * pixelRatio);
  canvas.height = Math.floor(window.innerHeight * pixelRatio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function createParticles() {
  if (!canvas || reducedMotion) return;

  const count = window.innerWidth < 720 ? 56 : 112;
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 1.6 + 0.45,
    speedX: (Math.random() - 0.5) * 0.2,
    speedY: Math.random() * -0.17 - 0.035,
    alpha: Math.random() * 0.48 + 0.18,
    pulse: Math.random() * Math.PI * 2,
    hue: Math.random() > 0.72 ? "255, 95, 158" : "99, 231, 255",
  }));
}

function drawParticles() {
  if (!canvas || !context || reducedMotion) return;

  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((particle, index) => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    particle.pulse += 0.016;

    if (particle.y < -12) particle.y = window.innerHeight + 12;
    if (particle.x < -12) particle.x = window.innerWidth + 12;
    if (particle.x > window.innerWidth + 12) particle.x = -12;

    const opacity = Math.max(particle.alpha + Math.sin(particle.pulse) * 0.12, 0);
    const gradient = context.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      particle.size * 4,
    );
    gradient.addColorStop(0, `rgba(247, 249, 255, ${opacity})`);
    gradient.addColorStop(0.45, `rgba(${particle.hue}, ${opacity * 0.28})`);
    gradient.addColorStop(1, `rgba(${particle.hue}, 0)`);

    context.beginPath();
    context.fillStyle = gradient;
    context.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
    context.fill();

    for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
      const next = particles[nextIndex];
      const dx = particle.x - next.x;
      const dy = particle.y - next.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 110) {
        context.beginPath();
        context.strokeStyle = `rgba(170, 124, 255, ${(1 - distance / 110) * 0.08})`;
        context.lineWidth = 1;
        context.moveTo(particle.x, particle.y);
        context.lineTo(next.x, next.y);
        context.stroke();
      }
    }
  });

  animationFrame = window.requestAnimationFrame(drawParticles);
}

if (canvas && context && !reducedMotion) {
  resizeCanvas();
  createParticles();
  drawParticles();

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(animationFrame);
    resizeCanvas();
    createParticles();
    drawParticles();
  });
}
