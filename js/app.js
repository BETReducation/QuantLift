/* ── State ── */
var currentPage  = 'auth';
var timerInterval = null;
var timerRunning  = false;
var timerSeconds  = 0;
var totalVolume   = 0;
var restSeconds   = 150;
var restInterval  = null;
var waterFilled   = 5;

/* User state */
var userState = { mode: 'none' }; // 'none' | 'guest' | 'member'

/* Onboarding state */
var onbCurrentStep = 1;
var onbData = {
  name: '', email: '', password: '',
  age: '', sex: 'male', weight: '', height: '',
  experience: 'beginner',
  goal: 'hypertrophy', daysPerWeek: 4, sessionLen: '60-75', equipment: 'full'
};
var ciData = { days: 4, energy: 3 };

var exercises = [
  { name:'Barbell Squat',  type:'Strength',    sets:[{kg:100,reps:6,rpe:8,done:true},{kg:100,reps:6,rpe:8,done:true},{kg:100,reps:6,rpe:7,done:false},{kg:100,reps:6,rpe:'',done:false}] },
  { name:'Bench Press',    type:'Hypertrophy', sets:[{kg:80,reps:6,rpe:7,done:true},{kg:80,reps:6,rpe:8,done:false},{kg:80,reps:6,rpe:'',done:false},{kg:80,reps:6,rpe:'',done:false}] },
  { name:'Deadlift',       type:'Strength',    sets:[{kg:130,reps:5,rpe:'',done:false},{kg:130,reps:5,rpe:'',done:false},{kg:130,reps:5,rpe:'',done:false}] }
];

/* ══════════════════════════════════════════ */
/*  Onboarding                               */
/* ══════════════════════════════════════════ */
function showOnboarding() {
  closeSheet('loginSheet');
  onbCurrentStep = 1;
  document.querySelectorAll('.onb-step').forEach(s => s.classList.remove('active'));
  document.getElementById('onb-1').classList.add('active');
  updateOnbDots();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-onboarding').classList.add('active');
  document.getElementById('onbBack').style.opacity = '0';
  document.getElementById('onbBack').style.pointerEvents = 'none';
  window.scrollTo(0, 0);
}

function onbNext() {
  if (!onbValidate(onbCurrentStep)) return;
  onbCollect(onbCurrentStep);

  if (onbCurrentStep < 3) {
    document.getElementById('onb-' + onbCurrentStep).classList.remove('active');
    onbCurrentStep++;
    document.getElementById('onb-' + onbCurrentStep).classList.add('active');
    updateOnbDots();
    document.getElementById('onbBack').style.opacity = '1';
    document.getElementById('onbBack').style.pointerEvents = 'auto';
    window.scrollTo(0, 0);
  }
}

function onbGoBack() {
  if (onbCurrentStep <= 1) {
    document.getElementById('page-onboarding').classList.remove('active');
    document.getElementById('page-auth').classList.add('active');
    return;
  }
  document.getElementById('onb-' + onbCurrentStep).classList.remove('active');
  onbCurrentStep--;
  document.getElementById('onb-' + onbCurrentStep).classList.add('active');
  updateOnbDots();
  if (onbCurrentStep === 1) {
    document.getElementById('onbBack').style.opacity = '0';
    document.getElementById('onbBack').style.pointerEvents = 'none';
  }
  window.scrollTo(0, 0);
}

function updateOnbDots() {
  document.getElementById('onbStepLabel').textContent = 'Step ' + onbCurrentStep + ' of 3';
  [1, 2, 3].forEach(n => {
    var dot = document.getElementById('dot-' + n);
    dot.classList.remove('active', 'done');
    if (n < onbCurrentStep)  dot.classList.add('done');
    if (n === onbCurrentStep) dot.classList.add('active');
  });
}

function onbValidate(step) {
  if (step === 1) {
    var name  = document.getElementById('onbName').value.trim();
    var email = document.getElementById('onbEmail').value.trim();
    var pass  = document.getElementById('onbPass').value;
    var pass2 = document.getElementById('onbPass2').value;
    if (!name)              { alert('Please enter your name.');          return false; }
    if (!email || !email.includes('@')) { alert('Please enter a valid email.'); return false; }
    if (pass.length < 8)   { alert('Password must be at least 8 characters.'); return false; }
    if (pass !== pass2)    { alert('Passwords do not match.');           return false; }
  }
  if (step === 2) {
    var age    = document.getElementById('onbAge').value;
    var weight = document.getElementById('onbWeight').value;
    var height = document.getElementById('onbHeight').value;
    if (!age || +age < 13 || +age > 99)           { alert('Please enter a valid age.');    return false; }
    if (!weight || +weight < 30 || +weight > 300) { alert('Please enter your weight.');    return false; }
    if (!height || +height < 100 || +height > 250){ alert('Please enter your height.');    return false; }
  }
  return true;
}

function onbCollect(step) {
  if (step === 1) {
    onbData.name     = document.getElementById('onbName').value.trim();
    onbData.email    = document.getElementById('onbEmail').value.trim();
    onbData.password = document.getElementById('onbPass').value;
  }
  if (step === 2) {
    onbData.age    = +document.getElementById('onbAge').value;
    onbData.sex    = document.getElementById('onbSex').value;
    onbData.weight = +document.getElementById('onbWeight').value;
    onbData.height = +document.getElementById('onbHeight').value;
  }
  if (step === 3) {
    onbData.daysPerWeek = ciData.days || 4;
    onbData.sessionLen  = document.getElementById('onbSessionLen').value;
  }
}

function completeOnboarding() {
  if (!onbValidate(3)) return;
  onbCollect(3);

  var first = onbData.name.split(' ')[0];
  var initials = onbData.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  document.getElementById('profileName').textContent   = onbData.name;
  document.getElementById('profileAvatar').textContent = initials;
  document.getElementById('pName').textContent         = onbData.name;
  document.getElementById('pAge').textContent          = onbData.age;
  document.getElementById('pWeight').textContent       = onbData.weight + 'kg';
  document.getElementById('pHeight').textContent       = onbData.height + 'cm';
  document.getElementById('pDays').textContent         = onbData.daysPerWeek;
  document.getElementById('pSessionLen').textContent   = onbData.sessionLen.replace('-', '–') + ' min';

  var goalLabels = {
    hypertrophy: 'Hypertrophy', strength: 'Strength', fat_loss: 'Fat loss',
    endurance: 'Endurance', fitness: 'General fitness', athletic: 'Athletic performance'
  };
  document.getElementById('pGoal').textContent = goalLabels[onbData.goal] || 'Hypertrophy';

  var equipLabels = { full: 'Full gym', home: 'Home gym', dumbbells: 'Dumbbells', bodyweight: 'Bodyweight' };
  document.getElementById('pEquip').textContent = equipLabels[onbData.equipment] || 'Full gym';

  saveSession('member', onbData.name, onbData);
  enterMember(onbData.name, true);
}

