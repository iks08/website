window.addEventListener('load', () => {
    setTimeout(() => {
    document.body.classList.add('start-animation');
    }, 1800);

});

const menuBtn = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

menuBtn.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  menuBtn.classList.toggle('is-open', navMenu.classList.contains('active'));
});

// キーボード操作（Enter / Space）対応
menuBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    navMenu.classList.toggle('active');
    menuBtn.classList.toggle('is-open', navMenu.classList.contains('active'));
  }
});

document.querySelectorAll('.pc-nav a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    menuBtn.classList.remove('is-open');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(section => {
  observer.observe(section);
});

// 画面幅がPCに戻ったら、SPメニュー状態を解除して整合性を保つ
window.addEventListener('resize', () => {
  if (window.matchMedia('(min-width: 769px)').matches) {
    navMenu.classList.remove('active');
    menuBtn.classList.remove('is-open');
  }
});

// ==============================
// To Top Button Control
// ==============================
const toTopBtn = document.getElementById('to-top');
const heroSection = document.querySelector('.hero');

// スクロールで表示制御
window.addEventListener('scroll', () => {
  const heroBottom = heroSection.getBoundingClientRect().bottom;

  if (heroBottom <= 0) {
    toTopBtn.classList.add('visible');
  } else {
    toTopBtn.classList.remove('visible');
  }
});

// クリックでトップへ戻る
toTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
