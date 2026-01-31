/**
 * iK相談支援センター - メインスクリプト
 * scroll fix v6: オープニングは「初回だけ」確実に再生し、終了後は完全撤去してスクロール阻害を残さない
 */

(function () {
  'use strict';

  const SPLASH_ID = 'opening-splash';
  const SEEN_KEY = 'ik_opening_seen';
  const ANIM_CLASS = 'start-animation';
  const REMOVED_CLASS = 'splash-removed';

  const SHOW_MS = 1200;      // 表示（ロゴ見せ時間）
  const FADE_MS = 650;       // CSSのフェード時間に合わせる（0.6s + 余裕）
  const TOTAL_MS = SHOW_MS + FADE_MS;

  function qs(id){ return document.getElementById(id); }

  function lockScroll() {
    try {
      document.documentElement.style.overflowY = 'hidden';
      document.body.style.overflowY = 'hidden';
      document.body.style.touchAction = 'none';
    } catch (e) {}
  }

  function unlockScroll() {
    try {
      document.documentElement.style.overflowY = 'auto';
      document.body.style.overflowY = 'auto';
      document.body.style.touchAction = '';
    } catch (e) {}
  }

  function hardHideSplash(splash) {
    try {
      // CSS側の強制非表示（display:none !important）を有効化
      document.body.classList.add(REMOVED_CLASS);

      // DOM上でも確実に撤去（Chromeでのスクロール阻害を根絶）
      if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
    } catch (e) {}
    unlockScroll();
  }

  function playSplashOnce() {
    const splash = qs(SPLASH_ID);
    if (!splash) {
      unlockScroll();
      return;
    }

    // 表示中はスクロールを確実に止める（スプラッシュの目的どおり）
    lockScroll();

    // 念のため表示状態を明示（CSSにdisplay:flex!importantがある）
    try {
      splash.style.visibility = 'visible';
      splash.style.opacity = '1';
      splash.style.pointerEvents = 'auto';
    } catch (e) {}

    // 一定時間表示 → フェードアウト開始 → 完全撤去
    window.setTimeout(() => {
      try { document.body.classList.add(ANIM_CLASS); } catch (e) {}
      window.setTimeout(() => {
        hardHideSplash(splash);
        try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
      }, FADE_MS);
    }, SHOW_MS);
  }

  function skipSplash() {
    const splash = qs(SPLASH_ID);
    if (!splash) {
      unlockScroll();
      return;
    }
    hardHideSplash(splash);
  }

  // DOMが組み上がった時点で判定（load待ちにすると一瞬チラつく場合がある）
  document.addEventListener('DOMContentLoaded', () => {
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; } catch (e) {}

    if (seen) {
      skipSplash();
    } else {
      playSplashOnce();
    }
  });

  // bfcache復帰対策：復帰時はスプラッシュを残さない
  window.addEventListener('pageshow', (e) => {
    if (e && e.persisted) {
      try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (err) {}
      skipSplash();
    }
  });

})();
