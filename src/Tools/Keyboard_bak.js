import { makeDraggable } from '../FunctLib.js'; 

let keyboardContainer = null;
let lastFocusedElement = null;
let shiftState = 'lowercase';
let layoutMode = 'qwerty';
let typedBuffer = '';

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

    document.body.appendChild(keyboardContainer);
    

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

    document.body.appendChild(keyboardContainer);

    // Make draggable
    makeDraggable(keyboardContainer, titleBar, 'keyboardPosition');


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
            shiftState = shiftState === 'lowercase' ? 'uppercase'
                       : shiftState === 'uppercase' ? 'special'
                       : 'lowercase';
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

    // Initial render
    buildKeyboard();
}