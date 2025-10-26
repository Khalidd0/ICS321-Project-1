/* =========================================================================
   Horse Racing DB — UI wiring (compat-safe JS)
   - Normalizes date/time for SQL
   - Robust Add Results: stage multiple entries, then POST each
   - Works with Express-served UI (same origin)
   ========================================================================*/

// ---------- Helpers: normalize browser date/time ----------
function toSqlTime(raw){
  if(!raw) return '';
  raw = String(raw).trim();
  // 06:18 PM -> 18:18
  var m = raw.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (m){
    var hh = parseInt(m[1],10), mm = m[2], ap = m[3].toUpperCase();
    if (ap === 'PM' && hh !== 12) hh += 12;
    if (ap === 'AM' && hh === 12) hh = 0;
    return (hh<10?'0':'') + hh + ':' + mm;   // HH:MM (no seconds)
  }
  // 18:18:00 -> 18:18
  var m2 = raw.match(/^(\d{1,2}:\d{2})(?::\d{2})$/);
  if (m2) return m2[1];
  // 18:18 -> 18:18
  if (/^\d{1,2}:\d{2}$/.test(raw)) return raw;
  return raw; // as-is
}
function toSqlDate(raw){
  if(!raw) return '';
  raw = String(raw).trim();
  // 10/26/2025 -> 2025-10-26 (no leading zeros required by MySQL, both OK)
  var m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m){
    var mm = parseInt(m[1],10), dd = parseInt(m[2],10), yy = m[3];
    return yy + '-' + mm + '-' + dd; // YYYY-M-D
  }
  return raw; // already YYYY-M-D or YYYY-MM-DD
}

// ---------- Nav highlight ----------
document.addEventListener('DOMContentLoaded', function () {
  try {
    var path = location.pathname.split('/').pop();
    var links = document.querySelectorAll('.nav-links a');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('href') === path) {
        links[i].classList.add('active');
      }
    }
  } catch (e) {}
});

// ---------- Demo submit state for non-wired forms ----------
document.addEventListener('DOMContentLoaded', function () {
  var forms = document.querySelectorAll('form');
  for (var i = 0; i < forms.length; i++) {
    forms[i].addEventListener('submit', function (e) {
      if (!this.getAttribute('data-wire')) {
        e.preventDefault();
        var btn = this.querySelector('button[type="submit"]');
        if (btn) {
          btn.disabled = true;
          btn.textContent = 'Submitted';
          setTimeout(function () { btn.disabled = false; btn.textContent = 'Submit'; }, 1200);
        }
      }
    });
  }
});

// ---------- Login (index.html) ----------
document.addEventListener('DOMContentLoaded', function () {
  var loginForm = document.getElementById('loginForm');
  if (!loginForm) return;
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var usernameEl = document.getElementById('username');
    var passwordEl = document.getElementById('password');
    var errorEl = document.getElementById('loginError');
    var username = (usernameEl && usernameEl.value ? usernameEl.value : '').toLowerCase().trim();
    var password = (passwordEl && passwordEl.value ? passwordEl.value : '');
    if (username === 'admin' && password === '12345') {
      window.location.href = 'admin_dashboard.html';
    } else if (username === 'user' && password === '1234') {
      window.location.href = 'guest_dashboard.html';
    } else {
      if (errorEl) errorEl.textContent = 'Invalid credentials. Try admin/12345 or user/1234.';
    }
  });
});

// ---------- API base & fetch helper ----------
var API_BASE = (typeof window !== 'undefined' && window.API_BASE_OVERRIDE !== undefined)
  ? window.API_BASE_OVERRIDE
  : '/api'; // same-origin

function apiFetch(path, options) {
  options = options || {};
  var headers = { 'Content-Type': 'application/json' };
  if (options.headers) {
    for (var k in options.headers) {
      if (Object.prototype.hasOwnProperty.call(options.headers, k)) {
        headers[k] = options.headers[k];
      }
    }
  }
  var fetchOpts = {
    method: options.method || 'GET',
    headers: headers
  };
  if (options.body) fetchOpts.body = options.body;

  return fetch(API_BASE + path, fetchOpts).then(function (res) {
    return res.json().catch(function () { return {}; }).then(function (data) {
      if (!res.ok || data.success === false) {
        var msg = data && data.message ? data.message : res.statusText || 'Request failed';
        throw new Error(msg);
      }
      return data;
    });
  });
}

/* ========================================================================
   GUEST pages
   ===================================================================== */
