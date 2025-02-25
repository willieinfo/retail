import { formatDate } from "./FunctLib.js";

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
<li class="sales"><i class="fa fa-money"></i> Sales
    <ul class="dropdown submenu">
        <li class="salesRankingByLocation">Sales Ranking by Location</li>
        <li class="salesRankingByBrand">Sales Ranking by Brand</li>
        <li>Daily Sales Summary</li>
    </ul>
</li>
<li class="purchases">Purchases
    <ul class="dropdown submenu">
        <li>By SKU</li>
        <li>By Category</li>
        <li>By Supplier</li>
    </ul>
</li>
<li class="transfers">Transfers
    <ul class="dropdown submenu">
        <li>Stock Transfer by SKU</li>
        <li>Stock Transfer by Category</li>
    </ul>
</li>
<li class="inventory">Inventory
    <ul class="dropdown submenu">
        <li>Stock Ending</li>
        <li>Stock Position</li>
    </ul>
</li>
<li class="lookup">Lookup Tables
    <ul class="dropdown submenu">
        <li class="Products">Products</li>
        <li class="Location">Location</li>
        <li>Supplier</li>
        <li>Customer</li>
    </ul>
</li>`;

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
