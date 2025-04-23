import { showReport, formatDate, populateLocation, populateSuppNum_, showNotification, debounce, MessageBox, 
    formatter, checkEmptyValue, highlightRow, chkUsersCde, addScanCode} from '../FunctLib.js';
import { FiltrRec } from "../FiltrRec.js"
import { printFormPDF } from "../PrintRep.js"

let globalData = [];    // Define a global array
let itemsDtl = [];      // RecordSet of PURCHDTL
let currentRec = [];    // Current selected PURCHREC record
let currentIndex = 0    // Index of the selected PURCHREC record

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
      
        updateTable() //Render Purch Transfer List

    } catch (error) {
        console.error('Fetch error:', error);
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

function updateTable() {
    const reportBody = document.getElementById('purchRecList');
    reportBody.innerHTML = ''; // Clear previous content


    const listTable = `
        <div id="tableDiv">
        <table id="ListPurchTable">
            <thead id="Look_Up_Head">
                <tr>
                    <th>Control No</th>
                    <th>Ref. Doc</th>
                    <th>Date</th>
                    <th>Supplier</th>
                    <th>DR No.</th>
                    <th>DR Date</th>
                    <th>PO No.</th>
                    <th>PO Date</th>
                    <th>Total Qty.</th>
                    <th>Amount</th>
                    <th>Items</th>
                    <th>Remarks</th>
                    <th>Location</th>
                    <th>Encoder</th>
                    <th>Log Date</th>
                </tr>
            </thead>
            <tbody id="ListPurchBody">
                ${globalData.map((data, index) => `
                    <tr id="trStocList" data-index="${index}" style="${data.Disabled ? 'color: darkgray;' : ''}">
                        <td>${data.CtrlNum_ || 'N/A'}</td>
                        <td class="colNoWrap">${data.ReferDoc || 'N/A'}</td>
                        <td>${formatDate(data.Date____) || 'N/A'}</td>
                        <td class="colNoWrap">${data.SuppName || 'N/A'}</td>
                        <td class="colNoWrap">${data.DRNum___ || 'N/A'}</td>
                        <td>${formatDate(data.DR__Date) || 'N/A'}</td>
                        <td class="colNoWrap">${data.PONum___ || 'N/A'}</td>
                        <td>${formatDate(data.PODate__) || 'N/A'}</td>
                        <td style="text-align: center">${data.TotalQty.toFixed(0) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(data.Amount__) || 'N/A'}</td>
                        <td style="text-align: center">${data.NoOfItem.toFixed(0) || 'N/A'}</td>
                        <td class="colNoWrap">${data.Remarks_ || 'N/A'}</td>
                        <td class="colNoWrap">${data.LocaName || 'N/A'}</td>
                        <td>${data.Encoder_ || 'N/A'}</td>
                        <td>${formatDate(data.Log_Date) || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </div>
    `;

    reportBody.innerHTML = listTable;
    document.getElementById('ListPurchBody').addEventListener('click', (event) => {
        const row = event.target.closest('tr'); // Find the clicked row
        if (row) {

            highlightRow(row, '#ListPurchTable');
            // Optionally, call your edit function if needed
            const index = parseInt(row.getAttribute('data-index'));
            currentIndex = index
            if (!isNaN(index) && index >= 0 && index < globalData.length) {
                // console.log(`Row clicked for index: ${index}`);
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
                <div class="textDiv">
                    <div>
                        <label for="PurchRec_SuppNum_">Supplier</label>
                        <select id="PurchRec_SuppNum_"></select>
                    </div>
                </div>
                <div class="textDiv">
                    <div>
                        <label for="PurchRec_ReferDoc">Ref. No</label>
                        <input type="text" id="PurchRec_ReferDoc" spellcheck="false" readonly>
                    </div>
                </div>
                <div class="textDiv">
                    <div>
                        <label for="PurchRec_Date____">Date Received</label>
                        <input type="date" id="PurchRec_Date____">
                    </div>
                </div>
            </div>

            <div id="inputPurch2" class="textDiv">
                <div class="textDiv">
                    <div>
                        <label for="PurchRec_Location">Location</label>
                        <select id="PurchRec_Location"></select>
                    </div>
                </div>
                <div class="textDiv">
                    <div>
                        <label for="PurchRec_DRNum___">DR No.</label>
                        <input type="text" id="PurchRec_DRNum___" spellcheck="false">
                    </div>
                </div>
                <div class="textDiv">
                    <div>
                        <label for="PurchRec_DR__Date">DR Date</label>
                        <input type="date" id="PurchRec_DR__Date">
                    </div>
                </div>
            </div>

            <div id="inputPurch3" class="textDiv">
                <div class="textDiv">
                    <div>
                        <label for="PurchRec_Remarks_">Location</label>
                        <input type="text" id="PurchRec_Remarks_" spellcheck="false">
                    </div>
                </div>
                <div class="textDiv">
                    <div>
                        <label for="PurchRec_PONum___">PO No.</label>
                        <input type="text" id="PurchRec_PONum___" spellcheck="false">
                    </div>
                </div>
                <div class="textDiv">
                    <div>
                        <label for="PurchRec_PODate__">DR Date</label>
                        <input type="date" id="PurchRec_PODate__">
                    </div>
                </div>
            </div>

        </div>


        <div class="itemsTableDiv" id="itemsTableDiv";>
            <table class="PurchDtlTable">
                <thead id="ListItemHead">
                    <tr>
                        <th>Stock No.</th>
                        <th>Bar Code</th>
                        <th>Item Description</th>
                        <th>PO Qty.</th>
                        <th>RR Qty.</th>
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

        // document.getElementById('PurchRec_Disabled').checked=itemData.Disabled ? true : false

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

            updateItemTable();  // Render items using <tr>

    
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            document.getElementById('loadingIndicator').style.display = 'none';
        }
    } else {
        // Triggered from +Add button Footer
        const dNew_Date= new Date()
        document.getElementById('PurchRec_Date____').value=formatDate(dNew_Date,'YYYY-MM-DD')
        document.getElementById('PurchRec_DateRcvd').value=formatDate(dNew_Date,'YYYY-MM-DD')
        document.getElementById('PurchRec_ReferDoc').value='New Record'
        document.getElementById('PurchRec_Remarks_').value=''
        itemsDtl = []; 
        updateItemTable();
        
    }
}


document.getElementById('savePurchRecBtn').addEventListener('click', () => {
    const stockDtlCounter=document.getElementById('stockDtlCounter').innerText
    const cWhseFrom=document.getElementById('PurchRec_WhseFrom').value
    const cWhseTo__=document.getElementById('PurchRec_WhseTo__').value
    const cRemarks_=document.getElementById('PurchRec_Remarks_').value
    const dDate____=document.getElementById('PurchRec_Date____').value
    const dDateRcvd=document.getElementById('PurchRec_DateRcvd').value
    const cPrepared=document.getElementById('PurchRec_Prepared').value
    const cReceived=document.getElementById('PurchRec_Received').value
    const lDisabled=document.getElementById('PurchRec_Disabled').checked ? 1 : 0 

    if (!cWhseFrom) {
        document.getElementById('PurchRec_WhseFrom').focus();
        document.getElementById('PurchRec_WhseFrom').classList.add('invalid');  // Add a class to highlight
        return ;
    }
    if (!cWhseTo__) {
        document.getElementById('PurchRec_WhseTo__').focus();
        document.getElementById('PurchRec_WhseTo__').classList.add('invalid');  // Add a class to highlight
        return ;
    }

    if (stockDtlCounter) {

        editPurchRec(currentRec.CtrlNum_, cWhseFrom, cWhseTo__, dDate____, dDateRcvd, cRemarks_, cPrepared, cReceived, lDisabled)

    } else {
        const cCtrlNum_='NEW_CTRLID'
        const cEncoder_='Willie'
        const cSuffixId='S'
        const dLog_Date=new Date()
        const nNoOfItem=0
        
        if (addPurchRec(cCtrlNum_, cWhseFrom, cWhseTo__, dDate____, dDateRcvd, cRemarks_, cEncoder_,
            dLog_Date, nNoOfItem, cPrepared, cReceived, cSuffixId)) {
            document.getElementById("addPurchDtl").disabled = false;
            document.getElementById("PurchRec_ScanCode").disabled = false;
    
        }
    }
});


document.getElementById('cancelPurchRecBtn').addEventListener('click', () => {
    showReport('PurchLst')  
});

async function editPurchRec(cCtrlNum_, cWhseFrom, cWhseTo__, dDate____, dDateRcvd, cRemarks_, cPrepared, cReceived ,lDisabled) {

    lDisabled = document.getElementById("PurchRec_Disabled").checked ? '1' : '0';

    try {
        const response = await fetch('http://localhost:3000/purchases/editPurchHeader', {
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
            showNotification('PurchRec record edited successfully!')
            globalData[currentIndex]=updatedItem;
            updateTable();         
        }

        
    } catch (error) {
        console.error('Update PurchRec error:', error);
    }
}


async function addPurchRec(cCtrlNum_, cWhseFrom, cWhseTo__, dDate____, dDateRcvd, cRemarks_, cEncoder_,
    dLog_Date, nNoOfItem, cPrepared, cReceived, cSuffixId) {
    // console.log(cCtrlNum_, cWhseFrom, cWhseTo__, dDate____, dDateRcvd, cRemarks_, cEncoder_,
    //     dLog_Date, nNoOfItem, cPrepared, cSuffixId)
    try {
        const response = await fetch('http://localhost:3000/purchases/addPurchHeader', {
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

function updateItemTable(refreshOnly=false) {
    let nTotalQty = 0;
    let nTotalOrd = 0;
    let nTotalSel = 0;

    const ListPurcItem=document.getElementById('ListPurcItem')
    // Map through itemsDtl and build rows while accumulating totals
    const listTable = itemsDtl.map((item, index) => {
        // Accumulate totals inside the map
        nTotalQty += item.Quantity || 0;
        nTotalOrd += item.POQty___ || 0;
        nTotalSel += item.Quantity * item.SellPrce || 0;
        return `
            <tr data-index="${index}">
                <td class="colNoWrap">${item.UsersCde || 'N/A'}</td>
                <td class="colNoWrap">${item.OtherCde || 'N/A'}</td>
                <td class="colNoWrap">${item.Descript.substring(0,30) || 'N/A'}</td>
                <td style="text-align: center">${item.POQty___.toFixed(0) || 'N/A'}</td>
                <td style="text-align: center">${item.Quantity.toFixed(0) || 'N/A'}</td>
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
                    <td style="text-align: right">${formatter.format(nTotalSel) || 'N/A'}</td>
                </tr>
            </tfoot>
`

    ListPurcItem.innerHTML = listTable+listFooter; // Update the tbody with new rows

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
                if (!isNaN(index) && index >= 0 && index < globalData.length) {
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
                        <label for="PurchRec_UsersCde">Purch No</label>
                        <input type="text" id="PurchRec_UsersCde" name="UsersCde" spellcheck="false" 
                            placeholder="Type Purch No. or Bar Code here to search"
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
                        <label for="PurchRec_Quantity">Qty. Out</label>
                        <input type="number" id="PurchRec_Quantity" name="Quantity">
                    </div>
                    <div class="subTextDiv">
                        <label for="PurchRec_QtyRecvd">Qty. In</label>
                        <input type="number" id="PurchRec_QtyRecvd" name="QtyRecvd">
                    </div>
                    <div class="subTextDiv">
                        <label for="PurchRec_Amount__">Net Amount</label>
                        <input type="number" id="PurchRec_Amount__" name="Amount__">
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

    document.getElementById('StocForm').appendChild(itemsDtlForm);
    document.getElementById('StocForm').appendChild(overlay);
    itemsDtlForm.style.display = 'flex'


    if (editMode) {
        document.getElementById('PurchRec_UsersCde').value=itemData.UsersCde
        document.getElementById('PurchRec_OtherCde').value=itemData.OtherCde
        document.getElementById('PurchRec_Descript').value=itemData.Descript
        document.getElementById('PurchRec_Quantity').value=itemData.Quantity
        document.getElementById('PurchRec_QtyRecvd').value=itemData.QtyRecvd
        document.getElementById('PurchRec_Amount__').value=itemData.Amount__
        document.getElementById('PurchRec_Quantity').focus()
    } else {
        document.getElementById('PurchRec_UsersCde').value=''
        document.getElementById('PurchRec_OtherCde').value=''
        document.getElementById('PurchRec_Descript').value=''
        document.getElementById('PurchRec_Quantity').value=1
        document.getElementById('PurchRec_QtyRecvd').value=1
        document.getElementById('PurchRec_Amount__').value=0.00
        document.getElementById('PurchRec_UsersCde').focus()

    }
    document.getElementById('PurchRec_Amount__').readonly = true;
    document.getElementById('PurchRec_OtherCde').readonly = true;
    document.getElementById('PurchRec_Descript').readonly = true;
    document.getElementById('PurchRec_Amount__').setAttribute('tabindex', '-1');
    document.getElementById('PurchRec_OtherCde').setAttribute('tabindex', '-1');
    document.getElementById('PurchRec_Descript').setAttribute('tabindex', '-1');

    // Get the id's of the elements for checkEmptyValue() function before saving
    const UsersCde=document.getElementById('PurchRec_UsersCde')
    const Quantity=document.getElementById('PurchRec_Quantity')
    const Amount__=document.getElementById('PurchRec_Amount__')
    
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
    
        if (!checkEmptyValue(UsersCde,Quantity,Amount__)) {
            return;  // If any field is empty, stop here and do not proceed
        }
        if (editMode) {
            cItemCode = cItemCode == null ? itemData.ItemCode : cItemCode;
            nLandCost = nLandCost == null ? itemData.LandCost : nLandCost;
        }
        if (cItemCode==null) {
            document.getElementById('modal-overlay').style.display='none';
            MessageBox('Invalid record.\n Purch No. is not found.', 'Ok,Close', 'Alert Message')
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
            const nQtyRecvd=document.getElementById('PurchRec_QtyRecvd').value
            const nAmount__=document.getElementById('PurchRec_Amount__').value
            const cSuffixId='ES'

            addPurchDtl(cCtrlNum_,cItemCode,nQuantity,nQtyRecvd,nAmount__,nLandCost,cSuffixId)
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
    const nQtyRecvd=document.getElementById('PurchRec_QtyRecvd').value
    const nAmount__=document.getElementById('PurchRec_Amount__').value

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
            showNotification('Purch Transfer Item record updated successfully!')
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
export async function addPurchDtl(cCtrlNum_,cItemCode,nQuantity,nQtyRecvd,nAmount__,nLandCost,cSuffixId) {
    document.getElementById('loadingIndicator').style.display = 'flex';
    
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
            showNotification('Purch Transfer Item record added successfully!')

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
        calcTotalRcv(),
        calcTotalAmt(),
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
    const liPurchLstMenu = document.querySelectorAll('.StockReceiving');
    const purchLstFileDiv = document.getElementById('PurchLst');
    const purcFormFileDiv = document.getElementById('PurcForm');
    const closePurchRec = document.getElementById('closePurchRec');
    const closePurchDtl = document.getElementById('closePurchDtl');
    const addPurchRec = document.getElementById('addPurchRec'); 
    const addPurchDtl = document.getElementById('addPurchDtl');

    addPurchRec.addEventListener('click', () => {
        document.getElementById('purchDtlCounter').innerText=''
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
    const dDateRcvd=document.getElementById('PurchRec_DateRcvd').value
    const cPrepared=document.getElementById('PurchRec_Prepared').value
    const cReceived=document.getElementById('PurchRec_Received').value
    
    const cWhseFrom=document.getElementById('PurchRec_WhseFrom')
    const cWhseTo__=document.getElementById('PurchRec_WhseTo__')
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
    const columns = ['Purch No.','Bar Code','Item Description','Qty.Out','Qty.In','Unit Price','Ext. Price'];
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
        columns, fieldTypes, window.base64Image, ['letter','portrait'], formatter, 'Purch Transfer')
});


document.getElementById('PurchRec_ScanCode').addEventListener('paste', async () =>{
    await addScanCode('PurchRec',currentRec);
})

// Event listener with debounce
document.getElementById('PurchRec_ScanCode').addEventListener('input', debounce(async () => {
    await addScanCode('PurchRec',currentRec);
}, 300));  



