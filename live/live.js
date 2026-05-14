/* ============================================================
   Igreja de Cristo – Orizona, GO
   Arquivo: live.js  —  Lógica da Página de Transmissão
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────────────────────
     CONFIGURAÇÃO  —  edite aqui conforme necessário
  ────────────────────────────────────────────────────────── */
  const CONFIG = {
    // Channel ID do YouTube (UCxxxx…)
    // Para encontrar o seu: https://www.youtube.com/account_advanced
    channelId: 'UCd3T8_sXZWAZbrlMAxucN-Q',

    // ID do vídeo de fallback exibido quando não há transmissão ao vivo
    // Substitua pelo ID do último culto gravado
    fallbackVideoId: 'FrjZUwrbBlw',

    // Título do vídeo de fallback
    fallbackTitle: 'Afeições Do Coração – Pr. Edilson Nascimento',

    // Forçar estado offline para testes (true = mostra offline; false = detecta)
    forceOffline: true,
  };


  /* ──────────────────────────────────────────────────────────
     ELEMENTOS DO DOM
  ────────────────────────────────────────────────────────── */
  const navbar          = document.getElementById('navbar');
  const navLinks        = document.getElementById('navLinks');
  const playerWrap      = document.getElementById('livePlayerWrap');
  const playerRatio     = document.getElementById('livePlayerRatio');
  const offlinePlaceholder = document.getElementById('liveOfflinePlaceholder');
  const liveBadge       = document.getElementById('liveBadge');
  const badgeDot        = document.getElementById('liveDot');
  const badgeText       = document.getElementById('liveText');
  const chatFrame       = document.getElementById('liveChatFrame');
  const chatPlaceholder = document.getElementById('chatPlaceholder');
  const offlineFallbackBtn = document.getElementById('offlineFallbackBtn');


  /* ──────────────────────────────────────────────────────────
     NAVEGAÇÃO: efeito de scroll + hamburger
  ────────────────────────────────────────────────────────── */
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  window.toggleMenu = function () {
    navLinks?.classList.toggle('open');
  };

  document.querySelectorAll('#navLinks a').forEach(link => {
    link.addEventListener('click', () => navLinks?.classList.remove('open'));
  });


  /* ──────────────────────────────────────────────────────────
     REVEAL AO ROLAR
  ────────────────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(el => observer.observe(el));
  }


  /* ──────────────────────────────────────────────────────────
     PLAYER: detectar ao vivo e montar iframe
  ────────────────────────────────────────────────────────── */

  /**
   * Monta o iframe do YouTube Live (live_stream?channel=ID).
   * O YouTube redireciona automaticamente para o vídeo ao vivo
   * se o canal estiver transmitindo; caso contrário mostra o canal.
   */
  function buildLiveIframe(channelId) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&rel=0&modestbranding=1`;
    iframe.title = 'Transmissão ao Vivo – Igreja de Cristo Orizona';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.loading = 'eager';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.addEventListener('load', () => {
      playerWrap?.classList.add('player-ready');
    });
    return iframe;
  }

  /**
   * Monta o iframe do vídeo de fallback (último culto gravado).
   */
  function buildFallbackIframe(videoId, title) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
    iframe.title = title || 'Último Culto – Igreja de Cristo Orizona';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.addEventListener('load', () => {
      playerWrap?.classList.add('player-ready');
    });
    return iframe;
  }

  /**
   * Constrói o iframe do chat ao vivo do YouTube.
   * Só funciona quando há transmissão ativa.
   */
  function buildChatIframe(channelId) {
    if (!chatFrame) return;
    const origin = encodeURIComponent(window.location.origin || 'https://igrejadecristoorizona.com.br');
    chatFrame.src = `https://www.youtube.com/live_chat?v=live_stream&channel=${channelId}&embed_domain=${window.location.hostname || 'localhost'}`;
    chatFrame.title = 'Chat ao Vivo';
  }

  /**
   * Define a UI para o estado AO VIVO.
   */
  function setLiveState() {
    // Badge
    if (liveBadge)  { liveBadge.className = 'live-badge is-live'; }
    if (badgeDot)   { badgeDot.classList.remove('d-none'); }
    if (badgeText)  { badgeText.textContent = 'Ao Vivo Agora'; }

    // Mostra player, oculta placeholder offline
    if (playerRatio)        playerRatio.style.display = '';
    if (offlinePlaceholder) offlinePlaceholder.classList.remove('visible');

    // Injeta iframe live
    if (playerRatio) {
      playerRatio.innerHTML = '';
      playerRatio.appendChild(buildLiveIframe(CONFIG.channelId));
    }

    // Chat ao vivo
    if (chatFrame && chatPlaceholder) {
      buildChatIframe(CONFIG.channelId);
      chatFrame.classList.add('visible');
      chatPlaceholder.style.display = 'none';
    }
  }

  /**
   * Define a UI para o estado OFFLINE.
   */
  function setOfflineState() {
    // Badge
    if (liveBadge)  { liveBadge.className = 'live-badge is-offline'; }
    if (badgeText)  { badgeText.textContent = 'Sem transmissão no momento'; }

    // Oculta player 16:9, mostra placeholder offline
    if (playerRatio)        playerRatio.style.display = 'none';
    if (offlinePlaceholder) offlinePlaceholder.classList.add('visible');
    if (playerWrap)         playerWrap.classList.add('player-ready'); // remove shimmer

    // Chat: mantém placeholder
  }

  /**
   * Tenta detectar se o canal está ao vivo usando a API pública de oEmbed.
   * Como o YouTube não expõe o status de live sem API Key, usamos uma
   * heurística: fazemos fetch do endpoint de oEmbed para o live_stream.
   * Se retornar dados válidos, consideramos como "potencialmente live"
   * e exibimos o player — o próprio YouTube mostrará ou não a transmissão.
   *
   * Para detecção precisa, substitua pela YouTube Data API v3.
   */
  async function detectAndInit() {
    if (CONFIG.forceOffline) {
      setOfflineState();
      return;
    }

    try {
      // Usa no-cors para evitar bloqueio CORS; só verifica se responde
      const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/channel/${CONFIG.channelId}/live&format=json`;
      const res = await fetch(url, { method: 'GET', mode: 'no-cors' });

      // no-cors retorna type 'opaque' — se não lançar exceção, assumimos live
      setLiveState();
    } catch (_) {
      // Em caso de erro de rede ou CORS total, exibe o player de qualquer forma
      // (o YouTube handle internamente se não há live)
      setLiveState();
    }
  }

  // Inicializa
  detectAndInit();


  /* ──────────────────────────────────────────────────────────
     BOTÃO "ASSISTIR ÚLTIMO CULTO" (estado offline)
  ────────────────────────────────────────────────────────── */
  if (offlineFallbackBtn) {
    offlineFallbackBtn.addEventListener('click', () => {
      // Esconde placeholder, mostra player com vídeo de fallback
      if (offlinePlaceholder) offlinePlaceholder.classList.remove('visible');
      if (playerRatio) {
        playerRatio.style.display = '';
        playerRatio.innerHTML = '';
        playerRatio.appendChild(
          buildFallbackIframe(CONFIG.fallbackVideoId, CONFIG.fallbackTitle)
        );
      }
      // Rola até o player
      playerWrap?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }


  /* ──────────────────────────────────────────────────────────
     CARDS DE SERMÃO  (mesma lógica do script.js principal)
  ────────────────────────────────────────────────────────── */
  const sermonCards = document.querySelectorAll('.sermon-card');

  if (sermonCards.length) {

    function buildSermonEmbed(videoId, title) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
      iframe.title = title || 'Mensagem';
      iframe.loading = 'lazy';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.style.cssText = 'width:100%;height:100%;border:0;';
      return iframe;
    }

    function closeAllCards() {
      sermonCards.forEach(card => {
        card.classList.remove('is-active');
        const video = card.querySelector('.sermon-video');
        const thumb = card.querySelector('.sermon-thumb');
        if (video) { video.innerHTML = ''; video.hidden = true; }
        if (thumb) thumb.style.display = '';
      });
    }

    sermonCards.forEach(card => {
      const playBtn = card.querySelector('.sermon-play');
      const thumb   = card.querySelector('.sermon-thumb');

      function activate(e) {
        e.preventDefault();
        closeAllCards();
        card.classList.add('is-active');

        const videoId = card.dataset.video;
        const title   = card.dataset.title;
        const video   = card.querySelector('.sermon-video');

        if (!videoId || !video || !thumb) return;

        thumb.style.display = 'none';
        video.hidden = false;
        video.appendChild(buildSermonEmbed(videoId, title));
      }

      playBtn?.addEventListener('click', activate);
      thumb?.addEventListener('click', activate);
    });
  }

}); // end DOMContentLoaded
