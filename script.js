window.addEventListener('load', () => {
    setTimeout(() => {
    document.body.classList.add('start-animation');
    }, 1800);

});

const menuBtn = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

menuBtn.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('active');
  menuBtn.classList.toggle('is-open', isOpen);
  menuBtn.setAttribute('aria-expanded', isOpen);
});

menuBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const isOpen = navMenu.classList.toggle('active');
    menuBtn.classList.toggle('is-open', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen);
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
// ==============================
// iOS Safari / PC の viewport差を吸収（--vh を実寸で固定）
// ==============================
function setVhVar() {
  const h = (window.visualViewport ? window.visualViewport.height : window.innerHeight);
  document.documentElement.style.setProperty('--vh', `${h * 0.01}px`);
}

setVhVar();
window.addEventListener('resize', setVhVar);
window.addEventListener('orientationchange', setVhVar);
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', setVhVar);
  window.visualViewport.addEventListener('scroll', setVhVar);
}

// ==============================
// Contact Form Submit (AJAX)
// - Formspreeへページ遷移なしで送信し、フォーム直下に結果を表示
// ==============================
const contactForm = document.querySelector('.contact-form');
const formResult = document.getElementById('form-result');

if (contactForm && formResult) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 表示リセット
    formResult.style.display = 'none';
    formResult.classList.remove('error');

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: contactForm.method, // "POST" をHTMLから取得
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      // ここで必ずJSONを読みに行く（Formspreeはerrorsを返すことがある）
      let data = null;
      try {
        data = await response.json();
      } catch (_) {
        // JSONで返らないケース（HTML等）は data=null のまま扱う
      }

      // 成功判定：HTTP OK かつ errors が無いこと
      if (response.ok && (!data || !data.errors)) {
        contactForm.reset();
        formResult.textContent = '送信が完了しました。内容を確認し、担当者よりご連絡いたします。';
        formResult.style.display = 'block';
        formResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // 失敗：Formspreeのエラーを優先表示
      const msg =
        (data && data.errors && Array.isArray(data.errors))
          ? data.errors.map(e => e.message).join(' / ')
          : '送信に失敗しました。入力内容をご確認のうえ再度お試しください。';

      formResult.textContent = msg;
      formResult.classList.add('error');
      formResult.style.display = 'block';

    } catch (err) {
      // ネットワーク/CORS等でfetch自体が失敗
      formResult.textContent = '送信に失敗しました。通信状況をご確認のうえ再度お試しください。';
      formResult.classList.add('error');
      formResult.style.display = 'block';
    }
  });
}
