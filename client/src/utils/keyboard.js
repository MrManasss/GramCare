export const handleEnterJump = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    const target = e.target;
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') return;

    // Allow components to suppress jump behavior (e.g., adding tags)
    if (target.dataset.noJump === 'true') return;

    e.preventDefault();
    
    const form = target.closest('.screen');
    if (!form) return;
    
    const focusable = Array.from(
      form.querySelectorAll('input:not([disabled]):not([data-no-jump="true"]), textarea:not([disabled]), button.btn-primary:not([disabled])')
    );
    
    const index = focusable.indexOf(target);
    if (index > -1 && index < focusable.length - 1) {
      focusable[index + 1].focus();
    } else if (index === focusable.length - 1 && target.classList.contains('btn-primary')) {
      target.click();
    }
  }
};
