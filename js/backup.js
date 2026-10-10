(function () {
  const KEYS = [
    'true-strength-programme-state-v1',
    'true-strength-protein-v1',
    'true-strength-saved-meals-v1',
    'true-strength-weight-v1',
  ];

  const backupBtn = document.getElementById('backup-all-btn');
  const restoreBtn = document.getElementById('restore-all-btn');
  const restoreInput = document.getElementById('restore-all-input');

  if (!backupBtn || !restoreBtn || !restoreInput) return;

  function todayStamp() {
    return new Date().toISOString().slice(0, 10);
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  backupBtn.addEventListener('click', () => {
    const payload = {};
    KEYS.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw == null) return;
      try {
        payload[key] = JSON.parse(raw);
      } catch (e) {
        // Skip anything that isn't valid JSON rather than corrupt the backup.
      }
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `true-strength-full-backup-${todayStamp()}.json`);
  });

  restoreBtn.addEventListener('click', () => restoreInput.click());

  restoreInput.addEventListener('change', () => {
    const file = restoreInput.files[0];
    restoreInput.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(reader.result);
      } catch (e) {
        alert('That file is not valid JSON - restore cancelled.');
        return;
      }
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        alert("That file doesn't look like a True Strength AI backup - restore cancelled.");
        return;
      }

      const foundKeys = KEYS.filter((key) => key in parsed);
      if (foundKeys.length === 0) {
        alert("That file doesn't contain any True Strength AI data - restore cancelled.");
        return;
      }

      if (
        !confirm(
          `This will replace your current data for: ${foundKeys.length} saved area(s) (programme, nutrition, and/or weight). This cannot be undone. Continue?`
        )
      ) {
        return;
      }

      foundKeys.forEach((key) => {
        try {
          localStorage.setItem(key, JSON.stringify(parsed[key]));
        } catch (e) {
          // Storage full or disabled - that one key won't restore.
        }
      });

      alert('Restored. The page will now reload to show your restored data.');
      location.reload();
    };
    reader.readAsText(file);
  });
})();
