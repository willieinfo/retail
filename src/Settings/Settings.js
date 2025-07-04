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
`
const tempDiv = document.createElement('div');
tempDiv.innerHTML = divSettings;
document.body.appendChild(tempDiv.firstElementChild);

const themeColorDiv = document.getElementById('ThemeColor');

// Variable to store the previous theme
let previousTheme = {
    mainBgColor: getComputedStyle(document.documentElement).getPropertyValue('--main-bg-color'),
    secondBgColor: getComputedStyle(document.documentElement).getPropertyValue('--second-bg-color'),
    darkerBgColor: getComputedStyle(document.documentElement).getPropertyValue('--darker-bg-color')
};

// Event listener for Cancel button
document.getElementById('cancelClrBtn').addEventListener('click', () => {

    themeColorDiv.classList.remove('active');

});

// Event listener for the save button
document.getElementById('saveClrBtn').addEventListener('click', async () => {
    const { showNotification } = await import('../FunctLib.js');

    // Capture the current theme colors
    const currentTheme = {
        mainBgColor: getComputedStyle(document.documentElement).getPropertyValue('--main-bg-color').trim(),
        secondBgColor: getComputedStyle(document.documentElement).getPropertyValue('--second-bg-color').trim(),
        darkerBgColor: getComputedStyle(document.documentElement).getPropertyValue('--darker-bg-color').trim()
    };

    // Save the theme colors to Firestore
    try {
        localStorage.setItem('setColors',JSON.stringify(currentTheme));  
        showNotification("Theme color saved successfully!");

        themeColorDiv.classList.remove('active');

    } catch (error) {
        console.error("Error saving theme: ", error);
    }
});    


// Event listeners for each color div
document.getElementById('blackDiv').addEventListener('click', () => changeTheme('black'));
document.getElementById('blueDiv').addEventListener('click', () => changeTheme('blue'));
document.getElementById('greenDiv').addEventListener('click', () => changeTheme('green'));
document.getElementById('violetDiv').addEventListener('click', () => changeTheme('violet'));
document.getElementById('brownDiv').addEventListener('click', () => changeTheme('brown'));
document.getElementById('maroonDiv').addEventListener('click', () => changeTheme('maroon'));
document.getElementById('redDiv').addEventListener('click', () => changeTheme('red'));
document.getElementById('tomatoDiv').addEventListener('click', () => changeTheme('tomato'));

// Function to change the theme based on the selected color
function changeTheme(color) {
    // Save the current theme before changing it
    previousTheme.mainBgColor = getComputedStyle(document.documentElement).getPropertyValue('--main-bg-color');
    previousTheme.secondBgColor = getComputedStyle(document.documentElement).getPropertyValue('--second-bg-color');
    previousTheme.darkerBgColor = getComputedStyle(document.documentElement).getPropertyValue('--darker-bg-color');

    switch (color) {
        case 'black':
            document.documentElement.style.setProperty('--main-bg-color', 'rgb(0,0,0)');
            document.documentElement.style.setProperty('--second-bg-color', 'rgba(121, 121, 121, 0.35)');
            document.documentElement.style.setProperty('--darker-bg-color', 'rgba(100, 100, 100, 0.53)');
            break;
        case 'blue':
            document.documentElement.style.setProperty('--main-bg-color', 'rgb(0, 64, 128)');
            document.documentElement.style.setProperty('--second-bg-color', 'rgb(59, 89, 152)');
            document.documentElement.style.setProperty('--darker-bg-color', 'rgb(0, 0, 105)');
            break;
        case 'green':
            document.documentElement.style.setProperty('--main-bg-color', 'rgb(0, 64, 64)');
            document.documentElement.style.setProperty('--second-bg-color', 'rgb(34, 139, 34)');
            document.documentElement.style.setProperty('--darker-bg-color', 'rgb(0, 100, 0)');
            break;
        case 'violet':
            document.documentElement.style.setProperty('--main-bg-color', 'rgb(64, 0, 128)');
            document.documentElement.style.setProperty('--second-bg-color', 'rgb(138, 43, 226)');
            document.documentElement.style.setProperty('--darker-bg-color', 'rgb(75, 0, 130)');
            break;
        case 'brown':
            document.documentElement.style.setProperty('--main-bg-color', 'rgb(113,56,0)');
            document.documentElement.style.setProperty('--second-bg-color', 'rgb(128,64,0)');
            document.documentElement.style.setProperty('--darker-bg-color', 'rgb(102,51,0)');
            break;
        case 'maroon':
            document.documentElement.style.setProperty('--main-bg-color', 'rgb(128, 0, 64)');
            document.documentElement.style.setProperty('--second-bg-color', 'rgb(176, 0, 0)');
            document.documentElement.style.setProperty('--darker-bg-color', 'rgb(98, 0, 0)');
            break;
        case 'red':
            document.documentElement.style.setProperty('--main-bg-color', 'rgb(179, 0, 0)');
            document.documentElement.style.setProperty('--second-bg-color', 'rgb(220, 20, 60)');
            document.documentElement.style.setProperty('--darker-bg-color', 'rgb(139, 0, 0)');
            break;
        case 'tomato':
            document.documentElement.style.setProperty('--main-bg-color', 'rgb(255, 99, 71)');
            document.documentElement.style.setProperty('--second-bg-color', 'rgb(255, 69, 0)');
            document.documentElement.style.setProperty('--darker-bg-color', 'rgb(255, 0, 0)');
            break;
        default:
            // Default case to reset to a basic theme or handle an error if needed
            document.documentElement.style.setProperty('--main-bg-color', 'rgb(255, 255, 255)');
            document.documentElement.style.setProperty('--second-bg-color', 'rgb(240, 240, 240)');
            document.documentElement.style.setProperty('--darker-bg-color', 'rgb(200, 200, 200)');
            break;
    }
}

export function setUserColor() {
    const setColors = JSON.parse(localStorage.getItem('setColors'));  
    if (setColors) {
        document.documentElement.style.setProperty('--main-bg-color', setColors.mainBgColor.trim());
        document.documentElement.style.setProperty('--second-bg-color', setColors.secondBgColor.trim());
        document.documentElement.style.setProperty('--darker-bg-color', setColors.darkerBgColor.trim());
        // return data;  // Return the document data
    } else {
        const colorData = {
            mainBgColor: 'rgb(0, 64, 128)',
            secondBgColor: 'rgb(59, 89, 152)',
            darkerBgColor: 'rgb(0, 0, 139)',
        };
        document.documentElement.style.setProperty('--main-bg-color', colorData.mainBgColor.trim());
        document.documentElement.style.setProperty('--second-bg-color', colorData.secondBgColor.trim());
        document.documentElement.style.setProperty('--darker-bg-color', colorData.darkerBgColor.trim());
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const { showReport } = await import('../FunctLib.js');

    const liThemeColorMenu = document.querySelectorAll('.ThemeColor');
    liThemeColorMenu.forEach(element => {
        element.addEventListener('click', () => {
            showReport('ThemeColor')
        });
    });
})
