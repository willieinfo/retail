import { showReport, formatDate, populateLocation, showNotification, debounce, MessageBox, 
    formatter, checkEmptyValue, highlightRow, chkUsersCde, addScanCode} from '../FunctLib.js';
import { FiltrRec } from "../FiltrRec.js"
import { printFormPDF } from "../PrintRep.js"

const divStockLst = `
    <div id="StockLst" class="report-section containerDiv">
        <div class="ReportHead">
            <span><i class="fa fa-dollar-sign"></i> Stock Transfers List</span>
            <button id="closeStockRec" class="closeForm">✖</button>
        </div>
        <div id="stockRecList" class="ReportBody">
            <table>
                <thead>
                    <tr>
                        <th>Control No</th>
                        <th>Ref. Doc</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Qty. Out</th>
                        <th>Qty. In</th>
                        <th>Amount</th>
                        <th>Items</th>
                        <th>Remarks</th>
                        <th>Encoder</th>
                        <th>Log Date</th>
                    </tr>
                </thead>
            </table>        
        </div>
        <div class="ReportFooter">
            <div class="footSegments">
                <button id="addStockRec"><i class="fa fa-add"></i> Add Stock Transfer</button>
            </div>
            <div class="footSegments">
                <span id="stockLstCounter" class="recCounter"></span>
                <button id="printList"><i class="fa fa-file-excel"></i> Excel</button>
                <button id="stockFilter"><i class="fa fa-filter"></i> Filter List</button>
            </div>
        </div>
    </div>
`
const divStocForm = `
    <div id="StocForm" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Stock Transfer Form</span>
            <button id="closeStockDtl" class="closeForm">✖</button>
        </div>
       <div id="stockTransfer" class="DetailsForm"></div>
        <div class="btnDiv">
            <button type="submit" id="saveStockRecBtn" class="saveBtn"><i class="fa fa-save"></i>  Save</button>
            <button type="button" id="cancelStockRecBtn" class="cancelBtn"><i class="fa fa-close"></i>  Close</button>
        </div>
        <div class="ReportFooter">
            <div class="footSegments">
                <button id="addStockDtl"><i class="fa fa-add"></i> Add Item</button>
                <input type="text" id="StockRec_ScanCode" class="ScanCode" placeholder="Scan or Type Code to add" spellcheck="false" autocomplete="off">
            </div>
            <div class="footSegments">
                <button id="uploadItemsBtn"><i class="fa fa-download"></i> Download</button>
            </div>
            <div class="footSegments">
                <span id="stockDtlCounter" class="recCounter"></span>
                <button id="printStockTransfer"><i class="fa fa-print"></i> Print Stock Transfer</button>
            </div>
        </div>
    </div>
`
const fragment = document.createDocumentFragment();

const div1 = document.createElement('div');
div1.innerHTML = divStockLst;
fragment.appendChild(div1);

const div2 = document.createElement('div');
div2.innerHTML = divStocForm;
fragment.appendChild(div2);

document.body.appendChild(fragment);  // Only one reflow happens here


let globalData = [];    // Define a global array
let itemsDtl = [];      // RecordSet of STOCKDTL
let currentRec = [];    // Current selected STOCKREC record
let currentIndex = 0    // Index of the selected STOCKREC record

// values wil be determined as user enters UsersCde and validateField()
let cItemCode=null  
let nLandCost=0

