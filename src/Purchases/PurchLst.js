import { showReport, formatDate, populateLocation, populateSuppNum_, showNotification, debounce, MessageBox, 
    formatter, checkEmptyValue, highlightRow, chkUsersCde, addScanCode,
    makeDraggable} from '../FunctLib.js';
import { FiltrRec } from "../FiltrRec.js"
import { printFormPDF, printReportExcel, generateTitleRows } from "../PrintRep.js"

const divPurchLst = `
    <div id="PurchLst" class="report-section containerDiv">
        <div class="ReportHead">
            <span><i class="fa fa-cart-arrow-down"></i> Stock Receiving List</span>
            <button id="closePurchRec" class="closeForm">✖</button>
        </div>
        <div id="purchRecList" class="ReportBody data-list">
            <table id="ListPurchTable">
                <thead id="Look_Up_Head">
                    <tr>
                        <th>Control No</th>
                        <th>Ref. Doc</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Supplier</th>
                        <th>DR No.</th>
                        <th>DR Date</th>
                        <th>PO No.</th>
                        <th>PO Date</th>
                        <th>Qty.</th>
                        <th>Amount</th>
                        <th>SRP</th>
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
                <button id="addPurchRec"><i class="fa fa-add"></i> Add Stock Receiving</button>
            </div>
            <div class="footSegments">
                <span id="purchLstCounter" class="recCounter"></span>
                <button id="printPurcListXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="purchFilter"><i class="fa fa-list"></i> List</button>
            </div>
        </div>
    </div>
`
const divPurcForm = `
    <div id="PurcForm" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Stock Receiving Form</span>
            <button id="closePurchDtl" class="closeForm">✖</button>
        </div>
       <div id="stockReceiving" class="DetailsForm"></div>
        <div class="btnDiv">
            <button type="submit" id="savePurchRecBtn" class="saveBtn"><i class="fa fa-save"></i>  Save</button>
            <button type="button" id="cancelPurchRecBtn" class="cancelBtn"><i class="fa fa-close"></i>  Close</button>
        </div>
        <div class="ReportFooter">
            <div class="footSegments">
                <button id="addPurchDtl"><i class="fa fa-add"></i> Add Item</button>
                <input type="text" id="PurchRec_ScanCode" class="ScanCode" placeholder="Scan or Type Code to add" spellcheck="false" autocomplete="off">
            </div>
            <div class="footSegments">
                <button id="uploadItemsBtn"><i class="fa fa-download"></i> Download</button>
            </div>
            <div class="footSegments">
                <span id="purchDtlCounter" class="recCounter"></span>
                <button id="printStockReceiving" disabled><i class="fa fa-print"></i> Print Stock Receiving</button>
            </div>
        </div>
    </div>
`
const fragment = document.createDocumentFragment();

const div1 = document.createElement('div');
div1.innerHTML = divPurchLst;
fragment.appendChild(div1);

const div2 = document.createElement('div');
div2.innerHTML = divPurcForm;
fragment.appendChild(div2);

document.body.appendChild(fragment);  // Only one reflow happens here


let globalData = [];    // Define a global array
let itemsDtl = [];      // RecordSet of PURCHDTL
let currentRec = [];    // Current selected PURCHREC record
let currentIndex = 0    // Index of the selected PURCHREC record
let editRecMode = false

// values wil be determined as user enters UsersCde and validateField()
let cItemCode=null  
let nLandCost=0

async function PurchLst(dDateFrom, dDateTo__, cLocation, cReferDoc) {

    const purchLstCounter=document.getElementById('purchLstCounter')
    document.getElementById('loadingIndicator').style.display = 'flex';

    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/purchases/PurchRecLst');
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
        purchLstCounter.innerHTML=`${globalData.length} Records`
      
        updateTable() //Render Stock Receiving List

    } catch (error) {
        console.error('Fetch error:', error);
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}


