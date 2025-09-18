let notes = {}; // { id: content }
let currentNoteId = null;

const notesList = document.getElementById("notesList");
const noteContent = document.getElementById("noteContent");

// ✅ Load notes from localStorage
if (localStorage.getItem("notesApp")) {
  notes = JSON.parse(localStorage.getItem("notesApp"));
}

// ✅ Save notes to localStorage
function saveToLocalStorage() {
  localStorage.setItem("notesApp", JSON.stringify(notes));
}

// ✅ Create Note
document.getElementById("newNoteBtn").onclick = () => {
  const id = Date.now().toString();
  notes[id] = {
    content: "New note",
    timestamp: Date.now(),
  };
  currentNoteId = id;
  saveToLocalStorage();
  renderNotes();
  renderNoteContent();
};

// ✅ Save Note
document.getElementById("saveNoteBtn").onclick = () => {
  if (currentNoteId) {
    notes[currentNoteId].content = noteContent.value;
    notes[currentNoteId].timestamp = Date.now(); // update timestamp
    saveToLocalStorage();
    updateNoteTextInSidebar(currentNoteId, notes[currentNoteId].content, notes[currentNoteId].tiemstamp);
  }
};

// ✅ Delete Note
document.getElementById("deleteBtn").onclick = () => {
  if (currentNoteId) {
    const toDelete = currentNoteId;
    delete notes[toDelete];
    currentNoteId = null;
    saveToLocalStorage();
    removeNoteFromSidebar(toDelete);
    noteContent.value = "";
  }
};

// ✅ Focus note editor
document.getElementById("editNoteBtn").onclick = () => {
  noteContent.focus();
};

// ✅ Render all notes (only used when adding/removing notes)
function renderNotes() {
  notesList.innerHTML = "";

  // Convert notes object to array of [id, note] pairs
  const notesArray = Object.entries(notes);

  // Sort by timestamp descending (newest first)
  notesArray.sort((a, b) => b[1].timestamp - a[1].timestamp);

  for (const [id, noteData] of notesArray) {
    const noteItem = document.createElement("div");
    noteItem.classList.add("note");
    noteItem.dataset.id = id;

    const link = document.createElement("a");
    link.href = "#";

    const previewLength = 12;
    const fullText = noteData.content;
    link.textContent = fullText.length > previewLength
      ? fullText.substring(0, previewLength) + "…"
      : fullText;

    const timestamp = document.createElement("p");
    const date = new Date(noteData.timestamp);
    timestamp.textContent = date.toLocaleString();
    timestamp.classList.add("note-timestamp");

    noteItem.appendChild(link);
    noteItem.appendChild(timestamp);

    if (id === currentNoteId) {
      noteItem.classList.add("highlight");
    }

    notesList.appendChild(noteItem);
  }
}

// ✅ Only update note content textarea
function renderNoteContent() {
  if (currentNoteId && notes[currentNoteId]) {
    noteContent.value = notes[currentNoteId].content;  // <--- Use .content here
  } else {
    noteContent.value = "";
  }
}

// ✅ Highlight selected note in sidebar
function highlightSelectedNote() {
  const items = document.querySelectorAll("#notesList .note");
  items.forEach(item => {
    if (item.dataset.id === currentNoteId) {
      item.classList.add("highlight");
    } else {
      item.classList.remove("highlight");
    }
  });
}

// Update note text in sidebar (after editing)
function updateNoteTextInSidebar(id, newText) {
  const noteDiv = document.querySelector(`#notesList .note[data-id="${id}"]`);
  if (!noteDiv) return;
  const link = noteDiv.querySelector("a");
  if (!link) return;

  const previewLength = 12;
  link.textContent = newText.length > previewLength
    ? newText.substring(0, previewLength) + "…"
    : newText;
}

// ✅ Remove note div from sidebar
function removeNoteFromSidebar(id) {
  const noteDiv = document.querySelector(`#notesList .note[data-id="${id}"]`);
  if (noteDiv) {
    noteDiv.remove();
  }
}

// 🔁 Event delegation for sidebar clicks (no rebuilding DOM)
notesList.onclick = (e) => {
  const noteDiv = e.target.closest(".note");
  if (noteDiv) {
    const id = noteDiv.dataset.id;
    if (currentNoteId !== id) {
      currentNoteId = id;
      renderNoteContent();
      highlightSelectedNote();
    }
  }
};

// ✅ Initial render
renderNotes();
highlightSelectedNote();
renderNoteContent();
