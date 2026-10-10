// Menus hierárquicos: clique/touch, teclado e fecho ao clicar fora.
(() => {
  const header = document.querySelector('#mz-main-header');
  if (!header) return;
  const nav = header.querySelector('.mz-nav');
  const mobile = header.querySelector('.mz-mobile-toggle');
  const closeBranch = item => {
    item.classList.remove('is-open');
    const button = item.querySelector(':scope > .mz-trigger');
    if (button) button.setAttribute('aria-expanded', 'false');
    item.querySelectorAll('.mz-item.is-open').forEach(child => {
      child.classList.remove('is-open');
      child.querySelector(':scope > .mz-trigger')?.setAttribute('aria-expanded','false');
    });
  };
  header.querySelectorAll('.mz-trigger').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.parentElement;
      const opening = !item.classList.contains('is-open');
      Array.from(item.parentElement.children).forEach(closeBranch);
      if (opening) { item.classList.add('is-open'); button.setAttribute('aria-expanded','true'); }
    });
  });
  mobile.addEventListener('click', () => {
    const expanded = mobile.getAttribute('aria-expanded') === 'true';
    mobile.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('mobile-open', !expanded);
  });
  const closeAll = () => nav.querySelectorAll('.mz-item.is-open').forEach(closeBranch);
  document.addEventListener('click', e => { if (!header.contains(e.target)) closeAll(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeAll(); mobile.focus(); } });
})();
