import { showReport, showNotification, formatter, formatDate, goMonth, startTimer} from '../FunctLib.js';
import { printFormPDF, printReportExcel, generateTitleRows } from "../PrintRep.js"
import { FiltrRec, displayErrorMsg } from "../FiltrRec.js"

const dDateFrom = new Date(), dDateTo__ = new Date(), 
    dMontFrom = goMonth(new Date(), -1), dMontTo__ = goMonth(new Date(), -1),
    dYearFrom = goMonth(new Date(), -12), dYearTo__ = goMonth(new Date(), -12)

let cCompName = ''
window.addEventListener('CompNameLoaded', () => {
    cCompName = window.CompName;
});

const divCompStore = `
    <div id="SalesRankStore" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Sales Ranking Report by Location</span>
            <button id="closeRepo1" class="closeForm">✖</button>
        </div>
        <div class="ReportBody">
            <div id="salesRankStore" class="ReportBody">
                <table id="salesRankTable1">
                    <thead id="rankTHead1">
                        <tr>
                            <th rowspan="2">Location</th>
                            <th colspan="10">
                                Current
                                <div class='thDateRange'">
                                    ${formatDate(dDateFrom,'MM/DD/YYYY')} - ${formatDate(dDateTo__,'MM/DD/YYYY')}
                                </div>
                            </th>
                            <th colspan="2">
                                Previous Month
                                <div class='thDateRange'">
                                    ${formatDate(dMontFrom,'MM/DD/YYYY')} - ${formatDate(dMontTo__,'MM/DD/YYYY')}
                                </div>
                            </th>
                            <th colspan="2">
                                Previous Year
                                <div class='thDateRange'">
                                    ${formatDate(dYearFrom,'MM/DD/YYYY')} - ${formatDate(dYearTo__,'MM/DD/YYYY')}
                                </div>
                            </th>
                        </tr>
                        <tr>
                            <th>Rank</th>
                            <th>TRX</th>
                            <th>Quantity</th>
                            <th>Gross</th>
                            <th>Discount</th>
                            <th>Net</th>
                            <th>ATV</th>
                            <th>Cost</th>
                            <th>Gross Profit</th>
                            <th>GP %</th>
                            <th>Net</th>
                            <th>Inc/Dec %</th>
                            <th>Net</th>
                            <th>Inc/Dec %</th>
                        </tr>
                    </thead>
                </table>            
            </div>

            <details class="showFilterScope" style="display: none">
                <summary>Report Scope</summary>
                <div id="pCompStore" class='filterLists'></div>
            </details>

            <div id="storeRankChart" class="chartContainer">
                <div class="divChart70">
                    <h5>Top 30 Stores</h5>
                    <canvas id="storeChart1"></canvas>
                </div>
                <div class="divChart30">
                    <h5>Contribution To Sales</h5>
                    <canvas id="storeChart2"></canvas>
                </div>
            </div>
        </div>
        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <span id="saleRank1Counter" class="recCounter"></span>
                <button id="printStoreRankPDF" disabled><i class="fa fa-file-pdf"></i> PDF</button>
                <button id="printStoreRankXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="saleRank1"><i class="fa fa-list"></i> List</button>
            </div>
        </div>
    </div>
`

const divCompBrand = `
    <div id="SalesCompBrand" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Sales Ranking Report by Brand</span>
            <button id="closeRepo6" class="closeForm">✖</button>
        </div>
        <div class="ReportBody">
            <div id="salesCompBrand" class="ReportBody">
                <table>
                    <thead>
                        <tr>
                            <th rowspan="2">Brand</th>
                            <th colspan="8">
                                Current
                                <div class='thDateRange'">
                                    ${formatDate(dDateFrom,'MM/DD/YYYY')} - ${formatDate(dDateTo__,'MM/DD/YYYY')}
                                </div>
                            </th>
                            <th colspan="2">
                                Previous Month
                                <div class='thDateRange'">
                                    ${formatDate(dMontFrom,'MM/DD/YYYY')} - ${formatDate(dMontTo__,'MM/DD/YYYY')}
                                </div>
                            </th>
                            <th colspan="2">
                                Previous Year
                                <div class='thDateRange'">
                                    ${formatDate(dYearFrom,'MM/DD/YYYY')} - ${formatDate(dYearTo__,'MM/DD/YYYY')}
                                </div>
                            </th>
                        </tr>
                        <tr>
                            <th>Rank</th>
                            <th>Quantity</th>
                            <th>Gross</th>
                            <th>Discount</th>
                            <th>Net</th>
                            <th>Cost</th>
                            <th>Gross Profit</th>
                            <th>GP %</th>
                            <th>Net</th>
                            <th>Inc/Dec %</th>
                            <th>Net</th>
                            <th>Inc/Dec %</th>
                        </tr>
                    </thead>
                </table>            
            </div>

            <details class="showFilterScope" style="display: none">
                <summary>Report Scope</summary>
                <div id="pCompBrand" class='filterLists'></div>
            </details>

            <div id="brandCompChart" class="chartContainer">
                <div class="divBrand1">
                    <p class='currDateRange'></p>
                    <canvas id="brandnmeChart1"></canvas>
                </div>
                <div class="divBrand2">
                    <p class='prevDateRange'></p>
                    <canvas id="brandnmeChart2"></canvas>
                </div>
            </div>
        </div>
        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <span id="compBrandCounter" class="recCounter"></span>
                <button id="printCompBrandPDF" disabled><i class="fa fa-file-pdf"></i> PDF</button>
                <button id="printCompBrandXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="compBrand"><i class="fa fa-list"></i> List</button>
            </div>
        </div>
    </div>
`
const divCompClass = `
    <div id="SalesCompClass" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Sales Ranking Report by Classification</span>
            <button id="closeRepo8" class="closeForm">✖</button>
        </div>
        <div class="ReportBody">
            <div id="salesCompClass" class="ReportBody">
                <table>
                    <thead>
                        <tr>
                            <th rowspan="2">Classification</th>
                            <th colspan="8">
                                Current
                                <div class='thDateRange'">
                                    ${formatDate(dDateFrom,'MM/DD/YYYY')} - ${formatDate(dDateTo__,'MM/DD/YYYY')}
                                </div>
                            </th>
                            <th colspan="2">
                                Previous Month
                                <div class='thDateRange'">
                                    ${formatDate(dMontFrom,'MM/DD/YYYY')} - ${formatDate(dMontTo__,'MM/DD/YYYY')}
                                </div>
                            </th>
                            <th colspan="2">
                                Previous Year
                                <div class='thDateRange'">
                                    ${formatDate(dYearFrom,'MM/DD/YYYY')} - ${formatDate(dYearTo__,'MM/DD/YYYY')}
                                </div>
                            </th>
                        </tr>
                        <tr>
                            <th>Rank</th>
                            <th>Quantity</th>
                            <th>Gross</th>
                            <th>Discount</th>
                            <th>Net</th>
                            <th>Cost</th>
                            <th>Gross Profit</th>
                            <th>GP %</th>
                            <th>Net</th>
                            <th>Inc/Dec %</th>
                            <th>Net</th>
                            <th>Inc/Dec %</th>
                        </tr>
                    </thead>
                </table>            
            </div>
            <details class="showFilterScope" style="display: none">
                <summary>Report Scope</summary>
                <div id="pCompClass" class='filterLists'></div>
            </details>

            <div id="classCompChart" class="chartContainer">
                <div class="divBrand1">
                    <p class='currDateRange'></p>
                    <canvas id="typedescChart1"></canvas>
                </div>
                <div class="divBrand2">
                    <p class='prevDateRange'></p>
                    <canvas id="typedescChart2"></canvas>
                </div>
            </div>
        </div>
        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <span id="compClassCounter" class="recCounter"></span>
                <button id="printCompClassPDF" disabled><i class="fa fa-file-pdf"></i> PDF</button>
                <button id="printCompClassXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="compClass"><i class="fa fa-list"></i> List</button>
            </div>
        </div>
    </div>
`

const divRankStock =`
    <div id="SalesRankStock" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Sales Ranking Report by Stock No</span>
            <button id="closeRepo3" class="closeForm">✖</button>
        </div>
        <div class="ReportBody">
            <div id="salesRankStock" class="ReportBody">
                <table id="salesRankTable1">
                    <thead id="rankTHead1">
                        <tr>
                            <th>Rank</th>
                            <th>Stock No</th>
                            <th>Bar Code</th>
                            <th>Description</th>
                            <th>Brand</th>
                            <th>Department</th>
                            <th>Classification</th>
                            <th>Quantity</th>
                            <th>Gross</th>
                            <th>Discount</th>
                            <th>Net</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                </table>            
            </div>
            <details class="showFilterScope" style="display: none">
                <summary>Report Scope</summary>
                <div id="pRankStock" class='filterLists'></div>
            </details>

            <div id="stockRankChart" class="chartContainer">
                <div id="topStock">
                    <h5>Top 30 SKU's</h5>
                    <canvas id="stockChart1"></canvas>
                </div>
            </div>
        </div>
        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <span id="saleRank3Counter" class="recCounter"></span>
                <button id="printStockRankPDF" disabled><i class="fa fa-file-pdf"></i> PDF</button>
                <button id="printStockRankXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="saleRank3"><i class="fa fa-list"></i> List</button>
            </div>
        </div>
    </div>
`
const divDailySales =`
    <div id="DailySalesSum" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Daily Sales Summary</span>
            <button id="closeRepo4" class="closeForm">✖</button>
        </div>
        <div class="ReportBody">
            <div id="dailySalesSum" class="ReportBody">
                <table id="dailySalesTable">
                    <thead id="listSales1">
                        <tr>
                            <th>Date</th>
                            <th>Trx Count</th>
                            <th>Quantity</th>
                            <th>Gross</th>
                            <th>Discount</th>
                            <th>Net</th>
                            <th>ATV</th>
                            <th>Cost</th>
                            <th>Gross Profit</th>
                            <th>GP%</th>
                        </tr>
                    </thead>
                </table>            
            </div>
            <details class="showFilterScope" style="display: none">
                <summary>Report Scope</summary>
                <div id="pDailySales" class='filterLists'></div>
            </details>

            <div id="dailySalesChart" class="chartContainer">
                <div id="daySales">
                    <h5>Daily Sales</h5>
                    <canvas id="dailyLast30days"></canvas>
                </div>
                <br>
            </div>
        </div>
        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <button id="printDailySalesPDF" disabled><i class="fa fa-file-pdf"></i> PDF</button>
                <button id="printDailySalesXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="listSales"><i class="fa fa-list"></i> List</button>
            </div>
        </div>
    </div>
`

