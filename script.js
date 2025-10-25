/* ============================================
   DIV — NEON PORTFOLIO (script.js)
   - typing for hero on load
   - typing for body text when scrolled into view
   - zigzag motion for .zig elements (reverse by scroll dir)
   - timeline neon-dot animation when timeline visible
   - starfield canvas
   - configuration at top for easy edits
   ============================================ */

/* -----------------------
   CONFIG (EDITABLE)
   ----------------------- */
const CONFIG = {
  heroText: "Hi — I am Div",
  heroSpeed: 60,          // ms per char for hero
  bodySpeed: 28,          // ms per char for other text
  bodyDelayBetween: 250,  // small delay between typed nodes
  zigDuration: 6000       // must match CSS animation-duration
};

/* -----------------------
   UTIL: Typewriter for a single element
   - returns a Promise that resolves when typing finishes
   ----------------------- */
function typeText(el, text, speed) {
  return new Promise(resolve => {
    el.textContent = "";
    // create caret
    const caret = document.createElement('span');
    caret.className = 'caret';
    caret.style.borderRight = `2px solid ${getComputedStyle(document.documentElement).getPropertyValue('--typing-caret') || 'white'}`;
    caret.style.display = 'inline-block';
    caret.style.marginLeft = '6px';
    caret.style.height = '1em';
    caret.style.verticalAlign = 'middle';
    el.appendChild(caret);

    let i = 0;
    function step(){
      if (i <= text.length) {
        // preserve HTML tags if present: we keep simple text only (avoid HTML parsing complexity)
        el.textContent = text.slice(0, i);
        el.appendChild(caret);
        i++;
        setTimeout(step, speed);
      } else {
        // blink caret a few times then remove
        let blink = 0;
        const b = setInterval(()=> {
          caret.style.borderRightColor = (blink % 2 === 0) ? 'transparent' : getComputedStyle(document.documentElement).getPropertyValue('--typing-caret') || 'white';
          blink++;
          if (blink > 4) { clearInterval(b); caret.remove(); resolve(); }
        }, 300);
      }
    }
    step();
  });
}

/* -----------------------
   HERO typing on DOMContentLoaded
   ----------------------- */
function startHeroTyping() {
  const h = document.getElementById('typed-hero');
  if (!h) return;
  // type with neon-styled text — we keep text color via CSS (background-clip text)
  typeText(h, CONFIG.heroText, CONFIG.heroSpeed);
}

/* -----------------------
   TYPED ON SCROLL:
   - find elements with class .typed-on-scroll or [data-typed]
   - when element enters viewport, type its innerText (preserve simple inline markup not supported)
   ----------------------- */
function initScrollTyping() {
  const nodes = Array.from(document.querySelectorAll('.typed-on-scroll, [data-typed]')).filter(n => n.id !== 'typed-hero');
  const options = { threshold: 0.25 };
  const obs = new IntersectionObserver((entries, obsr) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // prevent repeating if already typed
        if (el.dataset.typedDone) { obsr.unobserve(el); return; }
        el.dataset.typedDone = "1";
        const text = el.textContent.trim();
        // clear then run type
        el.textContent = "";
        // small delay so large blocks feel natural
        setTimeout(()=> {
          typeText(el, text, CONFIG.bodySpeed);
        }, CONFIG.bodyDelayBetween);
        obsr.unobserve(el);
      }
    });
  }, options);
  nodes.forEach(n => obs.observe(n));
}

/* -----------------------
   ZIGZAG MOTION CONTROL
   - Elements with .zig will animate when they intersect
   - Direction toggles by scroll direction (up/down)
   ----------------------- */
let lastY = window.scrollY;
function getScrollDirection() {
  const dir = window.scrollY > lastY ? 'down' : 'up';
  lastY = window.scrollY;
  return dir;
}
function setupZigzag() {
  const zigEls = document.querySelectorAll('.zig');
  const zigObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, idx) => {
      const el = entry.target;
      if (entry.isIntersecting) {
        // add class to animate
        el.classList.add('zig-animate');
        // determine direction based on current scroll dir and index for alternating effect
        const dir = getScrollDirection();
        const even = (idx % 2 === 0);
        if ((even && dir === 'down') || (!even && dir === 'up')) {
          el.style.animationName = 'zig-right';
        } else {
          el.style.animationName = 'zig-left';
        }
      } else {
        // remove running animation
        el.classList.remove('zig-animate');
        el.style.animationName = '';
      }
    });
  }, { threshold: 0.18 });
  zigEls.forEach((e) => zigObserver.observe(e));
  // update scroll direction on scroll to affect subsequent entries
  window.addEventListener('scroll', () => { getScrollDirection(); }, { passive: true });
}

/* -----------------------
   TIMELINE NEON DOT
   - Triggers when timeline section is visible
   ----------------------- */
function setupTimelineDot() {
  const timeline = document.getElementById('timeline');
  const dot = document.getElementById('neon-dot');
  if (!timeline || !dot) return;
  const tObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // trigger animation by toggling class (reflow trick)
        dot.classList.remove('dot-animate');
        void dot.offsetWidth;
        dot.classList.add('dot-animate');
      } else {
        dot.classList.remove('dot-animate');
      }
    });
  }, { threshold: 0.25 });
  tObs.observe(timeline);
}

/* -----------------------
   STARFIELD: lightweight canvas star generator
   ----------------------- */
function startStarfield() {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // create stars
  const stars = [];
  const count = Math.max(80, Math.floor((window.innerWidth * window.innerHeight) / 12000));
  for (let i=0;i<count;i++) {
    stars.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: Math.random()*1.4 + 0.2,
      tw: Math.random()*0.015 + 0.002,
      a: Math.random()*0.7 + 0.15
    });
  }

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // subtle gradient
    const grd = ctx.createLinearGradient(0,0,0,canvas.height);
    grd.addColorStop(0,'rgba(255,255,255,0.01)');
    grd.addColorStop(1,'rgba(0,0,0,0.02)');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const t = Date.now();
    for (const s of stars) {
      const alpha = s.a + Math.sin(t * s.tw) * 0.25;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1,Math.max(0,alpha))})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* -----------------------
   DOMContentLoaded: initialize everything
   ----------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // footer year
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  // start starfield
  startStarfield();

  // hero typed immediately
  startHeroTyping();

  // typed-on-scroll for body text
  initScrollTyping();

  // zigzag motion
  setupZigzag();

  // timeline dot
  setupTimelineDot();
});
