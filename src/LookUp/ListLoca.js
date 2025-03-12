import { showReport, showNotification } from "../FunctLib.js";

let globalData = []; // Define a global array
async function ListLoca(cLocation, cLocaName) {
    const listCounter=document.getElementById('locaListCounter')
    
    try {
        const url = new URL('http://localhost:3000/lookup/location');
        const params = new URLSearchParams();
        if (cLocation) params.append('Location', cLocation);
        if (cLocaName) params.append('LocaName', cLocaName);

        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) throw new Error('Network response was not ok');

        globalData = await response.json(); // Store full data array globally
        listCounter.innerHTML=`${globalData.length} Records`

        updateTable() //Reused at addLocation()

        document.getElementById('ListLocaBody').addEventListener('click', async (event) => {
            const delBtn = event.target.closest('.spanDelItem'); // Find the clicked delete button
            const row = event.target.closest('tr');
            if (delBtn) {
                const index = parseInt(delBtn.getAttribute('data-index')); // Get index
                if (!isNaN(index) && index >= 0 && index < globalData.length) {
                    const confirmed = confirm(`Do you want to delete ${globalData[index].LocaName.trim()}?`)
                    if (confirmed) {
                        const deleted_=await deleteLocation(globalData[index].Location)
                        console.log('deleted_ ',deleted_)
                        if (deleted_) {
                            row.classList.add('strikethrough');
                        }
                    }
                }
                // Prevent the row click event (ItemForm) from being triggered when the delete button is clicked
                event.stopPropagation(); // This stops the event from propagating to the parent (row click handler)
            }
        });
        
        document.getElementById('ListLocaBody').addEventListener('click', (event) => {
            const row = event.target.closest('tr'); // Find the clicked row
            if (row) {
                if (!event.target.closest('.spanDelItem')) {
                    // Remove 'selected' class from all rows
                    const rows = document.querySelectorAll('#ListLocaTable tbody tr');
                    rows.forEach(r => r.classList.remove('selected'));
        
                    // Add 'selected' class to the clicked row
                    row.classList.add('selected');
        
                    // Optionally, call your edit function if needed
                    const index = parseInt(row.getAttribute('data-index'));
                    if (!isNaN(index) && index >= 0 && index < globalData.length) {
                        console.log(`Row clicked for index: ${index}`);
                        LocaForm(index, true); // Pass only the index to your form
                    }
                }
            }
        });
        
        
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            alert('Connection to the server is not established. Please check your connection and try again later.');
        } else {
            alert('An error occurred while fetching data. Please try again later.');
        }
    } 

}

document.addEventListener('DOMContentLoaded', () => {
    const liLocationMenu = document.querySelectorAll('.Location');
    const locationFileDiv = document.getElementById('LocationFile');
    const closeList = document.getElementById('closeLoca');
    const addItem = document.getElementById('addLoca');

    addItem.addEventListener('click', () => {
        LocaForm();
    });

    closeList.addEventListener('click', () => {
        locationFileDiv.classList.remove('active');
    });

    // Add event listener to each element with the necessary arguments
    liLocationMenu.forEach(element => {
        element.addEventListener('click', () => {
            showReport('LocationFile')
        });
    });
});


async function updateTableRow(index , cLocation) {
    const url = new URL('http://localhost:3000/lookup/location');
    const params = new URLSearchParams();
    params.append('Location', cLocation);

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
    const row = document.querySelector(`#ListLocaTable tbody tr[data-index="${index}"]`);
    if (row) {
        // Update the row's content with the new item data
        row.querySelector('td:nth-child(1)').textContent = item.Location || 'N/A';  
        row.querySelector('td:nth-child(2)').textContent = item.LocaCode || 'N/A';  
        row.querySelector('td:nth-child(3)').textContent = item.LocaName || 'N/A';  
        row.querySelector('td:nth-child(4)').textContent = item.Vicinity || 'N/A';  
        row.querySelector('td:nth-child(5)').textContent = item.SellArea ? 'Selling Area' : 'Warehouse' || 'N/A';  

        if (item.Disabled) {
            row.style.color = 'darkgrey'; // Set background color to dark grey if Disabled is true
        } else {
            row.style.color = ''; // Reset background color if Disabled is false
        }
    }
    globalData[index] = item;

    } catch (error) {
        console.error('Error during fetch:', error);
    }
    
}