const fragment = document.createDocumentFragment();

const div1 = document.createElement('div');
div1.innerHTML = divCompStore;
fragment.appendChild(div1);

const div2 = document.createElement('div');
div2.innerHTML = divCompBrand;
fragment.appendChild(div2);

const div3 = document.createElement('div');
div3.innerHTML = divCompClass;
fragment.appendChild(div3);

const div4 = document.createElement('div');
div4.innerHTML = divRankStock;
fragment.appendChild(div4);

const div5 = document.createElement('div');
div5.innerHTML = divDailySales;
fragment.appendChild(div5);

document.body.appendChild(fragment);  // Only one reflow happens here

// ======================================================
async function SalesCompClass(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, cStoreGrp, dDateFrom, dDateTo__, cDescript) {

    let data = null;
    const dYearFrom = goMonth(dDateFrom, -12)   // Previous Year 
    const dYearTo__ = goMonth(dDateTo__, -12)
    const dMontFrom = goMonth(dDateFrom, -1)    // Previous Month
    const dMontTo__ = goMonth(dDateTo__, -1)

    document.getElementById('loadingIndicator').style.display = 'flex';
    let { timerInterval, elapsedTime } = startTimer(); 

    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/sales/SalesCompClass');
        const params = new URLSearchParams();
        if (cBrandNum) params.append('BrandNum', cBrandNum);
        if (cUsersCde) params.append('UsersCde', cUsersCde);
        if (cOtherCde) params.append('OtherCde', cOtherCde);
        if (cCategNum) params.append('CategNum', cCategNum);
        if (cItemDept) params.append('ItemDept', cItemDept);
        if (cItemType) params.append('ItemType', cItemType);
        if (cLocation) params.append('Location', cLocation);
        if (cStoreGrp) params.append('StoreGrp', cStoreGrp);
        if (dDateFrom) params.append('DateFrom', dDateFrom); 
        if (dDateTo__) params.append('DateTo__', dDateTo__); 
        if (dYearFrom) params.append('YearFrom', dYearFrom); 
        if (dYearTo__) params.append('YearTo__', dYearTo__); 
        if (dMontFrom) params.append('MontFrom', dMontFrom); 
        if (dMontTo__) params.append('MontTo__', dMontTo__); 
        if (cDescript) params.append('Descript', cDescript); 

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const listCounter=document.getElementById('compClassCounter')
        data = await response.json();
        listCounter.innerHTML=`${data.length} Records`;
        showNotification(`${data.length} Records fetched`);

        // Clear the timer once data is fetched
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

        let nTotalQty = 0
        let nTotalTrx = 0
        let nTotalPrc = 0
        let nTotalDsc = 0
        let nTotalAmt = 0
        let nTotalCos = 0
        let nTotalGro = 0
        let nGP_Prcnt = 0
        let nGP_Total = 0

        let nTotPrvYr = 0
        let nPrvYrPct = 0
        let nTotYrPct = 0
        let nTotPrvMo = 0
        let nPrvMoPct = 0
        let nTotMoPct = 0

        if (Array.isArray(data)) {
            data.forEach(item => {
                nTotalQty+=item.Quantity
                nTotalTrx+=item.TrxCount
                nTotalPrc+=item.ItemPrce
                nTotalDsc+=(item.ItemPrce-item.Amount__)
                nTotalAmt+=item.Amount__
                nTotalCos+=item.LandCost
                nTotalGro+=(item.Amount__-item.LandCost)

                nTotPrvYr+=item.PrvYrAmt
                nTotPrvMo+=item.PrvMoAmt
            });
        }
        if (nTotalAmt !== 0) {
            nGP_Total = ((nTotalAmt-nTotalCos) / nTotalAmt) * 100; // GP% formula
            nTotMoPct = ((nTotalAmt-nTotPrvMo) / nTotalAmt) * 100; // Total Inc/Dec formula
            nTotYrPct = ((nTotalAmt-nTotPrvYr) / nTotalAmt) * 100; // Total Inc/Dec formula
        }


        const salesMainDiv = document.getElementById('SalesCompClass');
        salesMainDiv.classList.add('active');

        const reportBody = document.getElementById('salesCompClass');
        reportBody.style.maxHeight = "80%";

        reportBody.innerHTML = '';  // Clear previous content

        // Define the table structure
        const rankTable = `
            <table>
                <thead>
                    <tr>
                        <th rowspan="2">Classification</th>
                        <th colspan="8">
                            Current
                            <div class='thDateRange'">
                                ${formatDate(dDateFrom,'MM/DD/YYYY')} - ${formatDate(dDateTo__,'MM/DD/YYYY')}
                            </div>
                        </th>
                        <th colspan="2">
                            Previous Month
                            <div class='thDateRange'">
                                ${formatDate(dMontFrom,'MM/DD/YYYY')} - ${formatDate(dMontTo__,'MM/DD/YYYY')}
                            </div>
                        </th>
                        <th colspan="2">
                            Previous Year
                            <div class='thDateRange'">
                                ${formatDate(dYearFrom,'MM/DD/YYYY')} - ${formatDate(dYearTo__,'MM/DD/YYYY')}
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th>Rank</th>
                        <th>Quantity</th>
                        <th>Gross</th>
                        <th>Discount</th>
                        <th>Net</th>
                        <th>Cost</th>
                        <th>Gross Profit</th>
                        <th>GP %</th>
                        <th>Net</th>
                        <th>Inc/Dec %</th>
                        <th>Net</th>
                        <th>Inc/Dec %</th>
                    </tr>
                </thead>
                <tbody id="rankTBody">
                    ${data.map((item,index) => {
                        nGP_Prcnt = 0;
                        nPrvYrPct = 0
                        nPrvMoPct = 0
                        if (item.Amount__ !== 0) {
                            nGP_Prcnt = ((item.Amount__ - item.LandCost) / item.Amount__) * 100; // GP% formula
                            nPrvYrPct = ((item.Amount__ - item.PrvYrAmt) / item.Amount__) * 100
                            nPrvMoPct = ((item.Amount__ - item.PrvMoAmt) / item.Amount__) * 100
                        }
                        return `
                            <tr>
                                <td class="colNoWrap">${item.TypeDesc || 'N/A'}</td>
                                <td style="text-align: center">${index+1 || 'N/A'}</td>
                                <td style="text-align: center">${item.Quantity || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ItemPrce) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ItemPrce - item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right; font-weight: bold">${formatter.format(item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.LandCost) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Amount__ - item.LandCost) || 'N/A'}</td>
                                <td>${nGP_Prcnt ? nGP_Prcnt.toFixed(2) + '%' : 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.PrvMoAmt) || 'N/A'}</td>
                                <td style="text-align: right; color: ${nPrvMoPct < 0 ? 'red' : 'black'}">${nPrvMoPct ? nPrvMoPct.toFixed(2) + '%' : 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.PrvYrAmt) || 'N/A'}</td>
                                <td style="text-align: right; color: ${nPrvYrPct < 0 ? 'red' : 'black'}">${nPrvYrPct ? nPrvYrPct.toFixed(2) + '%' : 'N/A'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr style="font-weight: bold">
                        <td></td>
                        <td style="text-align: right">Total</td>
                        <td style="text-align: center">${nTotalQty || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalPrc) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalDsc) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalAmt) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalCos) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalGro) || 'N/A'}</td>
                        <td>${nGP_Total ? nGP_Total.toFixed(2) + '%' : 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotPrvMo) || 'N/A'}</td>
                        <td style="text-align: right; color: ${nTotMoPct < 0 ? 'red' : 'black'}">${nTotMoPct ? nTotMoPct.toFixed(2) + '%' : 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotPrvYr) || 'N/A'}</td>
                        <td style="text-align: right; color: ${nTotYrPct < 0 ? 'red' : 'black'}">${nTotYrPct ? nTotYrPct.toFixed(2) + '%' : 'N/A'}</td>
                    </tr>
                 </tfoot>
            </table>
        `;
        
        // Add the table HTML to the div
        reportBody.innerHTML = rankTable;
        // Show chart
        document.getElementById('classCompChart').style.display='flex';
        const dateRange1 = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        const dateRange2 = `From: ${formatDate(dMontFrom,'MM/DD/YYYY')} To: ${formatDate(dMontTo__,'MM/DD/YYYY')}`
        document.getElementById('printCompClassXLS').disabled = false

        document.querySelectorAll('.currDateRange').forEach( e => {e.innerText = dateRange1})
        document.querySelectorAll('.prevDateRange').forEach( e => {e.innerText = dateRange2})


        SalesCompChart(data , 'TypeDesc')

        
    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error,'Fetch error')
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
        // Clear the timer once data is fetched
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

    }

    // Print report to Excel
    document.getElementById('printCompClassXLS').addEventListener('click', () => {
        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        const titleRowsContent = [
            { text: cCompName, style: { fontWeight: 'bold', fontSize: 14 } },
            { text: 'Sales Ranking by Classification', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
            { text: dateRange, style: { fontStyle: 'italic', fontSize: 12 } },
            { text: '' } // Spacer row
          ];
          
          const colWidths = [
              { width: 25 },{ width: 10 },{ width: 15 },{ width: 15 },{ width: 15 }, // Gross
              { width: 15 },{ width: 15 },{ width: 12 },{ width: 15 },{ width: 15 }, // Gross Profit
              { width: 10 },{ width: 10 }  // CTS %
          ];
      
          const columnConfig = [
              {label: 'Classification',getValue: row => row.TypeDesc,type: 'string',align: 'left',totalLabel: 'TOTALS:'},
              {label: 'Quantity',getValue: row => +row.Quantity,
                total: rows => rows.reduce((sum, r) => sum + (+r.Quantity || 0), 0),
                align: 'right',type: 'integer',cellFormat: '#,##0' 
              },
              {label: 'Gross',getValue: row => +row.ItemPrce,
                total: rows => rows.reduce((sum, r) => sum + (+r.ItemPrce || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'Discount',getValue: row => +(row.ItemPrce - row.Amount__),
                total: rows => rows.reduce((sum, r) => sum + (+(r.ItemPrce - r.Amount__) || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'Net',getValue: row => +row.Amount__,
                total: rows => rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'Cost',getValue: row => +row.LandCost,
                total: rows => rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'Gross Profit',getValue: row => +(row.Amount__ - row.LandCost),
                total: rows => rows.reduce((sum, r) => sum + (+(r.Amount__ - r.LandCost) || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'GP %',getValue: row => row.Amount__ ? ((row.Amount__ - row.LandCost) / row.Amount__) * 100 : 0,
                total: rows => {
                  const totalAmount = rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0);
                  const totalCost = rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0);
                  return totalAmount ? ((totalAmount - totalCost) / totalAmount) * 100 : 0;
                },align: 'right',cellFormat: 'percent' 
              },
              {label: 'CTS %',getValue: (row, rows) => {
                  const totalAmount = rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0);
                  return totalAmount ? (row.Amount__ / totalAmount) * 100 : 0;
                },align: 'right',totalLabel: '100%',cellFormat: 'percent' 
              }
          ];
          
        const titleRows = generateTitleRows(columnConfig, titleRowsContent, 0);
        printReportExcel(data, columnConfig, colWidths, titleRows, 'Sales Ranking By Classification');
    })

}

// Wait for the DOM to fully load before adding the event listener
document.addEventListener('DOMContentLoaded', () => {
    const menuReportElements = document.querySelectorAll('.salesCompClass'); //<li>
    const rankRepoDiv = document.getElementById('SalesCompClass');
    const closeRepo = document.getElementById('closeRepo8');
    
    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

    menuReportElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('SalesCompClass')
        });
    });

});

document.getElementById('compClass').addEventListener('click', () => {
    try {
        FiltrRec('CompClas').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));
    
            const dDateFrom = filterData[0];
            const dDate__To = filterData[1];
            const cLocation = filterData[2];
            const cUsersCde = filterData[3];
            const cOtherCde = filterData[4];
            const cDescript = filterData[5];
            const cBrandNum = filterData[6];
            const cCategNum = filterData[7];
            const cItemType = filterData[8];
            const cItemDept = filterData[9];
            const cStoreGrp = filterData[12];
            
            SalesCompClass(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, cStoreGrp, dDateFrom, dDate__To, cDescript);
            
            getFilters(filterData,'pCompClass')
    
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")
    }
})


// ======================================================
async function SalesCompBrand(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, cStoreGrp, dDateFrom, dDateTo__, cDescript) {

    let data = null;
    const dYearFrom = goMonth(dDateFrom, -12)   // Previous Year 
    const dYearTo__ = goMonth(dDateTo__, -12)
    const dMontFrom = goMonth(dDateFrom, -1)    // Previous Month
    const dMontTo__ = goMonth(dDateTo__, -1)

    document.getElementById('loadingIndicator').style.display = 'flex';
    let { timerInterval, elapsedTime } = startTimer(); 

    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/sales/SalesCompBrand');
        const params = new URLSearchParams();
        if (cBrandNum) params.append('BrandNum', cBrandNum);
        if (cUsersCde) params.append('UsersCde', cUsersCde);
        if (cOtherCde) params.append('OtherCde', cOtherCde);
        if (cCategNum) params.append('CategNum', cCategNum);
        if (cItemDept) params.append('ItemDept', cItemDept);
        if (cItemType) params.append('ItemType', cItemType);
        if (cLocation) params.append('Location', cLocation);
        if (cStoreGrp) params.append('StoreGrp', cStoreGrp);
        if (dDateFrom) params.append('DateFrom', dDateFrom); 
        if (dDateTo__) params.append('DateTo__', dDateTo__); 
        if (dYearFrom) params.append('YearFrom', dYearFrom); 
        if (dYearTo__) params.append('YearTo__', dYearTo__); 
        if (dMontFrom) params.append('MontFrom', dMontFrom); 
        if (dMontTo__) params.append('MontTo__', dMontTo__); 
        if (cDescript) params.append('Descript', cDescript); 

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        // const response = await fetch('./data/DB_COMPBRAND.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const listCounter=document.getElementById('compBrandCounter')
        data = await response.json();
        listCounter.innerHTML=`${data.length} Records`;
        showNotification(`${data.length} Records fetched`);

        // Clear the timer once data is fetched
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

        let nTotalQty = 0
        let nTotalTrx = 0
        let nTotalPrc = 0
        let nTotalDsc = 0
        let nTotalAmt = 0
        let nTotalCos = 0
        let nTotalGro = 0
        let nGP_Prcnt = 0
        let nGP_Total = 0

        let nTotPrvYr = 0
        let nPrvYrPct = 0
        let nTotYrPct = 0
        let nTotPrvMo = 0
        let nPrvMoPct = 0
        let nTotMoPct = 0

        if (Array.isArray(data)) {
            data.forEach(item => {
                nTotalQty+=item.Quantity
                nTotalTrx+=item.TrxCount
                nTotalPrc+=item.ItemPrce
                nTotalDsc+=(item.ItemPrce-item.Amount__)
                nTotalAmt+=item.Amount__
                nTotalCos+=item.LandCost
                nTotalGro+=(item.Amount__-item.LandCost)

                nTotPrvYr+=item.PrvYrAmt
                nTotPrvMo+=item.PrvMoAmt
            });
        }
        if (nTotalAmt !== 0) {
            nGP_Total = ((nTotalAmt-nTotalCos) / nTotalAmt) * 100; // GP% formula
            nTotMoPct = ((nTotalAmt-nTotPrvMo) / nTotalAmt) * 100; // Total Inc/Dec formula
            nTotYrPct = ((nTotalAmt-nTotPrvYr) / nTotalAmt) * 100; // Total Inc/Dec formula
        }


        const salesMainDiv = document.getElementById('SalesCompBrand');
        salesMainDiv.classList.add('active');

        const reportBody = document.getElementById('salesCompBrand');
        reportBody.style.maxHeight = "80%";

        reportBody.innerHTML = '';  // Clear previous content

        // Define the table structure
        const rankTable = `
            <table>
                <thead>
                    <tr>
                        <th rowspan="2">Brand</th>
                        <th colspan="8">
                            Current
                            <div class='thDateRange'">
                                ${formatDate(dDateFrom,'MM/DD/YYYY')} - ${formatDate(dDateTo__,'MM/DD/YYYY')}
                            </div>
                        </th>
                        <th colspan="2">
                            Previous Month
                            <div class='thDateRange'">
                                ${formatDate(dMontFrom,'MM/DD/YYYY')} - ${formatDate(dMontTo__,'MM/DD/YYYY')}
                            </div>
                        </th>
                        <th colspan="2">
                            Previous Year
                            <div class='thDateRange'">
                                ${formatDate(dYearFrom,'MM/DD/YYYY')} - ${formatDate(dYearTo__,'MM/DD/YYYY')}
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th>Rank</th>
                        <th>Quantity</th>
                        <th>Gross</th>
                        <th>Discount</th>
                        <th>Net</th>
                        <th>Cost</th>
                        <th>Gross Profit</th>
                        <th>GP %</th>
                        <th>Net</th>
                        <th>Inc/Dec %</th>
                        <th>Net</th>
                        <th>Inc/Dec %</th>
                    </tr>
                </thead>
                <tbody id="rankTBody">
                    ${data.map((item,index) => {
                        nGP_Prcnt = 0;
                        nPrvYrPct = 0
                        nPrvMoPct = 0
                        if (item.Amount__ !== 0) {
                            nGP_Prcnt = ((item.Amount__ - item.LandCost) / item.Amount__) * 100; // GP% formula
                            nPrvYrPct = ((item.Amount__ - item.PrvYrAmt) / item.Amount__) * 100
                            nPrvMoPct = ((item.Amount__ - item.PrvMoAmt) / item.Amount__) * 100
                        }
                        return `
                            <tr>
                                <td class="colNoWrap">${item.BrandNme || 'N/A'}</td>
                                <td style="text-align: center">${index+1 || 'N/A'}</td>
                                <td style="text-align: center">${item.Quantity || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ItemPrce) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ItemPrce - item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right; font-weight: bold">${formatter.format(item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.LandCost) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Amount__ - item.LandCost) || 'N/A'}</td>
                                <td>${nGP_Prcnt ? nGP_Prcnt.toFixed(2) + '%' : 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.PrvMoAmt) || 'N/A'}</td>
                                <td style="text-align: right; color: ${nPrvMoPct < 0 ? 'red' : 'black'}">${nPrvMoPct ? nPrvMoPct.toFixed(2) + '%' : 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.PrvYrAmt) || 'N/A'}</td>
                                <td style="text-align: right; color: ${nPrvYrPct < 0 ? 'red' : 'black'}">${nPrvYrPct ? nPrvYrPct.toFixed(2) + '%' : 'N/A'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr style="font-weight: bold">
                        <td></td>
                        <td style="text-align: right">Total</td>
                        <td style="text-align: center">${nTotalQty || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalPrc) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalDsc) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalAmt) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalCos) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalGro) || 'N/A'}</td>
                        <td>${nGP_Total ? nGP_Total.toFixed(2) + '%' : 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotPrvMo) || 'N/A'}</td>
                        <td style="text-align: right; color: ${nTotMoPct < 0 ? 'red' : 'black'}">${nTotMoPct ? nTotMoPct.toFixed(2) + '%' : 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotPrvYr) || 'N/A'}</td>
                        <td style="text-align: right; color: ${nTotYrPct < 0 ? 'red' : 'black'}">${nTotYrPct ? nTotYrPct.toFixed(2) + '%' : 'N/A'}</td>
                    </tr>
                 </tfoot>
            </table>
        `;
        
        // Add the table HTML to the div
        reportBody.innerHTML = rankTable;
        // Show chart
        document.getElementById('brandCompChart').style.display='flex';
        const dateRange1 = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        const dateRange2 = `From: ${formatDate(dMontFrom,'MM/DD/YYYY')} To: ${formatDate(dMontTo__,'MM/DD/YYYY')}`
        document.getElementById('printCompBrandXLS').disabled = false

        document.querySelectorAll('.currDateRange').forEach( e => {e.innerText = dateRange1})
        document.querySelectorAll('.prevDateRange').forEach( e => {e.innerText = dateRange2})

        SalesCompChart(data, 'BrandNme')

        
    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error,'Fetch error')
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
        // Clear the timer once data is fetched
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

    }

    // Print report to Excel
    document.getElementById('printCompBrandXLS').addEventListener('click', () => {

        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        const titleRowsContent = [
            { text: cCompName, style: { fontWeight: 'bold', fontSize: 14 } },
            { text: 'Sales Ranking by Brand', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
            { text: dateRange, style: { fontStyle: 'italic', fontSize: 12 } },
            { text: '' } // Spacer row
          ];
          
          const colWidths = [
              { width: 25 },{ width: 10 },{ width: 15 },{ width: 15 },{ width: 15 }, // Gross
              { width: 15 },{ width: 15 },{ width: 12 },{ width: 15 },{ width: 15 }, // Gross Profit
              { width: 10 },{ width: 10 }  // CTS %
          ];
      
          const columnConfig = [
              {label: 'Brand',getValue: row => row.BrandNme,type: 'string',align: 'left',totalLabel: 'TOTALS:'},
              {label: 'Quantity',getValue: row => +row.Quantity,
                total: rows => rows.reduce((sum, r) => sum + (+r.Quantity || 0), 0),
                align: 'right',type: 'integer',cellFormat: '#,##0' 
              },
              {label: 'Gross',getValue: row => +row.ItemPrce,
                total: rows => rows.reduce((sum, r) => sum + (+r.ItemPrce || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'Discount',getValue: row => +(row.ItemPrce - row.Amount__),
                total: rows => rows.reduce((sum, r) => sum + (+(r.ItemPrce - r.Amount__) || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'Net',getValue: row => +row.Amount__,
                total: rows => rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'Cost',getValue: row => +row.LandCost,
                total: rows => rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'Gross Profit',getValue: row => +(row.Amount__ - row.LandCost),
                total: rows => rows.reduce((sum, r) => sum + (+(r.Amount__ - r.LandCost) || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'GP %',getValue: row => row.Amount__ ? ((row.Amount__ - row.LandCost) / row.Amount__) * 100 : 0,
                total: rows => {
                  const totalAmount = rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0);
                  const totalCost = rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0);
                  return totalAmount ? ((totalAmount - totalCost) / totalAmount) * 100 : 0;
                },align: 'right',cellFormat: 'percent' 
              },
              {label: 'CTS %',getValue: (row, rows) => {
                  const totalAmount = rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0);
                  return totalAmount ? (row.Amount__ / totalAmount) * 100 : 0;
                },align: 'right',totalLabel: '100%',cellFormat: 'percent' 
              }
          ];
          
        const titleRows = generateTitleRows(columnConfig, titleRowsContent, 0);
        printReportExcel(data, columnConfig, colWidths, titleRows, 'Sales Ranking By Brand');
    })

}

// Wait for the DOM to fully load before adding the event listener
document.addEventListener('DOMContentLoaded', () => {
    const menuReportElements = document.querySelectorAll('.salesCompBrand'); //<li>
    const rankRepoDiv = document.getElementById('SalesCompBrand');
    const closeRepo = document.getElementById('closeRepo6');

    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

    menuReportElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('SalesCompBrand')
        });
    });

});

