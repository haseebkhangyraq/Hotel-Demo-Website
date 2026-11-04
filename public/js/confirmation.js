/* =========================================================
   GRAND AURELIA — CONFIRMATION
   ========================================================= */
(function () {
  'use strict';

  const printButton = document.getElementById('printConfirmation');

  if (printButton) {
    printButton.addEventListener('click', function () {
      window.print();
    });
  }

  // Keep the printed summary honest: refresh any relative dates on restore.
  window.addEventListener('pageshow', function () {
    if (window.Aurelia && typeof window.Aurelia.refreshIcons === 'function') {
      window.Aurelia.refreshIcons();
    }
  });
})();
