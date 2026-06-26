let notes = {}; // { id: { content: "", timestamp: 0 } }
let currentNoteId = null;
let activeCategoryFilter = null; // Stores the string name of the active filter

const notesList = document.getElementById("notesList");
const noteContent = document.getElementById("noteContent");

// ==========================================
// 📦 LOCAL STORAGE STORAGE ROUTINES
// ==========================================

// ✅ Unified key names to "notesApp" across all storage engines
if (localStorage.getItem("notesApp")) {
  notes = JSON.parse(localStorage.getItem("notesApp"));
}

function saveToLocalStorage() {
  localStorage.setItem("notesApp", JSON.stringify(notes));
}

// ==========================================
// 🧼 HELPER FUNCTIONS
// ==========================================

/**
 * Extracts clean, raw plain-text from an HTML rich-text string
 */
function stripHtmlTags(htmlString) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString || "";
  return tempDiv.textContent || tempDiv.innerText || "";
}

/**
 * Updates a note's preview snippet in the sidebar cleanly without breaking layouts
 */
function updateNoteTextInSidebar(id, rawHtmlContent) {
  const noteDiv = document.querySelector(`#notesList .note[data-id="${id}"]`);
  if (!noteDiv) return;
  const link = noteDiv.querySelector("a");
  if (!link) return;

  // Strip the markup tags right before projecting to the sidebar element node
  const cleanText = stripHtmlTags(rawHtmlContent).trim();
  const previewLength = 200;

  link.textContent =
    cleanText === ""
      ? "Untitled Note"
      : cleanText.length > previewLength
        ? cleanText.substring(0, previewLength) + "…"
        : cleanText;
}

function removeNoteFromSidebar(id) {
  const noteDiv = document.querySelector(`#notesList .note[data-id="${id}"]`);
  if (noteDiv) {
    noteDiv.remove();
  }
}

function highlightSelectedNote() {
  // 1. Clear the highlight class from ALL note cards
  document.querySelectorAll("#notesList .note").forEach((note) => {
    note.classList.remove("highlight");
  });

  // 2. Add the highlight class ONLY to the currently active note card
  if (currentNoteId) {
    const activeCard = document.querySelector(
      `#notesList .note[data-id="${currentNoteId}"]`,
    );
    if (activeCard) {
      activeCard.classList.add("highlight");
    }
  }

  // 🛑 MAKE SURE THERE IS NO CODE BELOW THIS LINE TOUCHING THE ".categories li" ELEMENTS!
}

// ==========================================
// 🛠️ APPLICATION CLICK LISTENERS & EVENT DRIVERS
// ==========================================

// ✅ Create Note with dedicated Category tracking
document.getElementById("newNoteBtn").onclick = () => {
  const id = Date.now().toString();
  notes[id] = {
    content: "",
    category: "General", // 🎯 Added separate data piece
    timestamp: Date.now(),
  };
  currentNoteId = id;
  saveToLocalStorage();
  renderNotes();
  renderNoteContent();
  noteContent.focus();
};

// ✅ Explicit Save Note Action Button Click
document.getElementById("saveNoteBtn").onclick = () => {
  if (currentNoteId) {
    notes[currentNoteId].content = noteContent.innerHTML;
    notes[currentNoteId].timestamp = Date.now();
    saveToLocalStorage();
    updateNoteTextInSidebar(currentNoteId, notes[currentNoteId].content);
    noteContent.blur();
  }
};

// ✅ Delete Note Action
document.getElementById("deleteBtn").onclick = () => {
  if (currentNoteId) {
    const toDelete = currentNoteId;
    delete notes[toDelete];
    currentNoteId = null;
    saveToLocalStorage();
    removeNoteFromSidebar(toDelete);
    noteContent.innerHTML = "";
  }
};

window.onkeydown = (e) => {
  if (e.key === "Delete" || e.key === "Backspace") {
    // 1. Exit if the user is actively typing in the text editor
    if (document.activeElement === noteContent) return;

    // 2. Run your delete logic if a note is selected
    if (currentNoteId) {
      const toDelete = currentNoteId;
      delete notes[toDelete];
      currentNoteId = null;
      saveToLocalStorage();
      removeNoteFromSidebar(toDelete);
      noteContent.innerHTML = "";
    }
  }
};

// ✅ Focus helper
document.getElementById("editNoteBtn").onclick = () => {
  noteContent.focus();
};

