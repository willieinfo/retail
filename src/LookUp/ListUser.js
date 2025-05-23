import { showReport, showNotification, highlightRow } from "../FunctLib.js";
import { FiltrRec, displayErrorMsg } from "../FiltrRec.js"
import {printReportExcel, generateTitleRows} from '../PrintRep.js'


const divListUser = `
    <div id="AppUsersFile" class="report-section containerDiv">
        <div class="ReportHead">
            <span>App Users File</span>
            <button id="closeUser" class="closeForm">✖</button>
        </div>
        <div id="ListUser" class="ReportBody">
            <table>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>User Name</th>
                        <th>Nick Name</th>
                        <th>Email</th>
                        <th>Position</th>
                        <th>Tel No</th>
                        <th>Remarks</th>
                        <th></th>
                    </tr>
                </thead>
            </table>        
        </div>
        <div class="ReportFooter">
            <div class="footSegments">
                <button id="addUser"><i class="fa fa-add"></i> Add App User</button>
            </div>
            <div class="footSegments">
                <span id="userListCounter" class="recCounter"></span>
                <button id="printUserXLS"><i class="fa fa-file-excel"></i> Excel</button>
                <button id="filterUser"><i class="fa fa-filter"></i> Filter List</button>

            </div>
        </div>
    </div>
`
const tempDiv = document.createElement('div');
tempDiv.innerHTML = divListUser;
document.body.appendChild(tempDiv.firstElementChild);


let globalData = []; // Define a global array
async function ListUser(cUserName) {
    const listCounter=document.getElementById('userListCounter')
    
    try {
        const url = new URL('http://localhost:3000/lookup/appusers');
        const params = new URLSearchParams();
        if (cUserName) params.append('UserName', cUserName);

        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) throw new Error('Network response was not ok');

        globalData = await response.json(); // Store full data array globally
        listCounter.innerHTML=`${globalData.length} Records`

        updateTable() //Reused at addAppUsers()

        document.getElementById('ListUserBody').addEventListener('click', async (event) => {
            const delBtn = event.target.closest('.spanDelItem'); // Find the clicked delete button
            const row = event.target.closest('tr');
            if (delBtn) {
                const index = parseInt(delBtn.getAttribute('data-index')); // Get index
                if (!isNaN(index) && index >= 0 && index < globalData.length) {
                    const confirmed = confirm(`Do you want to delete ${globalData[index].UserName.trim()}?`)
                    if (confirmed) {
                        const deleted_=await deleteAppUsers(globalData[index].UserCode)
                        console.log('deleted_ ',deleted_)
                        if (deleted_) {
                            row.classList.add('strikethrough');
                        }
                    }
                }
                event.stopPropagation(); 
            }
        });
        
        document.getElementById('ListUserBody').addEventListener('click', (event) => {
            const row = event.target.closest('tr'); // Find the clicked row
            if (row) {
                if (!event.target.closest('.spanDelItem')) {

                    highlightRow(row, '#ListUserTable');
        
                    // Optionally, call your edit function if needed
                    const index = parseInt(row.getAttribute('data-index'));
                    if (!isNaN(index) && index >= 0 && index < globalData.length) {
                        // console.log(`Row clicked for index: ${index}`);
                        UserForm(index, true); // Pass only the index to your form
                    }
                }
            }
        });

        
        
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            console.log('Connection to the server is not established. Please check your connection and try again later.');
        }
        displayErrorMsg(error,"Failed to fetch User")

    } 

}

document.addEventListener('DOMContentLoaded', () => {
    const liAppUsersMenu = document.getElementById('AppUsers');
    const appusersFileDiv = document.getElementById('AppUsersFile');
    const closeList = document.getElementById('closeUser');
    const addItem = document.getElementById('addUser');

    addItem.addEventListener('click', () => {
        UserForm();
    });

    closeList.addEventListener('click', () => {
        appusersFileDiv.classList.remove('active');
    });

    // Add event listener to each element with the necessary arguments
    liAppUsersMenu.addEventListener('click', () => {
        showReport('AppUsersFile')
    });
});


