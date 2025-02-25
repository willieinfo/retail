import { populateBrandNum, populateItemDept, populateItemType, populateCategNum, populateLocation } from "./FunctLib.js";
import { SalesRankBrand, SalesRankStore } from './SaleRepo.js'

export async function FiltrRec(cModules_) {

    // Create the form element
    const filterForm = document.createElement('form');
    filterForm.id = "filter-form";
    filterForm.style.display = "none";  // Start with it hidden

    filterForm.innerHTML = `
        <div id="titleBar">Filter Form</div>
        <div id="inputSection">
            <div id="inputDates" class="subTextDiv" style="flex-direction: row;">
                <div>
                    <label for="DateFrom">From:</label>
                    <input type="date" id="DateFrom">
                </div>
                <div>
                    <label for="Date__To">To:</label>
                    <input type="date" id="Date__To">
                </div>
            </div>
            <div id="inputLocation" class="textDiv">
                <div class="subTextDiv">
                    <label for="Location">Location</label>
                    <select id="Location"></select>
                </div>
            </div>
            <div class="textDiv">
                <div class="subTextDiv">
                    <label for="UsersCde">Stock No</label>
                    <input type="text" id="UsersCde" name="UsersCde" spellcheck="false" >
                </div>
                <div class="subTextDiv">
                    <label for="OtherCde">Bar Code</label>
                    <input type="text" id="OtherCde" name="OtherCde" spellcheck="false" >
                </div>
            </div>

            <div id="inputDescript" class="textDiv">
                <div class="subTextDiv" style="width:100%;">
                    <label for="Descript">Item Description</label>
                    <input type="text" id="Descript" name="Descript" spellcheck="false" >
                </div>
            </div>
            <div class="textDiv">
                <div class="subTextDiv">
                    <label for="BrandNum">Brand</label>
                    <select id="BrandNum"></select>
                </div>
                <div class="subTextDiv">
                    <label for="CategNum">Category</label>
                    <select id="CategNum"></select>
                </div>
            </div>
            <div class="textDiv">
                <div class="subTextDiv">
                    <label for="ItemDept">Department</label>
                    <select id="ItemDept"></select>
                </div>
                <div class="subTextDiv">
                    <label for="ItemType">Class</label>
                    <select id="ItemType"></select>
                </div>
            </div>

            <div id="btnDiv">
                <button type="submit" id="saveBtn"><i class="fa fa-filter"></i>  Filter</button>
                <button type="button" id="cancelBtn"><i class="fa fa-close"></i>  Cancel</button>
            </div>
        </div>
    `;

    // Create the overlay background for the modal
    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black background
    overlay.style.zIndex = 999; 

    // Form styling to center it
    filterForm.style.position = 'absolute';
    filterForm.style.top = '50%';
    filterForm.style.left = '50%';
    filterForm.style.transform = 'translate(-50%, -50%)'; // Center the form
    filterForm.style.backgroundColor = 'whitesmoke';
    filterForm.style.padding = '10px';
    filterForm.style.borderRadius = '8px';
    filterForm.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    filterForm.style.zIndex = 1000; // Ensure the form is above the overlay
    filterForm.style.display = 'flex';
    filterForm.style.flexDirection = 'column';
    filterForm.style.width = '80%';
    filterForm.style.maxWidth = '800px';


    // Append the form to the container with id 'Inventory'
    if (cModules_==='ListItem'){
        document.getElementById('ProductFile').appendChild(filterForm);
        document.getElementById('ProductFile').appendChild(overlay);
        document.getElementById('inputDates').style.display='none'
        document.getElementById('inputLocation').style.display='none'
    } else if (cModules_==='SaleRnk1') {
        document.getElementById('SalesRankStore').appendChild(filterForm);
        document.getElementById('SalesRankStore').appendChild(overlay);
        document.getElementById('inputDescript').style.display='none'
    } else if (cModules_==='SaleRnk2') {
        document.getElementById('SalesRankBrand').appendChild(filterForm);
        document.getElementById('SalesRankBrand').appendChild(overlay);
        document.getElementById('inputDescript').style.display='none'
    }
    // Show the form by changing its display style
    filterForm.style.display='flex'
    let filterData = JSON.parse(localStorage.getItem("filterData"));
    if (!filterData || filterData.length === 0) {
        const currentDate = new Date();
        // Set dDateFrom to the first day of the current month
        const dDateFrom = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); 
        const dDate__To = currentDate; 
        
        // Format the dates to yyyy-mm-dd (ISO format)
        const formattedDateFrom = dDateFrom.toISOString().split('T')[0];
        const formattedDateTo = dDate__To.toISOString().split('T')[0];
        
        // Store them in localStorage as a JSON string
        localStorage.setItem("filterData", JSON.stringify([formattedDateFrom, formattedDateTo]));
        
        filterData = [formattedDateFrom, formattedDateTo];  // Set filterData to the default values
            
    }    
    document.getElementById('DateFrom').value=filterData[0];
    document.getElementById('Date__To').value=filterData[1];
    
    await populateLocation('','')
    await populateBrandNum('','')
    await populateCategNum('','')
    await populateItemDept('','')
    await populateItemType('','')

    document.getElementById('cancelBtn').addEventListener('click', () => {
        document.getElementById('filter-form').remove(); 
        document.getElementById('modal-overlay').remove();  
    });

    document.getElementById('saveBtn').addEventListener('click', (e) => {
        e.preventDefault();
        const dDateFrom=document.getElementById('DateFrom').value;
        const dDate__To=document.getElementById('Date__To').value;
        const cLocation=document.getElementById('Location').value;
        const cUsersCde=document.getElementById('UsersCde').value.trim();
        const cOtherCde=document.getElementById('OtherCde').value.trim();
        const cDescript=document.getElementById('Descript').value.trim();
        const cBrandNum=document.getElementById('BrandNum').value;
        const cCategNum=document.getElementById('CategNum').value;
        const cItemType=document.getElementById('ItemType').value;
        const cItemDept=document.getElementById('ItemDept').value;

        const filterData=[dDateFrom, dDate__To,cLocation,cUsersCde,cOtherCde,
            cDescript,cBrandNum,cCategNum,cItemType,cItemDept]
        localStorage.setItem("filterData", JSON.stringify(filterData));


        document.getElementById('filter-form').remove(); 
        document.getElementById('modal-overlay').remove();  

        if (cModules_==='SaleRnk1') {
            SalesRankStore(cBrandNum, cUsersCde, cOtherCde, 
                cCategNum, cItemDept, cItemType, cLocation, dDateFrom, dDate__To);
        }
        if (cModules_==='SaleRnk2') {
            SalesRankBrand(cBrandNum, cUsersCde, cOtherCde, 
                cCategNum, cItemDept, cItemType, cLocation, dDateFrom, dDate__To);
        }


    })
}

// Add validation for fields after the form is created
// validateField('UsersCde', 'http://localhost:3000/product/checkUsersCde', 'This Stock No (UsersCde) already exists.');
// validateField('OtherCde', 'http://localhost:3000/product/checkOtherCde', 'This Bar Code No (OtherCde) already exists.');
