/**
 * iK相談支援センター - メインスクリプト
 */

// ===== オープニングアニメーション =====
window.addEventListener('load', () => {
  const splash = document.getElementById('opening-splash');

  // オープニング要素がないページでは即開始（他要素への影響を最小化）
  if (!splash) {
    document.body.classList.add('start-animation');
    return;
  }

  // すべてのページ遷移で必ず再生（分岐なしで構造を単純化）
  setTimeout(() => {
    document.body.classList.add('start-animation');
  }, 1800);
});

// ===== ハンバーガーメニュー =====
const menuBtn = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

if (menuBtn && navMenu) {
  // クリックでメニュー開閉
  menuBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    menuBtn.classList.toggle('is-open', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // キーボード操作対応
  menuBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const isOpen = navMenu.classList.toggle('active');
      menuBtn.classList.toggle('is-open', isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    }
  });

  // メニュー内リンククリックでメニューを閉じる
  document.querySelectorAll('.pc-nav a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      menuBtn.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // PC幅に戻ったらメニュー状態をリセット
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 769px)').matches) {
      navMenu.classList.remove('active');
      menuBtn.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ===== フェードインアニメーション =====
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

// ===== TOPへ戻るボタン =====
const toTopBtn = document.getElementById('to-top');
const heroSection = document.querySelector('.hero');

if (toTopBtn) {
  // スクロール位置で表示制御
  window.addEventListener('scroll', () => {
    if (heroSection) {
      const heroBottom = heroSection.getBoundingClientRect().bottom;
      if (heroBottom <= 0) {
        toTopBtn.classList.add('visible');
      } else {
        toTopBtn.classList.remove('visible');
      }
    } else {
      // heroがないページでは常に表示
      if (window.scrollY > 300) {
        toTopBtn.classList.add('visible');
      } else {
        toTopBtn.classList.remove('visible');
      }
    }
  });

  // クリックでトップへスムーズスクロール
  toTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ===== viewport高さ補正（iOS Safari対策） =====
function setVhVar() {
  const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.setProperty('--vh', `${h * 0.01}px`);
}

setVhVar();
window.addEventListener('resize', setVhVar);
window.addEventListener('orientationchange', setVhVar);

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', setVhVar);
  window.visualViewport.addEventListener('scroll', setVhVar);
}

// ===== お問い合わせフォーム送信（AJAX） =====
const contactForm = document.querySelector('.contact-form');
const formResult = document.getElementById('form-result');

if (contactForm && formResult) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 結果表示をリセット
    formResult.style.display = 'none';
    formResult.classList.remove('error');

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: contactForm.method,
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      let data = null;
      try {
        data = await response.json();
      } catch (_) {
        // JSON解析失敗時は無視
      }

      // 成功判定
      if (response.ok && (!data || !data.errors)) {
        contactForm.reset();
        formResult.textContent = '送信が完了しました。内容を確認し、担当者よりご連絡いたします。';
        formResult.style.display = 'block';
        formResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // エラー処理
      const msg = (data && data.errors && Array.isArray(data.errors))
        ? data.errors.map(e => e.message).join(' / ')
        : '送信に失敗しました。入力内容をご確認のうえ再度お試しください。';

      formResult.textContent = msg;
      formResult.classList.add('error');
      formResult.style.display = 'block';

    } catch (err) {
      formResult.textContent = '送信に失敗しました。通信状況をご確認のうえ再度お試しください。';
      formResult.classList.add('error');
      formResult.style.display = 'block';
    }
  });
}
