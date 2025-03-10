import { formatDate } from "./FunctLib.js";
import { setUserColor } from "../src/Settings/Settings.js";

// Background Image
const img = document.getElementById('background-image');
// img.style.position = "absolute";
img.style.position = "fixed";
img.style.top = 0;
img.style.left = 0;
img.style.width = "100%";
img.style.height = "100%";
img.style.objectFit = "cover";  
img.style.zIndex = "-1";  

// MainMenu
const menuItems= `
<li class="sales"><i class="fa fa-dollar-sign"></i> Sales
    <ul class="dropdown submenu">
        <li class="SalesInvoice">Sales Invoice</li>
        <hr class="menuLine">
        <li class="salesRankingByLocation">Sales Ranking by Location</li>
        <li class="salesRankingByBrand">Sales Ranking by Brand</li>
        <li>Daily Sales Summary</li>
    </ul>
</li>
<li class="purchases"><i class="fa fa-cart-arrow-down"></i> Purchases
    <ul class="dropdown submenu">
        <li>Purchase Order</li>
        <li>Receiving Report</li>
        <hr class="menuLine">
        <li>By SKU</li>
        <li>By Category</li>
        <li>By Supplier</li>
    </ul>
</li>
<li class="transfers"><i class="fa fa-truck"></i> Transfers
    <ul class="dropdown submenu">
        <li>Stock Transfer</li>
        <li>Merchandise Pull Out</li>
        <hr class="menuLine">
        <li>Stock Transfer by SKU</li>
        <li>Stock Transfer by Category</li>
    </ul>
</li>
<li class="adjustment"><i class="fa fa-clipboard"></i> Adjustments
    <ul class="dropdown submenu">
        <li>Stock Adjustment</li>
        <hr class="menuLine">
        <li>Adjustments by SKU</li>
        <li>Adjustments by Category</li>
    </ul>
</li>
<li class="inventory"><i class="fa fa-boxes"></i> Inventory
    <ul class="dropdown submenu">
        <li>Physical Count</li>
        <hr class="menuLine">
        <li>Stock Ending</li>
        <li>Stock Position</li>
        <li>Inventory Variance</li>
    </ul>
</li>
<li class="lookup"><i class="fa fa-table"></i> Lookup Tables
    <ul class="dropdown submenu">
        <li class="Products">Products</li>
        <li class="Brands">Brands</li>
        <li class="Category">Category</li>
        <li class="Department">Department</li>
        <li class="Class">Class</li>
        <hr class="menuLine">
        <li class="Location">Location</li>
        <li>Supplier</li>
        <li>Customer</li>
        <li>System Users</li>
    </ul>
</li>
<li class="settings"><i class="fa fa-tools"></i> Settings
    <ul class="dropdown submenu">
        <li class="ThemeColor">Theme Color</li>
        <li class="WallPaper">Wall Paper</li>
    </ul>
</li>
<li class="exit"><i class="fa fa-close"></i> Exit
    <ul class="dropdown submenu">
        <li class="LogOut">Log-Out</li>
        <li class="About">About</li>
    </ul>
</li>

`;

document.getElementById("menuNavBar").innerHTML = menuItems;
document.getElementById('menuSideBar').innerHTML=`<div class="close-sidebar">✖</div>`+menuItems

const hamburger = document.querySelector('.hamburger');
const sidebar = document.querySelector('.sidebar');
const closeSidebar = document.querySelector('.close-sidebar');
const sidebarItems = document.querySelectorAll('.sidebar li');
const spanToday = document.getElementById('spanToday')

hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarItems.forEach(i => i.classList.remove('open'));
});

sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
        sidebarItems.forEach(i => i.classList.remove('open'));
        item.classList.toggle('open');
    });
});

const todaysDate = new Date();
const cDateToday=formatDate(todaysDate)
const dayName = todaysDate.toLocaleString('en-US', { weekday: 'long' });
spanToday.innerText=cDateToday+' '+dayName

async function applyColorsAndShowContent() {
    // Apply user color preferences
    setUserColor();
}

// Run the function once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    applyColorsAndShowContent();
});