document.getElementById('compBrand').addEventListener('click', () => {
    try {
        FiltrRec('CompBrnd').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));
    
            const dDateFrom = filterData[0];
            const dDate__To = filterData[1];
            const cLocation = filterData[2];
            const cUsersCde = filterData[3];
            const cOtherCde = filterData[4];
            const cDescript = filterData[5];
            const cBrandNum = filterData[6];
            const cCategNum = filterData[7];
            const cItemType = filterData[8];
            const cItemDept = filterData[9];
            const cStoreGrp = filterData[12];
            
            SalesCompBrand(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, cStoreGrp, dDateFrom, dDate__To, cDescript);

            getFilters(filterData,'pCompBrand')
                
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")
    }
})

// ======================================================
async function SalesCompStore(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, cStoreGrp, dDateFrom, dDateTo__, cDescript) {

    let data = null;
    const dYearFrom = goMonth(dDateFrom, -12)   // Previous Year 
    const dYearTo__ = goMonth(dDateTo__, -12)
    const dMontFrom = goMonth(dDateFrom, -1)    // Previous Month
    const dMontTo__ = goMonth(dDateTo__, -1)

    document.getElementById('loadingIndicator').style.display = 'flex';
    let { timerInterval, elapsedTime } = startTimer(); 

    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/sales/SalesCompStore');
        const params = new URLSearchParams();
        if (cBrandNum) params.append('BrandNum', cBrandNum);
        if (cUsersCde) params.append('UsersCde', cUsersCde);
        if (cOtherCde) params.append('OtherCde', cOtherCde);
        if (cCategNum) params.append('CategNum', cCategNum);
        if (cItemDept) params.append('ItemDept', cItemDept);
        if (cItemType) params.append('ItemType', cItemType);
        if (cLocation) params.append('Location', cLocation);
        if (cStoreGrp) params.append('StoreGrp', cStoreGrp);
        if (dDateFrom) params.append('DateFrom', dDateFrom); 
        if (dDateTo__) params.append('DateTo__', dDateTo__); 
        if (dYearFrom) params.append('YearFrom', dYearFrom); 
        if (dYearTo__) params.append('YearTo__', dYearTo__); 
        if (dMontFrom) params.append('MontFrom', dMontFrom); 
        if (dMontTo__) params.append('MontTo__', dMontTo__); 
        if (cDescript) params.append('Descript', cDescript); 

        // Send request with query parameters
        // const response = await fetch(`${url}?${params.toString()}`);
        const response = await fetch('./data/DB_COMPSTORE.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const listCounter=document.getElementById('saleRank1Counter')
        data = await response.json();
        // console.log(data)
        listCounter.innerHTML=`${data.length} Records`;
        showNotification(`${data.length} Records fetched`);

        // Clear the timer once data is fetched
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

        let nTotalQty = 0
        let nTotalTrx = 0
        let nTotalPrc = 0
        let nTotalDsc = 0
        let nTotalAmt = 0
        let nTotalCos = 0
        let nTotalGro = 0
        let nGP_Prcnt = 0
        let nGP_Total = 0

        let nTotPrvYr = 0
        let nPrvYrPct = 0
        let nTotYrPct = 0
        let nTotPrvMo = 0
        let nPrvMoPct = 0
        let nTotMoPct = 0

        if (Array.isArray(data)) {
            data.forEach(item => {
                nTotalQty+=item.Quantity
                nTotalTrx+=item.TrxCount
                nTotalPrc+=item.ItemPrce
                nTotalDsc+=(item.ItemPrce-item.Amount__)
                nTotalAmt+=item.Amount__
                nTotalCos+=item.LandCost
                nTotalGro+=(item.Amount__-item.LandCost)

                nTotPrvYr+=item.PrvYrAmt
                nTotPrvMo+=item.PrvMoAmt
            });
        }
        if (nTotalAmt !== 0) {
            nGP_Total = ((nTotalAmt-nTotalCos) / nTotalAmt) * 100; // GP% formula
            nTotMoPct = ((nTotalAmt-nTotPrvMo) / nTotalAmt) * 100; // Total Inc/Dec formula
            nTotYrPct = ((nTotalAmt-nTotPrvYr) / nTotalAmt) * 100; // Total Inc/Dec formula
        }


        const salesRankStoreDiv = document.getElementById('SalesRankStore');
        salesRankStoreDiv.classList.add('active');

        const reportBody = document.getElementById('salesRankStore');
        reportBody.style.maxHeight = "80%";

        reportBody.innerHTML = '';  // Clear previous content

        // Define the table structure
        const rankTable = `
            <table id="salesRankTable1">
                <thead id="rankTHead1">
                    <tr>
                        <th rowspan="2">Location</th>
                        <th colspan="10">
                            Current
                            <div class='thDateRange'">
                                ${formatDate(dDateFrom,'MM/DD/YYYY')} - ${formatDate(dDateTo__,'MM/DD/YYYY')}
                            </div>
                        </th>
                        <th colspan="2">
                            Previous Month
                            <div class='thDateRange'">
                                ${formatDate(dMontFrom,'MM/DD/YYYY')} - ${formatDate(dMontTo__,'MM/DD/YYYY')}
                            </div>
                        </th>
                        <th colspan="2">
                            Previous Year
                            <div class='thDateRange'">
                                ${formatDate(dYearFrom,'MM/DD/YYYY')} - ${formatDate(dYearTo__,'MM/DD/YYYY')}
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th>Rank</th>
                        <th>TRX</th>
                        <th>Quantity</th>
                        <th>Gross</th>
                        <th>Discount</th>
                        <th>Net</th>
                        <th>ATV</th>
                        <th>Cost</th>
                        <th>Gross Profit</th>
                        <th>GP %</th>
                        <th>Net</th>
                        <th>Inc/Dec %</th>
                        <th>Net</th>
                        <th>Inc/Dec %</th>
                    </tr>
                </thead>
                <tbody id="rankTBody">
                    ${data.map((item,index) => {
                        nGP_Prcnt = 0;
                        nPrvYrPct = 0
                        nPrvMoPct = 0
                        if (item.Amount__ !== 0) {
                            nGP_Prcnt = ((item.Amount__ - item.LandCost) / item.Amount__) * 100; // GP% formula
                            nPrvYrPct = ((item.Amount__ - item.PrvYrAmt) / item.Amount__) * 100
                            nPrvMoPct = ((item.Amount__ - item.PrvMoAmt) / item.Amount__) * 100
                        }
                        return `
                            <tr>
                                <td class="colNoWrap">${item.LocaName || 'N/A'}</td>
                                <td style="text-align: center">${index+1 || 'N/A'}</td>
                                <td style="text-align: center">${item.TrxCount || 'N/A'}</td>
                                <td style="text-align: center">${item.Quantity || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ItemPrce) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ItemPrce - item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right; font-weight: bold">${formatter.format(item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Amount__/item.TrxCount) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.LandCost) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Amount__ - item.LandCost) || 'N/A'}</td>
                                <td>${nGP_Prcnt ? nGP_Prcnt.toFixed(2) + '%' : 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.PrvMoAmt) || 'N/A'}</td>
                                <td style="text-align: right; color: ${nPrvMoPct < 0 ? 'red' : 'black'}">${nPrvMoPct ? nPrvMoPct.toFixed(2) + '%' : 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.PrvYrAmt) || 'N/A'}</td>
                                <td style="text-align: right; color: ${nPrvYrPct < 0 ? 'red' : 'black'}">${nPrvYrPct ? nPrvYrPct.toFixed(2) + '%' : 'N/A'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr style="font-weight: bold">
                        <td></td>
                        <td style="text-align: right">Total</td>
                        <td style="text-align: center">${nTotalTrx || 'N/A'}</td>
                        <td style="text-align: center">${nTotalQty || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalPrc) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalDsc) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalAmt) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalAmt/nTotalTrx) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalCos) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalGro) || 'N/A'}</td>
                        <td>${nGP_Total ? nGP_Total.toFixed(2) + '%' : 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotPrvMo) || 'N/A'}</td>
                        <td style="text-align: right; color: ${nTotMoPct < 0 ? 'red' : 'black'}">${nTotMoPct ? nTotMoPct.toFixed(2) + '%' : 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotPrvYr) || 'N/A'}</td>
                        <td style="text-align: right; color: ${nTotYrPct < 0 ? 'red' : 'black'}">${nTotYrPct ? nTotYrPct.toFixed(2) + '%' : 'N/A'}</td>
                    </tr>
                 </tfoot>
            </table>
        `;
        
        // Add the table HTML to the div
        reportBody.innerHTML = rankTable;
        // Show store ranking chart
        document.getElementById('storeRankChart').style.display='flex';
        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        document.getElementById('printStoreRankXLS').disabled = false
        setStoreChart(data, dateRange)
        // SalesCompChart(data,'LocaName')

        
    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error,'Fetch error')
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
        // Clear the timer once data is fetched
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

    }

    document.getElementById('printStoreRankXLS').addEventListener('click', () => {

        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        const titleRowsContent = [
            { text: cCompName, style: { fontWeight: 'bold', fontSize: 14 } },
            { text: 'Sales Ranking by Location', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
            { text: dateRange, style: { fontStyle: 'italic', fontSize: 12 } },
            { text: '' } // Spacer row
          ];
          
          const colWidths = [
              { width: 25 },{ width: 30 },{ width: 10 },{ width: 10 },{ width: 15 }, // Gross
              { width: 15 },{ width: 15 },{ width: 12 },{ width: 15 },{ width: 15 }, // Gross Profit
              { width: 10 },{ width: 10 }  // CTS %
          ];
      
          const columnConfig = [
              {label: 'Group',getValue: row => row.StoreGrp,type: 'string',align: 'left'},
              {label: 'Location',getValue: row => row.LocaName,type: 'string',align: 'left',totalLabel: 'TOTALS:'},
              {label: 'TRX Count',getValue: row => +row.TrxCount,
                total: rows => rows.reduce((sum, r) => sum + (+r.TrxCount || 0), 0),
                align: 'right',type: 'integer',cellFormat: '#,##0' 
              },
              {label: 'Quantity',getValue: row => +row.Quantity,
                total: rows => rows.reduce((sum, r) => sum + (+r.Quantity || 0), 0),
                align: 'right',type: 'integer',cellFormat: '#,##0' 
              },
              {label: 'Gross',getValue: row => +row.ItemPrce,
                total: rows => rows.reduce((sum, r) => sum + (+r.ItemPrce || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'Discount',getValue: row => +(row.ItemPrce - row.Amount__),
                total: rows => rows.reduce((sum, r) => sum + (+(r.ItemPrce - r.Amount__) || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'Net',getValue: row => +row.Amount__,
                total: rows => rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'ATV', getValue: row => +(row.Amount__ / row.TrxCount),
                total: rows => {
                  const totalAmount = rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0);
                  const totalTRX = rows.reduce((sum, r) => sum + (+r.TrxCount || 0), 0);
                  return totalAmount ? (totalAmount / totalTRX)  : 0;
                },align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'Cost',getValue: row => +row.LandCost,
                total: rows => rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'Gross Profit',getValue: row => +(row.Amount__ - row.LandCost),
                total: rows => rows.reduce((sum, r) => sum + (+(r.Amount__ - r.LandCost) || 0), 0),
                align: 'right',cellFormat: '#,##0.00' 
              },
              {label: 'GP %',getValue: row => row.Amount__ ? ((row.Amount__ - row.LandCost) / row.Amount__) * 100 : 0,
                total: rows => {
                  const totalAmount = rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0);
                  const totalCost = rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0);
                  return totalAmount ? ((totalAmount - totalCost) / totalAmount) * 100 : 0;
                },align: 'right',cellFormat: 'percent' 
              },
              {label: 'CTS %',getValue: (row, rows) => {
                  const totalAmount = rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0);
                  return totalAmount ? (row.Amount__ / totalAmount) * 100 : 0;
                },align: 'right',totalLabel: '100%',cellFormat: 'percent' 
              }
          ];
          
        const titleRows = generateTitleRows(columnConfig, titleRowsContent, 0);
        printReportExcel(data, columnConfig, colWidths, titleRows, 'Sales Ranking By Location');
    })

}

// Wait for the DOM to fully load before adding the event listener
document.addEventListener('DOMContentLoaded', () => {
    const menuReportElements = document.querySelectorAll('.salesRankingByLocation'); //<li>
    const rankRepoDiv = document.getElementById('SalesRankStore');
    const closeRepo = document.getElementById('closeRepo1');
    
    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

    menuReportElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('SalesRankStore')
        });
    });

});


document.getElementById('saleRank1').addEventListener('click',() => {
    try {
        FiltrRec('SaleRnk1').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));
    
            const dDateFrom = filterData[0];
            const dDate__To = filterData[1];
            const cLocation = filterData[2];
            const cUsersCde = filterData[3];
            const cOtherCde = filterData[4];
            const cDescript = filterData[5];
            const cBrandNum = filterData[6];
            const cCategNum = filterData[7];
            const cItemType = filterData[8];
            const cItemDept = filterData[9];
            const cStoreGrp = filterData[12];
            
            SalesCompStore(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, cStoreGrp, dDateFrom, dDate__To, cDescript);

            getFilters(filterData,'pCompStore')
           
        });

    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")
    }
})

// ==========================================================================
async function SalesRankStock(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, cStoreGrp, dDateFrom, dDateTo__, cDescript) {

    document.getElementById('loadingIndicator').style.display = 'flex';
    let { timerInterval, elapsedTime } = startTimer(); 
    let data = null;
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/sales/SalesRankStock');
        const params = new URLSearchParams();
        if (cBrandNum) params.append('BrandNum', cBrandNum);
        if (cUsersCde) params.append('UsersCde', cUsersCde);
        if (cOtherCde) params.append('OtherCde', cOtherCde);
        if (cCategNum) params.append('CategNum', cCategNum);
        if (cItemDept) params.append('ItemDept', cItemDept);
        if (cItemType) params.append('ItemType', cItemType);
        if (cLocation) params.append('Location', cLocation);
        if (cStoreGrp) params.append('StoreGrp', cStoreGrp);
        if (dDateFrom) params.append('DateFrom', dDateFrom); 
        if (dDateTo__) params.append('DateTo__', dDateTo__); 
        if (cDescript) params.append('Descript', cDescript); 

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        let nTotalQty = 0
        let nTotalPrc = 0
        let nTotalDsc = 0
        let nTotalAmt = 0
        let nTotalCos = 0
        // let nTotalGro = 0
        // let nGP_Prcnt = 0
        // let nGP_Total = 0
    
        const listCounter=document.getElementById('saleRank3Counter')
        data = await response.json();
        listCounter.innerHTML=`${data.length} Records`;
        showNotification(`${data.length} Records fetched`);
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

        if (Array.isArray(data)) {
            data.forEach(item => {
                nTotalQty+=item.Quantity
                nTotalPrc+=item.ItemPrce
                nTotalDsc+=(item.ItemPrce-item.Amount__)
                nTotalAmt+=item.Amount__
                nTotalCos+=item.LandCost
            });
        }
        // if (nTotalAmt !== 0) {
        //     nGP_Total = ((nTotalAmt-nTotalCos) / nTotalAmt) * 100; // GP% formula
        // }

        const salesRankBrandDiv = document.getElementById('SalesRankStock');
        salesRankBrandDiv.classList.add('active');

        const reportBody = document.getElementById('salesRankStock');
        reportBody.style.maxHeight = "80%";
        // if (data.length > 30) {
        //     reportBody.style.height='700px'
        // }
        reportBody.innerHTML = '';  // Clear previous content

        // Define the table structure
        const rankTable = `
            <table id="salesRankTable1">
                <thead id="rankTHead1">
                    <tr>
                        <th>Rank</th>
                        <th>Stock No</th>
                        <th>Bar Code</th>
                        <th>Description</th>
                        <th>Brand</th>
                        <th>Department</th>
                        <th>Classification</th>
                        <th>Quantity</th>
                        <th>Gross</th>
                        <th>Discount</th>
                        <th>Net</th>
                        <th>Cost</th>
                    </tr>
                </thead>
                <tbody id="rankTBody">
                    ${data.map((item,index) => {
                        return `
                            <tr style=" color: ${item.Outright===2 ? 'rgb(7, 130, 130)' : 'black'}"">
                                <td style="text-align: center">${index+1 || 'N/A'}</td>
                                <td class="colNoWrap" style="text-align: left">${item.UsersCde || 'N/A'}</td>
                                <td class="colNoWrap" style="text-align: left">${item.OtherCde || 'N/A'}</td>
                                <td class="colNoWrap">${item.Descript.substring(0,30) || 'N/A'}</td>
                                <td class="colNoWrap">${item.BrandNme || 'N/A'}</td>
                                <td class="colNoWrap">${item.DeptDesc || 'N/A'}</td>
                                <td class="colNoWrap">${item.TypeDesc.substring(0,30) || 'N/A'}</td>
                                <td style="text-align: center">${item.Quantity || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ItemPrce) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ItemPrce - item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right; font-weight: bold">${formatter.format(item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.LandCost) || 'N/A'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr style="height: 2px"></tr>
                    <tr style="font-weight: bold">
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td style="text-align: right">Total</td>
                        <td style="text-align: center">${nTotalQty || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalPrc) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalDsc) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalAmt) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalCos) || 'N/A'}</td>
                    </tr>
                 </tfoot>
            </table>
        `;
        
        // Add the table HTML to the div
        reportBody.innerHTML = rankTable;

        // Show store ranking chart
        document.getElementById('stockRankChart').style.display='flex';
        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        document.getElementById('printStockRankXLS').disabled = false
        rankStockSales(data, dateRange)
       
    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error,'Fetch error')
    } finally {
        // Hide loading spinner once data is fetched or an error occurs
        document.getElementById('loadingIndicator').style.display = 'none';
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''
    }

    document.getElementById('printStockRankXLS').addEventListener('click', () => {

        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        const titleRowsContent = [
            { text: cCompName, style: { fontWeight: 'bold', fontSize: 14 } },
            { text: 'Sales Ranking by SKU', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
            { text: dateRange, style: { fontStyle: 'italic', fontSize: 12 } },
            { text: '' } // Spacer row
            ];

            const colWidths = [
                { width: 20 },{ width: 20 },{ width: 30 },{ width: 25 },{ width: 10 },
                { width: 15 },{ width: 15 },{ width: 15 },{ width: 15 },
            ];
        
            const columnConfig = [
                { label: 'Stock No.',getValue: row => row.UsersCde,type: 'string',align: 'left'},
                { label: 'Bar Code',getValue: row => row.OtherCde,type: 'string',align: 'left'},
                { label: 'Description',getValue: row => row.Descript.substring(0,30),type: 'string',align: 'left'},
                { label: 'Brand',getValue: row => row.BrandNme,type: 'string',align: 'left',totalLabel: 'TOTALS:'},
                { label: 'Department',getValue: row => row.DeptDesc,type: 'string',align: 'left',totalLabel: 'TOTALS:'},
                { label: 'Classification',getValue: row => row.TypeDesc,type: 'string',align: 'left',totalLabel: 'TOTALS:'},
                { label: 'Quantity',getValue: row => +row.Quantity,
                total: rows => rows.reduce((sum, r) => sum + (+r.Quantity || 0), 0),
                align: 'right',type: 'integer',cellFormat: '#,##0'},
                { label: 'Gross',getValue: row => +row.ItemPrce,
                total: rows => rows.reduce((sum, r) => sum + (+r.ItemPrce || 0), 0),
                align: 'right',cellFormat: '#,##0.00'},
                { label: 'Discount',getValue: row => +(row.ItemPrce - row.Amount__),
                total: rows => rows.reduce((sum, r) => sum + (+(r.ItemPrce - r.Amount__) || 0), 0),
                align: 'right',cellFormat: '#,##0.00'},
                { label: 'Net',getValue: row => +row.Amount__,
                total: rows => rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0),
                align: 'right',cellFormat: '#,##0.00'},
                { label: 'Cost',getValue: row => +row.LandCost,
                total: rows => rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0),
                align: 'right',cellFormat: '#,##0.00'}
            ];
            
            const titleRows = generateTitleRows(columnConfig, titleRowsContent, 0);

            printReportExcel(data, columnConfig, colWidths, titleRows, 'Sales Ranking by SKU');
    })

}

