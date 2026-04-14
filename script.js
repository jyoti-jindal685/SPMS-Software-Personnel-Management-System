// =================== DATA STORE ===================
const LS = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } },
  set: (k,v) => localStorage.setItem(k, JSON.stringify(v)),
};

// Version check — clears old data if schema changed
const SPMS_VERSION = 'v3';
if (LS.get('spms_version') !== SPMS_VERSION) {
  ['spms_employees','spms_leaves','spms_attendance','spms_worklogs','spms_tasks','spms_referrals','spms_vacancies'].forEach(k => localStorage.removeItem(k));
  LS.set('spms_version', SPMS_VERSION);
  console.log('SPMS: Fresh data initialized (version update)');
}

function initData() {
  if (!LS.get('spms_employees')) {
    LS.set('spms_employees', [
      { id:'EMP001', name:'Priya Sharma', dob:'1995-03-15', email:'priya@company.com', phone:'9876543210',
        dept:'Development', pos:'Senior Developer', salary:85000, joinDate:'2021-06-01',
        status:'Active', addr:'101 MG Road, Bangalore 560001', username:'emp001', password:'pass123', photo:null },
      { id:'EMP002', name:'Rahul Verma', dob:'1993-07-22', email:'rahul@company.com', phone:'9823456789',
        dept:'Design', pos:'UI/UX Lead', salary:72000, joinDate:'2020-11-15',
        status:'Active', addr:'45 Indiranagar, Bangalore 560038', username:'emp002', password:'pass123', photo:null },
      { id:'EMP003', name:'Anjali Singh', dob:'1997-01-10', email:'anjali@company.com', phone:'9012345678',
        dept:'Marketing', pos:'Digital Marketing Manager', salary:68000, joinDate:'2022-03-01',
        status:'Active', addr:'22 Koramangala, Bangalore 560034', username:'emp003', password:'pass123', photo:null },
      { id:'EMP004', name:'Vikram Patel', dob:'1990-05-20', email:'vikram@company.com', phone:'9812345670',
        dept:'Development', pos:'Backend Engineer', salary:78000, joinDate:'2020-01-15',
        status:'Active', addr:'55 Whitefield, Bangalore 560066', username:'emp004', password:'pass123', photo:null },
      { id:'EMP005', name:'Meena Joshi', dob:'1996-09-08', email:'meena@company.com', phone:'9900123456',
        dept:'Human Resources', pos:'HR Manager', salary:65000, joinDate:'2021-09-01',
        status:'Active', addr:'12 JP Nagar, Bangalore 560078', username:'emp005', password:'pass123', photo:null },
    ]);
  }
  if (!LS.get('spms_leaves')) LS.set('spms_leaves', []);
  if (!LS.get('spms_attendance')) LS.set('spms_attendance', {});
  if (!LS.get('spms_worklogs')) LS.set('spms_worklogs', {});
  if (!LS.get('spms_tasks')) LS.set('spms_tasks', {});
  if (!LS.get('spms_referrals')) LS.set('spms_referrals', []);
  if (!LS.get('spms_vacancies')) {
    LS.set('spms_vacancies', [
      { id:'V001', title:'Full Stack Developer', dept:'Development', loc:'Bangalore / Hybrid',
        salary:'₹10L - ₹16L', exp:'3-5 years', type:'Full-time', deadline:'2026-06-30',
        openings:2, desc:'We are looking for a skilled Full Stack Developer proficient in React and Node.js to join our growing team.', req:'React, Node.js, MongoDB, REST APIs, Git. B.Tech/MCA in CS or related field.' },
      { id:'V002', title:'Product Designer', dept:'Design', loc:'Remote',
        salary:'₹8L - ₹12L', exp:'2-4 years', type:'Full-time', deadline:'2026-05-15',
        openings:1, desc:'Join our design team to craft beautiful, user-centered digital experiences.', req:'Figma, Adobe XD, User Research, Prototyping, Portfolio required.' },
    ]);
  }
}

// =================== AUTH ===================
let currentUser = null;
let loginRole = 'admin';

function switchLoginTab(role) {
  loginRole = role;
  document.getElementById('tab-admin').classList.toggle('active', role === 'admin');
  document.getElementById('tab-employee').classList.toggle('active', role === 'employee');
  document.getElementById('adminCreds').style.display = role === 'admin' ? 'block' : 'none';
  document.getElementById('empCreds').style.display = role === 'employee' ? 'block' : 'none';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginErr').classList.add('hidden');
}

function toggleLoginPassVis() {
  const inp = document.getElementById('loginPass');
  const btn = document.getElementById('loginPassToggle');
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁'; }
}

function doLogin() {
  const u = (document.getElementById('loginUser').value || '').trim();
  const p = (document.getElementById('loginPass').value || '');
  const err = document.getElementById('loginErr');
  err.classList.add('hidden');

  if (!u || !p) {
    err.textContent = '❌ Please enter both username and password.';
    err.classList.remove('hidden');
    return;
  }

  if (loginRole === 'admin') {
    if (u === 'admin' && p === 'admin123') {
      currentUser = { role:'admin', name:'Administrator', designation:'System Admin', username:'admin' };
      startApp();
    } else if (u === 'admin') {
      err.textContent = '❌ Wrong password. Please try again.';
      err.classList.remove('hidden');
    } else {
      err.textContent = '❌ Admin username not found.';
      err.classList.remove('hidden');
    }
  } else {
    const emps = LS.get('spms_employees') || [];
    const byUser = emps.find(e => e.username === u);
    if (!byUser) {
      err.textContent = '❌ Username not found.';
      err.classList.remove('hidden');
    } else if (byUser.password !== p) {
      err.textContent = '❌ Wrong password. Please try again.';
      err.classList.remove('hidden');
    } else {
      currentUser = { role:'employee', empId: byUser.id, name: byUser.name, designation: byUser.pos, username: byUser.username };
      startApp();
    }
  }
}

// Attach keydown after DOM loads
window.addEventListener('DOMContentLoaded', function() {
  document.getElementById('loginPass').addEventListener('keydown', function(e) { if(e.key==='Enter') doLogin(); });
  document.getElementById('loginUser').addEventListener('keydown', function(e) { if(e.key==='Enter') doLogin(); });
});

function doLogout() {
  currentUser = null;
  document.getElementById('app').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

// =================== APP START ===================
function startApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  setupSidebar();
  startClock();
  if (currentUser.role === 'admin') navigateTo('pg-admin-dashboard');
  else navigateTo('pg-emp-dashboard');
}

function setupSidebar() {
  const r = currentUser.role;
  document.getElementById('sidebarRole').textContent = r === 'admin' ? 'Admin Panel' : 'Employee Panel';
  document.getElementById('sidebarName').textContent = currentUser.name;
  document.getElementById('sidebarDesig').textContent = currentUser.designation;

  const avatarEl = document.getElementById('sidebarAvatar');
  if (r === 'employee') {
    const emps = LS.get('spms_employees') || [];
    const emp = emps.find(e => e.id === currentUser.empId);
    if (emp && emp.photo) {
      avatarEl.innerHTML = `<img src="${emp.photo}" alt="avatar">`;
    } else {
      avatarEl.textContent = currentUser.name[0].toUpperCase();
    }
  } else {
    avatarEl.textContent = 'A';
  }

  // Count pending leave for badge
  const leaves = LS.get('spms_leaves') || [];
  const pendingLeave = leaves.filter(l => l.status === 'Pending').length;
  const tasks = LS.get('spms_tasks') || {};
  const empTaskCount = r === 'employee' ? ((tasks[currentUser.empId] || []).filter(t => t.status === 'Pending' || t.status === 'In Progress').length) : 0;
  const pendingTasks = r === 'admin' ? Object.values(tasks).flat().filter(t => t.status === 'Pending').length : 0;

  const adminNav = [
    { icon:'📊', label:'Dashboard', page:'pg-admin-dashboard' },
    { icon:'👥', label:'Employees', page:'pg-admin-employees' },
    { icon:'📋', label:'Task Management', page:'pg-admin-tasks', badge: pendingTasks },
    { icon:'💼', label:'Job Vacancies', page:'pg-admin-vacancies' },
    { icon:'🏖️', label:'Leave Requests', page:'pg-admin-leaves', badge: pendingLeave },
    { icon:'📈', label:'Reports', page:'pg-admin-reports' },
  ];
  const empNav = [
    { icon:'🏠', label:'Dashboard', page:'pg-emp-dashboard' },
    { icon:'🪪', label:'My Profile', page:'pg-emp-profile' },
    { icon:'🏖️', label:'Leave', page:'pg-emp-leave' },
    { icon:'📋', label:'My Tasks', page:'pg-emp-tasks', badge: empTaskCount },
    { icon:'📌', label:'Work Log', page:'pg-emp-worklog' },
    { icon:'💼', label:'Job Openings', page:'pg-emp-vacancies' },
  ];

  const items = r === 'admin' ? adminNav : empNav;
  document.getElementById('sidebarNav').innerHTML = items.map(it => `
    <div class="nav-item" id="nav-${it.page}" onclick="navigateTo('${it.page}')">
      <span class="nav-icon">${it.icon}</span>${it.label}
      ${(it.badge && it.badge > 0) ? `<span class="nav-badge">${it.badge}</span>` : ''}
    </div>
  `).join('');
}

function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
  const navItem = document.getElementById('nav-'+pageId);
  if (navItem) navItem.classList.add('active');
  renderPage(pageId);
}

// =================== CLOCK ===================
function startClock() {
  function tick() {
    const now = new Date();
    const hms = now.toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const dstr = now.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
    document.getElementById('sidebarClock').textContent = hms;
    document.getElementById('sidebarDate').textContent = dstr;
    const shortTime = now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
    const shortDate = now.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
    const wt = document.getElementById('widgetTime');
    const wd = document.getElementById('widgetDate');
    if (wt) wt.textContent = shortTime;
    if (wd) wd.textContent = shortDate;
    const hwc = document.getElementById('hwClock');
    if (hwc) hwc.textContent = hms;
  }
  tick();
  setInterval(tick, 1000);
}

// =================== RENDER PAGES ===================
function renderPage(id) {
  switch(id) {
    case 'pg-admin-dashboard': renderAdminDashboard(); break;
    case 'pg-admin-employees': renderEmpList(); break;
    case 'pg-admin-tasks': renderAdminTasks(); break;
    case 'pg-admin-vacancies': renderVacancies(); break;
    case 'pg-admin-leaves': renderAdminLeaves(); break;
    case 'pg-admin-tasks': renderAdminTasks(); break;
    case 'pg-admin-reports': renderReports(); break;
    case 'pg-emp-dashboard': renderEmpDashboard(); break;
    case 'pg-emp-profile': renderProfile(); break;
    case 'pg-emp-leave': renderLeave(); break;
    case 'pg-emp-tasks': renderEmpTasks(); break;
    case 'pg-emp-worklog': renderWorkLog(); break;
    case 'pg-emp-vacancies': renderEmpVacancies(); break;
  }
}

