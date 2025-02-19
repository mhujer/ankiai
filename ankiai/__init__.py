import re
import requests
from aqt import mw
from aqt.qt import (
    QAction,
    QDialog,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QComboBox,
    QPushButton,
    QPlainTextEdit,
    QLineEdit,
    QProgressDialog,
    Qt,
)
from aqt.utils import showInfo
from anki.hooks import addHook

# Constants
DEFAULT_PROMPT = (
    "You are a helpful vocabulary learning teacher who helps a user generate example sentences in German for language learning. "
    "I will provide multiple input lines. Each input is prefixed with its note id. For each input generate two lines with example sentences. "
    "Start each line with the corresponding note id, followed by a colon and a space, and then the example sentence. "
    "The sentences should be complex enough for A2/B1 level. (do not add any extra numbering or bullet points). "
    "Only include responses for the note ids provided below.\n\n"
    "Inputs:\n"
)
DEFAULT_BATCH_SIZE = "20"  # Default batch size as a string


class FieldSelectionDialog(QDialog):
    def __init__(
            self,
            field_names,
            default_api_key=None,
            default_term=None,
            default_target=None,
            default_prompt=None,
            default_batch_size=DEFAULT_BATCH_SIZE,
            parent=None,
    ):
        super().__init__(parent)
        self.setWindowTitle("Generate Example Sentences")
        layout = QVBoxLayout(self)

        # API key input.
        layout.addWidget(QLabel("OpenAI API Key:"))
        self.api_key_edit = QLineEdit()
        if default_api_key:
            self.api_key_edit.setText(default_api_key)
        layout.addWidget(self.api_key_edit)

        # Term field selection.
        layout.addWidget(QLabel("Select the Term Field:"))
        self.term_combo = QComboBox()
        for name in field_names:
            self.term_combo.addItem(name)
        if default_term:
            self.term_combo.setCurrentText(default_term)
        layout.addWidget(self.term_combo)

        # Target field selection.
        layout.addWidget(QLabel("Select the Target Field:"))
        self.target_combo = QComboBox()
        for name in field_names:
            self.target_combo.addItem(name)
        if default_target:
            self.target_combo.setCurrentText(default_target)
        layout.addWidget(self.target_combo)

        # Prompt text area.
        layout.addWidget(QLabel("Prompt:"))
        self.prompt_text = QPlainTextEdit()
        self.default_prompt = default_prompt if default_prompt is not None else DEFAULT_PROMPT
        self.prompt_text.setPlainText(self.default_prompt)
        layout.addWidget(self.prompt_text)

        # Batch size input.
        layout.addWidget(QLabel("Batch Size (number of notes per API call):"))
        self.batch_size_edit = QLineEdit()
        self.batch_size_edit.setText(default_batch_size)
        layout.addWidget(self.batch_size_edit)

        # Reset prompt button.
        self.reset_prompt_button = QPushButton("Reset prompt")
        self.reset_prompt_button.clicked.connect(self.reset_prompt)
        layout.addWidget(self.reset_prompt_button)

        # OK/Cancel buttons.
        buttonLayout = QHBoxLayout()
        self.okButton = QPushButton("OK")
        self.cancelButton = QPushButton("Cancel")
        buttonLayout.addWidget(self.okButton)
        buttonLayout.addWidget(self.cancelButton)
        layout.addLayout(buttonLayout)

        self.okButton.clicked.connect(self.accept)
        self.cancelButton.clicked.connect(self.reject)

    def reset_prompt(self):
        self.prompt_text.setPlainText(DEFAULT_PROMPT)

    def getSelections(self):
        return (
            self.api_key_edit.text(),
            self.term_combo.currentText(),
            self.target_combo.currentText(),
            self.prompt_text.toPlainText(),
            self.batch_size_edit.text(),
        )


def generate_examples_batch(batch_prompt, api_key):
    """
    Calls the OpenAI Chat Completions API using the requests library with a prompt for multiple terms.
    Logs the prompt and the raw response.
    """
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }
    payload = {
        "model": "gpt-4o",
        "messages": [{"role": "system", "content": batch_prompt}],
        "temperature": 0.7,
    }
    print("Batch prompt:")
    print(batch_prompt)
    try:
        response = requests.post(url, headers=headers, json=payload)
        print("API response:")
        print(response.text)
        if response.status_code == 200:
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
        else:
            return f"Error {response.status_code}: {response.text}"
    except Exception as e:
        return f"Error: {e}"


