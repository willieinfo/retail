
document.addEventListener('DOMContentLoaded', () => {
    const liWallPaperMenu = document.querySelectorAll('.WallPaper');
    liWallPaperMenu.forEach(element => {
        element.addEventListener('click', () => {
            changeWallPaper()
        });
    });
})

const imageSrc=document.getElementById('background-image')

const savedWallPaper=localStorage.getItem('WallPaper')
if (savedWallPaper) {
    imageSrc.src=savedWallPaper
} else {
    imageSrc.src=wallpaper[2] //default
}

const wallpaper=[
    "./images/RetailShop1.JPG",
    "./images/RetailShop2.JPG",
    "./images/RetailShop3.JPG",
    "./images/RetailShopGrocer1.JPG",
    "./images/RetailShopGrocer2.JPG"
]

// Dynamically get the base URL (e.g., 'http://127.0.0.1:5500' or other domain)
const baseURL = window.location.origin;

// Remove the base URL from the full image URL
const relativePath = '.'+imageSrc.src.replace(baseURL, '');

console.log(relativePath); // Logs the relative path like "./images/RetailShop1.JPG"
console.log(wallpaper.indexOf(relativePath)); // Logs the index of the relative path in the wallpaper array

let index = wallpaper.indexOf(relativePath)
function changeWallPaper() {
    // Change the background image
    document.getElementById('background-image').src = wallpaper[index];
    // Update the index to toggle to the next wallpaper
    index = (index + 1) % wallpaper.length;
    localStorage.setItem('WallPaper',wallpaper[index])
}
