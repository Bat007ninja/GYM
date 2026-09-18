(function () {
  const buttons = document.querySelectorAll('.tab-btn');
  const sections = {
    calculator: document.getElementById('page-calculator'),
    programme: document.getElementById('page-programme'),
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.page;

      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        if (active) {
          b.setAttribute('aria-current', 'page');
        } else {
          b.removeAttribute('aria-current');
        }
      });

      Object.entries(sections).forEach(([key, el]) => {
        if (el) el.hidden = key !== target;
      });
    });
  });
})();