document.addEventListener('DOMContentLoaded', function () {
  // browse_horses.html
  var ownerForm = document.getElementById('browse-owner-form');
  if (ownerForm) {
    ownerForm.setAttribute('data-wire', '1');
    ownerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var lnameEl = ownerForm.querySelector('input[name="ownerLastName"]');
      var lname = lnameEl && lnameEl.value ? lnameEl.value.trim() : '';
      var tbody = document.getElementById('owner-results-body');
      if (!lname) { alert('Please enter an owner last name'); return; }
      if (tbody) tbody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
      apiFetch('/guest/owner/' + encodeURIComponent(lname) + '/horses')
        .then(function (data) {
          var rows = (data && data.horses) ? data.horses : [];
          if (!tbody) return;
          if (rows.length === 0) { tbody.innerHTML = '<tr><td colspan="3">No results</td></tr>'; return; }
          var html = '';
          for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            var horse = r.horseName || r.horse || '';
            var age = (r.age !== undefined && r.age !== null) ? r.age : '';
            var trainer = r.trainer || r.trainerName || '';
            html += '<tr><td>' + horse + '</td><td>' + age + '</td><td>' + trainer + '</td></tr>';
          }
          tbody.innerHTML = html;
        })
        .catch(function (err) {
          if (tbody) tbody.innerHTML = '<tr><td colspan="3">Error: ' + err.message + '</td></tr>';
        });
    });
  }

  // winning_trainers.html
  var winnersBody = document.getElementById('winners-body');
  if (winnersBody) {
    winnersBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    apiFetch('/guest/trainers/winners')
      .then(function (data) {
        var rows = (data && (data.trainers || data.results)) ? (data.trainers || data.results) : [];
        if (rows.length === 0) { winnersBody.innerHTML = '<tr><td colspan="4">No results</td></tr>'; return; }
        var html = '';
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          html += '<tr><td>' + (r.trainer || r.trainerName || '') +
                  '</td><td>' + (r.horse || r.horseName || '') +
                  '</td><td>' + (r.race || r.raceName || '') +
                  '</td><td>' + (r.result || '') + '</td></tr>';
        }
        winnersBody.innerHTML = html;
      })
      .catch(function (err) {
        winnersBody.innerHTML = '<tr><td colspan="4">Error: ' + err.message + '</td></tr>';
      });
  }

  // trainer_winnings.html
  var winningsBody = document.getElementById('winnings-body');
  if (winningsBody) {
    winningsBody.innerHTML = '<tr><td colspan="2">Loading...</td></tr>';
    apiFetch('/guest/trainers/winnings')
      .then(function (data) {
        var rows = (data && data.trainers) ? data.trainers : [];
        rows.sort(function (a, b) {
          var ta = (a.totalPrize != null) ? a.totalPrize : (a.total != null ? a.total : 0);
          var tb = (b.totalPrize != null) ? b.totalPrize : (b.total != null ? b.total : 0);
          return tb - ta;
        });
        if (rows.length === 0) { winningsBody.innerHTML = '<tr><td colspan="2">No results</td></tr>'; return; }
        var html = '';
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          var trainerName = r.trainer || r.trainerName || '';
          var total = (r.totalPrize != null) ? r.totalPrize : (r.total != null ? r.total : 0);
          html += '<tr><td>' + trainerName + '</td><td>' + Number(total).toLocaleString() + '</td></tr>';
        }
        winningsBody.innerHTML = html;
      })
      .catch(function (err) {
        winningsBody.innerHTML = '<tr><td colspan="2">Error: ' + err.message + '</td></tr>';
      });
  }

  // track_summary.html
  var trackBody = document.getElementById('tracks-body');
  if (trackBody) {
    trackBody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
    apiFetch('/guest/tracks/stats')
      .then(function (data) {
        var rows = (data && (data.tracks || data.stats)) ? (data.tracks || data.stats) : [];
        if (rows.length === 0) { trackBody.innerHTML = '<tr><td colspan="3">No results</td></tr>'; return; }
        var html = '';
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          var track = r.trackName || '';
          var races = (r.raceCount != null) ? r.raceCount : (r.races != null ? r.races : '');
          var horses = (r.totalHorses != null) ? r.totalHorses : (r.horses != null ? r.horses : '');
          html += '<tr><td>' + track + '</td><td>' + races + '</td><td>' + horses + '</td></tr>';
        }
        trackBody.innerHTML = html;
      })
      .catch(function (err) {
        trackBody.innerHTML = '<tr><td colspan="3">Error: ' + err.message + '</td></tr>';
      });
  }
});