// Wait for the DOM to fully load before adding the event listener
document.addEventListener('DOMContentLoaded', () => {
    const menuReportElements = document.querySelectorAll('.salesRankingByStock');
    const rankRepoDiv = document.getElementById('SalesRankStock');
    const closeRepo = document.getElementById('closeRepo3');
    
    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

    // Add event listener to each element with the necessary arguments
    menuReportElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('SalesRankStock')
        });
    });

});

document.getElementById('saleRank3').addEventListener('click', () => {
    try {
        FiltrRec('SaleRnk3').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));
    
            const dDateFrom = filterData[0];
            const dDate__To = filterData[1];
            const cLocation = filterData[2];
            const cUsersCde = filterData[3];
            const cOtherCde = filterData[4];
            const cDescript = filterData[5];
            const cBrandNum = filterData[6];
            const cCategNum = filterData[7];
            const cItemType = filterData[8];
            const cItemDept = filterData[9];
            const cStoreGrp = filterData[12];

            SalesRankStock(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, cStoreGrp, dDateFrom, dDate__To, cDescript);

            getFilters(filterData,'pRankStock')


        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")
    }

})


// ==========================================================================
async function DailySalesSum(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, cStoreGrp, dDateFrom, dDateTo__, cDescript) {

    let cLocaName = ''
    const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
    const dayNames =['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    try {
        const url = new URL('http://localhost:3000/lookup/location');
        const params = new URLSearchParams();
        if (cLocation) params.append('Location', cLocation);
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) throw new Error('Network response was not ok');
        let LocatTbl = await response.json(); 
        cLocaName = (LocatTbl.length>1) ? 'All Location' : LocatTbl[0].LocaName


    } catch (error) {
        console.error('Fetch error on Location:', error);
    }

    document.getElementById('loadingIndicator').style.display = 'flex';
    let { timerInterval, elapsedTime } = startTimer(); 
    let data = null;

    let nTotalQty = 0
    let nTotalPrc = 0
    let nTotalDsc = 0
    let nTotalAmt = 0
    let nTotalCos = 0
    let nTotalATV = 0
    let nGP_Prcnt = 0
    let nTotalTrx = 0

    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/sales/DailySalesSum');
        const params = new URLSearchParams();
        if (cBrandNum) params.append('BrandNum', cBrandNum);
        if (cUsersCde) params.append('UsersCde', cUsersCde);
        if (cOtherCde) params.append('OtherCde', cOtherCde);
        if (cCategNum) params.append('CategNum', cCategNum);
        if (cItemDept) params.append('ItemDept', cItemDept);
        if (cItemType) params.append('ItemType', cItemType);
        if (cLocation) params.append('Location', cLocation);
        if (cStoreGrp) params.append('StoreGrp', cStoreGrp);
        if (dDateFrom) params.append('DateFrom', dDateFrom); 
        if (dDateTo__) params.append('DateTo__', dDateTo__); 
        if (cDescript) params.append('Descript', cDescript); 

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

   
        data = await response.json();
        showNotification(`${data.length} Records fetched`);
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

        const calcFields = {
            ATV: (nTotalAmt, nTotalTrx) => (nTotalTrx) ? nTotalAmt / nTotalTrx : 0,
            GP_Percentage: (nTotalAmt, nTotalCos) => ((nTotalAmt - nTotalCos) / nTotalAmt) * 100
        };

        if (Array.isArray(data)) {
            data.forEach(item => {
                nTotalTrx+=item.TrxCount
                nTotalQty+=item.Quantity
                nTotalPrc+=item.Gross___
                nTotalDsc+=(item.Gross___-item.Amount__)
                nTotalAmt+=item.Amount__
                nTotalCos+=item.LandCost
            });
        }
        
 
    // Dynamically calculate totals based on field configuration
    nTotalATV = calcFields.ATV(nTotalAmt, nTotalTrx);
    nGP_Prcnt = calcFields.GP_Percentage(nTotalAmt, nTotalCos);

        const salesRankBrandDiv = document.getElementById('DailySalesSum');
        salesRankBrandDiv.classList.add('active');

        const reportBody = document.getElementById('dailySalesSum');
        reportBody.style.maxHeight = "80%";
        reportBody.innerHTML = '';  // Clear previous content

        // Define the table structure
        const salesTable = `
            <table id="salesRankTable1">
                <thead id="rankTHead1">
                    <tr>
                        <th>Date</th>
                        <th>Trx Count</th>
                        <th>Quantity</th>
                        <th>Gross</th>
                        <th>Discount</th>
                        <th>Net</th>
                        <th>ATV</th>
                        <th>Cost</th>
                        <th>Gross Profit</th>
                        <th>GP%</th>
                    </tr>
                </thead>
                <tbody id="salesTBody">
                    ${data.map(item => {
                        return `
                            <tr>
                                <td style="text-align: left;${formatDate(item.Date____,'MM/DD/YYYY') ? (new Date(item.Date____).getDay() === 0 ? 'color: red;' : '') : ''}">
                                    ${formatDate(item.Date____,'MM/DD/YYYY') || 'N/A'} - ${dayNames[new Date(item.Date____).getDay()]}
                                </td>
                                <td style="text-align: center">${item.TrxCount || 'N/A'}</td>
                                <td style="text-align: center">${item.Quantity || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Gross___) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Gross___ - item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ATV_____) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.LandCost) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Amount__-item.LandCost) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.GrossPct)+'%' || 'N/A'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr style="height: 2px"></tr>
                    <tr style="font-weight: bold">
                        <td style="text-align: right">Total</td>
                        <td style="text-align: center">${nTotalTrx || 'N/A'}</td>
                        <td style="text-align: center">${nTotalQty || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalPrc) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalDsc) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalAmt) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalATV) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalCos) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalAmt-nTotalCos) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nGP_Prcnt)+'%' || 'N/A'}</td>
                    </tr>
                 </tfoot>
            </table>
        `;
        
        // Add the table HTML to the div
        reportBody.innerHTML = salesTable;

        // Show chart
        document.getElementById('dailySalesChart').style.display='flex';
        document.getElementById('printDailySalesPDF').disabled = false
        // document.getElementById('printDailySalesXLS').disabled = false
        setDailyChart(data, cLocaName)
       
    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error,'Fetch error')
    } finally {
        // Hide loading spinner once data is fetched or an error occurs
        document.getElementById('loadingIndicator').style.display = 'none';
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''
    }

    document.getElementById('printDailySalesPDF').addEventListener('click', async () => {

        const headerData = [
            `${dateRange}`,
            `Location : ${cLocaName}`,
            `Net Sales: ${formatter.format(nTotalAmt)}`,
            `Avg Daily Trx: ${formatter.format(nTotalTrx / data.length)}`,
            `Avg Daily Sales: ${formatter.format(nTotalAmt / data.length)}`,
        ];
        const colWidths = [36, 15, 15, 20, 20, 20, 15, 20, 20, 10]; 
        const columns = ['Date','Trx Cnt','Quantity','Gross','Discount','Net','ATV','Cost','Gross Profit','GP%'];
        const itemFields = [
            (item) => formatDate(item.Date____,'MM/DD/YYYY')+' - '+dayNames[new Date(item.Date____).getDay()],
            'TrxCount','Quantity','Gross___',
            (item, formatter) => formatter.format(item.Gross___ - item.Amount__),
            'Amount__','ATV_____','LandCost',
            (item, formatter) => formatter.format(item.Amount__ - item.LandCost),
            ,'GrossPct'
              
        ];    
        const fieldTypes = [
            'function', 
            'integer',
            'integer',
            'number',      
            'calculated',   
            'number',      
            'number',      
            'number',      
            'calculated',   
            'number'      
        ];        

        
        // columns to create totals based on itemFields array
        const createTotals = [true,true,true,true,true,true,true,true,true,true]
        const totalsValue = ['Totals:',nTotalTrx,nTotalQty,nTotalPrc,nTotalDsc,nTotalAmt,
            nTotalATV,nTotalCos,nTotalAmt-nTotalCos,nGP_Prcnt]

        printFormPDF(headerData, data, itemFields, createTotals, totalsValue ,colWidths, 
            columns, fieldTypes, window.base64Image, ['letter','portrait'], formatter, 'Daily Sales Summary')
    });


}


document.getElementById('listSales').addEventListener('click', () => {
    try {
        FiltrRec('DailySales').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));
    
            const dDateFrom = filterData[0];
            const dDate__To = filterData[1];
            const cLocation = filterData[2];
            const cUsersCde = filterData[3];
            const cOtherCde = filterData[4];
            const cDescript = filterData[5];
            const cBrandNum = filterData[6];
            const cCategNum = filterData[7];
            const cItemType = filterData[8];
            const cItemDept = filterData[9];
            const cStoreGrp = filterData[12];

            DailySalesSum(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, cStoreGrp, dDateFrom, dDate__To, cDescript);

            getFilters(filterData,'pDailySales')

        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")
    }

})

// Wait for the DOM to fully load before adding the event listener
document.addEventListener('DOMContentLoaded', () => {
    const menuReportElements = document.querySelectorAll('.dailySalesSum'); //<li>
    const saleRepoDiv = document.getElementById('DailySalesSum');
    const closeRepo = document.getElementById('closeRepo4');
    
    closeRepo.addEventListener('click', () => {
        saleRepoDiv.classList.remove('active');
    });

    menuReportElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('DailySalesSum')
        });
    });

});


// // ================================================
// async function getFilters(filterData, filterIdCon){
//     const aFilters = []
//     for (let i = 0; i < filterData.length; i++) {

//         if (i===0 && filterData[0] && filterData[1]) {
//             aFilters.push(`Date From: ${formatDate(filterData[0],'MM/DD/YYYY')}  To: ${formatDate(filterData[1],'MM/DD/YYYY')} `) 
//         }

//         if (i===2 && filterData[i]) {
//             const url = new URL(`http://localhost:3000/lookup/location?Location=${filterData[i].trim()}`);
//             const res = await fetch(url);
//             const data = await res.json()
//             aFilters.push(`Location: ${data[0].LocaName}    `) 
//         }
//         if (i===3 && filterData[i]) {
//             aFilters.push(`Stock No: ${filterData[i].trim()}   `) 
//         }
//         if (i===4 && filterData[i]) {
//             aFilters.push(`Bar Code: ${filterData[i].trim()}   `) 
//         }
//         if (i===5 && filterData[i]) {
//             aFilters.push(`Description: ${filterData[i].trim()}   `) 
//         }
//         if (i===6 && filterData[i]) {
//             const url = new URL(`http://localhost:3000/product/brands?BrandNum=${filterData[i].trim()}`);
//             const res = await fetch(url);
//             const data = await res.json()
//             aFilters.push(`Brand: ${data[0].BrandNme}   `) 
//         }
//         if (i===12 && filterData[i]) {
//             const url = new URL(`http://localhost:3000/lookup/storegrp?StoreGrp=${filterData[i].trim()}`);
//             const res = await fetch(url);
//             const data = await res.json()
//             aFilters.push(`Store Group: ${data[0].StoreGrp} `) 
//         }

