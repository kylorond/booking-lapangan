const translations = {
    id: {
        nav_home: "Lorem", nav_facility: "Ipsum", nav_booking: "Dolor", nav_promo: "Sit Amet", nav_review: "Consectetur",
        btn_login: "Aenean", btn_register: "Commodo", theme_lang: "Ligula Eget"
    },
    en: {
        nav_home: "Home", nav_facility: "Facility", nav_booking: "Booking", nav_promo: "Offers", nav_review: "Reviews",
        btn_login: "Sign In", btn_register: "Sign Up", theme_lang: "Settings"
    }
};

let currentLang = 'id';
let isLoggedIn = false;
let cart = [];
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function initTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function setTheme(mode) {
    if (mode === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    } else if (mode === 'light') {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        localStorage.removeItem('theme');
        initTheme();
    }
    showToast(mode === 'dark' ? 'Noctis' : (mode === 'light' ? 'Solor' : 'Machina'));
}

function toggleLang() {
    currentLang = currentLang === 'id' ? 'en' : 'id';
    document.getElementById('lang-btn').innerText = currentLang === 'id' ? 'AA' : 'EN';
    document.getElementById('mobile-lang').innerText = currentLang === 'id' ? 'AA' : 'EN';
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            if (el.tagName === 'INPUT' && el.type === 'button') {
                el.value = translations[currentLang][key];
            } else {
                el.innerHTML = translations[currentLang][key];
            }
        }
    });
    showToast(`Interdum ${currentLang.toUpperCase()}`);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function openModal(id) {
    const modal = document.getElementById(id);
    const content = document.getElementById(id + 'Content');
    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeModal(id) {
    const modal = document.getElementById(id);
    const content = document.getElementById(id + 'Content');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    const menu = document.getElementById('mobile-menu');
    menu.classList.remove('hidden');
    setTimeout(() => menu.classList.remove('opacity-0'), 10);
    document.body.style.overflow = 'hidden';
});

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.add('opacity-0');
    setTimeout(() => {
        menu.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }, 300);
}

function handleLogin(e) {
    e.preventDefault();
    isLoggedIn = true;
    document.getElementById('auth-buttons').classList.add('hidden');
    document.getElementById('user-menu').classList.remove('hidden');
    document.getElementById('user-menu').classList.add('flex');
    document.getElementById('mobile-auth-section').innerHTML = `<button onclick="handleLogout(); closeMobileMenu()" class="bg-red-500/10 text-red-500 py-4 rounded-2xl font-bold border border-red-500/20 text-lg hover:bg-red-500/20">Quisque</button>`;
    closeModal('loginModal');
    showToast('Elementum donec!');
}

function handleLogout() {
    isLoggedIn = false;
    cart = [];
    updateCartUI();
    document.getElementById('auth-buttons').classList.remove('hidden');
    document.getElementById('user-menu').classList.add('hidden');
    document.getElementById('user-menu').classList.remove('flex');
    document.getElementById('mobile-auth-section').innerHTML = `
        <button onclick="openModal('loginModal'); closeMobileMenu()" class="bg-white/10 text-white py-4 rounded-2xl font-bold border border-white/20 text-lg hover:bg-white/20">Aenean</button>
        <button onclick="openModal('registerModal'); closeMobileMenu()" class="bg-brand-500 text-white py-4 rounded-2xl font-bold shadow-glow text-lg">Commodo</button>
    `;
    showToast('Pulvinar magna');
}

