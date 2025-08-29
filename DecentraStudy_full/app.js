/*
  app.js - Frontend logic for DecentraStudy
  - Simulates IPFS upload locally (generates fake hash)
  - Integrates with Clarity contract via read-only / contract-call stubs
  - Prevents multiple votes per user in frontend (also enforced on-chain)
  - If Stacks.js is available, it will attempt real calls (see comments)
*/

let walletConnected = false;
let userAddress = "";
let notes = []; // local cache: {id, title, subject, desc, ipfs, owner, likes, dislikes}
let userVotes = {}; // { noteId: true|false } tracked locally for UX

// Helper: show page
function showPage(page) {
  document.querySelectorAll('main section').forEach(s => s.classList.add('hidden'));
  // special cases
  if (page === 'browse') {
    document.querySelector('#notes-grid').parentElement.classList.remove('hidden');
    document.getElementById('upload-page').classList.add('hidden');
    document.getElementById('profile-page').classList.add('hidden');
  } else if (page === 'upload') {
    document.getElementById('upload-page').classList.remove('hidden');
    document.querySelector('#notes-grid').parentElement.classList.add('hidden');
    document.getElementById('profile-page').classList.add('hidden');
  } else if (page === 'profile') {
    document.getElementById('profile-page').classList.remove('hidden');
    document.getElementById('upload-page').classList.add('hidden');
    document.querySelector('#notes-grid').parentElement.classList.add('hidden');
    renderProfile();
  }
  // default: refresh notes grid
  renderNotes();
}

// Mock wallet connect (replace with Stacks Connect integration)
function connectWallet() {
  if (!walletConnected) {
    walletConnected = true;
    userAddress = "ST1MOCKADDRESS000000000000000000000000";
    document.getElementById('connect-btn').textContent = 'Connected';
    document.getElementById('wallet-address').textContent = userAddress;
    document.getElementById('profile-wallet').textContent = userAddress;
    renderProfile();
    refreshFromChain();
  } else {
    walletConnected = false;
    userAddress = '';
    document.getElementById('connect-btn').textContent = 'Connect Wallet';
    document.getElementById('wallet-address').textContent = 'Not connected';
    document.getElementById('profile-wallet').textContent = '-';
  }
}

// Simulate uploading to IPFS and adding note on-chain
document.getElementById('upload-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!walletConnected) { alert('Connect wallet first'); return; }
  const title = document.getElementById('note-title').value.trim();
  const subject = document.getElementById('note-subject').value.trim();
  const desc = document.getElementById('note-desc').value.trim();
  if (!title || !subject) { alert('Please enter title and subject'); return; }

  // Simulate IPFS hash
  const ipfs = `Qm${Math.random().toString(36).substring(2,15)}${Math.random().toString(36).substring(2,15)}`;

  // Simulate contract call to add-note (replace with stacks.js contract call)
  const id = notes.length + 1;
  const newNote = { id, title, subject, desc, ipfs, owner: userAddress, likes: 0, dislikes: 0 };
  notes.unshift(newNote);

  // Update UI
  document.getElementById('upload-form').reset();
  alert('Note uploaded (simulated). In real deployment, this would call the Clarity contract add-note.');
  showPage('browse');
});

