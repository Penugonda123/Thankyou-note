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
  }, 46);
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
    threshold: 0.18,
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
    element.style.transform = `translate(${x * 0.07}px, ${y * 0.1}px) translateY(-3px)`;
  });

  element.addEventListener("pointerleave", () => {
    element.style.transform = "";
  });
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

  const count = window.innerWidth < 720 ? 54 : 104;
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 1.7 + 0.45,
    speedX: (Math.random() - 0.5) * 0.22,
    speedY: Math.random() * -0.18 - 0.03,
    alpha: Math.random() * 0.55 + 0.18,
    pulse: Math.random() * Math.PI * 2,
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

    const opacity = particle.alpha + Math.sin(particle.pulse) * 0.14;
    const gradient = context.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      particle.size * 4,
    );
    gradient.addColorStop(0, `rgba(237, 243, 255, ${Math.max(opacity, 0)})`);
    gradient.addColorStop(0.45, `rgba(102, 246, 255, ${Math.max(opacity * 0.28, 0)})`);
    gradient.addColorStop(1, "rgba(102, 246, 255, 0)");

    context.beginPath();
    context.fillStyle = gradient;
    context.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
    context.fill();

    for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
      const next = particles[nextIndex];
      const dx = particle.x - next.x;
      const dy = particle.y - next.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 112) {
        context.beginPath();
        context.strokeStyle = `rgba(168, 136, 255, ${(1 - distance / 112) * 0.08})`;
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
