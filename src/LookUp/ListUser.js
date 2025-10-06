import { showReport, showNotification, highlightRow, makeDraggable, encrypt, decrypt } from "../FunctLib.js";
import { FiltrRec, displayErrorMsg } from "../FiltrRec.js"
import {printReportExcel, generateTitleRows} from '../PrintRep.js'


const divListUser = `
    <div id="AppUsersFile" class="report-section containerDiv">
        <div class="ReportHead">
            <span>App Users File</span>
            <button id="closeUser" class="closeForm">✖</button>
        </div>
        <div id="ListUser" class="ReportBody data-list">
            <table>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>User Name</th>
                        <th>Nick Name</th>
                        <th>Suffix</th>
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
                <button id="printUserXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="filterUser"><i class="fa fa-list"></i> List</button>

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
    
    cUserName = !cUserName ? '%' : cUserName

    try {
        const API_BASE = 'localhost'
        const url = new URL(`http://${API_BASE}:3000/lookup/appusers`);
        const params = new URLSearchParams();
        // if (cUserName) params.append('UserName', cUserName?.trim() || '');
        if (cUserName) params.append('UserName', cUserName);

        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) throw new Error('Network response was not ok');

        globalData = await response.json(); // Store full data array globally
        listCounter.innerHTML=`${globalData.length} Records`

        updateTable() //Reused at addAppUsers()
        document.getElementById('printUserXLS').disabled = false

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
    const liAppUsersMenu = document.querySelectorAll('.AppUsers');
    const appusersFileDiv = document.getElementById('AppUsersFile');
    const closeList = document.getElementById('closeUser');
    const addItem = document.getElementById('addUser');

    addItem.addEventListener('click', () => {
        UserForm();
    });

    closeList.addEventListener('click', () => {
        appusersFileDiv.classList.remove('active');
    });

    liAppUsersMenu.forEach((element) => {
        element.addEventListener('click', ()=> {
            showReport('AppUsersFile')
        })
    })
});