//         if (i===17 && filterData[i]) {
//             aFilters.push(`Supplier: ${filterData[i].trim()}   `) 
//         }
//         if (i===18 && filterData[i]) {
//             aFilters.push(`Stock Out From: ${filterData[i].trim()}   `) 
//         }
//         if (i===19 && filterData[i]) {
//             aFilters.push(`Stock Out To: ${filterData[i].trim()}   `) 
//         }

//     }

//     document.querySelectorAll('.showFilterScope').forEach( e => e.style.display = 'flex')
//     document.getElementById(filterIdCon).innerText = ''

//     console.log(filterIdCon)
//     aFilters.forEach(text => {
//         const span = document.createElement("span");
//         span.textContent = text;
//         document.getElementById(filterIdCon).appendChild(span)
//     });
//     return
// }


// SALES CHARTS SECTION HERE ==================================
function setDailyChart(data, cLocaName) {
    let myChart5 = window.myChart5 || null;
    
    try {
        
        const dateTotals = {};
        const backgroundColors = [];
        const borderWidth = [];
        const borderColor = [];
        const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        const ctx = document.getElementById('dailyLast30days').getContext('2d');

        if (myChart5) myChart5.destroy();

        // Dates and totals
        const dates = data.map(entry => new Date(entry.Date____));
        const maxDate = new Date(Math.max(...dates));
        const minDate = new Date(maxDate);
        minDate.setDate(minDate.getDate() - 30); // 30 days before maxDate


        // Filter data between minDate and maxDate
        const filteredData = data.filter(entry => {
            const entryDate = new Date(entry.Date____);
            return entryDate >= minDate && entryDate <= maxDate;
        });

        filteredData.forEach(entry => {
            const dayName = new Date(entry.Date____);
            const dayOfWeek = dayNames[dayName.getDay()];
            const date = formatDate(entry.Date____,'MM/DD/YYYY').substring(0, 5) + ' ' + dayOfWeek;
            const total = Math.round(entry.Amount__);

            // Accumulate totals by date
            if (!dateTotals[date]) {
                dateTotals[date] = 0;
            }
            dateTotals[date] += total;

            // Set background color for weekends
            backgroundColors.push(dayName.getDay() === 0 ? 'rgba(255,0,0,0.2)' : 'rgba(75, 192, 192, 0.2)');
            borderWidth.push(dayName.getDate() === 1 ? 2 : 1); // Emphasize first day
            borderColor.push(dayName.getDate() === 1 ? 'rgb(0,0,0)' : 'rgba(75, 192, 192, 1)');
        });

        // Sort the date labels and format them as '12/12-Th', '13/12-Fr', etc.
        const aLabels = Object.keys(dateTotals).sort((a, b) => new Date(a) - new Date(b));
        const aTotals = aLabels.map(date => dateTotals[date]);

        // Create datasets
        const oDataSetBar = {
            label: 'Day Total',
            data: aTotals,
            backgroundColor: backgroundColors,
            borderColor: borderColor,
            borderWidth: borderWidth,
            type: 'bar',
            datalabels: {
                display: false // Disable data labels
            }

        };

        const oDataSetLine = {
            label: 'Day Total',
            data: aTotals,
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderWidth: 0.5,
            tension: 0.2,
            type: 'line'
        };

        // Initialize chart with sorted labels
        myChart5 = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: aLabels, // X-axis labels sorted chronologically
                datasets: [oDataSetBar, oDataSetLine]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Daily Sales Summary - ${cLocaName.trim()}`,
                        font: {
                            size: 14
                        }
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });

        window.myChart5 = myChart5;

    } catch (error) {
        console.error('Error fetching data:', error);
        displayErrorMsg(error,'Error processing chart data')
    }
}

// ===================================================
async function rankStockSales(data, dateRange) {
   
    let myChart4 = window.myChart4 || null;

    try {
        const stockData = data;
        const stockMap = {};
        
        stockData.forEach(item => {
            if (!stockMap[item.UsersCde]) {
                stockMap[item.UsersCde] = { Amount__: 0, Outright: item.Outright }; // Include Outright here
            }
            stockMap[item.UsersCde].Amount__ += Math.round(item.Amount__);
        });            

        // Sort the stockMap by amount
        let sortedStocks = Object.entries(stockMap)
            .map(([UsersCde, values]) => ({ UsersCde, ...values }))
            .slice(0, 30);


        // Now assign background colors after sorting
        const backgroundColors = sortedStocks.map(item => 
            item.Outright === 1 ? 'rgba(54, 162, 235, 0.6)' : 'rgb(7, 130, 130, 0.6)'
        );

        const labels = sortedStocks.map(item => item.UsersCde.substring(0, 15).trim());
        const curreamtData = sortedStocks.map(item => item.Amount__);

        // // Function to round up to the nearest multiple of step
        // const getMagnitudeStep = (value) => {
        //     const magnitude = Math.floor(Math.log10(value));
        //     return Math.pow(10, magnitude); // Returns the nearest power of 10
        // };

        // // Function to round up to the nearest appropriate step
        // const roundUpToDynamicStep = (value) => {
        //     const step = getMagnitudeStep(value);
        //     return Math.ceil(value / step) * step;
        // };

        // // Calculate the maximum value for the x-axis
        // const maxCurreamt = Math.max(...curreamtData);
        // // Round up maxValue to the nearest appropriate step
        // const roundedMaxValue = roundUpToDynamicStep(maxCurreamt);

        if (myChart4) myChart4.destroy();

        const getChartOptions = () => ({
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    // max: roundedMaxValue, // Use the dynamically rounded max value
                    ticks: {
                        font: { family: 'Arial Narrow', size: 12 },
                        color: 'black',
                        padding: 5, 
                    }
                },
                y: {
                    beginAtZero: true,
                    title: { display: false },
                    ticks: {
                        autoSkip: false,
                        font: { family: 'Arial Narrow', size: 12 }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: dateRange,  // Your desired title text here
                    font: {
                        family: 'Arial',
                        size: 16
                    },
                    color: 'black',  // Title text color
                    padding: {
                        top: 20,  // Space between title and chart
                        bottom: 10
                    }
                },
            }
        });


        const ctx = document.getElementById('stockChart1').getContext('2d');
        myChart4 = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: dateRange,
                    data: curreamtData,
                    backgroundColor: backgroundColors, 
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: getChartOptions(),
        });

        window.myChart4 = myChart4;

    } catch (error) {
        console.error('Error fetching data:', error);
        displayErrorMsg(error,'Error processing chart data')
    }
}

// ===================================================
async function setStoreChart(chartData, dateRange) {

    try {
        const storeData = chartData;
        const storeChart1Element = document.getElementById('storeChart1');
        const storeChart2Element = document.getElementById('storeChart2');

        // Declare variables for chart instances
        let myChart1 = window.myChart1 || null;
        let myChart2 = window.myChart2 || null;

        // Destroy existing charts if they exist
        if (myChart1) {
            myChart1.destroy();
            window.myChart1 = null;  // Reset reference
        }
        if (myChart2) {
            myChart2.destroy();
            window.myChart2 = null;  // Reset reference
        }

        // Clear the canvas context manually (important when reusing canvas elements)
        storeChart1Element.getContext('2d').clearRect(0, 0, storeChart1Element.width, storeChart1Element.height);
        storeChart2Element.getContext('2d').clearRect(0, 0, storeChart2Element.width, storeChart2Element.height);

        // Aggregate totalamt per storname
        const storeTotals = storeData.reduce((acc, entry) => {
            const totalAmount = parseFloat(entry.Amount__) || 0;
            const storeName = entry.LocaName.trim(); 
            acc[storeName] = (acc[storeName] || 0) + totalAmount;
            return acc;
        }, {});

        // Convert aggregated data into an array for charting
        const topStores = Object.entries(storeTotals)
            .sort((a, b) => b[1] - a[1]) // Sort by totalamt in descending order
            .slice(0, 30); // Take the top 30 stores

        const storeNames = topStores.map(entry => entry[0]); // Store names
        const storeAmounts =topStores.map(entry => Math.round(entry[1])); // Total amounts

        const ctx1 = storeChart1Element.getContext('2d');
        myChart1 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: storeNames,
                datasets: [{
                    label: 'Top 30 Stores',
                    data: storeAmounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                backgroundColor: '#282828',  // Set the background color of the chart area
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10
                    }
                },
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                family: 'Arial Narrow',
                                size: 12
                            },
                            color: 'black',  // x-axis tick labels color
                            padding: 5,  // Adjust padding between x-axis labels and canvas
                        },
                        grid: {
                            color: '#d3d3d3',  // Set grid color for x-axis
                        }
                    },
                    y: {
                        ticks: {
                            font: {
                                family: 'Arial Narrow',
                                size: 12
                            },
                            color: 'black',  // y-axis tick labels color
                        },
                        grid: {
                            color: '#d3d3d3',  // Set grid color for y-axis
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: dateRange,  // Your desired title text here
                        font: {
                            family: 'Arial',
                            size: 16
                        },
                        color: 'black',  // Title text color
                        padding: {
                            top: 20,  // Space between title and chart
                            bottom: 10
                        }
                    }
                }
            }
        });


    const storeGroupTotals = chartData.reduce((acc, entry) => {
        const totalAmount = parseFloat(entry.Amount__) || 0;
        const storeGroup = entry.StoreGrp.trim();
        acc[storeGroup] = (acc[storeGroup] || 0) + totalAmount;
        return acc;
    }, {});

    const sortedStoreGroups = Object.entries(storeGroupTotals).sort((a, b) => b[1] - a[1]);

    const storeGroupLabels = sortedStoreGroups.map(entry => entry[0]);
    const storeGroupValues = sortedStoreGroups.map(entry => entry[1]);

    const totalSales = Object.values(storeGroupTotals).reduce((acc, value) => acc + value, 0);
    const storeGroupPercentages = storeGroupValues.map(value => (value / totalSales * 100).toFixed(2));

    const generateRandomColor = () => {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgba(${r}, ${g}, ${b}, 0.6)`;
    };

    const backgroundColors = storeGroupLabels.map(() => generateRandomColor());
    const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

    // Create the doughnut chart
    const ctx2 = storeChart2Element.getContext('2d');
    myChart2 = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: storeGroupLabels,
            datasets: [{
                label: 'Contribution to Total Sales',
                data: storeGroupValues,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Arial Narrow',
                            size: 10
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const percentage = storeGroupPercentages[context.dataIndex];
                            return `${context.label}: ${percentage}%`;
                        }
                    }
                },
                datalabels: {
                    anchor: 'end', // Anchor labels at the end of the arc
                    align: 'end', // Align labels outside the arc
                    offset: 10, // Distance from the arc to the label
                    display: 'auto', // Automatically hide overlapping labels
                    color: '#000', // Label color (black for better visibility)
                    font: {
                        weight: 'bold',
                        size: 10,
                        family: 'Arial Narrow'
                    },
                    formatter: (value, context) => {
                        const percentage = storeGroupPercentages[context.dataIndex];
                        return `${percentage}%`;
                    },
                    // Enable leader lines (callouts)
                    textAlign: 'center',
                    padding: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Optional: Background for labels
                    borderRadius: 3, // Optional: Rounded corners for label background
                    clip: false, // Ensure labels are not clipped outside the canvas
                    // Configure leader lines
                    labels: {
                        value: {
                            color: '#000'
                        }
                    },
                    // Enable callout lines
                    callout: {
                        display: true, // Show leader lines
                        borderColor: '#000', // Line color
                        borderWidth: 1 // Line thickness
                    }
                }
            }
        }
    });        


        // Store the chart instances globally if needed (optional)
        window.myChart1 = myChart1;
        window.myChart2 = myChart2;

    } catch (error) {
        console.error('Error processing chart data:', error);
        displayErrorMsg(error,"'Error processing chart data'")
    }
}


