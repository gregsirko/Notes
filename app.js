function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = ''; // Clear existing notes

    // Insert notes at the top of the list with animation
    notes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.innerHTML = `
            <h5 id="noteTitle">${note}</h5>
            <div class="innerNoteTools">
            </div>
        `;

        // Add click event listener to the note div to trigger the viewNote function
        noteElement.addEventListener('click', function() {
            viewNote(index); // Trigger viewNote when the note is clicked
        }); 

        notesList.appendChild(noteElement);
    });

    // Scroll to the top (the most recent note is at the top now)
    notesList.scrollTop = 0;
}

// Function to Save a note to localStorage and animate it
function saveNote() {
    const noteInput = document.getElementById('noteInput');
    const newNote = noteInput.value.trim();

    if (newNote === '') return; // Don't save empty notes

    // Prevent saving identical notes
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    if (notes.includes(newNote)) {
        alert('This note already exists!');
        return;
    }

    notes.unshift(newNote);  // Add new note at the top of the array
    localStorage.setItem('notes', JSON.stringify(notes));

    noteInput.value = ''; // Clear input field

    // Load and animate new notes
    loadNotes();
}

// Function to Delete a note
function deleteNote(index) {
    if (!confirm('Are you sure you want to delete this note?')) {
        return; // Prevent deletion if user cancels
    }

    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.splice(index, 1);

    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes(); // Reload the notes list
}

function viewNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const note = notes[index];

    const notesList = document.getElementById('notesList');
    const allNotes = notesList.getElementsByClassName('note');

    // Remove highlight class from all notes
    Array.from(allNotes).forEach(noteElement => {
        noteElement.classList.remove('highlight');
    });

    // Highlight the selected note
    const selectedNote = allNotes[index];
    selectedNote.classList.add('highlight');

    const notesMain = document.getElementById('notesMain');
    notesMain.innerHTML = ''; // Clear the current content

    // Create a div for displaying the full note
    const noteDisplayDiv = document.createElement('div');
    noteDisplayDiv.classList.add('noteDisplay');
    noteDisplayDiv.innerHTML = `
        <div class="noteContent">${note}</div>
        <div id="noteTools">
            <button onclick="deleteNote(${index})" class="deleteBtn">Delete</button>
        </div>
    `;

    // Append the note to the main section
    notesMain.appendChild(noteDisplayDiv);

    // Handle Edit Button Click
    document.getElementById('editNoteBtn').addEventListener('click', function() {
        editNote(index);
    });

    //Append the Edit Button to the notesBottomTools
    notesBottomTools.appendChild(editNoteBtn);
    notesBottomTools.appendChild(deleteBtn);


    // Handle Back Button Click
    document.getElementById('backToListBtn').addEventListener('click', function() {
        loadNotes(); // Reload notes list
    });
}


// Function to Edit a Note
function editNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const note = notes[index];

    const notesMain = document.getElementById('notesMain');
    notesMain.innerHTML = ''; // Clear the current content

    // Create a textarea for editing the note
    const editTextarea = document.createElement('textarea');
    editTextarea.value = note; // Pre-fill the textarea with the note content
    editTextarea.classList.add('noteInput');
    editTextarea.placeholder = "Edit your note...";

    // Create a save button to save the edited note
    const saveButton = document.createElement('button');
    saveButton.classList.add('padding');
    saveButton.innerHTML = 'Save Note';
    
    // Append the textarea and save button to the main section
    notesMain.appendChild(editTextarea);

    //Append the Save Button to the notesBottomTools
    notesMain.appendChild(saveButton);

    // Handle Save Button Click
    saveButton.addEventListener('click', function() {
        const updatedNote = editTextarea.value.trim();

        if (updatedNote === '') return; // Don't save empty notes

        notes[index] = updatedNote; // Update the note in the array
        localStorage.setItem('notes', JSON.stringify(notes));

        loadNotes(); // Reload the notes list after saving
    });
}

// Event listener for saving a note
document.getElementById('saveNoteBtn').addEventListener('click', saveNote);

// Load notes when the page is ready
loadNotes();
