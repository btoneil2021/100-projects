// Input and preview elements
const markdownInput = document.getElementById('markdownInput');
const markdownPreview = document.getElementById('markdownPreview');

// Buttons for actions
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');

let debounceTimer;
const DEBOUNCE_DELAY = 300; // Responsive and resource-efficient updates
const STORAGE_KEY = 'markdownEditorContent';

// Limits how often function can be executed
function debounce(func, delay) {
    return function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, arguments), delay);
    };
}

function updatePreview() {
    const markdownText = markdownInput.value;
    const htmlContent = marked.parse(markdownText);
    markdownPreview.innerHTML = htmlContent;
}

function saveToLocalStorage() {
    const content = markdownInput.value;
    localStorage.setItem(STORAGE_KEY, content);
    showNotification('Content saved!');
}

function loadFromLocalStorage() {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent !== null) {
        markdownInput.value = savedContent;
        updatePreview();
        showNotification('Content loaded!');
    } else {
        showNotification('No saved content found!', 'error');
    }
}

function clearEditor() {
    if (confirm('Are you sure you want to clear the editor? This cannot be undone.')) {
        markdownInput.value = '';
        updatePreview();
        showNotification('Editor cleared!');
    }
}

function exportAsHTML() {
    const markdownText = markdownInput.value;
    const htmlContent = marked.parse(markdownText);
    
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Markdown</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        h1 {
            font-size: 2rem;
            border-bottom: 2px solid #eee;
            padding-bottom: 0.3rem;
        }
        h2 {
            font-size: 1.5rem;
            border-bottom: 1px solid #eee;
            padding-bottom: 0.3rem;
        }
        code {
            background-color: #f6f8fa;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: monospace;
        }
        pre {
            background-color: #f6f8fa;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
        }
        pre code {
            background-color: transparent;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #ddd;
            padding-left: 1rem;
            color: #666;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1rem;
        }
        table th, table td {
            border: 1px solid #ddd;
            padding: 0.5rem;
            text-align: left;
        }
        table th {
            background-color: #f6f8fa;
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
    
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-export.html';
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('HTML exported successfully!');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 300);
    }, 3000);
}

marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: true,
    langPrefix: 'language-',
    mangle: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false
});

const debouncedUpdate = debounce(updatePreview, DEBOUNCE_DELAY);
markdownInput.addEventListener('input', debouncedUpdate);

saveBtn.addEventListener('click', saveToLocalStorage);
loadBtn.addEventListener('click', loadFromLocalStorage);
clearBtn.addEventListener('click', clearEditor);
exportBtn.addEventListener('click', exportAsHTML);

markdownInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 's':
                e.preventDefault();
                saveToLocalStorage();
                break;
            case 'o':
                e.preventDefault();
                loadFromLocalStorage();
                break;
            case 'e':
                e.preventDefault();
                exportAsHTML();
                break;
        }
    }
});

updatePreview();