/* Onboarding selection helpers */
function onbSelectExp(el) {
  el.closest('.type-grid').querySelectorAll('.type-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  onbData.experience = el.dataset.onbExp;
}
function onbSelectGoal(el) {
  el.closest('.type-grid').querySelectorAll('.type-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  onbData.goal = el.dataset.onbGoal;
}
function onbSelectEquip(el) {
  el.closest('.type-grid').querySelectorAll('.type-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  onbData.equipment = el.dataset.onbEquip;
}
function onbSelectDays(el, days) {
  el.closest('.day-picker').querySelectorAll('.day-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  onbData.daysPerWeek = days;
}

/* ══════════════════════════════════════════ */
/*  Auth / Entry                             */
/* ══════════════════════════════════════════ */
function doLogin() {
  var email = document.getElementById('loginEmail').value.trim();
  var pass  = document.getElementById('loginPass').value;
  if (!email || !pass) { alert('Please enter your email and password.'); return; }
  closeSheet('loginSheet');
  enterMember('Alex Johnson');
}

function saveSession(mode, name, data) {
  try {
    localStorage.setItem('ql_session', JSON.stringify({ mode, name, data, ts: Date.now() }));
  } catch(e) {}
}

function clearSession() {
  try { localStorage.removeItem('ql_session'); } catch(e) {}
}

function restoreSession() {
  try {
    var raw = localStorage.getItem('ql_session');
    if (!raw) return false;
    var s = JSON.parse(raw);
    if (!s || !s.mode) return false;
    if (s.mode === 'guest') {
      enterGuest(); return true;
    }
    if (s.mode === 'member' && s.name) {
      if (s.data) {
        onbData = Object.assign(onbData, s.data);
        var initials = s.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
        document.getElementById('profileAvatar').textContent = initials;
        document.getElementById('profileName').textContent   = s.name;
        document.getElementById('pName').textContent         = s.name;
        if (s.data.age)        document.getElementById('pAge').textContent        = s.data.age;
        if (s.data.weight)     document.getElementById('pWeight').textContent     = s.data.weight + 'kg';
        if (s.data.height)     document.getElementById('pHeight').textContent     = s.data.height + 'cm';
        if (s.data.daysPerWeek)document.getElementById('pDays').textContent       = s.data.daysPerWeek;
        if (s.data.sessionLen) document.getElementById('pSessionLen').textContent = s.data.sessionLen.replace('-','–') + ' min';
        var goalLabels = { hypertrophy:'Hypertrophy', strength:'Strength', fat_loss:'Fat loss', endurance:'Endurance', fitness:'General fitness', athletic:'Athletic performance' };
        if (s.data.goal)       document.getElementById('pGoal').textContent       = goalLabels[s.data.goal] || 'Hypertrophy';
        var equipLabels = { full:'Full gym', home:'Home gym', dumbbells:'Dumbbells', bodyweight:'Bodyweight' };
        if (s.data.equipment)  document.getElementById('pEquip').textContent      = equipLabels[s.data.equipment] || 'Full gym';
      }
      enterMember(s.name, true); return true;
    }
  } catch(e) {}
  return false;
}

function enterGuest() {
  userState.mode = 'guest';
  saveSession('guest', null, null);
  document.body.classList.add('guest-mode');
  document.getElementById('page-auth').classList.remove('active');
  document.getElementById('bottomNav').style.display = 'flex';
  document.getElementById('guestRibbon').style.display = 'flex';
  document.getElementById('guestBadge').style.display = 'block';
  document.getElementById('guestTrackNotice').style.display = 'flex';
  document.getElementById('guestAnalyticsBanner').style.display = 'flex';
  document.getElementById('guestProfileContent').style.display = 'block';
  document.getElementById('memberProfileContent').style.display = 'none';
  document.getElementById('sugHeader').textContent = 'Sample insights — sign up to personalise';
  navTo('home');
  setTimeout(() => showNotif('👋', 'Welcome to QuantLift!', 'You\'re browsing as a guest. Sign up to save your progress.'), 600);
}

function enterMember(name, skipCheckin) {
  userState.mode = 'member';
  if (!skipCheckin) saveSession('member', name, onbData);
  document.body.classList.remove('guest-mode');
  var first = name.split(' ')[0];
  document.getElementById('page-auth').classList.remove('active');
  document.getElementById('page-onboarding').classList.remove('active');
  document.getElementById('bottomNav').style.display = 'flex';
  document.getElementById('guestRibbon').style.display = 'none';
  document.getElementById('guestBadge').style.display = 'none';
  document.getElementById('guestTrackNotice').style.display = 'none';
  document.getElementById('guestAnalyticsBanner').style.display = 'none';
  document.getElementById('guestProfileContent').style.display = 'none';
  document.getElementById('memberProfileContent').style.display = 'block';
  document.getElementById('homeGreet').textContent = greeting() + ', ' + first + ' 👋';
  document.getElementById('sugHeader').textContent = 'Personalised for this week';
  navTo('home');
  setTimeout(() => showNotif('🏋️', 'Ready to train, ' + first + '?', 'Your Strength A session is planned for today.'), 800);
  if (!skipCheckin) setTimeout(() => checkWeeklyCheckin(), 2000);
}

function greeting() {
  var h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function logOut() {
  if (!confirm('Log out of QuantLift?')) return;
  clearSession();
  userState.mode = 'none';
  document.body.classList.remove('guest-mode');
  chartsRendered = false;
  macroRendered  = false;
  document.getElementById('bottomNav').style.display = 'none';
  document.getElementById('guestRibbon').style.display = 'none';
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-auth').classList.add('active');
  currentPage = 'auth';
}

function saveProfile() {
  showNotif('✅', 'Profile saved', 'Your changes have been updated.');
}

/* ══════════════════════════════════════════ */
/*  Access control                           */
/* ══════════════════════════════════════════ */
function requireMember(msg) {
  if (userState.mode === 'member') return true;
  document.getElementById('memberPromptMsg').textContent = msg || 'Create a free account to unlock this feature and save your progress.';
  openSheet('memberPromptSheet');
  return false;
}

/* Use in onclick: opens sheet if member, shows prompt if not */
function guardedAction(feature, sheetId) {
  var msgs = {
    plan:      'Sign up to customise your training plan, set goals, and track your programme.',
    nutrition: 'Sign up to log your meals and track macros across training days.',
    session:   'Sign up to save this session and build your analytics history.'
  };
  if (requireMember(msgs[feature] || null)) {
    openSheet(sheetId);
  }
}

function guardedNotif(icon, title, msg) {
  if (requireMember()) {
    showNotif(icon, title, msg);
  }
}

function endSessionAction() {
  if (userState.mode === 'guest') {
    openSheet('memberPromptSheet');
    document.getElementById('memberPromptMsg').textContent = 'Sign up to save your sessions and see your progress build over time.';
  } else {
    confirmEndSession();
  }
}

/* ══════════════════════════════════════════ */
/*  Navigation                               */
/* ══════════════════════════════════════════ */
function navTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  var navEl = document.getElementById('nav-' + page);
  if (navEl) navEl.classList.add('active');
  currentPage = page;
  if (page === 'analytics') setTimeout(renderCharts,    100);
  if (page === 'nutrition') setTimeout(renderMacroChart, 100);
  if (page === 'track')     renderExercises();
  if (page === 'plan')      renderPlanPage();
  window.scrollTo(0, 0);
}

/* ══════════════════════════════════════════ */
/*  Notifications                            */
/* ══════════════════════════════════════════ */
function showNotif(icon, title, msg) {
  document.querySelector('.notif-icon').textContent = icon;
  document.getElementById('notifTitle').textContent = title;
  document.getElementById('notifMsg').textContent   = msg;
  var b = document.getElementById('notifBanner');
  b.classList.add('show');
  setTimeout(() => b.classList.remove('show'), 4000);
}
function hideNotif() { document.getElementById('notifBanner').classList.remove('show'); }

/* ══════════════════════════════════════════ */
/*  Weekly check-in                          */
/* ══════════════════════════════════════════ */
function checkWeeklyCheckin() {
  if (userState.mode !== 'member') return;
  try {
    var stored = localStorage.getItem('ql_checkin');
    if (stored) {
      var data = JSON.parse(stored);
      var daysSince = (Date.now() - new Date(data.date).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }
    /* Pre-fill weight from profile if available */
    var w = onbData.weight || '';
    if (w) document.getElementById('ciWeight').value = w;
    openSheet('checkinSheet');
  } catch (e) {
    openSheet('checkinSheet');
  }
}

function ciSelectDays(el, days) {
  el.closest('.day-picker').querySelectorAll('.day-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  ciData.days = days;
}

function ciSelectEnergy(el, level) {
  document.querySelectorAll('#energyPicker .energy-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  ciData.energy = level;
}

function submitCheckin() {
  var weight = document.getElementById('ciWeight').value;
  var notes  = document.getElementById('ciNotes').value;

  if (weight && onbData.weight !== undefined) {
    onbData.weight = +weight;
    document.getElementById('pWeight').textContent = weight + 'kg';
  }

  try {
    localStorage.setItem('ql_checkin', JSON.stringify({
      date:    new Date().toISOString().split('T')[0],
      weight:  +weight || onbData.weight,
      sessions: ciData.days,
      energy:   ciData.energy,
      notes:    notes
    }));
  } catch (e) {}

  closeSheet('checkinSheet');
  showNotif('📋', 'Check-in saved', 'Your weekly update has been recorded. Keep it up!');
}

/* ══════════════════════════════════════════ */
/*  Timer                                    */
/* ══════════════════════════════════════════ */
function toggleTimer() {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('playBtn').textContent      = '▶';
    document.getElementById('timerStatus').textContent  = 'Paused';
  } else {
    timerInterval = setInterval(() => {
      timerSeconds++;
      var m = Math.floor(timerSeconds / 60), s = timerSeconds % 60;
      document.getElementById('timerDisplay').textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }, 1000);
    timerRunning = true;
    document.getElementById('playBtn').textContent     = '⏸';
    document.getElementById('timerStatus').textContent = 'Session in progress';
  }
}

function setRest(secs) {
  restSeconds = secs;
  updateRestDisplay();
  showNotif('⏱️', 'Rest timer set', formatRest(secs) + ' rest period started.');
}
function formatRest(s) {
  var m = Math.floor(s / 60);
  return m > 0 ? m + ':' + (s % 60 < 10 ? '0' : '') + s % 60 : s + 's';
}
function updateRestDisplay() { document.getElementById('restDisplay').textContent = formatRest(restSeconds); }

function confirmEndSession() {
  if (confirm('End this session and save your data?')) {
    if (timerRunning) toggleTimer();
    showNotif('🏆', 'Session complete!', 'Great work — ' + formatTime(timerSeconds) + ' · ' + calcVolume() + 'kg lifted.');
    navTo('analytics');
  }
}
function formatTime(s) { var m = Math.floor(s / 60); return m + 'min ' + (s % 60) + 's'; }
function calcVolume() {
  return exercises.reduce((t, e) => t + e.sets.reduce((st, s) => st + (s.done ? (+s.kg || 0) * (+s.reps || 0) : 0), 0), 0);
}

/* ══════════════════════════════════════════ */
/*  Exercises                                */
/* ══════════════════════════════════════════ */
function renderExercises() {
  document.getElementById('volumeDisplay').textContent = calcVolume().toLocaleString();
  var html = exercises.map((ex, ei) => `
    <div class="ex-card">
      <div class="ex-card-header">
        <div>
          <div class="ex-card-name">${ex.name}</div>
          <div class="ex-card-type">${ex.type}</div>
        </div>
        <button onclick="removeExercise(${ei})" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:18px;padding:4px">✕</button>
      </div>
      <div class="ex-sets">
        ${ex.sets.map((set, si) => `
          <div class="set-row">
            <div class="set-num">${si + 1}</div>
            <input class="set-input" type="number" value="${set.kg}" onchange="updateSet(${ei},${si},'kg',this.value)" placeholder="kg">
            <input class="set-input" type="number" value="${set.reps}" onchange="updateSet(${ei},${si},'reps',this.value)" placeholder="reps">
            <input class="set-input" type="number" value="${set.rpe || ''}" onchange="updateSet(${ei},${si},'rpe',this.value)" placeholder="RPE">
            <div class="set-check ${set.done ? 'done' : ''}" onclick="toggleSet(${ei},${si})">${set.done ? '✓' : ''}</div>
          </div>`).join('')}
      </div>
      <div class="ex-card-footer">
        <button class="add-set-btn" onclick="addSet(${ei})">+ Add set</button>
      </div>
    </div>`).join('');
  document.getElementById('exerciseList').innerHTML = html;
}

function updateSet(ei, si, field, val) {
  exercises[ei].sets[si][field] = +val || val;
  document.getElementById('volumeDisplay').textContent = calcVolume().toLocaleString();
}
function toggleSet(ei, si) { exercises[ei].sets[si].done = !exercises[ei].sets[si].done; renderExercises(); }
function addSet(ei) {
  var last = exercises[ei].sets[exercises[ei].sets.length - 1];
  exercises[ei].sets.push({ kg: last.kg, reps: last.reps, rpe: '', done: false });
  renderExercises();
}
function removeExercise(ei) { exercises.splice(ei, 1); renderExercises(); }

function addExercise() {
  var name = document.getElementById('newExName').value.trim();
  if (!name) { alert('Please enter an exercise name.'); return; }
  var type    = document.querySelector('#addExSheet .type-chip.selected')?.textContent.trim() || 'Strength';
  var sets    = +document.getElementById('newExSets').value   || 3;
  var reps    = +document.getElementById('newExReps').value   || 10;
  var kg      = +document.getElementById('newExWeight').value || 0;
  var setsArr = Array.from({ length: sets }, () => ({ kg, reps, rpe: '', done: false }));
  exercises.push({ name, type, sets: setsArr });
  closeSheet('addExSheet');
  renderExercises();
  showNotif('💪', 'Exercise added', name + ' added to your session.');
}

function selectType(el) {
  el.closest('.type-grid').querySelectorAll('.type-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

/* ══════════════════════════════════════════ */
/*  Sheets                                   */
/* ══════════════════════════════════════════ */
function openSheet(id)  { document.getElementById(id).classList.add('show'); }
function closeSheet(id) { document.getElementById(id).classList.remove('show'); }

/* ══════════════════════════════════════════ */
/*  Water tracker                            */
/* ══════════════════════════════════════════ */
function renderWater() {
  var html = '';
  for (var i = 0; i < 8; i++) {
    html += `<div class="water-drop ${i < waterFilled ? 'filled' : ''}" onclick="toggleWater(${i})">💧</div>`;
  }
  document.getElementById('waterTracker').innerHTML = html;
}
function toggleWater(i) {
  waterFilled = (waterFilled === i + 1) ? i : i + 1;
  renderWater();
  document.getElementById('waterLabel').innerHTML =
    waterFilled + ' of 8 glasses · <b style="color:var(--primary)">' + (waterFilled * 0.25).toFixed(2) + 'L</b>';
}

/* ══════════════════════════════════════════ */
/*  Charts                                   */
/* ══════════════════════════════════════════ */
var chartsRendered = false;
var chartInstances = {};

function renderCharts() {
  if (chartsRendered) return;
  chartsRendered = true;

  Chart.defaults.color       = '#9898b8';
  Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  var weeks   = ['W7','W8','W9','W10','W11','W12'];
  var primary = '#7c6fff';
  var green   = '#00c896';
  var accent  = '#ff6b35';
  var amber   = '#ffb730';

  chartInstances.volume = new Chart(document.getElementById('volumeChart'), {
    type: 'bar',
    data: {
      labels: weeks,
      datasets: [{ label: 'Volume (kg)', data: [28400,31200,29800,34600,38100,42300], backgroundColor: weeks.map((_,i) => i===5 ? primary : 'rgba(124,111,255,0.35)'), borderRadius: 6, borderSkipped: false }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.raw.toLocaleString() + 'kg' } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#9898b8', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#9898b8', font: { size: 11 }, callback: v => v >= 1000 ? Math.round(v/1000)+'k' : v } }
      }
    }
  });

  chartInstances.type = new Chart(document.getElementById('typeChart'), {
    type: 'doughnut',
    data: { labels: ['Strength','Hypertrophy','HIIT','Cardio'], datasets: [{ data: [8,6,2,2], backgroundColor: [primary,'#ff6b35',green,amber], borderWidth: 0, borderRadius: 3, spacing: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.label+': '+ctx.raw+' sessions' } } } }
  });

  chartInstances.muscle = new Chart(document.getElementById('muscleChart'), {
    type: 'doughnut',
    data: { labels: ['Chest','Back','Legs','Shoulders','Arms'], datasets: [{ data: [24,28,30,10,8], backgroundColor: [primary,green,accent,amber,'#ff4c6a'], borderWidth: 0, borderRadius: 3, spacing: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }
  });

  chartInstances.strength = new Chart(document.getElementById('strengthChart'), {
    type: 'line',
    data: {
      labels: weeks,
      datasets: [
        { label: 'Squat',    data: [105,107.5,107.5,110,117.5,120], borderColor: primary, backgroundColor: 'rgba(124,111,255,0.08)', borderWidth: 2, pointBackgroundColor: primary, pointRadius: 4, tension: 0.3, fill: true },
        { label: 'Bench',    data: [82.5,85,85,87.5,92.5,95],       borderColor: accent,  backgroundColor: 'rgba(255,107,53,0.06)',   borderWidth: 2, pointBackgroundColor: accent,  pointRadius: 4, tension: 0.3, fill: true },
        { label: 'Deadlift', data: [135,140,140,145,150,155],        borderColor: green,   backgroundColor: 'rgba(0,200,150,0.06)',    borderWidth: 2, pointBackgroundColor: green,   pointRadius: 4, tension: 0.3, fill: true }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#9898b8', font: { size: 11 }, boxWidth: 12, padding: 12 } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#9898b8', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#9898b8', font: { size: 11 }, callback: v => v+'kg' } }
      }
    }
  });

  /* Heatmap */
  var hm   = document.getElementById('heatmap');
  var days = ['M','T','W','T','F','S','S'];
  for (var w = 0; w < 5; w++) {
    for (var d = 0; d < 7; d++) {
      var trained = Math.random() > 0.4;
      var today   = w === 4 && d === 3;
      var cell    = document.createElement('div');
      cell.style.cssText = 'width:32px;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;cursor:default;';
      if (today)           { cell.style.background = 'var(--amber)';       cell.style.color = '#fff'; }
      else if (w===4&&d>3) { cell.style.background = 'var(--card2)';       cell.style.color = 'var(--text3)'; }
      else if (trained)    { cell.style.background = 'var(--primary-dim)'; cell.style.color = 'var(--primary)'; }
      else                 { cell.style.background = 'var(--card2)';       cell.style.color = 'var(--text3)'; }
      cell.textContent = days[d];
      hm.appendChild(cell);
    }
  }
}

var macroRendered = false;
function renderMacroChart() {
  if (macroRendered) return;
  macroRendered = true;
  new Chart(document.getElementById('macroChart'), {
    type: 'doughnut',
    data: { labels: ['Protein','Carbs','Fat'], datasets: [{ data: [34,48,18], backgroundColor: ['#ff6b6b','#ffb730','#00c896'], borderWidth: 0, borderRadius: 3, spacing: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { display: false } } }
  });
}

function setPeriod(el, period) {
  document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

/* ── Init ── */
loadPlans();
updateRestDisplay();
renderWater();
restoreSession();

/* ══════════════════════════════════════════ */
/*  Plan Builder — Data                      */
/* ══════════════════════════════════════════ */
var EXERCISE_LIBRARY = {
  'Chest':     ['Bench Press','Incline Bench Press','Decline Bench Press','Dumbbell Fly','Cable Fly','Chest Dip','Push-up','Machine Chest Press','Pec Deck'],
  'Back':      ['Deadlift','Barbell Row','Dumbbell Row','Pull-up','Chin-up','Lat Pulldown','Seated Cable Row','Face Pull','T-Bar Row','Hyperextension','Romanian Deadlift'],
  'Legs':      ['Barbell Squat','Leg Press','Romanian Deadlift','Leg Extension','Leg Curl','Bulgarian Split Squat','Lunges','Calf Raise','Hip Thrust','Hack Squat','Sumo Squat'],
  'Shoulders': ['Overhead Press','Dumbbell Lateral Raise','Front Raise','Rear Delt Fly','Arnold Press','Upright Row','Shrugs','Cable Lateral Raise'],
  'Arms':      ['Barbell Curl','Dumbbell Curl','Hammer Curl','Preacher Curl','Cable Curl','Tricep Pushdown','Skull Crusher','Overhead Tricep Extension','Close-grip Bench Press','Dips'],
  'Core':      ['Plank','Crunch','Leg Raise','Russian Twist','Ab Wheel Rollout','Cable Crunch','Hanging Knee Raise','Side Plank','Mountain Climbers'],
  'Cardio':    ['Treadmill Run','Cycling','Rowing Machine','Elliptical','Stair Climber','Jump Rope','Sprint Intervals','Swimming']
};

var PLAN_TEMPLATES = [
  {
    id: 'ppl', name: 'Push / Pull / Legs', emoji: '💪', tag: 'Hypertrophy · 6 days/week',
    description: '6-day programme alternating push, pull and leg days. Ideal for intermediate lifters.',
    weeks: 12, goal: 'hypertrophy',
    sessions: [
      { name: 'Push', days: ['MON','THU'], exercises: [
        { name:'Bench Press',         cat:'Chest',     sets:4, reps:8,  startKg:60,  endReps:12 },
        { name:'Incline Bench Press', cat:'Chest',     sets:3, reps:10, startKg:50,  endReps:12 },
        { name:'Overhead Press',      cat:'Shoulders', sets:3, reps:8,  startKg:40,  endReps:10 },
        { name:'Dumbbell Lateral Raise', cat:'Shoulders', sets:3, reps:12, startKg:10, endReps:15 },
        { name:'Tricep Pushdown',     cat:'Arms',      sets:3, reps:12, startKg:20,  endReps:15 }
      ]},
      { name: 'Pull', days: ['TUE','FRI'], exercises: [
        { name:'Pull-up',             cat:'Back',  sets:4, reps:8,  startKg:0,  endReps:12 },
        { name:'Barbell Row',         cat:'Back',  sets:4, reps:8,  startKg:70, endReps:10 },
        { name:'Lat Pulldown',        cat:'Back',  sets:3, reps:10, startKg:60, endReps:12 },
        { name:'Face Pull',           cat:'Back',  sets:3, reps:15, startKg:15, endReps:20 },
        { name:'Barbell Curl',        cat:'Arms',  sets:3, reps:10, startKg:30, endReps:12 }
      ]},
      { name: 'Legs', days: ['WED','SAT'], exercises: [
        { name:'Barbell Squat',       cat:'Legs', sets:4, reps:6,  startKg:80,  endReps:8  },
        { name:'Romanian Deadlift',   cat:'Legs', sets:3, reps:8,  startKg:70,  endReps:10 },
        { name:'Leg Press',           cat:'Legs', sets:3, reps:10, startKg:100, endReps:15 },
        { name:'Leg Curl',            cat:'Legs', sets:3, reps:12, startKg:30,  endReps:15 },
        { name:'Calf Raise',          cat:'Legs', sets:4, reps:15, startKg:40,  endReps:20 }
      ]}
    ]
  },
  {
    id: 'upper_lower', name: 'Upper / Lower Split', emoji: '⚡', tag: 'Strength & Size · 4 days/week',
    description: '4-day split alternating upper and lower body. Great for beginners and intermediates.',
    weeks: 8, goal: 'hypertrophy',
    sessions: [
      { name: 'Upper', days: ['MON','THU'], exercises: [
        { name:'Bench Press',    cat:'Chest',     sets:4, reps:6,  startKg:60,  endReps:8  },
        { name:'Barbell Row',    cat:'Back',      sets:4, reps:6,  startKg:60,  endReps:8  },
        { name:'Overhead Press', cat:'Shoulders', sets:3, reps:8,  startKg:40,  endReps:10 },
        { name:'Pull-up',        cat:'Back',      sets:3, reps:6,  startKg:0,   endReps:8  },
        { name:'Dumbbell Curl',  cat:'Arms',      sets:3, reps:10, startKg:12,  endReps:12 },
        { name:'Tricep Pushdown',cat:'Arms',      sets:3, reps:10, startKg:20,  endReps:12 }
      ]},
      { name: 'Lower', days: ['TUE','FRI'], exercises: [
        { name:'Barbell Squat',     cat:'Legs', sets:4, reps:6,  startKg:80,  endReps:8  },
        { name:'Romanian Deadlift', cat:'Legs', sets:4, reps:6,  startKg:70,  endReps:8  },
        { name:'Leg Press',         cat:'Legs', sets:3, reps:10, startKg:100, endReps:12 },
        { name:'Leg Curl',          cat:'Legs', sets:3, reps:10, startKg:30,  endReps:12 },
        { name:'Calf Raise',        cat:'Legs', sets:4, reps:15, startKg:40,  endReps:20 }
      ]}
    ]
  },
  {
    id: 'full_body', name: 'Full Body 3×', emoji: '🏋️', tag: 'General Fitness · 3 days/week',
    description: '3-day full body programme. Perfect for beginners or those with limited time.',
    weeks: 8, goal: 'fitness',
    sessions: [
      { name: 'Full Body', days: ['MON','WED','FRI'], exercises: [
        { name:'Barbell Squat',  cat:'Legs',      sets:3, reps:8, startKg:60,  endReps:12 },
        { name:'Bench Press',    cat:'Chest',     sets:3, reps:8, startKg:50,  endReps:12 },
        { name:'Barbell Row',    cat:'Back',      sets:3, reps:8, startKg:50,  endReps:12 },
        { name:'Overhead Press', cat:'Shoulders', sets:3, reps:8, startKg:30,  endReps:10 },
        { name:'Deadlift',       cat:'Back',      sets:2, reps:5, startKg:80,  endReps:6  }
      ]}
    ]
  },
  {
    id: 'strength_5x5', name: '5×5 Strength', emoji: '🏆', tag: 'Strength · 3 days/week',
    description: 'Classic 5 sets of 5 reps on the big compounds. 3 days per week, pure strength focus.',
    weeks: 12, goal: 'strength',
    sessions: [
      { name: 'Session A', days: ['MON','FRI'], exercises: [
        { name:'Barbell Squat', cat:'Legs',      sets:5, reps:5, startKg:80,  endReps:5 },
        { name:'Bench Press',   cat:'Chest',     sets:5, reps:5, startKg:60,  endReps:5 },
        { name:'Barbell Row',   cat:'Back',      sets:5, reps:5, startKg:60,  endReps:5 }
      ]},
      { name: 'Session B', days: ['WED'], exercises: [
        { name:'Barbell Squat',  cat:'Legs',      sets:5, reps:5, startKg:80, endReps:5 },
        { name:'Overhead Press', cat:'Shoulders', sets:5, reps:5, startKg:40, endReps:5 },
        { name:'Deadlift',       cat:'Back',      sets:1, reps:5, startKg:100,endReps:5 }
      ]}
    ]
  },
  {
    id: 'bro_split', name: 'Classic Bro Split', emoji: '😤', tag: 'Hypertrophy · 5 days/week',
    description: '5-day split dedicating each session to one muscle group. High volume per muscle.',
    weeks: 8, goal: 'hypertrophy',
    sessions: [
      { name: 'Chest Day', days: ['MON'], exercises: [
        { name:'Bench Press',        cat:'Chest', sets:4, reps:8,  startKg:60, endReps:12 },
        { name:'Incline Bench Press',cat:'Chest', sets:4, reps:10, startKg:50, endReps:12 },
        { name:'Cable Fly',          cat:'Chest', sets:3, reps:12, startKg:10, endReps:15 },
        { name:'Pec Deck',           cat:'Chest', sets:3, reps:12, startKg:30, endReps:15 }
      ]},
      { name: 'Back Day', days: ['TUE'], exercises: [
        { name:'Deadlift',     cat:'Back', sets:4, reps:5,  startKg:100,endReps:6  },
        { name:'Barbell Row',  cat:'Back', sets:4, reps:8,  startKg:70, endReps:10 },
        { name:'Pull-up',      cat:'Back', sets:3, reps:8,  startKg:0,  endReps:10 },
        { name:'Lat Pulldown', cat:'Back', sets:3, reps:10, startKg:60, endReps:12 }
      ]},
      { name: 'Shoulder Day', days: ['WED'], exercises: [
        { name:'Overhead Press',        cat:'Shoulders', sets:4, reps:8,  startKg:40, endReps:10 },
        { name:'Dumbbell Lateral Raise',cat:'Shoulders', sets:4, reps:12, startKg:10, endReps:15 },
        { name:'Front Raise',           cat:'Shoulders', sets:3, reps:12, startKg:8,  endReps:15 },
        { name:'Rear Delt Fly',         cat:'Shoulders', sets:3, reps:15, startKg:8,  endReps:20 }
      ]},
      { name: 'Arms Day', days: ['THU'], exercises: [
        { name:'Barbell Curl',            cat:'Arms', sets:4, reps:10, startKg:30, endReps:12 },
        { name:'Hammer Curl',             cat:'Arms', sets:3, reps:10, startKg:12, endReps:12 },
        { name:'Skull Crusher',           cat:'Arms', sets:4, reps:10, startKg:30, endReps:12 },
        { name:'Overhead Tricep Extension',cat:'Arms',sets:3, reps:12, startKg:20, endReps:15 }
      ]},
      { name: 'Legs Day', days: ['FRI'], exercises: [
        { name:'Barbell Squat',     cat:'Legs', sets:4, reps:8,  startKg:80, endReps:10 },
        { name:'Leg Press',         cat:'Legs', sets:4, reps:10, startKg:100,endReps:12 },
        { name:'Romanian Deadlift', cat:'Legs', sets:3, reps:10, startKg:70, endReps:12 },
        { name:'Leg Curl',          cat:'Legs', sets:3, reps:12, startKg:30, endReps:15 },
        { name:'Calf Raise',        cat:'Legs', sets:4, reps:15, startKg:40, endReps:20 }
      ]}
    ]
  }
];

/* Builder runtime state */
var savedPlans   = [];
var activePlanId = null;
var pbStep       = 1;
var pbPlan       = { id: null, name: '', weeks: 12, goal: 'hypertrophy', sessions: [] };
var pbExTarget   = null; /* { sessionIdx } */
var exPickerCat  = 'Chest';

/* ── Plan page rendering ── */
function renderPlanPage() {
  var hasPlan = savedPlans.length > 0;
  document.getElementById('planEmptyState').style.display  = hasPlan ? 'none' : 'block';
  document.getElementById('myPlansList').style.display     = hasPlan ? 'block' : 'none';
  document.getElementById('activePlanView').style.display  = hasPlan ? 'block' : 'none';

  if (!hasPlan) {
    document.getElementById('planPageSub').textContent = 'No active plan';
    return;
  }

  /* My plans cards */
  var html = savedPlans.map((p, i) => {
    var isActive = p.id === activePlanId;
    var t = PLAN_TEMPLATES.find(t => t.id === p.templateId);
    var emoji = t ? t.emoji : '📋';
    return `<div class="my-plan-card ${isActive ? 'active-plan' : ''}" onclick="setActivePlan('${p.id}')">
      <div class="my-plan-card-emoji">${emoji}</div>
      <div style="flex:1">
        <div class="my-plan-card-name">${p.name}</div>
        <div class="my-plan-card-meta">${p.weeks} weeks · ${p.sessions.length} sessions</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        ${isActive ? '<span class="pill pill-green" style="font-size:11px">Active</span>' : ''}
        <button onclick="event.stopPropagation();editPlan('${p.id}')" style="background:none;border:none;color:var(--primary);font-size:12px;font-weight:600;cursor:pointer;padding:4px 8px">Edit</button>
      </div>
    </div>`;
  }).join('');
  document.getElementById('myPlansCards').innerHTML = html;

  /* Active plan view */
  var active = savedPlans.find(p => p.id === activePlanId) || savedPlans[0];
  if (!active) return;
  activePlanId = active.id;

  var goalLabels = { hypertrophy:'Build muscle', strength:'Gain strength', fat_loss:'Lose body fat', endurance:'Endurance', fitness:'General fitness' };
  document.getElementById('planPageSub').textContent = active.name;
  document.getElementById('apGoalLabel').textContent = 'Primary goal';
  document.getElementById('apTitle').textContent     = active.name;
  document.getElementById('apWeekOf').textContent    = 'Week 1 of ' + active.weeks;
  document.getElementById('apPct').textContent       = '0%';
  document.getElementById('apBar').style.width       = '0%';

  var goalPillColors = { hypertrophy:'pill-primary', strength:'pill-green', fat_loss:'pill-accent', endurance:'pill-amber', fitness:'pill-primary' };
  document.getElementById('apPills').innerHTML =
    `<div class="pill ${goalPillColors[active.goal] || 'pill-primary'}">${goalLabels[active.goal] || active.goal}</div>` +
    `<div class="pill pill-accent">${active.sessions.reduce((d,s)=>d+s.days.length,0)} days/week</div>` +
    `<div class="pill pill-green">${active.weeks} weeks</div>`;

  var dayOrder = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  var dayFull  = { MON:'Monday', TUE:'Tuesday', WED:'Wednesday', THU:'Thursday', FRI:'Friday', SAT:'Saturday', SUN:'Sunday' };
  var scheduleHtml = '';
  dayOrder.forEach(day => {
    var session = active.sessions.find(s => s.days.includes(day));
    if (session) {
      var exNames = session.exercises.slice(0,3).map(e=>e.name).join(' · ') + (session.exercises.length>3?' +' + (session.exercises.length-3) + ' more':'');
      scheduleHtml += `<div class="week-day">
        <div class="day-num">${day}</div>
        <div class="day-info"><div class="day-name">${session.name}</div><div class="day-type">${exNames}</div></div>
        <div class="pill pill-primary" style="font-size:11px">${session.exercises.length} ex</div>
      </div>`;
    } else {
      scheduleHtml += `<div class="week-day rest">
        <div class="day-num">${day}</div>
        <div class="day-info"><div class="day-name">Rest</div><div class="day-type">Recovery day</div></div>
        <div class="pill" style="background:var(--card2);color:var(--text3);font-size:11px;padding:4px 10px;border-radius:20px;font-weight:600">Rest</div>
      </div>`;
    }
  });
  document.getElementById('apSchedule').innerHTML = scheduleHtml;
}

function setActivePlan(id) {
  activePlanId = id;
  persistPlans();
  renderPlanPage();
  showNotif('✅', 'Plan activated', savedPlans.find(p=>p.id===id)?.name + ' is now your active plan.');
}

function editPlan(id) {
  var plan = savedPlans.find(p => p.id === id);
  if (!plan) return;
  pbPlan  = JSON.parse(JSON.stringify(plan));
  pbStep  = 2;
  openPlanBuilderPage();
}

/* ── Plan Builder ── */
function openPlanBuilder(templateId) {
  pbPlan  = { id: null, name: '', weeks: 12, goal: 'hypertrophy', sessions: [] };
  pbStep  = 1;
  renderPbTemplates();
  openPlanBuilderPage();
  if (templateId) pbSelectTemplate(templateId);
}

function openPlanBuilderPage() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-planbuilder').classList.add('active');
  ['pb-step-1','pb-step-2','pb-step-3'].forEach(id => document.getElementById(id).classList.remove('active'));
  document.getElementById('pb-step-' + pbStep).classList.add('active');
  updatePbStepIndicator();
  document.getElementById('pbSaveBtn').style.visibility = pbStep === 3 ? 'visible' : 'hidden';
  window.scrollTo(0, 0);
}

function pbGoBack() {
  if (pbStep === 1) { navTo('plan'); return; }
  pbStep--;
  document.querySelectorAll('.pb-step').forEach(s => s.classList.remove('active'));
  document.getElementById('pb-step-' + pbStep).classList.add('active');
  document.getElementById('pbSaveBtn').style.visibility = pbStep === 3 ? 'visible' : 'hidden';
  updatePbStepIndicator();
  window.scrollTo(0, 0);
}

function pbNextStep() {
  if (pbStep === 2) {
    var name = document.getElementById('pbName').value.trim();
    if (!name) { alert('Please give your plan a name.'); return; }
    pbPlan.name = name;
    if (!pbPlan.sessions.length) {
      pbPlan.sessions = [{ id: Date.now()+'', name: 'Session A', days: [], exercises: [] }];
    }
    renderPbSessions();
  }
  pbStep++;
  document.querySelectorAll('.pb-step').forEach(s => s.classList.remove('active'));
  document.getElementById('pb-step-' + pbStep).classList.add('active');
  document.getElementById('pbSaveBtn').style.visibility = pbStep === 3 ? 'visible' : 'hidden';
  updatePbStepIndicator();
  window.scrollTo(0, 0);
}

function updatePbStepIndicator() {
  [1,2,3].forEach(n => {
    var dot  = document.getElementById('pbDot'  + n);
    var line = document.getElementById('pbLine' + n);
    dot.classList.remove('active','done');
    if (n < pbStep)  { dot.classList.add('done'); if (line) line.classList.add('done'); }
    if (n === pbStep){ dot.classList.add('active'); if (line) line.classList.remove('done'); }
    if (n > pbStep)  { if (line) line.classList.remove('done'); }
  });
}

/* Templates */
function renderPbTemplates() {
  var html = PLAN_TEMPLATES.map(t =>
    `<div class="pb-template-card" id="pbt-${t.id}" onclick="pbSelectTemplate('${t.id}')">
      <div class="pb-template-emoji">${t.emoji}</div>
      <div>
        <div class="pb-template-name">${t.name}</div>
        <div class="pb-template-meta">${t.tag}</div>
        <div class="pb-template-desc">${t.description}</div>
      </div>
    </div>`
  ).join('');
  document.getElementById('pbTemplateList').innerHTML = html;
}

function pbSelectTemplate(id) {
  document.querySelectorAll('.pb-template-card').forEach(c => c.classList.remove('selected'));
  if (id) {
    var t = PLAN_TEMPLATES.find(t => t.id === id);
    if (t) {
      document.getElementById('pbt-' + id)?.classList.add('selected');
      pbPlan = {
        id: null, templateId: id, name: t.name, weeks: t.weeks, goal: t.goal,
        sessions: JSON.parse(JSON.stringify(t.sessions))
      };
      /* Pre-fill step 2 */
      document.getElementById('pbName').value = t.name;
      document.querySelectorAll('#pbWeekPicker .pb-chip').forEach(c => {
        c.classList.toggle('selected', +c.textContent === t.weeks);
      });
      pbPlan.weeks = t.weeks;
      document.querySelectorAll('[data-pb-goal]').forEach(c => {
        c.classList.toggle('selected', c.dataset.pbGoal === t.goal);
      });
      pbPlan.goal = t.goal;
    }
  } else {
    pbPlan = { id: null, name: '', weeks: 12, goal: 'hypertrophy', sessions: [] };
    document.getElementById('pbName').value = '';
  }
  pbNextStep();
}

function pbSelectChip(el, groupId, val) {
  document.querySelectorAll('#' + groupId + ' .pb-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  if (groupId === 'pbWeekPicker') pbPlan.weeks = val;
}

function pbSelectGoal(el) {
  document.querySelectorAll('[data-pb-goal]').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  pbPlan.goal = el.dataset.pbGoal;
}

/* Sessions */
function renderPbSessions() {
  var html = pbPlan.sessions.map((s, si) => {
    var hasEx = s.exercises.length > 0;
    var exColHeaders = hasEx ? `<div class="pb-ex-col-headers">
      <div class="pb-ex-col-h" style="text-align:left">Exercise</div>
      <div class="pb-ex-col-h">Sets</div>
      <div class="pb-ex-col-h">Reps</div>
      <div class="pb-ex-col-h">Start kg</div>
      <div class="pb-ex-col-h">End reps</div>
      <div class="pb-ex-col-h"></div>
    </div>` : '';
    var exRows = s.exercises.map((ex, ei) =>
      `<div class="pb-ex-row">
        <div><div class="pb-ex-name">${ex.name}</div><div class="pb-ex-cat">${ex.cat}</div></div>
        <input class="pb-ex-input" type="number" value="${ex.sets}"    min="1" max="10"  oninput="pbUpdateEx(${si},${ei},'sets',this.value)"   placeholder="3">
        <input class="pb-ex-input" type="number" value="${ex.reps}"    min="1" max="50"  oninput="pbUpdateEx(${si},${ei},'reps',this.value)"   placeholder="10">
        <input class="pb-ex-input" type="number" value="${ex.startKg}" min="0" max="999" step="0.5" oninput="pbUpdateEx(${si},${ei},'startKg',this.value)" placeholder="0">
        <input class="pb-ex-input" type="number" value="${ex.endReps}" min="1" max="50"  oninput="pbUpdateEx(${si},${ei},'endReps',this.value)" placeholder="${ex.reps}">
        <button class="pb-ex-remove" onclick="pbRemoveEx(${si},${ei})">✕</button>
      </div>`
    ).join('');
    var dayChips = ['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d =>
      `<div class="pb-day-chip ${s.days.includes(d) ? 'on' : ''}" onclick="pbToggleDay(${si},'${d}')">${d.slice(0,2)}</div>`
    ).join('');
    return `<div class="pb-session-card" id="pbs-${si}">
      <div class="pb-session-header">
        <input class="pb-session-name-input" value="${s.name}" placeholder="Session name" oninput="pbUpdateSessionName(${si},this.value)">
        <button class="pb-session-remove" onclick="pbRemoveSession(${si})" title="Remove session">✕</button>
      </div>
      <div class="pb-day-row">${dayChips}</div>
      ${exColHeaders}${exRows}
      <button class="pb-add-ex-btn" onclick="pbOpenExPicker(${si})">+ Add exercise</button>
    </div>`;
  }).join('');
  document.getElementById('pbSessionList').innerHTML = html;
}

function pbAddSession() {
  pbPlan.sessions.push({ id: Date.now()+'', name: 'Session ' + String.fromCharCode(65 + pbPlan.sessions.length), days: [], exercises: [] });
  renderPbSessions();
}

function pbRemoveSession(si) {
  if (pbPlan.sessions.length <= 1) { alert('A plan needs at least one session.'); return; }
  pbPlan.sessions.splice(si, 1);
  renderPbSessions();
}

function pbUpdateSessionName(si, val) { pbPlan.sessions[si].name = val; }
function pbToggleDay(si, day) {
  var days = pbPlan.sessions[si].days;
  var idx  = days.indexOf(day);
  if (idx > -1) days.splice(idx, 1); else days.push(day);
  var chip = document.querySelector(`#pbs-${si} .pb-day-row .pb-day-chip:nth-child(${['MON','TUE','WED','THU','FRI','SAT','SUN'].indexOf(day)+1})`);
  if (chip) chip.classList.toggle('on', days.includes(day));
}
function pbUpdateEx(si, ei, field, val) {
  pbPlan.sessions[si].exercises[ei][field] = +val || 0;
}
function pbRemoveEx(si, ei) {
  pbPlan.sessions[si].exercises.splice(ei, 1);
  renderPbSessions();
}

/* Exercise picker */
function pbOpenExPicker(si) {
  pbExTarget = { si };
  exPickerCat = 'Chest';
  renderExPickerCats();
  renderExPickerList();
  openSheet('exPickerSheet');
}

function renderExPickerCats() {
  var cats = Object.keys(EXERCISE_LIBRARY);
  document.getElementById('exPickerCats').innerHTML = cats.map(cat =>
    `<div class="ex-picker-cat ${cat === exPickerCat ? 'active' : ''}" onclick="exPickerSelectCat('${cat}')">${cat}</div>`
  ).join('');
}

function exPickerSelectCat(cat) {
  exPickerCat = cat;
  document.querySelectorAll('.ex-picker-cat').forEach(c => c.classList.toggle('active', c.textContent === cat));
  renderExPickerList();
}

function renderExPickerList() {
  var exercises = EXERCISE_LIBRARY[exPickerCat] || [];
  document.getElementById('exPickerList').innerHTML = exercises.map(name =>
    `<div class="ex-picker-item" onclick="pbAddExFromPicker('${name.replace(/'/g,"\\'")}','${exPickerCat}')">
      ${name}<span class="ex-picker-item-arrow">+</span>
    </div>`
  ).join('');
}

function pbAddExFromPicker(name, cat) {
  if (pbExTarget === null) return;
  pbPlan.sessions[pbExTarget.si].exercises.push({ name, cat, sets:3, reps:10, startKg:0, endReps:12 });
  closeSheet('exPickerSheet');
  renderPbSessions();
}

/* Save plan */
function savePlan() {
  var name = pbPlan.name || document.getElementById('pbName').value.trim();
  if (!name) { alert('Please give your plan a name.'); pbStep = 2; openPlanBuilderPage(); return; }
  if (!pbPlan.sessions.length) { alert('Add at least one session.'); return; }
  pbPlan.name = name;
  if (!pbPlan.id) pbPlan.id = 'plan_' + Date.now();
  var idx = savedPlans.findIndex(p => p.id === pbPlan.id);
  if (idx > -1) savedPlans[idx] = JSON.parse(JSON.stringify(pbPlan));
  else          savedPlans.push(JSON.parse(JSON.stringify(pbPlan)));
  if (!activePlanId) activePlanId = pbPlan.id;
  persistPlans();
  navTo('plan');
  showNotif('✅', 'Plan saved!', pbPlan.name + ' is now your active plan.');
}

function persistPlans() {
  try { localStorage.setItem('ql_plans', JSON.stringify({ plans: savedPlans, activeId: activePlanId })); } catch(e) {}
}

function loadPlans() {
  try {
    var raw = localStorage.getItem('ql_plans');
    if (!raw) return;
    var d = JSON.parse(raw);
    savedPlans   = d.plans  || [];
    activePlanId = d.activeId || null;
  } catch(e) {}
}

/* ══════════════════════════════════════════ */
/*  Session Log                              */
/* ══════════════════════════════════════════ */
var slSession = { num: 3, total: 12, type: 'Pull Session', startTs: null, elapsed: 0, interval: null };

var slExercises = [
  {
    name: 'Pull-up', type: 'Strength',
    lastSets: [7, 7, 6, 6], targetReps: [8, 8, 8, 8], planStart: 5, planEnd: 12,
    sets: [{ kg: null, reps: null, done: false }, { kg: null, reps: null, done: false }, { kg: null, reps: null, done: false }, { kg: null, reps: null, done: false }],
    expanded: true
  },
  {
    name: 'Barbell Row', type: 'Strength',
    lastSets: [7, 7, 6, 6], targetReps: [8, 8, 8, 8], planStart: 6, planEnd: 12,
    sets: [{ kg: 70, reps: null, done: false }, { kg: 70, reps: null, done: false }, { kg: 70, reps: null, done: false }, { kg: 70, reps: null, done: false }],
    expanded: false
  },
  {
    name: 'Lat Pulldown', type: 'Hypertrophy',
    lastSets: [9, 9, 8], targetReps: [10, 10, 10], planStart: 8, planEnd: 15,
    sets: [{ kg: 60, reps: null, done: false }, { kg: 60, reps: null, done: false }, { kg: 60, reps: null, done: false }],
    expanded: false
  },
  {
    name: 'Face Pulls', type: 'Hypertrophy',
    lastSets: [11, 11, 10], targetReps: [12, 12, 12], planStart: 10, planEnd: 20,
    sets: [{ kg: 20, reps: null, done: false }, { kg: 20, reps: null, done: false }, { kg: 20, reps: null, done: false }],
    expanded: false
  },
  {
    name: 'Bicep Curl', type: 'Hypertrophy',
    lastSets: [10, 9, 9], targetReps: [10, 10, 10], planStart: 8, planEnd: 15,
    sets: [{ kg: 15, reps: null, done: false }, { kg: 15, reps: null, done: false }, { kg: 15, reps: null, done: false }],
    expanded: false
  }
];

function startSessionLog() {
  if (slSession.interval) clearInterval(slSession.interval);
  slSession.startTs = Date.now();
  slSession.elapsed = 0;

  slExercises.forEach((ex, i) => {
    ex.expanded = i === 0;
    ex.sets.forEach(s => { s.reps = null; s.done = false; });
  });

  document.getElementById('slNum').textContent            = slSession.num;
  document.getElementById('slTotal').textContent          = slSession.total;
  document.getElementById('slTypePill').textContent       = slSession.type;
  document.getElementById('slAnalysisSession').textContent = slSession.num;
  document.getElementById('slAnalysisTotal').textContent  = slSession.total;
  document.getElementById('slDuration').textContent       = '00:00';

  slUpdateDateTime();
  slSession.interval = setInterval(() => {
    slSession.elapsed++;
    slUpdateDuration();
    slUpdateDateTime();
  }, 1000);

  renderSlExercises();
  updateSlAnalysis();
  updateSlStats();
  navTo('sessionlog');
}

function slUpdateDuration() {
  var s = slSession.elapsed;
  var m = Math.floor(s / 60), sec = s % 60, h = Math.floor(m / 60);
  document.getElementById('slDuration').textContent = h > 0
    ? h + ':' + String(m % 60).padStart(2, '0') + ':' + String(sec).padStart(2, '0')
    : String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
}

function slUpdateDateTime() {
  var now = new Date();
  var days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('slDateDisplay').textContent = days[now.getDay()] + ' ' + now.getDate() + ' ' + months[now.getMonth()];
  document.getElementById('slTimeDisplay').textContent = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
}

function renderSlExercises() {
  var html = slExercises.map((ex, ei) => {
    var doneSets  = ex.sets.filter(s => s.done).length;
    var totalSets = ex.sets.length;
    var allDone   = doneSets === totalSets;
    var typePill  = ex.type === 'Strength'
      ? '<span class="pill pill-primary" style="font-size:10px;padding:2px 8px">Strength</span>'
      : '<span class="pill pill-accent"  style="font-size:10px;padding:2px 8px">' + ex.type + '</span>';

    var setsHtml = `
      <div class="sl-sets-header">
        <div class="sl-col-h">#</div>
        <div class="sl-col-h">Last</div>
        <div class="sl-col-h">Target</div>
        <div class="sl-col-h actual-h">Actual</div>
        <div class="sl-col-h">kg</div>
        <div class="sl-col-h"></div>
      </div>` +
      ex.sets.map((set, si) => {
        var last   = ex.lastSets[si]   !== undefined ? ex.lastSets[si]   : '–';
        var target = ex.targetReps[si] !== undefined ? ex.targetReps[si] : '–';
        var kgVal  = set.kg   !== null ? set.kg   : '';
        var repVal = set.reps !== null ? set.reps : '';
        return `
          <div class="sl-set-row${set.done ? ' set-done' : ''}">
            <div class="sl-set-num">${si + 1}</div>
            <div class="sl-set-last">${last}</div>
            <div class="sl-set-target">${target}</div>
            <input class="sl-set-actual${set.done ? ' done-input' : ''}"
                   type="number" inputmode="numeric"
                   value="${repVal}" placeholder=""
                   min="0" max="99"
                   oninput="slUpdateSet(${ei},${si},'reps',this.value)">
            <input class="sl-set-kg"
                   type="number" inputmode="decimal"
                   value="${kgVal}" placeholder="–"
                   min="0" max="999" step="0.5"
                   oninput="slUpdateSet(${ei},${si},'kg',this.value)">
            <div class="sl-set-check${set.done ? ' checked' : ''}" onclick="slCompleteSet(${ei},${si})">
              ${set.done ? '✓' : ''}
            </div>
          </div>`;
      }).join('');

    return `
      <div class="sl-ex-card${ex.expanded ? ' expanded' : ''}${allDone ? ' all-done' : ''}" id="sl-ex-${ei}">
        <div class="sl-ex-card-header" onclick="slToggleCard(${ei})">
          <div class="sl-ex-name-wrap">
            <div class="sl-ex-name">${ex.name}</div>
            <div style="margin-top:3px">${typePill}</div>
          </div>
          <div class="sl-ex-progress${allDone ? ' done' : ''}">${doneSets}/${totalSets} sets${allDone ? ' ✓' : ''}</div>
          <div class="sl-ex-arrow">⌄</div>
        </div>
        <div class="sl-ex-sets">${setsHtml}</div>
      </div>`;
  }).join('');

  document.getElementById('slExerciseList').innerHTML = html;
}

function slToggleCard(ei) {
  slExercises[ei].expanded = !slExercises[ei].expanded;
  var card = document.getElementById('sl-ex-' + ei);
  if (!card) return;
  card.classList.toggle('expanded', slExercises[ei].expanded);
}

function slUpdateSet(ei, si, field, val) {
  var v = val === '' ? null : (field === 'reps' ? parseInt(val) : parseFloat(val));
  slExercises[ei].sets[si][field] = isNaN(v) ? null : v;
  updateSlAnalysis();
  updateSlStats();
}

function slCompleteSet(ei, si) {
  var set = slExercises[ei].sets[si];
  set.done = !set.done;
  if (set.done && set.reps === null) set.reps = slExercises[ei].targetReps[si];

  var allDone = slExercises[ei].sets.every(s => s.done);
  if (allDone) {
    slExercises[ei].expanded = false;
    for (var ni = ei + 1; ni < slExercises.length; ni++) {
      if (!slExercises[ni].sets.every(s => s.done)) {
        slExercises[ni].expanded = true;
        break;
      }
    }
  }

  renderSlExercises();
  updateSlAnalysis();
  updateSlStats();

  if (allDone) {
    setTimeout(() => {
      var next = document.getElementById('sl-ex-' + (ei + 1));
      if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }
}

function slPlanTarget(ex) {
  var ratio = (slSession.num - 1) / Math.max(slSession.total - 1, 1);
  return Math.round(ex.planStart + ratio * (ex.planEnd - ex.planStart));
}

function updateSlAnalysis() {
  var shortHtml = '', planHtml = '';

  slExercises.forEach(ex => {
    var planTgt = slPlanTarget(ex);
    var shortRows = '', planRows = '';

    ex.sets.forEach((set, si) => {
      var last   = ex.lastSets[si]   || 0;
      var target = ex.targetReps[si] || 0;
      var actual = (set.done || set.reps !== null) ? (set.reps || 0) : null;

      /* Short-term: progressive overload (+1 rep vs last = green) */
      var stCls, stLabel, stW;
      if (actual === null) {
        stCls = 'pending'; stLabel = 'Not done yet'; stW = 0;
      } else if (actual >= last + 1) {
        stCls = 'green';  stLabel = '+' + (actual - last) + ' rep' + (actual - last > 1 ? 's' : '') + ' vs last'; stW = 100;
      } else if (actual === last) {
        stCls = 'amber';  stLabel = 'Same as last (' + last + ')'; stW = Math.round(actual / (last + 2) * 90);
      } else {
        stCls = 'red';    stLabel = (actual - last) + ' vs last'; stW = Math.max(10, Math.round(actual / (last + 1) * 80));
      }

      /* Plan target: linear progression */
      var ptCls, ptLabel, ptW;
      if (actual === null) {
        ptCls = 'pending'; ptLabel = 'Not done yet'; ptW = 0;
      } else {
        var pct = planTgt > 0 ? Math.min(100, Math.round(actual / planTgt * 100)) : 100;
        if (actual >= planTgt)        { ptCls = 'green'; ptLabel = actual + ' / ' + planTgt + ' ✓'; ptW = 100; }
        else if (actual >= planTgt-1) { ptCls = 'amber'; ptLabel = actual + ' / ' + planTgt; ptW = pct; }
        else                          { ptCls = 'red';   ptLabel = actual + ' / ' + planTgt; ptW = pct; }
      }

      shortRows += `<div class="sl-bar-row">
        <div class="sl-bar-set-lbl">Set ${si+1}</div>
        <div class="sl-bar-track"><div class="sl-bar-fill ${stCls}" style="width:${stW}%"></div></div>
        <div class="sl-bar-value ${stCls}">${stLabel}</div>
      </div>`;

      planRows += `<div class="sl-bar-row">
        <div class="sl-bar-set-lbl">Set ${si+1}</div>
        <div class="sl-bar-track"><div class="sl-bar-fill ${ptCls}" style="width:${ptW}%"></div></div>
        <div class="sl-bar-value ${ptCls}">${ptLabel}</div>
      </div>`;
    });

    shortHtml += `<div class="sl-bar-group"><div class="sl-bar-ex-name">${ex.name}</div>${shortRows}</div>`;
    planHtml  += `<div class="sl-bar-group"><div class="sl-bar-ex-name">${ex.name}</div>${planRows}</div>`;
  });

  document.getElementById('slShortTermBars').innerHTML = shortHtml;
  document.getElementById('slPlanBars').innerHTML      = planHtml;
}

function updateSlStats() {
  var vol = 0, sets = 0, reps = 0;
  slExercises.forEach(ex => {
    ex.sets.forEach(s => {
      if (s.done) { sets++; reps += s.reps || 0; vol += (s.reps || 0) * (s.kg || 0); }
    });
  });
  document.getElementById('slVolDisplay').textContent  = vol.toLocaleString();
  document.getElementById('slSetsDisplay').textContent = sets;
  document.getElementById('slRepsDisplay').textContent = reps;
}

function endSlSession() {
  if (!confirm('End this session and save?')) return;
  if (slSession.interval) { clearInterval(slSession.interval); slSession.interval = null; }
  var sets = slExercises.reduce((t, ex) => t + ex.sets.filter(s => s.done).length, 0);
  var vol  = slExercises.reduce((t, ex) => t + ex.sets.reduce((st, s) => st + (s.done ? (s.reps||0)*(s.kg||0) : 0), 0), 0);
  var dur  = slSession.elapsed;
  var m = Math.floor(dur/60), h = Math.floor(m/60);
  var durStr = h > 0 ? h+'h '+( m%60)+'min' : m+'min';
  showNotif('🏆', 'Session complete!', sets + ' sets · ' + vol.toLocaleString() + 'kg · ' + durStr);
  navTo('analytics');
}
