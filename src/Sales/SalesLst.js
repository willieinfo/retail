import { showReport, formatDate, populateLocation, showNotification } from '../FunctLib.js';
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
                        <td class="colNoWrap">${item.Remarks_ || 'N/A'}</td>
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
                    // console.log(`Row clicked for index: ${index}`);
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
                    <select id="SaleLoca"></select>
                </div>
                <div>
                    <label for="ReferDoc">Ref. No</label>
                    <input type="text" id="ReferDoc" spellcheck="false" readonly>
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
        <div class="itemsTableDiv">
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

    await populateLocation('', '','SellArea', 'SaleLoca');

    if (editMode) {
        document.getElementById('loadingIndicator').style.display = 'flex';

        const cCtrlNum_=itemData.CtrlNum_
        document.getElementById('ReferDoc').value=itemData.ReferDoc
        document.getElementById('DateFrom').value=formatDate(itemData.DateFrom,'YYYY-MM-DD')
        document.getElementById('Remarks_').value=itemData.Remarks_


        const locationSelect = document.getElementById('SaleLoca');
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
        // Triggered from +Add button Footer
        const dNew_Date= new Date()
        document.getElementById('DateFrom').value=formatDate(dNew_Date,'YYYY-MM-DD')
        document.getElementById('ReferDoc').value='New Record'
        document.getElementById('Remarks_').value=''
        itemsDtl = []; 
        updateItemTable();
        
    }
}

document.getElementById('saveSalesRecBtn').addEventListener('click', () => {
    
    const salesDtlCounter=document.getElementById('salesDtlCounter').innerText
    const cLocation=document.getElementById('SaleLoca').value
    const cRemarks_=document.getElementById('Remarks_').value
    const dDateFrom=document.getElementById('DateFrom').value


    if (!cLocation) {
        document.getElementById('SaleLoca').focus();
        document.getElementById('SaleLoca').classList.add('invalid');  // Add a class to highlight
        return ;
    }

    if (salesDtlCounter) {
        alert('In edit mode')
    } else {
        const cCtrlNum_='NEW_CTRLID'
        const cEncoder_='Willie'
        const cSuffixId='E'
        const dLog_Date=new Date()
        const nNoOfItem=0
        
        if (addSalesRec(cCtrlNum_, cLocation, dDateFrom, cRemarks_, cEncoder_,
            dLog_Date, nNoOfItem, cSuffixId)) {
            showReport('SalesLst')  //Show back SalesRec List
        }
    }
});


document.getElementById('cancelSalesRecBtn').addEventListener('click', () => {
    showReport('SalesLst')  
});

