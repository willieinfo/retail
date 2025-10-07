import { showReport, showNotification, formatter, formatDate, startTimer, debounce} from '../FunctLib.js';
import { printFormPDF, printReportExcel, generateTitleRows } from "../PrintRep.js"
import { FiltrRec, displayErrorMsg } from "../FiltrRec.js"

let cCompName = ''
window.addEventListener('CompNameLoaded', () => {
    cCompName = window.CompName;
});

const divStockDetails =`
    <div id="StockDetails" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Stock Transfer Report by Reference No.</span>
            <div class='showRemaining'>
                <button class="fetchDataMore"></button>
                <button id="closeTra1" class="closeForm">✖</button>
            </div>
        </div>
        <div class="ReportBody">
            <div id="transStockDetails" class="ReportBody">
                <table>
                    <thead>
                        <tr>
                            <th>Ref. No.</th>
                            <th>Stock Out -From</th>
                            <th>Stock In -To</th>
                            <th>Remarks</th>
                            <th>Stock No.</th>
                            <th>Bar Code</th>
                            <th>Description</th>
                            <th>Remarks</th>
                            <th>Unit Price</th>
                            <th>Unit Cost</th>
                            <th>Date Transfer</th>
                            <th>Qty. Out</th>
                            <th>Prepared</th>
                            <th>Date Received</th>
                            <th>Qty. In</th>
                            <th>Received</th>
                        </tr>
                    </thead>
                </table>            
            </div>
            <details class="showFilterScope" style="display: none">
                <summary>Report Scope</summary>
                <div id="pStockDetails" class='filterLists'></div>
            </details>

            <div id="transDetailsChart" class="chartContainer">
                <div id="topBrand">
                    <h5 id='h5topBran'>Top Brands</h5>
                    <canvas id="transChart1"></canvas>
                </div>
                <div id="topClass">
                    <h5 id='h5topType'>Top Classifications</h5>
                    <canvas id="transChart2"></canvas>
                </div>
            </div>
        </div>
        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <span id="transCounter1" class="recCounter"></span>
                <button id="printStockDetailsPDF" disabled><i class="fa fa-file-pdf"></i> PDF</button>
                <button id="printStockDetailsXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="transBtn1"><i class="fa fa-list"></i> List</button>
            </div>
        </div>
    </div>
`
const divStockClass =`
    <div id="StockClass" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Stock Transfer Report by Classification</span>
            <button id="closeTra2" class="closeForm">✖</button>
        </div>
        <div class="ReportBody">
            <div id="transStockClass" class="ReportBody">
                <table>
                    <thead>
                        <tr>
                            <th>Stock Out -From</th>
                            <th>Stock In -To</th>
                            <th>Classification</th>
                            <th>Qty. Out</th>
                            <th>Tot Amt Out</th>
                            <th>Tot Cost Out</th>
                            <th>Qty. In</th>
                            <th>Tot Amt In</th>
                            <th>Tot Cost In</th>
                        </tr>
                    </thead>
                </table>            
            </div>
            <details class="showFilterScope" style="display: none">
                <summary>Report Scope</summary>
                <div id="pStockClass" class='filterLists'></div>
            </details>

            <div id="transClassChart" class="chartContainer">
                <div id="topClass">
                    <h5>Top Classifications</h5>
                    <canvas id="transChart3"></canvas>
                </div>
            </div>
        </div>
        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <span id="transCounter2" class="recCounter"></span>
                <button id="printStockClassPDF" disabled><i class="fa fa-file-pdf"></i> PDF</button>
                <button id="printStockClassXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="transBtn2"><i class="fa fa-list"></i> List</button>
            </div>
        </div>
    </div>
`
const divStockSKU =`
    <div id="StockSKU" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Stock Transfer Report by SKU</span>
            <button id="closeTra3" class="closeForm">✖</button>
        </div>
        <div class="ReportBody">
            <div id="transStockSKU" class="ReportBody">
                <table>
                    <thead>
                        <tr>
                            <th>Stock Out -From</th>
                            <th>Stock In -To</th>
                            <th>Stock No.</th>
                            <th>Bar Code</th>
                            <th>Description</th>
                            <th>Brand</th>
                            <th>Classification</th>
                            <th>Qty. Out</th>
                            <th>Tot Amt Out</th>
                            <th>Tot Cost Out</th>
                            <th>Qty. In</th>
                            <th>Tot Amt In</th>
                            <th>Tot Cost In</th>
                        </tr>
                    </thead>
                </table>            
            </div>
            <details class="showFilterScope" style="display: none">
                <summary>Report Scope</summary>
                <div id="pStockSKU" class='filterLists'></div>
            </details>

            <div id="transSKUChart" class="chartContainer">
                <div id="topBrand">
                    <h5 id='h5topBran'>Top Brands</h5>
                    <canvas id="transChart4"></canvas>
                </div>
                <div id="topClass">
                    <h5 id='h5topType'>Top Classifications</h5>
                    <canvas id="transChart5"></canvas>
                </div>0
            </div>
        </div>
        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <span id="transCounter3" class="recCounter"></span>
                <button id="printStockSKUPDF" disabled><i class="fa fa-file-pdf"></i> PDF</button>
                <button id="printStockSKUXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="transBtn3"><i class="fa fa-list"></i> List</button>
            </div>
        </div>
    </div>
`
const fragment = document.createDocumentFragment();

