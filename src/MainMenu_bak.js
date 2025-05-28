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
        <li menu-ref="A01" class="SalesInvoice data-entry"><i class="fa fa-th-list"></i> Sales Invoice</li>
        <hr class="menuLine">
        <li menu-ref="A02" class="salesRankingByLocation">Sales Ranking by Location</li>
        <li menu-ref="A03" class="salesRankingByBrand">Sales Ranking by Brand</li>
        <li menu-ref="A04" id="salesRankingByCategory">Sales Ranking by Category</li>
        <li menu-ref="A05" id="dailySalesSum">Daily Sales Summary</li>
        <hr class="menuLine">
        <li menu-ref="A06" >Sales By SKU</li>
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

// // Define the HTML template literal for the menu container
// const menuContainer = `
//     <div id="selectMenu">
//         <!-- This is where the dynamic menu will be inserted -->
//     </div>
// `;

// // Inject the menu container into the body or another element
// document.body.innerHTML += menuContainer; // Appending to the body or to a specific container

// // Now get the menu container div where we will render the menu items
// const menuSelectDiv = document.getElementById("selectMenu");
// // Style the container dynamically (you can also apply styles directly in CSS)
// menuSelectDiv.style.display = 'flex';
// menuSelectDiv.style.flexDirection = 'column';
// menuSelectDiv.style.padding = '20px';
// menuSelectDiv.style.backgroundColor = 'white';
// menuSelectDiv.style.height = '400px';
// menuSelectDiv.style.width = '600px';
// menuSelectDiv.style.overflowY = 'auto';
// menuSelectDiv.style.zIndex = '800';
// menuSelectDiv.style.border = '1px solid #ddd';

// // // Function to parse menu items and create an array structure
// function parseMenuItems(menuHTML) {
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(menuHTML, 'text/html');

//     const menuList = Array.from(doc.querySelectorAll('li')).map(parent => {
//         const submenu = parent.querySelector('.submenu');
        
//         if (submenu) {
//             const categoryName = parent.textContent.trim().split('\n')[0].trim();

//             const subMenuItems = Array.from(submenu.querySelectorAll('li')).map(item => {
//                 return {
//                     name: item.textContent.trim(),
//                     ref: item.getAttribute('menu-ref'),
//                     id: item.id || null,
//                     selected: false // Initially, not selected
//                 };
//             });

//             return { category: categoryName, items: subMenuItems };
//         }
//     }).filter(Boolean); // Filter out any null or undefined entries (in case no submenu exists)

//     return menuList;
// }


// // Function to render the menu with checkboxes
// let menu = [];
// function renderMenu() {
//     // const menuSelectDiv = document.getElementById('menu-container');
//     menuSelectDiv.innerHTML = ''; // Clear the container before rendering

//     menu.forEach(category => {
//         const categoryElement = document.createElement('div');
//         const categoryHeader = document.createElement('h4');
//         categoryHeader.textContent = category.category;
//         categoryElement.appendChild(categoryHeader);

//         const submenu = document.createElement('ul');
//         category.items.forEach(item => {
//             const menuItem = document.createElement('li');

//             // Create div for checkbox and label
//             const checkboxDiv = document.createElement('div');
//             const labelDiv = document.createElement('div');
            
//             // Create checkbox
//             const checkbox = document.createElement('input');
//             checkbox.type = 'checkbox';
//             checkbox.id = item.ref;  // Set a unique id for each checkbox
//             checkbox.checked = item.selected; // Check if the item is selected
//             checkbox.addEventListener('change', () => toggleMenuItem(item.ref));
            
//             // Create label
//             const label = document.createElement('label');
//             label.setAttribute('for', item.ref);  // Associate the label with the checkbox by setting 'for' to the checkbox's id
//             label.textContent = item.name;
            
//             // Append checkbox and label to their respective divs
//             checkboxDiv.appendChild(checkbox);
//             labelDiv.appendChild(label);

//             // Style the divs to have fixed widths and align them
//             checkboxDiv.style.width = '30px'; // Set a fixed width for the checkbox
//             checkboxDiv.style.textAlign = 'center'; // Align the checkbox in the center
            
//             labelDiv.style.flex = '1'; // Take the remaining space
//             labelDiv.style.textAlign = 'left'; // Align the label text to the left

//             // Append the divs to the menuItem
//             menuItem.appendChild(checkboxDiv);
//             menuItem.appendChild(labelDiv);

//             // Use flexbox to align the divs horizontally
//             menuItem.style.display = 'flex';
//             menuItem.style.alignItems = 'center';  // Vertically center the items
//             menuItem.style.marginBottom = '5px';   // Optional: adds spacing between items
//             menuItem.style.paddingRight = '10px';  // Optional: adds space between the checkbox and the edge


//             submenu.appendChild(menuItem);
//         });
        
//         categoryElement.appendChild(submenu);
//         menuSelectDiv.appendChild(categoryElement);
//     });
// }

// // Function to toggle a menu item (update its selection state)
// function toggleMenuItem(ref) {
//     // Find the item by its reference and toggle its selection state
//     menu.forEach(category => {
//         category.items.forEach(item => {
//             if (item.ref === ref) {
//                 item.selected = !item.selected; // Toggle selection
//             }
//         });
//     });

//     updateMenuOpts(); // Update the menuOpts string after toggle
// }

// // Function to update the menuOpts string
// function updateMenuOpts() {
//     // Generate a comma-separated string of selected menu refs
//     const selectedItems = [];
//     menu.forEach(category => {
//         category.items.forEach(item => {
//             if (item.selected) {
//                 selectedItems.push(item.ref); // Push the reference of selected items
//             }
//         });
//     });

//     const menuOpts = selectedItems.join(','); // Create the menuOpts string
//     console.log('menuOpts:', menuOpts); // You can send this to the backend or use it elsewhere
// }

// // Function to initialize the menu based on selected options
// function initializeMenu(menuOpts) {
//     const selectedRefs = menuOpts.split(',');

//     menu.forEach(category => {
//         category.items.forEach(item => {
//             if (selectedRefs.includes(item.ref)) {
//                 item.selected = true; // Mark as selected (crossed out)
//             }
//         });
//     });

//     renderMenu(); // Re-render the menu after initialization
// }

// // Simulate fetching menuOpts from backend and initializing the menu
// const menuOpts = "A02,A04,B03,B04,B05"; // Simulated value from backend
// menu = parseMenuItems(menuItems); // Parse the menu structure
// initializeMenu(menuOpts);  // Initialize the menu with the selected options