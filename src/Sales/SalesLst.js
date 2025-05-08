import { showReport, formatDate, populateLocation, showNotification, get24HrTime, debounce,
    MessageBox, formatter, checkEmptyValue, highlightRow, chkUsersCde, addScanCode} from '../FunctLib.js';

import { FiltrRec } from "../FiltrRec.js"
import { printFormPDF } from "../PrintRep.js"

const divSalesLst = `
    <div id="SalesLst" class="report-section containerDiv">
        <div class="ReportHead">
            <span><i class="fa fa-dollar-sign"></i> Sales Record List</span>
            <button id="closeSalesRec" class="closeForm">✖</button>
        </div>
        <div id="salesRecList" class="ReportBody">
            <table>
                <thead>
                    <tr>
                        <th>Control No</th>
                        <th>Ref. Doc</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Qty.</th>
                        <th>Amount</th>
                        <th>Items</th>
                        <th>Remarks</th>
                        <th>Customer</th>
                        <th>Encoder</th>
                        <th>Log Date</th>
                    </tr>
                </thead>
            </table>        
        </div>
        <div class="ReportFooter">
            <div class="footSegments">
                <button id="addSalesRec"><i class="fa fa-add"></i> Add Invoice</button>
            </div>
            <div class="footSegments">
                <span id="salesLstCounter" class="recCounter"></span>
                <button id="printList"><i class="fa fa-file-excel"></i> Excel</button>
                <button id="salesFilter"><i class="fa fa-filter"></i> Filter List</button>
            </div>
        </div>
    </div>
`

const divSaleForm = `
    <div id="SaleForm" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Sales Record Form</span>
            <button id="closeSalesDtl" class="closeForm">✖</button>
        </div>
       <div id="salesInvoice" class="DetailsForm"></div>
        <div class="btnDiv">
            <button type="submit" id="saveSalesRecBtn" class="saveBtn"><i class="fa fa-save"></i>  Save</button>
            <button type="button" id="cancelSalesRecBtn" class="cancelBtn"><i class="fa fa-close"></i>  Close</button>
        </div>
        <div class="ReportFooter">
            <div class="footSegments">
                <button id="addSalesDtl"><i class="fa fa-add"></i> Add Item</button>
                <input type="text" id="SalesRec_ScanCode" class="ScanCode" placeholder="Scan or Type Code to add" spellcheck="false" autocomplete="off">
            </div>
            <div class="footSegments">
                <button id="uploadItemsBtn"><i class="fa fa-download"></i> Download</button>
                <button id="salesItemsBtn" style="display: none"><i class="fa fa-shopping-cart"></i> Sale Items</button>
                <button id="paymentsBtn"><i class="fa fa-coins"></i> Payments</button>
            </div>
            <div class="footSegments">
                <span id="salesDtlCounter" class="recCounter"></span>
                <button id="printSalesInvoice"><i class="fa fa-print"></i> Print Invoice</button>
            </div>
        </div>
    </div>

`
const fragment = document.createDocumentFragment();

const div1 = document.createElement('div');
div1.innerHTML = divSalesLst;
fragment.appendChild(div1);

const div2 = document.createElement('div');
div2.innerHTML = divSaleForm;
fragment.appendChild(div2);

document.body.appendChild(fragment);  // Only one reflow happens here


let globalData = [];    // Define a global array
let itemsDtl = [];      // RecordSet of SALESDTL
let currentRec = [];    // Current selected SALESREC record
let currentIndex = 0    // Index of the selected SALESREC record

// values wil be determined as user enters UsersCde and validateField()
let cItemCode=null  
let nLandCost=0