function toggleCart() {
    if (!isLoggedIn) {
        showToast('Tincidunt praesent');
        openModal('loginModal');
        return;
    }
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
        document.body.style.overflow = 'auto';
    } else {
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        sidebar.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function toggleSlot(btn, court, time) {
    if (!isLoggedIn) {
        showToast('Tincidunt praesent');
        openModal('loginModal');
        return;
    }
    
    const slotId = `${court}-${time}`;
    const index = cart.findIndex(item => item.id === slotId);
    
    if (index > -1) {
        cart.splice(index, 1);
        btn.classList.remove('border-brand-500', 'bg-brand-50', 'dark:bg-brand-500/20', 'shadow-[inset_0_0_0_2px_#0ea5e9]');
    } else {
        cart.push({ id: slotId, court, time, price: 50000 });
        btn.classList.add('border-brand-500', 'bg-brand-50', 'dark:bg-brand-500/20', 'shadow-[inset_0_0_0_2px_#0ea5e9]');
    }
    updateCartUI();
}

function groupCartSessions() {
    if (cart.length === 0) return [];
    let sorted = [...cart].sort((a, b) => {
        if (a.court !== b.court) return a.court.localeCompare(b.court);
        return parseInt(a.time) - parseInt(b.time);
    });

    let groups = [];
    let currentGroup = { court: sorted[0].court, startTime: sorted[0].time, endTime: sorted[0].time, count: 1, total: sorted[0].price, ids: [sorted[0].id] };

    for (let i = 1; i < sorted.length; i++) {
        let curr = sorted[i];
        let prevTime = parseInt(currentGroup.endTime);
        let currTime = parseInt(curr.time);

        if (curr.court === currentGroup.court && currTime === prevTime + 1) {
            currentGroup.endTime = curr.time;
            currentGroup.count++;
            currentGroup.total += curr.price;
            currentGroup.ids.push(curr.id);
        } else {
            groups.push(currentGroup);
            currentGroup = { court: curr.court, startTime: curr.time, endTime: curr.time, count: 1, total: curr.price, ids: [curr.id] };
        }
    }
    groups.push(currentGroup);
    return groups;
}

function updateCartUI() {
    const badge = document.getElementById('cart-badge');
    const mainCount = document.getElementById('main-cart-count');
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('cartTotal');
    
    badge.innerText = cart.length;
    mainCount.innerText = cart.length;
    if (cart.length > 0) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-500 dark:text-gray-400 mt-20 flex flex-col items-center justify-center"><i class="fa-solid fa-basket-shopping text-6xl mb-4 opacity-20"></i><p>Vulputate turpis</p></div>`;
        totalEl.innerText = 'Rp 0';
        return;
    }

    const groups = groupCartSessions();
    let html = '';
    let grandTotal = 0;

    groups.forEach(g => {
        grandTotal += g.total;
        let timeText = g.count > 1 ? `${g.startTime} - ${parseInt(g.endTime)+1}:00` : `${g.startTime}`;
        
        html += `
        <div class="bg-white dark:bg-surface-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-surface-700 mb-4 relative overflow-hidden group">
            <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-500"></div>
            <div class="flex justify-between items-start ml-2">
                <div>
                    <h4 class="font-bold text-lg mb-1">${g.court}</h4>
                    <div class="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3">
                        <i class="fa-regular fa-clock mr-2"></i> ${timeText} <span class="mx-2">•</span> ${g.count} Dapibus
                    </div>
                    <div class="font-black text-brand-500">Rp ${(g.total/1000).toFixed(0)}k</div>
                </div>
                <button onclick="removeGroup('${g.ids.join(',')}')" class="text-gray-400 hover:text-red-500 transition-colors p-2"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        </div>`;
    });

    container.innerHTML = html;
    totalEl.innerText = `Rp ${(grandTotal/1000).toFixed(0)}k`;
}

function removeGroup(idsStr) {
    const ids = idsStr.split(',');
    cart = cart.filter(item => !ids.includes(item.id));
    
    document.querySelectorAll('.slot-btn').forEach(btn => {
        if(btn.onclick) {
            const funcStr = btn.getAttribute('onclick');
            ids.forEach(id => {
                const [c, t] = id.split('-');
                if(funcStr.includes(`'${c}', '${t}'`)) {
                    btn.classList.remove('border-brand-500', 'bg-brand-50', 'dark:bg-brand-500/20', 'shadow-[inset_0_0_0_2px_#0ea5e9]');
                }
            });
        }
    });
    updateCartUI();
}

function checkout() {
    if (cart.length === 0) {
        showToast('Vulputate turpis!');
        return;
    }
    toggleCart();
    showToast('Aliquet imperdiet!');
    cart = [];
    document.querySelectorAll('.slot-btn').forEach(btn => btn.classList.remove('border-brand-500', 'bg-brand-50', 'dark:bg-brand-500/20', 'shadow-[inset_0_0_0_2px_#0ea5e9]'));
    updateCartUI();
}

setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}, 5000);

window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
        nav.classList.remove('py-6');
        nav.classList.add('py-3');
    } else {
        nav.classList.remove('nav-scrolled');
        nav.classList.add('py-6');
        nav.classList.remove('py-3');
    }

    document.querySelectorAll('.reveal').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 50) {
            el.classList.add('active');
        }
    });
});

initTheme();
document.getElementById('booking-date').valueAsDate = new Date();
setTimeout(() => document.querySelectorAll('.reveal').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('active');
}), 100);