/* ========================================================================
   ADMIN pages
   ===================================================================== */
// ---------- Add Race ----------
document.addEventListener('DOMContentLoaded', function () {
  var raceForm = document.getElementById('race-form');
  if (!raceForm) return;

  raceForm.setAttribute('data-wire', '1');
  raceForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var payload = {
      raceId:    (raceForm.querySelector('[name="raceId"]')   || {}).value || '',
      raceName:  (raceForm.querySelector('[name="raceName"]') || {}).value || '',
      trackName: (raceForm.querySelector('[name="trackName"]')|| {}).value || '',
      raceDate:  toSqlDate((raceForm.querySelector('[name="raceDate"]') || {}).value || ''),
      raceTime:  toSqlTime((raceForm.querySelector('[name="raceTime"]') || {}).value || '')
    };
    apiFetch('/admin/race', { method: 'POST', body: JSON.stringify(payload) })
      .then(function () { alert('Race saved! Now add results below.'); })
      .catch(function (err) { alert('Failed to save race: ' + err.message); });
  });
});

// ---------- Add Results (staging + submit) ----------
document.addEventListener('DOMContentLoaded', function () {
  // Try to find a results form and useful elements
  var raceIdInputTop = document.querySelector('[name="raceId"]'); // top Race Details
  var resultForm = document.getElementById('race-result-form') ||
                   document.querySelector('form#result-form') ||
                   document.querySelector('form[data-results]');
  var addBtn = document.getElementById('add-result-btn') ||
               (resultForm ? resultForm.querySelector('button[data-add]') : null);
  var submitBtn = document.getElementById('submit-results-btn') ||
                  document.querySelector('button#submit-results') ||
                  document.querySelector('button[data-submit-results]');
  var tableBody = document.getElementById('results-staged-body') ||
                  document.getElementById('results-body');

  if (!resultForm) return; // page doesn't have results form

  var staged = [];

  var horseIdInput = resultForm.querySelector('[name="horseId"]');
  var resultInput  = resultForm.querySelector('[name="result"]');
  var prizeInput   = resultForm.querySelector('[name="prize"]');
  var raceIdInput  = resultForm.querySelector('[name="raceId"]'); // sometimes present in results block

  function renderTable() {
    if (!tableBody) return;
    if (staged.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="3">No results staged</td></tr>';
      return;
    }
    var html = '';
    for (var i = 0; i < staged.length; i++) {
      var r = staged[i];
      html += '<tr data-idx="'+i+'"><td>'+r.horseId+'</td><td>'+r.result+'</td><td>'+Number(r.prize).toLocaleString()+'</td></tr>';
    }
    tableBody.innerHTML = html;
  }
  renderTable();

  function addStaged() {
    var horseId = (horseIdInput && horseIdInput.value || '').trim();
    var resVal  = (resultInput  && resultInput.value  || '').trim();
    var prize   = Number((prizeInput && prizeInput.value) || 0);

    if (!horseId || !resVal) { alert('Horse ID and Result are required'); return; }
    if (!prize || prize < 0) { alert('Prize must be a positive number'); return; }

    staged.push({ horseId: horseId, result: resVal, prize: prize });
    renderTable();

    if (horseIdInput) horseIdInput.value = '';
    if (resultInput)  resultInput.value  = '';
    if (prizeInput)   prizeInput.value   = '';
  }

  // Wire the Add button or fall back to form submit to stage
  if (addBtn) {
    addBtn.addEventListener('click', function (e) { e.preventDefault(); addStaged(); });
  } else {
    resultForm.addEventListener('submit', function (e) { e.preventDefault(); addStaged(); });
  }

  async function submitAll() {
    // Get raceId from results block or top Race Details
    var raceId = (raceIdInput && raceIdInput.value) ? raceIdInput.value.trim()
               : (raceIdInputTop && raceIdInputTop.value) ? raceIdInputTop.value.trim()
               : '';

    if (!raceId) { alert('Race ID is missing. Please fill it in the Race Details section.'); return; }
    if (staged.length === 0) { alert('Nothing to submit. Add at least one result.'); return; }

    var ok = 0, fail = 0, messages = [];
    for (var i = 0; i < staged.length; i++) {
      var row = staged[i];
      try {
        await apiFetch('/admin/race/result', {
          method: 'POST',
          body: JSON.stringify({
            raceId: raceId,
            horseId: row.horseId,
            result: row.result,
            prize: row.prize
          })
        });
        ok++;
      } catch (e) {
        fail++;
        messages.push(row.horseId + ': ' + (e && e.message ? e.message : 'failed'));
      }
    }

    if (fail === 0) {
      alert('All results saved ✔ (' + ok + ')');
      staged = [];
      renderTable();
    } else {
      alert('Saved ' + ok + ' result(s), ' + fail + ' failed:\n' + messages.join('\n'));
    }
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', function (e) { e.preventDefault(); submitAll(); });
  } else {
    // Fallback: any button labeled "Submit"
    var submitLike = Array.prototype.slice.call(document.querySelectorAll('button'))
      .filter(function (b) { return /submit/i.test(b.textContent || ''); })[0];
    if (submitLike) {
      submitLike.addEventListener('click', function (e) { e.preventDefault(); submitAll(); });
    }
  }
});

