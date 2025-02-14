import { showReport, showNotification } from './FunctLib.js';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });    

let globalData = []; // Define a global array

async function ListItem(nItemPrce, cDescript, cBrandNum) {
    try {
        const url = new URL('http://localhost:3000/product/item');
        const params = new URLSearchParams();
        if (nItemPrce) params.append('ItemPrce', nItemPrce);
        if (cDescript) params.append('Descript', cDescript);
        if (cBrandNum) params.append('BrandNum', cBrandNum);

        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) throw new Error('Network response was not ok');

        globalData = await response.json(); // Store full data array globally
        showNotification(`${globalData.length} Item Records fetched`);

        const reportBody = document.getElementById('ListItem');
        reportBody.innerHTML = ''; // Clear previous content

        // Generate table rows
        const listTable = `
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
                                <span class="spanEditItem colEditItem" data-index="${index}">
                                    <i class="fa fa-pencil"></i>
                                </span>
                            </td>
                            <td class="action-icons">
                                <span class="spanDelItem colEditItem" data-index="${index}">
                                    <i class="fa fa-trash"></i>
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
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
            const delBtn = event.target.closest('.spanDelItem'); // Find the clicked edit button
            if (delBtn) {
                const index = parseInt(delBtn.getAttribute('data-index')); // Get index
                if (!isNaN(index) && index >= 0 && index < globalData.length) {
                    console.log(`Delete clicked for index: ${index}`);
                }
            }
        });
        document.getElementById('trItemList').addEventListener('click', () => {
            console.log('trItemList clicked')
            const index = parseInt(editBtn.getAttribute('data-index')); 
            if (!isNaN(index) && index >= 0 && index < globalData.length) {
                console.log(`Row clicked for index: ${index}`);
                ItemForm(index); // Pass only the index
            }
        });
        
        
    } catch (error) {
        console.error('Fetch error:', error);
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
            ListItem(700,'BLACK','00477')
        });
    });
});

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
        <br>
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
                <div class="subTextDiv" style="width: 96%; background-color= red">
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
                <button type="submit" id="saveBtn">Save</button>
                <button type="button" id="cancelBtn">Cancel</button>
            </div>
        </div>
    `;

    // <textarea id="Descript" name="Descript" spellcheck="false" style="font-family: Arial; font-size: 14px;"></textarea>

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

    await populateBrandNum();
    await populateItemDept();
    await populateItemType();
    await populateCategNum();


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
        if (brandnumMap.has(brandNumValue)) {
            brandNumSelect.value = brandNumValue; // Set the correct option
        } else {
            console.warn(`BrandNum ID ${targetValue} not found in the list.`);
        }

        const categNumSelect = document.getElementById('CategNum');
        const categNumValue = itemData.CategNum; // The value that should be selected
        if (categnumMap.has(categNumValue)) {
            categNumSelect.value = categNumValue; // Set the correct option
        } else {
            console.warn(`CategNum ID ${targetValue} not found in the list.`);
        }

        const itemTypeSelect = document.getElementById('ItemType');
        const itemTypeValue = itemData.ItemType; // The value that should be selected
        if (itemtypeMap.has(itemTypeValue)) {
            itemTypeSelect.value = itemTypeValue; // Set the correct option
        } else {
            console.warn(`ItemType ID ${itemTypeValue} not found in the list.`);
        }

        const itemDeptSelect = document.getElementById('ItemDept');
        const itemDeptValue = itemData.ItemDept; // The value that should be selected
        if (itemdeptMap.has(itemDeptValue)) {
            itemDeptSelect.value = itemDeptValue; // Set the correct option
        } else {
            console.warn(`Department ID ${itemDeptValue} not found in the list.`);
        }


    } else {
        // If adding new, populate with default empty values
        document.getElementById('UsersCde').value = '';
        document.getElementById('OtherCde').value = '';
        document.getElementById('Descript').value = '';
        document.getElementById('ItemPrce').value = '';
        document.getElementById('ItemCost').value = '';
        document.getElementById('LandCost').value = '';
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
                nItemCost,nLandCost,index
            )
        
        } else {
            // Add new record
                        
        }
        document.getElementById('item-form').remove(); // Remove the form from the DOM
        document.getElementById('modal-overlay').remove();  // Remove overlay
    });

    window.updateTableRow = function(index, updatedItem) {
        // Find the row using the data-index attribute
        const row = document.querySelector(`#ListItemTable tr[data-index='${index}']`);
        console.log(updatedItem)
        if (row) {
            // Update the values in the row
            row.querySelector('td:nth-child(1)').textContent = updatedItem.Descript.trim().substring(0, 50) || 'N/A';
            row.querySelector('td:nth-child(2)').textContent = updatedItem.UsersCde || 'N/A';
            row.querySelector('td:nth-child(3)').textContent = updatedItem.BrandNme || 'N/A';
            row.querySelector('td:nth-child(4)').textContent = updatedItem.DeptName.trim() || 'N/A';
            row.querySelector('td:nth-child(5)').textContent = formatter.format(updatedItem.ItemPrce) || 'N/A';
            row.querySelector('td:nth-child(6)').textContent = formatter.format(updatedItem.LandCost) || 'N/A';
        }
    }
    
    
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
ListBrnd('','')
ListDept('','')    
ListType('','')    
ListCate('','')