def process_selected_notes(browser):
    note_ids = browser.selectedNotes()
    if not note_ids:
        showInfo("No notes selected.")
        return

    # Retrieve notes and ensure they share the same note type.
    notes = [mw.col.get_note(nid) for nid in note_ids]
    if len({note.mid for note in notes}) > 1:
        showInfo("Please select notes of the same type.")
        return

    # Get field names from the note model.
    model = notes[0].note_type()
    fields = [fld["name"] for fld in model["flds"]]

    # Load configuration.
    config = mw.addonManager.getConfig(__name__) or {}
    default_api_key = config.get("default_api_key")
    default_term_field = config.get("default_term_field")
    default_target_field = config.get("default_target_field")
    default_prompt = config.get("default_prompt")
    default_batch_size = config.get("default_batch_size", DEFAULT_BATCH_SIZE)

    # Show the dialog with saved defaults.
    dlg = FieldSelectionDialog(
        fields,
        default_api_key=default_api_key,
        default_term=default_term_field,
        default_target=default_target_field,
        default_prompt=default_prompt,
        default_batch_size=default_batch_size,
        parent=browser
    )
    if not dlg.exec():
        showInfo("Operation cancelled.")
        return

    api_key, term_field, target_field, prompt, batch_size_str = dlg.getSelections()
    # Save selections to config.
    config["default_api_key"] = api_key
    config["default_term_field"] = term_field
    config["default_target_field"] = target_field
    config["default_prompt"] = prompt
    config["default_batch_size"] = batch_size_str
    mw.addonManager.writeConfig(__name__, config)

    try:
        batch_size = int(batch_size_str)
        if batch_size < 1:
            batch_size = 1
    except Exception:
        batch_size = int(DEFAULT_BATCH_SIZE)

    total_notes = len(notes)
    processed = 0

    # Create a progress dialog.
    progress = QProgressDialog("Generating sentences...", "Cancel", 0, total_notes, browser)
    progress.setWindowTitle("Processing Notes")
    progress.setWindowModality(Qt.WindowModality.WindowModal)
    progress.show()

    # Always use batch processing.
    for i in range(0, total_notes, batch_size):
        if progress.wasCanceled():
            break
        batch = notes[i: i + batch_size]
        # Build a mapping of note id -> note for later updates.
        batch_notes = {note.id: note for note in batch}
        # Build the input lines: one line per note.
        batch_input_lines = []
        for note in batch:
            batch_input_lines.append(f"{note.id}: {note[term_field]}")
        batch_input_text = "\n".join(batch_input_lines)
        # Build the final prompt by appending the inputs to the user's prompt.
        batch_prompt = prompt.strip() + "\n" + batch_input_text
        # Log the prompt and call the API.
        response_text = generate_examples_batch(batch_prompt, api_key)
        # Parse the response.
        # Expected format: for each note, there should be exactly two lines.
        results = {}
        for line in response_text.splitlines():
            line = line.strip()
            if not line:
                continue
            m = re.match(r"^(\d+):\s*(.+)$", line)
            if m:
                note_id_str, sentence = m.groups()
                try:
                    note_id = int(note_id_str)
                    results.setdefault(note_id, []).append(sentence.strip())
                except Exception:
                    pass
        # Update only the notes we sent.
        for note_id, sentences in results.items():
            if note_id in batch_notes:
                new_content = "<br>".join(sentences)
                # If there is existing content, append new content with a <br> separator.
                existing = batch_notes[note_id][target_field].strip()
                if existing:
                    combined = existing + "<br>" + new_content
                else:
                    combined = new_content
                batch_notes[note_id][target_field] = combined
                mw.col.update_note(batch_notes[note_id])
        processed += len(batch)
        progress.setValue(processed)
        progress.repaint()
        mw.app.processEvents()
    progress.close()
    showInfo("Example sentences generated for selected notes.")


def add_menu_item(browser):
    action = QAction("Generate Example Sentences", browser)
    action.triggered.connect(lambda _, b=browser: process_selected_notes(b))
    browser.form.menuEdit.addAction(action)


def on_browser_setup_menus(browser):
    add_menu_item(browser)


addHook("browser.setupMenus", on_browser_setup_menus)
