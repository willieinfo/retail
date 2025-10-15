import { showReport, debounce, formatDate, showNotification, formatter, validateField, checkEmptyValue, highlightRow } from '../FunctLib.js';
import { populateBrandNum, populateItemDept, populateItemType, populateCategNum , populateSuppNum_ } from "../FunctLib.js";
import { FiltrRec, displayErrorMsg } from "../FiltrRec.js"
import { printReportExcel, generateTitleRows } from '../PrintRep.js'

const divListItem = `
    <div id="ProductFile" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Product File</span>
            <div class='showRemaining'>
                <button class="fetchDataMore"></button>
                <button id="closeList" class="closeForm">✖</button>
            </div>
        </div>
        <div id="ListItem" class="ReportBody data-list">
            <table>
                <thead id="Look_Up_Head">
                    <tr>
                        <th>System Id</th>
                        <th>Description</th>
                        <th>Stock No</th>
                        <th>Brand</th>
                        <th>Category</th>
                        <th>Item Price</th>
                        <th>Cost</th>
                        <th>Encoder</th>
                        <th>Date Created</th>
                        <th style="width: 25px"></th>
                    </tr>
                </thead>
            </table>
        </div>
        <div class="ReportFooter">
            <div class="footSegments">
                <button id="addItem"><i class="fa fa-add"></i> Add Product</button>
            </div>
            <div class="footSegments">
                <span id="itemListCounter" class="recCounter"></span>
                <button id="printItemXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="filterList"><i class="fa fa-list"></i> List</button>
            </div>
        </div>
    </div>
`
const tempDiv = document.createElement('div');
tempDiv.innerHTML = divListItem;
document.body.appendChild(tempDiv.firstElementChild);

// Batch Fetching
let existingData = [];  
let currentPage = 0
let remainingData = null

let globalData = []; // Define a global array
async function ListItem(cUsersCde, cOtherCde, cDescript, cBrandNum, 
    cItemDept, cItemType, cCategNum) {
    const listCounter=document.getElementById('itemListCounter')
    document.getElementById('loadingIndicator').style.display = 'flex';

    // let data = null;
    try {
        const url = new URL('http://localhost:3000/product/listItem');
        const params = new URLSearchParams();
        if (cUsersCde) params.append('UsersCde', cUsersCde);
        if (cOtherCde) params.append('OtherCde', cOtherCde);
        if (cDescript) params.append('Descript', cDescript);
        if (cBrandNum) params.append('BrandNum', cBrandNum);
        if (cItemDept) params.append('ItemDept', cItemDept);
        if (cItemType) params.append('ItemType', cItemType);
        if (cCategNum) params.append('CategNum', cCategNum);
        
        // Pass the "page" parameter for pagination
        params.append('page', currentPage);
        currentPage += 1

        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) throw new Error('Network response was not ok');

        globalData = await response.json(); 

        const { data: records, totalRecords } = globalData;  
        existingData = [...existingData, ...records]; 
        // Certain mssql servers do not support offset and limit
        // remainingData = totalRecords - existingData.length;

        listCounter.innerHTML = (existingData.length === totalRecords) ? `${existingData.length} Records` 
            : `${existingData.length} of ${totalRecords} Records`;

        globalData = existingData

        const fetchDataMoreButton = document.querySelector('.fetchDataMore');
        // console.log('remainingData',remainingData)
        if (records.length <= 0) {
            fetchDataMoreButton.style.display = 'none'

        } else {
            // Calculate remaining data
            fetchDataMoreButton.style.display = 'block'
            fetchDataMoreButton.innerHTML = `<i class="fa fa-list"></i>  ${remainingData} remaining records`;

            if (remainingData <= 0) {
                fetchDataMoreButton.style.display = 'none'

            }
        }


        updateTable()   // Display ItemList Table
        document.getElementById('printItemXLS').disabled = false

        document.getElementById('ListItemBody').addEventListener('click',async (event) => {
            const delBtn = event.target.closest('.spanDelItem'); // Find the clicked delete button
            if (delBtn) {
                const index = parseInt(delBtn.getAttribute('data-index')); // Get index
                const row = event.target.closest('tr');

                if (!isNaN(index) && index >= 0 && index < globalData.length) {
                    console.log(`Delete clicked for index: ${index}`);
                    const confirmed=confirm(`Do you want to delete ${globalData[index].Descript.trim()}?`)
                    if (confirmed) {
                        const deleted_=await deleteItemList(globalData[index].ItemCode)
                        if (deleted_) {
                            row.classList.add('strikethrough');
                        }
                    }
                }
                // Prevent the row click event (ItemForm) from being triggered when the delete button is clicked
                event.stopPropagation(); // This stops the event from propagating to the parent (row click handler)
            }
        });

        
        document.getElementById('ListItemBody').addEventListener('click', (event) => {
            const row = event.target.closest('tr'); // Find the clicked row
            if (row) {
                // Avoid selecting the row if the delete button is clicked
                if (!event.target.closest('.spanDelItem')) {
                    // // Remove 'selected' class from all rows
                    // const rows = document.querySelectorAll('#ListItemTable tbody tr');
                    // rows.forEach(r => r.classList.remove('selected'));
                    // // Add 'selected' class to the clicked row
                    // row.classList.add('selected');

                    highlightRow(row, '#ListItemTable');
                    
                    // Optionally, call your edit function if needed
                    const index = parseInt(row.getAttribute('data-index'));
                    if (!isNaN(index) && index >= 0 && index < globalData.length) {
                        // console.log(`Row clicked for index: ${index}`);
                        ItemForm(index, true); // Pass only the index to your form
                    }
                }
            }
        });
        
        
    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error,'Fetch error')
    } finally {
        // Hide loading spinner once data is fetched or an error occurs
        document.getElementById('loadingIndicator').style.display = 'none';
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const liProductsMenu = document.querySelectorAll('.Products');
    const productFileDiv = document.getElementById('ProductFile');
    const closeList = document.getElementById('closeList');
    const addItem = document.getElementById('addItem');

    addItem.addEventListener('click', () => {
        ItemForm();
    });

    closeList.addEventListener('click', () => {
        productFileDiv.classList.remove('active');
    });

        // Add event listener to each element with the necessary arguments
    liProductsMenu.forEach(element => {
        element.addEventListener('click', () => {
            showReport('ProductFile')
        });
    });
});


