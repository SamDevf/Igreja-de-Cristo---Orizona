/* ============================================================
   Igreja de Cristo – Orizona, GO
   Arquivo: script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ─── NAVEGAÇÃO: efeito de scroll ─── */
  const navbar = document.getElementById('navbar');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  /* ─── MENU HAMBÚRGUER (mobile) ─── */
  const navLinks = document.getElementById('navLinks');

  window.toggleMenu = function () {
    if (navLinks) {
      navLinks.classList.toggle('open');
    }
  };

  document.querySelectorAll('#navLinks a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks?.classList.remove('open');
    });
  });

  /* ─── REVEAL AO ROLAR (IntersectionObserver) ─── */
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach(el => revealObserver.observe(el));
  }


  /* ─── SERMÕES: abrir vídeo dentro do card ─── */
  const sermonCards = document.querySelectorAll('.sermon-card');

  if (!sermonCards.length) return;

  function buildYoutubeEmbed(videoId, title) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
    iframe.title = title || 'Vídeo do YouTube';
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    return iframe;
  }

  function closeAllSermonVideos() {
    sermonCards.forEach((card) => {
      card.classList.remove('is-active');

      const videoWrap = card.querySelector('.sermon-video');
      const thumb = card.querySelector('.sermon-thumb');

      if (videoWrap) {
        videoWrap.innerHTML = '';
        videoWrap.hidden = true;
      }

      if (thumb) {
        thumb.style.display = '';
      }
    });
  }

  sermonCards.forEach((card) => {
    const playButton = card.querySelector('.sermon-play');
    const thumb = card.querySelector('.sermon-thumb');

    function activateCard(event) {
      event.preventDefault();

      closeAllSermonVideos();

      card.classList.add('is-active');

      const videoId = card.dataset.video;
      const title = card.dataset.title;
      const videoWrap = card.querySelector('.sermon-video');

      if (!videoId || !videoWrap || !thumb) return;

      thumb.style.display = 'none';
      videoWrap.hidden = false;
      videoWrap.appendChild(buildYoutubeEmbed(videoId, title));
    }

    if (playButton) {
      playButton.addEventListener('click', activateCard);
    }

    if (thumb) {
      thumb.addEventListener('click', activateCard);
    }
  });
});