async function SalesLst(dDateFrom, dDateTo__, cLocation, cReferDoc) {

    const salesLstCounter=document.getElementById('salesLstCounter')
    document.getElementById('loadingIndicator').style.display = 'flex';

    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/sales/SalesRecLst');
        const params = new URLSearchParams();
        if (dDateFrom) params.append('DateFrom', dDateFrom); 
        if (dDateTo__) params.append('DateTo__', dDateTo__); 
        if (cLocation) params.append('Location', cLocation);
        if (cReferDoc) params.append('ReferDoc', cReferDoc);

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
                    <th>Qty.</th>
                    <th>Amount</th>
                    <th>Items</th>
                    <th>Remarks</th>
                    <th>Customer</th>
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
                        <td style="text-align: center">${item.TotalQty.toFixed(0) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(item.Amount__) || 'N/A'}</td>
                        <td style="text-align: center">${item.NoOfItem.toFixed(0) || 'N/A'}</td>
                        <td class="colNoWrap">${item.Remarks_ || 'N/A'}</td>
                        <td class="colNoWrap">${item.CustName || 'N/A'}</td>
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
            // Remove 'selected' class from all rows
            // const rows = document.querySelectorAll('#ListSalesTable tbody tr');
            // rows.forEach(r => r.classList.remove('selected'));
            // Add 'selected' class to the clicked row
            // row.classList.add('selected');

            highlightRow(row, '#ListSalesTable');
            // Optionally, call your edit function if needed
            const index = parseInt(row.getAttribute('data-index'));
            currentIndex = index
            if (!isNaN(index) && index >= 0 && index < globalData.length) {
                // console.log(`Row clicked for index: ${index}`);
                SaleForm(index, true); // Pass only the index to your form
            }
        }
    });

}

async function SaleForm(index,editMode) {

    document.getElementById("addSalesDtl").disabled = !editMode;
    document.getElementById("SalesRec_ScanCode").disabled = !editMode;

    const reportBody = document.getElementById('salesInvoice');
    reportBody.innerHTML =''

    const salesDtlCounter=document.getElementById('salesDtlCounter')
    const itemData = globalData[index];
    currentRec = globalData[index];

    reportBody.innerHTML = `
        <div id="invoiceForm" class="invoice">
            <div id="inputSale1" class="textDiv">
                <div>
                    <label for="SalesRec_Location">Location</label>
                    <select id="SalesRec_Location"></select>
                </div>
                <div>
                    <label for="SalesRec_DateFrom">Date:</label>
                    <input type="date" id="SalesRec_DateFrom">
                </div>
                <div>
                    <label for="SalesRec_ReferDoc">Ref. No</label>
                    <input type="text" id="SalesRec_ReferDoc" spellcheck="false" readonly>
                </div>
            </div>
            <div id="inputSale2" class="textDiv">
                <div>
                    <label for="SalesRec_CustName">Customer</label>
                    <input type="text" id="SalesRec_CustName" spellcheck="false">
                </div>
                <div>
                    <label for="SalesRec_Remarks_">Remarks</label>
                    <input type="text" id="SalesRec_Remarks_" spellcheck="false">
                </div>
                <div id="chkDiv">
                    <input type="checkbox" id="SalesRec_Disabled" >
                    <label for="SalesRec_Disabled">Disabled</label>
                </div>
            </div>
        </div>

        <div class="itemsTableDiv" id="itemsTableDiv";>
            <table class="SalesDtlTable">
                <thead id="ListItemHead">
                    <tr>
                        <th>Stock No.</th>
                        <th>Bar Code</th>
                        <th>Item Description</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Gross</th>
                        <th>Discount</th>
                        <th>Net</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="ListSaleItem"></tbody>
            </table>
        </div>  
        
        <div class="paymentTableDiv" id="paymentTableDiv";>
            <table class="SalesDtlTable">
                <thead id="ListPaymentHead">
                    <tr>
                        <th>Payment Mode</th>
                        <th>Amount Paid</th>
                        <th>Account Name</th>
                        <th>Account No.</th>
                        <th>Authorization</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="ListPaymItem"></tbody>
            </table>
        </div>  
    `    
    // <div style="display: flex; width: 40%; height: 100%; background-color: blue; overflow: hidden;">
    //     <div style="position: fixed; display: flex; flex-direction: column; flex-wrap: wrap; padding: 10px; background-color: red; ">
    //         <button>Button 1</button>
    //         <button>Button 1</button>
    //         <button>Button 1</button>
    //         <button>Button 1</button>
    //     </div>
    // </div>

    document.getElementById('SalesLst').classList.remove('active')
    showReport('SaleForm')
    document.getElementById('salesItemsBtn').click()

    await populateLocation('', '','SellArea', 'SalesRec_Location');

    if (editMode) {
        document.getElementById('loadingIndicator').style.display = 'flex';

        const cCtrlNum_=itemData.CtrlNum_
        document.getElementById('SalesRec_ReferDoc').value=itemData.ReferDoc
        document.getElementById('SalesRec_DateFrom').value=formatDate(itemData.DateFrom,'YYYY-MM-DD')
        document.getElementById('SalesRec_Remarks_').value=itemData.Remarks_
        document.getElementById('SalesRec_CustName').value=itemData.CustName
        document.getElementById('SalesRec_Disabled').checked=itemData.Disabled ? true : false


        const locationSelect = document.getElementById('SalesRec_Location');
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

            updateItemTable();  // Render items using <tr>

    
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            document.getElementById('loadingIndicator').style.display = 'none';
        }
    } else {
        // Triggered from +Add button Footer
        const dNew_Date= new Date()
        document.getElementById('SalesRec_DateFrom').value=formatDate(dNew_Date,'YYYY-MM-DD')
        document.getElementById('SalesRec_ReferDoc').value='New Record'
        document.getElementById('SalesRec_Remarks_').value=''
        itemsDtl = []; 
        updateItemTable();
        
    }
}


