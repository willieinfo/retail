import { showReport, showNotification } from '../FunctLib.js';

document.addEventListener('DOMContentLoaded', () => {
    const liWallPaperMenu = document.querySelectorAll('.WallPaper');
    liWallPaperMenu.forEach(element => {
        element.addEventListener('click', () => {
            changeWallPaper()
        });
    });
})

const imageSrc = document.getElementById('background-image');
const savedWallPaper = localStorage.getItem('WallPaper');
if (savedWallPaper) {
    imageSrc.src = savedWallPaper;
} else {
    imageSrc.src = wallpaper[2]; // Default
}

const wallpaper = [
    "./images/RetailShop1.JPG",
    "./images/RetailShop2.JPG",
    "./images/RetailShop3.JPG",
    "./images/RetailShop4.JPG",
    "./images/RetailShop5.JPG",
    "./images/PerfumeShop1.JPG",
    "./images/PerfumeShop2.JPG",
    "./images/HardwareTools1.JPG",
    "./images/HardwareTools2.JPG",
    "./images/RetailShopGrocer1.JPG",
    "./images/RetailShopGrocer2.JPG",
    "./images/RetailShopGrocer3.JPG"
];

function changeWallPaper() {
    const selectWallPaper = document.createElement('div');
    selectWallPaper.id = 'selectWallPaper';
    selectWallPaper.classList.add('report-section');

    const titleBar = document.createElement('div');
    titleBar.id = 'titleBar';
    titleBar.style.display = 'flex';
    titleBar.style.width = '100%';
    titleBar.style.position = "sticky";
    titleBar.style.top = "0px";
    titleBar.style.justifyContent = "space-between";
    titleBar.style.alignItems = "center";
    titleBar.style.padding = "10px";
    titleBar.style.zIndex = "1";
    titleBar.style.borderBottom = "1px solid #ccc";
    
    // Create title text
    const titleText = document.createElement('p');
    titleText.textContent = "Click to select wall paper";
    titleText.style.margin = "0";
    titleText.style.flex = "1";  
    titleText.style.whiteSpace = "nowrap";  
    titleText.style.overflow = "hidden";
    titleText.style.textOverflow = "ellipsis";

    // Create close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'closeForm';
    closeBtn.innerHTML = '<i class="fa fa-close"></i>';
    closeBtn.style.cursor = "pointer";
    closeBtn.style.flex = "0";  
    closeBtn.style.marginLeft = "10px";
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.height = '100%'; 
    closeBtn.classList.add('wiggle-on-hover');

    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.backgroundColor = 'red';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.backgroundColor = ''; // or restore original color
    });
    closeBtn.addEventListener('click', () => {
        selectWallPaper.style.display = 'none';
    });
        
    // Append both to titleBar
    titleBar.appendChild(titleText);
    titleBar.appendChild(closeBtn);
    
    // Append titleBar to the main container
    selectWallPaper.appendChild(titleBar);

    // Create image containers dynamically
    const imgMainDiv = document.createElement('div');
    imgMainDiv.style.display = "flex";
    imgMainDiv.style.flexWrap = "wrap";
    imgMainDiv.style.justifyContent = "center";
    selectWallPaper.appendChild(imgMainDiv)

    wallpaper.forEach((src, index) => {
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('wallpaperContainer');
        imageContainer.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Wallpaper ${index + 1}`;
        img.classList.add('wallpaperImage');
        
        imageContainer.appendChild(img);
        // selectWallPaper.appendChild(imageContainer);
        imgMainDiv.appendChild(imageContainer);

        // Add click event for selecting wallpaper
        imageContainer.addEventListener('click', () => {
            imageSrc.src = src;
            imageSrc.style.objectFit = 'cover';
        });
    });

    // Add buttons for saving or canceling
    const btnDiv = document.createElement('div');
    btnDiv.classList.add('btnDiv');

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.id = 'saveSelectWall';
    saveBtn.classList.add('saveBtn');
    saveBtn.innerHTML = '<i class="fa fa-save"></i> Save';
    saveBtn.addEventListener('click', () => {
        localStorage.setItem('WallPaper', imageSrc.src);
        showNotification("Wall Paper saved successfully!");
        selectWallPaper.style.display = 'none';
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.id = 'cancelSelectWall';
    cancelBtn.classList.add('cancelBtn');
    cancelBtn.innerHTML = '<i class="fa fa-close"></i> Close';
    cancelBtn.addEventListener('click', () => {
        selectWallPaper.style.display = 'none';
    });

    btnDiv.appendChild(saveBtn);
    btnDiv.appendChild(cancelBtn);
    selectWallPaper.appendChild(btnDiv);

    document.body.appendChild(selectWallPaper);

    // Show the wallpaper selection overlay
    selectWallPaper.style.display = 'flex';
    showReport('selectWallPaper')
}