function updateTable() {
    const reportBody = document.getElementById('purchRecList');
    reportBody.innerHTML = ''; // Clear previous content

    let nTotalQty = 0;
    let nTotalAmt = 0;
    let nTotalSel = 0;
    let nTotalItm = 0;

    const listTable = `
        <div id="tableDiv">
            <table id="ListPurchTable">
                <thead id="Look_Up_Head">
                    <tr>
                        <th>Control No</th>
                        <th>Ref. Doc</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Supplier</th>
                        <th>DR No.</th>
                        <th>DR Date</th>
                        <th>PO No.</th>
                        <th>PO Date</th>
                        <th>Qty.</th>
                        <th>Amount</th>
                        <th>SRP</th>
                        <th>Items</th>
                        <th>Remarks</th>
                        <th>Encoder</th>
                        <th>Log Date</th>
                    </tr>
                </thead>
                <tbody id="ListPurchBody">
                    ${globalData.map((data, index) => {
                        nTotalQty += data.TotalQty || 0;
                        nTotalAmt += data.Amount__ || 0;
                        nTotalSel += data.TotalSRP || 0;
                        nTotalItm += data.NoOfItem || 0;

                        return`
                        <tr id="trStocList" data-index="${index}" style="${data.Disabled ? 'color: darkgray;' : ''}">
                            <td>${data.CtrlNum_ || 'N/A'}</td>
                            <td class="colNoWrap">${data.ReferDoc || 'N/A'}</td>
                            <td>${formatDate(data.Date____) || 'N/A'}</td>
                            <td class="colNoWrap">${data.LocaName || 'N/A'}</td>
                            <td class="colNoWrap">${data.SuppName || 'N/A'}</td>
                            <td class="colNoWrap">${data.DRNum___ || 'N/A'}</td>
                            <td>${formatDate(data.DR__Date) || 'N/A'}</td>
                            <td class="colNoWrap">${data.PONum___ || 'N/A'}</td>
                            <td>${formatDate(data.PODate__) || 'N/A'}</td>
                            <td style="text-align: center">${data.TotalQty.toFixed(0) || 'N/A'}</td>
                            <td style="text-align: right">${formatter.format(data.Amount__) || 'N/A'}</td>
                            <td style="text-align: right">${formatter.format(data.TotalSRP) || 'N/A'}</td>
                            <td style="text-align: center">${data.NoOfItem.toFixed(0) || 'N/A'}</td>
                            <td class="colNoWrap">${data.Remarks_ || 'N/A'}</td>
                            <td>${data.Encoder_ || 'N/A'}</td>
                            <td>${formatDate(data.Log_Date) || 'N/A'}</td>
                        </tr>`
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr style="font-weight: bold;">
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td style="text-align: right">Totals: </td>
                        <td style="text-align: center">${nTotalQty.toFixed(0) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalAmt) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalSel) || 'N/A'}</td>
                        <td style="text-align: center">${nTotalItm.toFixed(0) || 'N/A'}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;

    reportBody.innerHTML = listTable;
    document.getElementById('printPurcListXLS').disabled = false
    document.getElementById('ListPurchBody').addEventListener('click', (event) => {
        const row = event.target.closest('tr'); // Find the clicked row
        if (row) {

            highlightRow(row, '#ListPurchTable');
            // Optionally, call your edit function if needed
            const index = parseInt(row.getAttribute('data-index'));
            currentIndex = index
            if (!isNaN(index) && index >= 0 && index < globalData.length) {
                // console.log(`Row clicked for index: ${index}`);
                editRecMode = true
                PurcForm(index, true); // Pass only the index to your form
            }
        }
    });

}

async function PurcForm(index,editMode) {

    document.getElementById("addPurchDtl").disabled = !editMode;
    document.getElementById("PurchRec_ScanCode").disabled = !editMode;

    const reportBody = document.getElementById('stockReceiving');
    reportBody.innerHTML =''

    const stockDtlCounter=document.getElementById('purchDtlCounter')
    const itemData = globalData[index];
    currentRec = globalData[index];

    reportBody.innerHTML = `
        <div id="purchasesForm" class="invoice">
            <div id="inputPurch1" class="textDiv">
                <div>
                    <label for="PurchRec_SuppNum_">Supplier</label>
                    <select id="PurchRec_SuppNum_"></select>
                </div>
                <div>
                    <label for="PurchRec_ReferDoc">Ref. No</label>
                    <input type="text" id="PurchRec_ReferDoc" spellcheck="false" readonly>
                </div>
                <div>
                    <label for="PurchRec_Date____">Date Received</label>
                    <input type="date" id="PurchRec_Date____">
                </div>
            </div>

            <div id="inputPurch2" class="textDiv">
                <div>
                    <label for="PurchRec_Location">Location</label>
                    <select id="PurchRec_Location"></select>
                </div>
                <div>
                    <label for="PurchRec_DRNum___">DR No.</label>
                    <input type="text" id="PurchRec_DRNum___" spellcheck="false">
                </div>
                <div>
                    <label for="PurchRec_DR__Date">DR Date</label>
                    <input type="date" id="PurchRec_DR__Date">
                </div>
            </div>

            <div id="inputPurch3" class="textDiv">
                <div>
                    <label for="PurchRec_Remarks_">Remarks</label>
                    <input type="text" id="PurchRec_Remarks_" spellcheck="false">
                </div>
                <div>
                    <label for="PurchRec_PONum___">PO No.</label>
                    <input type="text" id="PurchRec_PONum___" spellcheck="false">
                </div>
                <div>
                    <label for="PurchRec_PODate__">PO Date</label>
                    <input type="date" id="PurchRec_PODate__">
                </div>
                <div id="chkDiv">
                    <input type="checkbox" id="PurchRec_Disabled" >
                    <label for="PurchRec_Disabled">Disabled</label>
                </div>
            </div>

        </div>


        <div class="itemsTableDiv data-list" id="itemsTableDiv";>
            <table class="PurchDtlTable">
                <thead id="ListItemHead">
                    <tr>
                        <th>Stock No.</th>
                        <th>Bar Code</th>
                        <th>Item Description</th>
                        <th>PO Qty.</th>
                        <th>RR Qty.</th>
                        <th>Unit Cost</th>
                        <th>Ext. Cost</th>
                        <th>Unit Price</th>
                        <th>Ext. Price</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="ListPurcItem"></tbody>
            </table>
        </div>  
    `    

    document.getElementById('PurchLst').classList.remove('active')
    showReport('PurcForm')

    await populateLocation('', '','', 'PurchRec_Location');
    await populateSuppNum_('', '', 'PurchRec')

    if (editMode) {
        document.getElementById('loadingIndicator').style.display = 'flex';

        const cCtrlNum_=itemData.CtrlNum_
        document.getElementById('PurchRec_ReferDoc').value=itemData.ReferDoc
        document.getElementById('PurchRec_Date____').value=formatDate(itemData.Date____,'YYYY-MM-DD')
        document.getElementById('PurchRec_DRNum___').value=itemData.DRNum___
        document.getElementById('PurchRec_DR__Date').value=formatDate(itemData.DR__Date,'YYYY-MM-DD')
        document.getElementById('PurchRec_PONum___').value=itemData.PONum___
        document.getElementById('PurchRec_PODate__').value=formatDate(itemData.PODate__,'YYYY-MM-DD')
        document.getElementById('PurchRec_Remarks_').value=itemData.Remarks_
        document.getElementById('PurchRec_Disabled').checked=itemData.Disabled ? true : false

        const locationSelect = document.getElementById('PurchRec_Location');
        const locationValue = itemData.Location.trim(); // The value that should be selected
        const option1 = locationSelect.options;
        for (let i = 0; i < option1.length; i++) {
            if (option1[i].value.trim() == locationValue) {
                option1[i].selected = true;
                locationSelect.selectedIndex = i; // Set selectedIndex
                break; 
            }
        }

        const suppnum_Select = document.getElementById('PurchRec_SuppNum_');
        const suppnum_Value = itemData.SuppNum_.trim(); // The value that should be selected
        const option2 = suppnum_Select.options;
        for (let i = 0; i < option2.length; i++) {
            if (option2[i].value.trim() == suppnum_Value) {
                option2[i].selected = true;
                suppnum_Select.selectedIndex = i; // Set selectedIndex
                break; 
            }
        }

        try {
            // Build query parameters
            const url = new URL('http://localhost:3000/purchases/PurchDtlLst');
            const params = new URLSearchParams();
            if (cCtrlNum_) params.append('CtrlNum_', cCtrlNum_);
    
            // Send request with query parameters
            const response = await fetch(`${url}?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            itemsDtl = await response.json(); // Store full data array globally
            stockDtlCounter.innerHTML=`${itemsDtl.length} Records`

            updateItemTable();  // Render detailed items using <tr>

    
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            document.getElementById('loadingIndicator').style.display = 'none';
        }
    } else {
        // Triggered from +Add button Footer
        const dNew_Date= new Date()
        document.getElementById('PurchRec_ReferDoc').value='New Record'
        document.getElementById('PurchRec_Date____').value=formatDate(dNew_Date,'YYYY-MM-DD')
        document.getElementById('PurchRec_DRNum___').value=''
        document.getElementById('PurchRec_DR__Date').value=formatDate(dNew_Date,'YYYY-MM-DD')
        document.getElementById('PurchRec_Remarks_').value=''
        document.getElementById('PurchRec_PONum___').value=''
        document.getElementById('PurchRec_PODate__').value=formatDate(dNew_Date,'YYYY-MM-DD')
        itemsDtl = []; 
        updateItemTable();
        
    }
}


