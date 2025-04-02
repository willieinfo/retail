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
    "./images/RetailShopGrocer1.JPG",
    "./images/RetailShopGrocer2.JPG",
    "./images/RetailShopGrocer3.JPG"
];

function changeWallPaper() {
    const selectWallPaper = document.createElement('div');
    selectWallPaper.id = 'selectWallPaper';
    selectWallPaper.classList.add('report-section');

    const titleBarDiv = document.createElement('div');
    titleBarDiv.id = 'titleBarDiv';
    const pickListTitle = document.createElement('span');
    pickListTitle.innerText = "Click to select wall paper from list";
    selectWallPaper.appendChild(titleBarDiv)
    titleBarDiv.appendChild(pickListTitle);
    

    // Create image containers dynamically
    wallpaper.forEach((src, index) => {
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('wallpaperContainer');
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Wallpaper ${index + 1}`;
        img.classList.add('wallpaperImage');
        
        imageContainer.appendChild(img);
        selectWallPaper.appendChild(imageContainer);

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
}