// =================== ADMIN DASHBOARD ===================
function renderAdminDashboard() {
  const emps = LS.get('spms_employees') || [];
  const leaves = LS.get('spms_leaves') || [];
  const att = LS.get('spms_attendance') || {};
  const today = todayStr();

  const total = emps.length;
  const active = emps.filter(e => e.status === 'Active').length;
  const depts = new Set(emps.map(e => e.dept)).size;
  const pending = leaves.filter(l => l.status === 'Pending').length;
  const todayAtt = Object.values(att).filter(a => a[today]?.clockIn).length;

  document.getElementById('adminStats').innerHTML = `
    <div class="stat-card"><span class="stat-icon">👥</span><div class="stat-text"><div class="stat-val">${total}</div><div class="stat-lbl">Total Employees</div></div></div>
    <div class="stat-card teal"><span class="stat-icon">✅</span><div class="stat-text"><div class="stat-val">${active}</div><div class="stat-lbl">Active Staff</div></div></div>
    <div class="stat-card"><span class="stat-icon">🏢</span><div class="stat-text"><div class="stat-val">${depts}</div><div class="stat-lbl">Departments</div></div></div>
    <div class="stat-card green"><span class="stat-icon">📅</span><div class="stat-text"><div class="stat-val">${todayAtt}</div><div class="stat-lbl">Present Today</div></div></div>
    <div class="stat-card red"><span class="stat-icon">🏖️</span><div class="stat-text"><div class="stat-val">${pending}</div><div class="stat-lbl">Pending Leaves</div></div></div>
  `;

  // Working hours list
  const hwList = document.getElementById('empHoursList');
  if (!emps.length) {
    hwList.innerHTML = `<div class="empty" style="padding:24px">No employees yet</div>`;
  } else {
    hwList.innerHTML = emps.map(e => {
      const empAtt = att[e.id] || {};
      const todayRec = empAtt[today] || {};
      const hrs = calcHours(todayRec.clockIn, todayRec.clockOut);
      const isActive = todayRec.clockIn && !todayRec.clockOut;
      const isDone = todayRec.clockIn && todayRec.clockOut;
      const photoHtml = e.photo
        ? `<img src="${e.photo}" alt="">`
        : `<span>${e.name[0]}</span>`;
      return `
        <div class="ehl-item">
          <div class="ehl-avatar">${photoHtml}</div>
          <div style="flex:1">
            <div class="ehl-name">${e.name}</div>
            <div class="ehl-dept">${e.dept} · ${e.pos}</div>
          </div>
          <div class="ehl-time">
            <div class="ehl-hours">${hrs === '—' ? '—' : hrs}</div>
            <div class="ehl-clk">
              ${todayRec.clockIn ? `In: ${todayRec.clockIn}` : 'Not in'}
              ${todayRec.clockOut ? ` | Out: ${todayRec.clockOut}` : ''}
            </div>
          </div>
          <div class="ehl-status-dot ${isActive ? 'active' : isDone ? 'done' : ''}"></div>
        </div>
      `;
    }).join('');
  }

  // Leave requests panel
  const pendingLeaves = leaves.filter(l => l.status === 'Pending');
  const pendingCountEl = document.getElementById('pendingLeaveCount');
  if (pendingCountEl) pendingCountEl.textContent = `${pendingLeaves.length} pending`;

  const dashLeavePanel = document.getElementById('dashLeavePanel');
  if (!pendingLeaves.length) {
    dashLeavePanel.innerHTML = `<div class="empty" style="padding:24px"><span class="empty-icon">🏖️</span>No pending leave requests</div>`;
  } else {
    dashLeavePanel.innerHTML = `<div class="leave-panel">${pendingLeaves.slice(0,4).map((l, ri) => {
      const realIdx = leaves.indexOf(l);
      const days = Math.max(1, Math.round((new Date(l.to)-new Date(l.from))/(864e5))+1);
      return `
        <div class="leave-request-card">
          <div class="lrc-top">
            <div class="lrc-avatar">${(l.empName||'?')[0]}</div>
            <div>
              <div class="lrc-name">${l.empName || l.empId}</div>
              <div class="lrc-type">${l.type} · ${days} day${days>1?'s':''}</div>
            </div>
            <span class="badge badge-pending" style="margin-left:auto">Pending</span>
          </div>
          <div class="lrc-dates">📅 ${fmtDate(l.from)} → ${fmtDate(l.to)}</div>
          <div class="lrc-reason">${l.reason}</div>
          <div class="lrc-actions">
            <button class="btn btn-success btn-sm" onclick="updateLeave(${realIdx},'Approved');renderAdminDashboard()">✓ Approve</button>
            <button class="btn btn-danger btn-sm" onclick="updateLeave(${realIdx},'Rejected');renderAdminDashboard()">✗ Reject</button>
          </div>
        </div>
      `;
    }).join('')}</div>
    ${pendingLeaves.length > 4 ? `<div style="padding:12px 16px;font-size:.82rem;color:var(--text3)">+${pendingLeaves.length-4} more — <a href="#" onclick="navigateTo('pg-admin-leaves')" style="color:var(--accent)">View all</a></div>` : ''}`;
  }
}

// =================== ADMIN TASKS PAGE ===================
function renderAdminTasks() {
  const emps = LS.get('spms_employees') || [];
  const allDepts = [...new Set(emps.map(e => e.dept))];
  const deptBtns = document.getElementById('deptButtons');
  if (deptBtns) {
    deptBtns.innerHTML = allDepts.map(d =>
      `<button class="dept-btn" onclick="selectDeptForAssign('${d}', this)">${d}</button>`
    ).join('');
  }
  renderAllTaskResponses();
}

function switchTaskTab(tab) {
  document.getElementById('ptab-assign').classList.toggle('active', tab === 'assign');
  document.getElementById('ptab-responses').classList.toggle('active', tab === 'responses');
  document.getElementById('task-tab-assign').style.display = tab === 'assign' ? 'block' : 'none';
  document.getElementById('task-tab-responses').style.display = tab === 'responses' ? 'block' : 'none';
  if (tab === 'responses') renderAllTaskResponses();
}

function renderAllTaskResponses() {
  const tasks = LS.get('spms_tasks') || {};
  const emps = LS.get('spms_employees') || [];
  const container = document.getElementById('allTaskResponsesList');
  if (!container) return;

  const allEntries = [];
  Object.entries(tasks).forEach(([empId, empTasks]) => {
    const emp = emps.find(e => e.id === empId);
    empTasks.forEach((t, idx) => {
      allEntries.push({ ...t, empId, empName: emp ? emp.name : empId, empDept: emp ? emp.dept : '', taskIdx: idx });
    });
  });
  allEntries.sort((a,b) => new Date(b.assignedOn) - new Date(a.assignedOn));

  const total = allEntries.length;
  const responded = allEntries.filter(t => t.response).length;
  const done = allEntries.filter(t => t.status === 'Done').length;
  const sub = document.getElementById('taskRespSubtitle');
  if (sub) sub.textContent = total + ' total · ' + responded + ' responded · ' + done + ' completed';

  if (!allEntries.length) {
    container.innerHTML = '<div class="empty"><span class="empty-icon">📋</span>No tasks assigned yet</div>';
    return;
  }

  const rLabel = { yes:'✅ Yes, can complete', partial:'⚡ Partially', no:'❌ Needs help' };
  const eLabel = { '1d':'Today', '2-3d':'2–3 Days', '1w':'1 Week', more:'More time needed' };
  const sColor = { 'Pending':'var(--amber)', 'In Progress':'var(--teal)', 'Done':'var(--green)', 'Blocked':'var(--red)' };

  container.innerHTML = allEntries.map(t => {
    const sc = sColor[t.status] || 'var(--border)';
    return `<div style="background:var(--card2);border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px;border-left:4px solid ${sc}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:10px">
        <div>
          <div style="font-weight:700;font-size:.98rem">${t.title}</div>
          <div style="font-size:.78rem;color:var(--text3);margin-top:3px">
            👤 ${t.empName} · ${t.empDept} &nbsp;|&nbsp; Assigned: ${fmtDate(t.assignedOn)}
            ${t.deadline ? ' &nbsp;|&nbsp; Deadline: ' + fmtDate(t.deadline) : ''}
          </div>
        </div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <span class="badge" style="background:${sc}22;color:${sc};border:1px solid ${sc}44">${t.status}</span>
          <span class="badge" style="background:var(--surface3)">${t.priority}</span>
          ${t.status !== 'Done' ? `<button class="btn btn-success btn-sm" onclick="markTaskDoneAdmin('${t.empId}',${t.taskIdx})">✓ Mark Done</button>` : ''}
        </div>
      </div>
      <div style="font-size:.85rem;color:var(--text2);margin-bottom:10px">${t.desc}</div>
      ${t.response ? `
        <div style="background:var(--surface);border:1px solid var(--border2);border-radius:10px;padding:14px;margin-top:8px">
          <div style="font-size:.72rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">💬 Employee Response</div>
          <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:8px">
            <div><span style="font-size:.72rem;color:var(--text3)">Can Complete?</span><br><span style="font-weight:600;font-size:.88rem">${rLabel[t.response] || t.response}</span></div>
            ${t.eta ? '<div><span style="font-size:.72rem;color:var(--text3)">ETA</span><br><span style="font-weight:600;font-size:.88rem">' + (eLabel[t.eta] || t.eta) + '</span></div>' : ''}
          </div>
          ${t.responseNote ? `<div style="font-size:.84rem;color:var(--text2);padding:10px;background:var(--card2);border-radius:8px">"${t.responseNote}"</div>` : ''}
        </div>
      ` : '<div style="font-size:.82rem;color:var(--text3);padding:10px;border:1px dashed var(--border2);border-radius:8px;text-align:center">⏳ No response yet from employee</div>'}
    </div>`;
  }).join('');
}

function markTaskDoneAdmin(empId, taskIdx) {
  const tasks = LS.get('spms_tasks') || {};
  if (tasks[empId] && tasks[empId][taskIdx]) {
    tasks[empId][taskIdx].status = 'Done';
    LS.set('spms_tasks', tasks);
    toast('Task marked as Done ✅', 'success');
    renderAllTaskResponses();
    setupSidebar();
  }
}

