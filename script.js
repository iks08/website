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
// 仕様：
// - 初回のみ一定時間表示（SHOW_MS）→フェード（FADE_MS）→完全撤去（DOM remove + splash-removed）
// - 2回目以降 / bfcache復帰は即撤去（スクロール阻害ゼロ）
(() => {
  const KEY = "ik_opening_seen";
  const SHOW_MS = 1200; // 表示維持
  const FADE_MS = 650;  // CSS transition(0.6s)より少し長め
  const FAILSAFE_MS = 6000; // 何かあっても必ず撤去

  let ran = false;

  function unlockScroll() {
    try { document.documentElement.style.overflowY = "auto"; } catch (_) {}
    try { document.body.style.overflowY = "auto"; } catch (_) {}
  }

  function hardRemove(splash) {
    if (!splash) return;
    document.body.classList.add("splash-removed");
    splash.setAttribute("aria-hidden", "true");
    splash.style.pointerEvents = "none";
    try { splash.remove(); } catch (_) { if (splash.parentNode) splash.parentNode.removeChild(splash); }
    unlockScroll();
  }

  function run(forceInstant) {
    if (ran) return;
    ran = true;

    const splash = document.getElementById("opening-splash");
    if (!splash) { unlockScroll(); return; }

    if (forceInstant) {
      hardRemove(splash);
      return;
    }

    // スプラッシュ表示中のみスクロールをロック
    try { document.documentElement.style.overflowY = "hidden"; } catch (_) {}
    try { document.body.style.overflowY = "hidden"; } catch (_) {}

    // 以降は「見た扱い」にする（同一タブ内の2回目以降は即スキップ）
    try { sessionStorage.setItem(KEY, "1"); } catch (_) {}

    // 表示→フェード→撤去
    setTimeout(() => {
      document.body.classList.add("start-animation");
      setTimeout(() => hardRemove(splash), FADE_MS);
    }, SHOW_MS);

    // 保険：何があっても一定時間後に撤去（スクロール阻害を絶対に残さない）
    setTimeout(() => hardRemove(splash), FAILSAFE_MS);
  }

  // bfcache復帰は即撤去（Chromeのスクロール不具合再発防止）
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    const splash = document.getElementById("opening-splash");
    if (splash) hardRemove(splash);
    document.body.classList.add("splash-removed");
    unlockScroll();
  });

  window.addEventListener("load", () => {
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === "1"; } catch (_) {}
    run(seen);
  }, { once: true });
})();

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
