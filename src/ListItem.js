import { showReport, showNotification } from './FunctLib.js';
import { populateBrandNum, populateItemDept, populateItemType, populateCategNum } from "./FunctLib.js";
import { FiltrRec } from "./FiltrRec.js"

const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });    

let globalData = []; // Define a global array
export async function ListItem(cUsersCde, cDescript, cBrandNum, cItemDept,
        cItemType, cCategNum) {
    const listCounter=document.getElementById('itemListCounter')
    document.getElementById('loadingIndicator').style.display = 'flex';

    try {
        const url = new URL('http://localhost:3000/product/item');
        const params = new URLSearchParams();
        if (cUsersCde) params.append('ItemPrce', cUsersCde);
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
                        <th></th>
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

        document.getElementById('ListItemBody').addEventListener('click', (event) => {
            const editBtn = event.target.closest('.spanEditItem'); // Find the clicked edit button
            if (editBtn) {
                const index = parseInt(editBtn.getAttribute('data-index')); // Get index
                if (!isNaN(index) && index >= 0 && index < globalData.length) {
                    console.log(`Edit clicked for index: ${index}`);
                    ItemForm(index); // Pass only the index
                }
            }
        });

        document.getElementById('ListItemBody').addEventListener('click', (event) => {
            const delBtn = event.target.closest('.spanDelItem'); // Find the clicked delete button
            if (delBtn) {
                const index = parseInt(delBtn.getAttribute('data-index')); // Get index
                if (!isNaN(index) && index >= 0 && index < globalData.length) {
                    console.log(`Delete clicked for index: ${index}`);
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
                        ItemForm(index); // Pass only the index to your form
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
            // ListItem(700,'BLACK','00477')
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


async function ItemForm(index) {
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
        <div id="inputSection">
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

            <div id="btnDiv">
                <button type="submit" id="saveBtn"><i class="fa fa-save"></i>  Save</button>
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

    // Append the form to the container with id 'Inventory'
    document.getElementById('ProductFile').appendChild(itemForm);
    document.getElementById('ProductFile').appendChild(overlay);

    // Show the form by changing its display style
    itemForm.style.display='flex'

    await populateBrandNum('','');
    await populateItemDept('','');
    await populateItemType('','');
    await populateCategNum('','');


    if (index) {
        // If editing an existing record, show its details
        document.getElementById('UsersCde').value = itemData.UsersCde;
        document.getElementById('OtherCde').value = itemData.OtherCde;
        document.getElementById('Descript').value = itemData.Descript;
        document.getElementById('ItemPrce').value = itemData.ItemPrce;
        document.getElementById('ItemCost').value = itemData.ItemCost;
        document.getElementById('LandCost').value = itemData.LandCost;

        
        // Loop and to find correct option on each select element
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
        const categNumValue = itemData.CategNum; // The value that should be selected
        const options2 = categNumSelect.options;
        for (let i = 0; i < options2.length; i++) {
            if (options2[i].value == categNumValue) {
                options2[i].selected = true;
                break; // Exit loop once the option is selected
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
        const itemDeptValue = itemData.ItemDept; // The value that should be selected
        const options4 = itemDeptSelect.options;
        for (let i = 0; i < options4.length; i++) {
            if (options4[i].value == itemDeptValue) {
                options4[i].selected = true;
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
    }

    // Event listener for Cancel button to close the modal
    document.getElementById('cancelBtn').addEventListener('click', () => {
        document.getElementById('item-form').remove(); // Remove the form from the DOM
        document.getElementById('modal-overlay').remove();  // Remove overlay
    });

    // Event listener for Save button to edit or add data and close the modal
    document.getElementById('saveBtn').addEventListener('click', (e) => {
        e.preventDefault();

        const cItemCode=itemData.ItemCode
        const cUsersCde=document.getElementById('UsersCde').value;
        const cOtherCde=document.getElementById('OtherCde').value;
        const cDescript=document.getElementById('Descript').value;
        const cBrandNum=document.getElementById('BrandNum').value;
        const cItemType=document.getElementById('ItemType').value;
        const cItemDept=document.getElementById('ItemDept').value;
        const nItemPrce=document.getElementById('ItemPrce').value;
        const nItemCost=document.getElementById('ItemCost').value;
        const nLandCost=document.getElementById('LandCost').value;
        

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

        if (itemData) {
            // Edit existing record
            editItemList(index, cItemCode,cUsersCde,cOtherCde,cDescript,
                cBrandNum,cItemType,cItemDept,
                nItemPrce,nItemCost,nLandCost
            )
        
        } else {
            // Add new record
                        
        }
        document.getElementById('item-form').remove(); // Remove the form from the DOM
        document.getElementById('modal-overlay').remove();  // Remove overlay
    });

    
    
    //Field Validation
    document.getElementById('UsersCde').addEventListener('blur', async function() {
        if (index) return  //edit mode
        const cUsersCde = document.getElementById('UsersCde').value;
        
        const url = new URL('http://localhost:3000/product/checkUsersCde');
        const params = new URLSearchParams();
        if (cUsersCde) params.append('UsersCde', cUsersCde);
    
        // Send request with query parameters
        try {
            const response = await fetch(`${url}?${params.toString()}`);
            const data = await response.json();
    
            // Check if the result has any data (which means the UsersCde exists)
            if (data.length > 0) {
                alert('This Stock No (UsersCde) already exists.');
            }
        } catch (error) {
            console.error('Error during fetch:', error);
        }
    });

    document.getElementById('OtherCde').addEventListener('blur', async function() {
        if (index) return  //edit mode
        const cOtherCde = document.getElementById('OtherCde').value;
    
        const url = new URL('http://localhost:3000/product/checkOtherCde');
        const params = new URLSearchParams();
        if (cOtherCde) params.append('OtherCde', cOtherCde);
    
        // Send request with query parameters
        try {
            const response = await fetch(`${url}?${params.toString()}`);
            const data = await response.json();
            if (data.length > 0) {
                alert('This Bar Code No (OtherCde) already exists.');
            }
        } catch (error) {
            console.error('Error during fetch:', error);
        }
    });
    

}


async function editItemList(index, cItemCode,cUsersCde,cOtherCde,cDescript,
    cBrandNum,cItemType,cItemDept,
    nItemPrce,nItemCost,nLandCost) {
    try {
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
                nItemPrce: nItemPrce,
                nItemCost: nItemCost,
                nLandCost: nLandCost
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
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Deleted Rows Affected:', result.rowsAffected);
    } catch (error) {
        console.error('Delete ItemList error:', error);
    }
}

document.getElementById('filterList').addEventListener('click', () => {
    FiltrRec('ListItem')
})

// deleteItemList('0000208121G')