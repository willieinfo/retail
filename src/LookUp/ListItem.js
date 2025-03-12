import { showReport, showNotification, formatter, validateField, checkEmptyValue } from '../FunctLib.js';
import { populateBrandNum, populateItemDept, populateItemType, populateCategNum , populateSuppNum_ } from "../FunctLib.js";
import { FiltrRec } from "../FiltrRec.js"


let globalData = []; // Define a global array
async function ListItem(cUsersCde, cOtherCde, cDescript, cBrandNum, 
    cItemDept, cItemType, cCategNum) {
    const listCounter=document.getElementById('itemListCounter')
    document.getElementById('loadingIndicator').style.display = 'flex';

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

        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) throw new Error('Network response was not ok');

        globalData = await response.json(); // Store full data array globally
        showNotification(`${globalData.length} Item Records fetched`);
        listCounter.innerHTML=`${globalData.length} Records`

        // console.log(globalData[3])

        updateTable()   //Render / Display ItemList Table

        // document.getElementById('ListItemBody').addEventListener('click', (event) => {
        //     const editBtn = event.target.closest('.spanEditItem'); // Find the clicked edit button
        //     if (editBtn) {
        //         const index = parseInt(editBtn.getAttribute('data-index')); // Get index
        //         if (!isNaN(index) && index >= 0 && index < globalData.length) {
        //             console.log(`Edit clicked for index: ${index}`);
        //             ItemForm(index); // Pass only the index
        //         }
        //     }
        // });

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
                    // Remove 'selected' class from all rows
                    const rows = document.querySelectorAll('#ListItemTable tbody tr');
                    rows.forEach(r => r.classList.remove('selected'));
        
                    // Add 'selected' class to the clicked row
                    row.classList.add('selected');
        
                    // Optionally, call your edit function if needed
                    const index = parseInt(row.getAttribute('data-index'));
                    if (!isNaN(index) && index >= 0 && index < globalData.length) {
                        console.log(`Row clicked for index: ${index}`);
                        ItemForm(index, true); // Pass only the index to your form
                    }
                }
            }
        });
        
        
    } catch (error) {
        console.error('Fetch error:', error);
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
    const item = Array.isArray(updatedItem) ? updatedItem[0] : updatedItem;
    
    if (!item) {
        console.error('No valid item returned.');
        return;
    }

    // Find the row in the table to update using the index
    const row = document.querySelector(`#ListItemTable tbody tr[data-index="${index}"]`);
    if (row) {
        // Update the row's content with the new item data
        row.querySelector('td:nth-child(1)').textContent = item.Descript.trim().substring(0, 50) || 'N/A';  // Description
        row.querySelector('td:nth-child(2)').textContent = item.UsersCde || 'N/A';  // Stock No
        row.querySelector('td:nth-child(3)').textContent = item.BrandNme || 'N/A';  // Brand
        row.querySelector('td:nth-child(4)').textContent = item.DeptName.trim() || 'N/A';  // Category
        row.querySelector('td:nth-child(5)').textContent = formatter.format(item.ItemPrce) || 'N/A';  // Item Price
        row.querySelector('td:nth-child(6)').textContent = formatter.format(item.LandCost) || 'N/A';  // Cost
    }
    globalData[index] = item;

    } catch (error) {
        console.error('Error during fetch:', error);
    }
    
}