document.getElementById('savePurchRecBtn').addEventListener('click', () => {
    // const stockDtlCounter=document.getElementById('stockDtlCounter').innerText
    const cLocation=document.getElementById('PurchRec_Location').value
    const cSuppNum_=document.getElementById('PurchRec_SuppNum_').value
    const dDate____=document.getElementById('PurchRec_Date____').value
    const cDRNum___=document.getElementById('PurchRec_DRNum___').value
    const dDR__Date=document.getElementById('PurchRec_DR__Date').value
    const cPONum___=document.getElementById('PurchRec_PONum___').value
    const dPODate__=document.getElementById('PurchRec_PODate__').value

    const cRemarks_=document.getElementById('PurchRec_Remarks_').value
    const lDisabled=document.getElementById('PurchRec_Disabled').checked ? 1 : 0 

    if (!cSuppNum_) {
        document.getElementById('PurchRec_SuppNum_').focus();
        document.getElementById('PurchRec_SuppNum_').classList.add('invalid');  
        return ;
    }
    if (!cLocation) {
        document.getElementById('PurchRec_Location').focus();
        document.getElementById('PurchRec_Location').classList.add('invalid');  
        return ;
    }

    if (editRecMode) {

        editPurchRec(currentRec.CtrlNum_, cLocation, cSuppNum_, dDate____, cDRNum___, dDR__Date,
            cPONum___, dPODate__, cRemarks_, lDisabled)

    } else {
        const cCtrlNum_='NEW_CTRLID'
        const dLog_Date=new Date()
        const nNoOfItem=0

        const cUserData = JSON.parse(sessionStorage.getItem('userdata')); 
        const cSuffixId = (cUserData && cUserData[0]) ? cUserData[0].SuffixId : 'ID';
        const cEncoder_ = (cUserData && cUserData[0]) ? cUserData[0].NickName : 'Sys_User';
        
        if (addPurchRec(cCtrlNum_, cLocation, cSuppNum_, dDate____, cDRNum___, dDR__Date,
            cPONum___, dPODate__, cRemarks_, nNoOfItem, cEncoder_, dLog_Date, cSuffixId)) {
            document.getElementById("addPurchDtl").disabled = false;
            document.getElementById("PurchRec_ScanCode").disabled = false;
    
        }
    }
});


