// main.js – Sthirah Website JS
import { auth, onAuthStateChanged, signOut } from './firebase-config.js';

let currentUser = null;

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const loginBtn = document.getElementById('navLoginBtn');
    const cartBtn = document.getElementById('navCartBtn');
    
    if (user) {
        // Logged in
        loginBtn.textContent = 'Logout';
        loginBtn.href = '#';
        loginBtn.onclick = (e) => {
            e.preventDefault();
            signOut(auth).then(() => {
                window.location.reload();
            });
        };
        cartBtn.style.display = 'inline-block';
        updateCartCount();
    } else {
        // Not logged in
        loginBtn.textContent = 'Login';
        loginBtn.href = 'login.html';
        loginBtn.onclick = null;
        cartBtn.style.display = 'none';
    }
});

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('sthirah_cart') || '[]');
    let count = 0;
    cart.forEach(item => count += item.qty);
    const countBadge = document.getElementById('cartCount');
    if (countBadge) countBadge.textContent = count;
}

(function () {
    const card      = document.getElementById('productFlipCard');
    const inner     = document.getElementById('flipCardInner');
    const dragHint  = document.getElementById('dragHint');

    if (!card || !inner) return;

    let isDragging  = false;
    let startX      = 0;
    let currentRot  = 0;   // current snapped rotation (0 or 180)
    let liveRot     = 0;   // rotation during drag
    const THRESHOLD = 60;  // px drag needed to flip

    // Disable CSS transition so JS drives rotation
    inner.style.transition = 'none';

    function getClientX(e) {
        return e.touches ? e.touches[0].clientX : e.clientX;
    }

    function onStart(e) {
        isDragging = true;
        startX     = getClientX(e);
        liveRot    = currentRot;
        inner.style.transition = 'none';
        // hide drag hint after first touch
        if (dragHint) {
            dragHint.style.opacity = '0';
            dragHint.style.transition = 'opacity 0.4s';
        }
    }

    function onMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        const delta = getClientX(e) - startX;
        // Map drag pixels to degrees (drag 150px = 180deg)
        const dragDeg = (delta / 150) * 180;
        liveRot = currentRot + dragDeg;
        inner.style.transform = `rotateY(${liveRot}deg)`;
    }

    function onEnd(e) {
        if (!isDragging) return;
        isDragging = false;

        const delta = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) - startX;

        // Snap to nearest face
        inner.style.transition = 'transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1)';
        if (Math.abs(delta) >= THRESHOLD) {
            // flip direction
            currentRot = delta < 0
                ? currentRot + 180
                : currentRot - 180;
        }
        // Normalize to 0 or 180
        currentRot = ((currentRot % 360) + 360) % 360;
        if (currentRot > 90 && currentRot <= 270) currentRot = 180;
        else currentRot = 0;

        inner.style.transform = `rotateY(${currentRot}deg)`;
    }

    // Mouse events
    card.addEventListener('mousedown',  onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onEnd);

    // Touch events
    card.addEventListener('touchstart', onStart, { passive: true });
    card.addEventListener('touchmove',  onMove,  { passive: false });
    card.addEventListener('touchend',   onEnd);

    // Prevent image drag
    card.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', e => e.preventDefault());
    });
})();

// ===== Mobile Hamburger Menu =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
});

// Close menu when a nav link is clicked
navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
    });
});

// ===== Scroll Animations =====
const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Pause animations by default, trigger on scroll
document.querySelectorAll('.animate-fade-up').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
});

// Also animate benefit cards with stagger
document.querySelectorAll('.benefit-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(25px)';
    card.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
});

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            cardObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.benefit-card').forEach(card => cardObserver.observe(card));

// Size dropdown logic removed as requested by user

// ===== Qty Selector Logic =====
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');
const productQty = document.getElementById('productQty');

if (qtyMinus && qtyPlus && productQty) {
    qtyMinus.addEventListener('click', () => {
        let val = parseInt(productQty.value) || 2;
        if (val > 2) productQty.value = val - 1; // Min 2
    });
    qtyPlus.addEventListener('click', () => {
        let val = parseInt(productQty.value) || 2;
        if (val < 200) productQty.value = val + 1;
    });
}

// ===== Add to Cart Button Feedback & Logic =====
const cartBtn = document.getElementById('addToCartBtn');
if (cartBtn) {
    cartBtn.addEventListener('click', () => {
        if (!currentUser) {
            // Mandatory login
            alert("Please login first to add items to your cart.");
            window.location.href = 'login.html?redirect=index.html%23product';
            return;
        }

        // Add to local cart
        const cart = JSON.parse(localStorage.getItem('sthirah_cart') || '[]');
        const size = '500g'; 
        const price = 58; 
        
        let qtyToAdd = parseInt(productQty.value) || 2;
        if (qtyToAdd < 2) qtyToAdd = 2; // Hard enforce min 2
        
        const existing = cart.find(i => i.size === size);
        if (existing) {
            existing.qty += qtyToAdd;
        } else {
            cart.push({ id: 'jaggery_powder', name: 'Sthirah Jaggery Powder', size, price, qty: qtyToAdd });
        }
        localStorage.setItem('sthirah_cart', JSON.stringify(cart));
        updateCartCount();

        cartBtn.textContent = '✓ Added to Cart!';
        cartBtn.style.backgroundColor = '#1b9644';
        
        // Reset qty back to min 2
        productQty.value = 2;

        setTimeout(() => {
            cartBtn.textContent = 'Add to Cart';
            cartBtn.style.backgroundColor = '';
        }, 2500);
    });
}


const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop - 100;
        if (window.scrollY >= top) current = section.id;
    });
    navLinks.forEach(link => {
        link.style.background = '';
        link.style.color = '';
        if (link.getAttribute('href') === `#${current}`) {
            link.style.background = 'var(--accent-green)';
            link.style.color = 'var(--white)';
        }
    });
}, { passive: true });