async function updateTableRow(index , cItemCode) {
    const url = new URL('http://localhost:3000/product/getItemReco');
    const params = new URLSearchParams();
    params.append('ItemCode', cItemCode);

    try {
        const response = await fetch(`${url}?${params.toString()}`);
        const updatedItem = await response.json();

        // If updatedItem is an array, access the first element (assuming only one result is returned)
        const item = Array.isArray(updatedItem) && updatedItem.length > 0 ? updatedItem[0] : updatedItem;
    
        if (!item) {
            console.error('No valid item returned.');
            return;
        }

        // Find the row in the table to update using the index
        const row = document.querySelector(`#ListItemTable tbody tr[data-index="${index}"]`);
        if (row) {
            // Update the row's content with the new item data
            row.querySelector('td:nth-child(1)').textContent = item.ItemCode || 'N/A';  // ItemCode
            row.querySelector('td:nth-child(2)').textContent = item.Descript.trim().substring(0, 50) || 'N/A';  // Description
            row.querySelector('td:nth-child(3)').textContent = item.UsersCde || 'N/A';  // Stock No
            row.querySelector('td:nth-child(4)').textContent = item.BrandNme || 'N/A';  // Brand
            row.querySelector('td:nth-child(5)').textContent = item.DeptName.trim() || 'N/A';  // Category
            row.querySelector('td:nth-child(6)').textContent = formatter.format(item.ItemPrce) || 'N/A';  // Item Price
            row.querySelector('td:nth-child(7)').textContent = formatter.format(item.LandCost) || 'N/A';  // Cost
            row.querySelector('td:nth-child(8)').textContent = item.Encoder_ || 'N/A';  
            row.querySelector('td:nth-child(9)').textContent = item.DateCost || 'N/A';  

        }
        globalData[index] = item;

    } catch (error) {
        console.error('Error during fetch:', error);
        displayErrorMsg(error,'Error during fetch')
    }
    
}