const div1 = document.createElement('div');
div1.innerHTML = divStockDetails;
fragment.appendChild(div1);

const div2 = document.createElement('div');
div2.innerHTML = divStockClass;
fragment.appendChild(div2);

const div3 = document.createElement('div');
div3.innerHTML = divStockSKU;
fragment.appendChild(div3);

document.body.appendChild(fragment);  

document.addEventListener('DOMContentLoaded', () => {
    const menuReportElements = document.querySelectorAll('.stockSKU'); //<li>
    const rankRepoDiv = document.getElementById('StockSKU');
    const closeRepo = document.getElementById('closeTra3');

    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

    menuReportElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('StockSKU')
        });
    });

});


document.addEventListener('DOMContentLoaded', () => {
    const menuReportElements = document.querySelectorAll('.stockClass'); //<li>
    const rankRepoDiv = document.getElementById('StockClass');
    const closeRepo = document.getElementById('closeTra2');

    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

    menuReportElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('StockClass')
        });
    });

});

document.addEventListener('DOMContentLoaded', () => {
    const menuReportElements = document.querySelectorAll('.stockDetails'); //<li>
    const rankRepoDiv = document.getElementById('StockDetails');
    const closeRepo = document.getElementById('closeTra1');

    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

    menuReportElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('StockDetails')
        });
    });

});

// ========================================
let existingData = [];  
let currentPage = 0
let remainingData = null
let data = null;