// Render notes
function renderNotes() {
  const grid = document.getElementById('notes-grid');
  grid.innerHTML = '';
  notes.forEach(n => {
    const card = document.createElement('div');
    card.className = 'glass p-4 rounded-xl shadow';
    card.innerHTML = `
      <h3 class="font-semibold">${escapeHtml(n.title)}</h3>
      <p class="text-sm text-slate-600">${escapeHtml(n.subject)}</p>
      <p class="text-xs text-slate-500 mt-2">By: ${n.owner.substring(0,8)}... </p>
      <div class="mt-3 flex justify-between items-center">
        <div class="text-sm text-slate-600">👍 ${n.likes}  👎 ${n.dislikes}</div>
        <div class="space-x-2">
          <button onclick="openModal(${n.id})" class="px-3 py-1 border rounded-md">View</button>
          <button onclick="attemptVote(${n.id}, true)" id="like-btn-${n.id}" class="px-3 py-1 rounded-md bg-green-50 text-green-700 border">Like</button>
          <button onclick="attemptVote(${n.id}, false)" id="dislike-btn-${n.id}" class="px-3 py-1 rounded-md bg-red-50 text-red-700 border">Dislike</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
    // disable buttons if user already voted locally
    if (userVotes[n.id] !== undefined) {
      disableVoteButtons(n.id, true);
    }
  });
}

// open modal
let currentModalNoteId = null;
function openModal(id) {
  const note = notes.find(x=>x.id===id);
  if (!note) return;
  currentModalNoteId = id;
  document.getElementById('modal-title').textContent = note.title;
  document.getElementById('modal-desc').textContent = note.desc;
  document.getElementById('modal-hash').textContent = note.ipfs;
  document.getElementById('modal').classList.remove('hidden');
  // set vote button disabled state
  if (userVotes[id] !== undefined) {
    disableVoteButtons(id, true);
  } else {
    disableVoteButtons(id, false);
  }
}
function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

// attempt vote with frontend check; real enforcement is on-chain
function attemptVote(noteId, like) {
  if (!walletConnected) { alert('Connect wallet to vote'); return; }
  if (userVotes[noteId] !== undefined) { alert('You have already voted on this note'); return; }

  // Simulate a call to the Clarity contract vote-note
  // In real usage, replace this block with stacks.js contract call & wait for tx confirmation
  const note = notes.find(n=>n.id===noteId);
  if (!note) { alert('Note not found'); return; }
  if (like) note.likes += 1; else note.dislikes += 1;
  userVotes[noteId] = like;
  disableVoteButtons(noteId, true);
  renderNotes();
  alert(like ? 'Liked (simulated, enforced on-chain in real deploy)' : 'Disliked (simulated)');
}

// disables/enables vote buttons for a note
function disableVoteButtons(noteId, disable) {
  const likeBtn = document.getElementById(`like-btn-${noteId}`);
  const dislikeBtn = document.getElementById(`dislike-btn-${noteId}`);
  if (!likeBtn || !dislikeBtn) return;
  likeBtn.disabled = disable;
  dislikeBtn.disabled = disable;
  likeBtn.classList.toggle('opacity-50', disable);
  dislikeBtn.classList.toggle('opacity-50', disable);
}

// refresh from chain - in this sample we just keep local notes
function refreshFromChain() {
  // In a real app: call read-only get-note for each id, or use an indexer.
  // Here, we simply re-render local notes
  renderNotes();
  alert('Refreshed (simulated). Replace refreshFromChain() with actual chain reads using stacks.js in production.');
}

// profile
function renderProfile() {
  const count = notes.filter(n=>n.owner===userAddress).length;
  document.getElementById('profile-count').textContent = count;
}

// helpers
function voteFromUI(like) {
  if (!currentModalNoteId) return;
  attemptVote(currentModalNoteId, like);
}

function cancelUpload() {
  document.getElementById('upload-form').reset();
  showPage('browse');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"'`=\/]/g, function (c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;','=':'&#61;','/':'&#47;'}[c];
  });
}

// initial sample notes for demo
notes = [
  { id:1, title:'Calculus Integration Techniques', subject:'Mathematics', desc:'Integration by parts, substitution, partial fractions', ipfs:'Qmabc1', owner:'ST1AAA', likes:12, dislikes:1},
  { id:2, title:'Quantum Mechanics Fundamentals', subject:'Physics', desc:'Wavefunctions, operators, Schrodinger eqn', ipfs:'Qmabc2', owner:'ST2BBB', likes:9, dislikes:0},
  { id:3, title:'Data Structures', subject:'Computer Science', desc:'Arrays, linked lists, trees, graphs', ipfs:'Qmabc3', owner:'ST3CCC', likes:15, dislikes:2}
];

renderNotes();