async function ItemForm(index, editMode) {
    if (document.getElementById('item-form')) {
        console.log("item-form exists");
        return; // If it already exists, do nothing
    }

    const itemData = globalData[index];
    const cUserData = JSON.parse(sessionStorage.getItem('userdata')); 
    const cSuffixId = (cUserData && cUserData[0]) ? cUserData[0].SuffixId : 'ID';
    const cEncoder_ = (cUserData && cUserData[0]) ? cUserData[0].NickName : 'Sys_User';
    
    // Create the form element
    const itemForm = document.createElement('form');
    itemForm.id = "item-form";
    itemForm.classList.add('item-form');
    itemForm.style.display = "none";  // Start with it hidden

    itemForm.innerHTML = `
        <div id="titleBar">Item Form</div>
        <div class="inputSection">
            <br>
            <div class="textDiv">
                <div class="subTextDiv">
                    <label for="ItemList_UsersCde">Stock No</label>
                    <input type="text" id="ItemList_UsersCde" name="UsersCde" spellcheck="false" required>
                </div>
                <div class="subTextDiv">
                    <label for="ItemList_OtherCde">Bar Code</label>
                    <input type="text" id="ItemList_OtherCde" name="OtherCde" spellcheck="false" required>
                </div>
            </div>

            <div class="textDiv">
                <div class="subTextDiv" style="width:100%;">
                    <label for="ItemList_Descript">Item Description</label>
                    <input type="text" style="width: 100%" id="ItemList_Descript" name="Descript" spellcheck="false" required>
                </div>
            </div>

            <div class="textDiv">
                <div class="subTextDiv">
                    <label for="ItemList_BrandNum">Brand</label>
                    <select id="ItemList_BrandNum" required></select>
                </div>
                <div class="subTextDiv">
                    <label for="ItemList_CategNum">Category</label>
                    <select id="ItemList_CategNum" required></select>
                </div>
            </div>
            <div class="textDiv">
                <div class="subTextDiv">
                    <label for="ItemList_ItemDept">Department</label>
                    <select id="ItemList_ItemDept" required></select>
                </div>
                <div class="subTextDiv">
                    <label for="ItemList_ItemType">Class</label>
                    <select id="ItemList_ItemType" required></select>
                </div>
                <div class="subTextDiv">
                    <label for="ItemList_SuppNum_">Supplier</label>
                    <select id="ItemList_SuppNum_" required></select>
                </div>
            </div>

            <div class="textDiv">
                <div class="subTextDiv">
                    <label for="ItemList_ItemPrce">Item Price</label>
                    <input type="number" id="ItemList_ItemPrce" name="ItemPrce">
                </div>
                
                <div class="subTextDiv">
                    <label for="ItemList_ItemCost">Item Cost</label>
                    <input type="number" id="ItemList_ItemCost" name="ItemCost">
                </div>

                <div class="subTextDiv">
                    <label for="ItemList_LandCost">Land Cost</label>
                    <input type="number" id="ItemList_LandCost" name="LandCost">
                </div>
            </div>
            <div class="textDiv">
                <div id="chkDiv">
                    <input type="checkbox" id="ItemList_Outright" >
                    <label for="ItemList_Outright">Outright</label>
                </div>
                <div id="chkDiv">
                    <input type="checkbox" id="ItemList_Services" >
                    <label for="ItemList_Services">NCV</label>
                </div>
                <div id="chkDiv">
                    <input type="checkbox" id="ItemList_Disabled" >
                    <label for="ItemList_Disabled">Disabled</label>
                </div>
            </div>

            <div class="btnDiv">
                <button type="submit" id="saveItemListBtn" class="saveBtn"><i class="fa fa-save"></i>  Save</button>
                <button type="button" id="cancelItemListBtn" class="cancelBtn"><i class="fa fa-close"></i>  Close</button>
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

    // Append the form to the container with id 'Inventory'
    document.getElementById('ProductFile').appendChild(itemForm);
    document.getElementById('ProductFile').appendChild(overlay);

    // Show the form by changing its display style
    itemForm.style.display='flex'

    await populateBrandNum('','','ItemList');
    await populateItemDept('','','ItemList');
    await populateItemType('','','ItemList');
    await populateCategNum('','','ItemList');
    await populateSuppNum_('','','ItemList');


    if (editMode) {
        // If editing an existing record, show its details
        document.getElementById('ItemList_UsersCde').value = itemData.UsersCde;
        document.getElementById('ItemList_OtherCde').value = itemData.OtherCde;
        document.getElementById('ItemList_Descript').value = itemData.Descript;
        document.getElementById('ItemList_ItemPrce').value = itemData.ItemPrce;
        document.getElementById('ItemList_ItemCost').value = itemData.ItemCost;
        document.getElementById('ItemList_LandCost').value = itemData.LandCost;
        document.getElementById('ItemList_Outright').checked = itemData.Outright===1 ? true : false;
        document.getElementById('ItemList_Disabled').checked = itemData.Disabled ? true : false;
        document.getElementById('ItemList_Services').checked = itemData.Services ? true : false;

        
        // Loop and to find correct option on each select select element
        const brandNumSelect = document.getElementById('ItemList_BrandNum');
        const brandNumValue = itemData.BrandNum; // The value that should be selected
         // Check if the select element has options, then set the selected option
        const options1 = brandNumSelect.options;
        for (let i = 0; i < options1.length; i++) {
            if (options1[i].value == brandNumValue) {
                options1[i].selected = true;
                break; // Exit loop once the option is selected
            }
        }

        const categNumSelect = document.getElementById('ItemList_CategNum');
        const categNumValue = itemData.CategNum; 
        const options2 = categNumSelect.options;
        for (let i = 0; i < options2.length; i++) {
            if (options2[i].value == categNumValue) {
                options2[i].selected = true;
                break; 
            }
        }

        const itemTypeSelect = document.getElementById('ItemList_ItemType');
        const itemTypeValue = itemData.ItemType; 
        const options3 = itemTypeSelect.options;
        for (let i = 0; i < options3.length; i++) {
            if (options3[i].value == itemTypeValue) {
                options3[i].selected = true;
                break; 
            }
        }

        const itemDeptSelect = document.getElementById('ItemList_ItemDept');
        const itemDeptValue = itemData.ItemDept; 
        const options4 = itemDeptSelect.options;
        for (let i = 0; i < options4.length; i++) {
            if (options4[i].value == itemDeptValue) {
                options4[i].selected = true;
                break; 
            }
        }

        
        const suppNum_Select = document.getElementById('ItemList_SuppNum_');
        const suppNum_Value = itemData.SuppNum_; 
        const options5 = suppNum_Select.options;
        for (let i = 0; i < options5.length; i++) {
            if (options5[i].value == suppNum_Value) {
                options5[i].selected = true;
                break; 
            }
        }


    } else {
        // If adding new, populate with default empty values
        document.getElementById('ItemList_UsersCde').value = '';
        document.getElementById('ItemList_OtherCde').value = '';
        document.getElementById('ItemList_Descript').value = '';
        document.getElementById('ItemList_ItemPrce').value = 0.00;
        document.getElementById('ItemList_ItemCost').value = 0.00;
        document.getElementById('ItemList_LandCost').value = 0.00;
        document.getElementById('ItemList_Outright').checked = true ;
        document.getElementById('ItemList_Disabled').checked = false;
        document.getElementById('ItemList_Services').checked = false;

    }        


    // Event listener for Cancel button to close the modal
    document.getElementById('cancelItemListBtn').addEventListener('click', () => {
        document.getElementById('item-form').remove(); // Remove the form from the DOM
        document.getElementById('modal-overlay').remove();  // Remove overlay
    });

    // Event listener for Save button to edit or add data and close the modal
    document.getElementById('saveItemListBtn').addEventListener('click', async (e) => {
        e.preventDefault();

        const cItemCode= editMode ? itemData.ItemCode : 'NEW_ITEM';
        const cUsersCde=document.getElementById('ItemList_UsersCde').value;
        const cOtherCde=document.getElementById('ItemList_OtherCde').value;
        const cDescript=document.getElementById('ItemList_Descript').value;
        const cBrandNum=document.getElementById('ItemList_BrandNum').value;
        const cItemType=document.getElementById('ItemList_ItemType').value;
        const cItemDept=document.getElementById('ItemList_ItemDept').value;
        const cCategNum=document.getElementById('ItemList_CategNum').value;
        const cSuppNum_=document.getElementById('ItemList_SuppNum_').value;
        const nItemPrce=document.getElementById('ItemList_ItemPrce').value;
        const nItemCost=document.getElementById('ItemList_ItemCost').value;
        const nLandCost=document.getElementById('ItemList_LandCost').value;
        const nOutright=document.getElementById('ItemList_Outright').checked ? 1 : 0 
        const lDisabled=document.getElementById('ItemList_Disabled').checked ? 1 : 0 
        const lServices=document.getElementById('ItemList_Services').checked ? 1 : 0 
        

        if (!cUsersCde || !cOtherCde) {
            e.preventDefault();
            if (!cUsersCde) {
                document.getElementById('ItemList_UsersCde').focus();
                document.getElementById('ItemList_UsersCde').classList.add('invalid');  // Add a class to highlight
            } else if (!cOtherCde) {
                document.getElementById('ItemList_OtherCde').focus();
                document.getElementById('ItemList_OtherCde').classList.add('invalid');  // Add a class to highlight
            }
            return;
        }

        
        // Check for Empty Values
        const Descript = document.getElementById('ItemList_Descript');
        const BrandNum = document.getElementById('ItemList_BrandNum');
        const ItemType = document.getElementById('ItemList_ItemType');
        const ItemDept = document.getElementById('ItemList_ItemDept');
        const CategNum = document.getElementById('ItemList_CategNum');
        const SuppNum_ = document.getElementById('ItemList_SuppNum_');
        const ItemPrce = document.getElementById('ItemList_ItemPrce');
        const LandCost = document.getElementById('ItemList_LandCost');

        if (!checkEmptyValue(Descript, BrandNum, CategNum, ItemDept, ItemType, SuppNum_, ItemPrce, LandCost)) {
            return;  // If any field is empty, stop here and do not proceed
        }        
       
      
        if (editMode) {
            // Edit existing record
            editItemList(index, cItemCode,cUsersCde,cOtherCde,cDescript,
                cBrandNum,cItemType,cItemDept,cCategNum,cSuppNum_,
                nItemPrce,nItemCost,nLandCost,
                nOutright,lDisabled,lServices
            )
        
        } else {
            //Await the validateField function to ensure it finishes before proceeding
            const isUsersCdeValid = await validateField('ItemList','UsersCde', 'http://localhost:3000/product/checkUsersCde',
                'Stock No. already exists.', false);
            if (!isUsersCdeValid) {
                // If validation fails, set focus and return early
                document.getElementById('ItemList_UsersCde').focus();
                return;
            }

            const isOtherCdeValid = await validateField('ItemList','OtherCde', 'http://localhost:3000/product/checkOtherCde',
                'Bar Code already exists.', false);
            if (!isOtherCdeValid) {
                // If validation fails, set focus and return early
                document.getElementById('ItemList_OtherCde').focus();
                return;
            }
    
            addItemList(cItemCode,cUsersCde,cOtherCde,cDescript,
                cBrandNum,cItemType,cItemDept,cCategNum,cSuppNum_,
                nItemPrce,nItemCost,nLandCost,
                nOutright,lDisabled,lServices,cSuffixId,cEncoder_
            )
                        
        }
        document.getElementById('item-form').remove(); // Remove the form from the DOM
        document.getElementById('modal-overlay').remove();  // Remove overlay
    });
}


async function editItemList(index, cItemCode,cUsersCde,cOtherCde,cDescript,
    cBrandNum,cItemType,cItemDept,cCategNum,cSuppNum_,
    nItemPrce,nItemCost,nLandCost,
    nOutright,lDisabled,lServices) {
    try {
        nOutright = document.getElementById("ItemList_Outright").checked ? '1' : '2';
        lDisabled = document.getElementById("ItemList_Disabled").checked ? '1' : '0';
        lServices = document.getElementById("ItemList_Services").checked ? '1' : '0';

        const response = await fetch('http://localhost:3000/product/editItemList', {
            method: 'PUT',  // Use PUT method
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cItemCode: cItemCode, 
                cUsersCde: cUsersCde,
                cOtherCde: cOtherCde,
                cDescript: cDescript,
                cBrandNum: cBrandNum,
                cItemType: cItemType,
                cItemDept: cItemDept, 
                cCategNum: cCategNum, 
                cSuppNum_: cSuppNum_,
                nItemPrce: nItemPrce,
                nItemCost: nItemCost,
                nLandCost: nLandCost,
                nOutright: nOutright,
                lDisabled: lDisabled,
                lServices: lServices
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();
        if (updatedItem) {
            updateTableRow(index, cItemCode);
            showNotification('Item record update successful!')
        }
        
    } catch (error) {
        console.error('Update ItemList error:', error);
        displayErrorMsg(error,'Update ItemList error')        
    }
}

async function addItemList(cItemCode,cUsersCde,cOtherCde,cDescript,
    cBrandNum,cItemType,cItemDept,cCategNum,cSuppNum_,
    nItemPrce,nItemCost,nLandCost,
    nOutright,lDisabled,lServices,cSuffixId,cEncoder_) {
    try {
        nOutright = document.getElementById("ItemList_Outright").checked ? '1' : '2';
        lDisabled = document.getElementById("ItemList_Disabled").checked ? '1' : '0';
        lServices = document.getElementById("ItemList_Services").checked ? '1' : '0';

        const response = await fetch('http://localhost:3000/product/addItemList', {
            method: 'POST',  
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cItemCode: cItemCode, 
                cUsersCde: cUsersCde,
                cOtherCde: cOtherCde,
                cDescript: cDescript,
                cBrandNum: cBrandNum,
                cItemType: cItemType,
                cItemDept: cItemDept, 
                cCategNum: cCategNum, 
                cSuppNum_: cSuppNum_,
                nItemPrce: nItemPrce,
                nItemCost: nItemCost,
                nLandCost: nLandCost,
                nOutright: nOutright,
                lDisabled: lDisabled,
                lServices: lServices,
                cSuffixId: cSuffixId,
                cEncoder_: cEncoder_
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();
        if (updatedItem) {
            showNotification('Product record added successful!')
            globalData.push(updatedItem);
            updateTable();            
            // Scroll to the last row after updating the table
            setTimeout(() => {
                const tableBody = document.getElementById('ListItemBody'); 
                if (tableBody) {
                    const lastRow = tableBody.lastElementChild; // Get the last row
                    if (lastRow) {
                        lastRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
                        // 🔹 Simulate a hover effect
                        lastRow.classList.add('hover-effect'); 
                        // 🔹 Remove hover effect after 2 seconds
                        setTimeout(() => lastRow.classList.remove('hover-effect'), 2000);                        
                    }
                }
            }, 100); // Small delay to ensure table updates first
        }

        
    } catch (error) {
        console.error('Update ItemList error:', error);
        displayErrorMsg(error,'Update ItemList error')        
    }
}

function updateTable() {
    const reportBody = document.getElementById('ListItem');
    reportBody.innerHTML = ''; // Clear previous content

    // Generate table rows
    const listTable = `
        <div id="tableDiv">
        <table id="ListItemTable">
            <thead id="Look_Up_Head">
                <tr>
                    <th>System Id</th>
                    <th>Description</th>
                    <th>Stock No</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Item Price</th>
                    <th>Cost</th>
                    <th>Encoder</th>
                    <th>Date Created</th>
                    <th style="width: 25px"></th>
                </tr>
            </thead>
            <tbody id="ListItemBody">
                ${globalData.map((item, index) => `
                    <tr id="trItemList" data-index="${index}" style="${item.Disabled ? 'color: darkgray;' : ''}">
                        <td>${item.ItemCode || 'N/A'}</td>
                        <td class="colNoWrap">${item.Descript.trim().substring(0, 50) || 'N/A'}</td>
                        <td class="colNoWrap">${item.UsersCde || 'N/A'}</td>
                        <td class="colNoWrap">${item.BrandNme || 'N/A'}</td>
                        <td class="colNoWrap">${item.DeptName.trim() || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(item.ItemPrce) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(item.LandCost) || 'N/A'}</td>
                        <td>${item.Encoder_ || 'N/A'}</td>
                        <td>${formatDate(item.DateCost) || 'N/A'}</td>
                        <td class="action-icons">
                            <span class="spanDelItem colEditItem" data-index="${index}">
                                <i class="fa fa-trash"></i>
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </div>
    `;

    reportBody.innerHTML = listTable;
}

async function deleteItemList(cItemCode) {
    try {
        const response = await fetch('http://localhost:3000/product/deleteItemList', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cItemCode: cItemCode })  // Send ItemCode in JSON body
        });

        if (!response.ok) {
            // throw new Error(`HTTP error! Status: ${response.status}`);
            const errorResponse = await response.json();
            if (response.status === 400) {
                alert(`Failed to delete: ${errorResponse.message || 'Invalid data'}`);
            } else {
                alert('An unexpected error occurred while deleting.');
            }            
            return false;

        }

        const result = await response.json();
        console.log('Deleted Rows Affected:', result.rowsAffected);
        alert('Item record deleted successfully');
        return true;

    } catch (error) {
        console.error('Delete ItemList error:', error);
        displayErrorMsg(error,'Delete ItemList error')        
        return false;
    }
}

