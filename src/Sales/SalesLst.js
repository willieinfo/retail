import { showReport, formatDate, showNotification } from '../FunctLib.js';
import { FiltrRec } from "../FiltrRec.js"

const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });    

let globalData = []; // Define a global array
async function SalesLst(dDateFrom, dDateTo__, cLocation) {

    const salesLstCounter=document.getElementById('salesLstCounter')
    document.getElementById('loadingIndicator').style.display = 'flex';

    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/sales/SalesLst');
        const params = new URLSearchParams();
        if (dDateFrom) params.append('DateFrom', dDateFrom); 
        if (dDateTo__) params.append('DateTo__', dDateTo__); 
        if (cLocation) params.append('Location', cLocation);

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        globalData = await response.json(); // Store full data array globally
        salesLstCounter.innerHTML=`${globalData.length} Records`
      
        updateTable() //Render Sales Invoices List

    } catch (error) {
        console.error('Fetch error:', error);
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

function updateTable() {
    const reportBody = document.getElementById('salesInvoice');
    reportBody.innerHTML = ''; // Clear previous content

    const listTable = `
        <div id="tableDiv">
        <table id="ListSalesTable">
            <thead id="Look_Up_Head">
                <tr>
                    <th>Control No</th>
                    <th>Ref. Doc</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Amount</th>
                    <th>Items</th>
                    <th>Remarks</th>
                    <th>Encoder</th>
                    <th>Log Date</th>
                </tr>
            </thead>
            <tbody id="ListSalesBody">
                ${globalData.map((item, index) => `
                    <tr id="trSaleList" data-index="${index}" style="${item.Disabled ? 'color: darkgray;' : ''}">
                        <td>${item.CtrlNum_ || 'N/A'}</td>
                        <td>${item.ReferDoc || 'N/A'}</td>
                        <td>${formatDate(item.DateFrom) || 'N/A'}</td>
                        <td class="colNoWrap">${item.LocaName || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(item.Amount__) || 'N/A'}</td>
                        <td style="text-align: center">${item.NoOfItem.toFixed(0) || 'N/A'}</td>
                        <td>${item.Remarks_ || 'N/A'}</td>
                        <td>${item.Encoder_ || 'N/A'}</td>
                        <td>${formatDate(item.Log_Date) || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </div>
    `;

    reportBody.innerHTML = listTable;
    document.getElementById('ListSalesBody').addEventListener('click', (event) => {
        const row = event.target.closest('tr'); // Find the clicked row
        if (row) {
            if (!event.target.closest('.spanDelItem')) {
                // Remove 'selected' class from all rows
                const rows = document.querySelectorAll('#ListSalesTable tbody tr');
                rows.forEach(r => r.classList.remove('selected'));
    
                // Add 'selected' class to the clicked row
                row.classList.add('selected');
    
                // Optionally, call your edit function if needed
                const index = parseInt(row.getAttribute('data-index'));
                if (!isNaN(index) && index >= 0 && index < globalData.length) {
                    console.log(`Row clicked for index: ${index}`);
                    SaleForm(index, true); // Pass only the index to your form
                }
            }
        }
    });

    
}

function SaleForm(index,editMode) {
    if (document.getElementById('sale-form')) {
        console.log("sale-form exists");
        // return; // If it already exists, do nothing
    }
    
    const itemData = globalData[index];

    // Create the form element
    const saleForm = document.createElement('form');
    saleForm.id = "sale-form";
    saleForm.style.display = "none";  // Start with it hidden

    saleForm.innerHTML = `
        <div id="titleBar">Sales Form</div>
        <div id="inputSection">
            <br>        
                <div id="salesRecord" class="textDiv">
                    <div>
                        <label for="Location">Location</label>
                        <select id="Location"></select>
                    </div>
                    <div>
                        <label for="ReferDoc">Ref. No</label>
                        <input type="text" id="ReferDoc" name="ReferDoc" spellcheck="false">
                    </div>
                    <div>
                        <label for="Date____">Date:</label>
                        <input type="date" id="Date____">
                    </div>
                </div>

                <div id="btnDiv">
                <button type="submit" id="saveBtn"><i class="fa fa-save"></i>  Save</button>
                <button type="button" id="cancelBtn"><i class="fa fa-close"></i>  Cancel</button>
            </div>
        </div>

    `
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
    document.getElementById('SalesLst').appendChild(saleForm);
    document.getElementById('SalesLst').appendChild(overlay);

    // Show the form by changing its display style
    saleForm.style.display='flex'
    // showReport('SaleForm')

    if (editMode) {


    } else {
        // If adding new, populate with default empty values
    }
    document.getElementById('cancelBtn').addEventListener('click', () => {
        document.getElementById('sale-form').remove(); // Remove the form from the DOM
        document.getElementById('modal-overlay').remove();  // Remove overlay
    });

    document.getElementById('saveBtn').addEventListener('click', (e) => {
        e.preventDefault();

        document.getElementById('sale-form').remove(); 
        document.getElementById('modal-overlay').remove();  
    })
}




document.addEventListener('DOMContentLoaded', () => {
    const liSalesLstMenu = document.querySelectorAll('.SalesInvoice');
    const salesLstFileDiv = document.getElementById('SalesLst');
    const closeList = document.getElementById('closeSales');
    const addSalesRec = document.getElementById('addSalesRec');

    addSalesRec.addEventListener('click', () => {
        SaleForm();
    });

    closeList.addEventListener('click', () => {
        salesLstFileDiv.classList.remove('active');
    });

        // Add event listener to each element with the necessary arguments
    liSalesLstMenu.forEach(element => {
        element.addEventListener('click', () => {
            showReport('SalesLst')
        });
    });
});

document.getElementById('salesFilter').addEventListener('click', async () => {
    try {
        FiltrRec('SalesLst').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));

            // console.log(filterData)
            const dDateFrom = filterData[0];
            const dDate__To = filterData[1];
            const cLocation = filterData[2];
            // const cUsersCde = filterData[3];
            // const cOtherCde = filterData[4];
            // const cDescript = filterData[5];
            // const cBrandNum = filterData[6];
            // const cCategNum = filterData[7];
            // const cItemType = filterData[8];
            // const cItemDept = filterData[9];

            SalesLst(dDateFrom,dDate__To,cLocation)
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
    }
});


