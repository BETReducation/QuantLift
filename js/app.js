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

  enterMember(onbData.name);
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

function enterGuest() {
  userState.mode = 'guest';
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

function enterMember(name) {
  userState.mode = 'member';
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
  setTimeout(() => checkWeeklyCheckin(), 2000);
}

function greeting() {
  var h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function logOut() {
  if (!confirm('Log out of QuantLift?')) return;
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
updateRestDisplay();
renderWater();