async function updateTableRow(index , cUserCode) {
    const url = new URL('http://localhost:3000/lookup/appusers');
    const params = new URLSearchParams();
    params.append('UserCode', cUserCode);

    try {
        const response = await fetch(`${url}?${params.toString()}`);
        const updatedItem = await response.json();

        // If updatedItem is an array, access the first element (assuming only one result is returned)
        const item = Array.isArray(updatedItem) ? updatedItem[index] : updatedItem;
        if (!item) {
            console.error('No valid app user returned.');
        return;
    }


    // Find the row in the table to update using the index
    const row = document.querySelector(`#ListUserTable tbody tr[data-index="${index}"]`);
    if (row) {

        // Update the row's content with the new item data
        row.querySelector('td:nth-child(1)').textContent = item.UserCode || 'N/A';  
        row.querySelector('td:nth-child(2)').textContent = item.UserName || 'N/A';  
        row.querySelector('td:nth-child(3)').textContent = item.NickName || 'N/A';  
        row.querySelector('td:nth-child(4)').textContent = item.EmailAdd || 'N/A';  
        row.querySelector('td:nth-child(5)').textContent = item.Position || 'N/A';  
        row.querySelector('td:nth-child(6)').textContent = item.Tel_Num_ || 'N/A';  
        row.querySelector('td:nth-child(7)').textContent = item.Remarks_ || 'N/A';  

        if (item.Disabled) {
            row.style.color = 'darkgrey'; // Set background color to dark grey if Disabled is true
        } else {
            row.style.color = ''; // Reset background color if Disabled is false
        }
    }
    globalData[index] = item;

    } catch (error) {
        console.error('Error during fetch:', error);
        displayErrorMsg(error,"Failed to fetch User")

    }
    
}