async function updateTableRow(index , cUserName) {
    
    cUserName = !cUserName ? '%' : cUserName
    const API_BASE = 'localhost'
    const url = new URL(`http://${API_BASE}:3000/lookup/appusers`);
    const params = new URLSearchParams();
    params.append('UserName', cUserName);

    try {
        const response = await fetch(`${url}?${params.toString()}`);
        const updatedItem = await response.json();
        // If updatedItem is an array, access the first element (assuming only one result is returned)
        // const item = Array.isArray(updatedItem) ? updatedItem[index] : updatedItem;
        const item = Array.isArray(updatedItem) && updatedItem.length > 0 ? updatedItem[0] : updatedItem;
        if (!item) {
            console.error('No valid app user returned.') ;
            return;   
        }

        // Find the row in the table to update using the index
        const row = document.querySelector(`#ListUserTable tbody tr[data-index="${index}"]`);
        if (row) {

            // Update the row's content with the new item data
            row.querySelector('td:nth-child(1)').textContent = item.UserCode || 'N/A';  
            row.querySelector('td:nth-child(2)').textContent = item.UserName || 'N/A';  
            row.querySelector('td:nth-child(3)').textContent = item.NickName || 'N/A';  
            row.querySelector('td:nth-child(4)').textContent = item.SuffixId || 'N/A';  
            row.querySelector('td:nth-child(5)').textContent = item.EmailAdd || 'N/A';  
            row.querySelector('td:nth-child(6)').textContent = item.Position || 'N/A';  
            row.querySelector('td:nth-child(7)').textContent = item.Tel_Num_ || 'N/A';  
            row.querySelector('td:nth-child(8)').textContent = item.Remarks_ || 'N/A';  

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
    let cMenuOpts = ''

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
                    <label for="AppUsers_UserName">App User Name</label>
                    <input type="text" class="lookUpperCase" style="width: 100%" id="AppUsers_UserName" spellcheck="false"  required autocapitalize="on">
                </div>
                <div class="subTextDiv">
                    <label for="AppUsers_EmailAdd">Email Address</label>
                    <input type="text" id="AppUsers_EmailAdd" spellcheck="false" required>
                </div>
            </div>
            <div class="textDiv" style="display: flex; justify-content: space-between">
                <div class="subTextDiv">
                    <label for="AppUsers_UserCode">Code</label>
                    <input type="text" class="lookUpperCase" id="AppUsers_UserCode" spellcheck="false" required readonly>
                </div>
                <div class="subTextDiv">
                    <label for="AppUsers_Tel_Num_">Mobile Number</label>
                    <input type="text" class="lookUpperCase" id="AppUsers_Tel_Num_" spellcheck="false" required>
                </div>
                <div class="subTextDiv">
                    <label for="AppUsers_Position">Position</label>
                    <input type="text" id="AppUsers_Position" spellcheck="false" >
                </div>
                <div class="subTextDiv">
                    <label for="AppUsers_Password">Password</label>
                    <input type="password" id="AppUsers_Password" spellcheck="false" required>
                </div>
            </div>
            <div class="textDiv">
                <div class="textDiv">
                    <div class="subTextDiv">
                        <label for="AppUsers_NickName">Nick Name</label>
                        <input type="text" id="AppUsers_NickName" spellcheck="false" required>
                    </div>
                    <div class="subTextDiv">
                        <label for="AppUsers_SuffixId">Data Suffix</label>
                        <input type="text" class="lookUpperCase" id="AppUsers_SuffixId" spellcheck="false" required autocapitalize="on">
                    </div>
                </div>

                <div class="subTextDiv">
                    <label for="AppUsers_Remarks_">Remarks</label>
                    <input type="text" id="AppUsers_Remarks_" spellcheck="false" >
                </div>
            </div>
            <div class="textDiv">
                <div class="subTextDiv">
                    <label for="AppUsers_Address_">Address</label>
                    <input type="text" id="AppUsers_Address_" spellcheck="false" >
                </div>
            </div>

            <br>
            <div class="textDiv">
                <div class="subTextDiv">
                    <button type="button" id="menuItemBtn" ><i class="fa fa-cancel"></i>  Menu Permissions</button>                
                </div>
                <div id="chkDiv">
                    <input type="checkbox" id="AppUsers_Disabled" >
                    <label for="AppUsers_Disabled">Disabled</label>
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
    cMenuOpts = editMode ?itemData.MenuOpts : ''

    if (editMode) {
        // If editing an existing record, show its details
        document.getElementById('AppUsers_UserCode').value = itemData.UserCode;
        document.getElementById('AppUsers_UserName').value = itemData.UserName;
        document.getElementById('AppUsers_EmailAdd').value = itemData.EmailAdd;
        document.getElementById('AppUsers_Position').value = itemData.Position;
        document.getElementById('AppUsers_Tel_Num_').value = itemData.Tel_Num_;
        document.getElementById('AppUsers_Password').value = decrypt(itemData.Password,'WPE');
        document.getElementById('AppUsers_NickName').value = itemData.NickName;
        document.getElementById('AppUsers_SuffixId').value = itemData.SuffixId;
        document.getElementById('AppUsers_Remarks_').value = itemData.Remarks_;
        document.getElementById('AppUsers_Address_').value = itemData.Address_;
        document.getElementById('AppUsers_Disabled').checked = itemData.Disabled ? true : false;

    } else {
        // If adding new, populate with default empty values
        document.getElementById('AppUsers_UserCode').value = 'New Record';
        document.getElementById('AppUsers_UserName').value = '';
        document.getElementById('AppUsers_EmailAdd').value = '';
        document.getElementById('AppUsers_Position').value = '';
        document.getElementById('AppUsers_Tel_Num_').value = '';
        document.getElementById('AppUsers_Password').value = '';
        document.getElementById('AppUsers_NickName').value = '';
        document.getElementById('AppUsers_SuffixId').value = '';
        document.getElementById('AppUsers_Remarks_').value = '';
        document.getElementById('AppUsers_Address_').value = '';
        document.getElementById('AppUsers_Disabled').checked = false;
        document.getElementById('menuItemBtn').disabled = true
    }

    // Event listener for users Menu Permissions
    document.getElementById('menuItemBtn').addEventListener('click',() => MenuOpts(index))

    // document.getElementById('cancelAppUsersBtn').addEventListener('click',() => {
    //     document.getElementById('menuOptDiv').style.display = 'none';
    // })

    // Event listener for Cancel button to close the modal
    document.getElementById('cancelAppUsersBtn').addEventListener('click', () => {
        document.getElementById('user-form').remove(); // Remove the form from the DOM
        document.getElementById('modal-overlay').remove();  // Remove overlay
        document.getElementById('menuOptDiv').style.display = 'none';

    });

    document.addEventListener('click', (e) => {
        const menuOptDiv = document.getElementById('menuOptDiv')
        if (!menuOptDiv.contains(e.target)) {
            // menuOptDiv.style.display = 'none';  // Hide if clicked outside
        }
    });

    
    document.getElementById('saveAppUsersBtn').addEventListener('click', (e) => {
        e.preventDefault();
        
        const cUserCode = document.getElementById('AppUsers_UserCode').value;
        const cUserName = document.getElementById('AppUsers_UserName').value.trim();
        const cEmailAdd = document.getElementById('AppUsers_EmailAdd').value.trim();
        const cPosition = document.getElementById('AppUsers_Position').value.trim();
        const cTel_Num_ = document.getElementById('AppUsers_Tel_Num_').value.trim();
        const cPassword = encrypt(document.getElementById('AppUsers_Password').value.trim(),'WPE');
        const cNickName = document.getElementById('AppUsers_NickName').value.trim();
        const cSuffixId = document.getElementById('AppUsers_SuffixId').value.trim();
        const cRemarks_ = document.getElementById('AppUsers_Remarks_').value.trim();
        const cAddress_ = document.getElementById('AppUsers_Address_').value.trim();
        const lDisabled = document.getElementById('AppUsers_Disabled').checked ? 1 : 0;
        const cMenuOpts = !globalData[index] ? '' : globalData[index].MenuOpts.trim()

        // Reset any previous invalid styling
        document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

        // Validation check for empty fields
        if (!cUserName || !cEmailAdd || !cPassword || !cNickName || !cSuffixId) {
            if (!cUserName) {
                document.getElementById('AppUsers_UserName').focus();
                document.getElementById('AppUsers_UserName').classList.add('invalid');
            } else if (!cEmailAdd) {
                document.getElementById('AppUsers_EmailAdd').focus();
                document.getElementById('AppUsers_EmailAdd').classList.add('invalid');
            } else if (!cPassword) {
                document.getElementById('AppUsers_Password').focus();
                document.getElementById('AppUsers_Password').classList.add('invalid');
            } else if (!cNickName) {
                document.getElementById('AppUsers_NickName').focus();
                document.getElementById('AppUsers_NickName').classList.add('invalid');
            } else if (!cSuffixId) {
                document.getElementById('AppUsers_SuffixId').focus();
                document.getElementById('AppUsers_SuffixId').classList.add('invalid');
            }
            return; // Exit if validation fails
        }

        // Proceed with add or edit logic based on editMode
        if (editMode) {
            // Edit existing record
            // console.log('editMode',cMenuOpts)
            editAppUsers(index, cUserCode, cUserName, cEmailAdd, cPosition, cTel_Num_, cPassword, cNickName, cSuffixId, cRemarks_, cMenuOpts, cAddress_, lDisabled);
        } else {
            // Add new record
            addAppUsers(cUserName, cEmailAdd, cPosition, cTel_Num_, cPassword, cNickName, cSuffixId, cRemarks_, cMenuOpts, cAddress_, lDisabled);
        }

        // Remove form and modal overlay
        document.getElementById('user-form').remove(); 
        document.getElementById('modal-overlay').remove(); 
        // document.getElementById('menuOptDiv').style.display = 'none';
    });

}

async function editAppUsers(index, cUserCode, cUserName, cEmailAdd, cPosition, cTel_Num_, cPassword, cNickName, cSuffixId, cRemarks_, cMenuOpts, cAddress_, lDisabled) {
    try {

        lDisabled = document.getElementById("AppUsers_Disabled").checked ? '1' : '0';
        cSuffixId = cSuffixId.toUpperCase()
        const API_BASE = 'localhost'
        const response = await fetch(`http://${API_BASE}:3000/lookup/editAppUsers`, {
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
                cSuffixId: cSuffixId,
                cMenuOpts: cMenuOpts,
                cRemarks_: cRemarks_,
                cAddress_: cAddress_,
                lDisabled: lDisabled
                
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();
        if (updatedItem) {
            updateTableRow(index, cUserName);
            showNotification('App Users record update successful!')
        }

        
    } catch (error) {
        console.error('Update App Users error:', error);
        displayErrorMsg(error,"Update App Users error")

    }
}

async function addAppUsers(cUserName, cEmailAdd, cPosition, cTel_Num_, cPassword, cNickName, cSuffixId, cRemarks_, cMenuOpts, cAddress_, lDisabled) {
    try {

        lDisabled = document.getElementById("AppUsers_Disabled").checked ? '1' : '0';
        cSuffixId = cSuffixId.toUpperCase()
        cUserName = cUserName.tuUpperCase()

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
                cSuffixId: cSuffixId,
                cRemarks_: cRemarks_,
                cMenuOpts: cMenuOpts,
                cAddress_: cAddress_,
                lDisabled: lDisabled
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();
        if (updatedItem) {
            // console.log(updatedItem)
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
                    <th>Suffix</th>
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
                        <td>${item.SuffixId || 'N/A'}</td>
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
            const cUserName = !filterData[13] ? '' : filterData[13];

            ListUser(cUserName)
        });

    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")

    }
            // ListUser('')

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



function MenuOpts(index) {
    let nIndex = index
    const cNickName =  !globalData[index] ? 'New User' :globalData[index].NickName.trim()
    const menuItems = localStorage.getItem('menuItems'); // Restricted menu options for user
    const menuOptDiv = document.getElementById("menuOptDiv");
    menuOptDiv.style.display = 'flex';
    menuOptDiv.style.flexDirection = 'column';
    // menuOptDiv.style.backgroundColor = 'var(--main-bg-color)';
    menuOptDiv.style.height = '600px';
    menuOptDiv.style.width = '400px';
    menuOptDiv.style.overflowY = 'auto';
    menuOptDiv.style.zIndex = '800';
    menuOptDiv.style.border = '1px solid #ddd';
    menuOptDiv.style.position = 'absolute';
    menuOptDiv.style.top = '50%';
    menuOptDiv.style.left = '50%';
    menuOptDiv.style.transform = 'translate(-50%, -50%)';
    menuOptDiv.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    menuOptDiv.style.backgroundImage = 'linear-gradient(to right, #ffff, var(--main-bg-color))'; 

    const titleBar = document.getElementById("menuSelect");
    titleBar.innerHTML = ''
    titleBar.style.display = 'flex';
    titleBar.style.width = '100%';
    titleBar.style.position = "sticky";
    titleBar.style.top = "0px";
    titleBar.style.justifyContent = "space-between";
    titleBar.style.alignItems = "center";
    titleBar.style.padding = "10px";
    titleBar.style.zIndex = "1";
    titleBar.style.borderBottom = "1px solid #ccc";
    titleBar.style.backgroundColor = "var(--main-bg-color)";
    titleBar.style.color = "white";
    
    // Create title text
    const titleText = document.createElement('p');
    titleText.textContent = `Click menu items to disable for ${cNickName}`;
    titleText.style.margin = "0";
    titleText.style.flex = "1";  
    titleText.style.whiteSpace = "nowrap";  
    titleText.style.overflow = "hidden";
    titleText.style.textOverflow = "ellipsis";

    // Create close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'closeForm';
    closeBtn.innerHTML = '<i class="fa fa-close"></i>';
    closeBtn.style.cursor = "pointer";
    closeBtn.style.flex = "0";  
    closeBtn.style.marginLeft = "10px";
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.height = '100%'; 
    closeBtn.classList.add('wiggle-on-hover');
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.backgroundColor = 'red';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.backgroundColor = ''; // or restore original color
    });
    closeBtn.addEventListener('click', () => {
        menuOptDiv.style.display = 'none';
    });
        
    // Append both to titleBar
    titleBar.appendChild(titleText);
    titleBar.appendChild(closeBtn);

    // Make window draggable
    makeDraggable(menuOptDiv,titleBar)

    // Now get the menu container div where we will render the menu items
    const menuSelectDiv = document.getElementById("selectMenu");

    // Function to parse menu items and create an array structure
    function parseMenuItems(menuHTML) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(menuHTML, 'text/html');

        const menuList = Array.from(doc.querySelectorAll('li')).map(parent => {
            const submenu = parent.querySelector('.submenu');
            
            if (submenu) {
                const categoryName = parent.textContent.trim().split('\n')[0].trim();
                const subMenuItems = Array.from(submenu.querySelectorAll('li')).map(item => {
                    return {
                        name: item.textContent.trim(),
                        ref: item.getAttribute('menu-ref'),
                        id: item.id || null,
                        selected: false // Initially, not selected
                    };
                });

                return { category: categoryName, items: subMenuItems };
            }
        }).filter(Boolean); // Filter out any null or undefined entries (in case no submenu exists)

        return menuList;
    }


    // Function to render the menu with checkboxes
    let menu = [];
    function renderMenu() {
        menuSelectDiv.innerHTML = ''; // Clear the container before rendering

        menu.forEach(category => {
            const categoryElement = document.createElement('div');
            const categoryHeader = document.createElement('h5');
            categoryHeader.textContent = category.category;
            categoryHeader.style.paddingLeft = '10px';  
            categoryElement.appendChild(categoryHeader);

            const submenu = document.createElement('ul');
            category.items.forEach(item => {
                const menuItem = document.createElement('li');

                // Create div for checkbox and label
                const checkboxDiv = document.createElement('div');
                const labelDiv = document.createElement('div');
                
                // Create checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = item.ref;  // Set a unique id for each checkbox
                checkbox.checked = item.selected; // Check if the item is selected
                checkbox.addEventListener('change', () => toggleMenuItem(item.ref));
                checkbox.style.cursor = 'pointer';
                
                // Create label
                const label = document.createElement('label');
                label.setAttribute('for', item.ref);  // Associate the label with the checkbox by setting 'for' to the checkbox's id
                label.textContent = item.name;
                label.style.cursor = 'pointer';
                
                // Append checkbox and label to their respective divs
                checkboxDiv.appendChild(checkbox);
                labelDiv.appendChild(label);

                // Style the divs to have fixed widths and align them
                checkboxDiv.style.width = '30px'; // Set a fixed width for the checkbox
                checkboxDiv.style.textAlign = 'center'; // Align the checkbox in the center
                
                labelDiv.style.flex = '1'; // Take the remaining space
                labelDiv.style.textAlign = 'left'; // Align the label text to the left

                // Append the divs to the menuItem
                menuItem.appendChild(checkboxDiv);
                menuItem.appendChild(labelDiv);
                menuItem.addEventListener('mouseenter', () => {
                    menuItem.style.backgroundColor = '#333';
                    label.style.color = 'white';
                });
                menuItem.addEventListener('mouseleave', () => {
                    menuItem.style.backgroundColor = ''; // or restore original color
                    label.style.color = '';
                });


                // Use flexbox to align the divs horizontally
                menuItem.style.display = 'flex';
                menuItem.style.alignItems = 'center';  
                menuItem.style.marginBottom = '5px';   
                menuItem.style.paddingRight = '10px';  
                menuItem.style.paddingLeft = '10px';  
                if (item.selected) {
                    labelDiv.style.opacity = '0.6';         
                }


                submenu.appendChild(menuItem);
            });
            
            categoryElement.appendChild(submenu);
            menuSelectDiv.appendChild(categoryElement);

        });
    }

    // Function to toggle a menu item (update its selection state)
    function toggleMenuItem(ref) {
        // Find the item by its reference and toggle its selection state
        menu.forEach(category => {
            category.items.forEach(item => {
                if (item.ref === ref) {
                    item.selected = !item.selected; // Toggle selection
                }
            });
        });

        updateMenuOpts(); // Update the menuOpts string after toggle
        // Update the UI (render the menu again) to reflect the new state
        renderMenu();
    }

    // Function to update the menuOpts string
    function updateMenuOpts() {
        // Generate a comma-separated string of selected menu refs
        const selectedItems = [];
        menu.forEach(category => {
            category.items.forEach(item => {
                if (item.selected) {
                    selectedItems.push(item.ref); // Push the reference of selected items
                }
            });
        });

        const menuOpts = selectedItems.join(','); // Create the menuOpts string
        globalData[nIndex].MenuOpts = menuOpts  // You can send this to the backend or use it elsewhere
    }

    // Function to initialize the menu based on selected options
    function initializeMenu(menuOpts) {
        const selectedRefs = menuOpts.split(',');

        menu.forEach(category => {
            category.items.forEach(item => {
                if (selectedRefs.includes(item.ref)) {
                    item.selected = true; // Mark as selected (crossed out)
                }
            });
        });

        renderMenu(); // Re-render the menu after initialization
    }

    // Simulate fetching menuOpts from backend and initializing the menu
    // const menuOpts = "A02,A04,B03,B04,B05"; 
    const menuOpts = !globalData[index] ? '': globalData[index].MenuOpts.trim(); 

    menu = parseMenuItems(menuItems); // Parse the menu structure
    initializeMenu(menuOpts);  // Initialize the menu with the selected options

    // document.getElementById('cancelMenuOptsBtn').addEventListener('click', () => {
    //     document.getElementById('menuOptDiv').style.display = 'none';
    // })

}