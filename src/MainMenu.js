
import { formatDate, disableMultipleLis, disableNoMenuRefLis } from "./FunctLib.js";
import { setUserColor } from "./Settings/Settings.js";
import { renderKeyboard } from "./Tools/Keyboard.js";

// window.onload = function() {
//     // Check if the user is logged in
//     if (sessionStorage.getItem('loggedIn') !== 'true') {
//         window.location.href = "./LogIn.html"; 
//     } else {
//         document.body.style.visibility = 'visible';
//     }
// };

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

{/* <i class="fa fa-arrow-right" aria-hidden="true"></i> */}


// MainMenu
const menuItems= `
<li class="sales"><i class="fa fa-dollar-sign"></i> Sales
    <ul class="dropdown submenu">
        <li menu-ref="A01" class="SalesInvoice data-entry"><i class="fa fa-th-list"></i> Sales Invoice</li>
        <hr class="menuLine">
        <li menu-ref="A02" class="salesRankingByLocation">Sales Ranking by Location</li>
        <li menu-ref="A03" class="salesRankingByBrand">Sales Ranking by Brand</li>
        <li menu-ref="A04" class="salesRankingByType">Sales Ranking by Classification</li>
        <li menu-ref="A05" class="salesRankingByStock">Sales By SKU</li>
        <hr class="menuLine">
        <li menu-ref="A06" class="dailySalesSum">Daily Sales Summary</li>
        <li menu-ref="A07" class="monthlySalesSum">Monthly Sales Summary</li>
    </ul>
</li>
<li class="purchases"><i class="fa fa-cart-arrow-down"></i> Purchases
    <ul class="dropdown submenu">
        <li> Purchase Order</li>
        <li menu-ref="B02" class="StockReceiving data-entry"><i class="fa fa-th-list"></i> Stock Receiving Form</li>
        <hr class="menuLine">
        <li menu-ref="B03" class="purchReportByStock">Stock Receiving By SKU</li>
        <li menu-ref="B04" class="purchSumByType">Receiving Summary By Classification</li>
        <li menu-ref="B05" class="purchSumBySupp">Receiving Summary By Supplier</li>
        <li menu-ref="B06" class="purchSumByBrnd">Receiving Summary By Brand</li>
    </ul>
</li>
<li class="transfers"><i class="fa fa-truck"></i> Transfers
    <ul class="dropdown submenu">
        <li menu-ref="C01" class="StockTransfer data-entry"><i class="fa fa-th-list"></i> Stock Transfer</li>
        <li menu-ref="C02" class="MerchandisePullOut data-entry">Merchandise Pull Out</li>
        <hr class="menuLine">
        <li>Stock Transfer by SKU</li>
        <li>Stock Transfer by Classification</li>
        <li>Stock Transfer by Brand</li>
    </ul>
</li>
<li class="adjustment"><i class="fa fa-clipboard"></i> Adjustments
    <ul class="dropdown submenu">
        <li menu-ref="D01" class="StockAdjustment data-entry">Stock Adjustment</li>
        <hr class="menuLine">
        <li>Adjustments by SKU</li>
        <li>Adjustments by Classification</li>
        <li>Adjustments by Brand</li>
    </ul>
</li>
<li class="inventory"><i class="fa fa-boxes"></i> Inventory
    <ul class="dropdown submenu">
        <li menu-ref="E01" class="PhysicalCount data-entry">Physical Count</li>
        <hr class="menuLine">
        <li menu-ref="E02"  class='stockEndingByLocation'>Stock Ending By Location</li>
        <li menu-ref="E03"  class='stockEndingByBrand'>Stock Ending By Brand</li>
        <li>Stock Movement</li>
        <li>Inventory Variance</li>
    </ul>
</li>
<li class="lookup"><i class="fa fa-table"></i> Lookup Tables
    <ul class="dropdown submenu">
        <li menu-ref="F01" class="Products data-entry"><i class="fa fa-th-list"></i> Products</li>
        <li> Brands</li>
        <li> Category</li>
        <li> Department</li>
        <li> Classification</li>
        <hr class="menuLine">
        <li menu-ref="F06" class="Location data-entry"><i class="fa fa-th-list"></i> Location</li>
        <li> Supplier</li>
        <li> Customer</li>
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
        <li >About</li>
    </ul>
</li>
`;

// Sample Code with dropdown
// <li menu-ref="A07" class="monthlySalesSum">Monthly Sales Summary <i class="fa-solid fa-chevron-right"></i>
//     <ul class="subDropdown">
//         <li menu-ref="A08">By Location</li>
//         <li menu-ref="A09" class="monthlySalesSumByBrand">By Brand</li>
//     </ul>
// </li>


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

const monthlySalesSum = document.querySelectorAll('.monthlySalesSum');
const purchSumByBrand = document.querySelectorAll('.purchSumByBrand');


const spanToday = document.getElementById('spanToday')

hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarItems.forEach(i => i.classList.remove('open'));
});

sidebarItems.forEach(item => {
    item.addEventListener('click', (event) => {
        // Avoid collapsing submenu when clicking on .monthlySalesSum
        // you can add more subDropdown using the OR || script
        if (event.target.closest('.monthlySalesSum')) {
            return;
        }
        sidebarItems.forEach(i => i.classList.remove('open'));
        item.classList.toggle('open');
    });
});


monthlySalesSum.forEach(item => {
    item.addEventListener('click', function (event) {
        // Prevent the dropdown from closing immediately upon click
        event.stopPropagation();
        
        const subDropdown = item.querySelector('.subDropdown');
        
        document.querySelectorAll('.subDropdown').forEach(dropdown => {
            if (dropdown !== subDropdown) {
                dropdown.classList.remove('show'); 
            }
        });
        
        subDropdown.classList.toggle('show'); // Toggle the display of the submenu
    });
});

document.querySelectorAll('.monthlySalesSumByBrand').forEach(element =>{
    element.addEventListener('click', () => {
        alert('monthly sales by brand')
    })
})

purchSumByBrand.forEach(item => {
    item.addEventListener('click', function (event) {
        // Prevent the dropdown from closing immediately upon click
        event.stopPropagation();
        
        const subDropdown = item.querySelector('.subDropdown');
        
        document.querySelectorAll('.subDropdown').forEach(dropdown => {
            if (dropdown !== subDropdown) {
                dropdown.classList.remove('show'); // Close others
            }
        });
        
        subDropdown.classList.toggle('show'); // Toggle the display of the submenu
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
} else {
    disableNoMenuRefLis()
}

// Check if tables exist, create if none
function createTables() {
    fetch('http://localhost:3000/lookup/createTables', {
        method: 'POST'
    })
    // .then(response => response.json())
    // .then(data => console.log(data))
    // .catch(err => console.error('createTables error', err));

}
createTables(); // Call once at startup