async function UserForm(index, editMode) {
    if (document.getElementById('user-form')) {
        console.log("user-form exists");
        return; // If it already exists, do nothing
    }

    const itemData = globalData[index];

    // Create the form element
    const itemForm = document.createElement('form');
    itemForm.id = "user-form";
    itemForm.classList.add('item-form');
    itemForm.style.display = "none";  // Start with it hidden

    itemForm.innerHTML = `
        <div id="titleBar">App Users Form</div>
        <div class="inputSection">
            <br>        
            <div class="textDiv">
                <div class="subTextDiv">
                    <label for="UserName">App User Name</label>
                    <input type="text" style="width: 100%" id="UserName" spellcheck="false" required>
                </div>
                <div class="subTextDiv">
                    <label for="EmailAdd">Email Address</label>
                    <input type="text" id="EmailAdd" spellcheck="false" required>
                </div>
            </div>
            <div class="textDiv" style="display: flex; justify-content: space-between">
                <div class="subTextDiv">
                    <label for="UserCode">Code</label>
                    <input type="text" id="UserCode" spellcheck="false" required readonly>
                </div>
                <div class="subTextDiv">
                    <label for="Tel_Num_">Mobile Number</label>
                    <input type="text" id="Tel_Num_" spellcheck="false" required>
                </div>
                <div class="subTextDiv">
                    <label for="Position">Position</label>
                    <input type="text" id="Position" spellcheck="false" required>
                </div>
                <div class="subTextDiv">
                    <label for="Password">Password</label>
                    <input type="password" id="Password" spellcheck="false" required>
                </div>
            </div>
            <div class="textDiv">
                <div class="subTextDiv">
                    <label for="NickName">Nick Name</label>
                    <input type="text" id="NickName" spellcheck="false" required>
                </div>
                <div class="subTextDiv">
                    <label for="Remarks_">Remarks</label>
                    <input type="text" id="Remarks_" spellcheck="false" required>
                </div>
                <div id="chkDiv">
                    <input type="checkbox" id="Disabled" >
                    <label for="Disabled">Disabled</label>
                </div>
            </div>
            <div class="btnDiv">
                <button type="submit" id="saveAppUsersBtn" class="saveBtn"><i class="fa fa-save"></i>  Save</button>
                <button type="button" id="cancelAppUsersBtn" class="cancelBtn"><i class="fa fa-close"></i>  Close</button>
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

    // Append the form to the container 
    document.getElementById('AppUsersFile').appendChild(itemForm);
    document.getElementById('AppUsersFile').appendChild(overlay);

    // Show the form by changing its display style
    itemForm.style.display='flex'

    if (editMode) {
        // If editing an existing record, show its details
        document.getElementById('UserCode').value = itemData.UserCode;
        document.getElementById('UserName').value = itemData.UserName;
        document.getElementById('EmailAdd').value = itemData.EmailAdd;
        document.getElementById('Position').value = itemData.Position;
        document.getElementById('Tel_Num_').value = itemData.Tel_Num_;
        document.getElementById('Password').value = itemData.Password;
        document.getElementById('NickName').value = itemData.NickName;
        document.getElementById('Remarks_').value = itemData.Remarks_;
        document.getElementById('Disabled').checked = itemData.Disabled ? true : false;


    } else {
        // If adding new, populate with default empty values
        document.getElementById('UserName').value = '';
        document.getElementById('EmailAdd').value = '';
        document.getElementById('Position').value = '';
        document.getElementById('Tel_Num_').value = '';
        document.getElementById('Password').value = '';
        document.getElementById('NickName').value = '';
        document.getElementById('Remarks_').value = '';
        document.getElementById('Disabled').checked = false;
    }

    // Event listener for Cancel button to close the modal
    document.getElementById('cancelAppUsersBtn').addEventListener('click', () => {
        document.getElementById('user-form').remove(); // Remove the form from the DOM
        document.getElementById('modal-overlay').remove();  // Remove overlay
    });

    // Event listener for Save button to edit or add data and close the modal
    document.getElementById('saveAppUsersBtn').addEventListener('click', (e) => {
        e.preventDefault();
        const cUserCode=document.getElementById('UserCode').value;
        const cUserName=document.getElementById('UserName').value;
        const cEmailAdd=document.getElementById('EmailAdd').value;
        const cPosition=document.getElementById('Position').value;
        const cTel_Num_=document.getElementById('Tel_Num_').value;
        const cPassword=document.getElementById('Password').value;
        const cNickName=document.getElementById('NickName').value;
        const cRemarks_=document.getElementById('Remarks_').value;
        const lDisabled=document.getElementById('Disabled').checked ? 1 : 0 

        if (!cUserName) {
            e.preventDefault();
            if (!cUserName || !cEmailAdd) {
                document.getElementById('UserName').focus();
                document.getElementById('UserName').classList.add('invalid');  
            } else if (!cEmailAdd) {
                document.getElementById('EmailAdd').focus();
                document.getElementById('EmailAdd').classList.add('invalid');  // Add a class to highlight
            }
            return;
        }

        if (editMode) {
            // Edit existing record
            editAppUsers(index,cUserCode, cUserName, cEmailAdd, cPosition, cTel_Num_, cPassword, cNickName, cRemarks_, lDisabled)
        
        } else {
            // Add new record
            addAppUsers(cUserName, cEmailAdd, cPosition, cTel_Num_, cPassword, cNickName, cRemarks_, lDisabled)
                            
        }
        document.getElementById('user-form').remove(); 
        document.getElementById('modal-overlay').remove();  // Remove overlay
    });
}

async function editAppUsers(index, cUserCode, cUserName, cEmailAdd, cPosition, cTel_Num_, cPassword, cNickName, cRemarks_, lDisabled) {
    try {

        lDisabled = document.getElementById("Disabled").checked ? '1' : '0';

        const response = await fetch('http://localhost:3000/lookup/editAppUsers', {
            method: 'PUT',  // Use PUT method
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cUserCode: cUserCode,
                cUserName: cUserName,
                cEmailAdd: cEmailAdd,
                cPosition: cPosition,
                cTel_Num_: cTel_Num_,
                cPassword: cPassword,
                cNickName: cNickName,
                cRemarks_: cRemarks_,
                lDisabled: lDisabled
                
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();
        if (updatedItem) {
            // updateTableRow(index, cLocation);
            updateTableRow(index, cUserCode);
            showNotification('App Users record update successful!')
        }

        
    } catch (error) {
        console.error('Update App Users error:', error);
        displayErrorMsg(error,"Update App Users error")

    }
}

async function addAppUsers(cUserName, cEmailAdd, cPosition, cTel_Num_, cPassword, cNickName, cRemarks_, lDisabled) {
    try {

        lDisabled = document.getElementById("Disabled").checked ? '1' : '0';

        const response = await fetch('http://localhost:3000/lookup/addAppUsers', {
            method: 'POST',  // Use PUT method
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cUserName: cUserName,
                cEmailAdd: cEmailAdd,
                cPosition: cPosition,
                cTel_Num_: cTel_Num_,
                cPassword: cPassword,
                cNickName: cNickName,
                cRemarks_: cRemarks_,
                lDisabled: lDisabled
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();
        if (updatedItem) {
            showNotification('App User record added successful!')
            globalData.push(updatedItem);
            updateTable();            
            // Scroll to the last row after updating the table
            setTimeout(() => {
                const tableBody = document.getElementById('ListUserBody'); 
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
        console.error('Insert AppUsers error:', error);
        displayErrorMsg(error,"Insert AppUsers error")

    }
}


async function deleteAppUsers(cUserCode) {
    try {
        const response = await fetch(`http://localhost:3000/lookup/deleteAppUsers/${encodeURIComponent(cUserCode)}`, {
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
        alert('App User deleted successfully');
        return true;
    } catch (error) {
        console.error('Delete AppUsers error:', error);
        displayErrorMsg(error,"Deleted AppUsers error")
        return false;
    }
}