async function addSalesRec(cCtrlNum_, cLocation, dDateFrom, cRemarks_, cEncoder_,
    dLog_Date, nNoOfItem, cSuffixId) {

    try {
        const response = await fetch('http://localhost:3000/sales/addSalesHeader', {
            method: 'POST',  
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cCtrlNum_: cCtrlNum_,
                cLocation: cLocation, 
                dDateFrom: dDateFrom,
                cRemarks_: cRemarks_,
                cEncoder_: cEncoder_,
                dLog_Date: dLog_Date,
                nNoOfItem: nNoOfItem,
                cSuffixId: cSuffixId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();
        if (updatedItem) {
            
            showNotification('SalesRec record added successfully!')
            globalData.push(updatedItem);
            updateTable();         

            // Scroll to the last row after updating the table
            setTimeout(() => {
                const tableBody = document.getElementById('ListSalesBody'); 
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
        console.error('Update SalesRec error:', error);
    }
}

function updateItemTable() {
    let nTotalQty = 0;
    let nTotalPrc = 0;
    let nTotalDsc = 0;
    let nTotalAmt = 0;

    const ListItemBody=document.getElementById('ListItemBody')
    // Map through itemsDtl and build rows while accumulating totals
    const listTable = itemsDtl.map((item, index) => {
        // Accumulate totals inside the map
        nTotalQty += item.Quantity || 0;
        nTotalPrc += item.Quantity * item.ItemPrce || 0;
        nTotalDsc += (item.Quantity * item.ItemPrce) - (item.Quantity * item.Amount__) || 0;
        nTotalAmt += item.Quantity * item.Amount__ || 0;
        return `
            <tr id="trLocaList" data-index="${index}">
                <td style="text-align: center">${item.Quantity.toFixed(0) || 'N/A'}</td>
                <td class="colNoWrap">${item.UsersCde || 'N/A'}</td>
                <td class="colNoWrap">${item.OtherCde || 'N/A'}</td>
                <td class="colNoWrap">${item.Descript || 'N/A'}</td>
                <td style="text-align: right">${formatter.format(item.Quantity * item.ItemPrce) || 'N/A'}</td>
                <td style="text-align: right">${formatter.format((item.Quantity * item.ItemPrce) - (item.Quantity * item.Amount__)) || 'N/A'}</td>
                <td style="text-align: right">${formatter.format(item.Quantity * item.Amount__) || 'N/A'}</td>
            </tr>
        `;
    }).join(''); // Join all rows into a single string

    const listFooter=`
                <tr></tr>
                <tfooter id="ListItemFoot">
                    <tr style="font-weight: bold">
                        <td style="text-align: center">${nTotalQty.toFixed(0) || 'N/A'}</td>
                        <td></td>
                        <td></td>
                        <td style="text-align: right">Totals: </td>
                        <td style="text-align: right">${formatter.format(nTotalPrc) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalDsc) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalAmt) || 'N/A'}</td>
                    </tr>
                </tfooter>
`

    ListItemBody.innerHTML = listTable+listFooter; // Update the tbody with new rows
    document.getElementById('ListItemBody').addEventListener('click', (event) => {
        const row = event.target.closest('tr'); // Find the clicked row
        if (row) {
            if (!event.target.closest('.spanDelItem')) {
                // Remove 'selected' class from all rows
                const rows = document.querySelectorAll('#ListItemTable tbody tr');
                rows.forEach(r => r.classList.remove('selected'));
    
                // Add 'selected' class to the clicked row
                row.classList.add('selected');
    
                // Optionally, call your edit function if needed
                const index = parseInt(row.getAttribute('data-index'));
                if (!isNaN(index) && index >= 0 && index < globalData.length) {
                    // console.log(`Row clicked for index: ${index}`);
                    SalesDtl(index, true); // Pass only the index to your form
                }
            }
        }
    });

}


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

function SalesDtl(index,editMode) {
    const itemsDtlForm = document.createElement('form');
    itemsDtlForm.id = "items-form";
    itemsDtlForm.style.display = "none";  // Start with it hidden

    const itemData = itemsDtl[index];

    itemsDtlForm.innerHTML = `
        <div id="titleBar">Sales Detail Form</div>
        <div class="inputSection">
            <br>
            <div class="subTextDiv" id="inputDetails">
                <div class="textDiv">
                    <div class="subTextDiv">
                        <label for="UsersCde">Stock No</label>
                        <input type="text" id="UsersCde" name="UsersCde" spellcheck="false">
                    </div>
                    <div class="subTextDiv">
                        <label for="OtherCde">Bar Code</label>
                        <input type="text" id="OtherCde" name="OtherCde" spellcheck="false">
                    </div>
                </div>

                <div id="inputDescript" class="textDiv">
                    <div class="subTextDiv" style="width:100%;">
                        <label for="Descript">Item Description</label>
                        <input type="text" id="Descript" name="Descript" spellcheck="false">
                    </div>
                </div>
                <div class="textDiv">
                    <div class="subTextDiv">
                        <label for="ItemPrce">Item Price</label>
                        <input type="number" id="ItemPrce" name="ItemPrce" spellcheck="false">
                    </div>
                    <div class="subTextDiv">
                        <label for="DiscRate">Less %</label>
                        <input type="number" id="DiscRate" name="DiscRate">
                    </div>
                    <div class="subTextDiv">
                        <label for="Amount__">Net Amount</label>
                        <input type="number" id="Amount__" name="Amount__">
                    </div>
                </div>
            </div>
            
            <div class="btnDiv">
                <button type="submit" id="saveSalesDtlBtn" class="saveBtn"><i class="fa fa-save"></i>  Save</button>
                <button type="button" id="cancelSalesDtlBtn" class="cancelBtn"><i class="fa fa-close"></i>  Cancel</button>
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

    // Form styling to center it
    itemsDtlForm.style.position = 'absolute';
    itemsDtlForm.style.top = '50%';
    itemsDtlForm.style.left = '50%';
    itemsDtlForm.style.transform = 'translate(-50%, -50%)'; // Center the form
    itemsDtlForm.style.backgroundColor = 'whitesmoke';
    itemsDtlForm.style.padding = '10px';
    itemsDtlForm.style.borderRadius = '8px';
    itemsDtlForm.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    itemsDtlForm.style.zIndex = 1000; // Ensure the form is above the overlay
    itemsDtlForm.style.display = 'flex';
    itemsDtlForm.style.flexDirection = 'column';
    itemsDtlForm.style.width = '80%';
    itemsDtlForm.style.maxWidth = '800px';

    document.getElementById('SaleForm').appendChild(itemsDtlForm);
    document.getElementById('SaleForm').appendChild(overlay);
    itemsDtlForm.style.display = 'flex'


    if (editMode) {
        document.getElementById('UsersCde').value=itemData.UsersCde
        document.getElementById('OtherCde').value=itemData.OtherCde
        document.getElementById('Descript').value=itemData.Descript
        document.getElementById('ItemPrce').value=itemData.ItemPrce
        document.getElementById('DiscRate').value=itemData.DiscRate
        document.getElementById('Amount__').value=itemData.Amount__
    } else {
        document.getElementById('UsersCde').value=''
        document.getElementById('OtherCde').value=''
        document.getElementById('Descript').value=''
        document.getElementById('ItemPrce').value=0.00
        document.getElementById('DiscRate').value=0.00
        document.getElementById('Amount__').value=0.00

    }

    document.getElementById('saveSalesDtlBtn').addEventListener('click', (e) => {
        e.preventDefault()
        alert('Save Clicked called from SalesDtl')
        document.getElementById('items-form').remove()
        document.getElementById('modal-overlay').remove();

    })

    document.getElementById('cancelSalesDtlBtn').addEventListener('click', () => {
        console.log('Cancel Clicked called from SalesDtl')
        document.getElementById('items-form').remove()
        document.getElementById('modal-overlay').remove();
    })
}

document.addEventListener('DOMContentLoaded', () => {
    const liSalesLstMenu = document.querySelectorAll('.SalesInvoice');
    const salesLstFileDiv = document.getElementById('SalesLst');
    const saleFormFileDiv = document.getElementById('SaleForm');
    const closeSalesRec = document.getElementById('closeSalesRec');
    const closeSalesDtl = document.getElementById('closeSalesDtl');
    const addSalesRec = document.getElementById('addSalesRec'); //Footer Add button
    const addSalesDtl = document.getElementById('addSalesDtl');

    addSalesRec.addEventListener('click', () => {
        SaleForm();
    });
    addSalesDtl.addEventListener('click', () => {
        SalesDtl();
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




