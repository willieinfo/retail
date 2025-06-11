import { showReport, showNotification, formatter, formatDate, goMonth, startTimer} from '../FunctLib.js';
import { printFormPDF, printReportExcel, generateTitleRows } from "../PrintRep.js"
import { FiltrRec, displayErrorMsg } from "../FiltrRec.js"

const dDateFrom = new Date(), dDateTo__ = new Date(), 
    dMontFrom = goMonth(new Date(), -1), dMontTo__ = goMonth(new Date(), -1),
    dYearFrom = goMonth(new Date(), -12), dYearTo__ = goMonth(new Date(), -12)

const divRankStore = `
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
                <button id="printStoreRank" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="saleRank1"><i class="fa fa-filter"></i> Filter List</button>
            </div>
        </div>
    </div>
`

const divRankBrand =`
    <div id="SalesRankBrand" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Sales Ranking Report by Brand</span>
            <button id="closeRepo2" class="closeForm">✖</button>
        </div>
        <div class="ReportBody">
            <div id="salesRankBrand" class="ReportBody">
                <table id="salesRankTable1">
                    <thead id="rankTHead1">
                        <tr>
                            <th>Rank</th>
                            <th>Brand</th>
                            <th>Quantity</th>
                            <th>Gross</th>
                            <th>Discount</th>
                            <th>Net</th>
                            <th>Cost</th>
                            <th>Gross Profit</th>
                            <th>GP %</th>
                            <th>CTS %</th>
                        </tr>
                    </thead>
                </table>            
            </div>

            <div id="brandRankChart" class="chartContainer">
                <div id="topBrands">
                    <h5>Top 30 Brands</h5>
                    <canvas id="brandChart1"></canvas>
                </div>
            </div>
        </div>
        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <span id="saleRank2Counter" class="recCounter"></span>
                <button id="printBrandRankPDF" disabled><i class="fa fa-file-pdf"></i> PDF</button>
                <button id="printBrandRank" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="saleRank2"><i class="fa fa-filter"></i> Filter List</button>
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
                            <th>Quantity</th>
                            <th>Gross</th>
                            <th>Discount</th>
                            <th>Net</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                </table>            
            </div>

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
                <button id="printStockRank" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="saleRank3"><i class="fa fa-filter"></i> Filter List</button>
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

            <div id="dailySalesChart" class="chartContainer">
                <div id="daySales">
                    <h5>Last 30 Days</h5>
                    <canvas id="dailyLast30days"></canvas>
                </div>
                    <br>
            </div>
        </div>
        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <button id="printDailySalesPDF" disabled><i class="fa fa-file-pdf"></i> PDF</button>
                <button id="printDailySalesXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="listSales"><i class="fa fa-filter"></i> Filter List</button>
            </div>
        </div>
    </div>
`


const fragment = document.createDocumentFragment();

const div1 = document.createElement('div');
div1.innerHTML = divRankStore;
fragment.appendChild(div1);

const div2 = document.createElement('div');
div2.innerHTML = divRankBrand;
fragment.appendChild(div2);

const div3 = document.createElement('div');
div3.innerHTML = divRankStock;
fragment.appendChild(div3);

const div4 = document.createElement('div');
div4.innerHTML = divDailySales;
fragment.appendChild(div4);

document.body.appendChild(fragment);  // Only one reflow happens here


