// Theme UI HTML template
const divSettings = `
    <div id="ThemeColor" class="report-section">
        <div id="colorsDiv">
            <p>Choose Theme Color</p>
            <div class="grpColorDivs">
                <div id="blackDiv" class="circleClr"></div>
                <div id="blueDiv" class="circleClr"></div>
                <div id="greenDiv" class="circleClr"></div>
                <div id="violetDiv" class="circleClr"></div>
            </div>
            <div class="grpColorDivs">
                <div id="brownDiv" class="circleClr"></div>
                <div id="maroonDiv" class="circleClr"></div>
                <div id="redDiv" class="circleClr"></div>
                <div id="tomatoDiv" class="circleClr"></div>
            </div>
            <div class="btnDiv">
                <button type="submit" id="saveClrBtn" class="saveBtn">Save</button>
                <button type="button" id="cancelClrBtn" class="cancelBtn">Close</button>
            </div>
        </div>
    </div>
`;

// Default theme fallback
const defaultTheme = {
    mainBgColor: 'rgb(0, 64, 128)',
    secondBgColor: 'rgb(59, 89, 152)',
    darkerBgColor: 'rgb(0, 0, 139)',
};

// Load user's saved color theme or apply default
export function setUserColor() {
    const setColors = JSON.parse(localStorage.getItem('setColors'));
    const theme = setColors || defaultTheme;

    document.documentElement.style.setProperty('--main-bg-color', theme.mainBgColor.trim());
    document.documentElement.style.setProperty('--second-bg-color', theme.secondBgColor.trim());
    document.documentElement.style.setProperty('--darker-bg-color', theme.darkerBgColor.trim());
}

// Create and inject the settings UI into the DOM (idempotent)
export function initThemeSettingsUI() {
    if (document.getElementById('ThemeColor')) return; // Already added

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = divSettings;
    document.body.appendChild(tempDiv.firstElementChild);

    setupThemeListeners();
}

// Bind all event listeners after UI is inserted
function setupThemeListeners() {
    const themeColorDiv = document.getElementById('ThemeColor');

    // Cancel button hides theme UI
    document.getElementById('cancelClrBtn').addEventListener('click', () => {
        themeColorDiv.classList.remove('active');
    });

    // Save button stores current theme
    document.getElementById('saveClrBtn').addEventListener('click', async () => {
        const { showNotification } = await import('./FunctLib.js');

        const currentTheme = {
            mainBgColor: getComputedStyle(document.documentElement).getPropertyValue('--main-bg-color').trim(),
            secondBgColor: getComputedStyle(document.documentElement).getPropertyValue('--second-bg-color').trim(),
            darkerBgColor: getComputedStyle(document.documentElement).getPropertyValue('--darker-bg-color').trim()
        };

        try {
            localStorage.setItem('setColors', JSON.stringify(currentTheme));
            showNotification("Theme color saved successfully!");
            themeColorDiv.classList.remove('active');
        } catch (error) {
            console.error("Error saving theme:", error);
        }
    });

    // Color selection handlers
    const colorIds = ['black', 'blue', 'green', 'violet', 'brown', 'maroon', 'red', 'tomato'];
    colorIds.forEach(color => {
        document.getElementById(`${color}Div`).addEventListener('click', () => changeTheme(color));
    });
}

// Theme application logic
function changeTheme(color) {
    const themes = {
        black: {
            main: 'rgb(0,0,0)',
            second: 'rgb(121,121,121)',
            darker: 'rgb(100,100,100)'
        },
        blue: {
            main: 'rgb(0, 64, 128)',
            second: 'rgb(59, 89, 152)',
            darker: 'rgb(0, 0, 105)'
        },
        green: {
            main: 'rgb(0, 64, 64)',
            second: 'rgb(34, 139, 34)',
            darker: 'rgb(0, 100, 0)'
        },
        violet: {
            main: 'rgb(64, 0, 128)',
            second: 'rgb(138, 43, 226)',
            darker: 'rgb(75, 0, 130)'
        },
        brown: {
            main: 'rgb(113,56,0)',
            second: 'rgb(128,64,0)',
            darker: 'rgb(102,51,0)'
        },
        maroon: {
            main: 'rgb(128, 0, 64)',
            second: 'rgb(176, 0, 0)',
            darker: 'rgb(98, 0, 0)'
        },
        red: {
            main: 'rgb(179, 0, 0)',
            second: 'rgb(220, 20, 60)',
            darker: 'rgb(139, 0, 0)'
        },
        tomato: {
            main: 'rgb(255, 99, 71)',
            second: 'rgb(255, 69, 0)',
            darker: 'rgb(255, 0, 0)'
        }
    };

    const selected = themes[color] || defaultTheme;

    document.documentElement.style.setProperty('--main-bg-color', selected.main);
    document.documentElement.style.setProperty('--second-bg-color', selected.second);
    document.documentElement.style.setProperty('--darker-bg-color', selected.darker);
}

// Optional: Connect theme menu clicks to display the UI
export function activateThemeMenu() {
    document.addEventListener('DOMContentLoaded', async () => {
        const { showReport } = await import('../FunctLib.js');
        document.querySelectorAll('.ThemeColor').forEach(el => {
            el.addEventListener('click', () => {
                showReport('ThemeColor');
                document.getElementById('ThemeColor')?.classList.add('active');
            });
        });
    });
}
document.addEventListener('DOMContentLoaded', async () => {
    // const { showReport } = await import('../FunctLib.js');

    const liThemeColorMenu = document.querySelectorAll('.ThemeColor');
    liThemeColorMenu.forEach(element => {
        element.addEventListener('click', () => {
            // showReport('ThemeColor')
            initThemeSettingsUI()
        });
    });
})
