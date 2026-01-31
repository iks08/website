// === Mobile: disable hero video to reduce load ===
(() => {
  try {
    if (!window.matchMedia || !window.matchMedia("(max-width: 768px)").matches) return;
    const v = document.getElementById("bg-video");
    if (!v) return;

    // Stop playback and prevent loading on mobile
    v.pause();
    v.removeAttribute("autoplay");
    v.removeAttribute("loop");

    const srcEl = v.querySelector("source");
    if (srcEl) srcEl.removeAttribute("src");

    // Force the browser to drop any pending resource load
    v.load();
  } catch (e) {
    // no-op
  }
})();

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

    // Chrome対策：visibility/opacityだけだと固定レイヤーが残り、スクロールを塞ぐ場合があるため
    // トランジション完了後に opening-splash を確実に無効化（pointer-events無効 + display:none）
    const hardHide = () => {
      try {
        splash.style.pointerEvents = 'none';
        splash.style.display = 'none';
        splash.setAttribute('aria-hidden', 'true');
      } catch (e) {}
    };
    try {
      splash.style.pointerEvents = 'none'; // 先に入力を遮らない
      splash.addEventListener('transitionend', hardHide, { once: true });
    } catch (e) {}
    setTimeout(hardHide, 2600); // transitionendが来ない環境の保険
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

// FormSubmitは「通常のフォーム送信」が安定するため、JS(AJAX)送信は使わない
// ※ ここでreturnしない（returnは関数外だとSyntaxErrorになるため）
const useAjax = !!(contactForm && formResult && !contactForm.action.includes('formsubmit.co'));

if (useAjax) {
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

/* SPLASH_SCROLL_FIX_V3 */
// 最終保険：Chromeで #opening-splash が invisible のまま残りスクロールが死ぬケースを強制解消
window.addEventListener('load', () => {
  const s = document.getElementById('opening-splash');
  if (!s) return;

  const forceStyle = (el, prop, value) => {
    try { el.style.setProperty(prop, value, 'important'); } catch (e) {}
  };

  const hardHide = () => {
    try {
      // クラス（CSS側の最終保険）
      document.body.classList.add('splash-removed');
      document.documentElement.classList.add('splash-removed');

      // 非表示（display はCSSで !important があるため念押し）
      forceStyle(s, 'pointer-events', 'none');
      forceStyle(s, 'display', 'none');
      s.setAttribute('aria-hidden', 'true');

      // 可能ならDOMから除去（Chromeの残留レイヤー対策）
      try { if (s.parentNode) s.parentNode.removeChild(s); } catch (e) {}

      // スクロール強制解除（root/body 両方）
      const de = document.documentElement;
      const b  = document.body;
      forceStyle(de, 'overflow-y', 'auto');
      forceStyle(b,  'overflow-y', 'auto');
      forceStyle(de, 'position', 'static');
      forceStyle(b,  'position', 'static');
      forceStyle(de, 'height', 'auto');
      forceStyle(b,  'height', 'auto');
    } catch (e) {}
  };

  const runOpeningOnce = () => {
    // 開始状態の保険：表示
    try {
      document.body.classList.remove('splash-removed');
      document.documentElement.classList.remove('splash-removed');
      forceStyle(s, 'display', 'flex');
      forceStyle(s, 'pointer-events', 'auto');
      s.removeAttribute('aria-hidden');
    } catch (e) {}

    // 既存CSSのフェードアウト（body.start-animation）を使う
    const FADE_START_MS = 800;   // ロゴ表示時間
    const FADE_DUR_MS   = 650;   // CSS transition 0.6s + 余裕
    setTimeout(() => {
      try { document.body.classList.add('start-animation'); } catch (e) {}
    }, FADE_START_MS);

    setTimeout(() => {
      hardHide();
      try { sessionStorage.setItem('ik_opening_seen', '1'); } catch (e) {}
    }, FADE_START_MS + FADE_DUR_MS);

    // 念押し（Chrome対策）
    setTimeout(hardHide, FADE_START_MS + FADE_DUR_MS + 1500);
  };

  // 2回目以降は即撤去（スクロール最優先）
  let seen = false;
  try { seen = sessionStorage.getItem('ik_opening_seen') === '1'; } catch (e) {}

  if (seen) {
    hardHide();
    setTimeout(hardHide, 1500);
    return;
  }

  runOpeningOnce();
});