// ==========================================
// 🖼️ UI RENDERING PIPELINES
// ==========================================

// ✅ Render all notes cards inside the sidebar pane
function renderNotes() {
  notesList.innerHTML = "";
  const notesArray = Object.entries(notes);

  // Sort descending: Newest timestamps slide directly to the top hook
  notesArray.sort((a, b) => b[1].timestamp - a[1].timestamp);

  for (const [id, noteData] of notesArray) {
    const noteItem = document.createElement("div");
    noteItem.classList.add("note");
    noteItem.dataset.id = id;

    // 🎯 ADD THIS LINE: Stamps the note category (e.g., "Work") directly onto the card
    noteItem.setAttribute("data-category", noteData.category || "General");

    const link = document.createElement("a");
    link.href = "#";

    // Filter HTML tags on cold app structural loads
    const cleanRawText = stripHtmlTags(noteData.content).trim();
    const previewLength = 200;

    link.textContent =
      cleanRawText === ""
        ? "Untitled Note"
        : cleanRawText.length > previewLength
          ? cleanRawText.substring(0, previewLength) + "…"
          : cleanRawText;

    const timestamp = document.createElement("p");
    const date = new Date(noteData.timestamp);
    timestamp.textContent = date.toLocaleString([], {
      weekday: "short",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    timestamp.classList.add("note-timestamp");

    // Create a container row to hold your metadata
    const metaRow = document.createElement("div");
    metaRow.classList.add("note-meta-row");

    // Put your existing timestamp inside this new row
    metaRow.appendChild(timestamp);

    // Create the clean Category Pill Badge element
    const categoryPill = document.createElement("span");
    categoryPill.classList.add("category-badge");
    categoryPill.textContent = "#" + noteData.category || "General";

    // Add the pill to the row container
    metaRow.appendChild(categoryPill);

    noteItem.appendChild(link);
    noteItem.appendChild(metaRow);

    if (id === currentNoteId) {
      noteItem.classList.add("highlight");
    }

    notesList.appendChild(noteItem);
  }
}

// ✅ Dynamically reads all unique categories from notes and renders them in the sidebar
// ✅ Dynamically reads all unique categories from notes and renders them in the sidebar
function renderCategories() {
  const categoriesList = document.querySelector(".categories");
  if (!categoriesList) return;

  // 1. Wipe out whatever is currently in the list
  categoriesList.innerHTML = "";

  // 2. Use a "Set" to collect unique category names automatically
  const uniqueCategories = new Set();

  // Loop through all notes and extract their categories
  Object.values(notes).forEach((note) => {
    if (note.category) {
      uniqueCategories.add(note.category.trim());
    }
  });

  // Make sure "General" always exists as a base fallback option if the set is empty
  if (uniqueCategories.size === 0) {
    uniqueCategories.add("General");
  }

  // 3. Loop through our unique tags and generate the HTML list items
  uniqueCategories.forEach((categoryName) => {
    const li = document.createElement("li");

    // 🎯 RESTORE HIGHLIGHT: If this category is our active global filter, keep it highlighted
    if (activeCategoryFilter === categoryName) {
      li.classList.add("active");
    }

    // Insert an icon and the tag text node layout block
    li.innerHTML = `<i class="bx bx-folder"></i> <span>#${categoryName}</span>`;

    // 4. Clicking a category filters your list and auto-selects the top note
    li.onclick = () => {
      const allNotes = document.querySelectorAll("#notesList .note");

      // UNTOGGLE: If already active, turn it off, clear global filter state, and show everything
      if (activeCategoryFilter === categoryName) {
        activeCategoryFilter = null;
        li.classList.remove("active");
        allNotes.forEach((note) => (note.style.display = "block"));
        return;
      }

      // TOGGLE FILTER: Save this category globally, clear other highlights, set this one active
      activeCategoryFilter = categoryName;
      document
        .querySelectorAll(".categories li")
        .forEach((el) => el.classList.remove("active"));
      li.classList.add("active");

      // Array to keep track of notes that match our filter
      const visibleNotes = [];

      allNotes.forEach((note) => {
        const noteCategory = note.getAttribute("data-category");
        if (noteCategory === categoryName) {
          note.style.display = "block";
          visibleNotes.push(note); // Collect matching visible notes
        } else {
          note.style.display = "none";
        }
      });

      // AUTO-SELECT FIRST NOTE: If we found matching notes, click the top one
      if (visibleNotes.length > 0) {
        const topNote = visibleNotes[0];
        topNote.click();
      }
    };

    categoriesList.appendChild(li);
  });
}

// ✅ Updates note workspace AND the live topContainer metadata bar
function renderNoteContent() {
  const breadcrumbsSpan = document.querySelector(".topContainer .breadcrumbs");
  const timestampSpan = document.querySelector(".topContainer .timestamp");

  if (currentNoteId && notes[currentNoteId]) {
    const currentNote = notes[currentNoteId];

    noteContent.innerHTML = currentNote.content;

    const date = new Date(currentNote.timestamp);
    const liveTimestamp = date.toLocaleString([], {
      weekday: "short",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (timestampSpan) timestampSpan.textContent = liveTimestamp;

    // 🎯 Read directly from the separate category property
    if (breadcrumbsSpan) {
      const categoryName = currentNote.category || "General";
      breadcrumbsSpan.textContent = `#${categoryName}`;
    }
    renderCategories(); // 🎯 ✅ Sync sidebar list states to match open note context tags
  } else {
    noteContent.innerHTML = "";
    if (timestampSpan) timestampSpan.textContent = "--";
    if (breadcrumbsSpan) breadcrumbsSpan.textContent = "No Note Selected";
  }
}

// 🔁 Efficient Event Delegation for Sidebar selections
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

// ==========================================
// 🔄 DEBOUCED BACKGROUND AUTOMATIC SAVING SYSTEM
// ==========================================
let autoSaveTimeout;

function triggerSilentSave() {
  if (!currentNoteId || !notes[currentNoteId]) return;

  const newContent = noteContent.innerHTML;
  const oldContent = notes[currentNoteId].content;

  // 🎯 UX FIX: If the content hasn't changed, save quietly WITHOUT touching the timestamp!
  if (newContent === oldContent) {
    return; // Stop right here; no changes means no timestamp update needed
  }

  // If we made it past the check, the note was actually edited:
  notes[currentNoteId].content = newContent;
  notes[currentNoteId].timestamp = Date.now(); // 🔥 Only updates when you actually type!

  saveToLocalStorage();
  updateNoteTextInSidebar(currentNoteId, notes[currentNoteId].content);

  // Update top bar timestamp display
  const topTimestamp = document.querySelector(".topContainer .timestamp");
  if (topTimestamp) {
    topTimestamp.textContent = new Date(
      notes[currentNoteId].timestamp,
    ).toLocaleString([], {
      weekday: "short",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Update top bar breadcrumbs dynamic tag tracking
  const breadcrumbsSpan = document.querySelector(".topContainer .breadcrumbs");
  if (breadcrumbsSpan) {
    const categoryName = notes[currentNoteId].category || "General";
    breadcrumbsSpan.textContent = `#${categoryName}`;
  }
}

// 1. ⌨️ Continuous Typestream Auto-save engine (350ms debounce window execution)
noteContent.addEventListener("input", () => {
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    triggerSilentSave();
  }, 350);
});

// 2. 🖱️ Exit Blur Auto-save execution loop wrapper
noteContent.addEventListener("blur", () => {
  clearTimeout(autoSaveTimeout);
  triggerSilentSave();
});

// ==========================================
// ⌨️ ACCESSIBILITY INTERFACE SHORTCUT KEYS
// ==========================================
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (e.shiftKey && key === "n") {
    if (document.activeElement === noteContent) return;
    e.preventDefault();
    document.getElementById("newNoteBtn").click();
  }

  if ((e.ctrlKey || e.metaKey) && key === "s") {
    e.preventDefault();
    document.getElementById("saveNoteBtn").click();
  }

  // 3. Escape Key (Drops focus from the active text canvas editor)
  if (e.key === "Escape") {
    // Check if the user is currently inside the editing workspace
    if (document.activeElement === noteContent) {
      e.preventDefault();

      // 🎯 Instantly drops the blinking cursor and exits the text window
      noteContent.blur();

      // Clean up the text state and save immediately on exit
      triggerSilentSave();
    }
  }
});

// ==========================================
// 🧼 INTELLIGENT RICH-TEXT PASTE CLEANER
// ==========================================
noteContent.addEventListener("paste", (e) => {
  // 1. Grab the rich text HTML content from the clipboard layer
  const clipboardHtml = e.clipboardData.getData("text/html");

  // If there is no rich HTML structure available, let the browser handle standard text paste
  if (!clipboardHtml) return;

  // 2. Prevent the default messy browser paste action
  e.preventDefault();

  // 3. Load the clipboard HTML string into a temporary isolated element to clean it
  const sandbox = document.createElement("div");
  sandbox.innerHTML = clipboardHtml;

  // 4. Target all elements within the pasted chunk that contain custom style attributes
  const styledElements = sandbox.querySelectorAll("[style]");

  styledElements.forEach((el) => {
    // ❌ Strip off styling blocks that clash with your dark theme color tokens
    el.style.backgroundColor = "";
    el.style.color = "";
    el.style.fontFamily = "";
    el.style.fontSize = "";
    el.style.lineHeight = "";

    // If the style attribute is now completely empty, remove the attribute entirely to keep HTML clean
    if (!el.getAttribute("style")) {
      el.removeAttribute("style");
    }
  });

  // 5. Safely insert the newly sanitized structural HTML right where the cursor is blinking
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  selection.deleteFromDocument(); // Wipes out text if user highlighted a section to overwrite

  const range = selection.getRangeAt(0);
  const fragment = range.createContextualFragment(sandbox.innerHTML);
  range.insertNode(fragment);

  // Move the blinking typing cursor neatly to the end of the newly pasted text
  selection.collapseToEnd();

  // 6. Force our silent background auto-save loop to trigger immediately
  triggerSilentSave();
});

// ==========================================
// 🏎️ INITIAL APPLICATION STARTUP RUNTIME
// ==========================================
const startupNotesArray = Object.entries(notes);

if (startupNotesArray.length > 0) {
  startupNotesArray.sort((a, b) => b[1].timestamp - a[1].timestamp);
  currentNoteId = startupNotesArray[0][0];
} else {
  currentNoteId = null;
}

// ==========================================
// 🎨 RICH-TEXT SUB-DOCUMENT ACTION UTILITIES
// ==========================================
document.getElementById("boldBtn").addEventListener("click", (e) => {
  e.preventDefault();
  document.execCommand("bold", false, null);
  noteContent.focus();
});

document.getElementById("underlineBtn").addEventListener("click", (e) => {
  e.preventDefault();
  document.execCommand("underline", false, null);
  noteContent.focus();
});

// ==========================================
// 📋 BULLETED LIST FORMATTING TOOL
// ==========================================
const bulletListBtn = document.getElementById("bulletListBtn");

if (bulletListBtn) {
  bulletListBtn.onclick = (e) => {
    // Prevent the button click from stealing focus away from the text area
    e.preventDefault();

    // Executes the native browser command to inject or toggle a bulleted list
    document.execCommand("insertUnorderedList", false, null);

    // Keep the cursor active inside the text editor
    noteContent.focus();
  };
}

// ==========================================
// 🏷️ REAL-TIME TOP-BAR TAG MANAGER ENGINE
// ==========================================
const tagForm = document.getElementById("tagForm");
const tagInput = document.getElementById("tagInput");
const activeCategoryDisplay = document.getElementById("activeCategoryDisplay");

tagForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Stop page from reloading

  // 1. Safety check: make sure a note is actually open
  if (!currentNoteId || !notes[currentNoteId]) {
    tagInput.value = "";
    return;
  }

  // 2. Clean up the user input string
  let newTag = tagInput.value.trim().replace("#", "");

  // If they submitted an empty string, do nothing
  if (newTag === "") return;

  // 3. Format string to Capital Case (e.g., "work" -> "Work")
  newTag = newTag.charAt(0).toUpperCase() + newTag.slice(1);

  // 4. Update the note's individual category data field
  notes[currentNoteId].category = newTag;
  notes[currentNoteId].timestamp = Date.now(); // update modification sync time

  // 5. Commit to local storage disk and update workspace UI views
  saveToLocalStorage();

  // Update our top HUD display label instantly
  if (activeCategoryDisplay) {
    activeCategoryDisplay.textContent = `#${newTag}`;
  }

  // Wipe the input box clean for the next entry
  tagInput.value = "";

  // 6. Refresh sidebar notes so the card badges change live
  renderNotes();
  renderCategories(); // 🎯 ✅ Force-repaint the sidebar folder track live

  // 🎯 Note: Next step we will create renderCategories() to update the sidebar list!
});

// Draw the application landscape layout
renderNotes();
highlightSelectedNote();
renderNoteContent();
renderCategories(); // 🎯 ✅ Render tags on initial app engine launch