document.querySelector('.fetchDataMore').addEventListener('click', async () => {
    const filterData = JSON.parse(localStorage.getItem("filterData"));
    const cUsersCde = filterData[3];
    const cOtherCde = filterData[4];
    const cDescript = filterData[5];
    const cBrandNum = filterData[6];
    const cCategNum = filterData[7];
    const cItemType = filterData[8];
    const cItemDept = filterData[9];

    debounce(ListItem(cUsersCde, cOtherCde, cDescript, cBrandNum, 
        cItemDept, cItemType, cCategNum),300);
    
})

document.getElementById('filterList').addEventListener('click', async () => {
    try {
        FiltrRec('ListItem').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));

            const cUsersCde = filterData[3];
            const cOtherCde = filterData[4];
            const cDescript = filterData[5];
            const cBrandNum = filterData[6];
            const cCategNum = filterData[7];
            const cItemType = filterData[8];
            const cItemDept = filterData[9];

            existingData = [];  
            globalData = [];  
            currentPage = 0

            ListItem(cUsersCde, cOtherCde, cDescript, cBrandNum, 
                cItemDept, cItemType, cCategNum);
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,'Error processing the filter')        
    }
});

document.getElementById('printItemXLS').addEventListener('click', () => {
    const titleRowsContent = [
        { text: 'REGENT TRAVEL RETAIL GROUP', style: { fontWeight: 'bold', fontSize: 14 } },
        { text: 'Product List', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
        { text: '' } // Spacer row
    ];


    const colWidths = [
        { width: 14 },{ width: 20 }, { width: 20 }, { width: 40 }, { width: 20 }, { width: 20 }, 
        { width: 20 }, { width: 20 }, { width: 20 }, { width: 10 }, 
    ];

    const columnConfig = [
        {
            label: 'System Id',
            getValue: row => row.ItemCode,
            type: 'string',
            align: 'left'
        },
        {
            label: 'Stock No.',
            getValue: row => row.UsersCde,
            type: 'string',
            align: 'left'
        },
        {
            label: 'Bar Code',
            getValue: row => row.OtherCde,
            type: 'string',
            align: 'left',
        },
        {
            label: 'Description',
            getValue: row => row.Descript,
            type: 'string',
            align: 'left',
        },
        {
            label: 'Brand',
            getValue: row => row.BrandNme,
            type: 'string',
            align: 'center',
        },
        {
            label: 'Class',
            getValue: row => row.TypeDesc,
            type: 'string',
            align: 'left',
        },
        {
            label: 'Department',
            getValue: row => row.DeptName,
            type: 'string',
            align: 'left',
        },
        {
            label: 'Item Price',
            getValue: row => row.ItemPrce,
            type: 'number',
            align: 'right',
            cellFormat: '#,##0.00' // changed format to cellFormat
        },
        {
            label: 'Item LCost',
            getValue: row => row.LandCost,
            type: 'number',
            align: 'right',
            cellFormat: '#,##0.00' // changed format to cellFormat
        },
    ];
    
    const titleRows = generateTitleRows(columnConfig, titleRowsContent, 0);
    
    printReportExcel(globalData, columnConfig, colWidths, titleRows, 'Product List', 2);
})