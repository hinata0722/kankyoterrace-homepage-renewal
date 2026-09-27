/* ==========================================================================
   環境テラス株式会社 — script.js
   外部ライブラリ不使用。要素が無ければ何もしない（1セクション単位で移植可）。

   01. ロゴ画像が無いときの社名テキスト表示
   02. ヘッダーのスクロール状態
   03. スマホ用メニューの開閉
   04. スクロールに合わせたフェードイン
   05. 現在表示中のセクションをナビで示す
   06. お問い合わせフォームの入力チェック
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  body.classList.add('kt-js');

  /* 01. ロゴ画像 ---------------------------------------------------------- */
  var logo = document.querySelector('.kt-header__logo');
  var logoImg = logo && logo.querySelector('img');
  if (logoImg) {
    var noLogo = function () { logo.classList.add('kt-no-logo'); };
    if (logoImg.complete && logoImg.naturalWidth === 0) noLogo();
    logoImg.addEventListener('error', noLogo);
  }

  document.querySelectorAll('.kt-hero__media img, .kt-biz__media img').forEach(function (img) {
    var hide = function () { img.classList.add('kt-img-missing'); };
    if (img.complete && img.naturalWidth === 0) hide();
    img.addEventListener('error', hide);
  });

  /* 02. ヘッダー ---------------------------------------------------------- */
  var header = document.getElementById('kt-header');
  if (header) {
    var ticking = false;
    var updateHeader = function () {
      header.classList.toggle('kt-is-scrolled', window.scrollY > 12);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateHeader);
      }
    }, { passive: true });
    updateHeader();
  }

  /* 03. メニュー開閉 ------------------------------------------------------ */
  var toggle = document.querySelector('.kt-header__toggle');
  var nav = document.getElementById('kt-nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('kt-is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* 04. フェードイン ------------------------------------------------------ */
  var reveals = document.querySelectorAll('.kt-reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('kt-is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('kt-is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* 05. 現在地ナビ -------------------------------------------------------- */
  var navLinks = document.querySelectorAll('.kt-nav__link[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var linkFor = {};
    navLinks.forEach(function (a) { linkFor[a.getAttribute('href').slice(1)] = a; });
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        /* ごあいさつ・新着情報は Home 扱い */
        if (!linkFor[id]) id = 'kt-top';
        navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        linkFor[id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { sectionObserver.observe(s); });
  }

  /* 06. フォーム ---------------------------------------------------------- */
  var form = document.getElementById('kt-form');
  if (!form) return;

  var summary = document.getElementById('kt-error-summary');
  var summaryList = summary && summary.querySelector('.kt-error__list');
  var message = document.getElementById('kt-form-message');

  var rules = [
    { id: 'kt-name', msg: '氏名を入力してください' },
    { id: 'kt-email', msg: 'メールアドレスを入力してください', email: true },
    { id: 'kt-zip', msg: '郵便番号を入力してください' },
    { id: 'kt-address', msg: 'ご住所を入力してください' },
    { id: 'kt-phone', msg: '電話番号を入力してください' },
    { id: 'kt-message', msg: 'お問い合わせ内容を入力してください' }
  ];

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var errors = [];

    rules.forEach(function (rule) {
      var field = document.getElementById(rule.id);
      var value = field.value.trim();
      var text = null;
      if (!value) text = rule.msg;
      else if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) text = 'メールアドレスの形式が正しくありません';
      field.setAttribute('aria-invalid', text ? 'true' : 'false');
      if (text) errors.push({ id: rule.id, text: text });
    });

    summaryList.innerHTML = '';
    if (errors.length) {
      errors.forEach(function (err) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + err.id;
        a.textContent = err.text;
        li.appendChild(a);
        summaryList.appendChild(li);
      });
      summary.hidden = false;
      summary.focus();
      return;
    }
    summary.hidden = true;

    /* {{フォーム送信先}}：送信処理は本番環境（SWELL / Contact Form 7 等）で実装する。
       ここでは入力チェック後の表示確認のみ。 */
    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    window.setTimeout(function () {
      form.reset();
      button.disabled = false;
      message.textContent = 'お問い合わせありがとうございます。内容を確認のうえ、担当者よりご連絡いたします。';
      message.hidden = false;
    }, 600);
  });
});