async function LocaForm(index, editMode) {
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
        <div id="titleBar">Location Form</div>
        <div class="inputSection">
            <br>        
            <div class="textDiv">
                <div class="subTextDiv">
                    <label for="LocaName">Location Name</label>
                    <input type="text" style="width: 100%" id="LocaName" spellcheck="false" required>
                </div>
            </div>
            <div class="textDiv" style="display: flex; justify-content: space-between">
                <div class="subTextDiv">
                    <label for="LocaCode">Location Code</label>
                    <input type="text" id="LocaCode" spellcheck="false" required>
                </div>
                <div class="subTextDiv">
                    <label for="Vicinity">Group Location</label>
                    <input type="text" id="Vicinity" spellcheck="false" required>
                </div>
            </div>
            <div class="textDiv">
                <div id="chkDiv">
                    <input type="checkbox" id="SellArea" >
                    <label for="SellArea">Selling Area</label>
                </div>
                <div id="chkDiv">
                    <input type="checkbox" id="Disabled" >
                    <label for="Disabled">Disabled</label>
                </div>
            </div>
            <div class="btnDiv">
                <button type="submit" id="saveLocationBtn" class="saveBtn"><i class="fa fa-save"></i>  Save</button>
                <button type="button" id="cancelLocationBtn" class="cancelBtn"><i class="fa fa-close"></i>  Cancel</button>
            </div>
        </div>
    `;

    //class="subTextDiv" style="display: flex; flex-direction: row; width: 30px"
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
    document.getElementById('LocationFile').appendChild(itemForm);
    document.getElementById('LocationFile').appendChild(overlay);

    // Show the form by changing its display style
    itemForm.style.display='flex'

    if (editMode) {
        // If editing an existing record, show its details
        document.getElementById('LocaName').value = itemData.LocaName;
        document.getElementById('LocaCode').value = itemData.LocaCode;
        document.getElementById('Vicinity').value = itemData.Vicinity;
        document.getElementById('SellArea').checked = itemData.SellArea ? true : false;
        document.getElementById('Disabled').checked = itemData.Disabled ? true : false;


    } else {
        // If adding new, populate with default empty values
        document.getElementById('LocaName').value = '';
        document.getElementById('LocaCode').value = "";
        document.getElementById('Vicinity').value = "";
        document.getElementById('SellArea').checked = true;
        document.getElementById('Disabled').checked = false;
    }

    // Event listener for Cancel button to close the modal
    document.getElementById('cancelLocationBtn').addEventListener('click', () => {
        document.getElementById('item-form').remove(); // Remove the form from the DOM
        document.getElementById('modal-overlay').remove();  // Remove overlay
    });

    // Event listener for Save button to edit or add data and close the modal
    document.getElementById('saveLocationBtn').addEventListener('click', (e) => {
        e.preventDefault();
        const cLocation= editMode ? itemData.Location : '0WPE'
        const cLocaName=document.getElementById('LocaName').value;
        const cLocaCode=document.getElementById('LocaCode').value;
        const cVicinity=document.getElementById('Vicinity').value;
        const lSellArea=document.getElementById('SellArea').checked ? 1 : 0 // 1 if checked, 0 if unchecked
        const lDisabled=document.getElementById('Disabled').checked ? 1 : 0 

        if (!cLocaName || !cVicinity) {
            e.preventDefault();
            if (!cLocaName) {
                document.getElementById('LocaName').focus();
                document.getElementById('LocaName').classList.add('invalid');  // Add a class to highlight
            } else if (!cVicinity) {
                document.getElementById('Vicinity').focus();
                document.getElementById('Vicinity').classList.add('invalid');  // Add a class to highlight
            }
            return;
        }

        if (editMode) {
            // Edit existing record
            editLocation(index, cLocation,cLocaName,cLocaCode,cVicinity,lSellArea,lDisabled)
        
        } else {
            // Add new record
            addLocation(cLocation, cLocaName, cLocaCode, cVicinity, lSellArea, lDisabled)
                            
        }
        document.getElementById('item-form').remove(); // Remove the form from the DOM
        document.getElementById('modal-overlay').remove();  // Remove overlay
    });
}

async function editLocation(index, cLocation,cLocaName,cLocaCode,cVicinity,lSellArea,lDisabled) {
    try {

        lSellArea = document.getElementById("SellArea").checked ? '1' : '0';
        lDisabled = document.getElementById("Disabled").checked ? '1' : '0';

        const response = await fetch('http://localhost:3000/lookup/editLocation', {
            method: 'PUT',  // Use PUT method
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cLocation: cLocation, 
                cLocaName: cLocaName,
                cLocaCode: cLocaCode,
                cVicinity: cVicinity,
                lSellArea: lSellArea,
                lDisabled: lDisabled
                
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();
        if (updatedItem) {
            updateTableRow(index, cLocation);
            showNotification('Location record update successful!')
        }

        
    } catch (error) {
        console.error('Update Location error:', error);
    }
}

async function addLocation(cLocation,cLocaName,cLocaCode,cVicinity,lSellArea,lDisabled) {
    try {

        lSellArea = document.getElementById("SellArea").checked ? '1' : '0';
        lDisabled = document.getElementById("Disabled").checked ? '1' : '0';

        const response = await fetch('http://localhost:3000/lookup/addLocation', {
            method: 'POST',  // Use PUT method
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cLocation: cLocation,
                cLocaName: cLocaName,
                cLocaCode: cLocaCode,
                cVicinity: cVicinity,
                lSellArea: lSellArea,
                lDisabled: lDisabled
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();
        if (updatedItem) {
            showNotification('Location record added successful!')
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
        console.error('Insert Location error:', error);
    }
}


async function deleteLocation(cLocation) {
    try {
        const response = await fetch(`http://localhost:3000/lookup/deleteLocation/${encodeURIComponent(cLocation)}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            if (response.status === 409) {
                alert(`Failed to delete: ${errorResponse.message || 'Invalid data'}`);
            } else {
                alert('An unexpected error occurred while deleting.');
            }            
            return false;
        }

        const result = await response.json();
        console.log('Deleted Rows Affected:', result.rowsAffected);
        alert('Location deleted successfully');
        return true;
    } catch (error) {
        console.error('Delete Location error:', error);
        alert('An error occurred while trying to delete the location.');
        return false;
    }
}

function updateTable() {
    const reportBody = document.getElementById('ListLoca');
    reportBody.innerHTML = ''; // Clear previous content

    const listTable = `
        <div id="tableDiv">
        <table id="ListLocaTable">
            <thead id="Look_Up_Head">
                <tr>
                    <th>Id</th>
                    <th>Code</th>
                    <th>Location Name</th>
                    <th>Group</th>
                    <th>Type</th>
                    <th></th>
                </tr>
            </thead>
            <tbody id="ListLocaBody">
                ${globalData.map((item, index) => `
                    <tr id="trLocaList" data-index="${index}" style="${item.Disabled ? 'color: darkgray;' : ''}">
                        <td>${item.Location || 'N/A'}</td>
                        <td>${item.LocaCode || 'N/A'}</td>
                        <td class="colNoWrap">${item.LocaName || 'N/A'}</td>
                        <td>${item.Vicinity || 'N/A'}</td>
                        <td>${item.SellArea ? 'Selling Area' : 'Warehouse'}</td>
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


ListLoca('','')
