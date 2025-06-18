import { showReport, showNotification, highlightRow } from "../FunctLib.js";
import { FiltrRec, displayErrorMsg } from "../FiltrRec.js"
import {printReportExcel, generateTitleRows} from '../PrintRep.js'


const divListLoca = `
    <div id="LocationFile" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Location File</span>
            <button id="closeLoca" class="closeForm">✖</button>
        </div>
        <div id="ListLoca" class="ReportBody">
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Code</th>
                        <th>Location Name</th>
                        <th>Group</th>
                        <th>Type</th>
                        <th></th>
                    </tr>
                </thead>
            </table>        
        </div>
        <div class="ReportFooter">
            <div class="footSegments">
                <button id="addLoca"><i class="fa fa-add"></i> Add Location</button>
            </div>
            <div class="footSegments">
                <span id="locaListCounter" class="recCounter"></span>
                <button id="printLocaXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="filterLoca"><i class="fa fa-list"></i> List</button>

            </div>
        </div>
    </div>
`
const tempDiv = document.createElement('div');
tempDiv.innerHTML = divListLoca;
document.body.appendChild(tempDiv.firstElementChild);


let globalData = []; // Define a global array
async function ListLoca(cLocation, cLocaName, cStoreGrp, lDisabled) {
    const listCounter=document.getElementById('locaListCounter')
    
    try {
        const url = new URL('http://localhost:3000/lookup/location');
        const params = new URLSearchParams();
        if (cLocation) params.append('Location', cLocation);
        if (cLocaName) params.append('LocaName', cLocaName);
        if (cStoreGrp) params.append('StoreGrp', cStoreGrp);
        if (lDisabled) params.append('Disabled', lDisabled);

        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) throw new Error('Network response was not ok');

        globalData = await response.json(); // Store full data array globally
        listCounter.innerHTML=`${globalData.length} Records`

        updateTable() //Reused at addLocation()
        document.getElementById('printLocaXLS').disabled = false

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
                    // // Remove 'selected' class from all rows
                    // const rows = document.querySelectorAll('#ListLocaTable tbody tr');
                    // rows.forEach(r => r.classList.remove('selected'));
                    // // Add 'selected' class to the clicked row
                    // row.classList.add('selected');

                    highlightRow(row, '#ListLocaTable');
        
                    // Optionally, call your edit function if needed
                    const index = parseInt(row.getAttribute('data-index'));
                    if (!isNaN(index) && index >= 0 && index < globalData.length) {
                        // console.log(`Row clicked for index: ${index}`);
                        LocaForm(index, true); // Pass only the index to your form
                    }
                }
            }
        });
        
        
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            console.log('Connection to the server is not established. Please check your connection and try again later.');
        }
        displayErrorMsg(error,"Failed to fetch")

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
        row.querySelector('td:nth-child(4)').textContent = item.StoreGrp || 'N/A';  
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
        displayErrorMsg(error,"Failed to fetch")

    }
    
}


async function LocaForm(index, editMode) {
    if (document.getElementById('stoc-form')) {
        console.log("stoc-form exists");
        return; // If it already exists, do nothing
    }

    const itemData = globalData[index];

    // Create the form element
    const itemForm = document.createElement('form');
    itemForm.id = "stoc-form";
    itemForm.classList.add('item-form');
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
                    <label for="StoreGrp">Group Location</label>
                    <input type="text" id="StoreGrp" spellcheck="false" required>
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
                <button type="button" id="cancelLocationBtn" class="cancelBtn"><i class="fa fa-close"></i>  Close</button>
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
        document.getElementById('StoreGrp').value = itemData.StoreGrp;
        document.getElementById('SellArea').checked = itemData.SellArea ? true : false;
        document.getElementById('Disabled').checked = itemData.Disabled ? true : false;


    } else {
        // If adding new, populate with default empty values
        document.getElementById('LocaName').value = '';
        document.getElementById('LocaCode').value = "";
        document.getElementById('StoreGrp').value = "";
        document.getElementById('SellArea').checked = true;
        document.getElementById('Disabled').checked = false;
    }

    // Event listener for Cancel button to close the modal
    document.getElementById('cancelLocationBtn').addEventListener('click', () => {
        document.getElementById('stoc-form').remove(); // Remove the form from the DOM
        document.getElementById('modal-overlay').remove();  // Remove overlay
    });

    // Event listener for Save button to edit or add data and close the modal
    document.getElementById('saveLocationBtn').addEventListener('click', (e) => {
        e.preventDefault();
        const cLocation= editMode ? itemData.Location : '0WPE'
        const cLocaName=document.getElementById('LocaName').value;
        const cLocaCode=document.getElementById('LocaCode').value;
        const cStoreGrp=document.getElementById('StoreGrp').value;
        const lSellArea=document.getElementById('SellArea').checked ? 1 : 0 // 1 if checked, 0 if unchecked
        const lDisabled=document.getElementById('Disabled').checked ? 1 : 0 

        if (!cLocaName || !cStoreGrp) {
            e.preventDefault();
            if (!cLocaName) {
                document.getElementById('LocaName').focus();
                document.getElementById('LocaName').classList.add('invalid');  // Add a class to highlight
            } else if (!cStoreGrp) {
                document.getElementById('StoreGrp').focus();
                document.getElementById('StoreGrp').classList.add('invalid');  // Add a class to highlight
            }
            return;
        }

        if (editMode) {
            // Edit existing record
            editLocation(index, cLocation,cLocaName,cLocaCode,cStoreGrp,lSellArea,lDisabled)
        
        } else {
            // Add new record
            addLocation(cLocation, cLocaName, cLocaCode, cStoreGrp, lSellArea, lDisabled)
                            
        }
        document.getElementById('stoc-form').remove(); // Remove the form from the DOM
        document.getElementById('modal-overlay').remove();  // Remove overlay
    });
}