document.getElementById('salesItemsBtn').addEventListener('click', () => {
    document.getElementById('paymentTableDiv').style.display = "none";
    document.getElementById('itemsTableDiv').style.display = "flex";

    document.getElementById('paymentsBtn').style.display = "block";
    document.getElementById('salesItemsBtn').style.display = "none";
    document.getElementById('uploadItemsBtn').style.display = "block";

    document.getElementById('SalesRec_ScanCode').style.display = "block";
    document.getElementById('salesDtlCounter').style.display = "block";
    document.getElementById('addSalesDtl').innerHTML=`<i class="fa fa-add"></i> Add Item`;
})
document.getElementById('paymentsBtn').addEventListener('click', () => {
    document.getElementById('paymentTableDiv').style.display ="flex";
    document.getElementById('itemsTableDiv').style.display ="none" ;  

    document.getElementById('paymentsBtn').style.display = "none";
    document.getElementById('salesItemsBtn').style.display = "block";
    document.getElementById('uploadItemsBtn').style.display = "none";

    document.getElementById('SalesRec_ScanCode').style.display = "none";
    document.getElementById('salesDtlCounter').style.display = "none";
    document.getElementById('addSalesDtl').innerHTML=`<i class="fa fa-add"></i> Add Payment`;
})


document.getElementById('saveSalesRecBtn').addEventListener('click', () => {
    const salesDtlCounter=document.getElementById('salesDtlCounter').innerText
    const cLocation=document.getElementById('SalesRec_Location').value
    const cRemarks_=document.getElementById('SalesRec_Remarks_').value
    const dDateFrom=document.getElementById('SalesRec_DateFrom').value
    const cCustName=document.getElementById('SalesRec_CustName').value
    const lDisabled=document.getElementById('SalesRec_Disabled').checked ? 1 : 0 

    if (!cLocation) {
        document.getElementById('SalesRec_Location').focus();
        document.getElementById('SalesRec_Location').classList.add('invalid');  // Add a class to highlight
        return ;
    }

    if (salesDtlCounter) {

        editSalesRec(currentRec.CtrlNum_, cLocation, dDateFrom, cRemarks_, cCustName, lDisabled)

    } else {
        const cCtrlNum_='NEW_CTRLID'
        const cEncoder_='Willie'
        const cSuffixId='E'
        const dLog_Date=new Date()
        const nNoOfItem=0
        
        if (addSalesRec(cCtrlNum_, cLocation, dDateFrom, cRemarks_, cEncoder_,
            dLog_Date, nNoOfItem, cCustName, cSuffixId)) {
            // showReport('SalesLst')  //Show back SalesRec List
            document.getElementById("addSalesDtl").disabled = false;
            document.getElementById("SalesRec_ScanCode").disabled = false;
    
        }
    }
});


document.getElementById('cancelSalesRecBtn').addEventListener('click', () => {
    showReport('SalesLst')  
});