async function StockTraDetails(dDateFrom, dDateTo__, cReferDoc, cLocaFrom, cLocaTo__, 
    cUsersCde, cOtherCde, cDescript, cBrandNum, cCategNum, cItemType, cItemDept) {
    
    document.getElementById('loadingIndicator').style.display = 'flex';
    let { timerInterval, elapsedTime } = startTimer(); 

    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/transfers/StockTransfer');
        const params = new URLSearchParams();
        if (dDateFrom) params.append('DateFrom', dDateFrom); 
        if (dDateTo__) params.append('DateTo__', dDateTo__); 
        if (cReferDoc) params.append('ReferDoc', cReferDoc);
        if (cLocaFrom) params.append('LocaFrom', cLocaFrom); 
        if (cLocaTo__) params.append('LocaTo__', cLocaTo__); 
        if (cUsersCde) params.append('UsersCde', cUsersCde); 
        if (cOtherCde) params.append('OtherCde', cOtherCde); 
        if (cDescript) params.append('Descript', cDescript); 
        if (cBrandNum) params.append('BrandNum', cBrandNum); 
        if (cCategNum) params.append('CategNum', cCategNum); 
        if (cItemType) params.append('ItemType', cItemType); 
        if (cItemDept) params.append('ItemDept', cItemDept); 

        const cRepoType = 'TranRefe';
        params.append('RepoType', cRepoType);

        // Pass the "page" parameter for pagination
        params.append('page', currentPage);
        currentPage += 1

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Parse the response JSON
        data = await response.json();

        const { data: records, totalRecords } = data;  // Destructure response for clarity
        existingData = [...existingData, ...records]; 
        remainingData = totalRecords - existingData.length;

        // Update the counter with the fetched data length
        const listCounter = document.getElementById('transCounter1');
        listCounter.innerHTML = (existingData.length === totalRecords) ? `${existingData.length} Records` 
            : `${existingData.length} of ${totalRecords} Records`;


        const fetchDataMoreButton = document.querySelector('.fetchDataMore');
        if (records <= 0) {
            fetchDataMoreButton.style.display = 'none'

        } else {
            // Calculate remaining data
            fetchDataMoreButton.style.display = 'block'
            fetchDataMoreButton.innerHTML = `<i class="fa fa-list"></i>  ${remainingData} remaining records`;

            if (remainingData <= 0) {
                fetchDataMoreButton.style.display = 'none'
            }
        }

        // Process the data for totals (e.g., sum of quantities and amounts)
        let nTotalQty = 0;
        let nTotalRcv = 0;
        let nTotalCos = 0;
    
        // Update the table with the records
        const reportBody = document.getElementById('transStockDetails');
        reportBody.style.maxHeight = "80%";
        reportBody.innerHTML = '';  // Clear previous content

        const reportTable = `
            <table>
                <thead>
                    <tr>
                        <th>Ref. No.</th>
                        <th>Date Transfer</th>
                        <th class="tdDataOut" >Stock Out -From</th>
                        <th class="tdData_In" >Stock In -To</th>
                        <th>Remarks</th>
                        <th>Stock No.</th>
                        <th>Bar Code</th>
                        <th>Description</th>
                        <th>Unit Price</th>
                        <th>Unit Cost</th>
                        <th class="tdDataOut" >Qty. Out</th>
                        <th class="tdDataOut" >Prepared</th>
                        <th class="tdData_In" >Date Received</th>
                        <th class="tdData_In" >Qty. In</th>
                        <th class="tdData_In" >Received</th>
                    </tr>
                </thead>
                <tbody>
                    ${existingData.map((item, index) => {
                        nTotalQty += item.Quantity;
                        nTotalRcv += item.QtyRecvd;
                        nTotalCos += item.LandCost;

                        const isSameReferDoc = index > 0 && existingData[index - 1].ReferDoc === item.ReferDoc;
                        const referDocDisplay = isSameReferDoc ? '' : item.ReferDoc || 'N/A';
                        const showDateTran = new Date(item.Date____).toLocaleDateString() === '1/1/1900' 
                            || !item.Date____ ? '' : formatDate(item.Date____, 'MM/DD/YYYY') || 'N/A';
                        const showDateRcvd = new Date(item.DateRcvd).toLocaleDateString() === '1/1/1900' 
                            || !item.DateRcvd ? '' : formatDate(item.DateRcvd, 'MM/DD/YYYY') || 'N/A';

                        return `
                            <tr style="color: ${item.Outright === 2 ? 'rgb(7, 130, 130)' : 'black'}">
                                <td style="font-weight: bold">${referDocDisplay}</td>
                                <td style="text-align: center">${showDateTran}</td>
                                <td class="tdDataOut colNoWrap">${item.LocaFrom || 'N/A'}</td>
                                <td class="tdData_In colNoWrap">${item.LocaTo__ || 'N/A'}</td>
                                <td class="colNoWrap">${item.Remarks_ || 'N/A'}</td>
                                <td class="colNoWrap">${item.UsersCde || 'N/A'}</td>
                                <td class="colNoWrap">${item.OtherCde || 'N/A'}</td>
                                <td class="colNoWrap">${item.Descript.substring(0, 30) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.LandCost) || 'N/A'}</td>
                                <td class="tdDataOut" style="text-align: center">${item.Quantity || 'N/A'}</td>
                                <td class="tdDataOut colNoWrap">${item.Prepared || 'N/A'}</td>
                                <td class="tdData_In" style="text-align: center">${showDateRcvd}</td>
                                <td class="tdData_In" style="text-align: center">${item.QtyRecvd || 'N/A'}</td>
                                <td class="tdData_In colNoWrap">${item.Received || 'N/A'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr style="font-weight: bold">
                        <td></td>
                        <td></td>
                        <td class="tdDataOut" ></td>
                        <td class="tdData_In" ></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td style="text-align: right">Total:</td>
                        <td class="tdDataOut" style="text-align: center">${nTotalQty || 'N/A'}</td>
                        <td class="tdDataOut"></td>
                        <td class="tdData_In"></td>
                        <td class="tdData_In" style="text-align: center">${nTotalRcv || 'N/A'}</td>
                        <td class="tdData_In"></td>
                    </tr>
                </tfoot>
            </table>
        `;
        reportBody.innerHTML = reportTable;
        if (nTotalQty===0) {
            document.querySelectorAll('.tdDataOut').forEach( e => {
                e.style.display = 'none'
            })
        }
        if (nTotalRcv===0) {
            document.querySelectorAll('.tdData_In').forEach( e => {
                e.style.display = 'none'
            })
        }

        // Show report chart
        document.getElementById('transDetailsChart').style.display='flex';
        StockChart(existingData,'Details1')
        StockChart(existingData,'Details2')
        // document.getElementById('printStockDetailsPDF').disabled = false
        document.getElementById('printStockDetailsXLS').disabled = false

    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error, 'Fetch error');
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent = '';
    }

    // Print report to Excel
    document.getElementById('printStockDetailsXLS').addEventListener('click', () => {

        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        const titleRowsContent = [
            { text: cCompName, style: { fontWeight: 'bold', fontSize: 14 } },
            { text: 'Stock Transfer By Reference No.', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
            { text: dateRange, style: { fontStyle: 'italic', fontSize: 12 } },
            { text: '' } // Spacer row
          ];
          
          const colWidths = [
              { width: 14 },{ width: 12 },{ width: 26 },{ width: 26 },{ width: 36 }, 
              { width: 20 },{ width: 20 },{ width: 30 },{ width: 15 },{ width: 15 }, 
              { width: 10 },{ width: 20 },{ width: 12 },{ width: 10 },{ width: 12 }        
          ];
      
          const columnConfig = [
              {label: 'Ref. No.',getValue: row => row.ReferDoc,type: 'string',align: 'left'},
              {label: 'Date Transfer',getValue: row => +row.Date____,
                align: 'center',type: 'datetime'
              },
              {label: 'Stock Out -From',getValue: row => row.LocaFrom,type: 'string',align: 'left'},
              {label: 'Stock In -To',getValue: row => row.LocaTo__,type: 'string',align: 'left'},
              {label: 'Remarks',getValue: row => row.Remarks_,type: 'string',align: 'left'},
              {label: 'Stock No.',getValue: row => row.UsersCde,type: 'string',align: 'left'},
              {label: 'Bar Code.',getValue: row => row.OtherCde,type: 'string',align: 'left'},
              {label: 'Description',getValue: row => row.Descript.substring(0,30),type: 'string',align: 'left'},

              {label: 'Amount',getValue: row => +row.Amount__,
                total: rows => rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'Cost',getValue: row => +(row.LandCost),
                total: rows => rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'Quantity',getValue: row => +(row.Quantity),
                total: rows => rows.reduce((sum, r) => sum + (+r.Quantity || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'Prepared',getValue: row => row.Prepared,type: 'string',align: 'left'},
              {label: 'Date Received',getValue: row => +row.DateRcvd,
                align: 'center',type: 'datetime'
              },
              {label: 'Received',getValue: row => row.Received,type: 'string',align: 'left'},
          ];
          
        const titleRows = generateTitleRows(columnConfig, titleRowsContent, 0);
        printReportExcel(existingData, columnConfig, colWidths, titleRows, 'Stock Transfer By Ref. No.');
    })

}

document.querySelector('.fetchDataMore').addEventListener('click', async () => {
        const filterData = JSON.parse(localStorage.getItem("filterData"));

        // console.log(filterData)
        const dDateFrom = filterData[0];
        const dDate__To = filterData[1];
        // const cWhseFrom = filterData[2];
        const cUsersCde = filterData[3];
        const cOtherCde = filterData[4];
        const cDescript = filterData[5];
        const cBrandNum = filterData[6];
        const cCategNum = filterData[7];
        const cItemType = filterData[8];
        const cItemDept = filterData[9];
        const cReferDoc = filterData[10];
        const cLocaFrom = filterData[17];
        const cLocaTo__ = filterData[18];

        debounce(StockTraDetails(dDateFrom,dDate__To,cReferDoc,cLocaFrom,cLocaTo__,
            cUsersCde, cOtherCde, cDescript, cBrandNum, cCategNum, cItemType, cItemDept
         ),300 )
})


document.getElementById('transBtn1').addEventListener('click', async () => {
    try {
        
        // Global reset
        existingData = [];  
        data = null
        currentPage = 0

        FiltrRec('StockDetails').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));

            // console.log(filterData)
            const dDateFrom = filterData[0];
            const dDate__To = filterData[1];
            // const cWhseFrom = filterData[2];
            const cUsersCde = filterData[3];
            const cOtherCde = filterData[4];
            const cDescript = filterData[5];
            const cBrandNum = filterData[6];
            const cCategNum = filterData[7];
            const cItemType = filterData[8];
            const cItemDept = filterData[9];
            const cReferDoc = filterData[10];
            const cLocaFrom = filterData[17];
            const cLocaTo__ = filterData[18];

            StockTraDetails(dDateFrom,dDate__To,cReferDoc,cLocaFrom,cLocaTo__,
                cUsersCde, cOtherCde, cDescript, cBrandNum, cCategNum, cItemType, cItemDept ) 

            getFilters(filterData,'pStockDetails')
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
    }
});

// ========================================
async function StockTraClass(dDateFrom,dDateTo__,cReferDoc,cLocaFrom,cLocaTo__,
    cUsersCde, cOtherCde, cDescript, cBrandNum, cCategNum, cItemType, cItemDept ) {

    document.getElementById('loadingIndicator').style.display = 'flex';
    let { timerInterval, elapsedTime } = startTimer(); 
    let data = null;
    
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/transfers/StockTransfer');
        const params = new URLSearchParams();
        if (dDateFrom) params.append('DateFrom', dDateFrom); 
        if (dDateTo__) params.append('DateTo__', dDateTo__); 
        if (cReferDoc) params.append('ReferDoc', cReferDoc);
        if (cLocaFrom) params.append('LocaFrom', cLocaFrom); 
        if (cLocaTo__) params.append('LocaTo__', cLocaTo__); 
        if (cUsersCde) params.append('UsersCde', cUsersCde); 
        if (cOtherCde) params.append('OtherCde', cOtherCde); 
        if (cDescript) params.append('Descript', cDescript); 
        if (cBrandNum) params.append('BrandNum', cBrandNum); 
        if (cCategNum) params.append('CategNum', cCategNum); 
        if (cItemType) params.append('ItemType', cItemType); 
        if (cItemDept) params.append('ItemDept', cItemDept); 
        
        const cRepoType = 'TranClas'
        params.append('RepoType', cRepoType)

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        let nTotalQty = 0
        let nTotalRcv = 0
        let nTotAmtOu = 0
        let nTotAmtIn = 0
        let nTotCosOu = 0
        let nTotCosIn = 0
    
        const listCounter=document.getElementById('transCounter2')
        data = await response.json();
        listCounter.innerHTML=`${data.length} Records`;
        showNotification(`${data.length} Records fetched`);
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

        const mainReportDiv = document.getElementById('StockClass');
        mainReportDiv.classList.add('active');

        const reportBody = document.getElementById('transStockClass');
        reportBody.style.maxHeight = "80%";
        reportBody.innerHTML = '';  // Clear previous content

        // Define the table structure
        const reportTable = `
            <table>
                <thead>
                    <tr>
                        <th class="tdDataOut">Stock Out -From</th>
                        <th class="tdData_In">Stock In -To</th>
                        <th>Classification</th>
                        <th class="tdDataOut">Qty. Out</th>
                        <th class="tdDataOut">Tot Amt Out</th>
                        <th class="tdDataOut">Tot Cost Out</th>
                        <th class="tdData_In">Qty. In</th>
                        <th class="tdData_In">Tot Amt In</th>
                        <th class="tdData_In">Tot Cost In</th>
                    </tr>
                </thead>
            <tbody>
                ${data.map((item, index) => {
                    nTotalQty+=item.TotalQty
                    nTotalRcv+=item.TotalRcv
                    nTotAmtOu+=item.TotAmtOu
                    nTotAmtIn+=item.TotAmtIn
                    nTotCosOu+=item.TotCosOu
                    nTotCosIn+=item.TotCosIn

                    // Compare current item with previous item to see if data is the same
                    const isSameData = index > 0 && data[index - 1].LocaFrom+data[index - 1].LocaTo__ === item.LocaFrom+item.LocaTo__;

                    // If the current data the same as the previous one, don't show it again
                    const locaFromDisplay = isSameData ? '' : item.LocaFrom || 'N/A';
                    const locaTo__Display = isSameData ? '' : item.LocaTo__ || 'N/A';
                    
                    return `
                        <tr>
                            <td class="tdDataOut colNoWrap">${locaFromDisplay}</td>
                            <td class="tdData_In colNoWrap">${locaTo__Display}</td>
                            <td style="font-weight: bold">${item.TypeDesc}</td>
                            <td class="tdDataOut" style="text-align: center">${item.TotalQty || 'N/A'}</td>
                            <td class="tdDataOut" style="text-align: right">${formatter.format(item.TotAmtOu) || 'N/A'}</td>
                            <td class="tdDataOut" style="text-align: right">${formatter.format(item.TotCosOu) || 'N/A'}</td>
                            <td class="tdData_In" style="text-align: center">${item.TotalRcv || 'N/A'}</td>
                            <td class="tdData_In" style="text-align: right">${formatter.format(item.TotAmtIn) || 'N/A'}</td>
                            <td class="tdData_In" style="text-align: right">${formatter.format(item.TotCosIn) || 'N/A'}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
            <tfoot>
                <tr style="font-weight: bold">
                    <td class="tdDataOut" ></td>
                    <td class="tdData_In" ></td>

                    <td style="text-align: right">Total:</td>
                    <td class="tdDataOut" style="text-align: center">${nTotalQty || 'N/A'}</td>
                    <td class="tdDataOut" style="text-align: right">${formatter.format(nTotAmtOu) || 'N/A'}</td>
                    <td class="tdDataOut" style="text-align: right">${formatter.format(nTotCosOu) || 'N/A'}</td>

                    <td class="tdData_In" style="text-align: center">${nTotalRcv || 'N/A'}</td>
                    <td class="tdData_In" style="text-align: right">${formatter.format(nTotAmtIn) || 'N/A'}</td>
                    <td class="tdData_In" style="text-align: center">${formatter.format(nTotCosIn) || 'N/A'}</td>
                </tr>
            </tfoot>
        </table>
        `;
        
        // Add the table HTML to the div
        reportBody.innerHTML =  reportTable;
        if (nTotalQty===0) {
            document.querySelectorAll('.tdDataOut').forEach( e => {
                e.style.display = 'none'
            })
        }
        if (nTotalRcv===0) {
            document.querySelectorAll('.tdData_In').forEach( e => {
                e.style.display = 'none'
            })
        }

        // Show report chart
        document.getElementById('transClassChart').style.display='flex';
        StockChart(data,'TypeDesc')
        // StockChart(data,'Details2')
        // document.getElementById('printStockDetailsPDF').disabled = false
        // document.getElementById('printStockDetailsXLS').disabled = false

        
    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error,'Fetch error')
    } finally {
        // Hide loading spinner once data is fetched or an error occurs
        document.getElementById('loadingIndicator').style.display = 'none';
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

    }


}

document.getElementById('transBtn2').addEventListener('click', async () => {
    try {
        FiltrRec('StockClass').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));

            // console.log(filterData)
            const dDateFrom = filterData[0];
            const dDate__To = filterData[1];
            // const cWhseFrom = filterData[2];
            const cUsersCde = filterData[3];
            const cOtherCde = filterData[4];
            const cDescript = filterData[5];
            const cBrandNum = filterData[6];
            const cCategNum = filterData[7];
            const cItemType = filterData[8];
            const cItemDept = filterData[9];
            const cReferDoc = filterData[10];
            const cLocaFrom = filterData[17];
            const cLocaTo__ = filterData[18];

            StockTraClass(dDateFrom,dDate__To,cReferDoc,cLocaFrom,cLocaTo__,
                cUsersCde, cOtherCde, cDescript, cBrandNum, cCategNum, cItemType, cItemDept ) ;

            getFilters(filterData,'pStockClass')
            
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
    }
});