async function SalesCompStore(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, cStoreGrp, dDateFrom, dDateTo__) {

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

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const listCounter=document.getElementById('saleRank1Counter')
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
                        <th colspan="9">
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
                                <td style="text-align: right">${formatter.format(item.Amount__) || 'N/A'}</td>
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
        document.getElementById('printStoreRank').disabled = false
        setStoreChart(data, dateRange)

        
    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error,'Fetch error')
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
        // Clear the timer once data is fetched
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

    }

    document.getElementById('printStoreRank').addEventListener('click', () => {

        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        const titleRowsContent = [
            { text: 'REGENT TRAVEL RETAIL GROUP', style: { fontWeight: 'bold', fontSize: 14 } },
            { text: 'Sales Ranking by Location', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
            { text: dateRange, style: { fontStyle: 'italic', fontSize: 12 } },
            { text: '' } // Spacer row
          ];
          
          const colWidths = [
              { width: 25 }, // Column A (e.g. Group)
              { width: 30 }, // Column B (e.g. Location)
              { width: 10 }, // Quantity
              { width: 15 }, // Gross
              { width: 15 }, // Discount
              { width: 15 }, // Net
              { width: 15 }, // Cost
              { width: 15 }, // Gross Profit
              { width: 10 }, // GP %
              { width: 10 }  // CTS %
          ];
      
          const columnConfig = [
              {
                label: 'Group',
                getValue: row => row.StoreGrp,
                type: 'string',
                align: 'left'
              },
              {
                label: 'Location',
                getValue: row => row.LocaName,
                type: 'string',
                align: 'left',
                totalLabel: 'TOTALS:'
              },
              {
                label: 'Quantity',
                getValue: row => +row.Quantity,
                total: rows => rows.reduce((sum, r) => sum + (+r.Quantity || 0), 0),
                align: 'right',
                type: 'integer',
                cellFormat: '#,##0' // changed format to cellFormat
              },
              {
                label: 'Gross',
                getValue: row => +row.ItemPrce,
                total: rows => rows.reduce((sum, r) => sum + (+r.ItemPrce || 0), 0),
                align: 'right',
                cellFormat: '#,##0.00' // changed format to cellFormat
              },
              {
                label: 'Discount',
                getValue: row => +(row.ItemPrce - row.Amount__),
                total: rows => rows.reduce((sum, r) => sum + (+(r.ItemPrce - r.Amount__) || 0), 0),
                align: 'right',
                cellFormat: '#,##0.00' // changed format to cellFormat
              },
              {
                label: 'Net',
                getValue: row => +row.Amount__,
                total: rows => rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0),
                align: 'right',
                cellFormat: '#,##0.00' // changed format to cellFormat
              },
              {
                label: 'Cost',
                getValue: row => +row.LandCost,
                total: rows => rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0),
                align: 'right',
                cellFormat: '#,##0.00' // changed format to cellFormat
              },
              {
                label: 'Gross Profit',
                getValue: row => +(row.Amount__ - row.LandCost),
                total: rows => rows.reduce((sum, r) => sum + (+(r.Amount__ - r.LandCost) || 0), 0),
                align: 'right',
                cellFormat: '#,##0.00' // changed format to cellFormat
              },
              {
                label: 'GP %',
                getValue: row => row.Amount__ ? ((row.Amount__ - row.LandCost) / row.Amount__) * 100 : 0,
                total: rows => {
                  const totalAmount = rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0);
                  const totalCost = rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0);
                  return totalAmount ? ((totalAmount - totalCost) / totalAmount) * 100 : 0;
                },
                align: 'right',
                cellFormat: 'percent' // changed format to cellFormat
              },
              {
                label: 'CTS %',
                getValue: (row, rows) => {
                  const totalAmount = rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0);
                  return totalAmount ? (row.Amount__ / totalAmount) * 100 : 0;
                },
                align: 'right',
                totalLabel: '100%',
                cellFormat: 'percent' // changed format to cellFormat
              }
          ];
          
          const titleRows = generateTitleRows(columnConfig, titleRowsContent, 0);
           
          printReportExcel(data, columnConfig, colWidths, titleRows, 'Sales Ranking By Location');
    })

}

// Wait for the DOM to fully load before adding the event listener
document.addEventListener('DOMContentLoaded', () => {
    const salesRankLocationElements = document.querySelectorAll('.salesRankingByLocation'); //<li>
    const rankRepoDiv = document.getElementById('SalesRankStore');
    const closeRepo = document.getElementById('closeRepo1');
    
    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

    salesRankLocationElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('SalesRankStore')
        });
    });

});