function updateTable() {
    const reportBody = document.getElementById('ListUser');
    reportBody.innerHTML = ''; // Clear previous content

    const listTable = `
        <div id="tableDiv">
        <table id="ListUserTable">
            <thead id="Look_Up_Head">
                <tr>
                    <th>Code</th>
                    <th>User Name</th>
                    <th>Nick Name</th>
                    <th>Email</th>
                    <th>Position</th>
                    <th>Tel No</th>
                    <th>Remarks</th>
                    <th></th>
                </tr>
            </thead>
            <tbody id="ListUserBody">
                ${globalData.map((item, index) => `
                    <tr id="trLocaList" data-index="${index}" style="${item.Disabled ? 'color: darkgray;' : ''}">
                        <td>${item.UserCode || 'N/A'}</td>
                        <td class="colNoWrap">${item.UserName || 'N/A'}</td>
                        <td>${item.NickName || 'N/A'}</td>
                        <td>${item.EmailAdd || 'N/A'}</td>
                        <td>${item.Position || 'N/A'}</td>
                        <td>${item.Tel_Num_ || 'N/A'}</td>
                        <td>${item.Remarks_ || 'N/A'}</td>
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


document.getElementById('filterUser').addEventListener('click', async () => {
    try {
        FiltrRec('ListUser').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));

            // const dDateFrom = filterData[0];
            // const dDate__To = filterData[1];
            // const cLocation = filterData[2];
            // const cUsersCde = filterData[3];
            // const cOtherCde = filterData[4];
            // const cDescript = filterData[5];
            // const cBrandNum = filterData[6];
            // const cCategNum = filterData[7];
            // const cItemType = filterData[8];
            // const cItemDept = filterData[9];
            // const cReferDoc = filterData[10];
            // const dAsOfDate = filterData[11];
            // const cStoreGrp = filterData[12];
            const cUserName = filterData[13];

            ListUser(cUserName)
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")

    }
});

document.getElementById('printUserXLS').addEventListener('click', () => {

    const titleRowsContent = [
        { text: 'REGENT TRAVEL RETAIL GROUP', style: { fontWeight: 'bold', fontSize: 14 } },
        { text: 'App Users List', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
        { text: '' } // Spacer row
    ];
    const colWidths = [
        { width: 8 },{ width: 30 },{ width: 10 },{ width: 30 },
        { width: 20 },{ width: 25 },{ width: 30 }, // Remarks
    ];

    const columnConfig = [
        {label: 'Code', getValue: row => row.UserCode, type: 'string', align: 'left' },
        {label: 'User Name',getValue: row => row.UserName,type: 'string', align: 'left'},
        {label: 'Nick Name',getValue: row => row.NickName,type: 'string',align: 'left'},
        {label: 'Email Address',getValue: row => row.EmailAdd, type: 'string',align: 'left'},
        {label: 'Position',getValue: row => row.Position,type: 'string',align: 'left'},
        {label: 'Mobile No.',getValue: row => row.Tel_Num_,type: 'string',align: 'left'},
        {label: 'Remarks',getValue: row => row.Remarks_,type: 'string',align: 'left'},
    ];
    
    const titleRows = generateTitleRows(columnConfig, titleRowsContent, 0);
    
    printReportExcel(globalData, columnConfig, colWidths, titleRows, 'App Users', 2);
})