async function ItemForm(index, editMode) {
    if (document.getElementById('item-form')) {
        console.log("item-form exists");
        return; // If it already exists, do nothing
    }

    const itemData = globalData[index];

    // Create the form element
    const itemForm = document.createElement('form');
    itemForm.id = "item-form";
    itemForm.style.display = "none";  // Start with it hidden

    itemForm.innerHTML = `
        <div id="titleBar">Item Form</div>
        <div class="inputSection">
            <br>
            <div class="textDiv">
                <div class="subTextDiv">
                    <label for="UsersCde">Stock No</label>
                    <input type="text" id="UsersCde" name="UsersCde" spellcheck="false" required>
                </div>
                <div class="subTextDiv">
                    <label for="OtherCde">Bar Code</label>
                    <input type="text" id="OtherCde" name="OtherCde" spellcheck="false" required>
                </div>
            </div>

            <div class="textDiv">
                <div class="subTextDiv" style="width:100%;">
                    <label for="Descript">Item Description</label>
                    <input type="text" style="width: 100%" id="Descript" name="Descript" spellcheck="false" required>
                </div>
            </div>

            <div class="textDiv">
                <div class="subTextDiv">
                    <label for="BrandNum">Brand</label>
                    <select id="BrandNum" required></select>
                </div>
                <div class="subTextDiv">
                    <label for="CategNum">Category</label>
                    <select id="CategNum" required></select>
                </div>
            </div>
            <div class="textDiv">
                <div class="subTextDiv">
                    <label for="ItemDept">Department</label>
                    <select id="ItemDept" required></select>
                </div>
                <div class="subTextDiv">
                    <label for="ItemType">Class</label>
                    <select id="ItemType" required></select>
                </div>
                <div class="subTextDiv">
                    <label for="SuppNum_">Supplier</label>
                    <select id="SuppNum_" required></select>
                </div>
            </div>

            <div class="textDiv">
                <div class="subTextDiv">
                    <label for="ItemPrce">Item Price</label>
                    <input type="number" id="ItemPrce" name="ItemPrce">
                </div>
                
                <div class="subTextDiv">
                    <label for="ItemCost">Item Cost</label>
                    <input type="number" id="ItemCost" name="ItemCost">
                </div>

                <div class="subTextDiv">
                    <label for="LandCost">Land Cost</label>
                    <input type="number" id="LandCost" name="LandCost">
                </div>
            </div>
            <div class="textDiv">
                <div id="chkDiv">
                    <input type="checkbox" id="Outright" >
                    <label for="Outright">Outright</label>
                </div>
                <div id="chkDiv">
                    <input type="checkbox" id="Services" >
                    <label for="Services">NCV</label>
                </div>
                <div id="chkDiv">
                    <input type="checkbox" id="Disabled" >
                    <label for="Disabled">Disabled</label>
                </div>
            </div>

            <div class="btnDiv">
                <button type="submit" id="saveItemListBtn" class="saveBtn"><i class="fa fa-save"></i>  Save</button>
                <button type="button" id="cancelItemListBtn" class="cancelBtn"><i class="fa fa-close"></i>  Cancel</button>
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

    await populateBrandNum('','');
    await populateItemDept('','');
    await populateItemType('','');
    await populateCategNum('','');
    await populateSuppNum_('','');


    if (editMode) {
        // If editing an existing record, show its details
        document.getElementById('UsersCde').value = itemData.UsersCde;
        document.getElementById('OtherCde').value = itemData.OtherCde;
        document.getElementById('Descript').value = itemData.Descript;
        document.getElementById('ItemPrce').value = itemData.ItemPrce;
        document.getElementById('ItemCost').value = itemData.ItemCost;
        document.getElementById('LandCost').value = itemData.LandCost;
        document.getElementById('Outright').checked = itemData.Outright===1 ? true : false;
        document.getElementById('Disabled').checked = itemData.Disabled ? true : false;
        document.getElementById('Services').checked = itemData.Services ? true : false;

        
        // Loop and to find correct option on each select select element
        const brandNumSelect = document.getElementById('BrandNum');
        const brandNumValue = itemData.BrandNum; // The value that should be selected
         // Check if the select element has options, then set the selected option
        const options1 = brandNumSelect.options;
        for (let i = 0; i < options1.length; i++) {
            if (options1[i].value == brandNumValue) {
                options1[i].selected = true;
                break; // Exit loop once the option is selected
            }
        }

        const categNumSelect = document.getElementById('CategNum');
        const categNumValue = itemData.CategNum; 
        const options2 = categNumSelect.options;
        for (let i = 0; i < options2.length; i++) {
            if (options2[i].value == categNumValue) {
                options2[i].selected = true;
                break; 
            }
        }

        const itemTypeSelect = document.getElementById('ItemType');
        const itemTypeValue = itemData.ItemType; 
        const options3 = itemTypeSelect.options;
        for (let i = 0; i < options3.length; i++) {
            if (options3[i].value == itemTypeValue) {
                options3[i].selected = true;
                break; 
            }
        }

        const itemDeptSelect = document.getElementById('ItemDept');
        const itemDeptValue = itemData.ItemDept; 
        const options4 = itemDeptSelect.options;
        for (let i = 0; i < options4.length; i++) {
            if (options4[i].value == itemDeptValue) {
                options4[i].selected = true;
                break; 
            }
        }

        
        const suppNum_Select = document.getElementById('SuppNum_');
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
        document.getElementById('UsersCde').value = '';
        document.getElementById('OtherCde').value = '';
        document.getElementById('Descript').value = '';
        document.getElementById('ItemPrce').value = 0.00;
        document.getElementById('ItemCost').value = 0.00;
        document.getElementById('LandCost').value = 0.00;
        document.getElementById('Outright').checked = true ;
        document.getElementById('Disabled').checked = false;
        document.getElementById('Services').checked = false;

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
        const cUsersCde=document.getElementById('UsersCde').value;
        const cOtherCde=document.getElementById('OtherCde').value;
        const cDescript=document.getElementById('Descript').value;
        const cBrandNum=document.getElementById('BrandNum').value;
        const cItemType=document.getElementById('ItemType').value;
        const cItemDept=document.getElementById('ItemDept').value;
        const cCategNum=document.getElementById('CategNum').value;
        const cSuppNum_=document.getElementById('SuppNum_').value;
        const nItemPrce=document.getElementById('ItemPrce').value;
        const nItemCost=document.getElementById('ItemCost').value;
        const nLandCost=document.getElementById('LandCost').value;
        const nOutright=document.getElementById('Outright').checked ? 1 : 0 
        const lDisabled=document.getElementById('Disabled').checked ? 1 : 0 
        const lServices=document.getElementById('Services').checked ? 1 : 0 
        

        if (!cUsersCde || !cOtherCde) {
            e.preventDefault();
            if (!cUsersCde) {
                document.getElementById('UsersCde').focus();
                document.getElementById('UsersCde').classList.add('invalid');  // Add a class to highlight
            } else if (!cOtherCde) {
                document.getElementById('OtherCde').focus();
                document.getElementById('OtherCde').classList.add('invalid');  // Add a class to highlight
            }
            return;
        }

        
        // Check for Empty Values
        const Descript = document.getElementById('Descript');
        const BrandNum = document.getElementById('BrandNum');
        const ItemType = document.getElementById('ItemType');
        const ItemDept = document.getElementById('ItemDept');
        const CategNum = document.getElementById('CategNum');
        const SuppNum_ = document.getElementById('SuppNum_');
        const ItemPrce = document.getElementById('ItemPrce');
        const LandCost = document.getElementById('LandCost');

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
            const isUsersCdeValid = await validateField('UsersCde', 'http://localhost:3000/product/checkUsersCde',
                'Stock No. already exists.', false);
            if (!isUsersCdeValid) {
                // If validation fails, set focus and return early
                document.getElementById('UsersCde').focus();
                return;
            }

            const isOtherCdeValid = await validateField('OtherCde', 'http://localhost:3000/product/checkOtherCde',
                'Bar Code already exists.', false);
            if (!isOtherCdeValid) {
                // If validation fails, set focus and return early
                document.getElementById('OtherCde').focus();
                return;
            }
    
            const cSuffixId='E'
            addItemList(cItemCode,cUsersCde,cOtherCde,cDescript,
                cBrandNum,cItemType,cItemDept,cCategNum,cSuppNum_,
                nItemPrce,nItemCost,nLandCost,
                nOutright,lDisabled,lServices,cSuffixId
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
        nOutright = document.getElementById("Outright").checked ? '1' : '2';
        lDisabled = document.getElementById("Disabled").checked ? '1' : '0';
        lServices = document.getElementById("Services").checked ? '1' : '0';

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
    }
}

async function addItemList(cItemCode,cUsersCde,cOtherCde,cDescript,
    cBrandNum,cItemType,cItemDept,cCategNum,cSuppNum_,
    nItemPrce,nItemCost,nLandCost,
    nOutright,lDisabled,lServices,cSuffixId) {
    try {
        nOutright = document.getElementById("Outright").checked ? '1' : '2';
        lDisabled = document.getElementById("Disabled").checked ? '1' : '0';
        lServices = document.getElementById("Services").checked ? '1' : '0';

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
                cSuffixId: cSuffixId
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
                const tableBody = document.getElementById('ListLocaBody'); 
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
                    <th>Description</th>
                    <th>Stock No</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Item Price</th>
                    <th>Cost</th>
                    <th style="width: 25px"></th>
                </tr>
            </thead>
            <tbody id="ListItemBody">
                ${globalData.map((item, index) => `
                    <tr id="trItemList" data-index="${index}">
                        <td class="colNoWrap">${item.Descript.trim().substring(0, 50) || 'N/A'}</td>
                        <td>${item.UsersCde || 'N/A'}</td>
                        <td>${item.BrandNme || 'N/A'}</td>
                        <td class="colNoWrap">${item.DeptName.trim() || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(item.ItemPrce) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(item.LandCost) || 'N/A'}</td>
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
        return false;
    }
}

document.getElementById('filterList').addEventListener('click', async () => {
    try {
        FiltrRec('ListItem').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));

            // console.log(filterData)
            // const dDateFrom = filterData[0];
            // const dDate__To = filterData[1];
            // const cLocation = filterData[2];
            const cUsersCde = filterData[3];
            const cOtherCde = filterData[4];
            const cDescript = filterData[5];
            const cBrandNum = filterData[6];
            const cCategNum = filterData[7];
            const cItemType = filterData[8];
            const cItemDept = filterData[9];

            ListItem(cUsersCde, cOtherCde, cDescript, cBrandNum, 
                cItemDept, cItemType, cCategNum);
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
    }
});

// deleteItemList('0000208121G')