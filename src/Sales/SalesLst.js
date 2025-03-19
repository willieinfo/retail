import { showReport, formatDate, populateLocation, showNotification, get24HrTime, 
    MessageBox, formatter, checkEmptyValue, validateField, highlightRow} from '../FunctLib.js';
import { FiltrRec } from "../FiltrRec.js"

let globalData = [];    // Define a global array
let itemsDtl = [];      // RecordSet of SALESDTL
let currentRec = [];    // Current selected SALESREC record
let currentIndex = 0    // Index of the selected SALESREC record

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
    const reportBody = document.getElementById('salesInvoice');
    reportBody.innerHTML =''

    const salesDtlCounter=document.getElementById('salesDtlCounter')
    const itemData = globalData[index];
    currentRec = globalData[index];

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
                <tbody id="ListItemBody"></tbody>
            </table>
        </div>  
    `    
    // <div style="display: flex; width: 20%; background-color: blue; overflow: hidden;">
    //     <div style="position: fixed; display: flex; flex-wrap: wrap; padding: 10px; background-color: red; ">
    //         <button>Button 1</button>
    //         <button>Button 1</button>
    //         <button>Button 1</button>
    //         <button>Button 1</button>
    //     </div>
    // </div>

    document.getElementById('SalesLst').classList.remove('active')
    showReport('SaleForm')

    await populateLocation('', '','SellArea', 'SaleLoca');

    if (editMode) {
        document.getElementById('loadingIndicator').style.display = 'flex';

        const cCtrlNum_=itemData.CtrlNum_
        document.getElementById('ReferDoc').value=itemData.ReferDoc
        document.getElementById('DateFrom').value=formatDate(itemData.DateFrom,'YYYY-MM-DD')
        document.getElementById('Remarks_').value=itemData.Remarks_
        document.getElementById('CustName').value=itemData.CustName


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

document.getElementById('saveSalesRecBtn').addEventListener('click', () => {
    
    const salesDtlCounter=document.getElementById('salesDtlCounter').innerText
    const cLocation=document.getElementById('SaleLoca').value
    const cRemarks_=document.getElementById('Remarks_').value
    const dDateFrom=document.getElementById('DateFrom').value
    const cCustName=document.getElementById('CustName').value


    if (!cLocation) {
        document.getElementById('SaleLoca').focus();
        document.getElementById('SaleLoca').classList.add('invalid');  // Add a class to highlight
        return ;
    }

    if (salesDtlCounter) {
        editSalesRec(currentRec.CtrlNum_, cLocation, dDateFrom, cRemarks_, cCustName)

    } else {
        const cCtrlNum_='NEW_CTRLID'
        const cEncoder_='Willie'
        const cSuffixId='E'
        const dLog_Date=new Date()
        const nNoOfItem=0
        
        if (addSalesRec(cCtrlNum_, cLocation, dDateFrom, cRemarks_, cEncoder_,
            dLog_Date, nNoOfItem, cCustName, cSuffixId)) {
            showReport('SalesLst')  //Show back SalesRec List
        }
    }
});


document.getElementById('cancelSalesRecBtn').addEventListener('click', () => {
    showReport('SalesLst')  
});

async function editSalesRec(cCtrlNum_, cLocation, dDateFrom, cRemarks_, cCustName) {
    // console.log(cCtrlNum_, cLocation, dDateFrom, cRemarks_, cCustName)
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
                cCustName: cCustName
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

    const ListItemBody=document.getElementById('ListItemBody')
    // Map through itemsDtl and build rows while accumulating totals
    const listTable = itemsDtl.map((item, index) => {
        // Accumulate totals inside the map
        nTotalQty += item.Quantity || 0;
        nTotalPrc += item.Quantity * item.ItemPrce || 0;
        nTotalDsc += (item.Quantity * (item.ItemPrce - item.Amount__)) || 0;
        nTotalAmt += item.Quantity * item.Amount__ || 0;
        return `
            <tr id="trLocaList" data-index="${index}">
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

    ListItemBody.innerHTML = listTable+listFooter; // Update the tbody with new rows

    document.getElementById('ListItemBody').addEventListener('click', async (event) => {
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
                        <input type="text" id="UsersCde" name="UsersCde" spellcheck="false" 
                            placeholder="Type Stock No. or Bar Code here to search">
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
        console.log('This is edit mode')
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
    let cItemCode=null  
    let nLandCost=0
    document.getElementById('UsersCde').addEventListener('blur', async (e) => {
        e.preventDefault()
        
        if (!UsersCde.value) {
            UsersCde.focus();
            return;
        }
        const dataItemList = await validateField('UsersCde', 'http://localhost:3000/product/checkUsersCde',
            '', true)

        if (dataItemList) {
            // if (dataItemList.length > 0) {
            // } else {
            // }
            document.getElementById('UsersCde').value=dataItemList[0].UsersCde;
            document.getElementById('OtherCde').value=dataItemList[0].OtherCde;
            document.getElementById('Descript').value=dataItemList[0].Descript;

            if (!editMode) {
                document.getElementById('ItemPrce').value=dataItemList[0].ItemPrce;
                document.getElementById('Amount__').value=dataItemList[0].ItemPrce;
            }

            nLandCost=dataItemList[0].LandCost;
            cItemCode=dataItemList[0].ItemCode;
        }
    })

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
            addSalesDtl(cCtrlNum_,dDate____,cItemCode,nLandCost)
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

    console.log([cRecordId,cItemCode,nQuantity,nItemPrce,nDiscRate,nAmount__,nLandCost])

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

async function addSalesDtl(cCtrlNum_,dDate____,cItemCode,nLandCost) {
    document.getElementById('loadingIndicator').style.display = 'flex';

    const nQuantity=document.getElementById('Quantity').value
    const nItemPrce=document.getElementById('ItemPrce').value
    const nDiscRate=document.getElementById('DiscRate').value
    const nAmount__=document.getElementById('Amount__').value
    const cTimeSale=get24HrTime()

    // console.log([cCtrlNum_,cItemCode,dDate____,cTimeSale,nQuantity,nItemPrce,nDiscRate,nAmount__,nLandCost])

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
                const tableBody = document.getElementById('ListItemBody'); 
                if (tableBody) {
                    const rows = tableBody.getElementsByTagName('tr'); // Get all <tr> in tbody
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
                    }
                }
            }, 100); // Small delay to ensure table updates first
            highlightRow(lastRow, 'ListItemBody')

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

    // const printInvoice= confirm('Print Sales Invoice?');
    // if (printInvoice===false) return
    
    // Collect the header data
    const headerData = [
        `Location: ${currentRec.LocaName}`,
        `Ref. No.: ${currentRec.ReferDoc}`,
        `OR Date: ${formatDate(currentRec.DateFrom,'MM/DD/YYYY')}`,
        `Customer: ${currentRec.CustName}`,
        `Remarks: ${currentRec.Remarks_}`
    ];

    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    // You can set format to 'letter', 'a4', or 'a3' and orientation to 'portrait' or 'landscape'
    const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' }); 
    
    const pageMargin = 10; // Page margin (left, top, right, bottom)
    const lineHeight = 6; // Line height for content - ideal 8
    const itemLineHeight = 4; // Line height for items
    const startY = 20; // Start Y position for the content
    const reportFont='Helvetica'

    let currentY = startY;
    let pageNum = 1

    // const logoBase64 = "InfoPlus.png/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."; 
    // doc.addImage(logoBase64, 'PNG', 10, 10, 20, 20);

    const img = new Image();
    img.src = "InfoPlus.png"; // Path to your local image
    img.onload = function () {
        // Add the image once it's loaded
        doc.addImage(img, 'PNG', 10, 10, 20, 20);
    }

    // Add the header to the PDF
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const title = "FASHION RETAIL APP";
    const titleWidth = doc.getTextWidth(title);
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const titleX = (pageWidth - titleWidth) / 2;  // Center the text

    // Draw the background rectangle (Gray color)
    doc.setFillColor(200, 200, 200); // RGB for gray
    doc.rect(titleX - 2, currentY - 5, titleWidth + 4, lineHeight + 2, 'F');
    
    // Draw the centered text
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.text(title, titleX, currentY);

    currentY += lineHeight;
    doc.setTextColor(0,0,255);
    headerData.forEach((line, index) => {
        doc.text(line, pageMargin, currentY);
        currentY += lineHeight;
    });

    doc.setTextColor(0,0,0);
    createLine()

    doc.setFontSize(8);
    doc.setFont(reportFont, "normal");

    const colWidths = [10, 20, 26, 60, 20, 20, 20, 20]; // Adjust widths as needed
    const rowHeight = 6; // Row height
    let currentX = 10;
    showTableHeader()
    
    itemsDtl.forEach(item => {
        if (currentY + itemLineHeight > doc.internal.pageSize.height - pageMargin) {

            doc.line(pageMargin, currentY, currentX, currentY); // Horizontal bottom line for last row on page
            showPageNum()

            // If we reach the bottom of the page, add a new page
            doc.addPage();
            currentY = startY;  // Reset 

            pageNum++
            showPageNum()

            doc.setFont(reportFont, "bold");
            showTableHeader()
            doc.setFont(reportFont, "normal");

        }

        let itemRow = [
            item.Quantity.toFixed(0),
            item.UsersCde,
            item.OtherCde,
            item.Descript.substring(0, 30),
            formatter.format(item.ItemPrce),
            formatter.format(item.Quantity * item.ItemPrce),
            formatter.format(item.Quantity * (item.ItemPrce - item.Amount__)),
            formatter.format(item.Quantity * item.Amount__)
        ];
    
        currentX = 10; // Reset X for each row
        itemRow.forEach((text, i) => {
            // doc.text(text, currentX + 2, currentY + 4); // Add text inside
            let textX = currentX + 2; // Default left alignment
            if ([0, 4, 5, 6, 7].includes(i)) { // Align right for numeric columns (Qty, Unit Price, Gross, Discount, Net)
                textX = currentX + colWidths[i] - 2; // Adjust to the right within the column
                doc.text(text, textX, currentY + 4, { align: 'right' });
            } else {
                doc.text(text, textX, currentY + 4, { align: 'left' });
            }
            doc.line(currentX, currentY, currentX, currentY + rowHeight); 
            currentX += colWidths[i];
        });
    
        doc.line(currentX, currentY, currentX, currentY + rowHeight);
        currentY += rowHeight; // Move to the next row
    });

    // BOTTOM PAGE
    doc.line(pageMargin, currentY, currentX, currentY); // Horizontal bottom line for last row on page

    // Add totals at the bottom of the page
    const totals = {
        totalQty: itemsDtl.reduce((sum, item) => sum + item.Quantity, 0),
        totalPrice: itemsDtl.reduce((sum, item) => sum + item.Quantity * item.ItemPrce, 0),
        totalDiscount: itemsDtl.reduce((sum, item) => sum + item.Quantity * (item.ItemPrce - item.Amount__), 0),
        totalAmount: itemsDtl.reduce((sum, item) => sum + item.Quantity * item.Amount__, 0)
    };

    doc.setFontSize(8);
    doc.setFont(reportFont, "bold");

    // Align totals dynamically
    let totalX = 10; // Start at left margin

    colWidths.forEach((width, i) => {
        if ([0, 5, 6, 7].includes(i)) { // Only sum columns: Qty, Gross, Discount, Net
            let textValue;
            if (i === 0) {
                textValue = totals.totalQty.toFixed(0); // Total Quantity (no formatting)
            } else {
                const totalValues = [totals.totalPrice, totals.totalDiscount, totals.totalAmount];
                textValue = formatter.format(totalValues[i - 5]); // Correct index mapping
            }

            doc.setFont("helvetica", "bold");
            doc.text(textValue, totalX + 2, currentY + rowHeight, { align: 'right' });
        }
        totalX += width ; // Move to next column
    });

    // colWidths.forEach((width, i) => {
    //     if ([0, 5, 6, 7].includes(i)) { // Only sum columns: Qty, Gross, Discount, Net
    //         let textValue;
    //         if (i === 0) {
    //             textValue = totals.totalQty.toFixed(0); // Total Quantity (no formatting)
    //         } else {
    //             const totalValues = [totals.totalPrice, totals.totalDiscount, totals.totalAmount];
    //             textValue = formatter.format(totalValues[i - 5]); // Correct index mapping
    //         }
    
    //         doc.setFont("helvetica", "bold");
    
    //         // Calculate right-aligned X position inside the column
    //         let textX = currentX + width - doc.getTextWidth(textValue) - 2; 
    
    //         doc.text(textValue, textX, currentY + rowHeight);
    //     }
    //     currentX += width; // Move to next column
    // });

    // Draw a final line to separate totals
    doc.line(pageMargin, currentY + rowHeight + 2, totalX, currentY + rowHeight + 2); 

    showPageNum()

    // Save or print the document
    // doc.save('Sales Invoice.pdf');

    // document.querySelector('.pdfReport').src = doc.output('datauristring');
    doc.output('dataurlnewwindow','Sales Invoice.pdf');


    function showTableHeader() {
        const columns = ['Qty', 'Stock No.', 'Bar Code', 'Item Description', 'Unit Price', 'Gross', 'Discount', 'Net'];

        currentX = 10; // **Reset

        // Draw the header row
        const totalWidth = colWidths.reduce((sum, width) => sum + width, 0);
        doc.setFillColor(200, 200, 200); // Gray background for headers
        doc.rect(10, currentY, totalWidth, rowHeight, "F"); // Full header width
        
        columns.forEach((header, i) => {
            doc.rect(currentX, currentY, colWidths[i], rowHeight); // **Draw full grid for header**
            doc.text(header, currentX + 2, currentY + 4);
            currentX += colWidths[i];
        });
        currentY += rowHeight;
    }

    function createLine() {
        currentY += lineHeight;
        doc.setDrawColor(0);  // Black line
        doc.line(pageMargin-2, currentY-3, doc.internal.pageSize.width - pageMargin, currentY-3); 
        // currentY += lineHeight;
    }

    function showPageNum() {
        doc.setFont(reportFont, "normal");
        currentY += lineHeight;
        doc.text('Page: '+String(pageNum), pageMargin, pageHeight-5)
    }
});

