import { formatDate, disableMultipleLis } from "./FunctLib.js";
import { setUserColor } from "../src/Settings/Settings.js";
import { renderKeyboard } from "./Tools/Keyboard.js";

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
        <li id="SalesInvoice" class="data-entry"><i class="fa fa-th-list"></i> Sales Invoice</li>
        <hr class="menuLine">
        <li data-ref="101" id="salesRankingByLocation">Sales Ranking by Location</li>
        <li data-ref="102" id="salesRankingByBrand">Sales Ranking by Brand</li>
        <li data-ref="103" id="salesRankingByCategory">Sales Ranking by Category</li>
        <li>Daily Sales Summary</li>
        <hr class="menuLine">
        <li>Sales By SKU</li>
    </ul>
</li>
<li class="purchases"><i class="fa fa-cart-arrow-down"></i> Purchases
    <ul class="dropdown submenu">
        <li class="PurchaseOrder data-entry">Purchase Order</li>
        <li id="StockReceiving" class="data-entry"><i class="fa fa-th-list"></i> Stock Receiving Form</li>
        <hr class="menuLine">
        <li>Stock Receiving By SKU</li>
        <li>Stock Receiving By Category</li>
        <li>Stock Receiving By Supplier</li>
    </ul>
</li>
<li class="transfers"><i class="fa fa-truck"></i> Transfers
    <ul class="dropdown submenu">
        <li id="StockTransfer" class="data-entry"><i class="fa fa-th-list"></i> Stock Transfer</li>
        <li class="MerchandisePullOut data-entry">Merchandise Pull Out</li>
        <hr class="menuLine">
        <li>Stock Transfer by SKU</li>
        <li>Stock Transfer by Category</li>
        <li>Stock Transfer by Brand</li>
    </ul>
</li>
<li class="adjustment"><i class="fa fa-clipboard"></i> Adjustments
    <ul class="dropdown submenu">
        <li class="StockAdjustment data-entry">Stock Adjustment</li>
        <hr class="menuLine">
        <li>Adjustments by SKU</li>
        <li>Adjustments by Category</li>
        <li>Adjustments by Brand</li>
    </ul>
</li>
<li class="inventory"><i class="fa fa-boxes"></i> Inventory
    <ul class="dropdown submenu">
        <li class="PhysicalCount data-entry">Physical Count</li>
        <hr class="menuLine">
        <li id='stockEndingByLocation'>Stock Ending By Location</li>
        <li id='stockEndingByBrand'>Stock Ending By Brand</li>
        <li>Stock Movement</li>
        <li>Inventory Variance</li>
    </ul>
</li>
<li class="lookup"><i class="fa fa-table"></i> Lookup Tables
    <ul class="dropdown submenu">
        <li class="Products data-entry"><i class="fa fa-th-list"></i> Products</li>
        <li class="Brands data-entry">Brands</li>
        <li class="Category data-entry">Category</li>
        <li class="Department data-entry">Department</li>
        <li class="Class data-entry">Class</li>
        <hr class="menuLine">
        <li class="Location data-entry"><i class="fa fa-th-list"></i> Location</li>
        <li class="data-entry">Supplier</li>
        <li class="data-entry">Customer</li>
        <li id="AppUsers" class="data-entry"><i class="fa fa-th-list"></i> App Users</li>
    </ul>
</li>
<li class="settings"><i class="fa fa-tools"></i> Settings
    <ul class="dropdown submenu">
        <li class="ThemeColor">Theme Color</li>
        <li class="WallPaper">Wall Paper</li>
        <hr class="menuLine">
        <li id="OSKey">On Screen Keyboard</li>
    </ul>
</li>
<li class="exit"><i class="fa-solid fa-door-open"></i> Exit
    <ul class="dropdown submenu">
        <li class="LogOut">Log-Out</li>
        <li class="About">About</li>
    </ul>
</li>

`;

document.getElementById("menuNavBar").innerHTML = menuItems;
document.getElementById('menuSideBar').innerHTML=`<div class="close-sidebar"><span id="close-sidebar">✖</span></div>`+menuItems

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

document.getElementById('OSKey').addEventListener('click', () =>{
    // window.location.href = 'OSKey.html'
    renderKeyboard()
})

// Run the function once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    applyColorsAndShowContent();
});

const menuOpts = "101,102,104,103";
// Step 1: Split the string into an array
const menuArray = menuOpts.split(',');
// disableMultipleLis(menuArray)