document.getElementById('cancelPurchRecBtn').addEventListener('click', () => {
    showReport('PurchLst')  
});

async function editPurchRec(cCtrlNum_, cLocation, cSuppNum_, dDate____, cDRNum___, dDR__Date,
    cPONum___, dPODate__, cRemarks_, lDisabled) {

    lDisabled = document.getElementById("PurchRec_Disabled").checked ? '1' : '0';
    try {
        const response = await fetch('http://localhost:3000/purchases/editPurchHeader', {
            method: 'PUT',  
            headers: {
                'Content-Type': 'application/json'  
            },
            body: JSON.stringify({
                cCtrlNum_: cCtrlNum_,
                cLocation: cLocation, 
                cSuppNum_: cSuppNum_, 
                dDate____: dDate____,
                cDRNum___: cDRNum___,
                dDR__Date: dDR__Date,
                cPONum___: cPONum___,
                dPODate__: dPODate__,
                cRemarks_: cRemarks_,
                lDisabled: lDisabled
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();
        if (updatedItem) {
            showNotification('PurchRec record edited successfully!')
            globalData[currentIndex]=updatedItem;
            updateTable();         
        }

        
    } catch (error) {
        console.error('Update PurchRec error:', error);
    }
}


async function addPurchRec(cCtrlNum_, cLocation, cSuppNum_, dDate____, cDRNum___, dDR__Date,
    cPONum___, dPODate__, cRemarks_, nNoOfItem, cEncoder_, dLog_Date, cSuffixId) {
    try {
        const response = await fetch('http://localhost:3000/purchases/addPurchHeader', {
            method: 'POST',  
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cCtrlNum_: cCtrlNum_,
                cLocation: cLocation, 
                cSuppNum_: cSuppNum_, 
                dDate____: dDate____,
                cDRNum___: cDRNum___,
                dDR__Date: dDR__Date,
                cPONum___: cPONum___,
                dPODate__: dPODate__,
                cRemarks_: cRemarks_,
                nNoOfItem: nNoOfItem,
                cEncoder_: cEncoder_,
                dLog_Date: dLog_Date,
                cSuffixId: cSuffixId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedItem = await response.json();
        if (updatedItem) {
            
            showNotification('PurchRec record added successfully!')
            globalData.push(updatedItem);
            updateTable();         
            // console.log(updatedItem)
            currentRec=updatedItem
            document.getElementById("PurchRec_ReferDoc").value = updatedItem.ReferDoc


            // Scroll to the last row after updating the table
            const tableBody = document.getElementById('ListPurchBody'); 
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

            highlightRow(lastRow, 'ListPurchBody');

        }

        
    } catch (error) {
        console.error('Update PurchRec error:', error);
    }
}

let nTotalQty = 0;
let nTotalOrd = 0;
let nTotalPrc = 0;
let nTotalSel = 0;

function updateItemTable(refreshOnly=false) {
    // let nTotalQty = 0;
    // let nTotalOrd = 0;
    // let nTotalPrc = 0;
    // let nTotalSel = 0;

    const ListPurcItem=document.getElementById('ListPurcItem')
    // Map through itemsDtl and build rows while accumulating totals
    const listTable = itemsDtl.map((item, index) => {
        // Accumulate totals inside the map
        nTotalQty += item.Quantity || 0;
        nTotalOrd += item.POQty___ || 0;
        nTotalPrc += item.Quantity * item.ItemPrce || 0;
        nTotalSel += item.Quantity * item.SellPrce || 0;
        return `
            <tr data-index="${index}">
                <td class="colNoWrap">${item.UsersCde || 'N/A'}</td>
                <td class="colNoWrap">${item.OtherCde || 'N/A'}</td>
                <td class="colNoWrap">${item.Descript.substring(0,30) || 'N/A'}</td>
                <td style="text-align: center">${item.POQty___.toFixed(0) || 'N/A'}</td>
                <td style="text-align: center">${item.Quantity.toFixed(0) || 'N/A'}</td>
                <td style="text-align: right">${formatter.format(item.ItemPrce) || 'N/A'}</td>
                <td style="text-align: right">${formatter.format(item.Quantity * item.ItemPrce) || 'N/A'}</td>
                <td style="text-align: right">${formatter.format(item.SellPrce) || 'N/A'}</td>
                <td style="text-align: right">${formatter.format(item.Quantity * item.SellPrce) || 'N/A'}</td>
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
                    <td style="text-align: center">${nTotalOrd.toFixed(0) || 'N/A'}</td>
                    <td style="text-align: center">${nTotalQty.toFixed(0) || 'N/A'}</td>
                    <td></td>
                    <td style="text-align: right">${formatter.format(nTotalPrc) || 'N/A'}</td>
                    <td></td>
                    <td style="text-align: right">${formatter.format(nTotalSel) || 'N/A'}</td>
                </tr>
            </tfoot>
`

    ListPurcItem.innerHTML = listTable+listFooter; // Update the tbody with new rows
    document.getElementById('printStockReceiving').disabled = false
    document.getElementById('ListPurcItem').addEventListener('click', async (event) => {
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
                    const deleted_ = await deletePurchDtl(itemsDtl[index].RecordId,globalData[currentIndex].CtrlNum_,index)
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

                highlightRow(row, '.PurchDtlTable');
    
                // Optionally, call your edit function if needed
                const index = parseInt(row.getAttribute('data-index'));
                if (!isNaN(index) && index >= 0) {
                    if (refreshOnly) return;
                    PurchDtl(index, true); // Pass only the index to your form
                }
            }
        }
    });
    
}


document.getElementById('purchFilter').addEventListener('click', async () => {
    try {
        FiltrRec('PurchLst').then(() => {
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

            PurchLst(dDateFrom,dDate__To,cLocation,cReferDoc) //Calling Main PurchRec List
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
    }
});

function PurchDtl(index,editMode) {
    const itemsDtlForm = document.createElement('form');
    itemsDtlForm.id = "items-form";
    itemsDtlForm.style.display = "none";  // Start with it hidden

    const itemData = itemsDtl[index];
    itemsDtlForm.innerHTML = `
        <div id="titleBar">Stock Receiving Detail Form</div>
        <div class="inputSection">
            <br>
            <div class="subTextDiv" id="inputDetails">
                <div class="textDiv">
                    <div class="subTextDiv">
                        <label for="PurchRec_UsersCde">Stock No</label>
                        <input type="text" id="PurchRec_UsersCde" name="UsersCde" spellcheck="false" 
                            placeholder="Type Stock No. or Bar Code here to search"
                            autocomplete = "off">
                    </div>
                    <div class="subTextDiv">
                        <label for="PurchRec_OtherCde">Bar Code</label>
                        <input type="text" id="PurchRec_OtherCde" name="OtherCde" spellcheck="false" readonly>
                    </div>
                </div>

                <div id="inputDescript" class="textDiv">
                    <div class="subTextDiv" style="width:100%;">
                        <label for="PurchRec_Descript">Item Description</label>
                        <input type="text" id="PurchRec_Descript" name="Descript" readonly>
                    </div>
                </div>
                <div class="textDiv">
                    <div class="subTextDiv">
                        <label for="PurchRec_Quantity">Qty. Rcv</label>
                        <input type="number" id="PurchRec_Quantity" name="Quantity">
                    </div>
                    <div class="subTextDiv">
                        <label for="PurchRec_POQty___">Qty. Ord</label>
                        <input type="number" id="PurchRec_POQty___" name="POQty___">
                    </div>
                    <div class="subTextDiv">
                        <label for="PurchRec_ItemPrce">Unit Net Cost</label>
                        <input type="number" id="PurchRec_ItemPrce" name="ItemPrce">
                    </div>
                    <div class="subTextDiv">
                        <label for="PurchRec_SellPrce">Unit Net Selling Price</label>
                        <input type="number" id="PurchRec_SellPrce" name="SellPrce">
                    </div>
                </div>
            </div>
            
            <div class="btnDiv">
                <button type="submit" id="savePurchDtlBtn" class="saveBtn"><i class="fa fa-save"></i>  Save</button>
                <button type="button" id="cancelPurchDtlBtn" class="cancelBtn"><i class="fa fa-close"></i>  Close</button>
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

    document.getElementById('PurcForm').appendChild(itemsDtlForm);
    document.getElementById('PurcForm').appendChild(overlay);


    itemsDtlForm.style.display = 'flex'
    makeDraggable(itemsDtlForm, titleBar)


    if (editMode) {
        document.getElementById('PurchRec_UsersCde').value=itemData.UsersCde
        document.getElementById('PurchRec_OtherCde').value=itemData.OtherCde
        document.getElementById('PurchRec_Descript').value=itemData.Descript
        document.getElementById('PurchRec_Quantity').value=itemData.Quantity
        document.getElementById('PurchRec_POQty___').value=itemData.POQty___
        document.getElementById('PurchRec_ItemPrce').value=itemData.ItemPrce
        document.getElementById('PurchRec_SellPrce').value=itemData.SellPrce
        document.getElementById('PurchRec_Quantity').focus()
    } else {
        document.getElementById('PurchRec_UsersCde').value=''
        document.getElementById('PurchRec_OtherCde').value=''
        document.getElementById('PurchRec_Descript').value=''
        document.getElementById('PurchRec_Quantity').value=1
        document.getElementById('PurchRec_POQty___').value=1
        document.getElementById('PurchRec_ItemPrce').value=0.00
        document.getElementById('PurchRec_SellPrce').value=0.00
        document.getElementById('PurchRec_UsersCde').focus()

    }
    document.getElementById('PurchRec_OtherCde').readonly = true;
    document.getElementById('PurchRec_Descript').readonly = true;
    document.getElementById('PurchRec_ItemPrce').setAttribute('tabindex', '-1');
    document.getElementById('PurchRec_SellPrce').setAttribute('tabindex', '-1');
    document.getElementById('PurchRec_OtherCde').setAttribute('tabindex', '-1');
    document.getElementById('PurchRec_Descript').setAttribute('tabindex', '-1');

    // Get the id's of the elements for checkEmptyValue() function before saving
    const UsersCde=document.getElementById('PurchRec_UsersCde')
    const Quantity=document.getElementById('PurchRec_Quantity')
    // const ItemPrce=document.getElementById('PurchRec_ItemPrce')
    
    document.getElementById('PurchRec_UsersCde').addEventListener('input', debounce(async () => {
        const otherDetails = { 
            cItemCode: '',
            nLandCost: 0
        }
        await chkUsersCde(editMode, 'PurchRec', otherDetails)        
        cItemCode=otherDetails.cItemCode
        nLandCost=otherDetails.nLandCost
    }, 300));  // 300ms delay (you can adjust the delay as needed)
    
    document.getElementById('savePurchDtlBtn').addEventListener('click', async (e) => {
        e.preventDefault()
    
        if (!checkEmptyValue(UsersCde,Quantity)) {
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
                editPurchDtl(index,cCtrlNum_,itemData.RecordId,cItemCode,nLandCost)
        } else {
            const nQuantity=document.getElementById('PurchRec_Quantity').value
            const nPOQty___=document.getElementById('PurchRec_POQty___').value
            const nItemPrce=document.getElementById('PurchRec_ItemPrce').value
            const nSellPrce=document.getElementById('PurchRec_SellPrce').value
            const cSuffixId='ES'

            addPurchDtl(cCtrlNum_,cItemCode,nQuantity,nPOQty___,nItemPrce,nSellPrce,nLandCost,cSuffixId)
        }
        document.getElementById('items-form').remove()
        document.getElementById('modal-overlay').remove();
    })

    document.getElementById('cancelPurchDtlBtn').addEventListener('click', () => {
        document.getElementById('items-form').remove()
        document.getElementById('modal-overlay').remove();
    })
}

async function editPurchDtl(index,cCtrlNum_,cRecordId,cItemCode,nLandCost) {
    document.getElementById('loadingIndicator').style.display = 'flex';

    const nQuantity=document.getElementById('PurchRec_Quantity').value
    const nPOQty___=document.getElementById('PurchRec_POQty___').value
    const nItemPrce=document.getElementById('PurchRec_ItemPrce').value
    const nSellPrce=document.getElementById('PurchRec_SellPrce').value

    // console.log([cRecordId,cItemCode,nQuantity,nItemPrce,nDiscRate,nAmount__,nLandCost])

    try {
        const response = await fetch('http://localhost:3000/purchases/editPurchDetail', {
            method: 'PUT',  
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cRecordId: cRecordId,
                cItemCode: cItemCode,
                nQuantity: nQuantity,
                nPOQty___: nPOQty___,
                nItemPrce: nItemPrce,
                nSellPrce: nSellPrce,
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
            showNotification('Stock Receiving record updated successfully!')
            // console.log(updatedItem)
            updatePurchTotals(cCtrlNum_) // Update PURCHREC Header
        }

    } catch (error) {
        console.error("Error processing editPurchDetail:", error);
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

// exported to Functlib for addScanCode() function
export async function addPurchDtl(cCtrlNum_,cItemCode,nQuantity,nPOQty___,nItemPrce,nSellPrce,nLandCost,cSuffixId) {
    
    document.getElementById('loadingIndicator').style.display = 'flex';
    
    const nQtyGood_ = 1
    const nQtyBad__ = 0

    try {
        const response = await fetch('http://localhost:3000/purchases/addPurchDetail', {
            method: 'POST',  
            headers: {
                'Content-Type': 'application/json'  // Specify JSON format
            },
            body: JSON.stringify({
                cCtrlNum_: cCtrlNum_,
                cItemCode: cItemCode,
                nQuantity: nQuantity,
                nPOQty___: nPOQty___,
                nQtyGood_: nQtyGood_,
                nQtyBad__: nQtyBad__,
                nItemPrce: nItemPrce,
                nSellPrce: nSellPrce,
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
            showNotification('Stock Receiving Item record added successfully!')

            updatePurchTotals(updatedItem.CtrlNum_) // Update PURCHREC Header

            setTimeout(() => {
                const tableBody = document.getElementById('ListPurcItem'); 
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
                            highlightRow(lastRow, 'ListPurcItem');
                        }
                    }
                }
            }, 100); // Small delay to ensure table updates first

        }

    } catch (error) {
        console.error("Error processing addPurchDetail:", error);
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

async function updatePurchTotals(cCtrlNum_) {
    const headerTotals=[
        calcTotalQty(),
        calcTotalCos(),
        calcTotalSel(),
        calcTotalCnt()
    ]
    const res = await fetch('http://localhost:3000/purchases/updatePurchTotals', {
        method: 'PUT',  
        headers: {
            'Content-Type': 'application/json'  // Specify JSON format
        },
        body: JSON.stringify({
            cCtrlNum_: cCtrlNum_,
            nTotalQty: headerTotals[0],
            nTotalCos: headerTotals[1],
            nTotalSRP: headerTotals[2],
            nNoOfItem: headerTotals[3]
        })
    });

    const editTotals = await res.json()
    globalData[currentIndex] = editTotals
    updateTable()
    function calcTotalQty() {
        return itemsDtl.reduce((total, item) => total + parseInt(item.Quantity, 10), 0);
    }
    function calcTotalCos() {
        return itemsDtl.reduce((total, item) => total + parseFloat(item.Quantity*item.ItemPrce), 0).toFixed(2);
    }            
    function calcTotalSel() {
        return itemsDtl.reduce((total, item) => total + parseFloat(item.Quantity*item.SellPrce), 0).toFixed(2);
    }            
    function calcTotalCnt() {
        return itemsDtl.length
    }            

}


document.addEventListener('DOMContentLoaded', () => {
    const liPurchLstMenu = document.querySelectorAll('.StockReceiving');
    const purchLstFileDiv = document.getElementById('PurchLst');
    const purcFormFileDiv = document.getElementById('PurcForm');
    const closePurchRec = document.getElementById('closePurchRec');
    const closePurchDtl = document.getElementById('closePurchDtl');
    const addPurchRec = document.getElementById('addPurchRec'); 
    const addPurchDtl = document.getElementById('addPurchDtl');

    addPurchRec.addEventListener('click', () => {
        document.getElementById('purchDtlCounter').innerText=''
        editRecMode = false
        PurcForm();
    });
    addPurchDtl.addEventListener('click', () => {
        PurchDtl();
    });

    closePurchRec.addEventListener('click', () => {
        purchLstFileDiv.classList.remove('active');
    });
    closePurchDtl.addEventListener('click', () => {
        purcFormFileDiv.classList.remove('active');
        showReport('PurchLst')
    });

    // Add event listener to each element with the necessary arguments
    liPurchLstMenu.forEach(element => {
        element.addEventListener('click', () => {
            showReport('PurchLst')
        });
    });

});

async function deletePurchDtl(cRecordId,cCtrlNum_,index) {
    // console.log('cRecordId',cRecordId,'cCtrlNum_',cCtrlNum_)
    const stockDtlCounter=document.getElementById('stockDtlCounter')
    try {
        const response = await fetch(`http://localhost:3000/purchases/deletePurchDetail/${encodeURIComponent(cRecordId)}`, {
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
        showNotification('PurchDtl deleted successfully');
        // Remove the item from the itemsDtl array
        itemsDtl.splice(index, 1);
        updateItemTable(true)
        stockDtlCounter.innerHTML=`${itemsDtl.length} Records`
        updatePurchTotals(cCtrlNum_) // Update PURCHREC Header        
        return true;
    } catch (error) {
        console.error('Delete PurchDtl error:', error);
        alert('An error occurred while trying to delete the record.');
        return false;
    }
}


document.getElementById('printStockReceiving').addEventListener('click', async () => {
    const cReferDoc=document.getElementById('PurchRec_ReferDoc').value
    const cRemarks_=document.getElementById('PurchRec_Remarks_').value
    const dDate____=document.getElementById('PurchRec_Date____').value
    const cDRNum___=document.getElementById('PurchRec_DRNum___').value
    const dDR__Date=document.getElementById('PurchRec_DR__Date').value
    const cPONum___=document.getElementById('PurchRec_PONum___').value
    const dPODate__=document.getElementById('PurchRec_PODate__').value
    
    const cLocation=document.getElementById('PurchRec_Location')
    const cSuppNum_=document.getElementById('PurchRec_SuppNum_')
    const cLocaName = cLocation.options[cLocation.selectedIndex].text;
    const cSuppName = cSuppNum_.options[cSuppNum_.selectedIndex].text;

    const headerData = [
        `Ref. No.     : ${cReferDoc}`,
        `Supplier : ${cSuppName.trim()}`,
        `DR No - Date : ${cDRNum___.trim()} - ${formatDate(dDR__Date,'MM/DD/YYYY')}`,
        `Location : ${cLocaName.trim()}`,
        `Date Received: ${formatDate(dDate____,'MM/DD/YYYY')}`,
        `PO No. - Date: ${cPONum___.trim()} - ${formatDate(dPODate__,'MM/DD/YYYY')}`,
        `Remarks: ${cRemarks_.substring(1,36).trim()}`,
        ''
    ];
    const colWidths = [26, 26, 76, 14, 12, 20, 20]; // Adjust widths as needed
    const columns = ['Stock No.','Bar Code','Item Description','PO Qty','RR Qty','Unit Price','Ext. Price'];
    const itemFields = [
        'UsersCde',  // Field from item
        'OtherCde',  // Field from item
        'Descript',  // Field from item
        'POQty___',  
        'Quantity',  
        'SellPrce',  
        (item, formatter) => formatter.format(item.Quantity * item.SellPrce)  
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
    const createTotals = [false,false,true,true,true,false,true]
    const totalsValue = [null,null,'Totals:',nTotalOrd,nTotalQty,null,nTotalSel]

    printFormPDF(headerData, itemsDtl, itemFields, createTotals, totalsValue ,colWidths, 
        columns, fieldTypes, window.base64Image, ['letter','portrait'], formatter, 'Stock Receiving Report')
});


document.getElementById('PurchRec_ScanCode').addEventListener('paste', async () =>{
    await addScanCode('PurchRec',currentRec);
})

// Event listener with debounce
document.getElementById('PurchRec_ScanCode').addEventListener('input', debounce(async () => {
    await addScanCode('PurchRec',currentRec);
}, 300));  

document.getElementById('printPurcListXLS').addEventListener('click', () => {
    const filterData = JSON.parse(localStorage.getItem("filterData"));

    const dDateFrom = filterData[0];
    const dDate__To = filterData[1];

    const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDate__To,'MM/DD/YYYY')}`
    const titleRowsContent = [
        { text: 'REGENT TRAVEL RETAIL GROUP', style: { fontWeight: 'bold', fontSize: 14 } },
        { text: 'Stock Receiving List', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
        { text: dateRange, style: { fontStyle: 'italic', fontSize: 12 } },
        { text: '' } // Spacer row
    ];

    
    const colWidths = [
        { width: 12 },{ width: 12 },{ width: 12 },{ width: 20 },{ width: 24 },
        { width: 18 },{ width: 16 },{ width: 18 },{ width: 12 },{ width: 10 },
        { width: 20 },{ width: 20 },{ width: 10 },{ width: 20 },{ width: 10 },
        { width: 12 },
    ];

    const columnConfig = [
        {label: 'Ctrl. No,', getValue: row => row.CtrlNum_, type: 'string', align: 'left' },
        {label: 'Ref. No.',getValue: row => row.ReferDoc,type: 'string', align: 'left'},
        {label: 'Date',getValue: row => row.Date____,type: 'datetime',align: 'left'},
        {label: 'Location',getValue: row => row.LocaName, type: 'string',align: 'left'},
        {label: 'Supplier',getValue: row => row.SuppName, type: 'string',align: 'left'},
        {label: 'DR No.',getValue: row => row.DRNum___, type: 'string',align: 'left',},
        {label: 'DR Date',getValue: row => row.DR__Date,type: 'datetime',align: 'left'},
        {label: 'PO No.',getValue: row => row.PONum___, type: 'string',align: 'left'},
        {label: 'PO Date',getValue: row => row.PODate__,type: 'datetime',align: 'left',totalLabel: 'TOTALS:'},
        {label: 'Qty.',getValue: row => +row.TotalQty,
                total: rows => rows.reduce((sum, r) => sum + (+r.TotalQty || 0), 0),
                align: 'center',type: 'integer',cellFormat: '#,##0'},
        {label: 'Amount',getValue: row => +row.Amount__,
            total: rows => rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0),
            align: 'right',cellFormat: '#,##0.00'},
        {label: 'SRP',getValue: row => +row.TotalSRP,
            total: rows => rows.reduce((sum, r) => sum + (+r.TotalSRP || 0), 0),
            align: 'right',cellFormat: '#,##0.00'},
        {label: 'Items',getValue: row => +row.NoOfItem,
                total: rows => rows.reduce((sum, r) => sum + (+r.NoOfItem || 0), 0),
                align: 'center',type: 'integer',cellFormat: '#,##0'},
        {label: 'Remarks',getValue: row => row.Remarks_,type: 'string',align: 'left'},
        {label: 'Encoder',getValue: row => row.Encoder_, type: 'string',align: 'left'},
        {label: 'Log Date',getValue: row => row.Log_Date,type: 'datetime',align: 'left'},

    ];
    
    const titleRows = generateTitleRows(columnConfig, titleRowsContent, 0);
    
    printReportExcel(globalData, columnConfig, colWidths, titleRows, 'Stock Receiving List', 2);
})