// ===================================================
async function SalesCompChart(data, showData) {
    try {
        let current_Chart = null;
        let previousChart = null;

        // Dynamically create canvas chart IDs based on the showData value
        const currentChartId = `${showData.toLowerCase()}Chart1`;  // e.g., 'brandChart1' or 'classChart1'
        const previousChartId = `${showData.toLowerCase()}Chart2`; // e.g., 'brandChart2' or 'classChart2'

        // Assign the canvas elements based on the dynamic IDs
        current_Chart = document.getElementById(currentChartId);
        previousChart = document.getElementById(previousChartId);

        // Destroy existing charts if they exist
        if (window.myCharts?.[currentChartId]) window.myCharts[currentChartId].destroy();
        if (window.myCharts?.[previousChartId]) window.myCharts[previousChartId].destroy();

        // Clear canvas manually
        current_Chart.getContext('2d').clearRect(0, 0, current_Chart.width, current_Chart.height);
        previousChart.getContext('2d').clearRect(0, 0, previousChart.width, previousChart.height);

        // Initialize chart registry if needed
        window.myCharts = window.myCharts || {};

        // Aggregate amounts by dynamic field (e.g., BrandNme or TypeDesc)
        const dataFieldMap = {};
        data.forEach(item => {
            const fieldValue = item[showData];  // Access the dynamic field using showData
            const amountCurrent = parseFloat(item.Amount__) || 0;
            const amountPrevious = parseFloat(item.PrvMoAmt) || 0;

            // If there's no entry for this field value, create an empty one
            if (!dataFieldMap[fieldValue]) {
                dataFieldMap[fieldValue] = { current: 0, previous: 0 };
            }

            // Aggregate the values
            dataFieldMap[fieldValue].current += amountCurrent;
            dataFieldMap[fieldValue].previous += amountPrevious;
        });

        // Convert to array and sort by current amount descending
        const sortedDataFields = Object.entries(dataFieldMap)
            .map(([fieldValue, vals]) => ({ [showData]: fieldValue, ...vals }))
            .sort((a, b) => b.current - a.current);

        const top20 = sortedDataFields.slice(0, 20);
        const others = sortedDataFields.slice(20);

        const dataGroupLabels = top20.map(item => item[showData]);
        const dataGroupValuesCurrent = top20.map(item => item.current);
        const dataGroupValuesPrevious = top20.map(item => item.previous);

        // Sum 'OTHERS'
        if (others.length > 0) {
            const othersCurrent = others.reduce((sum, b) => sum + b.current, 0);
            const othersPrevious = others.reduce((sum, b) => sum + b.previous, 0);

            dataGroupLabels.push('OTHERS');
            dataGroupValuesCurrent.push(othersCurrent);
            dataGroupValuesPrevious.push(othersPrevious);
        }

        // const totalValue1 = dataGroupValuesCurrent.reduce((acc, v) => acc + v, 0);
        // const dataGroupPercentage1 = dataGroupValuesCurrent.map(v => ((v / totalValue1) * 100).toFixed(2));
        // const dataGroupPercentage1 = dataGroupValuesCurrent

        // const totalValue2 = dataGroupValuesPrevious.reduce((acc, v) => acc + v, 0);
        // const dataGroupPercentage2 = dataGroupValuesPrevious.map(v => ((v / totalValue2) * 100).toFixed(2));
        // const dataGroupPercentage2 = dataGroupValuesPrevious


        const generateRandomColor = () => {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            return `rgba(${r}, ${g}, ${b}, 0.6)`;
        };

        const backgroundColors = dataGroupLabels.map(() => generateRandomColor());
        const borderColors = backgroundColors.map(c => c.replace('0.6', '1'));

        // Calculate the maximum value for the x-axis
        const maxiCurValue = Math.max(...dataGroupValuesCurrent);
        const maxiPrvValue = Math.max(...dataGroupValuesPrevious);
        const maximumValue = Math.max(maxiCurValue, maxiPrvValue);
        const roundedMaxValue = Math.ceil(maximumValue);

        // Chart options (shared)
        const Option1 = {
            responsive: true,
            indexAxis: 'y',
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.raw || 0;
                            return `${value}`;
                        }
                    }
                },
                datalabels: {
                    anchor: 'center',
                    align: 'end',
                    formatter: (value, context) => {
                        const displayValue = dataGroupValuesCurrent[context.dataIndex] || 0;
                        return `${Math.round(displayValue)}`;
                    },
                    color: '#000',
                    font: { weight: 'bold', size: 10 }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: roundedMaxValue,
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        };

        const Option2 = {
            responsive: true,
            indexAxis: 'y',
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.raw || 0;
                            return `${value}`;
                        }
                    }
                },
                datalabels: {
                    anchor: 'center',
                    align: 'end',
                    formatter: (value, context) => {
                        const displayValue = dataGroupValuesPrevious[context.dataIndex] || 0;
                        return `${Math.round(displayValue)}`;
                    },
                    color: '#000',
                    font: { weight: 'bold', size: 10 }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: roundedMaxValue,
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        };


        // Render current chart (Current Amount__)
        window.myCharts[currentChartId] = new Chart(current_Chart.getContext('2d'), {
            type: 'bar',
            data: {
                labels: dataGroupLabels,
                datasets: [{
                    label: 'Current',
                    data: dataGroupValuesCurrent,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: Option1
        });

        // Render previous chart (Previous Month Amount)
        window.myCharts[previousChartId] = new Chart(previousChart.getContext('2d'), {
            type: 'bar',
            data: {
                labels: dataGroupLabels,
                datasets: [{
                    label: 'Previous',
                    data: dataGroupValuesPrevious,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: Option2
        });

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

        if (i===2 && filterData[i]) {
            const url = new URL(`http://localhost:3000/lookup/location?Location=${filterData[i].trim()}`);
            const res = await fetch(url);
            const data = await res.json()
            aFilters.push(`Location: ${data[0].LocaName}    `) 
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
        if (i===12 && filterData[i]) {
            const url = new URL(`http://localhost:3000/lookup/storegrp?StoreGrp=${filterData[i].trim()}`);
            const res = await fetch(url);
            const data = await res.json()
            aFilters.push(`Store Group: ${data[0].StoreGrp} `) 
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