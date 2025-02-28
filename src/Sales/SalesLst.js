import { showReport, formatDate, yyyymmdd, populateLocation, showNotification } from '../FunctLib.js';
import { FiltrRec } from "../FiltrRec.js"

const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });    

let globalData = []; // Define a global array
let itemsDtl = []; 
async function SalesLst(dDateFrom, dDateTo__, cLocation) {

    const salesLstCounter=document.getElementById('salesLstCounter')
    document.getElementById('loadingIndicator').style.display = 'flex';

    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/sales/SalesRecLst');
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
    const reportBody = document.getElementById('salesRecList');
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

async function SaleForm(index,editMode) {
    const reportBody = document.getElementById('salesInvoice');
    reportBody.innerHTML =''

    const salesDtlCounter=document.getElementById('salesDtlCounter')
    const itemData = globalData[index];

    reportBody.innerHTML = `
        <div id="invoiceForm">
            <div id="inputFields" class="textDiv">
                <div>
                    <label for="Location">Location</label>
                    <select id="Location"></select>
                </div>
                <div>
                    <label for="ReferDoc">Ref. No</label>
                    <input type="text" id="ReferDoc" spellcheck="false">
                </div>
                <div>
                    <label for="DateFrom">Date:</label>
                    <input type="date" id="DateFrom">
                </div>
                <div>
                    <label for="CustName">Customer</label>
                    <input type="text" id="CustName" spellcheck="false">
                </div>
                <div>
                    <label for="Remarks_">Remarks</label>
                    <input type="text" id="Remarks_" spellcheck="false">
                </div>
            </div>
        </div>
        <div id="itemsTableDiv">
            <br>
            <table id="ListItemTable">
                <thead id="ListItemHead">
                    <tr>
                        <th>Qty</th>
                        <th>Stock No.</th>
                        <th>Bar Code</th>
                        <th>Item Description</th>
                        <th>Gross</th>
                        <th>Discount</th>
                        <th>Net</th>
                    </tr>
                </thead>
                 <tbody id="ListItemBody"></tbody>
            </table>
        </div>  


    `
    document.getElementById('SalesLst').classList.remove('active')
    showReport('SaleForm')

    await populateLocation('', '');

    if (editMode) {
        document.getElementById('loadingIndicator').style.display = 'flex';

        const cCtrlNum_=itemData.CtrlNum_
        document.getElementById('ReferDoc').value=itemData.ReferDoc
        document.getElementById('DateFrom').value=yyyymmdd(itemData.DateFrom)
        document.getElementById('Remarks_').value=itemData.Remarks_


        const locationSelect = document.getElementById('Location');
        const locationValue = itemData.Location.trim(); // The value that should be selected
        // Check if the select element has options, then set the selected option
        const options = locationSelect.options;
        for (let i = 0; i < options.length; i++) {
            if (options[i].value.trim() == locationValue) {
                options[i].selected = true;
                locationSelect.selectedIndex = i; // Set selectedIndex
                break; 
            }
        }

        try {
            // Build query parameters
            const url = new URL('http://localhost:3000/sales/SalesDtlLst');
            const params = new URLSearchParams();
            if (cCtrlNum_) params.append('CtrlNum_', cCtrlNum_);
    
            // Send request with query parameters
            const response = await fetch(`${url}?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            itemsDtl = await response.json(); // Store full data array globally
            salesDtlCounter.innerHTML=`${itemsDtl.length} Records`

            updateItemTable();

    
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            document.getElementById('loadingIndicator').style.display = 'none';
        }
    } else {

    }
    document.getElementById('cancelBtn').addEventListener('click', () => {
        showReport('SalesLst')  //Show SalesRec List
    });

    document.getElementById('saveBtn').addEventListener('click', (e) => {
        e.preventDefault();

        showReport('SalesLst')
    })
}


function updateItemTable() {
    const ListItemBody=document.getElementById('ListItemBody')
    const listTable = `
            ${itemsDtl.map((item, index) => `
                <tr id="trLocaList" data-index="${index}" >
                    <td>${item.Quantity.toFixed(0) || 'N/A'}</td>
                    <td>${item.UsersCde || 'N/A'}</td>
                    <td>${item.OtherCde || 'N/A'}</td>
                    <td class="colNoWrap">${item.Descript || 'N/A'}</td>
                    <td>${formatter.format(item.Quantity*item.ItemPrce) || 'N/A'}</td>
                    <td>${(item.Quantity*item.ItemPrce)-(item.Quantity*item.Amount__) || 'N/A'}</td>
                    <td>${formatter.format(item.Quantity*item.Amount__) || 'N/A'}</td>
                </tr>
            `).join('')}
        `;

    ListItemBody.innerHTML = listTable; // Update the tbody with new rows
}

document.addEventListener('DOMContentLoaded', () => {
    const liSalesLstMenu = document.querySelectorAll('.SalesInvoice');
    const salesLstFileDiv = document.getElementById('SalesLst');
    const saleFormFileDiv = document.getElementById('SaleForm');
    const closeSalesRec = document.getElementById('closeSalesRec');
    const closeSalesDtl = document.getElementById('closeSalesDtl');
    const addSalesRec = document.getElementById('addSalesRec');

    addSalesRec.addEventListener('click', () => {
        SaleForm();
    });

    closeSalesRec.addEventListener('click', () => {
        salesLstFileDiv.classList.remove('active');
    });
    closeSalesDtl.addEventListener('click', () => {
        saleFormFileDiv.classList.remove('active');
        showReport('SalesLst')
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

            SalesLst(dDateFrom,dDate__To,cLocation) //Calling Main SalesRec List
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
    }
});


