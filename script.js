const body = document.body;
const themeToggle = document.querySelector('#theme-toggle');
const storedTheme = localStorage.getItem('theme');
if (storedTheme === 'dark') body.classList.add('dark');
themeToggle.textContent = body.classList.contains('dark') ? '☀' : '☾';

themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark');
  const isDark = body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeToggle.textContent = isDark ? '☀' : '☾';
});

document.querySelector('#year').textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const metricObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const metric = entry.target;
    const target = Number(metric.dataset.target);
    const duration = 1100;
    const start = performance.now();
    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      metric.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    metricObserver.unobserve(metric);
  });
}, { threshold: 0.65 });

document.querySelectorAll('.metric').forEach((el) => metricObserver.observe(el));

const panels = {
  retrieval: {
    title: 'New task → retrieve similar workflows',
    text: 'When a task arrives, its instruction is embedded and compared with stored task embeddings. The closest workflows are shown to the agent as reusable context.'
  },
  memory: {
    title: 'Memory DB → store reusable experience',
    text: 'PostgreSQL with pgvector stores task names, URLs, agent thoughts, actions, accessibility-tree related context, and embeddings for similarity search.'
  },
  agent: {
    title: 'LLM agent → decide whether memory helps',
    text: 'The agent receives retrieved workflows but still reasons over the current page state, so memory acts as guidance rather than a rigid script.'
  },
  evaluation: {
    title: 'Evaluation → measure success and efficiency',
    text: 'The system is evaluated using task success, step score, key node completion, near success, efficiency, and cost-related metrics.'
  }
};

const panel = document.querySelector('#architecture-panel');
document.querySelectorAll('.node').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.node').forEach((node) => node.classList.remove('active'));
    button.classList.add('active');
    const item = panels[button.dataset.panel];
    panel.innerHTML = `<h3>${item.title}</h3><p>${item.text}</p>`;
  });
});

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('.project-card').forEach((card) => {
      const tags = card.dataset.tags.split(' ');
      card.classList.toggle('hidden', filter !== 'all' && !tags.includes(filter));
    });
  });
});

const copyEmail = document.querySelector('#copy-email');
copyEmail.addEventListener('click', async () => {
  const email = document.querySelector('#email-link').textContent.trim();
  try {
    await navigator.clipboard.writeText(email);
    copyEmail.textContent = 'Copied!';
    setTimeout(() => (copyEmail.textContent = 'Copy email'), 1200);
  } catch {
    copyEmail.textContent = 'Copy manually';
  }
});

const canvas = document.querySelector('#particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  particles = Array.from({ length: Math.min(70, Math.floor(window.innerWidth / 18)) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    r: Math.random() * 2 + 0.8
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const isDark = body.classList.contains('dark');
  ctx.fillStyle = isDark ? 'rgba(177, 140, 255, 0.55)' : 'rgba(143, 77, 255, 0.35)';
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(32, 26, 24, 0.08)';

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
    if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 110) {
        ctx.globalAlpha = 1 - dist / 110;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawParticles);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
drawParticles();