async function StockLst(dDateFrom, dDateTo__, cWhseFrom, cReferDoc) {

    const stockLstCounter=document.getElementById('stockLstCounter')
    document.getElementById('loadingIndicator').style.display = 'flex';

    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/transfers/StockRecLst');
        const params = new URLSearchParams();
        if (dDateFrom) params.append('DateFrom', dDateFrom); 
        if (dDateTo__) params.append('DateTo__', dDateTo__); 
        if (cWhseFrom) params.append('WhseFrom', cWhseFrom);
        if (cReferDoc) params.append('ReferDoc', cReferDoc);

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        globalData = await response.json(); // Store full data array globally
        stockLstCounter.innerHTML=`${globalData.length} Records`
      
        updateTable() //Render Stock Transfer List

    } catch (error) {
        console.error('Fetch error:', error);
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

function updateTable() {
    const reportBody = document.getElementById('stockRecList');
    reportBody.innerHTML = ''; // Clear previous content

    const listTable = `
        <div id="tableDiv">
        <table id="ListStockTable">
            <thead id="Look_Up_Head">
                <tr>
                    <th>Control No</th>
                    <th>Ref. Doc</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Qty. Out</th>
                    <th>Qty. In</th>
                    <th>Amount</th>
                    <th>Items</th>
                    <th>Remarks</th>
                    <th>Encoder</th>
                    <th>Log Date</th>
                </tr>
            </thead>
            <tbody id="ListStockBody">
                ${globalData.map((item, index) => `
                    <tr id="trStocList" data-index="${index}" style="${item.Disabled ? 'color: darkgray;' : ''}">
                        <td>${item.CtrlNum_ || 'N/A'}</td>
                        <td>${item.ReferDoc || 'N/A'}</td>
                        <td>${formatDate(item.Date____) || 'N/A'}</td>
                        <td class="colNoWrap">${item.LocaName || 'N/A'}</td>
                        <td style="text-align: center">${item.TotalQty.toFixed(0) || 'N/A'}</td>
                        <td style="text-align: center">${item.TotalRcv.toFixed(0) || 'N/A'}</td>
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
    document.getElementById('ListStockBody').addEventListener('click', (event) => {
        const row = event.target.closest('tr'); // Find the clicked row
        if (row) {

            highlightRow(row, '#ListStockTable');
            // Optionally, call your edit function if needed
            const index = parseInt(row.getAttribute('data-index'));
            currentIndex = index
            if (!isNaN(index) && index >= 0 && index < globalData.length) {
                // console.log(`Row clicked for index: ${index}`);
                StocForm(index, true); // Pass only the index to your form
            }
        }
    });

}

async function StocForm(index,editMode) {

    document.getElementById("addStockDtl").disabled = !editMode;
    document.getElementById("StockRec_ScanCode").disabled = !editMode;

    const reportBody = document.getElementById('stockTransfer');
    reportBody.innerHTML =''

    const stockDtlCounter=document.getElementById('stockDtlCounter')
    const itemData = globalData[index];
    currentRec = globalData[index];

    reportBody.innerHTML = `
        <div id="transfersForm" class="invoice">
            <div id="inputStock1" class="textDiv">
                <div class="textDiv">
                    <div>
                        <label for="StockRec_WhseFrom">Origin</label>
                        <select id="StockRec_WhseFrom"></select>
                    </div>
                    <div>
                        <label for="StockRec_WhseTo__">Destination</label>
                        <select id="StockRec_WhseTo__"></select>
                    </div>
                </div>
                <div>
                    <label for="StockRec_ReferDoc">Ref. No</label>
                    <input type="text" id="StockRec_ReferDoc" spellcheck="false" readonly>
                </div>
            </div>
            <div id="inputStock2" class="textDiv">
                <div class="textDiv">
                    <div>
                        <label for="StockRec_Prepared">Transferred By:</label>
                        <input type="text" id="StockRec_Prepared" spellcheck="false">
                    </div>
                    <div>
                        <label for="StockRec_Date____">Date Issued:</label>
                        <input type="date" id="StockRec_Date____">
                    </div>
                </div>
                <div class="textDiv">
                    <div>
                        <label for="StockRec_Received">Received By:</label>
                        <input type="text" id="StockRec_Received" spellcheck="false">
                    </div>
                    <div>
                        <label for="StockRec_DateRcvd">Date Received:</label>
                        <input type="date" id="StockRec_DateRcvd">
                    </div>
                </div>
                <div>
                    <label for="StockRec_Remarks_">Remarks</label>
                    <input type="text" id="StockRec_Remarks_" spellcheck="false">
                </div>
                <div id="chkDiv">
                    <input type="checkbox" id="StockRec_Disabled" >
                    <label for="StockRec_Disabled">Disabled</label>
                </div>
            </div>
        </div>
        <div class="itemsTableDiv" id="itemsTableDiv";>
            <table class="StockDtlTable">
                <thead id="ListItemHead">
                    <tr>
                        <th>Stock No.</th>
                        <th>Bar Code</th>
                        <th>Item Description</th>
                        <th>Qty. Out</th>
                        <th>Qty. In</th>
                        <th>Unit Price</th>
                        <th>Ext. Price</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="ListStocItem"></tbody>
            </table>
        </div>  
    `    

    document.getElementById('StockLst').classList.remove('active')
    showReport('StocForm')

    await populateLocation('', '','StocArea', 'StockRec_WhseFrom');
    await populateLocation('', '','StocArea', 'StockRec_WhseTo__');

    if (editMode) {
        document.getElementById('loadingIndicator').style.display = 'flex';

        const cCtrlNum_=itemData.CtrlNum_
        document.getElementById('StockRec_ReferDoc').value=itemData.ReferDoc
        document.getElementById('StockRec_Date____').value=formatDate(itemData.Date____,'YYYY-MM-DD')
        document.getElementById('StockRec_DateRcvd').value=formatDate(itemData.DateRcvd,'YYYY-MM-DD')
        document.getElementById('StockRec_Prepared').value=itemData.Prepared
        document.getElementById('StockRec_Received').value=itemData.Received
        document.getElementById('StockRec_Remarks_').value=itemData.Remarks_
        document.getElementById('StockRec_Disabled').checked=itemData.Disabled ? true : false


        const whsefromSelect = document.getElementById('StockRec_WhseFrom');
        const whsefromValue = itemData.WhseFrom.trim(); // The value that should be selected
        // Check if the select element has options, then set the selected option
        const option1 = whsefromSelect.options;
        for (let i = 0; i < option1.length; i++) {
            if (option1[i].value.trim() == whsefromValue) {
                option1[i].selected = true;
                whsefromSelect.selectedIndex = i; // Set selectedIndex
                break; 
            }
        }
        const whseto__Select = document.getElementById('StockRec_WhseTo__');
        const whseto__Value = itemData.WhseTo__.trim(); 
        const option2 = whseto__Select.options;
        for (let i = 0; i < option2.length; i++) {
            if (option2[i].value.trim() == whseto__Value) {
                option2[i].selected = true;
                whseto__Select.selectedIndex = i; // Set selectedIndex
                break; 
            }
        }

        try {
            // Build query parameters
            const url = new URL('http://localhost:3000/transfers/StockDtlLst');
            const params = new URLSearchParams();
            if (cCtrlNum_) params.append('CtrlNum_', cCtrlNum_);
    
            // Send request with query parameters
            const response = await fetch(`${url}?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            itemsDtl = await response.json(); // Store full data array globally
            stockDtlCounter.innerHTML=`${itemsDtl.length} Records`

            updateItemTable();  // Render items using <tr>

    
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            document.getElementById('loadingIndicator').style.display = 'none';
        }
    } else {
        // Triggered from +Add button Footer
        const dNew_Date= new Date()
        document.getElementById('StockRec_Date____').value=formatDate(dNew_Date,'YYYY-MM-DD')
        document.getElementById('StockRec_DateRcvd').value=formatDate(dNew_Date,'YYYY-MM-DD')
        document.getElementById('StockRec_ReferDoc').value='New Record'
        document.getElementById('StockRec_Remarks_').value=''
        itemsDtl = []; 
        updateItemTable();
        
    }
}


document.getElementById('saveStockRecBtn').addEventListener('click', () => {
    const stockDtlCounter=document.getElementById('stockDtlCounter').innerText
    const cWhseFrom=document.getElementById('StockRec_WhseFrom').value
    const cWhseTo__=document.getElementById('StockRec_WhseTo__').value
    const cRemarks_=document.getElementById('StockRec_Remarks_').value
    const dDate____=document.getElementById('StockRec_Date____').value
    const dDateRcvd=document.getElementById('StockRec_DateRcvd').value
    const cPrepared=document.getElementById('StockRec_Prepared').value
    const cReceived=document.getElementById('StockRec_Received').value
    const lDisabled=document.getElementById('StockRec_Disabled').checked ? 1 : 0 

    if (!cWhseFrom) {
        document.getElementById('StockRec_WhseFrom').focus();
        document.getElementById('StockRec_WhseFrom').classList.add('invalid');  // Add a class to highlight
        return ;
    }
    if (!cWhseTo__) {
        document.getElementById('StockRec_WhseTo__').focus();
        document.getElementById('StockRec_WhseTo__').classList.add('invalid');  // Add a class to highlight
        return ;
    }

    if (stockDtlCounter) {

        editStockRec(currentRec.CtrlNum_, cWhseFrom, cWhseTo__, dDate____, dDateRcvd, cRemarks_, cPrepared, cReceived, lDisabled)

    } else {
        const cCtrlNum_='NEW_CTRLID'
        const cEncoder_='Willie'
        const cSuffixId='S'
        const dLog_Date=new Date()
        const nNoOfItem=0
        
        if (addStockRec(cCtrlNum_, cWhseFrom, cWhseTo__, dDate____, dDateRcvd, cRemarks_, cEncoder_,
            dLog_Date, nNoOfItem, cPrepared, cReceived, cSuffixId)) {
            document.getElementById("addStockDtl").disabled = false;
            document.getElementById("StockRec_ScanCode").disabled = false;
    
        }
    }
});


document.getElementById('cancelStockRecBtn').addEventListener('click', () => {
    showReport('StockLst')  
});

async function editStockRec(cCtrlNum_, cWhseFrom, cWhseTo__, dDate____, dDateRcvd, cRemarks_, cPrepared, cReceived ,lDisabled) {

    lDisabled = document.getElementById("StockRec_Disabled").checked ? '1' : '0';

    try {
        const response = await fetch('http://localhost:3000/transfers/editStockHeader', {
            method: 'PUT',  
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cCtrlNum_: cCtrlNum_,
                cWhseFrom: cWhseFrom, 
                cWhseTo__: cWhseTo__, 
                dDate____: dDate____,
                dDateRcvd: dDateRcvd,
                cRemarks_: cRemarks_,
                cPrepared: cPrepared,
                cReceived: cReceived,
                lDisabled: lDisabled
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();
        if (updatedItem) {
            showNotification('StockRec record edited successfully!')
            globalData[currentIndex]=updatedItem;
            updateTable();         
        }

        
    } catch (error) {
        console.error('Update StockRec error:', error);
    }
}


async function addStockRec(cCtrlNum_, cWhseFrom, cWhseTo__, dDate____, dDateRcvd, cRemarks_, cEncoder_,
    dLog_Date, nNoOfItem, cPrepared, cReceived, cSuffixId) {
    // console.log(cCtrlNum_, cWhseFrom, cWhseTo__, dDate____, dDateRcvd, cRemarks_, cEncoder_,
    //     dLog_Date, nNoOfItem, cPrepared, cSuffixId)
    try {
        const response = await fetch('http://localhost:3000/transfers/addStockHeader', {
            method: 'POST',  
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cCtrlNum_: cCtrlNum_,
                cWhseFrom: cWhseFrom, 
                cWhseTo__: cWhseTo__, 
                dDate____: dDate____,
                dDateRcvd: dDateRcvd,
                cRemarks_: cRemarks_,
                cEncoder_: cEncoder_,
                dLog_Date: dLog_Date,
                nNoOfItem: nNoOfItem,
                cPrepared: cPrepared,
                cReceived: cReceived,
                cSuffixId: cSuffixId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();
        if (updatedItem) {
            
            showNotification('StockRec record added successfully!')
            globalData.push(updatedItem);
            updateTable();         
            // console.log(updatedItem)
            currentRec=updatedItem
            document.getElementById("StockRec_ReferDoc").value = updatedItem.ReferDoc


            // Scroll to the last row after updating the table
            const tableBody = document.getElementById('ListStockBody'); 
            const lastRow = tableBody.lastElementChild; // Get the last row
            setTimeout(() => {
                if (tableBody) {
                    if (lastRow) {
                        lastRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
                        lastRow.classList.add('hover-effect'); 
                        setTimeout(() => lastRow.classList.remove('hover-effect'), 2000);                        
                    }
                }
            }, 100); // Small delay to ensure table updates first

            highlightRow(lastRow, 'ListStockBody');

        }

        
    } catch (error) {
        console.error('Update StockRec error:', error);
    }
}

function updateItemTable(refreshOnly=false) {
    let nTotalQty = 0;
    let nTotalRcv = 0;
    let nTotalAmt = 0;

    const ListStocItem=document.getElementById('ListStocItem')
    // Map through itemsDtl and build rows while accumulating totals
    const listTable = itemsDtl.map((item, index) => {
        // Accumulate totals inside the map
        nTotalQty += item.Quantity || 0;
        nTotalRcv += item.QtyRecvd || 0;
        nTotalAmt += item.Quantity * item.Amount__ || 0;
        return `
            <tr data-index="${index}">
                <td class="colNoWrap">${item.UsersCde || 'N/A'}</td>
                <td class="colNoWrap">${item.OtherCde || 'N/A'}</td>
                <td class="colNoWrap">${item.Descript.substring(0,30) || 'N/A'}</td>
                <td style="text-align: center">${item.Quantity.toFixed(0) || 'N/A'}</td>
                <td style="text-align: center">${item.QtyRecvd.toFixed(0) || 'N/A'}</td>
                <td style="text-align: right">${formatter.format(item.Amount__) || 'N/A'}</td>
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
                    <td style="text-align: center">${nTotalRcv.toFixed(0) || 'N/A'}</td>
                    <td></td>
                    <td style="text-align: right">${formatter.format(nTotalAmt) || 'N/A'}</td>
                </tr>
            </tfoot>
`

    ListStocItem.innerHTML = listTable+listFooter; // Update the tbody with new rows

    document.getElementById('ListStocItem').addEventListener('click', async (event) => {
        const delBtn = event.target.closest('.spanDelItem'); // Find the clicked delete button
        if (delBtn) {
            const row = event.target.closest('tr');
            const index = parseInt(delBtn.getAttribute('data-index')); // Get index

            
            if (globalData[currentIndex].Printed_) {
                alert('This transaction has been printed already.')
                return
            }

            if (!isNaN(index) && index >= 0 && index < itemsDtl.length) {
                if (refreshOnly) return;

                const confirmed = confirm(`Do you want to delete ${itemsDtl[index].Descript.trim()}?`)
                if (confirmed) {
                    const deleted_ = await deleteStockDtl(itemsDtl[index].RecordId,globalData[currentIndex].CtrlNum_,index)
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

                highlightRow(row, '.StockDtlTable');
    
                // Optionally, call your edit function if needed
                const index = parseInt(row.getAttribute('data-index'));
                if (!isNaN(index) && index >= 0 && index < globalData.length) {
                    if (refreshOnly) return;
                    StockDtl(index, true); // Pass only the index to your form
                }
            }
        }
    });
    
}


document.getElementById('stockFilter').addEventListener('click', async () => {
    try {
        FiltrRec('StockLst').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));

            // console.log(filterData)
            const dDateFrom = filterData[0];
            const dDate__To = filterData[1];
            const cWhseFrom = filterData[2];
            // const cUsersCde = filterData[3];
            // const cOtherCde = filterData[4];
            // const cDescript = filterData[5];
            // const cBrandNum = filterData[6];
            // const cCategNum = filterData[7];
            // const cItemType = filterData[8];
            // const cItemDept = filterData[9];
            const cReferDoc = filterData[10];

            StockLst(dDateFrom,dDate__To,cWhseFrom,cReferDoc) //Calling Main StockRec List
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
    }
});

function StockDtl(index,editMode) {
    const itemsDtlForm = document.createElement('form');
    itemsDtlForm.id = "items-form";
    itemsDtlForm.style.display = "none";  // Start with it hidden

    const itemData = itemsDtl[index];
    itemsDtlForm.innerHTML = `
        <div id="titleBar">Stock Transfer Detail Form</div>
        <div class="inputSection">
            <br>
            <div class="subTextDiv" id="inputDetails">
                <div class="textDiv">
                    <div class="subTextDiv">
                        <label for="StockRec_UsersCde">Stock No</label>
                        <input type="text" id="StockRec_UsersCde" name="UsersCde" spellcheck="false" 
                            placeholder="Type Stock No. or Bar Code here to search"
                            autocomplete = "off">
                    </div>
                    <div class="subTextDiv">
                        <label for="StockRec_OtherCde">Bar Code</label>
                        <input type="text" id="StockRec_OtherCde" name="OtherCde" spellcheck="false" readonly>
                    </div>
                </div>

                <div id="inputDescript" class="textDiv">
                    <div class="subTextDiv" style="width:100%;">
                        <label for="StockRec_Descript">Item Description</label>
                        <input type="text" id="StockRec_Descript" name="Descript" readonly>
                    </div>
                </div>
                <div class="textDiv">
                    <div class="subTextDiv">
                        <label for="StockRec_Quantity">Qty. Out</label>
                        <input type="number" id="StockRec_Quantity" name="Quantity">
                    </div>
                    <div class="subTextDiv">
                        <label for="StockRec_QtyRecvd">Qty. In</label>
                        <input type="number" id="StockRec_QtyRecvd" name="QtyRecvd">
                    </div>
                    <div class="subTextDiv">
                        <label for="StockRec_Amount__">Net Amount</label>
                        <input type="number" id="StockRec_Amount__" name="Amount__">
                    </div>
                </div>
            </div>
            
            <div class="btnDiv">
                <button type="submit" id="saveStockDtlBtn" class="saveBtn"><i class="fa fa-save"></i>  Save</button>
                <button type="button" id="cancelStockDtlBtn" class="cancelBtn"><i class="fa fa-close"></i>  Close</button>
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

    document.getElementById('StocForm').appendChild(itemsDtlForm);
    document.getElementById('StocForm').appendChild(overlay);
    itemsDtlForm.style.display = 'flex'


    if (editMode) {
        document.getElementById('StockRec_UsersCde').value=itemData.UsersCde
        document.getElementById('StockRec_OtherCde').value=itemData.OtherCde
        document.getElementById('StockRec_Descript').value=itemData.Descript
        document.getElementById('StockRec_Quantity').value=itemData.Quantity
        document.getElementById('StockRec_QtyRecvd').value=itemData.QtyRecvd
        document.getElementById('StockRec_Amount__').value=itemData.Amount__
        document.getElementById('StockRec_Quantity').focus()
    } else {
        document.getElementById('StockRec_UsersCde').value=''
        document.getElementById('StockRec_OtherCde').value=''
        document.getElementById('StockRec_Descript').value=''
        document.getElementById('StockRec_Quantity').value=1
        document.getElementById('StockRec_QtyRecvd').value=1
        document.getElementById('StockRec_Amount__').value=0.00
        document.getElementById('StockRec_UsersCde').focus()

    }
    document.getElementById('StockRec_Amount__').readonly = true;
    document.getElementById('StockRec_OtherCde').readonly = true;
    document.getElementById('StockRec_Descript').readonly = true;
    document.getElementById('StockRec_Amount__').setAttribute('tabindex', '-1');
    document.getElementById('StockRec_OtherCde').setAttribute('tabindex', '-1');
    document.getElementById('StockRec_Descript').setAttribute('tabindex', '-1');

    // Get the id's of the elements for checkEmptyValue() function before saving
    const UsersCde=document.getElementById('StockRec_UsersCde')
    const Quantity=document.getElementById('StockRec_Quantity')
    const Amount__=document.getElementById('StockRec_Amount__')
    
    document.getElementById('StockRec_UsersCde').addEventListener('input', debounce(async () => {
        const otherDetails = { 
            cItemCode: '',
            nLandCost: 0
        }
        await chkUsersCde(editMode, 'StockRec', otherDetails)        
        cItemCode=otherDetails.cItemCode
        nLandCost=otherDetails.nLandCost
}, 300));  // 300ms delay (you can adjust the delay as needed)
    
    document.getElementById('saveStockDtlBtn').addEventListener('click', async (e) => {
        e.preventDefault()
    
        if (!checkEmptyValue(UsersCde,Quantity,Amount__)) {
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
                editStockDtl(index,cCtrlNum_,itemData.RecordId,cItemCode,nLandCost)
        } else {
            const nQuantity=document.getElementById('StockRec_Quantity').value
            const nQtyRecvd=document.getElementById('StockRec_QtyRecvd').value
            const nAmount__=document.getElementById('StockRec_Amount__').value
            const cSuffixId='ES'

            addStockDtl(cCtrlNum_,cItemCode,nQuantity,nQtyRecvd,nAmount__,nLandCost,cSuffixId)
        }
        document.getElementById('items-form').remove()
        document.getElementById('modal-overlay').remove();
    })

    document.getElementById('cancelStockDtlBtn').addEventListener('click', () => {
        document.getElementById('items-form').remove()
        document.getElementById('modal-overlay').remove();
    })
}

async function editStockDtl(index,cCtrlNum_,cRecordId,cItemCode,nLandCost) {
    document.getElementById('loadingIndicator').style.display = 'flex';

    const nQuantity=document.getElementById('StockRec_Quantity').value
    const nQtyRecvd=document.getElementById('StockRec_QtyRecvd').value
    const nAmount__=document.getElementById('StockRec_Amount__').value

    // console.log([cRecordId,cItemCode,nQuantity,nItemPrce,nDiscRate,nAmount__,nLandCost])

    try {
        const response = await fetch('http://localhost:3000/transfers/editStockDetail', {
            method: 'PUT',  
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cRecordId: cRecordId,
                cItemCode: cItemCode,
                nQuantity: nQuantity,
                nQtyRecvd: nQtyRecvd,
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
            showNotification('Stock Transfer Item record updated successfully!')
            // console.log(updatedItem)
            updateStockTotals(cCtrlNum_) // Update STOCKREC Header
        }

    } catch (error) {
        console.error("Error processing editStockDetail:", error);
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

// exported to Functlib for addScanCode() function
export async function addStockDtl(cCtrlNum_,cItemCode,nQuantity,nQtyRecvd,nAmount__,nLandCost,cSuffixId) {
    document.getElementById('loadingIndicator').style.display = 'flex';
    
    try {
        const response = await fetch('http://localhost:3000/transfers/addStockDetail', {
            method: 'POST',  
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cCtrlNum_: cCtrlNum_,
                cItemCode: cItemCode,
                nQuantity: nQuantity,
                nQtyRecvd: nQtyRecvd,
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
            showNotification('Stock Transfer Item record added successfully!')

            updateStockTotals(updatedItem.CtrlNum_) // Update STOCKREC Header

            setTimeout(() => {
                const tableBody = document.getElementById('ListStocItem'); 
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
                            highlightRow(lastRow, 'ListStocItem');
                        }
                    }
                }
            }, 100); // Small delay to ensure table updates first

        }

    } catch (error) {
        console.error("Error processing addStockDetail:", error);
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

async function updateStockTotals(cCtrlNum_) {
    const headerTotals=[
        calcTotalQty(),
        calcTotalRcv(),
        calcTotalAmt(),
        calcTotalCnt()
    ]
    const res = await fetch('http://localhost:3000/transfers/updateStockTotals', {
        method: 'PUT',  
        headers: {
            'Content-Type': 'application/json'  // Specify JSON format
        },
        body: JSON.stringify({
            cCtrlNum_: cCtrlNum_,
            nTotalQty: headerTotals[0],
            nTotalRcv: headerTotals[1],
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
    function calcTotalRcv() {
        return itemsDtl.reduce((total, item) => total + parseInt(item.QtyRecvd, 10), 0);
    }
    function calcTotalAmt() {
        return itemsDtl.reduce((total, item) => total + parseFloat(item.Quantity*item.Amount__), 0).toFixed(2);
    }            
    function calcTotalCnt() {
        return itemsDtl.length
    }            

}


document.addEventListener('DOMContentLoaded', () => {
    const liStockLstMenu = document.getElementById('StockTransfer');
    const stockLstFileDiv = document.getElementById('StockLst');
    const stocFormFileDiv = document.getElementById('StocForm');
    const closeStockRec = document.getElementById('closeStockRec');
    const closeStockDtl = document.getElementById('closeStockDtl');
    const addStockRec = document.getElementById('addStockRec'); //Footer Add button
    const addStockDtl = document.getElementById('addStockDtl');

    addStockRec.addEventListener('click', () => {
        document.getElementById('stockDtlCounter').innerText=''
        StocForm();
    });
    addStockDtl.addEventListener('click', () => {
        StockDtl();
    });

    closeStockRec.addEventListener('click', () => {
        stockLstFileDiv.classList.remove('active');
    });
    closeStockDtl.addEventListener('click', () => {
        stocFormFileDiv.classList.remove('active');
        showReport('StockLst')
    });

    // Add event listener to each element with the necessary arguments
    liStockLstMenu.addEventListener('click', () => {
        showReport('StockLst')
    });

});

async function deleteStockDtl(cRecordId,cCtrlNum_,index) {
    // console.log('cRecordId',cRecordId,'cCtrlNum_',cCtrlNum_)
    const stockDtlCounter=document.getElementById('stockDtlCounter')
    try {
        const response = await fetch(`http://localhost:3000/transfers/deleteStockDetail/${encodeURIComponent(cRecordId)}`, {
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
        // console.log('Deleted Rows Affected:', result.rowsAffected);
        showNotification('StockDtl deleted successfully');
        // Remove the item from the itemsDtl array
        itemsDtl.splice(index, 1);
        updateItemTable(true)
        stockDtlCounter.innerHTML=`${itemsDtl.length} Records`
        updateStockTotals(cCtrlNum_) // Update STOCKREC Header        
        return true;
    } catch (error) {
        console.error('Delete StockDtl error:', error);
        alert('An error occurred while trying to delete the record.');
        return false;
    }
}


document.getElementById('printStockTransfer').addEventListener('click', async () => {
    const cReferDoc=document.getElementById('StockRec_ReferDoc').value
    const cRemarks_=document.getElementById('StockRec_Remarks_').value
    const dDate____=document.getElementById('StockRec_Date____').value
    const dDateRcvd=document.getElementById('StockRec_DateRcvd').value
    const cPrepared=document.getElementById('StockRec_Prepared').value
    const cReceived=document.getElementById('StockRec_Received').value
    
    const cWhseFrom=document.getElementById('StockRec_WhseFrom')
    const cWhseTo__=document.getElementById('StockRec_WhseTo__')
    const cFromWhse = cWhseFrom.options[cWhseFrom.selectedIndex].text;
    const cTo__Whse = cWhseTo__.options[cWhseTo__.selectedIndex].text;

    const headerData = [
        `Ref. No.     : ${cReferDoc}`,
        `Origin       : ${cFromWhse.trim()}`,
        `Destination  : ${cTo__Whse.trim()}`,
        `Transfer Date: ${formatDate(dDate____,'MM/DD/YYYY')}`,
        `Date Received: ${formatDate(dDateRcvd,'MM/DD/YYYY')}`,
        `Prepared By  : ${cPrepared.trim()}`,
        `Received By  : ${cReceived.trim()}`,
        `Remarks      : ${cRemarks_.trim()}`,
        ''
    ];
    const colWidths = [26, 26, 76, 14, 12, 20, 20]; // Adjust widths as needed
    const columns = ['Stock No.','Bar Code','Item Description','Qty.Out','Qty.In','Unit Price','Ext. Price'];
    const itemFields = [
        'UsersCde',  // Field from item
        'OtherCde',  // Field from item
        'Descript',  // Field from item
        'Quantity',  
        'QtyRecvd',  
        'Amount__',  // Field from item
        (item, formatter) => formatter.format(item.Quantity * item.Amount__)  
    ];    
    const fieldTypes = [
        'string',      // UsersCde (string)
        'string',      // OtherCde (string)
        'string',      // Descript (string)
        'integer',      
        'integer',      
        'number',      
        'calculated'   
    ];        
    
    // columns to create totals based on itemFields array
    const createTotals = [false,false,false,true,true,false,true]

    printFormPDF(headerData, itemsDtl, itemFields, createTotals ,colWidths, 
        columns, fieldTypes, window.base64Image, ['letter','portrait'], formatter, 'Stock Transfer')
});


document.getElementById('StockRec_ScanCode').addEventListener('paste', async () =>{
    await addScanCode('StockRec',currentRec);
})

// Event listener with debounce
document.getElementById('StockRec_ScanCode').addEventListener('input', debounce(async () => {
    await addScanCode('StockRec',currentRec);
}, 300));  

// Debounce function
// function debounce(func, delay) {
//     let timeout;
//     return function(...args) {
//         // Clear the timeout if it exists
//         clearTimeout(timeout);
//         // Set a new timeout to execute the function after the delay
//         timeout = setTimeout(() => func(...args), delay);
//     };
// }


