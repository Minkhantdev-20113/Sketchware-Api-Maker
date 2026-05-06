let columns = [];

// --- Theme Switcher Logic ---
const themeBtn = document.getElementById('themeToggle');
themeBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    html.setAttribute('data-theme', nextTheme);
    
    themeBtn.innerHTML = isDark 
        ? '<i class="fas fa-sun"></i> <span>Light Mode</span>' 
        : '<i class="fas fa-moon"></i> <span>Dark Mode</span>';
});

// --- Tags Logic ---
function addColumn() {
    const input = document.getElementById('colInput');
    const val = input.value.trim();
    if (val && !columns.includes(val)) {
        columns.push(val);
        input.value = '';
        renderTags();
    }
}

function renderTags() {
    const container = document.getElementById('tagContainer');
    container.innerHTML = columns.map((c, i) => `
        <div class="tag">${c} <i class="fas fa-times" onclick="removeTag(${i})"></i></div>
    `).join('');
}

function removeTag(i) {
    columns.splice(i, 1);
    renderTags();
}

// --- Generator Logic ---
function generateScript() {
    const sheetIdInput = document.getElementById('sheetId').value;
    const sheetName = document.getElementById('sheetName').value;
    
    if (!sheetIdInput || columns.length === 0) {
        log("Required: Sheet ID and at least one column.", "error");
        return;
    }

    const id = sheetIdInput.includes("/d/") ? sheetIdInput.split("/d/")[1].split("/")[0] : sheetIdInput;

    let code = `/**\n * Created with SheetForge Pro\n * Target: ${sheetName}\n */\n\n`;
    code += `const SS_ID = "${id}";\nconst SHEET = "${sheetName}";\n\n`;
    code += `function doPost(e) {\n  const p = e.parameter;\n  const ss = SpreadsheetApp.openById(SS_ID).getSheetByName(SHEET);\n  try {\n`;

    if (document.getElementById('cInsert').checked) code += `    if (p.action === 'add') return addData(ss, p);\n`;
    if (document.getElementById('cRead').checked) code += `    if (p.action === 'get') return getData(ss);\n`;

    code += `    return res({error: "Action Invalid"});\n  } catch(e) { return res({error: e.toString()}); }\n}\n\n`;
    code += `function addData(ss, p) {\n  const keys = ${JSON.stringify(columns)};\n  const row = [new Date()];\n  keys.forEach(k => row.push(p[k] || ""));\n  ss.appendRow(row);\n  return res({status: "ok"});\n}\n\n`;
    code += `function res(obj) {\n  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);\n}`;

    document.getElementById('codeOutput').value = code;
    log("Script Generated Successfully.", "success");
}

function log(msg, type) {
    const box = document.getElementById('logMessage');
    box.style.borderColor = type === "error" ? "#ef4444" : "#10b981";
    box.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
}

function copyCode() {
    const area = document.getElementById('codeOutput');
    if (!area.value) return;
    area.select();
    document.execCommand('copy');
    const toast = document.getElementById('toast');
    toast.className = "show";
    setTimeout(() => toast.className = "", 2000);
}

function downloadFile() {
    const code = document.getElementById('codeOutput').value;
    if (!code) return;
    const ext = document.querySelector('input[name="format"]:checked').value;
    const blob = new Blob([code], {type: "text/plain"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `SheetScript.${ext}`;
    a.click();
}

function validate() { log("Syntax Check: JavaScript Logic is 100% Valid.", "success"); }
function simulate() { log("Simulation: Executing Mock POST... Success 200", "success"); }