function selectDeptForAssign(dept, btn) {
  document.querySelectorAll('.dept-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const emps = LS.get('spms_employees') || [];
  const tasks = LS.get('spms_tasks') || {};
  const deptEmps = emps.filter(e => e.dept === dept && e.status === 'Active');
  const list = document.getElementById('assignEmpList');
  if (!deptEmps.length) {
    list.innerHTML = `<div class="empty" style="padding:24px;grid-column:1/-1">No active employees in ${dept}</div>`;
    return;
  }
  list.innerHTML = deptEmps.map(e => {
    const myTasks = (tasks[e.id] || []).filter(t => t.status !== 'Done').length;
    const photoHtml = e.photo ? `<img src="${e.photo}" alt="">` : `<span>${e.name[0]}</span>`;
    return `
      <div class="assign-emp-card">
        <div class="aec-avatar">${photoHtml}</div>
        <div class="aec-info">
          <div class="aec-name">${e.name}</div>
          <div class="aec-id">${e.id}</div>
          <div class="aec-tasks">${myTasks > 0 ? `${myTasks} active task${myTasks>1?'s':''}` : 'No active tasks'}</div>
        </div>
        <button class="aec-btn" onclick="openAssignTask('${e.id}', '${e.name}')">Assign</button>
      </div>
    `;
  }).join('');
}

function openAssignTask(empId, empName) {
  document.getElementById('assignTaskEmpId').value = empId;
  document.getElementById('assignTaskBody').innerHTML = `
    <div style="margin-bottom:18px;padding:12px 16px;background:var(--card2);border-radius:10px;border:1px solid var(--border)">
      <div style="font-size:.78rem;color:var(--text3);margin-bottom:2px">Assigning task to</div>
      <div style="font-weight:700">${empName}</div>
    </div>
    <div class="form-grid">
      <div class="fld form-full"><label>Task Title *</label><input type="text" id="atTitle" placeholder="e.g. Fix login bug"></div>
      <div class="fld form-full"><label>Description *</label><textarea id="atDesc" placeholder="Detailed task description..." style="min-height:80px"></textarea></div>
      <div class="fld"><label>Priority</label>
        <select id="atPriority">
          <option value="Normal">Normal</option>
          <option value="Urgent">Urgent</option>
          <option value="Low">Low</option>
        </select>
      </div>
      <div class="fld"><label>Deadline *</label><input type="date" id="atDeadline"></div>
    </div>
  `;
  openModal('assignTaskModal');
}

function saveAssignedTask() {
  const empId = document.getElementById('assignTaskEmpId').value;
  const title = v('atTitle'), desc = v('atDesc'), priority = v('atPriority'), deadline = v('atDeadline');
  if (!title || !desc || !deadline) { toast('Fill all task fields', 'error'); return; }
  const tasks = LS.get('spms_tasks') || {};
  if (!tasks[empId]) tasks[empId] = [];
  tasks[empId].push({
    title, desc, priority, deadline,
    status: 'Pending', assignedOn: todayStr(),
    response: null, responseNote: ''
  });
  LS.set('spms_tasks', tasks);
  closeModal('assignTaskModal');
  toast('Task assigned successfully! 📋', 'success');
  setupSidebar();
}

// =================== ADMIN LEAVES PAGE ===================
function renderAdminLeaves() {
  const leaves = LS.get('spms_leaves') || [];
  const pending = leaves.filter(l => l.status === 'Pending').length;
  const countEl = document.getElementById('allLeaveCount');
  if (countEl) countEl.textContent = `${pending} pending`;

  const tb = document.getElementById('adminLeaveTable');
  const adminLeaves = leaves.slice().reverse();
  if (!adminLeaves.length) {
    tb.innerHTML = `<tr><td colspan="8" class="empty"><span class="empty-icon">🏖️</span>No leave requests yet</td></tr>`;
    return;
  }
  tb.innerHTML = adminLeaves.map((l,ri) => {
    const i = leaves.length - 1 - ri;
    const days = Math.max(1, Math.round((new Date(l.to)-new Date(l.from))/(864e5))+1);
    return `<tr>
      <td style="font-weight:600">${l.empName||l.empId}</td>
      <td>${l.type}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:.8rem">${fmtDate(l.from)}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:.8rem">${fmtDate(l.to)}</td>
      <td style="text-align:center">${days}</td>
      <td style="max-width:160px;color:var(--text2);font-size:.82rem">${l.reason}</td>
      <td><span class="badge badge-${l.status.toLowerCase()}">${l.status}</span></td>
      <td>${l.status==='Pending' ? `
        <button class="btn btn-success btn-sm" onclick="updateLeave(${i},'Approved')">✓ Approve</button>
        <button class="btn btn-danger btn-sm" onclick="updateLeave(${i},'Rejected')" style="margin-left:4px">✗ Reject</button>
      ` : '—'}</td>
    </tr>`;
  }).join('');
}

function updateLeave(idx, status) {
  const leaves = LS.get('spms_leaves') || [];
  leaves[idx].status = status;
  LS.set('spms_leaves', leaves);
  toast(`Leave request ${status}`, status === 'Approved' ? 'success' : 'error');
  renderAdminLeaves();
  setupSidebar();
}

// =================== EMPLOYEE MANAGEMENT ===================
function toggleEmpView() {
  const listView = document.getElementById('sv-emp-list');
  const formView = document.getElementById('sv-emp-form');
  const btn = document.getElementById('empToggleBtn');
  const isShowingList = listView.classList.contains('active');
  if (isShowingList) {
    listView.classList.remove('active');
    formView.classList.add('active');
    btn.textContent = '← Back to List';
    btn.className = 'view-toggle-btn secondary';
    autoFillCredentials();
  } else {
    formView.classList.remove('active');
    listView.classList.add('active');
    btn.textContent = '➕ Add Employee';
    btn.className = 'view-toggle-btn';
    renderEmpList();
  }
}

function renderEmpList() {
  const emps = LS.get('spms_employees') || [];
  const tb = document.getElementById('empListTable');
  if (!emps.length) {
    tb.innerHTML = `<tr><td colspan="8" class="empty"><span class="empty-icon">👥</span>No employees added</td></tr>`;
    return;
  }
  tb.innerHTML = emps.map((e,i) => `<tr>
    <td><span class="chip accent">${e.id}</span></td>
    <td style="font-weight:600">${e.name}</td>
    <td>${e.dept}</td>
    <td style="color:var(--text2)">${e.pos}</td>
    <td style="font-size:.82rem;color:var(--text3)">${fmtDate(e.joinDate)}</td>
    <td style="font-family:'JetBrains Mono',monospace;font-size:.82rem">₹${(e.salary||0).toLocaleString()}</td>
    <td><span class="badge badge-${e.status==='Active'?'active':'inactive'}">${e.status}</span></td>
    <td style="display:flex;gap:6px">
      <button class="btn btn-secondary btn-sm" onclick="openEditEmp(${i})">Edit</button>
      <button class="btn btn-danger btn-sm" onclick="deleteEmp(${i})">Delete</button>
    </td>
  </tr>`).join('');
}

function filterEmpTable(q) {
  const emps = LS.get('spms_employees') || [];
  const f = emps.filter(e =>
    e.name.toLowerCase().includes(q.toLowerCase()) ||
    e.dept.toLowerCase().includes(q.toLowerCase()) ||
    e.id.toLowerCase().includes(q.toLowerCase())
  );
  document.getElementById('empListTable').innerHTML = f.map((e,i) => `<tr>
    <td><span class="chip accent">${e.id}</span></td>
    <td style="font-weight:600">${e.name}</td>
    <td>${e.dept}</td>
    <td style="color:var(--text2)">${e.pos}</td>
    <td style="font-size:.82rem">${fmtDate(e.joinDate)}</td>
    <td style="font-family:'JetBrains Mono',monospace;font-size:.82rem">₹${(e.salary||0).toLocaleString()}</td>
    <td><span class="badge badge-${e.status==='Active'?'active':'inactive'}">${e.status}</span></td>
    <td style="display:flex;gap:6px">
      <button class="btn btn-secondary btn-sm" onclick="openEditEmp(${emps.indexOf(e)})">Edit</button>
      <button class="btn btn-danger btn-sm" onclick="deleteEmp(${emps.indexOf(e)})">Delete</button>
    </td>
  </tr>`).join('') || `<tr><td colspan="8" class="empty">No results</td></tr>`;
}

function previewPhoto(input, previewId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById(previewId);
    img.src = e.target.result; img.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function getPhotoFromInput(inputId) {
  return new Promise(res => {
    const f = document.getElementById(inputId).files[0];
    if (!f) return res(null);
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.readAsDataURL(f);
  });
}

// =================== AUTO FILL CREDENTIALS ===================
function toggleEmpPassVis() {
  const inp = document.getElementById('nEmpPass');
  const btn = document.getElementById('empPassToggle');
  if (!inp) return;
  if (inp.type === 'text') { inp.type = 'password'; btn.textContent = '👁'; }
  else { inp.type = 'text'; btn.textContent = '🙈'; }
}

function autoFillCredentials() {
  const name = document.getElementById('nEmpName').value.trim();
  const email = document.getElementById('nEmpEmail').value.trim();
  const phone = document.getElementById('nEmpPhone').value.trim();
  const userField = document.getElementById('nEmpUser');
  const passField = document.getElementById('nEmpPass');

  if (name || email) {
    let username = '';
    if (name) {
      const parts = name.toLowerCase().split(' ');
      username = parts.length >= 2 ? parts[0] + '.' + parts[parts.length-1] : parts[0];
      username = username.replace(/[^a-z0-9.]/g,'');
    } else if (email) {
      username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9.]/g,'');
    }
    if (username && (!userField.value || userField.dataset.autoSet === '1')) {
      userField.value = username; userField.dataset.autoSet = '1';
      userField.classList.add('auto-generated');
    }

    let password = '';
    if (phone.length >= 4 && name) {
      const nameP = name.replace(/\s/g,'').slice(0,3).toLowerCase();
      password = nameP + '@' + phone.slice(-4) + '!';
    } else if (phone.length >= 4) {
      password = 'Pass@' + phone.slice(-4);
    } else if (name) {
      password = name.replace(/\s/g,'').slice(0,4).toLowerCase() + '@' + Math.floor(1000+Math.random()*9000);
    }
    if (password && (!passField.value || passField.dataset.autoSet === '1')) {
      passField.value = password; passField.dataset.autoSet = '1';
      passField.classList.add('auto-generated');
      // Keep as visible text so admin can see it
      passField.type = 'text';
      const btn = document.getElementById('empPassToggle');
      if (btn) btn.textContent = '🙈';
    }
  }

  const idField = document.getElementById('nEmpId');
  if (!idField.value) {
    const emps = LS.get('spms_employees') || [];
    idField.value = 'EMP' + String(emps.length + 1).padStart(3,'0');
  }
  updateLiveIdCard();
}

function updateLiveIdCard() {
  const name = document.getElementById('nEmpName').value.trim();
  const empId = document.getElementById('nEmpId').value.trim();
  const dept = document.getElementById('nEmpDept').value;
  const pos = document.getElementById('nEmpPos').value.trim();
  const phone = document.getElementById('nEmpPhone').value.trim();
  const username = document.getElementById('nEmpUser').value.trim();
  const pass = document.getElementById('nEmpPass').value;
  const photoEl = document.getElementById('nPhotoPreview');

  if (!name && !empId) { document.getElementById('liveIdCardWrap').style.display='none'; return; }
  document.getElementById('liveIdCardWrap').style.display = 'block';

  const photoHtml = (photoEl && photoEl.style.display !== 'none' && photoEl.src)
    ? `<img src="${photoEl.src}" alt="photo">` : `<span style="font-size:2rem">${name ? name[0].toUpperCase() : '?'}</span>`;

  document.getElementById('liveIdCard').innerHTML = `
    <div class="id-card-top">
      <div class="id-card-company">SPMS Corp</div>
      <div class="id-card-sub">Software Personnel Management</div>
    </div>
    <div class="id-card-body" style="text-align:center">
      <div class="id-photo-wrap" style="margin:0 auto 12px">${photoHtml}</div>
      <div class="id-name">${name || '—'}</div>
      <div class="id-position">${pos || dept || '—'}</div>
      <div class="id-divider"></div>
      <div style="text-align:left">
        <div class="id-row"><span class="ik">Emp ID</span><span class="iv">${empId||'—'}</span></div>
        <div class="id-row"><span class="ik">Department</span><span class="iv">${dept||'—'}</span></div>
        <div class="id-row"><span class="ik">Phone</span><span class="iv">${phone ? '+91 '+phone : '—'}</span></div>
        <div class="id-row"><span class="ik">Username</span><span class="iv" style="color:var(--teal)">${username||'—'}</span></div>
        <div class="id-row"><span class="ik">Password</span><span class="iv" style="color:var(--amber)">${pass ? '●'.repeat(Math.min(pass.length,8)) : '—'}</span></div>
      </div>
      <div class="id-code">${empId || '— — —'}</div>
    </div>
  `;
}

// =================== EMAILJS SETUP ===================
// TWO SEPARATE EmailJS configs:
// 1. EMPLOYEE config — sends login credentials to new employees
// 2. JOBS config — sends interview/rejection emails to applicants

const EMAILJS_EMPLOYEE = {
  publicKey:  'Rz2j8Bjcn93-KFkk4',
  serviceId:  'service_uxuma59',
  templateId: 'template_1s73sfh',
};

const EMAILJS_JOBS = {
  publicKey:  'EHlYVNY49NaMkxnm1',
  serviceId:  'service_qnfsg2p',
  templateIdInterview: 'template_6gbsbbf',
  templateIdReject:    'template_3j1a8gw',
};

// EmailJS v4: DO NOT call emailjs.init() globally.
// Pass publicKey directly in each send() call — this is the correct v4 pattern.
// Calling init() once globally locks the key for ALL sends, breaking multi-account use.

async function sendCredentialsEmail(emp, password) {
  if (typeof emailjs === 'undefined') {
    console.warn('EmailJS SDK not loaded');
    showCredentialsModal(emp, password);
    return;
  }
  try {
    await emailjs.send(
      EMAILJS_EMPLOYEE.serviceId,
      EMAILJS_EMPLOYEE.templateId,
      {
        to_name:     emp.name,
        to_email:    emp.email,
        employee_id: emp.id,
        username:    emp.username,
        password:    password,
        department:  emp.dept,
        position:    emp.pos,
        company:     'SPMS Corp',
      },
      { publicKey: EMAILJS_EMPLOYEE.publicKey }
    );
    toast('✉️ Credentials emailed to ' + emp.email, 'success');
  } catch(err) {
    console.error('EmailJS employee error:', err);
    showCredentialsModal(emp, password);
  }
}

