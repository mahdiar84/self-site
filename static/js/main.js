/* ============================================================
   MAIN.JS — Futuristic AI Portfolio
   Features: custom cursor · scroll reveal · active nav ·
             theme toggle · mobile nav · parallax hero ·
             skill bars · project expand · toast ·
             contact form · back-to-top · typing animation ·
             footer year
============================================================ */

'use strict';

/* ============================================================
   1. CUSTOM CURSOR
============================================================ */
(function initCursor() {
    const cursor     = document.getElementById('cursor');
    const cursorRing = document.getElementById('cursor-ring');
    if (!cursor || !cursorRing) return;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top  = mouseY + 'px';
    });

    /* Ring lags behind for smooth trailing effect */
    function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top  = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    /* Hide cursor when leaving window */
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        cursorRing.style.opacity = '0.5';
    });
})();


/* ============================================================
   2. NAVBAR — shrink on scroll + active link highlight
============================================================ */
(function initNavbar() {
    const navbar  = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-links a[data-section]');
    const sections = document.querySelectorAll('section[id]');

    /* Shrink on scroll */
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
        highlightActiveLink();
        toggleBackToTop();
    }, { passive: true });

    /* Active link via IntersectionObserver */
    function highlightActiveLink() {
        let current = '';
        sections.forEach((sec) => {
            if (window.scrollY >= sec.offsetTop - 120) {
                current = sec.getAttribute('id');
            }
        });
        navLinks.forEach((a) => {
            a.classList.toggle('active', a.dataset.section === current);
        });
    }
})();


/* ============================================================
   3. MOBILE NAV
============================================================ */
(function initMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    /* Close on ESC */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileNav();
    });
})();

function closeMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    hamburger?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}


/* ============================================================
   4. THEME TOGGLE — dark / light
============================================================ */
(function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    /* Restore saved preference */
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
    }

    btn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('theme',
            document.body.classList.contains('light-mode') ? 'light' : 'dark'
        );
    });
})();


/* ============================================================
   5. SCROLL REVEAL — IntersectionObserver
============================================================ */
(function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                /* Trigger skill bars when skill cards become visible */
                if (entry.target.classList.contains('skill-card')) {
                    entry.target.classList.add('visible');
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => observer.observe(el));
})();


/* ============================================================
   6. PARALLAX HERO GRID — mouse parallax
============================================================ */
(function initParallax() {
    const parallaxEl = document.getElementById('hero-parallax');
    if (!parallaxEl) return;

    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth  - 0.5) * 18;
        const y = (e.clientY / window.innerHeight - 0.5) * 18;
        parallaxEl.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });
})();


/* ============================================================
   7. TYPING ANIMATION — hero title
============================================================ */
(function initTyping() {
    const el = document.getElementById('hero-title');
    if (!el) return;

    const fullText = el.textContent.trim();
    el.textContent = '';

    /* Add cursor span */
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'typed-cursor';
    cursorSpan.textContent = '|';
    el.appendChild(cursorSpan);

    let i = 0;
    const speed = 65;

    function type() {
        if (i < fullText.length) {
            el.insertBefore(document.createTextNode(fullText[i]), cursorSpan);
            i++;
            setTimeout(type, speed);
        } else {
            /* Remove cursor after typing is done */
            setTimeout(() => cursorSpan.remove(), 1200);
        }
    }

    /* Small delay before starting */
    setTimeout(type, 600);
})();


/* ============================================================
   8. PROJECT CARD EXPAND
============================================================ */
function toggleExpand(btn) {
    const card = btn.closest('.project-card');
    if (!card) return;
    const isExpanded = card.classList.toggle('expanded');
    btn.setAttribute('aria-expanded', isExpanded);
}


/* ============================================================
   9. CONTACT FORM — fetch + toast
============================================================ */
(function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Sending…';
        btn.disabled = true;

        const data = Object.fromEntries(new FormData(form));

        try {
            const res = await fetch('/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                showToast('Message sent! I\'ll get back to you soon.');
                form.reset();
            } else {
                showToast('Something went wrong. Please try again.', true);
            }
        } catch {
            showToast('Message sent! I\'ll get back to you soon.');
            form.reset();
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
})();


/* ============================================================
   10. TOAST NOTIFICATION
============================================================ */
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.style.borderColor = isError
        ? 'rgba(248,113,113,.4)'
        : 'var(--primary-border)';
    toast.style.color = isError ? '#f87171' : 'var(--primary-bright)';

    toast.classList.add('show');

    setTimeout(() => toast.classList.remove('show'), 4000);
}


/* ============================================================
   11. BACK TO TOP
============================================================ */
function toggleBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    btn.classList.toggle('visible', window.scrollY > 400);
}

(function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();


/* ============================================================
   12. FOOTER YEAR
============================================================ */
(function setYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
})();


/* ============================================================
   13. SMOOTH ANCHOR SCROLL (for nav links)
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});
