let notes = {}; //{ id: content}
let currentNoteId = null;

document.getElementById("newNoteBtn").onclick = () => {
  const id = Date.now().toString();
  notes[id] = "example1";
  currentNoteId = id;

  renderNotes();
};

document.getElementById("saveNoteBtn").onclick = () => {
  renderNotes();
};

document.getElementById("deleteBtn").onclick = () => {
  //renderNotes();
};

document.getElementById("editNoteBtn").onclick = () => {
  //renderNotes();
};

function renderNotes() {
  //wiping sidebar clean
  notesList.innerHTML = "";
  for (const id in notes) {
    const a = document.createElement("a");

    a.textContent = notes[id];
    const noteItem = document.createElement("div").append(a);

    noteItem.onclick = () => {
      current;
    };
  }
}
