// Show/hide a loading skeleton inside a container element
export function showLoading(container, lines = 4) {
  container.innerHTML = `<div class="loading-block">
    ${Array.from({ length: lines }, () => '<div class="skeleton"></div>').join('')}
  </div>`;
}

// Show an error message inside a container
export function showError(container, message) {
  container.innerHTML = `<div class="error-msg">${message}</div>`;
}

// Switch active tab; hide/show panes
export function activateTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.dataset.pane === tabId));
}

// Show the study panel active state and switch to a tab
export function showStudyPanel(verseRefLabel) {
  document.getElementById('studyEmpty').style.display  = 'none';
  document.getElementById('studyActive').style.display = 'flex';
  const ref = document.getElementById('studyVerseRef');
  if (ref) ref.textContent = verseRefLabel;
  activateTab('footnotes');
}

// Wire up tab buttons — call once on init
export function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));
  });
}
