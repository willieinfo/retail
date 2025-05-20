import { makeDraggable } from '../FunctLib.js'; 

let keyboardContainer = null;
let lastFocusedElement = null;
let shiftState = 'lowercase';
let layoutMode = 'qwerty';
let typedBuffer = '';
let footerCheckbox = null;
let autoPosition = false;

export function renderKeyboard() {
    if (keyboardContainer) {
        keyboardContainer.remove();
    }

    // Track focus on inputs and selects
    document.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('focus', () => {
            lastFocusedElement = el;
            typedBuffer = '';

            // Switch layout mode based on input type
            if (el.tagName === 'TEXTAREA' || el.type === 'text' || el.tagName === 'SELECT') {
                layoutMode = 'qwerty';
            } else if (el.type === 'number') {
                layoutMode = 'numeric';
            } else if (el.type === 'tel') {
                layoutMode = 'tel';
            } else if (el.type === 'password') {
                layoutMode = 'password';
            } else if (el.type === 'email') {
                layoutMode = 'email';
            } else {
                layoutMode = 'qwerty'; // default
            }

            shiftState = 'lowercase';
            buildKeyboard(); // refresh layout
        });
    });

    // Create keyboard container
    keyboardContainer = document.createElement('div');
    keyboardContainer.classList.add('keyboard-wrapper');

    // Restore last position
    const savedPos = localStorage.getItem('keyboardPosition');
    if (savedPos) {
        const { left, top } = JSON.parse(savedPos);
        keyboardContainer.style.left = `${left}px`;
        keyboardContainer.style.top = `${top}px`;
    } else {
        keyboardContainer.style.left = '300px';
        keyboardContainer.style.top = '300px';
    }
    keyboardContainer.style.position = 'absolute';

    // Title bar
    const titleBar = document.createElement('div');
    titleBar.classList.add('keyboard-title');
    titleBar.textContent = 'On-Screen Keyboard';

    const closeButton = document.createElement('span');
    closeButton.classList.add('keyboard-close');
    closeButton.textContent = '✕';
    closeButton.onclick = () => keyboardContainer.remove();
    titleBar.appendChild(closeButton);

    keyboardContainer.appendChild(titleBar);

    // Keyboard layout area
    const keyboard = document.createElement('div');
    keyboard.classList.add('keyboard');
    keyboardContainer.appendChild(keyboard);

    // Footer with checkbox (checkbox before label)
    const footer = document.createElement('div');
    footer.classList.add('keyboard-footer');
    footerCheckbox = document.createElement('input');
    footerCheckbox.type = 'checkbox';
    const checkboxLabel = document.createElement('label');
    checkboxLabel.textContent = 'Auto Position';
    
    // Add the checkbox before the label
    footer.appendChild(footerCheckbox);
    footer.appendChild(checkboxLabel);

    // Apply CSS for horizontal layout
    footer.style.display = 'inline-flex';  
    footer.style.alignItems = 'center';    
    footer.style.margin = '0';             
    footer.style.padding = '0';            
    footer.style.gap = '2px';              

    // Reset margins and padding on checkbox and label
    footerCheckbox.style.margin = '0px 10px 0px 10px';    
    footerCheckbox.style.padding = '0px 10px 0px 10px';   
    checkboxLabel.style.margin = '0';      
    checkboxLabel.style.padding = '0';     

    footerCheckbox.addEventListener('change', (e) => {
        autoPosition = e.target.checked;
        if (autoPosition && lastFocusedElement) {
            adjustPosition();
        }
    });

    keyboardContainer.appendChild(footer);
    document.body.appendChild(keyboardContainer);

    // Make draggable
    makeDraggable(keyboardContainer, titleBar, 'keyboardPosition');

    // Layout definitions
    const keyboardLayouts = {
        qwerty: {
            lowercase: [
                    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
                    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
                    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
                    ['backspace', 'space', 'enter', 'shift', 'tab', ',']
                ],
            uppercase: [
                ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
                ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
                ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
                ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
                ['backspace', 'space', 'enter', 'shift', 'tab', ',']
            ],
            special: [
                ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
                ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
                ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
                ['backspace', 'space', 'enter', 'shift', 'tab', ',']
            ]

        },
        numeric: {
            basic: [
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['0', 'backspace', 'enter', 'tab', ',']
            ]
        },
        tel: {
            basic: [
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['+', '0', 'backspace', 'tab', ',']
            ]
        },
        password: {
            basic: [
                ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
                ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
                ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
                ['backspace', 'space', 'enter', 'shift', 'tab', ',']
            ]
        },
        email: {
            basic: [
                ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
                ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
                ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
                ['backspace', 'space', 'enter', 'shift', 'tab', ',']
            ]
        }
    };

    function buildKeyboard() {
        const layoutObj = keyboardLayouts[layoutMode];
        const layout = layoutObj[shiftState] || layoutObj.basic;

        keyboard.innerHTML = '';
        keyboard.style.gridTemplateColumns = `repeat(${layout[0].length}, 50px)`;

        layout.forEach(row => {
            row.forEach(key => {
                const button = document.createElement('div');
                button.classList.add('key');
                button.textContent = key;

                if (key === 'space') button.classList.add('space');
                if (['backspace', 'shift', 'enter', 'tab', ','].includes(key)) button.classList.add(key);
                if (key === 'shift' && shiftState !== 'lowercase') {
                    button.classList.add('shift-active');
                }

                button.addEventListener('mousedown', e => {
                    e.preventDefault();
                    handleKeyClick(key);
                });

                keyboard.appendChild(button);
            });
        });
    }

    function handleKeyClick(key) {
        const el = lastFocusedElement;
        if (!el) return;

        if (key === 'shift') {
            shiftState = shiftState === 'lowercase' ? 'uppercase' : 'lowercase';
            buildKeyboard();
        } else if (key === 'space') {
            insertToTarget(el, ' ');
        } else if (key === 'backspace') {
            backspaceTarget(el);
        } else if (key === 'enter') {
            if (el.tagName === 'TEXTAREA') {
                insertToTarget(el, '\n');
            }
        } else if (key === 'tab') {
            insertToTarget(el, '\t');
        } else if (key === ',') {
            insertToTarget(el, ',');
        } else {
            insertToTarget(el, key);
        }

        el.focus();
    }

    function insertToTarget(el, char) {
        if (el.tagName === 'SELECT') {
            typedBuffer += char.toLowerCase();
            selectMatchingOption(el, typedBuffer);
        } else if (el.type === 'number' || el.type === 'tel') {
            if (!/\d/.test(char) && char !== '.' && char !== '-' && char !== '+') return;
            el.value += char;
        } else {
            const [start, end] = [el.selectionStart, el.selectionEnd];
            el.value = el.value.substring(0, start) + char + el.value.substring(end);
            el.selectionStart = el.selectionEnd = start + char.length;
        }
    }

    function backspaceTarget(el) {
        if (el.tagName === 'SELECT') {
            typedBuffer = typedBuffer.slice(0, -1);
            selectMatchingOption(el, typedBuffer);
        } else if (el.type === 'number' || el.type === 'tel') {
            el.value = el.value.slice(0, -1);
        } else {
            const [start, end] = [el.selectionStart, el.selectionEnd];
            if (start === end && start > 0) {
                el.value = el.value.slice(0, start - 1) + el.value.slice(end);
                el.selectionStart = el.selectionEnd = start - 1;
            } else {
                el.value = el.value.slice(0, start) + el.value.slice(end);
                el.selectionStart = el.selectionEnd = start;
            }
        }
    }

    function selectMatchingOption(selectEl, typedValue) {
        const match = [...selectEl.options].find(opt =>
            opt.text.toLowerCase().startsWith(typedValue)
        );
        if (match) {
            selectEl.value = match.value;
        }
    }

    function adjustPosition() {
        if (!lastFocusedElement) return;

        const rect = lastFocusedElement.getBoundingClientRect();
        const keyboardRect = keyboardContainer.getBoundingClientRect();
        const titleBarHeight = titleBar.offsetHeight;

        // Horizontal positioning logic (newLeft)
        let newLeft = rect.left + (rect.width - keyboardRect.width) / 2;  // Center the keyboard horizontally based on input element
        const maxLeft = window.innerWidth - keyboardRect.width - 10; // Prevent going off-screen
        if (newLeft < 10) newLeft = 10; // Ensure it doesn't go off the left side
        if (newLeft > maxLeft) newLeft = maxLeft; // Ensure it doesn't go off the right side
        keyboardContainer.style.left = `${newLeft}px`;

        // Vertical positioning logic (newTop)
        if (rect.top > window.innerHeight / 2) {
            let newTop = rect.bottom + 10;
            // Ensure the title bar is always visible
            if (newTop + keyboardRect.height > window.innerHeight) {
                newTop = window.innerHeight - keyboardRect.height - titleBarHeight - 10;
            }
            keyboardContainer.style.top = `${newTop}px`;
        } else {
            let newTop = rect.top - keyboardRect.height - 10;
            if (newTop < titleBarHeight) {
                newTop = titleBarHeight;
            }
            keyboardContainer.style.top = `${newTop}px`;
        }
    }

    // Initial render
    buildKeyboard();
}
