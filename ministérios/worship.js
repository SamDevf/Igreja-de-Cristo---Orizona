/* ============================================================
   Igreja de Cristo – Orizona, GO
   Arquivo: worship.js — Ministério de Louvor
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────────────────────
     NAVEGAÇÃO: scroll + hamburger
  ────────────────────────────────────────────────────────── */
  const navbar   = document.getElementById('navbar');
  const navLinks = document.getElementById('navLinks');

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
    const revealObs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(el => revealObs.observe(el));
  }


  /* ──────────────────────────────────────────────────────────
     FORMULÁRIO — mostrar/ocultar instrumentos
  ────────────────────────────────────────────────────────── */
  const playInstrumentYes = document.getElementById('instrumentYes');
  const playInstrumentNo  = document.getElementById('instrumentNo');
  const instrumentGroup   = document.getElementById('instrumentGroup');

  function toggleInstruments() {
    if (!instrumentGroup) return;
    const isYes = playInstrumentYes?.checked;
    instrumentGroup.classList.toggle('visible', isYes);
  }

  playInstrumentYes?.addEventListener('change', toggleInstruments);
  playInstrumentNo?.addEventListener('change',  toggleInstruments);


  /* ──────────────────────────────────────────────────────────
     FORMULÁRIO — radio pill visual feedback
     (já funciona via :has no CSS, mas garantimos fallback)
  ────────────────────────────────────────────────────────── */
  function syncPillStates(groupEl) {
    if (!groupEl) return;
    groupEl.querySelectorAll('.radio-pill, .check-pill').forEach(pill => {
      const input = pill.querySelector('input');
      if (!input) return;
      input.addEventListener('change', () => {
        // radio: desmarca irmãos
        if (input.type === 'radio') {
          const siblings = groupEl.querySelectorAll(`input[name="${input.name}"]`);
          siblings.forEach(s => s.closest('.radio-pill')?.classList.remove('selected'));
        }
        pill.classList.toggle('selected', input.checked);
      });
    });
  }

  document.querySelectorAll('.radio-group, .checkbox-group').forEach(g => syncPillStates(g));


  /* ──────────────────────────────────────────────────────────
     FORMULÁRIO — envio
  ────────────────────────────────────────────────────────── */
 (function () {
  const form        = document.getElementById('worshipForm');
  const submitBtn   = document.getElementById('submitBtn');
  const successMsg  = document.getElementById('worshipFormSuccess');
  const errorMsg    = document.getElementById('worshipFormError');

  // Mostrar/ocultar campos de instrumento com base no radio "toca"
  const instrumentGroup = document.getElementById('instrumentGroup');
  document.querySelectorAll('input[name="toca"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      instrumentGroup.style.display = this.value === 'Sim, toco' ? 'block' : 'none';
    });
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault(); // Impede o envio padrão (recarregar página)

    // Validação nativa HTML
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Estado de carregamento
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';
    successMsg.style.display = 'none';
    errorMsg.style.display   = 'none';

    // Coleta os dados do formulário
    const formData = new FormData(form);

    // Agrupa checkboxes com mesmo name manualmente (garante compatibilidade)
    ['instrumento', 'disponibilidade'].forEach(function (fieldName) {
      const checked = [];
      form.querySelectorAll('input[name="' + fieldName + '"]:checked').forEach(function (cb) {
        checked.push(cb.value);
      });
      if (checked.length > 0) {
        formData.set(fieldName, checked.join(', '));
      }
    });

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Sucesso: exibe mensagem e reseta formulário
        form.style.display = 'none';
        successMsg.style.display = 'block';
        form.reset();
        instrumentGroup.style.display = 'none';
      } else {
        throw new Error(data.message || 'Erro desconhecido');
      }
    } catch (err) {
      console.error('Web3Forms error:', err);
      errorMsg.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = '✦ Enviar Inscrição';
    }
  });
})();

  /* ──────────────────────────────────────────────────────────
     GALERIA — lightbox simples
  ────────────────────────────────────────────────────────── */
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (galleryItems.length) {
    // Cria overlay
    const overlay = document.createElement('div');
    overlay.id = 'galleryLightbox';
    overlay.style.cssText = `
      display:none;
      position:fixed;
      inset:0;
      background:rgba(0,0,0,0.92);
      z-index:500;
      align-items:center;
      justify-content:center;
      cursor:zoom-out;
      padding:2rem;
    `;

    const bigImg = document.createElement('img');
    bigImg.style.cssText = `
      max-width:90vw;
      max-height:90vh;
      object-fit:contain;
      border-radius:4px;
      box-shadow:0 0 80px rgba(0,0,0,0.8);
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      position:absolute;
      top:1.5rem;
      right:1.5rem;
      background:rgba(200,169,110,0.15);
      border:1px solid rgba(200,169,110,0.3);
      border-radius:50%;
      width:42px;
      height:42px;
      color:#c8a96e;
      font-size:1rem;
      cursor:pointer;
      display:flex;
      align-items:center;
      justify-content:center;
    `;

    overlay.appendChild(bigImg);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    function openLightbox(src, alt) {
      bigImg.src = src;
      bigImg.alt = alt || '';
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
      bigImg.src = '';
    }

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) openLightbox(img.src, img.alt);
      });
    });

    overlay.addEventListener('click', closeLightbox);
    closeBtn.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

}); // end DOMContentLoaded
