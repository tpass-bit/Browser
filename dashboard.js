import { guardAuth, $, statusBadge } from './common.js';
import { db } from './common.js';
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let chart;

function renderCounts(users){
  const total = users.length;
  const active = users.filter(u => (u.status||'active') === 'active').length;
  const verified = users.filter(u => u.status === 'verified').length;
  const banned = users.filter(u => u.status === 'banned').length;

  $('#count-total').textContent = total;
  $('#count-active').textContent = active;
  $('#count-verified').textContent = verified;
  $('#count-banned').textContent = banned;

  renderChart([active, verified, banned]);
}

function renderChart([active, verified, banned]){
  const ctx = document.getElementById('statusChart').getContext('2d');
  if(chart){ chart.destroy(); }
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Active', 'Verified', 'Banned'],
      datasets: [{
        data: [active, verified, banned]
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'User Status Breakdown' }
      },
      cutout: '60%'
    }
  });
}

function start(){
  guardAuth(()=>{
    const usersRef = collection(await import('./common.js').then(m=>m.db), 'users');
    onSnapshot(usersRef, (snap)=>{
      const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderCounts(users);
    });
  });
}

start();