async function editSalesRec(cCtrlNum_, cLocation, dDateFrom, cRemarks_, cCustName, lDisabled) {
    // console.log(cCtrlNum_, cLocation, dDateFrom, cRemarks_, cCustName)
    lDisabled = document.getElementById("SalesRec_Disabled").checked ? '1' : '0';

    try {
        const response = await fetch('http://localhost:3000/sales/editSalesHeader', {
            method: 'PUT',  
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cCtrlNum_: cCtrlNum_,
                cLocation: cLocation, 
                dDateFrom: dDateFrom,
                cRemarks_: cRemarks_,
                cCustName: cCustName,
                lDisabled: lDisabled
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();
        if (updatedItem) {
            showNotification('SalesRec record edited successfully!')
            globalData[currentIndex]=updatedItem;
            // console.log(globalData[currentIndex])
            updateTable();         
        }

        
    } catch (error) {
        console.error('Update SalesRec error:', error);
    }
}


async function addSalesRec(cCtrlNum_, cLocation, dDateFrom, cRemarks_, cEncoder_,
    dLog_Date, nNoOfItem, cCustName, cSuffixId) {

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
                cCustName: cCustName,
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
            // console.log(updatedItem)
            currentRec=updatedItem
            document.getElementById("SalesRec_ReferDoc").value = updatedItem.ReferDoc


            // Scroll to the last row after updating the table
            const tableBody = document.getElementById('ListSalesBody'); 
            const lastRow = tableBody.lastElementChild; // Get the last row
            setTimeout(() => {
                // const tableBody = document.getElementById('ListSalesBody'); 
                if (tableBody) {
                    // const lastRow = tableBody.lastElementChild; // Get the last row
                    if (lastRow) {
                        lastRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
                        // 🔹 Simulate a hover effect
                        lastRow.classList.add('hover-effect'); 
                        // 🔹 Remove hover effect after 2 seconds
                        setTimeout(() => lastRow.classList.remove('hover-effect'), 2000);                        
                    }
                }
            }, 100); // Small delay to ensure table updates first

            highlightRow(lastRow, 'ListSalesBody');

        }

        
    } catch (error) {
        console.error('Update SalesRec error:', error);
    }
}