let listCate=null
const categnumMap= new Map()
async function ListCate(cCategNum, cCategNme) {
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/product/categnum');
        const params = new URLSearchParams();
        if (cCategNum) params.append('CategNum', cCategNum);
        if (cCategNme) params.append('CategNme', cCategNme);

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        listCate = await response.json();
        listCate.forEach(data => {
            categnumMap.set(data.CategNum, data.CategNme); 
        });

    } catch (error) {
        console.error('Fetch Category error:', error);
    }
}

async function populateCategNum() {
    const categnumSelect = document.getElementById('CategNum');
    categnumSelect.innerHTML = '';

    const emptyOption = document.createElement('option');
    emptyOption.value = ''; 
    emptyOption.textContent = 'Select a category'; // You can set custom text here
    categnumSelect.appendChild(emptyOption);

    categnumMap.forEach((CategNme, CategNum ) => {
        const option1 = document.createElement('option');
        option1.value = CategNum;
        option1.textContent = CategNme;
        categnumSelect.appendChild(option1);
    });
    
}


let listBrnd=null
const brandnumMap= new Map()
async function ListBrnd(cBrandNum, cBrandNme) {
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/product/brands');
        const params = new URLSearchParams();
        if (cBrandNum) params.append('BrandNum', cBrandNum);
        if (cBrandNme) params.append('BrandNme', cBrandNme);

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        listBrnd = await response.json();
        listBrnd.forEach(data => {
            brandnumMap.set(data.BrandNum, data.BrandNme); 
        });

    } catch (error) {
        console.error('Fetch Brand error:', error);
    }
}

async function populateBrandNum() {
    const brandSelect = document.getElementById('BrandNum');
    brandSelect.innerHTML = '';

    const emptyOption = document.createElement('option');
    emptyOption.value = ''; 
    emptyOption.textContent = 'Select a brand'; // You can set custom text here
    brandSelect.appendChild(emptyOption);

    brandnumMap.forEach((BrandNme, BrandNum ) => {
        const option1 = document.createElement('option');
        option1.value = BrandNum;
        option1.textContent = BrandNme;
        brandSelect.appendChild(option1);
    });
    
}


let listType=null
const itemtypeMap = new Map(); 
async function ListType(cItemType, cDescript) {
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/product/itemtype');
        const params = new URLSearchParams();
        if (cItemType) params.append('ItemType', cItemType);
        if (cDescript) params.append('Descript', cDescript);

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        listType = await response.json();
        listType.forEach(data => {
            itemtypeMap.set(data.ItemType, data.TypeDesc); 
        });
        
    } catch (error) {
        console.error('Fetch ItemType error:', error);
    }
}

async function populateItemType() {
    const itemTypeSelect = document.getElementById('ItemType');
    itemTypeSelect.innerHTML = '';

    // Create and add the empty option as the first option
    const emptyOption = document.createElement('option');
    emptyOption.value = ''; 
    emptyOption.textContent = 'Select a class'; // You can set custom text here
    itemTypeSelect.appendChild(emptyOption);

    itemtypeMap.forEach((TypeDesc,ItemType) => {
        const option1 = document.createElement('option');
        option1.value = ItemType;
        option1.textContent = TypeDesc;
        itemTypeSelect.appendChild(option1);
    });

}



let listDept=null
const itemdeptMap = new Map(); 
async function ListDept(cItemDept, cDescript) {
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/product/itemdept');
        const params = new URLSearchParams();
        if (cItemDept) params.append('ItemDept', cItemDept);
        if (cDescript) params.append('Descript', cDescript);

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        listDept = await response.json();
        listDept.forEach(data => {
            itemdeptMap.set(data.ItemDept, data.DeptDesc); // Store in Map for quick lookup
        });
        
} catch (error) {
        console.error('Fetch ItemDept error:', error);
    }
}

async function populateItemDept() {
    const itemDeptSelect = document.getElementById('ItemDept');
    itemDeptSelect.innerHTML = '';

    // Create and add the empty option as the first option
    const emptyOption = document.createElement('option');
    emptyOption.value = ''; 
    emptyOption.textContent = 'Select a department';
    itemDeptSelect.appendChild(emptyOption);

    // Use the stored Map to populate the select
    itemdeptMap.forEach((deptDesc, itemDept) => {
        const option = document.createElement('option');
        option.value = itemDept; // ItemDept as value
        option.textContent = deptDesc; // DeptDesc as display text
        itemDeptSelect.appendChild(option);
    });
}

async function editItemList(index, cItemCode,cUsersCde,cOtherCde,cDescript,
    cBrandNum,cItemType,cItemDept,
    nItemCost,nLandCost) {
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
                nItemCost: nItemCost,
                nLandCost: nLandCost
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();
        console.log('Updated Rows Affected:', updatedItem.rowsAffected);
        showNotification('Item record update successful!')

         // If only rowsAffected is returned, make a GET request to fetch the updated item
    //   const updatedItem = await getUpdatedItem(cItemCode);  // Fetch updated item
    //   globalData[index] = updatedItem;  // Update globalData
    //   window.updateTableRow(index, updatedItem);  // Update table row
      

        // Update the corresponding item in the globalData[] array
        // if (updatedItem) {
        //     globalData[index] = updatedItem; // Update the item in the globalData array
        //     // Now update the table dynamically by targeting the specific row
        //     updateTableRow(index, updatedItem);
        // }        
        
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
// deleteItemList('0000208121G')