import { showReport, formatDate, populateLocation, showNotification, get24HrTime, pickItem,
    MessageBox, formatter, checkEmptyValue, validateField, highlightRow, loadImageToBase64} from '../FunctLib.js';
import { FiltrRec } from "../FiltrRec.js"

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
    document.getElementById("ScanCode").disabled = !editMode;

    const reportBody = document.getElementById('salesInvoice');
    reportBody.innerHTML =''

    const salesDtlCounter=document.getElementById('salesDtlCounter')
    const itemData = globalData[index];
    currentRec = globalData[index];

    reportBody.innerHTML = `
        <div id="invoiceForm">
            <div id="inputSale1" class="textDiv">
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
            </div>
            <div id="inputSale2" class="textDiv">
                <div>
                    <label for="CustName">Customer</label>
                    <input type="text" id="CustName" spellcheck="false">
                </div>
                <div>
                    <label for="Remarks_">Remarks</label>
                    <input type="text" id="Remarks_" spellcheck="false">
                </div>
                <div id="chkDiv">
                    <input type="checkbox" id="Disabled" >
                    <label for="Disabled">Disabled</label>
                </div>
            </div>
        </div>
        <div class="itemsTableDiv" id="itemsTableDiv";>
            <table class="ListItemTable">
                <thead id="ListItemHead">
                    <tr>
                        <th>Qty</th>
                        <th>Stock No.</th>
                        <th>Bar Code</th>
                        <th>Item Description</th>
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
            <table class="ListItemTable">
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

    await populateLocation('', '','SellArea', 'SaleLoca');

    if (editMode) {
        document.getElementById('loadingIndicator').style.display = 'flex';

        const cCtrlNum_=itemData.CtrlNum_
        document.getElementById('ReferDoc').value=itemData.ReferDoc
        document.getElementById('DateFrom').value=formatDate(itemData.DateFrom,'YYYY-MM-DD')
        document.getElementById('Remarks_').value=itemData.Remarks_
        document.getElementById('CustName').value=itemData.CustName
        document.getElementById('Disabled').checked=itemData.Disabled ? true : false


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

            updateItemTable();  // Render items using <tr>

    
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


document.getElementById('salesItemsBtn').addEventListener('click', () => {
    document.getElementById('paymentTableDiv').style.display = "none";
    document.getElementById('itemsTableDiv').style.display = "flex";

    document.getElementById('paymentsBtn').style.display = "block";
    document.getElementById('salesItemsBtn').style.display = "none";
    document.getElementById('uploadItemsBtn').style.display = "block";

    document.getElementById('ScanCode').style.display = "block";
    document.getElementById('salesDtlCounter').style.display = "block";
    document.getElementById('addSalesDtl').innerHTML=`<i class="fa fa-add"></i> Add Item`;
})
document.getElementById('paymentsBtn').addEventListener('click', () => {
    document.getElementById('paymentTableDiv').style.display ="flex";
    document.getElementById('itemsTableDiv').style.display ="none" ;  

    document.getElementById('paymentsBtn').style.display = "none";
    document.getElementById('salesItemsBtn').style.display = "block";
    document.getElementById('uploadItemsBtn').style.display = "none";

    document.getElementById('ScanCode').style.display = "none";
    document.getElementById('salesDtlCounter').style.display = "none";
    document.getElementById('addSalesDtl').innerHTML=`<i class="fa fa-add"></i> Add Payment`;
})


document.getElementById('saveSalesRecBtn').addEventListener('click', () => {
    const salesDtlCounter=document.getElementById('salesDtlCounter').innerText
    const cLocation=document.getElementById('SaleLoca').value
    const cRemarks_=document.getElementById('Remarks_').value
    const dDateFrom=document.getElementById('DateFrom').value
    const cCustName=document.getElementById('CustName').value
    const lDisabled=document.getElementById('Disabled').checked ? 1 : 0 

    if (!cLocation) {
        document.getElementById('SaleLoca').focus();
        document.getElementById('SaleLoca').classList.add('invalid');  // Add a class to highlight
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
            document.getElementById("ScanCode").disabled = false;
    
        }
    }
});


document.getElementById('cancelSalesRecBtn').addEventListener('click', () => {
    showReport('SalesLst')  
});

async function editSalesRec(cCtrlNum_, cLocation, dDateFrom, cRemarks_, cCustName, lDisabled) {
    // console.log(cCtrlNum_, cLocation, dDateFrom, cRemarks_, cCustName)
    lDisabled = document.getElementById("Disabled").checked ? '1' : '0';

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
            document.getElementById("ReferDoc").value = updatedItem.ReferDoc


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
                <td style="text-align: center">${item.Quantity.toFixed(0) || 'N/A'}</td>
                <td class="colNoWrap">${item.UsersCde || 'N/A'}</td>
                <td class="colNoWrap">${item.OtherCde || 'N/A'}</td>
                <td class="colNoWrap">${item.Descript.substring(0,30) || 'N/A'}</td>
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
                    <td style="text-align: center">${nTotalQty.toFixed(0) || 'N/A'}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td style="text-align: right">Totals: </td>
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
                // const rows = document.querySelectorAll('.ListItemTable tbody tr');
                // rows.forEach(r => r.classList.remove('selected'));
                // // Add 'selected' class to the clicked row
                // row.classList.add('selected');

                highlightRow(row, '.ListItemTable');
    
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
                        <input type="text" id="UsersCde" name="UsersCde" spellcheck="false" 
                            placeholder="Type Stock No. or Bar Code here to search"
                            autocomplete = "off">
                    </div>
                    <div class="subTextDiv">
                        <label for="OtherCde">Bar Code</label>
                        <input type="text" id="OtherCde" name="OtherCde" spellcheck="false" readonly>
                    </div>
                </div>

                <div id="inputDescript" class="textDiv">
                    <div class="subTextDiv" style="width:100%;">
                        <label for="Descript">Item Description</label>
                        <input type="text" id="Descript" name="Descript" readonly>
                    </div>
                </div>
                <div class="textDiv">
                    <div class="subTextDiv">
                        <label for="Quantity">Quantity</label>
                        <input type="number" id="Quantity" name="Quantity">
                    </div>
                    <div class="subTextDiv">
                        <label for="ItemPrce">Unit Item Price</label>
                        <input type="number" id="ItemPrce" name="ItemPrce">
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
        document.getElementById('UsersCde').value=itemData.UsersCde
        document.getElementById('OtherCde').value=itemData.OtherCde
        document.getElementById('Descript').value=itemData.Descript
        document.getElementById('Quantity').value=itemData.Quantity
        document.getElementById('ItemPrce').value=itemData.ItemPrce
        document.getElementById('DiscRate').value=itemData.DiscRate
        document.getElementById('Amount__').value=itemData.Amount__
        document.getElementById('Quantity').focus()
    } else {
        document.getElementById('UsersCde').value=''
        document.getElementById('OtherCde').value=''
        document.getElementById('Descript').value=''
        document.getElementById('Quantity').value=1
        document.getElementById('ItemPrce').value=0.00
        document.getElementById('DiscRate').value=0.00
        document.getElementById('Amount__').value=0.00
        document.getElementById('UsersCde').focus()

    }
    document.getElementById('Amount__').readonly = true;
    document.getElementById('OtherCde').readonly = true;
    document.getElementById('Descript').readonly = true;
    document.getElementById('Amount__').setAttribute('tabindex', '-1');
    document.getElementById('OtherCde').setAttribute('tabindex', '-1');
    document.getElementById('Descript').setAttribute('tabindex', '-1');

    // Get the id's of the elements for checkEmptyValue() function before saving
    const UsersCde=document.getElementById('UsersCde')

    const Quantity=document.getElementById('Quantity')
    const ItemPrce=document.getElementById('ItemPrce')
    const Amount__=document.getElementById('Amount__')
    const DiscRate=document.getElementById('DiscRate')
    
    // values wil be determined as user enters UsersCde and validateField()
    // let cItemCode=null  
    // let nLandCost=0

    // document.getElementById('UsersCde').addEventListener('blur', async (e) => {
    //     e.preventDefault();
    //     chkUsersCde(editMode)        
    // });
    document.getElementById('UsersCde').addEventListener('input', debounce(() => {
        chkUsersCde(editMode)        
    }, 300));  // 300ms delay (you can adjust the delay as needed)
    
    document.getElementById('DiscRate').addEventListener('blur', async (e) => {
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
                    document.getElementById('items-form').remove();  // Close the form
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
            const nQuantity=document.getElementById('Quantity').value
            const nItemPrce=document.getElementById('ItemPrce').value
            const nDiscRate=document.getElementById('DiscRate').value
            const nAmount__=document.getElementById('Amount__').value

            addSalesDtl(cCtrlNum_,cItemCode,dDate____,cTimeSale,nQuantity,nItemPrce,nDiscRate,nAmount__,nLandCost)
        }
        document.getElementById('items-form').remove()
        document.getElementById('modal-overlay').remove();
    })

    document.getElementById('cancelSalesDtlBtn').addEventListener('click', () => {
        document.getElementById('items-form').remove()
        document.getElementById('modal-overlay').remove();
    })
}

async function editSalesDtl(index,cCtrlNum_,cRecordId,cItemCode,nLandCost) {
    document.getElementById('loadingIndicator').style.display = 'flex';

    const nQuantity=document.getElementById('Quantity').value
    const nItemPrce=document.getElementById('ItemPrce').value
    const nDiscRate=document.getElementById('DiscRate').value
    const nAmount__=document.getElementById('Amount__').value

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


async function addSalesDtl(cCtrlNum_,cItemCode,dDate____,cTimeSale,
        nQuantity,nItemPrce,nDiscRate,nAmount__,nLandCost) {
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
                nLandCost: nLandCost
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
    const liSalesLstMenu = document.querySelectorAll('.SalesInvoice');
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
    liSalesLstMenu.forEach(element => {
        element.addEventListener('click', () => {
            showReport('SalesLst')
        });
    });

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

// const img = new Image();
// img.src = '/images/regent.png'; 
// let base64Image=null
// img.onload = function () {
//     // Create a canvas to convert the image to base64
//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d');

//     // Set canvas size to the image's size
//     canvas.width = img.width;
//     canvas.height = img.height;

//     // Draw the image onto the canvas
//     ctx.drawImage(img, 0, 0);

//     // Convert the canvas to base64 string
//     base64Image = canvas.toDataURL('image/png');

//     // if (base64Image && base64Image.startsWith('data:image/png;base64,')) {
//     //     console.log(base64Image)
//     // } else {
//     //     console.error('Failed to generate or invalid base64 image:');
//     // }

// };


document.getElementById('printSalesInvoice').addEventListener('click', async () => {
    const headerData = [
        `Ref. No. : ${currentRec.ReferDoc}`,
        `Location : ${currentRec.LocaName.trim()}`,
        `OR Date  : ${formatDate(currentRec.DateFrom,'MM/DD/YYYY')}`,
        `Customer : ${currentRec.CustName.trim()}`,
        `Remarks  : ${currentRec.Remarks_.trim()}`
    ];
    const colWidths = [10, 20, 28, 60, 16, 20, 20, 20]; // Adjust widths as needed
    const columns = ['Qty', 'Stock No.', 'Bar Code', 'Item Description', 'Unit Price', 'Gross', 'Discount', 'Net'];
    const itemFields = [
        'Quantity',  // Field from item
        'UsersCde',  // Field from item
        'OtherCde',  // Field from item
        'Descript',  // Field from item
        'ItemPrce',  // Field from item
        // Calculated fields
        (item, formatter) => formatter.format(item.Quantity * item.ItemPrce),  // Gross (calculated)
        (item, formatter) => formatter.format(item.Quantity * (item.ItemPrce - item.Amount__)),  // Discount (calculated)
        (item, formatter) => formatter.format(item.Quantity * item.Amount__)  // Net (calculated)
    ];    
    const fieldTypes = [
        'integer',      // Quantity (numeric)
        'string',      // UsersCde (string)
        'string',      // OtherCde (string)
        'string',      // Descript (string)
        'number',      // ItemPrce (numeric)
        'calculated',  // Gross (calculated field)
        'calculated',  // Discount (calculated field)
        'calculated'   // Net (calculated field)
    ];        

    printToPDF(headerData, itemsDtl, itemFields ,colWidths, 
        columns, fieldTypes, window.base64Image, ['letter','portrait'])
});

function printToPDF(headerData, detailData, itemFields, colWidths, 
    columnHeader, fieldTypes ,imgLogo, paperSetup) {
    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    // You can set format to 'letter', 'a4', or 'a3' and orientation to 'portrait' or 'landscape'
    const doc = new jsPDF({ unit: 'mm', format: paperSetup[0], orientation: paperSetup[1] }); 
    
    const pageMargin = 10; // Page margin (left, top, right, bottom)
    const lineHeight = 6; // Line height for content - ideal 8
    const startY = 20; // Start Y position for the content
    const pageWidth = doc.internal.pageSize.width;

    const reportFont='Helvetica'
    let currentY = startY;
    
    doc.setFont("helvetica", "normal");
    doc.setLineWidth(0.2); // line thickness

    // approx position for pageNum
    const pageHeight = doc.internal.pageSize.height; 
    let pageNum = 1

    // Render Table Header and Details
    doc.setFontSize(8);
    // const colWidths = [10, 20, 28, 60, 16, 20, 20, 20]; // Adjust widths as needed
    const itemLineHeight = 5; // Line height for items
    const tableHeaderHeight = 6; // Row height - Header height
    let bottomMargin = 23; // Preferred bottom margin
    
    // Total column widths based on colWidths array
    const totalColWidth = colWidths.reduce((sum, width) => sum + width, pageMargin);

    // Document Header
    showDocHeader(true)
    doc.addImage(imgLogo, 'BMP', pageMargin, startY - 10, 18, 18);

    let currentX = pageMargin; 
    showTableHeader()

    createVertLines(bottomMargin)

    detailData.forEach(item => {
        // bottomMargin = currentY + itemLineHeight >= rowsPerPage - pageMargin ? 10 : 23

        if (currentY + itemLineHeight > pageHeight - bottomMargin - pageMargin) {
            doc.setTextColor(0,0,0)
            // Horizontal bottom line for last row on page
            // doc.line(pageMargin, currentY, currentX, currentY); 
            showPageNum()

            // If we reach the bottom of the page, add a new page
            doc.addPage();
            currentY = startY;  // Reset 

            createVertLines(bottomMargin)

            showDocHeader()
            doc.addImage(imgLogo, 'BMP', pageMargin, startY - 10, 18, 18);

            pageNum++
            showPageNum()

            doc.setFont(reportFont, "bold");
            showTableHeader()
            doc.setFont(reportFont, "normal");

        }

        let itemRow = itemFields.map((field,index) => {
            // Handle dynamic formatting based on field type
            if (typeof field === 'function') {
                return field(item, formatter);  // Pass the item and formatter to the function
            }            
            const value = item[field];
            if (fieldTypes[index] === 'integer') {
                return value.toFixed(0);  
            }            
            if (typeof value === 'number') {
                return formatter.format(value); // Currency formatting for numeric fields
            } else if (typeof value === 'string' && value.length > 30) {
                return value.substring(0, 30); // Truncate long strings
            }
            return value; // Default handling
        });

        currentX = pageMargin; // Reset X for each row
        itemRow.forEach((text, i) => {
            // Color based on some condition (e.g., negative quantities)
            if (parseFloat(itemRow[i]) < 0) {
                doc.setTextColor(255, 0, 0); // Red text for negative numbers
            } else {
                doc.setTextColor(0, 0, 0)
            }

            // Default alignment
            let textX = currentX + 2;

            // Check the field type to determine alignment
            const fieldType = fieldTypes[i];
            if (fieldType === 'number' || fieldType === 'calculated' || fieldType === 'integer') {
                textX = currentX + colWidths[i] - 2; // Right-align if numeric
                doc.text(text, textX, currentY + 4, { align: 'right' });
            } else {
                // Otherwise, align text to the left
                doc.text(text, textX, currentY + 4, { align: 'left' });
            }

            currentX += colWidths[i]; // Move to the next column
        });        
        currentY += itemLineHeight; // Move to the next row
    });
    doc.setTextColor(0,0,0)


    // BOTTOM PAGE
    // Horizontal bottom line for last row on page
    doc.setLineDash([1, 2]); 
    doc.line(pageMargin, currentY, currentX, currentY); 

    doc.setFontSize(8);
    doc.setFont(reportFont, "bold");

    // Add totals at the bottom of the page
    const totals = {
        totalQty: itemsDtl.reduce((sum, item) => sum + item.Quantity, 0),
        totalPrice: itemsDtl.reduce((sum, item) => sum + item.Quantity * item.ItemPrce, 0),
        totalDiscount: itemsDtl.reduce((sum, item) => sum + item.Quantity * (item.ItemPrce - item.Amount__), 0),
        totalAmount: itemsDtl.reduce((sum, item) => sum + item.Quantity * item.Amount__, 0)
    };

    // Align TOTALS dynamically
    let totalX = pageMargin; // Start at left margin
    let columnTotal = 0
    colWidths.forEach((width, i) => {
        let textValue = '';
        if (i === 0) {
            // Total Quantity (aligned right)
            textValue = totals.totalQty.toFixed(0); // Total Quantity (no formatting)
            doc.text(textValue, totalX + width - 2, currentY + itemLineHeight, { align: 'right' });
        } else if (i === 4) {
            // No total for Unit Price (column 4), so skip
            totalX += width; // Skip column 4 and move X to the next column
            columnTotal = totalX
            return;        
        } else if ([5, 6, 7].includes(i)) {
            // Columns 5, 6, 7 should have totals and be aligned right
            const totalValues = [totals.totalPrice, totals.totalDiscount, totals.totalAmount];
            textValue = formatter.format(totalValues[i - 5]); // Adjusted for correct index mapping
            doc.text(textValue, totalX + width - 2, currentY + itemLineHeight, { align: 'right' });
        }

        totalX += width; // Move to the next column
    });

    doc.text('Totals:', columnTotal , currentY + itemLineHeight, { align: 'right' });

    // Draw a final line to separate totals
    // doc.line(pageMargin, currentY + itemLineHeight + 2, totalX, currentY + itemLineHeight + 2); 

    doc.setFont('Courier', "normal");
    doc.text('Encoded By:', pageMargin, pageHeight - 22);
    doc.text('Checked By:', pageMargin + 40, pageHeight - 22);
    doc.text('__________________ ', pageMargin, pageHeight - 14);
    doc.text('__________________ ', pageMargin + 40, pageHeight - 14);

    const cDate_Now = formatDate(new Date(), 'MM/DD/YYYY')
    doc.text('RunDate:', pageWidth-pageMargin-40, pageHeight - 22);
    doc.text(cDate_Now, pageWidth-pageMargin - doc.getTextWidth('RunDate: MM/DD/YYYY') + 8, pageHeight - 22);
    doc.text('RunTime:', pageWidth-pageMargin-40, pageHeight - 16);
    doc.text(get24HrTime('12'), pageWidth-pageMargin - doc.getTextWidth('RunTime: 12:00:00 AM') + 10 , pageHeight - 16);

    showPageNum()

    // Save or print the document
    // doc.save('Sales Invoice.pdf');

    // document.querySelector('.pdfReport').src = doc.output('datauristring');

    doc.output('dataurlnewwindow','Sales Invoice.pdf');


    function showTableHeader() {
        // const columns = ['Qty', 'Stock No.', 'Bar Code', 'Item Description', 'Unit Price', 'Gross', 'Discount', 'Net'];

        currentX = pageMargin; // **Reset

        // Draw the header row
        doc.setFillColor(200, 200, 200); // Gray background for headers
        // Full header width
        doc.rect(pageMargin, currentY, totalColWidth - pageMargin, tableHeaderHeight, "F"); 
        
        columnHeader.forEach((header, i) => {
            // **Draw full grid for header**
            doc.rect(currentX, currentY, colWidths[i], tableHeaderHeight); 
            doc.text(header, currentX + 2, currentY + 4);
            currentX += colWidths[i];
        });
        currentY += tableHeaderHeight;

    }

    function showPageNum() {
        doc.setFont('Courier', "normal");
        // currentY += lineHeight;
        // doc.text(`Page: ${pageNum} of ${totalNoOfPages}`, pageWidth -24- pageMargin, startY + 8)
        doc.text(`Page: ${pageNum}`, pageWidth -18- pageMargin, startY + 8)
    }

    function showDocHeader(firstPage=false) {

        doc.setFontSize(10);
        const cCompName = 'REGENT TRAVEL RETAIL GROUP';
        const cAddress_ = '35 JME Bldg. 3rd Flr Calbayog St., Mandaloyong City';
    
        doc.setFont(reportFont, "bold");
        doc.text(cCompName, (pageWidth - doc.getTextWidth(cCompName)) / 2, currentY);
        // doc.text(cCompName, 30, currentY);
        currentY += lineHeight;
        doc.text(cAddress_, (pageWidth - doc.getTextWidth(cAddress_)) / 2, currentY);
        // doc.text(cAddress_, 30, currentY);
    
        const centerPosi = (pageWidth / 2) + pageMargin //-20;
        const boxWidth = centerPosi - pageMargin;
        const padding = 14
        const headerHeight = lineHeight + 4; // Adjusted height for the header box
    
        currentY += lineHeight -2 ;
        // Draw the background rectangle (Gray color) for cModule_
        doc.setFillColor(200, 200, 200); // RGB for gray
        doc.rect(pageMargin, currentY , boxWidth - pageMargin, headerHeight - 2, 'F');

        doc.setFont(reportFont, "bold");
        doc.setFontSize(10);
        doc.line(pageMargin, currentY, totalColWidth, currentY); 
        const cModule__ = "SALES RECORD";
        doc.text(cModule__, (boxWidth + pageMargin - doc.getTextWidth(cModule__)) / 2, currentY + (headerHeight / 2));
        doc.setFont(reportFont, "normal");
        doc.setFont('Courier', "bold");
        doc.setFontSize(10);
        doc.text(headerData[0], centerPosi + padding, currentY + (headerHeight / 2)); // Ref No.


        // Add a vertical line dividing the columns
        const dividerX = centerPosi - pageMargin; // X position for the center dividing line
        doc.line(dividerX, currentY , dividerX, currentY ); // 1st vert line for SALES HEADER

        // Draw a line just after the SALES HEADER and Ref. No. row to separate the header
        currentY += lineHeight
        doc.line(pageMargin, currentY + 2, totalColWidth, currentY +2); 
        doc.line(dividerX, currentY - lineHeight , dividerX, currentY + lineHeight ); // 2nd vert line
    
        currentY += lineHeight
        doc.setFont('Courier', "bold");
        doc.text(headerData[1], pageMargin + 2, currentY); // Location
        doc.text(headerData[2], centerPosi + padding, currentY); // OR Date
        doc.line(dividerX, currentY - lineHeight, dividerX, currentY + lineHeight); // 3nd vert line
    
        currentY += lineHeight;
        doc.text(headerData[3], pageMargin + 2, currentY); // Customer
        doc.text(headerData[4], centerPosi + padding, currentY); // Remarks
        doc.line(dividerX, currentY - lineHeight, dividerX, currentY + lineHeight); // 4th vert line
        doc.setFont(reportFont, "normal");
        doc.setFontSize(8);

        if (firstPage) {
            currentY += lineHeight - 2;
        } else {
            currentY += lineHeight - 1
        }

    }

    function createVertLines(bottomLinePosi) {
        let xPos = pageMargin+colWidths[0];
        for (let i = 1; i < 8; i++) {
            doc.setLineDash([1, 2]);
            // Draw vertical dashed line at xPos
            doc.line(xPos, startY+40, xPos, pageHeight - bottomLinePosi - pageMargin); 
            
            // Move xPos to the next column's starting position
            xPos += colWidths[i];
        }    
        doc.setLineDash([]);
        const nRowPosi = pageHeight - bottomLinePosi -pageMargin
        doc.line(pageMargin, nRowPosi , totalColWidth, nRowPosi ); 

    }
    // doc.line(startingCol, rowPosition, length, rowPosition)
    // doc.text(textStr, startingCol, rowPosition)

}

// document.getElementById('ScanCode').addEventListener('blur', async (e) =>{
//     e.preventDefault();
//     addScanCode()
// })
document.getElementById('ScanCode').addEventListener('paste', async () =>{
    addScanCode()
})

// Event listener with debounce
document.getElementById('ScanCode').addEventListener('input', debounce(() => {
    addScanCode();
}, 300));  

// Debounce function
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        // Clear the timeout if it exists
        clearTimeout(timeout);
        // Set a new timeout to execute the function after the delay
        timeout = setTimeout(() => func(...args), delay);
    };
}


async function addScanCode() {
    const ScanCode = document.getElementById('ScanCode')
    if (!ScanCode.value) {
        ScanCode.focus();
        return;
    }
    if (ScanCode.value.length < 5) {
        ScanCode.focus();
        return;
    }

    try {

        let cItemCode = '', nItemPrce = 0, nLandCost = 0, nItemCost = 0
        // Call to your backend to validate and get the list of items
        const dataItem = await validateField('ScanCode', 'http://localhost:3000/product/checkUsersCde', '', true);
        
        if (!dataItem) {
            alert(`${ScanCode.value} is not found.`)
            ScanCode.value='';
            ScanCode.focus();
            return;
        }

        if (dataItem) {
            // If more than one item is returned, show the pick list
            if (dataItem.length > 1) {
                const inputElement = ScanCode;
                
                // Call pickItem function to show the pick list
                const selectedItem = await pickItem(dataItem, inputElement);
                if (!selectedItem) {
                    // Handle case where no selection is made
                    ScanCode.value = '';
                    ScanCode.focus();
                    return;
                }
                
                // Proceed with the selected item
                cItemCode = selectedItem.ItemCode
                nItemPrce = selectedItem.ItemPrce
                nLandCost = selectedItem.LandCost
                nItemCost = selectedItem.ItemCost

            } else {
                // If only one item is returned, fill in the form fields
                const item = dataItem[0]; // The single item returned
                cItemCode = item.ItemCode
                nItemPrce = item.ItemPrce
                nLandCost = item.LandCost
                nItemCost = item.ItemCost

            }
        }
        // Close pickListDiv if it's open
        const pickListDiv = document.getElementById('pickListDiv');
        if (pickListDiv) {
            pickListDiv.style.display = 'none';  // Hide the pickListDiv if it's open
        }

        const cCtrlNum_ = currentRec.CtrlNum_
        const nAmount__ = nItemPrce
        const nQuantity = 1
        const nDiscRate = 0
        const cTimeSale = get24HrTime()
        const dDate____ = new Date()

        // console.log(cCtrlNum_,cItemCode,dDate____,cTimeSale,nQuantity,nItemPrce,nDiscRate,nAmount__,nLandCost)
        addSalesDtl(cCtrlNum_,cItemCode,dDate____,cTimeSale,nQuantity,nItemPrce,nDiscRate,nAmount__,nLandCost)
        ScanCode.value=''
        ScanCode.focus()

    } catch (error) {
        console.error("Error fetching or processing data:", error);
    }

}

async function chkUsersCde(editMode) {
    if (!UsersCde.value ) {
        UsersCde.focus();
        return;
    }
    if (UsersCde.value.length < 5) {
        UsersCde.focus()
        return;
    }

    try {
        // Call to your backend to validate and get the list of items
        let dataItemList = await validateField('UsersCde', 'http://localhost:3000/product/checkUsersCde', '', true);

        if (dataItemList) {
            // If more than one item is returned, show the pick list
            if (dataItemList.length > 1) {
                const inputElement = UsersCde;
                
                // Call pickItem function to show the pick list
                const selectedItem = await pickItem(dataItemList, inputElement);
                if (!selectedItem) {
                    // Handle case where no selection is made
                    UsersCde.value = '';
                    UsersCde.focus();
                    return;
                }
                
                // Proceed with the selected item
                document.getElementById('UsersCde').value = selectedItem.UsersCde;
                document.getElementById('OtherCde').value = selectedItem.OtherCde;
                document.getElementById('Descript').value = selectedItem.Descript;
                
                if (!editMode) {
                    document.getElementById('ItemPrce').value = selectedItem.ItemPrce;
                    document.getElementById('Amount__').value = selectedItem.ItemPrce;
                }

                // Additional variables
                nLandCost = selectedItem.LandCost;
                cItemCode = selectedItem.ItemCode;

            } else {
                // If only one item is returned, fill in the form fields
                const item = dataItemList[0]; // The single item returned
                document.getElementById('UsersCde').value = item.UsersCde;
                document.getElementById('OtherCde').value = item.OtherCde;
                document.getElementById('Descript').value = item.Descript;

                if (!editMode) {
                    document.getElementById('ItemPrce').value = item.ItemPrce;
                    document.getElementById('Amount__').value = item.ItemPrce;
                }

                // Set additional fields
                nLandCost = item.LandCost;
                cItemCode = item.ItemCode;
            }
            // Close pickListDiv if it's open
            const pickListDiv = document.getElementById('pickListDiv');
            if (pickListDiv) {
                pickListDiv.style.display = 'none';  // Hide the pickListDiv if it's open
            }

        }


    } catch (error) {
        console.error("Error fetching or processing data:", error);
    }

}