async function sendInterviewEmail(applicant, vacTitle, isSelected) {
  if (typeof emailjs === 'undefined') {
    toast(isSelected ? '✅ Selected for interview.' : '❌ Application rejected.', 'info');
    return;
  }
  try {
    const templateId = isSelected
      ? EMAILJS_JOBS.templateIdInterview
      : EMAILJS_JOBS.templateIdReject;
    await emailjs.send(
      EMAILJS_JOBS.serviceId,
      templateId,
      {
        to_name:   applicant.name,
        to_email:  applicant.email,
        job_title: vacTitle,
        company:   'SPMS Corp',
        message:   isSelected
          ? 'Congratulations! You have been shortlisted for an interview. Our team will be in touch with next steps.'
          : 'Thank you for your interest. After careful review, we will not be moving forward with your application at this time.',
      },
      { publicKey: EMAILJS_JOBS.publicKey }
    );
    toast((isSelected ? '🎉 Interview email sent to ' : '📧 Email sent to ') + applicant.email, 'success');
  } catch(err) {
    console.error('EmailJS jobs error:', err);
    toast('Status updated. Email failed — check EmailJS dashboard for errors.', 'error');
  }
}

function showCredentialsModal(emp, password) {
  // Show credentials in a popup since EmailJS not configured
  const existing = document.getElementById('credModal');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.id = 'credModal';
  div.className = 'modal-overlay open';
  div.innerHTML = `
    <div class="modal" style="max-width:480px">
      <div class="modal-hdr">
        <h3>🎉 Employee Added Successfully</h3>
        <button class="modal-close" onclick="document.getElementById('credModal').remove()">✕</button>
      </div>
      <div style="margin-bottom:16px;padding:16px;background:rgba(32,232,136,0.06);border:1px solid rgba(32,232,136,0.2);border-radius:12px">
        <div style="font-size:.78rem;color:var(--text3);margin-bottom:10px;text-transform:uppercase;letter-spacing:1px">Employee Credentials</div>
        <div style="display:grid;gap:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--card2);border-radius:8px">
            <span style="font-size:.82rem;color:var(--text3)">Name</span>
            <span style="font-weight:700">${emp.name}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--card2);border-radius:8px">
            <span style="font-size:.82rem;color:var(--text3)">Employee ID</span>
            <span style="font-weight:700;color:var(--accent);font-family:'JetBrains Mono',monospace">${emp.id}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--card2);border-radius:8px">
            <span style="font-size:.82rem;color:var(--text3)">Username</span>
            <span style="font-weight:700;color:var(--teal);font-family:'JetBrains Mono',monospace">${emp.username}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--card2);border-radius:8px">
            <span style="font-size:.82rem;color:var(--text3)">Password</span>
            <span style="font-weight:700;color:var(--amber);font-family:'JetBrains Mono',monospace">${password}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--card2);border-radius:8px">
            <span style="font-size:.82rem;color:var(--text3)">Email</span>
            <span style="font-weight:600;font-size:.85rem">${emp.email}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--card2);border-radius:8px">
            <span style="font-size:.82rem;color:var(--text3)">Phone</span>
            <span style="font-weight:600">+91 ${emp.phone}</span>
          </div>
        </div>
      </div>
      <button class="btn btn-primary" style="width:100%" onclick="copyCredentials('${emp.name}','${emp.id}','${emp.username}','${password}','${emp.email}','+91 ${emp.phone}')">📋 Copy Credentials</button>
    </div>
  `;
  document.body.appendChild(div);
  div.addEventListener('click', e => { if(e.target===div) div.remove(); });
}

function copyCredentials(name, id, username, password, email, phone) {
  const text = `SPMS Corp — Employee Credentials\n\nName: ${name}\nEmployee ID: ${id}\nUsername: ${username}\nPassword: ${password}\nEmail: ${email}\nPhone: ${phone}\n\nLogin at your SPMS portal with these credentials.`;
  navigator.clipboard.writeText(text).then(() => toast('Credentials copied to clipboard! 📋', 'success'));
}

async function addEmployee() {
  const id = v('nEmpId'), name = v('nEmpName'), dob = v('nEmpDob'),
        email = v('nEmpEmail'), phone = v('nEmpPhone'), dept = v('nEmpDept'),
        pos = v('nEmpPos'), sal = v('nEmpSal'), join = v('nEmpJoin'),
        status = v('nEmpStatus'), username = v('nEmpUser'),
        addr = v('nEmpAddr');

  // Get password from field (could be text or password type)
  const passField = document.getElementById('nEmpPass');
  const password = (passField?.value || '').trim();

  if (!id||!name||!dob||!email||!phone||!dept||!pos||!sal||!join||!username||!password||!addr) {
    toast('Please fill all required fields', 'error'); return;
  }
  if (phone.length !== 10) { toast('Phone must be 10 digits', 'error'); return; }
  const emps = LS.get('spms_employees') || [];
  if (emps.find(e => e.id === id)) { toast('Employee ID already exists', 'error'); return; }
  if (emps.find(e => e.username === username)) { toast('Username already taken', 'error'); return; }
  if (emps.length >= 50) { toast('Maximum 50 employees limit reached', 'error'); return; }

  const photo = await getPhotoFromInput('nEmpPhoto');
  const newEmp = { id, name, dob, email, phone, dept, pos, salary: parseFloat(sal), joinDate: join, status, username, password, addr, photo };
  emps.push(newEmp);
  LS.set('spms_employees', emps);

  resetAddForm();
  toggleEmpView(); // go back to list

  // Send credentials via EmailJS or show modal
  await sendCredentialsEmail(newEmp, password);
}

function resetAddForm() {
  ['nEmpId','nEmpName','nEmpDob','nEmpEmail','nEmpPhone','nEmpDept','nEmpPos','nEmpSal','nEmpJoin','nEmpStatus','nEmpUser','nEmpPass','nEmpAddr'].forEach(id => {
    const el = document.getElementById(id);
    if(el) { el.value = ''; delete el.dataset.autoSet; el.classList.remove('auto-generated'); }
  });
  const img = document.getElementById('nPhotoPreview'); if(img) img.style.display='none';
  const photoInp = document.getElementById('nEmpPhoto'); if(photoInp) photoInp.value='';
  document.getElementById('liveIdCardWrap').style.display = 'none';
}

function openEditEmp(i) {
  const emps = LS.get('spms_employees') || [];
  const e = emps[i];
  document.getElementById('editEmpIdx').value = i;
  document.getElementById('eEmpId').value = e.id;
  document.getElementById('eEmpName').value = e.name;
  document.getElementById('eEmpDob').value = e.dob || '';
  document.getElementById('eEmpEmail').value = e.email;
  document.getElementById('eEmpPhone').value = e.phone;
  document.getElementById('eEmpDept').value = e.dept;
  document.getElementById('eEmpPos').value = e.pos;
  document.getElementById('eEmpSal').value = e.salary;
  document.getElementById('eEmpJoin').value = e.joinDate;
  document.getElementById('eEmpStatus').value = e.status;
  document.getElementById('eEmpUser').value = e.username;
  document.getElementById('eEmpPass').value = '';
  document.getElementById('eEmpAddr').value = e.addr;
  const prev = document.getElementById('ePhotoPreview');
  if (e.photo) { prev.src = e.photo; prev.style.display = 'block'; }
  else { prev.style.display = 'none'; }
  openModal('editEmpModal');
}

async function saveEditEmployee() {
  const i = parseInt(document.getElementById('editEmpIdx').value);
  const emps = LS.get('spms_employees') || [];
  const name = v('eEmpName'), dob = v('eEmpDob'), email = v('eEmpEmail'),
        phone = v('eEmpPhone'), dept = v('eEmpDept'), pos = v('eEmpPos'),
        sal = v('eEmpSal'), join = v('eEmpJoin'), status = v('eEmpStatus'),
        username = v('eEmpUser'), addr = v('eEmpAddr');
  if (!name||!dob||!email||!phone||!dept||!pos||!sal||!join||!username||!addr) {
    toast('Fill all required fields', 'error'); return;
  }
  const newPhoto = await getPhotoFromInput('eEmpPhoto');
  const prev = document.getElementById('ePhotoPreview');
  emps[i] = { ...emps[i], name, dob, email, phone, dept, pos, salary: parseFloat(sal), joinDate: join, status, username, addr };
  if (v('eEmpPass')) emps[i].password = v('eEmpPass');
  if (newPhoto) emps[i].photo = newPhoto;
  else if (prev.style.display !== 'none' && prev.src) emps[i].photo = prev.src;
  LS.set('spms_employees', emps);
  closeModal('editEmpModal');
  toast('Employee updated!', 'success');
  renderEmpList();
  if (currentUser.role === 'employee' && emps[i].id === currentUser.empId) setupSidebar();
}

function deleteEmp(i) {
  if (!confirm('Delete this employee? This cannot be undone.')) return;
  const emps = LS.get('spms_employees') || [];
  emps.splice(i,1);
  LS.set('spms_employees', emps);
  toast('Employee removed', 'info');
  renderEmpList();
}

// =================== VACANCIES ===================
function toggleVacView() {
  const listView = document.getElementById('sv-vac-list');
  const formView = document.getElementById('sv-vac-form');
  const btn = document.getElementById('vacToggleBtn');
  const isShowingList = listView.classList.contains('active');
  if (isShowingList) {
    listView.classList.remove('active');
    formView.classList.add('active');
    btn.textContent = '← Back to List';
    btn.className = 'view-toggle-btn secondary';
  } else {
    formView.classList.remove('active');
    listView.classList.add('active');
    btn.textContent = '➕ Add Vacancy';
    btn.className = 'view-toggle-btn';
    document.getElementById('vacFormTitle').textContent = 'Post New Vacancy';
    document.getElementById('editVacancyIdx').value = '';
    resetVacForm();
    renderVacancies();
  }
}