function updateItemTable(refreshOnly=false) {
    let nTotalQty = 0;
    let nTotalPrc = 0;
    let nTotalDsc = 0;
    let nTotalAmt = 0;

    const ListSaleItem=document.getElementById('ListSaleItem')
    // Map through itemsDtl and build rows while accumulating totals
    const listTable = itemsDtl.map((item, index) => {
        // Accumulate totals inside the map
        nTotalQty += item.Quantity || 0;
        nTotalPrc += item.Quantity * item.ItemPrce || 0;
        nTotalDsc += (item.Quantity * (item.ItemPrce - item.Amount__)) || 0;
        nTotalAmt += item.Quantity * item.Amount__ || 0;
        return `
            <tr data-index="${index}" style="${item.Quantity < 0 ? 'color: red;' : ''}">
                <td class="colNoWrap">${item.UsersCde || 'N/A'}</td>
                <td class="colNoWrap">${item.OtherCde || 'N/A'}</td>
                <td class="colNoWrap">${item.Descript.substring(0,30) || 'N/A'}</td>
                <td style="text-align: center">${item.Quantity.toFixed(0) || 'N/A'}</td>
                <td style="text-align: right">${formatter.format(item.ItemPrce) || 'N/A'}</td>
                <td style="text-align: right">${formatter.format(item.Quantity * item.ItemPrce) || 'N/A'}</td>
                <td style="text-align: right">${formatter.format((item.Quantity * item.ItemPrce) - (item.Quantity * item.Amount__)) || 'N/A'}</td>
                <td style="text-align: right">${formatter.format(item.Quantity * item.Amount__) || 'N/A'}</td>
                <td class="action-icons">
                    <span class="spanDelItem colEditItem" data-index="${index}">
                        <i class="fa fa-trash"></i>
                    </span>
                </td>
            </tr>
        `;
    }).join(''); // Join all rows into a single string

    const listFooter=`
            <tfoot id="ListItemFoot">
                <tr style="font-weight: bold;">
                    <td></td>
                    <td></td>
                    <td style="text-align: right">Totals: </td>
                    <td style="text-align: center">${nTotalQty.toFixed(0) || 'N/A'}</td>
                    <td></td>
                    <td style="text-align: right">${formatter.format(nTotalPrc) || 'N/A'}</td>
                    <td style="text-align: right">${formatter.format(nTotalDsc) || 'N/A'}</td>
                    <td style="text-align: right">${formatter.format(nTotalAmt) || 'N/A'}</td>
                </tr>
            </tfoot>
`

    ListSaleItem.innerHTML = listTable+listFooter; // Update the tbody with new rows

    document.getElementById('ListSaleItem').addEventListener('click', async (event) => {
        const delBtn = event.target.closest('.spanDelItem'); // Find the clicked delete button
        if (delBtn) {
            const row = event.target.closest('tr');
            const index = parseInt(delBtn.getAttribute('data-index')); // Get index

            // check if SALESREC transaction is already Printed_
            if (globalData[currentIndex].Printed_) {
                alert('This transaction has been printed already.')
                return
            }

            if (!isNaN(index) && index >= 0 && index < itemsDtl.length) {
                if (refreshOnly) return;

                const confirmed = confirm(`Do you want to delete ${itemsDtl[index].Descript.trim()}?`)
                if (confirmed) {
                    const deleted_ = await deleteSalesDtl(itemsDtl[index].RecordId,globalData[currentIndex].CtrlNum_,index)
                    if (deleted_) {
                        // Remove the row from the DOM
                        row.remove(); // This will remove the <tr> element from the table
                    }
                }
            }
            event.stopPropagation(); // This stops the event from propagating to the parent (row click handler)
        } else {
            // If not a delete button, handle the row click
            const row = event.target.closest('tr');
            if (row) {
                // const rows = document.querySelectorAll('.SalesDtlTable tbody tr');
                // rows.forEach(r => r.classList.remove('selected'));
                // // Add 'selected' class to the clicked row
                // row.classList.add('selected');

                highlightRow(row, '.SalesDtlTable');
    
                // Optionally, call your edit function if needed
                const index = parseInt(row.getAttribute('data-index'));
                if (!isNaN(index) && index >= 0 && index < globalData.length) {
                    if (refreshOnly) return;
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
            const cReferDoc = filterData[10];

            SalesLst(dDateFrom,dDate__To,cLocation,cReferDoc) //Calling Main SalesRec List
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
    }
});

function SalesDtl(index,editMode) {
    const itemsDtlForm = document.createElement('form');
    itemsDtlForm.id = "sale-form";
    itemsDtlForm.classList.add('item-form');
    itemsDtlForm.style.display = "none";  // Start with it hidden

    const itemData = itemsDtl[index];
    itemsDtlForm.innerHTML = `
        <div id="titleBar">Sales Detail Form</div>
        <div class="inputSection">
            <br>
            <div class="subTextDiv" id="inputDetails">
                <div class="textDiv">
                    <div class="subTextDiv">
                        <label for="SalesRec_UsersCde">Stock No</label>
                        <input type="text" id="SalesRec_UsersCde" name="UsersCde" spellcheck="false" 
                            placeholder="Type Stock No. or Bar Code here to search"
                            autocomplete = "off">
                    </div>
                    <div class="subTextDiv">
                        <label for="SalesRec_OtherCde">Bar Code</label>
                        <input type="text" id="SalesRec_OtherCde" name="OtherCde" spellcheck="false" readonly>
                    </div>
                </div>

                <div id="inputDescript" class="textDiv">
                    <div class="subTextDiv" style="width:100%;">
                        <label for="SalesRec_Descript">Item Description</label>
                        <input type="text" id="SalesRec_Descript" name="Descript" readonly>
                    </div>
                </div>
                <div class="textDiv">
                    <div class="subTextDiv">
                        <label for="SalesRec_Quantity">Quantity</label>
                        <input type="number" id="SalesRec_Quantity" name="Quantity">
                    </div>
                    <div class="subTextDiv">
                        <label for="SalesRec_ItemPrce">Unit Item Price</label>
                        <input type="number" id="SalesRec_ItemPrce" name="ItemPrce">
                    </div>
                    <div class="subTextDiv">
                        <label for="SalesRec_DiscRate">Less %</label>
                        <input type="number" id="SalesRec_DiscRate" name="DiscRate">
                    </div>
                    <div class="subTextDiv">
                        <label for="SalesRec_Amount__">Net Amount</label>
                        <input type="number" id="SalesRec_Amount__" name="Amount__">
                    </div>
                </div>
            </div>
            
            <div class="btnDiv">
                <button type="submit" id="saveSalesDtlBtn" class="saveBtn"><i class="fa fa-save"></i>  Save</button>
                <button type="button" id="cancelSalesDtlBtn" class="cancelBtn"><i class="fa fa-close"></i>  Close</button>
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
        document.getElementById('SalesRec_UsersCde').value=itemData.UsersCde
        document.getElementById('SalesRec_OtherCde').value=itemData.OtherCde
        document.getElementById('SalesRec_Descript').value=itemData.Descript
        document.getElementById('SalesRec_Quantity').value=itemData.Quantity
        document.getElementById('SalesRec_ItemPrce').value=itemData.ItemPrce
        document.getElementById('SalesRec_DiscRate').value=itemData.DiscRate
        document.getElementById('SalesRec_Amount__').value=itemData.Amount__
        document.getElementById('SalesRec_Quantity').focus()
    } else {
        document.getElementById('SalesRec_UsersCde').value=''
        document.getElementById('SalesRec_OtherCde').value=''
        document.getElementById('SalesRec_Descript').value=''
        document.getElementById('SalesRec_Quantity').value=1
        document.getElementById('SalesRec_ItemPrce').value=0.00
        document.getElementById('SalesRec_DiscRate').value=0.00
        document.getElementById('SalesRec_Amount__').value=0.00
        document.getElementById('SalesRec_UsersCde').focus()

    }
    document.getElementById('SalesRec_Amount__').readonly = true;
    document.getElementById('SalesRec_OtherCde').readonly = true;
    document.getElementById('SalesRec_Descript').readonly = true;
    document.getElementById('SalesRec_Amount__').setAttribute('tabindex', '-1');
    document.getElementById('SalesRec_OtherCde').setAttribute('tabindex', '-1');
    document.getElementById('SalesRec_Descript').setAttribute('tabindex', '-1');

    // Get the id's of the elements for checkEmptyValue() function before saving
    const UsersCde=document.getElementById('SalesRec_UsersCde')

    const Quantity=document.getElementById('SalesRec_Quantity')
    const ItemPrce=document.getElementById('SalesRec_ItemPrce')
    const Amount__=document.getElementById('SalesRec_Amount__')
    const DiscRate=document.getElementById('SalesRec_DiscRate')

    document.getElementById('SalesRec_UsersCde').addEventListener('input', debounce(async () => {
        const otherDetails = { 
            cItemCode: '',
            nLandCost: 0
        }

        await chkUsersCde(editMode, 'SalesRec', otherDetails)        
        cItemCode=otherDetails.cItemCode
        nLandCost=otherDetails.nLandCost
    }, 300));  // 300ms delay (you can adjust the delay as needed)
    
    document.getElementById('SalesRec_DiscRate').addEventListener('blur', async (e) => {
        e.preventDefault()
        if (ItemPrce.value===0) {
            ItemPrce.focus()
            return
        }
        const nNetValue=ItemPrce.value
        Amount__.value=nNetValue-(nNetValue*DiscRate.value/100)
    })

    document.getElementById('saveSalesDtlBtn').addEventListener('click', async (e) => {
        e.preventDefault()
    
        if (!checkEmptyValue(UsersCde,Quantity,ItemPrce,Amount__)) {
            return;  // If any field is empty, stop here and do not proceed
        }
        if (editMode) {
            cItemCode = cItemCode == null ? itemData.ItemCode : cItemCode;
            nLandCost = nLandCost == null ? itemData.LandCost : nLandCost;
        }
        if (cItemCode==null) {
            document.getElementById('modal-overlay').style.display='none';
            MessageBox('Invalid record.\n Stock No. is not found.', 'Ok,Close', 'Alert Message')
                .then((buttonIndex) => {
                if (buttonIndex === 0) {  // If 'Ok' is clicked
                    UsersCde.focus()
                } else if (buttonIndex === 1) {
                    document.getElementById('modal-overlay').remove();
                    document.getElementById('sale-form').remove();  // Close the form
                }
            })
            return;        
        }

        const cCtrlNum_=currentRec.CtrlNum_
        if (editMode) {
                editSalesDtl(index,cCtrlNum_,itemData.RecordId,cItemCode,nLandCost)
        } else {
            const dDate____=currentRec.DateFrom
            const cTimeSale=get24HrTime()
            const nQuantity=document.getElementById('SalesRec_Quantity').value
            const nItemPrce=document.getElementById('SalesRec_ItemPrce').value
            const nDiscRate=document.getElementById('SalesRec_DiscRate').value
            const nAmount__=document.getElementById('SalesRec_Amount__').value
            const cSuffixId='ES'

            addSalesDtl(cCtrlNum_,cItemCode,dDate____,cTimeSale,nQuantity,nItemPrce,nDiscRate,nAmount__,nLandCost,cSuffixId)
        }
        document.getElementById('sale-form').remove()
        document.getElementById('modal-overlay').remove();
    })

    document.getElementById('cancelSalesDtlBtn').addEventListener('click', () => {
        document.getElementById('sale-form').remove()
        document.getElementById('modal-overlay').remove();
    })
}

async function editSalesDtl(index,cCtrlNum_,cRecordId,cItemCode,nLandCost) {
    document.getElementById('loadingIndicator').style.display = 'flex';

    const nQuantity=document.getElementById('SalesRec_Quantity').value
    const nItemPrce=document.getElementById('SalesRec_ItemPrce').value
    const nDiscRate=document.getElementById('SalesRec_DiscRate').value
    const nAmount__=document.getElementById('SalesRec_Amount__').value

    // console.log([cRecordId,cItemCode,nQuantity,nItemPrce,nDiscRate,nAmount__,nLandCost])

    try {
        const response = await fetch('http://localhost:3000/sales/editSalesDetail', {
            method: 'PUT',  
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cRecordId: cRecordId,
                cItemCode: cItemCode,
                nQuantity: nQuantity,
                nItemPrce: nItemPrce,
                nDiscRate: nDiscRate,
                nAmount__: nAmount__,
                nLandCost: nLandCost
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();

        if (updatedItem) {
            itemsDtl[index]=updatedItem;
            updateItemTable(true)
            showNotification('Sales Item record updated successfully!')
            // console.log(updatedItem)
            updateSalesTotals(cCtrlNum_) // Update SALESREC Header
        }

    } catch (error) {
        console.error("Error processing editSalesDetail:", error);
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

// exported to Functlib for addScanCode() function
export async function addSalesDtl(cCtrlNum_,cItemCode,dDate____,cTimeSale,
        nQuantity,nItemPrce,nDiscRate,nAmount__,nLandCost,cSuffixId) {
    document.getElementById('loadingIndicator').style.display = 'flex';
    
    try {
        const response = await fetch('http://localhost:3000/sales/addSalesDetail', {
            method: 'POST',  
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cCtrlNum_: cCtrlNum_,
                cItemCode: cItemCode,
                dDate____: dDate____,
                cTimeSale: cTimeSale,
                nQuantity: nQuantity,
                nItemPrce: nItemPrce,
                nDiscRate: nDiscRate,
                nAmount__: nAmount__,
                nLandCost: nLandCost,
                cSuffixId: cSuffixId
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();

        if (updatedItem) {
            itemsDtl.push(updatedItem);
            updateItemTable(true)
            showNotification('Sales Item record added successfully!')

            updateSalesTotals(updatedItem.CtrlNum_) // Update SALESREC Header

            setTimeout(() => {
                const tableBody = document.getElementById('ListSaleItem'); 
                if (tableBody) {
                    const rows = tableBody.getElementsByTagName('tr'); // Get all <tr> in tbody
                    if (rows.length > 0) {
                        if (rows.length > 0) {
                            const lastRow = rows[rows.length - 2]; // Get the last <tr> inside tbody
                            if (lastRow) {
                                lastRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
                                // 🔹 Simulate a hover effect
                                lastRow.classList.add('hover-effect'); 
                                // 🔹 Remove hover effect after 2 seconds
                                setTimeout(() => lastRow.classList.remove('hover-effect'), 2000); 
                                lastRow.classList.add('selected');                       
                            }
                            highlightRow(lastRow, 'ListSalesItem');
                        }
                    }
                }
            }, 100); // Small delay to ensure table updates first

        }

    } catch (error) {
        console.error("Error processing addSalesDetail:", error);
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

async function updateSalesTotals(cCtrlNum_) {
    const headerTotals=[
        calcTotalQty(),
        calcTotalPrc(),
        calcTotalAmt(),
        calcTotalCnt()
    ]
    const res = await fetch('http://localhost:3000/sales/updateSalesTotals', {
        method: 'PUT',  
        headers: {
            'Content-Type': 'application/json'  // Specify JSON format
        },
        body: JSON.stringify({
            cCtrlNum_: cCtrlNum_,
            nTotalQty: headerTotals[0],
            nTotalPrc: headerTotals[1],
            nTotalAmt: headerTotals[2],
            nNoOfItem: headerTotals[3]
        })
    });

    const editTotals = await res.json()
    globalData[currentIndex] = editTotals
    updateTable()
    
    function calcTotalQty() {
        return itemsDtl.reduce((total, item) => total + parseInt(item.Quantity, 10), 0);
    }
    function calcTotalPrc() {
        return itemsDtl.reduce((total, item) => total + parseFloat(item.Quantity*item.ItemPrce), 0).toFixed(2);
    }
    function calcTotalAmt() {
        return itemsDtl.reduce((total, item) => total + parseFloat(item.Quantity*item.Amount__), 0).toFixed(2);
    }            
    function calcTotalCnt() {
        return itemsDtl.length
    }            

}


document.addEventListener('DOMContentLoaded', () => {
    // const liSalesLstMenu = document.querySelectorAll('.SalesInvoice');
    const liSalesLstMenu = document.getElementById('SalesInvoice');
    const salesLstFileDiv = document.getElementById('SalesLst');
    const saleFormFileDiv = document.getElementById('SaleForm');
    const closeSalesRec = document.getElementById('closeSalesRec');
    const closeSalesDtl = document.getElementById('closeSalesDtl');
    const addSalesRec = document.getElementById('addSalesRec'); //Footer Add button
    const addSalesDtl = document.getElementById('addSalesDtl');

    addSalesRec.addEventListener('click', () => {
        document.getElementById('salesDtlCounter').innerText=''
        SaleForm();
    });
    addSalesDtl.addEventListener('click', () => {
        const addCaption = document.getElementById('addSalesDtl').innerText
        if (addCaption === ' Add Item') {
            SalesDtl();
        } else {
            alert('Add Payment?')
        }
    });

    closeSalesRec.addEventListener('click', () => {
        salesLstFileDiv.classList.remove('active');
    });
    closeSalesDtl.addEventListener('click', () => {
        saleFormFileDiv.classList.remove('active');
        showReport('SalesLst')
    });

    // Add event listener to each element with the necessary arguments
    // liSalesLstMenu.forEach(element => {
    //     element.addEventListener('click', () => {
    //         showReport('SalesLst')
    //     });
    // });
    liSalesLstMenu.addEventListener('click', () => {
        showReport('SalesLst')
    })

});

async function deleteSalesDtl(cRecordId,cCtrlNum_,index) {
    console.log('cRecordId',cRecordId,'cCtrlNum_',cCtrlNum_)
    const salesDtlCounter=document.getElementById('salesDtlCounter')
    try {
        const response = await fetch(`http://localhost:3000/sales/deleteSalesDetail/${encodeURIComponent(cRecordId)}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
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
        showNotification('SalesDtl deleted successfully');
        // Remove the item from the itemsDtl array
        itemsDtl.splice(index, 1);
        updateItemTable(true)
        salesDtlCounter.innerHTML=`${itemsDtl.length} Records`
        updateSalesTotals(cCtrlNum_) // Update SALESREC Header        
        return true;
    } catch (error) {
        console.error('Delete SalesDtl error:', error);
        alert('An error occurred while trying to delete the record.');
        return false;
    }
}

document.getElementById('printSalesInvoice').addEventListener('click', async () => {
    const headerData = [
        `Ref. No. : ${currentRec.ReferDoc}`,
        `Location : ${currentRec.LocaName.trim()}`,
        `OR Date  : ${formatDate(currentRec.DateFrom,'MM/DD/YYYY')}`,
        `Customer : ${currentRec.CustName.trim()}`,
        `Remarks  : ${currentRec.Remarks_.trim()}`
    ];
    const colWidths = [20, 28, 60, 10, 16, 20, 20, 20]; // Adjust widths as needed
    const columns = ['Stock No.', 'Bar Code', 'Item Description', 'Qty', 'Unit Price', 'Gross', 'Discount', 'Net'];
    const itemFields = [
        'UsersCde',  // Field from item
        'OtherCde',  // Field from item
        'Descript',  // Field from item
        'Quantity',  // Field from item
        'ItemPrce',  // Field from item
        // Calculated fields
        (item, formatter) => formatter.format(item.Quantity * item.ItemPrce),  // Gross (calculated)
        (item, formatter) => formatter.format(item.Quantity * (item.ItemPrce - item.Amount__)),  // Discount (calculated)
        (item, formatter) => formatter.format(item.Quantity * item.Amount__)  // Net (calculated)
    ];    
    const fieldTypes = [
        'string',      // UsersCde (string)
        'string',      // OtherCde (string)
        'string',      // Descript (string)
        'integer',      // Quantity (numeric)
        'number',      // ItemPrce (numeric)
        'calculated',  // Gross (calculated field)
        'calculated',  // Discount (calculated field)
        'calculated'   // Net (calculated field)
    ];        
    
    // columns to create totals based on itemFields array
    const createTotals = [false,false,false,true,false,true,true,true]

    printFormPDF(headerData, itemsDtl, itemFields, createTotals ,colWidths, 
        columns, fieldTypes, window.base64Image, ['letter','portrait'], formatter, 'Sales Record')
});

document.getElementById('SalesRec_ScanCode').addEventListener('paste', async () =>{
    await addScanCode('SalesRec', currentRec);
})

// Event listener with debounce
document.getElementById('SalesRec_ScanCode').addEventListener('input', debounce(async () => {
    await addScanCode('SalesRec', currentRec);
}, 300));  