// ========================================
async function StockTraSKU(dDateFrom,dDateTo__,cReferDoc,cLocaFrom,cLocaTo__,
    cUsersCde, cOtherCde, cDescript, cBrandNum, cCategNum, cItemType, cItemDept ) {

    document.getElementById('loadingIndicator').style.display = 'flex';
    let { timerInterval, elapsedTime } = startTimer(); 
    let data = null;
    
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/transfers/StockTransfer');
        const params = new URLSearchParams();
        if (dDateFrom) params.append('DateFrom', dDateFrom); 
        if (dDateTo__) params.append('DateTo__', dDateTo__); 
        if (cReferDoc) params.append('ReferDoc', cReferDoc);
        if (cLocaFrom) params.append('LocaFrom', cLocaFrom); 
        if (cLocaTo__) params.append('LocaTo__', cLocaTo__); 
        if (cUsersCde) params.append('UsersCde', cUsersCde); 
        if (cOtherCde) params.append('OtherCde', cOtherCde); 
        if (cDescript) params.append('Descript', cDescript); 
        if (cBrandNum) params.append('BrandNum', cBrandNum); 
        if (cCategNum) params.append('CategNum', cCategNum); 
        if (cItemType) params.append('ItemType', cItemType); 
        if (cItemDept) params.append('ItemDept', cItemDept); 
        
        const cRepoType = 'TranStoc'
        params.append('RepoType', cRepoType)

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        let nTotalQty = 0
        let nTotalRcv = 0
        let nTotAmtOu = 0
        let nTotAmtIn = 0
        let nTotCosOu = 0
        let nTotCosIn = 0
    
        const listCounter=document.getElementById('transCounter3')
        data = await response.json();
        listCounter.innerHTML=`${data.length} Records`;
        showNotification(`${data.length} Records fetched`);
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

        const mainReportDiv = document.getElementById('StockSKU');
        mainReportDiv.classList.add('active');

        const reportBody = document.getElementById('transStockSKU');
        reportBody.style.maxHeight = "80%";
        reportBody.innerHTML = '';  // Clear previous content

        // Define the table structure
        const reportTable = `
            <table>
                <thead>
                    <tr>
                        <th class="tdDataOut">Stock Out -From</th>
                        <th class="tdData_In">Stock In -To</th>
                            <th>Stock No.</th>
                            <th>Bar Code</th>
                            <th>Description</th>
                            <th>Brand</th>
                            <th>Classification</th>
                        <th class="tdDataOut">Qty. Out</th>
                        <th class="tdDataOut">Tot Amt Out</th>
                        <th class="tdDataOut">Tot Cost Out</th>
                        <th class="tdData_In">Qty. In</th>
                        <th class="tdData_In">Tot Amt In</th>
                        <th class="tdData_In">Tot Cost In</th>
                    </tr>
                </thead>
            <tbody>
                ${data.map((item, index) => {
                    nTotalQty+=item.TotalQty
                    nTotalRcv+=item.TotalRcv
                    nTotAmtOu+=item.TotAmtOu
                    nTotAmtIn+=item.TotAmtIn
                    nTotCosOu+=item.TotCosOu
                    nTotCosIn+=item.TotCosIn

                    // Compare current item with previous item to see if data is the same
                    const isSameData = index > 0 && data[index - 1].LocaFrom+data[index - 1].LocaTo__ === item.LocaFrom+item.LocaTo__;

                    // If the current data the same as the previous one, don't show it again
                    const locaFromDisplay = isSameData ? '' : item.LocaFrom || 'N/A';
                    const locaTo__Display = isSameData ? '' : item.LocaTo__ || 'N/A';
                    
                    return `
                        <tr>
                            <td class="tdDataOut colNoWrap">${locaFromDisplay}</td>
                            <td class="tdData_In colNoWrap">${locaTo__Display}</td>
                            <td class= "colNoWrap" style="font-weight: bold">${item.UsersCde || 'N/A'}</td>
                            <td class="colNoWrap">${item.OtherCde || 'N/A'}</td>
                            <td class="colNoWrap">${item.Descript.substring(0, 30) || 'N/A'}</td>
                            <td class="colNoWrap">${item.BrandNme || 'N/A'}</td>
                            <td class="colNoWrap">${item.TypeDesc || 'N/A'}</td>
                            <td class="tdDataOut" style="text-align: center">${item.TotalQty || 'N/A'}</td>
                            <td class="tdDataOut" style="text-align: right">${formatter.format(item.TotAmtOu) || 'N/A'}</td>
                            <td class="tdDataOut" style="text-align: right">${formatter.format(item.TotCosOu) || 'N/A'}</td>
                            <td class="tdData_In" style="text-align: center">${item.TotalRcv || 'N/A'}</td>
                            <td class="tdData_In" style="text-align: right">${formatter.format(item.TotAmtIn) || 'N/A'}</td>
                            <td class="tdData_In" style="text-align: right">${formatter.format(item.TotCosIn) || 'N/A'}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
            <tfoot>
                <tr style="font-weight: bold">
                    <td class="tdDataOut" ></td>
                    <td class="tdData_In" ></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td style="text-align: right">Total:</td>

                    <td class="tdDataOut" style="text-align: center">${nTotalQty || 'N/A'}</td>
                    <td class="tdDataOut" style="text-align: right">${formatter.format(nTotAmtOu) || 'N/A'}</td>
                    <td class="tdDataOut" style="text-align: right">${formatter.format(nTotCosOu) || 'N/A'}</td>

                    <td class="tdData_In" style="text-align: center">${nTotalRcv || 'N/A'}</td>
                    <td class="tdData_In" style="text-align: right">${formatter.format(nTotAmtIn) || 'N/A'}</td>
                    <td class="tdData_In" style="text-align: center">${formatter.format(nTotCosIn) || 'N/A'}</td>
                </tr>
            </tfoot>
        </table>
        `;
        
        // Add the table HTML to the div
        reportBody.innerHTML =  reportTable;
        if (nTotalQty===0) {
            document.querySelectorAll('.tdDataOut').forEach( e => {
                e.style.display = 'none'
            })
        }
        if (nTotalRcv===0) {
            document.querySelectorAll('.tdData_In').forEach( e => {
                e.style.display = 'none'
            })
        }

        // Show report chart
        document.getElementById('transSKUChart').style.display='flex';
        StockChart(data,'StockNo1')
        StockChart(data,'StockNo2')
        // document.getElementById('printStockDetailsPDF').disabled = false
        // document.getElementById('printStockDetailsXLS').disabled = false

        
    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error,'Fetch error')
    } finally {
        // Hide loading spinner once data is fetched or an error occurs
        document.getElementById('loadingIndicator').style.display = 'none';
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

    }

}
document.getElementById('transBtn3').addEventListener('click', async () => {
    try {
        FiltrRec('StockSKU').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));

            // console.log(filterData)
            const dDateFrom = filterData[0];
            const dDate__To = filterData[1];
            // const cWhseFrom = filterData[2];
            const cUsersCde = filterData[3];
            const cOtherCde = filterData[4];
            const cDescript = filterData[5];
            const cBrandNum = filterData[6];
            const cCategNum = filterData[7];
            const cItemType = filterData[8];
            const cItemDept = filterData[9];
            const cReferDoc = filterData[10];
            const cLocaFrom = filterData[17];
            const cLocaTo__ = filterData[18];

            StockTraSKU(dDateFrom,dDate__To,cReferDoc,cLocaFrom,cLocaTo__,
                cUsersCde, cOtherCde, cDescript, cBrandNum, cCategNum, cItemType, cItemDept ) 

            getFilters(filterData,'pStockSKU')

        });
    } catch (error) {
        console.error("Error processing the filter:", error);
    }
});



// Stock Transfer Charts ===========================================
async function StockChart(data, showData) {
    try {
        // Define a mapping of showData to canvas IDs
        const dataCanvasMapping = {
            'Details1': 'transChart1',
            'Details2': 'transChart2',
            'TypeDesc': 'transChart3',
            'StockNo1': 'transChart4',
            'StockNo2': 'transChart5'
           
        };

        // Get the canvas ID based on showData
        const dataCanvass = dataCanvasMapping[showData];

        if (!dataCanvass) {
            console.error(`Unknown data type: ${showData}`);
            return;
        }

        const reportChartElement = document.getElementById(dataCanvass);

        // Declare variables for chart instances
        let myChart = window.myCharts && window.myCharts[dataCanvass] || null;

        // Destroy existing charts if they exist
        if (myChart) {
            myChart.destroy();
        }

        // Clear the canvas context manually (important when reusing canvas elements)
        reportChartElement.getContext('2d').clearRect(0, 0, reportChartElement.width, reportChartElement.height);

        let chartData = data;

        const dataFieldMapping = {
            'Details1': 'BrandNme',
            'Details2': 'TypeDesc',
            'TypeDesc': 'TypeDesc',
            'StockNo1': 'BrandNme',
            'StockNo2': 'TypeDesc'
        };
        const dataField = dataFieldMapping[showData];

        const dataValueMapping = {
            'Details1': 'Amount__',
            'Details2': 'Amount__',
            'TypeDesc': 'TotAmtOu',
            'StockNo1': 'TotAmtOu',
            'StockNo2': 'TotAmtOu'
        };
        const dataValue = dataValueMapping[showData];

        // Check if the mapping is valid
        if (!dataField) {
            console.error(`Unknown showData type: ${showData}`);
            return;
        }

        // Prepare data for the pie chart
        const groupTotals = chartData.reduce((acc, entry) => {
            
            // const totalAmount = parseFloat(entry.Amount__) || 0;
            const totalAmount = parseFloat(entry[dataValue]) || 0;

            // Dynamically access the property based on `showData`
            const dataGroup = entry[dataField]?.trim() || '';
            acc[dataGroup] = (acc[dataGroup] || 0) + totalAmount;

            return acc;
        }, {});

        // Convert the groupTotals object into an array of [label, value] pairs
        let groupTotalsArray = Object.entries(groupTotals);

        // Sort data groups by total amount in descending order
        groupTotalsArray.sort((a, b) => b[1] - a[1]);

        // Slice to get the top 20 items
        const top20Groups = groupTotalsArray.slice(0, 20);

        // Sum the rest of the items for 'OTHERS'
        const otherGroups = groupTotalsArray.slice(20);
        const othersTotal = otherGroups.reduce((sum, group) => sum + group[1], 0);

        // Add 'OTHERS' to the labels and values
        const dataGroupLabels = top20Groups.map(entry => entry[0]);
        const dataGroupValues = top20Groups.map(entry => entry[1]);

        if (othersTotal > 0) {
            dataGroupLabels.push('OTHERS');
            dataGroupValues.push(othersTotal);
        }

        // Update dynamic text content based on `showData`
        const headingMapping = {
            'Details1': 'Top Brands',
            'Details2': 'Top Classifications',
            'TypeDesc': 'Top Classifications'
        };

        const headingElementId = `h5top${dataFieldMapping[showData].substring(0, 4)}`;
        document.getElementById(headingElementId).textContent = headingMapping[showData];

        const totalValues = dataGroupValues.reduce((acc, value) => acc + value, 0); // Calculate total values
        const dataGroupPercentages = dataGroupValues.map(value => (value / totalValues * 100).toFixed(2)); // Calculate percentages

        const generateRandomColor = () => {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            return `rgba(${r}, ${g}, ${b}, 0.6)`;
        };

        const backgroundColors = dataGroupLabels.map(() => generateRandomColor());
        const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

        // Create the chart 
        const ctx = reportChartElement.getContext('2d');
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dataGroupLabels,
                datasets: [{
                    label: '',
                    data: dataGroupValues,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',         // labels at left side
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false 
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const percentage = dataGroupPercentages[context.dataIndex];
                                const value = context.raw || 0;
                                return `${value} (${percentage}%)`;
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        formatter: (value, context) => {
                            const percentage = dataGroupPercentages[context.dataIndex];
                            return `${percentage}%`;
                        },
                        color: '#000',
                        font: {
                            weight: 'bold',
                            size: 10
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }

        });

        // Store the chart instances globally if needed (optional)
        window.myCharts = window.myCharts || {};
        window.myCharts[dataCanvass] = myChart;

    } catch (error) {
        console.error('Error processing chart data:', error);
        displayErrorMsg(error, "'Error processing chart data'");
    }
}


// ================================================
async function getFilters(filterData, filterIdCon){
    const aFilters = []
    for (let i = 0; i < filterData.length; i++) {

        if (i===0 && filterData[0] && filterData[1]) {
            aFilters.push(`Date From: ${formatDate(filterData[0],'MM/DD/YYYY')}  To: ${formatDate(filterData[1],'MM/DD/YYYY')} `) 
        }

        if (i===3 && filterData[i]) {
            aFilters.push(`Stock No: ${filterData[i].trim()}   `) 
        }
        if (i===4 && filterData[i]) {
            aFilters.push(`Bar Code: ${filterData[i].trim()}   `) 
        }
        if (i===5 && filterData[i]) {
            aFilters.push(`Description: ${filterData[i].trim().toUpperCase()}   `) 
        }
        if (i===6 && filterData[i]) {
            const url = new URL(`http://localhost:3000/product/brands?BrandNum=${filterData[i].trim()}`);
            const res = await fetch(url);
            const data = await res.json()
            aFilters.push(`Brand: ${data[0].BrandNme}   `) 
        }

        if (i===17 && filterData[i]) {
            aFilters.push(`Stock Out -From: ${filterData[i].trim().toUpperCase()}   `) 
        }
        if (i===18 && filterData[i]) {
            aFilters.push(`Stock In -To: ${filterData[i].trim().toUpperCase()}   `) 
        }

    }

    document.querySelectorAll('.showFilterScope').forEach( e => e.style.display = 'flex')
    document.getElementById(filterIdCon).innerText = ''

    aFilters.forEach(text => {
        const span = document.createElement("span");
        span.textContent = text;
        document.getElementById(filterIdCon).appendChild(span)
    });
}