async function SalesRankBrand(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, cStoreGrp, dDateFrom, dDateTo__) {

    document.getElementById('loadingIndicator').style.display = 'flex';
    let { timerInterval, elapsedTime } = startTimer(); 
    let data = null;
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/sales/SalesRankBrand');
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
        let nTotalGro = 0
        let nGP_Prcnt = 0
        let nGP_Total = 0
    
        const listCounter=document.getElementById('saleRank2Counter')
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
                nTotalGro+=(item.Amount__-item.LandCost)
            });
        }
        if (nTotalAmt !== 0) {
            nGP_Total = ((nTotalAmt-nTotalCos) / nTotalAmt) * 100; // GP% formula
        }

        const salesRankBrandDiv = document.getElementById('SalesRankBrand');
        salesRankBrandDiv.classList.add('active');

        const reportBody = document.getElementById('salesRankBrand');
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
                        <th>Brand</th>
                        <th>Quantity</th>
                        <th>Gross</th>
                        <th>Discount</th>
                        <th>Net</th>
                        <th>Cost</th>
                        <th>Gross Profit</th>
                        <th>GP %</th>
                        <th>CTS %</th>
                    </tr>
                </thead>
                <tbody id="rankTBody">
                    ${data.map((item,index) => {
                        nGP_Prcnt = 0;
                        if (item.Amount__ !== 0) {
                            nGP_Prcnt = ((item.Amount__ - item.LandCost) / item.Amount__) * 100; // GP% formula
                        }
                        return `
                            <tr style=" color: ${item.Outright===2 ? 'rgb(7, 130, 130)' : 'black'}">
                                <td style="text-align: center">${index+1 || 'N/A'}</td>
                                <td class="colNoWrap">${item.BrandNme || 'N/A'}</td>
                                <td style="text-align: center">${item.Quantity || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ItemPrce) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ItemPrce - item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.LandCost) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Amount__ - item.LandCost ) || 'N/A'}</td>
                                <td>${nGP_Prcnt ? nGP_Prcnt.toFixed(2) + '%' : 'N/A'}</td>
                                <td>${(item.Amount__ / nTotalAmt *100).toFixed(2) + '%'|| 'N/A'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr style="height: 2px"></tr>
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
                        <td>100%</td>
                    </tr>
                 </tfoot>
            </table>
        `;
        
        // Add the table HTML to the div
        reportBody.innerHTML = rankTable;

        // Show store ranking chart
        document.getElementById('brandRankChart').style.display='flex';
        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        document.getElementById('printBrandRank').disabled = false
        rankBrandSales(data, dateRange)
       
    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error,'Fetch error')
    } finally {
        // Hide loading spinner once data is fetched or an error occurs
        document.getElementById('loadingIndicator').style.display = 'none';
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

    }

    document.getElementById('printBrandRank').addEventListener('click', () => {

        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        const titleRowsContent = [
            { text: 'REGENT TRAVEL RETAIL GROUP', style: { fontWeight: 'bold', fontSize: 14 } },
            { text: 'Sales Ranking by Brand', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
            { text: dateRange, style: { fontStyle: 'italic', fontSize: 12 } },
            { text: '' } // Spacer row
          ];

          const colWidths = [
              { width: 25 }, // Brand
              { width: 10 }, // Quantity
              { width: 15 }, // Gross
              { width: 15 }, // Discount
              { width: 15 }, // Net
              { width: 15 }, // Cost
              { width: 15 }, // Gross Profit
              { width: 10 }, // GP %
              { width: 10 }  // CTS %
          ];
      
          const columnConfig = [
              {
                label: 'Brand',
                getValue: row => row.BrandNme,
                type: 'string',
                align: 'left',
                totalLabel: 'TOTALS:'
              },
              {
                label: 'Quantity',
                getValue: row => +row.Quantity,
                total: rows => rows.reduce((sum, r) => sum + (+r.Quantity || 0), 0),
                align: 'right',
                type: 'integer',
                cellFormat: '#,##0' // changed format to cellFormat
              },
              {
                label: 'Gross',
                getValue: row => +row.ItemPrce,
                total: rows => rows.reduce((sum, r) => sum + (+r.ItemPrce || 0), 0),
                align: 'right',
                cellFormat: '#,##0.00' // changed format to cellFormat
              },
              {
                label: 'Discount',
                getValue: row => +(row.ItemPrce - row.Amount__),
                total: rows => rows.reduce((sum, r) => sum + (+(r.ItemPrce - r.Amount__) || 0), 0),
                align: 'right',
                cellFormat: '#,##0.00' // changed format to cellFormat
              },
              {
                label: 'Net',
                getValue: row => +row.Amount__,
                total: rows => rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0),
                align: 'right',
                cellFormat: '#,##0.00' // changed format to cellFormat
              },
              {
                label: 'Cost',
                getValue: row => +row.LandCost,
                total: rows => rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0),
                align: 'right',
                cellFormat: '#,##0.00' // changed format to cellFormat
              },
              {
                label: 'Gross Profit',
                getValue: row => +(row.Amount__ - row.LandCost),
                total: rows => rows.reduce((sum, r) => sum + (+(r.Amount__ - r.LandCost) || 0), 0),
                align: 'right',
                cellFormat: '#,##0.00' // changed format to cellFormat
              },
              {
                label: 'GP %',
                getValue: row => row.Amount__ ? ((row.Amount__ - row.LandCost) / row.Amount__) * 100 : 0,
                total: rows => {
                  const totalAmount = rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0);
                  const totalCost = rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0);
                  return totalAmount ? ((totalAmount - totalCost) / totalAmount) * 100 : 0;
                },
                align: 'right',
                cellFormat: 'percent' // changed format to cellFormat
              },
              {
                label: 'CTS %',
                getValue: (row, rows) => {
                  const totalAmount = rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0);
                  return totalAmount ? (row.Amount__ / totalAmount) * 100 : 0;
                },
                align: 'right',
                totalLabel: '100%',
                cellFormat: 'percent' // changed format to cellFormat
              }
          ];
          
          const titleRows = generateTitleRows(columnConfig, titleRowsContent, 0);

          printReportExcel(data, columnConfig, colWidths, titleRows, 'Sales Ranking By Brand');
    })

}