// ---------- Delete Owner ----------
document.addEventListener('DOMContentLoaded', function () {
  var delForm = document.getElementById('delete-owner-form');
  if (!delForm) return;
  delForm.setAttribute('data-wire', '1');
  delForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var ownerId = (delForm.querySelector('[name="ownerId"]') || {}).value || '';
    if (!ownerId) { alert('Enter an Owner ID'); return; }
    apiFetch('/admin/owner/' + encodeURIComponent(ownerId), { method: 'DELETE' })
      .then(function () { alert('Owner deleted via stored procedure.'); })
      .catch(function (err) { alert('Delete failed: ' + err.message); });
  });
});

// ---------- Move Horse ----------
// ---------- Move Horse (auto-fill current stable) ----------
document.addEventListener('DOMContentLoaded', function () {
  var moveForm = document.getElementById('move-horse-form');
  if (!moveForm) return;

  moveForm.setAttribute('data-wire', '1');

  var horseIdInput  = moveForm.querySelector('[name="horseId"]');
  var fromStableInp = moveForm.querySelector('[name="fromStableId"]'); // read-only display field
  var toStableInp   = moveForm.querySelector('[name="toStableId"]');

  // When horseId changes, fetch current stable and show it
  async function refreshFromStable() {
    var horseId = (horseIdInput && horseIdInput.value || '').trim();
    if (!horseId) { if (fromStableInp) fromStableInp.value = ''; return; }
    try {
      const data = await apiFetch('/admin/horse/' + encodeURIComponent(horseId), { method: 'GET' });
      if (data && data.success && data.horse && fromStableInp) {
        fromStableInp.value = data.horse.stableId || '';
      }
    } catch (e) {
      if (fromStableInp) fromStableInp.value = ''; // clear if not found
    }
  }

  if (horseIdInput) {
    horseIdInput.addEventListener('change', refreshFromStable);
    horseIdInput.addEventListener('blur', refreshFromStable);
    // Try once on page load (in case horseId is prefilled)
    refreshFromStable();
  }

  moveForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var horseId = (horseIdInput  && horseIdInput.value  || '').trim();
    var toStableId = (toStableInp && toStableInp.value   || '').trim();
    if (!horseId || !toStableId) { alert('Horse ID and destination stable are required'); return; }

    apiFetch('/admin/horse/' + encodeURIComponent(horseId) + '/stable', {
      method: 'PUT',
      body: JSON.stringify({ newStableId: toStableId }) // controller accepts newStableId or toStableId
    })
      .then(function () { alert('Horse moved!'); refreshFromStable(); })
      .catch(function (err) { alert('Move failed: ' + err.message); });
  });
});


// ---------- Approve Trainer ----------
document.addEventListener('DOMContentLoaded', function () {
  var apprForm = document.getElementById('approve-trainer-form');
  if (!apprForm) return;
  apprForm.setAttribute('data-wire', '1');
  apprForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var payload = {
      trainerId: (apprForm.querySelector('[name="trainerId"]') || {}).value || '',
      // If your page has fname/lname fields, they’ll be used; otherwise controller defaults will apply.
      fname:     (apprForm.querySelector('[name="fname"]')     || {}).value || '',
      lname:     (apprForm.querySelector('[name="lname"]')     || {}).value || '',
      stableId:  (apprForm.querySelector('[name="stableId"]')  || {}).value || '',
      status:    (apprForm.querySelector('[name="status"]')    || {}).value || 'Approved'
    };
    if (!payload.trainerId || !payload.stableId) { alert('trainerId and stableId are required'); return; }
    apiFetch('/admin/trainer', { method: 'POST', body: JSON.stringify(payload) })
      .then(function () { alert('Trainer status updated!'); })
      .catch(function (err) { alert('Update failed: ' + err.message); });
  });
});