async function editLocation(index, cLocation,cLocaName,cLocaCode,cStoreGrp,lSellArea,lDisabled) {
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
                cStoreGrp: cStoreGrp,
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
        displayErrorMsg(error,"Update Location error")

    }
}

async function addLocation(cLocation,cLocaName,cLocaCode,cStoreGrp,lSellArea,lDisabled) {
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
                cStoreGrp: cStoreGrp,
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
        displayErrorMsg(error,"Insert Location error")

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
        displayErrorMsg(error,"Deleted Location error")
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
                        <td>${item.StoreGrp || 'N/A'}</td>
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


document.getElementById('filterLoca').addEventListener('click', async () => {
    try {
        FiltrRec('ListLoca').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));

            // const dDateFrom = filterData[0];
            // const dDate__To = filterData[1];
            const cLocation = filterData[2];
            // const cUsersCde = filterData[3];
            // const cOtherCde = filterData[4];
            // const cDescript = filterData[5];
            // const cBrandNum = filterData[6];
            // const cCategNum = filterData[7];
            // const cItemType = filterData[8];
            // const cItemDept = filterData[9];
            // const cReferDoc = filterData[10];
            // const dAsOfDate = filterData[11];
            const cStoreGrp = filterData[12];
            const lDisabled = filterData[14]
            ListLoca(cLocation, '', cStoreGrp, lDisabled)

        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")

    }
});


document.getElementById('printLocaXLS').addEventListener('click', () => {

    const titleRowsContent = [
        { text: 'REGENT TRAVEL RETAIL GROUP', style: { fontWeight: 'bold', fontSize: 14 } },
        { text: 'Location List', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
        { text: '' } // Spacer row
    ];
    
    const colWidths = [
        { width: 8 },  // Location
        { width: 30 }, // LocaName
        { width: 20 }, // LocaCode
        { width: 30 }, // StoreGrp
        { width: 20 }, // SellArea
        { width: 10 }, // Disabled
    ];

    const columnConfig = [
        {
            label: 'Sys',
            getValue: row => row.Location,
            type: 'string',
            align: 'left'
        },
        {
            label: 'Location',
            getValue: row => row.LocaName,
            type: 'string',
            align: 'left',
        },
        {
            label: 'Code',
            getValue: row => row.LocaCode,
            type: 'string',
            align: 'left',
        },
        {
            label: 'Group Location',
            getValue: row => row.StoreGrp,
            type: 'string',
            align: 'center',
        },
        {
            label: 'Type',
            getValue: row => row.SellArea ? 'Selling Area' : 'Warehouse',
            type: 'string',
            align: 'left',
        },
        {
            label: 'Status',
            getValue: row => row.Disabled ? 'Disabled' : 'Active',
            type: 'string',
            align: 'left',
        },
    ];
    
    const titleRows = generateTitleRows(columnConfig, titleRowsContent, 0);
    
    printReportExcel(globalData, columnConfig, colWidths, titleRows, 'Location List', 2);
})
