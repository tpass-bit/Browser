import { guardAuth, $, $all, addUserDoc, setStatus, deleteUserDoc } from './common.js';
import { db } from './common.js';
import { collection, onSnapshot, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let users = [];

function renderTable(){
  const tbody = $('#tbody');
  tbody.innerHTML = '';
  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.displayName||'-'}</td>
      <td>${u.email||'-'}</td>
      <td><span class="badge ${u.status||'active'}">${(u.status||'active').toUpperCase()}</span></td>
      <td style="display:flex; gap:8px; align-items:center;">
        <button class="btn success" data-action="verify" data-id="${u.id}">Verify</button>
        <button class="btn warning" data-action="ban" data-id="${u.id}">Ban</button>
        <button class="btn secondary" data-action="unban" data-id="${u.id}">Unban</button>
        <button class="btn danger" data-action="delete" data-id="${u.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function wireActions(){
  $('#tbody').addEventListener('click', async (e)=>{
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    btn.disabled = true;
    try{
      if(action === 'verify') await setStatus(id, 'verified');
      if(action === 'ban') await setStatus(id, 'banned');
      if(action === 'unban') await setStatus(id, 'active');
      if(action === 'delete'){
        if(confirm('Delete Firestore user document?')){
          await deleteUserDoc(id);
        }
      }
    }catch(err){
      alert(err.message);
    }finally{
      btn.disabled = false;
    }
  });

  $('#addForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = $('#email').value.trim();
    const name = $('#name').value.trim();
    const status = $('#status').value;
    const notes = $('#notes').value.trim();
    const btn = $('#addBtn');
    if(!email){ alert('Email required'); return; }
    btn.disabled = true;
    try{
      await addUserDoc({ email, displayName: name, status, notes });
      e.target.reset();
    }catch(err){
      alert(err.message);
    }finally{
      btn.disabled = false;
    }
  });
}

function start(){
  guardAuth(()=>{
    const qUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    onSnapshot(qUsers, (snap)=>{
      users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderTable();
    });
    wireActions();
  });
}

start();