// Wait for the DOM to fully load before adding the event listener
document.addEventListener('DOMContentLoaded', () => {
    const salesRankBrandElements = document.querySelectorAll('.salesRankingByBrand');
    const rankRepoDiv = document.getElementById('SalesRankBrand');
    const closeRepo = document.getElementById('closeRepo2');
    
    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

        // Add event listener to each element with the necessary arguments
    salesRankBrandElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('SalesRankBrand')
        });
    });

});

document.getElementById('saleRank1').addEventListener('click', () => {
    try {
        FiltrRec('SaleRnk1').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));
    
            const dDateFrom = filterData[0];
            const dDate__To = filterData[1];
            const cLocation = filterData[2];
            const cUsersCde = filterData[3];
            const cOtherCde = filterData[4];
            // const cDescript = filterData[5];
            const cBrandNum = filterData[6];
            const cCategNum = filterData[7];
            const cItemType = filterData[8];
            const cItemDept = filterData[9];
            const cStoreGrp = filterData[12];
            
            SalesCompStore(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, cStoreGrp, dDateFrom, dDate__To);
    
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")
    }
})
document.getElementById('saleRank2').addEventListener('click', () => {
    try {
        FiltrRec('SaleRnk2').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));
    
            const dDateFrom = filterData[0];
            const dDate__To = filterData[1];
            const cLocation = filterData[2];
            const cUsersCde = filterData[3];
            const cOtherCde = filterData[4];
            // const cDescript = filterData[5];
            const cBrandNum = filterData[6];
            const cCategNum = filterData[7];
            const cItemType = filterData[8];
            const cItemDept = filterData[9];
            const cStoreGrp = filterData[12];

            SalesRankBrand(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, cStoreGrp, dDateFrom, dDate__To);

        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")
    }

})


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
            const storeName = entry.LocaName.trim(); // Ensure store name is trimmed
            acc[storeName] = (acc[storeName] || 0) + totalAmount;
            return acc;
        }, {});

        // Convert aggregated data into an array for charting
        const topStores = Object.entries(storeTotals)
            .sort((a, b) => b[1] - a[1]) // Sort by totalamt in descending order
            .slice(0, 30); // Take the top 30 stores

        const storeNames = topStores.map(entry => entry[0]); // Store names
        const storeAmounts = topStores.map(entry => entry[1]); // Total amounts

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
                            color: 'white',  // x-axis tick labels color
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
        
        // Prepare data for the doughnut chart (Contribution to Total Sales by store group)
        const storeGroupTotals = chartData.reduce((acc, entry) => {
            const totalAmount = parseFloat(entry.Amount__) || 0;
            const storeGroup = entry.StoreGrp.trim(); // Ensure group name is trimmed
            acc[storeGroup] = (acc[storeGroup] || 0) + totalAmount;
            return acc;
        }, {});

        // Sort store groups by total amount in descending order
        const sortedStoreGroups = Object.entries(storeGroupTotals).sort((a, b) => b[1] - a[1]);

        const storeGroupLabels = sortedStoreGroups.map(entry => entry[0]);
        const storeGroupValues = sortedStoreGroups.map(entry => entry[1]);

        const totalSales = Object.values(storeGroupTotals).reduce((acc, value) => acc + value, 0); // Calculate total sales
        const storeGroupPercentages = storeGroupValues.map(value => (value / totalSales * 100).toFixed(2)); // Calculate percentages

        const generateRandomColor = () => {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            return `rgba(${r}, ${g}, ${b}, 0.6)`;
        };

        const backgroundColors = storeGroupLabels.map(() => generateRandomColor());
        const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

        // Create the doughnut chart (myChart2)
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
                                const percentage = storeGroupPercentages[context.dataIndex]; // Get the percentage for the corresponding label
                                const value = context.raw || 0;
                                return `${percentage}%`; 
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        formatter: (value, context) => {
                            const percentage = storeGroupPercentages[context.dataIndex]; // Get the percentage for the corresponding value
                            return `${percentage}%`;
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: '10'
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


async function rankBrandSales(data, dateRange) {
   
    let myChart3 = window.myChart3 || null;

    try {
        const brandData = data;
        const brandMap = {};
        
        // Build brandMap without filling background colors yet
        brandData.forEach(item => {
            if (!brandMap[item.BrandNme]) {
                brandMap[item.BrandNme] = { Amount__: 0, Outright: item.Outright};
            }
            brandMap[item.BrandNme].Amount__ += Math.round(item.Amount__);
        });

        // Sort the brandMap by amount
        let sortedBrands = Object.entries(brandMap)
            .map(([BrandNme, values]) => ({ BrandNme, ...values }))
            .slice(0, 30);

        // Now assign background colors after sorting
        const backgroundColors = sortedBrands.map(item => 
            item.Outright === 1 ? 'rgba(54, 162, 235, 0.6)' : 'rgba(75, 192, 192, 0.2)'
        );

        const labels = sortedBrands.map(item => item.BrandNme.substring(0, 15).trim());
        const curreamtData = sortedBrands.map(item => item.Amount__);

        // Function to round up to the nearest multiple of step
        const getMagnitudeStep = (value) => {
            const magnitude = Math.floor(Math.log10(value));
            return Math.pow(10, magnitude); // Returns the nearest power of 10
        };

        // Function to round up to the nearest appropriate step
        const roundUpToDynamicStep = (value) => {
            const step = getMagnitudeStep(value);
            return Math.ceil(value / step) * step;
        };

        // Calculate the maximum value for the x-axis
        const maxCurreamt = Math.max(...curreamtData);
        // Round up maxValue to the nearest appropriate step
        const roundedMaxValue = roundUpToDynamicStep(maxCurreamt);

        if (myChart3) myChart3.destroy();

        const getChartOptions = () => ({
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    max: roundedMaxValue, // Use the dynamically rounded max value
                    ticks: {
                        font: { family: 'Arial Narrow', size: 12 },
                        color: 'white',  
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
                }
                }

        });

        const ctx3 = document.getElementById('brandChart1').getContext('2d');
        myChart3 = new Chart(ctx3, {
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

        window.myChart3 = myChart3;

    } catch (error) {
        console.error('Error fetching data:', error);
        displayErrorMsg(error,'Error processing chart data')
    }
}



async function SalesRankStock(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, cStoreGrp, dDateFrom, dDateTo__) {

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
                                <td style="text-align: left">${item.UsersCde || 'N/A'}</td>
                                <td style="text-align: left">${item.OtherCde || 'N/A'}</td>
                                <td class="colNoWrap">${item.Descript.substring(0,30) || 'N/A'}</td>
                                <td class="colNoWrap">${item.BrandNme || 'N/A'}</td>
                                <td style="text-align: center">${item.Quantity || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ItemPrce) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ItemPrce - item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Amount__) || 'N/A'}</td>
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
        document.getElementById('printStockRank').disabled = false
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

    document.getElementById('printStockRank').addEventListener('click', () => {

        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        const titleRowsContent = [
            { text: 'REGENT TRAVEL RETAIL GROUP', style: { fontWeight: 'bold', fontSize: 14 } },
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
    const salesRankStockElements = document.querySelectorAll('.salesRankingByStock');
    const rankRepoDiv = document.getElementById('SalesRankStock');
    const closeRepo = document.getElementById('closeRepo3');
    
    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

        // Add event listener to each element with the necessary arguments
    salesRankStockElements.forEach(element => {
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
            // const cDescript = filterData[5];
            const cBrandNum = filterData[6];
            const cCategNum = filterData[7];
            const cItemType = filterData[8];
            const cItemDept = filterData[9];
            const cStoreGrp = filterData[12];

            SalesRankStock(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, cStoreGrp, dDateFrom, dDate__To);

        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")
    }

})

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

        // Function to round up to the nearest multiple of step
        const getMagnitudeStep = (value) => {
            const magnitude = Math.floor(Math.log10(value));
            return Math.pow(10, magnitude); // Returns the nearest power of 10
        };

        // Function to round up to the nearest appropriate step
        const roundUpToDynamicStep = (value) => {
            const step = getMagnitudeStep(value);
            return Math.ceil(value / step) * step;
        };

        // Calculate the maximum value for the x-axis
        const maxCurreamt = Math.max(...curreamtData);
        // Round up maxValue to the nearest appropriate step
        const roundedMaxValue = roundUpToDynamicStep(maxCurreamt);

        if (myChart4) myChart4.destroy();

        const getChartOptions = () => ({
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    max: roundedMaxValue, // Use the dynamically rounded max value
                    ticks: {
                        font: { family: 'Arial Narrow', size: 12 },
                        color: 'white',  
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
                }
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

async function DailySalesSum(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, cStoreGrp, dDateFrom, dDateTo__) {

    // const selectElement = document.getElementById('FiltrRec_Location');
    // const selectedOption = selectElement.options[selectElement.selectedIndex];
    // const cLocaName = selectedOption.textContent || selectedOption.innerText;
    // cLocaName = (cLocaName) ? 'All Location' : cLocaName
    let cLocaName = ''
    const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
    const dayNames =['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    try {
        const url = new URL('http://localhost:3000/lookup/location');
        const params = new URLSearchParams();
        if (cLocation) params.append('Location', cLocation);
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) throw new Error('Network response was not ok');
        let LocatTbl = await response.json(); // Store full data array globally
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
        
        // if (nTotalAmt !== 0) {
        //     nGP_Prcnt = ((nTotalAmt-nTotalCos) / nTotalAmt) * 100; // GP% formula
        // }
        // nTotalATV = (nTotalTrx) ? nTotalAmt / nTotalTrx : 0
 
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
        document.getElementById('printDailySalesXLS').disabled = false
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
            // const cDescript = filterData[5];
            const cBrandNum = filterData[6];
            const cCategNum = filterData[7];
            const cItemType = filterData[8];
            const cItemDept = filterData[9];
            const cStoreGrp = filterData[12];

            DailySalesSum(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, cStoreGrp, dDateFrom, dDate__To);

        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")
    }

})

// Wait for the DOM to fully load before adding the event listener
document.addEventListener('DOMContentLoaded', () => {
    const dailySalesElements = document.querySelectorAll('.dailySalesSum'); //<li>
    const saleRepoDiv = document.getElementById('DailySalesSum');
    const closeRepo = document.getElementById('closeRepo4');
    
    closeRepo.addEventListener('click', () => {
        saleRepoDiv.classList.remove('active');
    });

    dailySalesElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('DailySalesSum')
        });
    });

});


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
            type: 'bar'
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

