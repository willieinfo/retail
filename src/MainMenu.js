
import { formatDate, disableMultipleLis } from "./FunctLib.js";
import { setUserColor } from "./Settings/Settings.js";
import { renderKeyboard } from "./Tools/Keyboard.js";

window.onload = function() {
    // Check if the user is logged in
    if (sessionStorage.getItem('loggedIn') !== 'true') {
        window.location.href = "./LogIn.html"; 
    } else {
        document.body.style.visibility = 'visible';
    }
};

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
        <li menu-ref="A01" class="SalesInvoice data-entry"><i class="fa fa-th-list"></i> Sales Invoice</li>
        <hr class="menuLine">
        <li menu-ref="A02" class="salesRankingByLocation">Sales Ranking by Location</li>
        <li menu-ref="A03" class="salesRankingByBrand">Sales Ranking by Brand</li>
        <li menu-ref="A04" class="salesRankingByCategory">Sales Ranking by Category</li>
        <li menu-ref="A05" class="dailySalesSum">Daily Sales Summary</li>
        <hr class="menuLine">
        <li menu-ref="A06" class="salesRankingByStock">Sales By SKU</li>
    </ul>
</li>
<li class="purchases"><i class="fa fa-cart-arrow-down"></i> Purchases
    <ul class="dropdown submenu">
        <li menu-ref="B01" class="PurchaseOrder data-entry">Purchase Order</li>
        <li menu-ref="B02" class="StockReceiving data-entry"><i class="fa fa-th-list"></i> Stock Receiving Form</li>
        <hr class="menuLine">
        <li menu-ref="B03" >Stock Receiving By SKU</li>
        <li menu-ref="B04" >Stock Receiving By Category</li>
        <li menu-ref="B05" >Stock Receiving By Supplier</li>
    </ul>
</li>
<li class="transfers"><i class="fa fa-truck"></i> Transfers
    <ul class="dropdown submenu">
        <li menu-ref="C01" class="StockTransfer data-entry"><i class="fa fa-th-list"></i> Stock Transfer</li>
        <li menu-ref="C02" class="MerchandisePullOut data-entry">Merchandise Pull Out</li>
        <hr class="menuLine">
        <li menu-ref="C03" >Stock Transfer by SKU</li>
        <li menu-ref="C04" >Stock Transfer by Category</li>
        <li menu-ref="C05" >Stock Transfer by Brand</li>
    </ul>
</li>
<li class="adjustment"><i class="fa fa-clipboard"></i> Adjustments
    <ul class="dropdown submenu">
        <li menu-ref="D01" class="StockAdjustment data-entry">Stock Adjustment</li>
        <hr class="menuLine">
        <li menu-ref="D02" >Adjustments by SKU</li>
        <li menu-ref="D03" >Adjustments by Category</li>
        <li menu-ref="D04" >Adjustments by Brand</li>
    </ul>
</li>
<li class="inventory"><i class="fa fa-boxes"></i> Inventory
    <ul class="dropdown submenu">
        <li menu-ref="E01" class="PhysicalCount data-entry">Physical Count</li>
        <hr class="menuLine">
        <li menu-ref="E02"  id='stockEndingByLocation'>Stock Ending By Location</li>
        <li menu-ref="E03"  id='stockEndingByBrand'>Stock Ending By Brand</li>
        <li menu-ref="E04" >Stock Movement</li>
        <li menu-ref="E05" >Inventory Variance</li>
    </ul>
</li>
<li class="lookup"><i class="fa fa-table"></i> Lookup Tables
    <ul class="dropdown submenu">
        <li menu-ref="F01" class="Products data-entry"><i class="fa fa-th-list"></i> Products</li>
        <li menu-ref="F02" class="Brands data-entry">Brands</li>
        <li menu-ref="F03" class="Category data-entry">Category</li>
        <li menu-ref="F04" class="Department data-entry">Department</li>
        <li menu-ref="F05" class="Class data-entry">Class</li>
        <hr class="menuLine">
        <li menu-ref="F06" class="Location data-entry"><i class="fa fa-th-list"></i> Location</li>
        <li menu-ref="F07" class="data-entry">Supplier</li>
        <li menu-ref="F08" class="data-entry">Customer</li>
        <li menu-ref="F09" class="AppUsers data-entry"><i class="fa fa-th-list"></i> App Users</li>
    </ul>
</li>
<li class="settings"><i class="fa fa-tools"></i> Settings
    <ul class="dropdown submenu">
        <li menu-ref="G01" class="ThemeColor">Theme Color</li>
        <li menu-ref="G02" class="WallPaper">Wall Paper</li>
        <hr menu-ref="G03" class="menuLine">
        <li menu-ref="G04" class="OSKey">On Screen Keyboard</li>
    </ul>
</li>
<li class="exit"><i class="fa-solid fa-door-open"></i> Exit
    <ul class="dropdown submenu">
        <li menu-ref="H01" class="LogOut">Log-Out</li>
        <li menu-ref="H02" class="About">About</li>
    </ul>
</li>
`;

// Check if the stored value exists and if it needs updating
if (!localStorage.getItem('menuItems') || localStorage.getItem('menuItems') !== menuItems) {
    // Only update if the value has changed
    localStorage.setItem('menuItems', menuItems);
}
document.getElementById("menuNavBar").innerHTML = menuItems;
document.getElementById('menuSideBar').innerHTML=`<div class="close-sidebar"><span id="closeSidebar">✖</span></div>`+menuItems

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

const liOSKey=document.querySelectorAll('.OSKey')
liOSKey.forEach(element => {
    element.addEventListener('click', () =>{
        renderKeyboard()
    })
})

// Run the function once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    applyColorsAndShowContent();
});

document.querySelectorAll('.LogOut').forEach( el =>{
    el.addEventListener('click', () => {
        sessionStorage.removeItem('loggedIn'); // Clear login state
        window.location.href = './LogIn.html'; // Redirect to login page

    })
})

const cUserData = JSON.parse(sessionStorage.getItem('userdata'));
if (cUserData) {
    disableMultipleLis(cUserData[0].MenuOpts.trim());
    if (cUserData[0].NickName) spanToday.innerText = cUserData[0].UserName.trim()+' - '+spanToday.innerText
}