function renderVacancies() {
  const vacs = LS.get('spms_vacancies') || [];
  const referrals = LS.get('spms_referrals') || [];
  const grid = document.getElementById('vacancyGrid');
  if (!vacs.length) {
    grid.innerHTML = `<div class="empty"><span class="empty-icon">💼</span>No vacancies posted yet</div>`;
    return;
  }
  grid.innerHTML = vacs.map((vac,i) => {
    const applicants = referrals.filter(r => r.vacId === vac.id);
    return `
      <div class="vacancy-card" onclick="showAdminVacDetail(${i})">
        <div class="v-role">${vac.title}</div>
        <div class="v-dept">${vac.dept} · ${vac.loc}</div>
        <div class="v-meta">
          <span class="v-tag">💰 ${vac.salary}</span>
          <span class="v-tag">⏱ ${vac.exp}</span>
          <span class="v-tag">📄 ${vac.type}</span>
          <span class="v-tag">👤 ${vac.openings} Opening${vac.openings>1?'s':''}</span>
        </div>
        <div style="font-size:.78rem;color:var(--text3);margin-bottom:10px">Deadline: ${fmtDate(vac.deadline)}</div>
        ${applicants.length ? `<div class="v-appliers-count">📥 ${applicants.length} application${applicants.length>1?'s':''}</div>` : ''}
        <div class="v-actions" onclick="event.stopPropagation()">
          <button class="btn btn-secondary btn-sm" onclick="editVacancy(${i})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteVacancy(${i})">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function showAdminVacDetail(i) {
  const vacs = LS.get('spms_vacancies') || [];
  const referrals = LS.get('spms_referrals') || [];
  const vac = vacs[i];
  const applicants = referrals.filter(r => r.vacId === vac.id);
  const referred = applicants.filter(r => r.referredBy);
  const external = applicants.filter(r => !r.referredBy);

  document.getElementById('vacModalTitle').textContent = vac.title;
  document.getElementById('vacModalBody').innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">
      <span class="v-tag">🏢 ${vac.dept}</span>
      <span class="v-tag">📍 ${vac.loc}</span>
      <span class="v-tag">💰 ${vac.salary}</span>
      <span class="v-tag">⏱ ${vac.exp}</span>
      <span class="v-tag">📄 ${vac.type}</span>
      <span class="v-tag">👤 ${vac.openings} Opening${vac.openings>1?'s':''}</span>
    </div>
    <div style="font-size:.78rem;color:var(--text3);margin-bottom:10px">Deadline: ${fmtDate(vac.deadline)}</div>
    <div style="display:flex;gap:8px;margin-bottom:20px">
      <button class="btn btn-secondary btn-sm" onclick="editVacancy(${i});closeModal('vacDetailModal')">✏️ Edit Vacancy</button>
      <button class="btn btn-teal btn-sm" onclick="openDeadlineEdit('vac',${i})">📅 Change Deadline</button>
    </div>
    <div class="section-label">Job Description</div>
    <p style="font-size:.88rem;color:var(--text2);line-height:1.7;margin-bottom:16px">${vac.desc}</p>
    <div class="section-label">Requirements</div>
    <p style="font-size:.88rem;color:var(--text2);line-height:1.7;margin-bottom:20px">${vac.req}</p>
    <div class="section-label">Applications (${applicants.length})</div>
    ${!applicants.length ? `<div style="padding:16px;color:var(--text3);font-size:.85rem">No applications yet. Share the public job portal to get applicants.</div>` : ''}
    ${referred.length ? `
      <div style="font-size:.78rem;font-weight:700;color:var(--amber);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">⭐ Employee Referrals</div>
      ${referred.map(a => renderApplicantCard(a, true, vac.title)).join('')}
    ` : ''}
    ${external.length ? `
      <div style="font-size:.78rem;font-weight:700;color:var(--text3);margin-bottom:8px;margin-top:12px;text-transform:uppercase;letter-spacing:1px">Direct Applications</div>
      ${external.map(a => renderApplicantCard(a, false, vac.title)).join('')}
    ` : ''}
    <div style="margin-top:16px;padding:12px;background:var(--card2);border-radius:10px;font-size:.82rem;color:var(--text3)">
      💡 Public job portal: <a href="jobs.html" target="_blank" style="color:var(--accent)">jobs.html</a> — Share with candidates
    </div>
  `;
  openModal('vacDetailModal');
}

function renderApplicantCard(a, isReferred, vacTitle, applicantIdx) {
  const statusColors = { 'Pending':'var(--amber)', 'Shortlisted':'var(--teal)', 'Interview':'var(--green)', 'Rejected':'var(--red)' };
  const appStatus = a.status || 'Pending';
  const sc = statusColors[appStatus] || 'var(--amber)';
  return `
    <div class="applicant-card ${isReferred ? 'referred' : ''}" style="border-left:3px solid ${sc}">
      <div class="ac-top">
        <div class="ac-name">${a.name} ${isReferred ? '<span class="ac-ref-badge">⭐ Referred</span>' : ''}</div>
        <span class="badge" style="background:${sc}22;color:${sc};border:1px solid ${sc}44;font-size:.72rem">${appStatus}</span>
      </div>
      <div class="ac-meta">
        <span>📧 ${a.email}</span>
        <span>📱 ${a.phone || '—'}</span>
        ${isReferred && a.referredBy ? `<span>👤 Ref by: ${a.referredBy}</span>` : ''}
        <span style="font-size:.72rem;color:var(--text3)">${fmtDate(a.appliedOn)}</span>
      </div>
      ${a.note ? `<div style="font-size:.8rem;color:var(--text2);margin-top:6px;margin-bottom:8px">"${a.note}"</div>` : ''}
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:10px">
        ${a.resumeLink ? `<a class="ac-resume" href="${a.resumeLink}" target="_blank">📄 Resume/Portfolio</a>` : ''}
        ${appStatus !== 'Interview' ? `<button class="btn btn-success btn-sm" onclick="updateApplicantStatus('${a.email}','${a.vacId}','Interview','${encodeURIComponent(vacTitle)}')">✅ Select for Interview</button>` : `<span style="color:var(--green);font-size:.82rem;font-weight:700">✅ Interview</span>`}
        ${appStatus === 'Interview' ? `<button class="btn btn-teal btn-sm" onclick="openShareResumeModal('${a.email}','${a.vacId}')">📤 Assign Interviewer</button>` : ''}
        ${appStatus !== 'Rejected' ? `<button class="btn btn-danger btn-sm" onclick="updateApplicantStatus('${a.email}','${a.vacId}','Rejected','${encodeURIComponent(vacTitle)}')">❌ Reject</button>` : `<span style="color:var(--red);font-size:.82rem;font-weight:700">❌ Rejected</span>`}
      </div>
    </div>
  `;
}

async function updateApplicantStatus(email, vacId, newStatus, encodedVacTitle) {
  const vacTitle = decodeURIComponent(encodedVacTitle);
  const referrals = LS.get('spms_referrals') || [];
  const idx = referrals.findIndex(r => r.email === email && r.vacId === vacId);
  if (idx < 0) { toast('Applicant not found', 'error'); return; }

  referrals[idx].status = newStatus;
  LS.set('spms_referrals', referrals);

  const applicant = referrals[idx];
  const isSelected = newStatus === 'Interview';

  // Send email via EmailJS Jobs config
  await sendInterviewEmail(applicant, vacTitle, isSelected);

  // Refresh the modal
  const vacs = LS.get('spms_vacancies') || [];
  const vacIdx = vacs.findIndex(v => v.id === vacId);
  if (vacIdx >= 0) showAdminVacDetail(vacIdx);
}

// ── SHARE RESUME WITH INTERVIEWER ───────────────────────
function openShareResumeModal(applicantEmail, vacId) {
  const referrals = LS.get('spms_referrals') || [];
  const applicant = referrals.find(r => r.email === applicantEmail && r.vacId === vacId);
  const emps = LS.get('spms_employees') || [];
  const vacs = LS.get('spms_vacancies') || [];
  const vac = vacs.find(v => v.id === vacId);
  if (!applicant) return;

  const existing = document.getElementById('shareResumeModal');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.id = 'shareResumeModal';
  div.className = 'modal-overlay open';
  div.innerHTML = `
    <div class="modal" style="max-width:520px">
      <div class="modal-hdr">
        <h3>📤 Assign Interview Task</h3>
        <button class="modal-close" onclick="document.getElementById('shareResumeModal').remove()">✕</button>
      </div>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;margin-bottom:18px">
        <div style="font-size:.7rem;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">Applicant</div>
        <div style="font-weight:700;color:var(--text)">${applicant.name}</div>
        <div style="font-size:.8rem;color:var(--text3)">📧 ${applicant.email} · ${vac?.title || ''}</div>
        ${applicant.resumeLink ? `<a href="${applicant.resumeLink}" target="_blank" style="font-size:.78rem;color:var(--blue);font-weight:600;display:inline-flex;align-items:center;gap:4px;margin-top:6px">📄 View Resume →</a>` : ''}
      </div>
      <div class="fld" style="margin-bottom:14px">
        <label>Assign to Employee *</label>
        <select id="shareEmpSelect" style="width:100%;padding:10px 13px;background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);color:var(--text);font-size:.88rem">
          <option value="">— Select employee —</option>
          ${emps.filter(e => e.status === 'Active').map(e => `<option value="${e.id}">${e.name} (${e.dept})</option>`).join('')}
        </select>
      </div>
      <div class="fld" style="margin-bottom:14px">
        <label>Interview Date / Deadline</label>
        <input type="date" id="shareDeadline" style="width:100%;padding:10px 13px;background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);color:var(--text);font-size:.88rem">
      </div>
      <div class="fld" style="margin-bottom:18px">
        <label>Notes for interviewer</label>
        <textarea id="shareNote" placeholder="E.g. Focus on React skills, check culture fit..." style="width:100%;padding:10px 13px;background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);color:var(--text);font-size:.88rem;min-height:70px;resize:vertical;font-family:inherit"></textarea>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-secondary" onclick="document.getElementById('shareResumeModal').remove()">Cancel</button>
        <button class="btn btn-primary" style="flex:1" onclick="confirmShareResume('${applicantEmail}','${vacId}')">Assign as Task ✓</button>
      </div>
    </div>`;
  document.body.appendChild(div);
  div.addEventListener('click', e => { if (e.target === div) div.remove(); });
}

function confirmShareResume(applicantEmail, vacId) {
  const empId = document.getElementById('shareEmpSelect').value;
  const deadline = document.getElementById('shareDeadline').value;
  const note = document.getElementById('shareNote').value.trim();
  if (!empId) { toast('Please select an employee', 'error'); return; }

  const referrals = LS.get('spms_referrals') || [];
  const applicant = referrals.find(r => r.email === applicantEmail && r.vacId === vacId);
  const vacs = LS.get('spms_vacancies') || [];
  const vac = vacs.find(v => v.id === vacId);
  const emps = LS.get('spms_employees') || [];
  const emp = emps.find(e => e.id === empId);

  // Assign as a task to the employee
  const tasks = LS.get('spms_tasks') || {};
  if (!tasks[empId]) tasks[empId] = [];
  tasks[empId].push({
    title: `Interview: ${applicant.name}`,
    desc: `Please conduct/evaluate interview for applicant: ${applicant.name}\nPosition: ${vac?.title || vacId}\nEmail: ${applicant.email}\nPhone: ${applicant.phone || '—'}\nResume: ${applicant.resumeLink || 'Not provided'}\nNote from admin: ${note || 'None'}`,
    priority: 'Urgent',
    deadline: deadline || '',
    status: 'Pending',
    assignedOn: todayStr(),
    isInterviewTask: true,
    applicantEmail,
    applicantName: applicant.name,
    resumeLink: applicant.resumeLink || '',
  });
  LS.set('spms_tasks', tasks);

  toast(`Interview task assigned to ${emp?.name}! ✅`, 'success');
  document.getElementById('shareResumeModal').remove();
  setupSidebar();
}

function saveVacancy() {
  const title = v('vTitle'), dept = v('vDept'), loc = v('vLoc'),
        salary = v('vSalary'), exp = v('vExp'), type = v('vType'),
        deadline = v('vDeadline'), openings = v('vOpenings'), desc = v('vDesc'), req = v('vReq');
  if (!title||!dept||!loc||!salary||!exp||!type||!deadline||!openings||!desc||!req) {
    toast('Fill all vacancy fields', 'error'); return;
  }
  const vacs = LS.get('spms_vacancies') || [];
  const editIdx = document.getElementById('editVacancyIdx').value;
  const entry = { title, dept, loc, salary, exp, type, deadline, openings: parseInt(openings), desc, req };
  if (editIdx !== '') {
    entry.id = vacs[parseInt(editIdx)].id;
    vacs[parseInt(editIdx)] = entry;
    toast('Vacancy updated!', 'success');
  } else {
    entry.id = 'V' + Date.now();
    vacs.push(entry);
    toast('Vacancy posted!', 'success');
  }
  LS.set('spms_vacancies', vacs);
  toggleVacView();
}

function editVacancy(i) {
  const vacs = LS.get('spms_vacancies') || [];
  const vac = vacs[i];
  document.getElementById('vTitle').value = vac.title;
  document.getElementById('vDept').value = vac.dept;
  document.getElementById('vLoc').value = vac.loc;
  document.getElementById('vSalary').value = vac.salary;
  document.getElementById('vExp').value = vac.exp;
  document.getElementById('vType').value = vac.type;
  document.getElementById('vDeadline').value = vac.deadline;
  document.getElementById('vOpenings').value = vac.openings;
  document.getElementById('vDesc').value = vac.desc;
  document.getElementById('vReq').value = vac.req;
  document.getElementById('editVacancyIdx').value = i;
  document.getElementById('vacFormTitle').textContent = 'Edit Vacancy';
  // Switch to form view
  const listView = document.getElementById('sv-vac-list');
  const formView = document.getElementById('sv-vac-form');
  const btn = document.getElementById('vacToggleBtn');
  listView.classList.remove('active');
  formView.classList.add('active');
  btn.textContent = '← Back to List';
  btn.className = 'view-toggle-btn secondary';
}

function resetVacForm() {
  ['vTitle','vDept','vLoc','vSalary','vExp','vType','vDeadline','vOpenings','vDesc','vReq'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value = '';
  });
  document.getElementById('editVacancyIdx').value = '';
}

function deleteVacancy(i) {
  if (!confirm('Delete this vacancy?')) return;
  const vacs = LS.get('spms_vacancies') || [];
  vacs.splice(i,1);
  LS.set('spms_vacancies', vacs);
  toast('Vacancy removed', 'info');
  renderVacancies();
}

// =================== DEADLINE CHANGE ===================
function openDeadlineEdit(type, idx) {
  document.getElementById('deadlineTaskEmpId').value = type; // reuse field to store type
  document.getElementById('deadlineTaskIdx').value = idx;
  openModal('editDeadlineModal');
}

function saveDeadlineChange() {
  const type = document.getElementById('deadlineTaskEmpId').value;
  const idx = parseInt(document.getElementById('deadlineTaskIdx').value);
  const newDate = document.getElementById('newDeadlineDate').value;
  if (!newDate) { toast('Select a date', 'error'); return; }

  if (type === 'vac') {
    const vacs = LS.get('spms_vacancies') || [];
    if (vacs[idx]) { vacs[idx].deadline = newDate; LS.set('spms_vacancies', vacs); }
    toast('Vacancy deadline updated!', 'success');
    renderVacancies();
  } else {
    // task: type = empId
    const tasks = LS.get('spms_tasks') || {};
    const empTasks = tasks[type] || [];
    if (empTasks[idx]) { empTasks[idx].deadline = newDate; tasks[type] = empTasks; LS.set('spms_tasks', tasks); }
    toast('Task deadline updated!', 'success');
  }
  closeModal('editDeadlineModal');
  closeModal('vacDetailModal');
  closeModal('assignTaskModal');
}

// =================== REPORTS ===================
function renderReports() {
  const emps = LS.get('spms_employees') || [];
  const att = LS.get('spms_attendance') || {};
  const today = todayStr();
  const leaves = LS.get('spms_leaves') || [];
  const totalSalary = emps.reduce((s,e) => s + (e.salary||0), 0);
  const avgSal = emps.length ? Math.round(totalSalary / emps.length) : 0;
  const presentToday = Object.values(att).filter(a => a[today]?.clockIn).length;

  document.getElementById('reportStats').innerHTML = `
    <div class="stat-card"><span class="stat-icon">💰</span><div class="stat-text"><div class="stat-val">₹${totalSalary.toLocaleString()}</div><div class="stat-lbl">Monthly Salary Budget</div></div></div>
    <div class="stat-card"><span class="stat-icon">📊</span><div class="stat-text"><div class="stat-val">₹${avgSal.toLocaleString()}</div><div class="stat-lbl">Avg Salary</div></div></div>
    <div class="stat-card green"><span class="stat-icon">🟢</span><div class="stat-text"><div class="stat-val">${presentToday}/${emps.length}</div><div class="stat-lbl">Present Today</div></div></div>
    <div class="stat-card red"><span class="stat-icon">🏖️</span><div class="stat-text"><div class="stat-val">${leaves.filter(l=>l.status==='Pending').length}</div><div class="stat-lbl">Pending Leaves</div></div></div>
  `;

  const deptCounts = {};
  emps.forEach(e => { deptCounts[e.dept] = (deptCounts[e.dept]||0)+1; });
  document.getElementById('deptDistribution').innerHTML = Object.entries(deptCounts).map(([d,c]) => `
    <div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;margin-bottom:7px;font-size:.88rem">
        <span>${d}</span><span style="color:var(--accent);font-weight:700">${c}</span>
      </div>
      <div style="height:6px;background:var(--surface3);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${Math.round(c/emps.length*100)}%;background:linear-gradient(90deg,var(--accent),var(--teal));border-radius:3px;transition:.4s"></div>
      </div>
    </div>
  `).join('') || '<div class="empty">No data</div>';

  document.getElementById('attendanceSummary').innerHTML = `
    <div style="text-align:center;padding:20px">
      <div style="font-family:'Fraunces',serif;font-size:3.5rem;font-weight:700;color:var(--teal)">${presentToday}</div>
      <div style="color:var(--text2);font-size:.85rem;margin-bottom:16px">employees present today</div>
      <div style="font-size:.82rem;color:var(--text3)">out of ${emps.length} total</div>
      <div style="margin-top:10px;height:10px;background:var(--surface3);border-radius:5px;overflow:hidden">
        <div style="height:100%;width:${emps.length?Math.round(presentToday/emps.length*100):0}%;background:linear-gradient(90deg,var(--teal),var(--green));border-radius:5px"></div>
      </div>
    </div>
  `;
}

// =================== EMPLOYEE DASHBOARD ===================
function renderEmpDashboard() {
  const emps = LS.get('spms_employees') || [];
  const emp = emps.find(e => e.id === currentUser.empId);
  if (!emp) return;

  const now = new Date();
  const hr = now.getHours();
  const greet = hr < 12 ? 'Good Morning' : hr < 17 ? 'Good Afternoon' : 'Good Evening';
  document.getElementById('empDashGreet').textContent = `${greet}, ${emp.name.split(' ')[0]}! 👋`;
  document.getElementById('empDashSub').textContent = now.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  const att = LS.get('spms_attendance') || {};
  const myAtt = att[emp.id] || {};
  const today = todayStr();
  const todayRec = myAtt[today] || {};

  const btnIn = document.getElementById('btnClockIn');
  const btnOut = document.getElementById('btnClockOut');
  const dot = document.getElementById('clockDot');
  const statusTxt = document.getElementById('clockStatusText');

  if (todayRec.clockIn && !todayRec.clockOut) {
    btnIn.disabled = true; btnOut.disabled = false;
    dot.className = 'clock-dot in';
    statusTxt.textContent = `Clocked in at ${todayRec.clockIn}`;
  } else if (todayRec.clockIn && todayRec.clockOut) {
    btnIn.disabled = true; btnOut.disabled = true;
    dot.className = 'clock-dot out';
    statusTxt.textContent = `Completed — Clocked out at ${todayRec.clockOut}`;
  } else {
    btnIn.disabled = false; btnOut.disabled = true;
    dot.className = 'clock-dot';
    statusTxt.textContent = 'Not clocked in today';
  }

  const todayHrs = calcHours(todayRec.clockIn, todayRec.clockOut);
  document.getElementById('todayHours').textContent = todayHrs;

  const leaves = LS.get('spms_leaves') || [];
  const myLeaves = leaves.filter(l => l.empId === emp.id);
  const approved = myLeaves.filter(l => l.status === 'Approved').length;
  const wl = LS.get('spms_worklogs') || {};
  const myWl = wl[emp.id] || [];
  const tasks = LS.get('spms_tasks') || {};
  const myTasks = tasks[emp.id] || [];
  const pendingTasks = myTasks.filter(t => t.status !== 'Done').length;

  document.getElementById('empStats').innerHTML = `
    <div class="stat-card"><span class="stat-icon">📅</span><div class="stat-text"><div class="stat-val">${Object.keys(myAtt).length}</div><div class="stat-lbl">Days Recorded</div></div></div>
    <div class="stat-card"><span class="stat-icon">🏖️</span><div class="stat-text"><div class="stat-val">${approved}</div><div class="stat-lbl">Leaves Taken</div></div></div>
    <div class="stat-card"><span class="stat-icon">📋</span><div class="stat-text"><div class="stat-val">${myWl.length}</div><div class="stat-lbl">Work Logs</div></div></div>
    <div class="stat-card red"><span class="stat-icon">⚡</span><div class="stat-text"><div class="stat-val">${pendingTasks}</div><div class="stat-lbl">Active Tasks</div></div></div>
  `;

  const tb = document.getElementById('empAttTable');
  const attEntries = Object.entries(myAtt).sort((a,b) => b[0].localeCompare(a[0])).slice(0,7);
  if (!attEntries.length) {
    tb.innerHTML = `<tr><td colspan="5" class="empty">No attendance records yet — clock in to start!</td></tr>`;
  } else {
    tb.innerHTML = attEntries.map(([date, rec]) => {
      const hrs = calcHours(rec.clockIn, rec.clockOut);
      const status = rec.clockIn ? (rec.clockOut ? `<span class="badge badge-active">Complete</span>` : `<span class="badge badge-progress">In Progress</span>`) : `<span class="badge badge-inactive">Absent</span>`;
      return `<tr>
        <td style="font-family:'JetBrains Mono',monospace;font-size:.82rem">${fmtDate(date)}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:.82rem">${rec.clockIn || '—'}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:.82rem">${rec.clockOut || '—'}</td>
        <td style="color:var(--teal);font-family:'JetBrains Mono',monospace">${hrs}</td>
        <td>${status}</td>
      </tr>`;
    }).join('');
  }
}

// =================== ATTENDANCE CLOCK ===================
function clockIn() {
  const emps = LS.get('spms_employees') || [];
  const emp = emps.find(e => e.id === currentUser.empId);
  if (!emp) return;
  const att = LS.get('spms_attendance') || {};
  if (!att[emp.id]) att[emp.id] = {};
  const today = todayStr();
  if (att[emp.id][today]?.clockIn) { toast('Already clocked in today', 'info'); return; }
  const now = new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  att[emp.id][today] = { clockIn: now };
  LS.set('spms_attendance', att);
  toast('Clocked in successfully! 🟢', 'success');
  renderEmpDashboard();
}

function clockOut() {
  const emps = LS.get('spms_employees') || [];
  const emp = emps.find(e => e.id === currentUser.empId);
  if (!emp) return;
  const att = LS.get('spms_attendance') || {};
  const today = todayStr();
  if (!att[emp.id]?.[today]?.clockIn) { toast("You haven't clocked in yet", 'error'); return; }
  const now = new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  att[emp.id][today].clockOut = now;
  LS.set('spms_attendance', att);
  const hrs = calcHours(att[emp.id][today].clockIn, now);
  toast(`Clocked out! Hours today: ${hrs} 🔴`, 'success');
  renderEmpDashboard();
}

function calcHours(inT, outT) {
  if (!inT) return '—';
  if (!outT) {
    // Calculate elapsed since clock-in
    try {
      const parse = t => { const [h,m,s] = t.split(':').map(Number); return h*3600+m*60+(s||0); };
      const nowSec = new Date().getHours()*3600+new Date().getMinutes()*60+new Date().getSeconds();
      const diff = nowSec - parse(inT);
      if (diff < 0) return 'Active';
      const h = Math.floor(diff/3600), m = Math.floor((diff%3600)/60);
      return `${h}h ${m}m`;
    } catch { return 'Active'; }
  }
  try {
    const parse = t => { const [h,m,s] = t.split(':').map(Number); return h*3600+m*60+(s||0); };
    const diff = parse(outT) - parse(inT);
    const h = Math.floor(diff/3600), m = Math.floor((diff%3600)/60);
    return `${h}h ${m}m`;
  } catch { return '—'; }
}

// =================== PROFILE / ID CARD ===================
function renderProfile() {
  const emps = LS.get('spms_employees') || [];
  const emp = emps.find(e => e.id === currentUser.empId);
  if (!emp) return;
  const photoHtml = emp.photo ? `<img src="${emp.photo}" alt="Photo">` : `<span style="font-size:2.5rem">${emp.name[0]}</span>`;

  document.getElementById('idCardWrap').innerHTML = `
    <div class="id-card">
      <div class="id-card-top">
        <div class="id-card-company">SPMS Corp</div>
        <div class="id-card-sub">Software Personnel Management</div>
      </div>
      <div class="id-card-body">
        <div class="id-photo-wrap">${photoHtml}</div>
        <div class="id-name">${emp.name}</div>
        <div class="id-position">${emp.pos}</div>
        <div class="id-divider"></div>
        <div class="id-row"><span class="ik">Employee ID</span><span class="iv">${emp.id}</span></div>
        <div class="id-row"><span class="ik">Department</span><span class="iv">${emp.dept}</span></div>
        <div class="id-row"><span class="ik">Joined</span><span class="iv">${fmtDate(emp.joinDate)}</span></div>
        <div class="id-row"><span class="ik">Email</span><span class="iv" style="word-break:break-all">${emp.email}</span></div>
        <div class="id-row"><span class="ik">Phone</span><span class="iv">+91 ${emp.phone}</span></div>
        <div class="id-row"><span class="ik">Status</span><span class="iv" style="color:var(--green)">${emp.status}</span></div>
        <div class="id-code">${emp.id} • ${emp.dept.toUpperCase().slice(0,3)}</div>
      </div>
    </div>
  `;

  document.getElementById('profileDetails').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${[['Full Name',emp.name],['Employee ID',emp.id],['Date of Birth',fmtDate(emp.dob)],['Email',emp.email],['Phone','+91 '+emp.phone],['Department',emp.dept],['Position',emp.pos],['Joining Date',fmtDate(emp.joinDate)],['Status',emp.status],['Salary','₹'+((emp.salary||0).toLocaleString())],['Address',emp.addr]].map(([k,val]) => `
        <div style="padding:10px 14px;background:var(--card2);border-radius:10px;border:1px solid var(--border)">
          <div style="font-size:.7rem;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">${k}</div>
          <div style="font-size:.9rem;font-weight:600;word-break:break-word">${val||'—'}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function downloadIDCard() {
  const emps = LS.get('spms_employees') || [];
  const emp = emps.find(e => e.id === currentUser.empId);
  if (!emp) return;

  // Build a printable ID card in a new window
  const html = `<!DOCTYPE html><html><head><title>ID Card — ${emp.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#1a1a2e;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Outfit',sans-serif}
    .card{width:320px;background:linear-gradient(145deg,#1e1e3a,#12122a);border:1px solid rgba(110,90,255,0.35);border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.7)}
    .top{background:linear-gradient(135deg,#6e5aff,#4a3bc4);padding:22px 20px 18px;text-align:center}
    .company{font-size:1.5rem;font-weight:800;color:#fff;letter-spacing:2px}
    .company-sub{font-size:.65rem;color:rgba(255,255,255,.7);letter-spacing:1px;text-transform:uppercase;margin-top:2px}
    .body{padding:24px 20px;text-align:center}
    .photo{width:90px;height:90px;border-radius:50%;border:3px solid #6e5aff;background:#2a2a4a;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:2rem;color:#a89eff;overflow:hidden;font-weight:700}
    .photo img{width:100%;height:100%;object-fit:cover}
    .name{font-size:1.15rem;font-weight:800;color:#eeeef8;margin-bottom:4px}
    .pos{font-size:.8rem;color:#a89eff;font-weight:600;margin-bottom:16px;text-transform:uppercase;letter-spacing:.5px}
    .divider{height:1px;background:rgba(110,90,255,.25);margin:0 0 16px}
    .row{display:flex;justify-content:space-between;margin-bottom:8px;font-size:.78rem}
    .row .key{color:#42426a;font-weight:600}
    .row .val{color:#eeeef8;font-weight:700;text-align:right;max-width:180px}
    .code{font-family:monospace;font-size:.7rem;color:#42426a;margin-top:18px;padding-top:14px;border-top:1px solid rgba(110,90,255,.15)}
    @media print{body{background:#fff}.card{box-shadow:none}}
  </style></head><body>
  <div class="card">
    <div class="top"><div class="company">SPMS</div><div class="company-sub">Software Personnel Management</div></div>
    <div class="body">
      <div class="photo">${emp.photo ? `<img src="${emp.photo}">` : emp.name[0]}</div>
      <div class="name">${emp.name}</div>
      <div class="pos">${emp.pos}</div>
      <div class="divider"></div>
      <div class="row"><span class="key">Employee ID</span><span class="val" style="color:#a89eff">${emp.id}</span></div>
      <div class="row"><span class="key">Department</span><span class="val">${emp.dept}</span></div>
      <div class="row"><span class="key">Joined</span><span class="val">${fmtDate(emp.joinDate)}</span></div>
      <div class="row"><span class="key">Email</span><span class="val" style="font-size:.72rem">${emp.email}</span></div>
      <div class="row"><span class="key">Phone</span><span class="val">+91 ${emp.phone}</span></div>
      <div class="row"><span class="key">Status</span><span class="val" style="color:#20e888">${emp.status}</span></div>
      <div class="code">${emp.id} · ${emp.dept.toUpperCase().slice(0,3)} · SPMS Corp</div>
    </div>
  </div>
  <script>window.onload=()=>{setTimeout(()=>{window.print();},500)}<\/script>
  </body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

function updateProfilePhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = e => {
    const emps = LS.get('spms_employees') || [];
    const idx = emps.findIndex(emp => emp.id === currentUser.empId);
    if (idx < 0) return;
    emps[idx].photo = e.target.result;
    LS.set('spms_employees', emps);
    toast('Profile photo updated!', 'success');
    renderProfile();
    setupSidebar();
  };
  r.readAsDataURL(file);
}

// =================== LEAVE ===================
function toggleLeaveForm() {
  const formSection = document.getElementById('leaveFormSection');
  const isHidden = formSection.style.display === 'none';
  formSection.style.display = isHidden ? 'block' : 'none';
  if (isHidden) formSection.classList.add('slide-in');
}

function renderLeave() {
  const leaves = LS.get('spms_leaves') || [];
  const myLeaves = leaves.filter(l => l.empId === currentUser.empId).reverse();
  const tb = document.getElementById('empLeaveTable');
  if (!myLeaves.length) {
    tb.innerHTML = `<tr><td colspan="6" class="empty"><span class="empty-icon">🏖️</span>No leave applications yet</td></tr>`;
    return;
  }
  tb.innerHTML = myLeaves.map(l => {
    const days = Math.max(1, Math.round((new Date(l.to)-new Date(l.from))/(864e5))+1);
    return `<tr>
      <td>${l.type}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:.82rem">${fmtDate(l.from)}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:.82rem">${fmtDate(l.to)}</td>
      <td style="text-align:center">${days}</td>
      <td><span class="badge badge-${l.status.toLowerCase()}">${l.status}</span></td>
      <td style="max-width:200px;font-size:.82rem;color:var(--text2)">${l.reason}</td>
    </tr>`;
  }).join('');
}

function submitLeave() {
  const type = v('leaveType'), from = v('leaveFrom'), to = v('leaveTo'),
        contact = v('leaveContact'), reason = v('leaveReason');
  if (!type||!from||!to||!contact||!reason) { toast('Fill all leave fields', 'error'); return; }
  if (new Date(to) < new Date(from)) { toast('End date must be after start date', 'error'); return; }
  const emps = LS.get('spms_employees') || [];
  const emp = emps.find(e => e.id === currentUser.empId);
  const leaves = LS.get('spms_leaves') || [];
  leaves.push({ empId: currentUser.empId, empName: emp?.name || currentUser.empId, type, from, to, contact, reason, status: 'Pending', appliedOn: todayStr() });
  LS.set('spms_leaves', leaves);
  toast('Leave application submitted! 🏖️', 'success');
  ['leaveType','leaveFrom','leaveTo','leaveContact','leaveReason'].forEach(id => { const el = document.getElementById(id); if(el) el.value = '' });
  toggleLeaveForm();
  renderLeave();
  setupSidebar();
}

// =================== EMPLOYEE TASKS ===================
function renderEmpTasks() {
  const tasks = LS.get('spms_tasks') || {};
  const myTasks = (tasks[currentUser.empId] || []).slice().reverse();
  const container = document.getElementById('empTasksList');

  if (!myTasks.length) {
    container.innerHTML = `<div class="empty"><span class="empty-icon">⚡</span>No tasks assigned yet</div>`;
    return;
  }

  container.innerHTML = myTasks.map((t, ri) => {
    const realIdx = myTasks.length - 1 - ri;
    const isOverdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== 'Done';
    const priorityClass = t.priority === 'Urgent' ? 'urgent' : t.status === 'Done' ? 'done' : 'normal';
    const statusColors = { 'Pending':'var(--amber)', 'In Progress':'var(--teal)', 'Done':'var(--green)', 'Blocked':'var(--red)' };
    const sc = statusColors[t.status] || 'var(--text3)';
    return `
      <div class="task-card ${priorityClass}">
        <div class="tc-top" onclick="openTaskResponse(${realIdx})" style="cursor:pointer">
          <div class="tc-title">${t.title}</div>
          <div class="tc-deadline ${isOverdue ? 'overdue' : ''}">
            ${t.deadline ? `⏰ ${fmtDate(t.deadline)}${isOverdue ? ' (Overdue)' : ''}` : ''}
          </div>
        </div>
        <div class="tc-desc" onclick="openTaskResponse(${realIdx})" style="cursor:pointer">${t.desc}</div>
        <div class="tc-meta" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <span class="tc-tag badge" style="background:${sc}22;color:${sc};border:1px solid ${sc}44">${t.status}</span>
            <span class="tc-tag">${t.priority}</span>
            <span class="tc-tag">Assigned: ${fmtDate(t.assignedOn)}</span>
            ${t.response ? `<span class="tc-tag" style="color:var(--teal)">✓ Response sent</span>` : ''}
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-secondary btn-sm" onclick="openTaskResponse(${realIdx})">
              ${t.response ? '✏️ Update Response' : '💬 Respond'}
            </button>
            ${t.status !== 'Done' ? `<button class="btn btn-success btn-sm" onclick="markMyTaskDone(${realIdx})">✅ Mark Done</button>` : `<span style="font-size:.8rem;color:var(--green);font-weight:700">✅ Completed</span>`}
          </div>
        </div>
        ${t.response ? `
          <div style="margin-top:10px;padding:10px 14px;background:var(--surface);border-radius:8px;border:1px solid var(--border);font-size:.82rem">
            <span style="color:var(--text3)">Your response: </span>
            <span style="color:var(--teal);font-weight:600">${{yes:'Can complete',partial:'Partially',no:'Need help'}[t.response] || t.response}</span>
            ${t.eta ? ` &nbsp;·&nbsp; <span style="color:var(--text3)">ETA: </span><span style="font-weight:600">${{'1d':'Today','2-3d':'2-3 Days','1w':'1 Week',more:'More time'}[t.eta] || t.eta}</span>` : ''}
            ${t.responseNote ? `<div style="color:var(--text2);margin-top:5px;font-style:italic">"${t.responseNote}"</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function openTaskResponse(taskIdx) {
  const tasks = LS.get('spms_tasks') || {};
  const myTasks = tasks[currentUser.empId] || [];
  const task = myTasks[taskIdx];
  if (!task) return;
  document.getElementById('taskResponseIdx').value = taskIdx;

  document.getElementById('taskResponseBody').innerHTML = `
    <div style="padding:14px 16px;background:var(--card2);border-radius:10px;border:1px solid var(--border);margin-bottom:20px">
      <div style="font-weight:700;margin-bottom:4px">${task.title}</div>
      <div style="font-size:.84rem;color:var(--text2)">${task.desc}</div>
      ${task.deadline ? `<div style="font-size:.78rem;color:var(--text3);margin-top:6px">Deadline: ${fmtDate(task.deadline)}</div>` : ''}
    </div>

    <div class="trf-question">
      <label>Can you complete this task?</label>
      <div class="trf-radio-group">
        <button class="trf-radio ${task.response === 'yes' ? 'selected' : ''}" onclick="selectRadio(this,'yes')">✅ Yes, I can</button>
        <button class="trf-radio ${task.response === 'partial' ? 'selected' : ''}" onclick="selectRadio(this,'partial')">⚡ Partially</button>
        <button class="trf-radio ${task.response === 'no' ? 'selected' : ''}" onclick="selectRadio(this,'no')">❌ Need help</button>
      </div>
    </div>

    <div class="trf-question">
      <label>Estimated time to complete</label>
      <div class="trf-radio-group">
        <button class="trf-radio ${task.eta === '1d' ? 'selected' : ''}" onclick="selectRadio(this,'1d','eta')">Today</button>
        <button class="trf-radio ${task.eta === '2-3d' ? 'selected' : ''}" onclick="selectRadio(this,'2-3d','eta')">2-3 Days</button>
        <button class="trf-radio ${task.eta === '1w' ? 'selected' : ''}" onclick="selectRadio(this,'1w','eta')">1 Week</button>
        <button class="trf-radio ${task.eta === 'more' ? 'selected' : ''}" onclick="selectRadio(this,'more','eta')">More time needed</button>
      </div>
    </div>

    <div class="trf-question">
      <label>Additional notes</label>
      <textarea class="trf-textarea" id="taskNoteText" placeholder="Any blockers, questions, or updates...">${task.responseNote || ''}</textarea>
    </div>
  `;
  openModal('taskResponseModal');
}

let _taskResponse = { can: '', eta: '' };

function selectRadio(btn, val, type) {
  const group = btn.parentElement;
  group.querySelectorAll('.trf-radio').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  if (type === 'eta') _taskResponse.eta = val;
  else _taskResponse.can = val;
}

function submitTaskResponse() {
  const idx = parseInt(document.getElementById('taskResponseIdx').value);
  const note = document.getElementById('taskNoteText').value.trim();
  const tasks = LS.get('spms_tasks') || {};
  const myTasks = tasks[currentUser.empId] || [];

  const body = document.getElementById('taskResponseBody');
  const canEl = body.querySelector('.trf-radio.selected');
  const can = _taskResponse.can;
  const eta = _taskResponse.eta;

  if (!can) { toast('Please select whether you can complete the task', 'error'); return; }

  myTasks[idx].response = can;
  myTasks[idx].eta = eta;
  myTasks[idx].responseNote = note;
  myTasks[idx].status = can === 'yes' ? 'In Progress' : can === 'partial' ? 'In Progress' : 'Blocked';
  tasks[currentUser.empId] = myTasks;
  LS.set('spms_tasks', tasks);

  toast('Task response submitted!', 'success');
  closeModal('taskResponseModal');
  renderEmpTasks();
  setupSidebar();
  _taskResponse = { can: '', eta: '' };
}

function markMyTaskDone(taskIdx) {
  const tasks = LS.get('spms_tasks') || {};
  const myTasks = tasks[currentUser.empId] || [];
  if (myTasks[taskIdx]) {
    myTasks[taskIdx].status = 'Done';
    tasks[currentUser.empId] = myTasks;
    LS.set('spms_tasks', tasks);
    toast('Task marked as completed! 🎉', 'success');
    renderEmpTasks();
    setupSidebar();
  }
}

// =================== WORK LOG ===================
function renderWorkLog() {
  const wl = LS.get('spms_worklogs') || {};
  const myWl = (wl[currentUser.empId] || []).slice().reverse();
  const container = document.getElementById('workLogEntries');
  document.getElementById('wlDate').value = todayStr();
  if (!myWl.length) { container.innerHTML = `<div class="empty"><span class="empty-icon">📋</span>No work logs yet</div>`; return; }
  const today = todayStr();
  const todayHrs = myWl.filter(e => e.date === today).reduce((s,e) => s + e.hours, 0);

  container.innerHTML = `
    <div style="margin-bottom:16px;padding:14px 18px;background:var(--surface);border:1px solid var(--border);border-radius:12px;display:flex;justify-content:space-between;align-items:center">
      <span class="section-label" style="margin:0">Work Log History</span>
      <span style="font-family:'JetBrains Mono',monospace;color:var(--teal);font-weight:700">Today: ${todayHrs}h</span>
    </div>
    ${myWl.map(e => `
      <div class="work-entry">
        <div class="we-date">${fmtDate(e.date)}</div>
        <div class="we-info">
          <div class="we-task">${e.task}</div>
          <div style="font-size:.78rem;color:var(--text3);margin-top:2px">${e.category} · ${e.desc}</div>
        </div>
        <div class="we-hours">${e.hours}h</div>
      </div>
    `).join('')}
  `;
}

function submitWorkLog() {
  const task = v('wlTask'), hours = parseFloat(v('wlHours')), date = v('wlDate'),
        cat = v('wlCat'), desc = v('wlDesc');
  if (!task||!hours||!date||!cat||!desc) { toast('Fill all work log fields', 'error'); return; }
  const wl = LS.get('spms_worklogs') || {};
  if (!wl[currentUser.empId]) wl[currentUser.empId] = [];
  wl[currentUser.empId].push({ task, hours, date, category: cat, desc, loggedAt: new Date().toISOString() });
  LS.set('spms_worklogs', wl);
  toast('Work log saved! 📋', 'success');
  resetWorkLog();
  renderWorkLog();
}

function resetWorkLog() {
  ['wlTask','wlHours','wlCat','wlDesc'].forEach(id => { const el = document.getElementById(id); if(el) el.value = '' });
  document.getElementById('wlDate').value = todayStr();
}

// =================== EMPLOYEE VACANCIES ===================
function renderEmpVacancies() {
  const vacs = LS.get('spms_vacancies') || [];
  const grid = document.getElementById('empVacancyGrid');
  if (!vacs.length) { grid.innerHTML = `<div class="empty"><span class="empty-icon">💼</span>No open positions at this time</div>`; return; }
  grid.innerHTML = vacs.map((vac, i) => `
    <div class="vacancy-card" onclick="showEmpVacDetail(${i})">
      <div class="v-role">${vac.title}</div>
      <div class="v-dept">${vac.dept} · ${vac.loc}</div>
      <div class="v-meta">
        <span class="v-tag">💰 ${vac.salary}</span>
        <span class="v-tag">⏱ ${vac.exp}</span>
        <span class="v-tag">📄 ${vac.type}</span>
        <span class="v-tag">👤 ${vac.openings} Opening${vac.openings>1?'s':''}</span>
      </div>
      <div style="font-size:.78rem;color:var(--text3)">Apply by: ${fmtDate(vac.deadline)}</div>
    </div>
  `).join('');
}

function showEmpVacDetail(i) {
  const vacs = LS.get('spms_vacancies') || [];
  const vac = vacs[i];
  const emps = LS.get('spms_employees') || [];
  const emp = emps.find(e => e.id === currentUser.empId);

  document.getElementById('empVacModalTitle').textContent = vac.title;
  document.getElementById('empVacModalBody').innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">
      <span class="v-tag">🏢 ${vac.dept}</span>
      <span class="v-tag">📍 ${vac.loc}</span>
      <span class="v-tag">💰 ${vac.salary}</span>
      <span class="v-tag">⏱ ${vac.exp}</span>
      <span class="v-tag">📄 ${vac.type}</span>
      <span class="v-tag">👤 ${vac.openings} Opening${vac.openings>1?'s':''}</span>
    </div>
    <div style="font-size:.78rem;color:var(--text3);margin-bottom:16px">Deadline: ${fmtDate(vac.deadline)}</div>
    <div class="section-label">Job Description</div>
    <p style="font-size:.88rem;color:var(--text2);line-height:1.7;margin-bottom:16px">${vac.desc}</p>
    <div class="section-label">Requirements</div>
    <p style="font-size:.88rem;color:var(--text2);line-height:1.7;margin-bottom:20px">${vac.req}</p>

    <div class="refer-box">
      <h4>⭐ Know someone perfect for this role? Refer them!</h4>
      <div class="form-grid" style="margin-bottom:14px">
        <div class="fld"><label>Candidate Name *</label><input type="text" id="refName" placeholder="Full name"></div>
        <div class="fld"><label>Their Email *</label><input type="email" id="refEmail" placeholder="candidate@email.com"></div>
        <div class="fld"><label>Their Phone</label><input type="tel" id="refPhone" placeholder="9876543210"></div>
        <div class="fld"><label>Resume / Portfolio Link</label><input type="url" id="refResume" placeholder="https://drive.google.com/..."></div>
        <div class="fld form-full"><label>Why are they a good fit?</label><textarea id="refNote" placeholder="Share any relevant details about the candidate..." style="min-height:70px"></textarea></div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="submitReferral('${vac.id}', '${emp?.name || currentUser.name}')">Submit Referral ⭐</button>
    </div>
  `;
  openModal('empVacModal');
}

function submitReferral(vacId, referrerName) {
  const name = v('refName'), email = v('refEmail'), phone = v('refPhone'),
        resumeLink = v('refResume'), note = v('refNote');
  if (!name || !email) { toast('Candidate name and email are required', 'error'); return; }
  const referrals = LS.get('spms_referrals') || [];
  referrals.push({ vacId, name, email, phone, resumeLink, note, referredBy: referrerName, appliedOn: todayStr() });
  LS.set('spms_referrals', referrals);
  toast(`Referral submitted for ${name}! ⭐`, 'success');
  closeModal('empVacModal');
}

// =================== UTILITIES ===================
function v(id) { return (document.getElementById(id)?.value || '').trim(); }
function todayStr() { return new Date().toISOString().slice(0,10); }
function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
  catch { return d; }
}
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function toast(msg, type='info') {
  const c = document.getElementById('toast');
  const el = document.createElement('div');
  el.className = `toast-msg toast-${type}`;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.style.opacity='0', 3200);
  setTimeout(() => el.remove(), 3600);
}

// =================== DOWNLOAD ID CARD ===================
function downloadIdCard() {
  const emps = LS.get('spms_employees') || [];
  const emp = emps.find(e => e.id === currentUser.empId);
  if (!emp) return;

  // Build a standalone HTML and trigger print/save
  const photoHtml = emp.photo
    ? `<img src="${emp.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;color:#4f7cff;background:rgba(79,124,255,0.15);border-radius:50%">${emp.name[0]}</div>`;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>ID Card - ${emp.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
  <style>
    body{margin:0;padding:40px;background:#f0f4f8;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;min-height:100vh}
    .card{width:340px;background:linear-gradient(135deg,#0f172a 0%,#1e2d4d 100%);border-radius:20px;padding:28px;position:relative;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.4);page-break-inside:avoid}
    .top-bar{position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#4f7cff,#2dd4bf)}
    .logo{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:800;color:rgba(255,255,255,.9);margin-bottom:20px}
    .photo{width:76px;height:76px;border-radius:50%;border:3px solid rgba(79,124,255,.5);margin-bottom:14px;overflow:hidden}
    .name{font-size:1.15rem;font-weight:700;color:#fff;margin-bottom:3px}
    .role{font-size:.72rem;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.8px;margin-bottom:16px}
    .divider{height:1px;background:rgba(255,255,255,.08);margin-bottom:14px}
    .row{display:flex;justify-content:space-between;margin-bottom:8px}
    .key{font-size:.68rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px}
    .val{font-size:.76rem;color:rgba(255,255,255,.85);font-weight:600;font-family:'DM Mono',monospace}
    .footer{margin-top:16px;text-align:center;font-size:.62rem;color:rgba(255,255,255,.2);text-transform:uppercase;letter-spacing:1px}
    @media print{body{background:white;padding:0}.card{box-shadow:none}}
  </style></head><body>
  <div class="card">
    <div class="top-bar"></div>
    <div class="logo">SPMS Corp</div>
    <div class="photo">${photoHtml}</div>
    <div class="name">${emp.name}</div>
    <div class="role">${emp.pos}</div>
    <div class="divider"></div>
    <div class="row"><span class="key">Employee ID</span><span class="val">${emp.id}</span></div>
    <div class="row"><span class="key">Department</span><span class="val">${emp.dept}</span></div>
    <div class="row"><span class="key">Joined</span><span class="val">${emp.joinDate}</span></div>
    <div class="row"><span class="key">Email</span><span class="val">${emp.email}</span></div>
    <div class="row"><span class="key">Phone</span><span class="val">+91 ${emp.phone}</span></div>
    <div class="footer">SPMS Corp — Official ID</div>
  </div>
  <script>window.onload=function(){window.print()}<\/script>
  </body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) toast('Allow popups to download ID card', 'error');
  else toast('ID card opened — use Ctrl+P to save as PDF', 'info');
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => { if(e.target===o) o.classList.remove('open') }));

// =================== INIT ===================
initData();
