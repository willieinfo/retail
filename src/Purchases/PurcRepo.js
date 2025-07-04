import { showReport, showNotification, formatter, formatDate, startTimer} from '../FunctLib.js';
import { printFormPDF, printReportExcel, generateTitleRows } from "../PrintRep.js"
import { FiltrRec, displayErrorMsg } from "../FiltrRec.js"

const cCompName = 'REGENT TRAVEL RETAIL GROUP'

const divListStock =`
    <div id="PurchRepoStock" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Stock Receiving Report by SKU</span>
            <button id="closePurcRepo1" class="closeForm">✖</button>
        </div>
        <div class="ReportBody">
            <div id="purchRepoStock" class="ReportBody">
                <table id="purchRepoTable1">
                    <thead id="rankTHead1">
                        <tr>
                            <th>Location</th>
                            <th>Stock No</th>
                            <th>Bar Code</th>
                            <th>Description</th>
                            <th>Brand</th>
                            <th>Department</th>
                            <th>Supplier</th>
                            <th>Quantity</th>
                            <th>Receiving Cost</th>
                            <th>Selling Price</th>
                        </tr>
                    </thead>
                </table>            
            </div>

            <div id="stockPurchChart" class="chartContainer">
                <div class="divChart70">
                    <h5>Top 30 SKU Purchases</h5>
                    <canvas id="stocPurchChart"></canvas>
                </div>
                <div id="topDepartment">
                    <h5>Top Department Purchases</h5>
                    <canvas id="deptPurchChart"></canvas>
                </div>
            </div>
        </div>

        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <span id="purcRepo1Counter" class="recCounter"></span>
                <button id="printPurchStockPDF" disabled><i class="fa fa-file-pdf"></i> PDF</button>
                <button id="printPurchStockXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="purchStock"><i class="fa fa-list"></i> List</button>
            </div>
        </div>
    </div>
`
const divPurchSumType =`
    <div id="PurchSumType" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Receiving Summary Report by Classification</span>
            <button id="closePurcRepo2" class="closeForm">✖</button>
        </div>
        <div class="ReportBody">
            <div id="purchSumType" class="ReportBody">
                <table id="purchRepoTable2">
                    <thead id="rankTHead1">
                        <tr>
                            <th>Location</th>
                            <th>Classification</th>
                            <th>Quantity</th>
                            <th>Receiving Cost</th>
                            <th>Selling Price</th>
                        </tr>
                    </thead>
                </table>            
            </div>

            <div id="typePurchSumChart" class="chartContainer">
                <div id="sumClassification">
                    <h5 id='h5topType'>Top Classification Purchases</h5>
                    <canvas id="typePurchSumChart1"></canvas>
                </div>
            </div>
        </div>

        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <span id="purcRepo2Counter" class="recCounter"></span>
                <button id="printPurchTypeXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="purchType"><i class="fa fa-list"></i> List</button>
            </div>
        </div>
    </div>
`
const divPurchSumSupp =`
    <div id="PurchSumSupp" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Receiving Summary Report by Supplier</span>
            <button id="closePurcRepo3" class="closeForm">✖</button>
        </div>
        <div class="ReportBody">
            <div id="purchSumSupp" class="ReportBody">
                <table id="purchRepoTable2">
                    <thead id="rankTHead1">
                        <tr>
                            <th>Location</th>
                            <th>Supplier</th>
                            <th>Quantity</th>
                            <th>Receiving Cost</th>
                            <th>Selling Price</th>
                        </tr>
                    </thead>
                </table>            
            </div>

            <div id="suppPurchSumChart" class="chartContainer">
                <div id="sumSupplier">
                    <h5 id='h5topSupp'>Top Suppliers</h5>
                    <canvas id="suppPurchSumChart1"></canvas>
                </div>
            </div>
        </div>

        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <span id="purcRepo3Counter" class="recCounter"></span>
                <button id="printPurchSuppXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="purchSupp"><i class="fa fa-list"></i> List</button>
            </div>
        </div>
    </div>
`

const divPurchSumBrnd =`
    <div id="PurchSumBrnd" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Receiving Summary Report by Brand</span>
            <button id="closePurcRepo4" class="closeForm">✖</button>
        </div>
        <div class="ReportBody">
            <div id="purchSumBrnd" class="ReportBody">
                <table id="purchRepoTable2">
                    <thead id="rankTHead1">
                        <tr>
                            <th>Location</th>
                            <th>Brand</th>
                            <th>Quantity</th>
                            <th>Receiving Cost</th>
                            <th>Selling Price</th>
                        </tr>
                    </thead>
                </table>            
            </div>

            <div id="brndPurchSumChart" class="chartContainer">
                <div id="sumSupplier">
                    <h5 id='h5topBran'>Top Brands</h5>
                    <canvas id="brndPurchSumChart1"></canvas>
                </div>
            </div>
        </div>

        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <span id="purcRepo4Counter" class="recCounter"></span>
                <button id="printPurchBrndXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="purchBrnd"><i class="fa fa-list"></i> List</button>
            </div>
        </div>
    </div>
`

const fragment = document.createDocumentFragment();

const div1 = document.createElement('div');
div1.innerHTML = divListStock;
fragment.appendChild(div1);

const div2 = document.createElement('div');
div2.innerHTML = divPurchSumType;
fragment.appendChild(div2);

const div3 = document.createElement('div');
div3.innerHTML = divPurchSumSupp;
fragment.appendChild(div3);

const div4 = document.createElement('div');
div4.innerHTML = divPurchSumBrnd;
fragment.appendChild(div4);

document.body.appendChild(fragment);  // Only one reflow happens here
// ======================================================================

async function PurchRepoStock(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, dDateFrom, dDateTo__, cSuppName) {

    document.getElementById('loadingIndicator').style.display = 'flex';
    let { timerInterval, elapsedTime } = startTimer(); 
    let data = null;
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/purchases/PurchRepoStock');
        const params = new URLSearchParams();
        if (cBrandNum) params.append('BrandNum', cBrandNum);
        if (cUsersCde) params.append('UsersCde', cUsersCde);
        if (cOtherCde) params.append('OtherCde', cOtherCde);
        if (cCategNum) params.append('CategNum', cCategNum);
        if (cItemDept) params.append('ItemDept', cItemDept);
        if (cItemType) params.append('ItemType', cItemType);
        if (cLocation) params.append('Location', cLocation);
        if (dDateFrom) params.append('DateFrom', dDateFrom); 
        if (dDateTo__) params.append('DateTo__', dDateTo__); 
        if (cSuppName) params.append('SuppName', cSuppName); 

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        let nTotalQty = 0
        let nTotalPrc = 0
        let nTotalSel = 0
    
        const listCounter=document.getElementById('purcRepo1Counter')
        data = await response.json();
        listCounter.innerHTML=`${data.length} Records`;
        showNotification(`${data.length} Records fetched`);
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

        if (Array.isArray(data)) {
            data.forEach(item => {
                nTotalQty+=item.Quantity
                nTotalPrc+=item.PurcCost
                nTotalSel+=item.SellPrce
            });
        }

        const purcRepoStockDiv = document.getElementById('PurchRepoStock');
        purcRepoStockDiv.classList.add('active');

        const reportBody = document.getElementById('purchRepoStock');
        reportBody.style.maxHeight = "80%";
        reportBody.innerHTML = '';  // Clear previous content

        // Define the table structure
        const rankTable = `
            <table id="purchRepoTable1">
                <thead id="rankTHead1">
                    <tr>
                        <th>Location</th>
                        <th>Stock No</th>
                        <th>Bar Code</th>
                        <th>Description</th>
                        <th>Brand</th>
                        <th>Department</th>
                        <th>Supplier</th>
                        <th>Quantity</th>
                        <th>Receiving Cost</th>
                        <th>Selling Price</th>
                    </tr>
                </thead>
                <tbody id="rankTBody">
                    ${data.map(item => {
                        return `
                            <tr style=" color: ${item.Outright===2 ? 'rgb(7, 130, 130)' : 'black'}"">
                                <td class="colNoWrap" style="text-align: left">${item.LocaName || 'N/A'}</td>
                                <td class="colNoWrap" style="text-align: left">${item.UsersCde || 'N/A'}</td>
                                <td class="colNoWrap" style="text-align: left">${item.OtherCde || 'N/A'}</td>
                                <td class="colNoWrap">${item.Descript.substring(0,30) || 'N/A'}</td>
                                <td class="colNoWrap">${item.BrandNme || 'N/A'}</td>
                                <td class="colNoWrap">${item.DeptDesc || 'N/A'}</td>
                                <td class="colNoWrap">${item.SuppName || 'N/A'}</td>
                                <td style="text-align: center">${item.Quantity || 'N/A'}</td>
                                <td style="text-align: right; font-weight: bold">${formatter.format(item.PurcCost) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.SellPrce) || 'N/A'}</td>
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
                        <td style="text-align: right">${formatter.format(nTotalSel) || 'N/A'}</td>
                    </tr>
                 </tfoot>
            </table>
        `;
        
        // Add the table HTML to the div
        reportBody.innerHTML = rankTable;

        // Show data ranking chart
        document.getElementById('stockPurchChart').style.display='flex';
        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        document.getElementById('printPurchStockPDF').disabled = false
        document.getElementById('printPurchStockXLS').disabled = false
        stockPurchChart(data, dateRange)
       
    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error,'Fetch error')
    } finally {
        // Hide loading spinner once data is fetched or an error occurs
        document.getElementById('loadingIndicator').style.display = 'none';
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''
    }

    document.getElementById('printPurchStockXLS').addEventListener('click', () => {

        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        const titleRowsContent = [
            { text: cCompName, style: { fontWeight: 'bold', fontSize: 14 } },
            { text: 'Stock Receiving by SKU', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
            { text: dateRange, style: { fontStyle: 'italic', fontSize: 12 } },
            { text: '' } // Spacer row
            ];

            const colWidths = [
                { width: 20 },{ width: 20 },{ width: 20 },{ width: 30 },{ width: 25 },
                { width: 25 },{ width: 25 },{ width: 10 },{ width: 15 },{ width: 15 },
                { width: 15 },{ width: 15 },{ width: 15 },
            ];
        
            const columnConfig = [
                { label: 'Location',getValue: row => row.LocaName,type: 'string',align: 'left'},
                { label: 'Stock No.',getValue: row => row.UsersCde,type: 'string',align: 'left'},
                { label: 'Bar Code',getValue: row => row.OtherCde,type: 'string',align: 'left'},
                { label: 'Description',getValue: row => row.Descript.substring(0,30),type: 'string',align: 'left'},
                { label: 'Brand',getValue: row => row.BrandNme,type: 'string',align: 'left',totalLabel: 'TOTALS:'},
                { label: 'Department',getValue: row => row.DeptDesc,type: 'string',align: 'left',totalLabel: 'TOTALS:'},
                { label: 'Supplier',getValue: row => row.SuppName,type: 'string',align: 'left',totalLabel: 'TOTALS:'},
                { label: 'Quantity',getValue: row => +row.Quantity,
                    total: rows => rows.reduce((sum, r) => sum + (+r.Quantity || 0), 0),
                    align: 'right',type: 'integer',cellFormat: '#,##0'},
                { label: 'Gross',getValue: row => +row.PurcCost,
                    total: rows => rows.reduce((sum, r) => sum + (+r.PurcCost || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'},
                { label: 'Discount',getValue: row => +(row.PurcCost - row.Amount__),
                    total: rows => rows.reduce((sum, r) => sum + (+(r.PurcCost - r.Amount__) || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'},
                { label: 'Net',getValue: row => +row.Amount__,
                    total: rows => rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'},
                { label: 'SRP',getValue: row => +row.SellPrce,
                    total: rows => rows.reduce((sum, r) => sum + (+r.SellPrce || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'},
                { label: 'L.Cost',getValue: row => +row.LandCost,
                    total: rows => rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'}
            ];
            
            const titleRows = generateTitleRows(columnConfig, titleRowsContent, 0);

            printReportExcel(data, columnConfig, colWidths, titleRows, 'Sales Ranking by SKU');
    })
}


document.getElementById('purchStock').addEventListener('click', () => {
    try {
        FiltrRec('PurcStoc').then(() => {
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
            const cSuppName = filterData[16];
            
            PurchRepoStock(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, dDateFrom, dDate__To, cSuppName);
    
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")
    }
})

document.addEventListener('DOMContentLoaded', () => {
    const purchReportByStockElements = document.querySelectorAll('.purchReportByStock'); //<li> menu
    const rankRepoDiv = document.getElementById('PurchRepoStock');
    const closeRepo = document.getElementById('closePurcRepo1'); 
    
    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

    purchReportByStockElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('PurchRepoStock')
        });
    });

});


async function stockPurchChart(data, dateRange) {

    try {
        const purchData = data;
        const purchChart1Element = document.getElementById('stocPurchChart');
        const purchChart2Element = document.getElementById('deptPurchChart');

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
        purchChart1Element.getContext('2d').clearRect(0, 0, purchChart1Element.width, purchChart1Element.height);
        purchChart2Element.getContext('2d').clearRect(0, 0, purchChart2Element.width, purchChart2Element.height);

        // Aggregate totalamt per storname
        const purchTotals = purchData.reduce((acc, entry) => {
            const totalAmount = parseFloat(entry.PurcCost) || 0;
            const UsersCde = entry.UsersCde.trim(); 
            acc[UsersCde] = (acc[UsersCde] || 0) + totalAmount;
            return acc;
        }, {});

        // Convert aggregated data into an array for charting
        const topStores = Object.entries(purchTotals)
            .sort((a, b) => b[1] - a[1]) // Sort by totalamt in descending order
            .slice(0, 30); // Take the top 30 SKUs

        const usersCdeNames = topStores.map(entry => entry[0]); // Stock No
        const usersCdeAmounts = topStores.map(entry => entry[1]); // Total amounts

        const ctx1 = purchChart1Element.getContext('2d');
        myChart1 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: usersCdeNames,
                datasets: [{
                    label: 'Top 30 SKUs Purchases',
                    data: usersCdeAmounts,
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
        
        // Prepare data for the doughnut chart 
        let chartData = data
        const dataGroupTotals = chartData.reduce((acc, entry) => {
            const totalAmount = parseFloat(entry.PurcCost) || 0;
            const dataGroup = entry.DeptDesc.trim(); // Ensure group name is trimmed
            acc[dataGroup] = (acc[dataGroup] || 0) + totalAmount;
            return acc;
        }, {});

        // Sort data groups by total amount in descending order
        const sortedStoreGroups = Object.entries(dataGroupTotals).sort((a, b) => b[1] - a[1]);

        const dataGroupLabels = sortedStoreGroups.map(entry => entry[0]);
        const dataGroupValues = sortedStoreGroups.map(entry => entry[1]);

        const totalSales = Object.values(dataGroupTotals).reduce((acc, value) => acc + value, 0); // Calculate total sales
        const dataGroupPercentages = dataGroupValues.map(value => (value / totalSales * 100).toFixed(2)); // Calculate percentages

        const generateRandomColor = () => {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            return `rgba(${r}, ${g}, ${b}, 0.6)`;
        };

        const backgroundColors = dataGroupLabels.map(() => generateRandomColor());
        const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

        // Create the doughnut chart (myChart2)
        const ctx2 = purchChart2Element.getContext('2d');
        myChart2 = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: dataGroupLabels,
                datasets: [{
                    label: 'Department Categories',
                    data: dataGroupValues,
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
                                const percentage = dataGroupPercentages[context.dataIndex]; // Get the percentage for the corresponding label
                                const value = context.raw || 0;
                                return `${percentage}%`; 
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        formatter: (value, context) => {
                            const percentage = dataGroupPercentages[context.dataIndex]; // Get the percentage for the corresponding value
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

// ======================================================================

async function PurchSumType(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, dDateFrom, dDateTo__, cSuppName) {

    document.getElementById('loadingIndicator').style.display = 'flex';
    let { timerInterval, elapsedTime } = startTimer(); 
    let data = null;
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/purchases/PurchSumType');
        const params = new URLSearchParams();
        if (cBrandNum) params.append('BrandNum', cBrandNum);
        if (cUsersCde) params.append('UsersCde', cUsersCde);
        if (cOtherCde) params.append('OtherCde', cOtherCde);
        if (cCategNum) params.append('CategNum', cCategNum);
        if (cItemDept) params.append('ItemDept', cItemDept);
        if (cItemType) params.append('ItemType', cItemType);
        if (cLocation) params.append('Location', cLocation);
        if (dDateFrom) params.append('DateFrom', dDateFrom); 
        if (dDateTo__) params.append('DateTo__', dDateTo__); 
        if (cSuppName) params.append('SuppName', cSuppName); 

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        let nTotalQty = 0
        let nTotalPrc = 0
        let nTotalSel = 0
    
        const listCounter=document.getElementById('purcRepo2Counter')
        data = await response.json();
        listCounter.innerHTML=`${data.length} Records`;
        showNotification(`${data.length} Records fetched`);
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

        if (Array.isArray(data)) {
            data.forEach(item => {
                nTotalQty+=item.Quantity
                nTotalPrc+=item.PurcCost
                nTotalSel+=item.SellPrce
            });
        }

        const purcSumDeptDiv = document.getElementById('PurchSumType');
        purcSumDeptDiv.classList.add('active');

        const reportBody = document.getElementById('purchSumType');
        reportBody.style.maxHeight = "80%";
        reportBody.innerHTML = '';  // Clear previous content

        // Define the table structure
        const rankTable = `
            <table id="purchRepoTable1">
                <thead id="rankTHead1">
                    <tr>
                        <th>Location</th>
                        <th>Classification</th>
                        <th>Quantity</th>
                        <th>Receiving Cost</th>
                        <th>Selling Price</th>
                    </tr>
                </thead>
                <tbody id="rankTBody">
                    ${data.map(item => {
                        return `
                            <tr style=" color: ${item.Outright===2 ? 'rgb(7, 130, 130)' : 'black'}"">
                                <td class="colNoWrap" style="text-align: left">${item.LocaName || 'N/A'}</td>
                                <td class="colNoWrap">${item.TypeDesc || 'N/A'}</td>
                                <td style="text-align: center">${item.Quantity || 'N/A'}</td>
                                <td style="text-align: right; font-weight: bold">${formatter.format(item.PurcCost) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.SellPrce) || 'N/A'}</td>
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
                        <td style="text-align: right">${formatter.format(nTotalSel) || 'N/A'}</td>
                    </tr>
                 </tfoot>
            </table>
        `;
        
        // Add the table HTML to the div
        reportBody.innerHTML = rankTable;

        // Show purchased sum by department chart
        document.getElementById('typePurchSumChart').style.display='flex';
        // const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        document.getElementById('printPurchTypeXLS').disabled = false
        PurchChart(data,'TypeDesc')
       
    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error,'Fetch error')
    } finally {
        // Hide loading spinner once data is fetched or an error occurs
        document.getElementById('loadingIndicator').style.display = 'none';
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''
    }

    document.getElementById('printPurchTypeXLS').addEventListener('click', () => {

        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        const titleRowsContent = [
            { text: cCompName, style: { fontWeight: 'bold', fontSize: 14 } },
            { text: 'Receiving Summary by Classification', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
            { text: dateRange, style: { fontStyle: 'italic', fontSize: 12 } },
            { text: '' } // Spacer row
            ];

            const colWidths = [
                { width: 20 },{ width: 20 },{ width: 10 },{ width: 15 },{ width: 15 },
                { width: 15 },{ width: 15 },{ width: 15 },
            ];
        
            const columnConfig = [
                { label: 'Location',getValue: row => row.LocaName,type: 'string',align: 'left'},
                { label: 'Classification',getValue: row => row.TypeDesc,type: 'string',align: 'left',totalLabel: 'TOTALS:'},
                { label: 'Quantity',getValue: row => +row.Quantity,
                    total: rows => rows.reduce((sum, r) => sum + (+r.Quantity || 0), 0),
                    align: 'right',type: 'integer',cellFormat: '#,##0'},
                { label: 'Gross',getValue: row => +row.PurcCost,
                    total: rows => rows.reduce((sum, r) => sum + (+r.PurcCost || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'},
                { label: 'Discount',getValue: row => +(row.PurcCost - row.Amount__),
                    total: rows => rows.reduce((sum, r) => sum + (+(r.PurcCost - r.Amount__) || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'},
                { label: 'Net',getValue: row => +row.Amount__,
                    total: rows => rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'},
                { label: 'SRP',getValue: row => +row.SellPrce,
                    total: rows => rows.reduce((sum, r) => sum + (+r.SellPrce || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'},
                { label: 'L.Cost',getValue: row => +row.LandCost,
                    total: rows => rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'}
            ];
            
            const titleRows = generateTitleRows(columnConfig, titleRowsContent, 0);

            printReportExcel(data, columnConfig, colWidths, titleRows, 'Stock Receiving by Classifiction');
    })
}

document.getElementById('purchType').addEventListener('click', () => {
    try {
        FiltrRec('PurcType').then(() => {
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
            const cSuppName = filterData[16];
            
            PurchSumType(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, dDateFrom, dDate__To, cSuppName);
    
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")
    }
})

document.addEventListener('DOMContentLoaded', () => {
    const purchSumByDeptElements = document.querySelectorAll('.purchSumByType'); //<li> menu
    const rankRepoDiv = document.getElementById('PurchSumType');
    const closeRepo = document.getElementById('closePurcRepo2'); 
    
    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

    purchSumByDeptElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('PurchSumType')
        });
    });

});



// ======================================================================
async function PurchSumSupp(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, dDateFrom, dDateTo__, cSuppName) {

    document.getElementById('loadingIndicator').style.display = 'flex';
    let { timerInterval, elapsedTime } = startTimer(); 
    let data = null;
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/purchases/PurchSumSupp');
        const params = new URLSearchParams();
        if (cBrandNum) params.append('BrandNum', cBrandNum);
        if (cUsersCde) params.append('UsersCde', cUsersCde);
        if (cOtherCde) params.append('OtherCde', cOtherCde);
        if (cCategNum) params.append('CategNum', cCategNum);
        if (cItemDept) params.append('ItemDept', cItemDept);
        if (cItemType) params.append('ItemType', cItemType);
        if (cLocation) params.append('Location', cLocation);
        if (dDateFrom) params.append('DateFrom', dDateFrom); 
        if (dDateTo__) params.append('DateTo__', dDateTo__); 
        if (cSuppName) params.append('SuppName', cSuppName); 

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        let nTotalQty = 0
        let nTotalPrc = 0
        let nTotalSel = 0
    
        const listCounter=document.getElementById('purcRepo3Counter')
        data = await response.json();
        listCounter.innerHTML=`${data.length} Records`;
        showNotification(`${data.length} Records fetched`);
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

        if (Array.isArray(data)) {
            data.forEach(item => {
                nTotalQty+=item.Quantity
                nTotalPrc+=item.PurcCost
                nTotalSel+=item.SellPrce
            });
        }

        const purcSumDeptDiv = document.getElementById('PurchSumSupp');
        purcSumDeptDiv.classList.add('active');

        const reportBody = document.getElementById('purchSumSupp');
        reportBody.style.maxHeight = "80%";
        reportBody.innerHTML = '';  // Clear previous content

        // Define the table structure
        const rankTable = `
            <table id="purchRepoTable1">
                <thead id="rankTHead1">
                    <tr>
                        <th>Location</th>
                        <th>Supplier</th>
                        <th>Quantity</th>
                        <th>Receiving Cost</th>
                        <th>Selling Price</th>
                    </tr>
                </thead>
                <tbody id="rankTBody">
                    ${data.map(item => {
                        return `
                            <tr style=" color: ${item.Outright===2 ? 'rgb(7, 130, 130)' : 'black'}"">
                                <td class="colNoWrap" style="text-align: left">${item.LocaName || 'N/A'}</td>
                                <td class="colNoWrap">${item.SuppName || 'N/A'}</td>
                                <td style="text-align: center">${item.Quantity || 'N/A'}</td>
                                <td style="text-align: right; font-weight: bold">${formatter.format(item.PurcCost) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.SellPrce) || 'N/A'}</td>
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
                        <td style="text-align: right">${formatter.format(nTotalSel) || 'N/A'}</td>
                    </tr>
                 </tfoot>
            </table>
        `;
        
        // Add the table HTML to the div
        reportBody.innerHTML = rankTable;

        // Show purchased sum by department chart
        document.getElementById('suppPurchSumChart').style.display='flex';
        // const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        document.getElementById('printPurchSuppXLS').disabled = false
        PurchChart(data,'SuppName')
       
    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error,'Fetch error')
    } finally {
        // Hide loading spinner once data is fetched or an error occurs
        document.getElementById('loadingIndicator').style.display = 'none';
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''
    }

    document.getElementById('printPurchSuppXLS').addEventListener('click', () => {

        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        const titleRowsContent = [
            { text: cCompName, style: { fontWeight: 'bold', fontSize: 14 } },
            { text: 'Receiving Summary by Supplier', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
            { text: dateRange, style: { fontStyle: 'italic', fontSize: 12 } },
            { text: '' } // Spacer row
            ];

            const colWidths = [
                { width: 20 },{ width: 30 },{ width: 10 },{ width: 15 },{ width: 15 },
                { width: 15 },{ width: 15 },{ width: 15 },
            ];
        
            const columnConfig = [
                { label: 'Location',getValue: row => row.LocaName,type: 'string',align: 'left'},
                { label: 'Supplier',getValue: row => row.SuppName,type: 'string',align: 'left',totalLabel: 'TOTALS:'},
                { label: 'Quantity',getValue: row => +row.Quantity,
                    total: rows => rows.reduce((sum, r) => sum + (+r.Quantity || 0), 0),
                    align: 'right',type: 'integer',cellFormat: '#,##0'},
                { label: 'Gross',getValue: row => +row.PurcCost,
                    total: rows => rows.reduce((sum, r) => sum + (+r.PurcCost || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'},
                { label: 'Discount',getValue: row => +(row.PurcCost - row.Amount__),
                    total: rows => rows.reduce((sum, r) => sum + (+(r.PurcCost - r.Amount__) || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'},
                { label: 'Net',getValue: row => +row.Amount__,
                    total: rows => rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'},
                { label: 'SRP',getValue: row => +row.SellPrce,
                    total: rows => rows.reduce((sum, r) => sum + (+r.SellPrce || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'},
                { label: 'L.Cost',getValue: row => +row.LandCost,
                    total: rows => rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'}
            ];
            
            const titleRows = generateTitleRows(columnConfig, titleRowsContent, 0);

            printReportExcel(data, columnConfig, colWidths, titleRows, 'Stock Receiving by Supplier');
    })
}

document.getElementById('purchSupp').addEventListener('click', () => {
    try {
        FiltrRec('PurcSupp').then(() => {
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
            const cSuppName = filterData[16];
            
            PurchSumSupp(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, dDateFrom, dDate__To, cSuppName);
    
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")
    }
})

document.addEventListener('DOMContentLoaded', () => {
    const purchSumByDeptElements = document.querySelectorAll('.purchSumBySupp'); //<li> menu
    const rankRepoDiv = document.getElementById('PurchSumSupp');
    const closeRepo = document.getElementById('closePurcRepo3'); 
    
    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

    purchSumByDeptElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('PurchSumSupp')
        });
    });

});

// ======================================================================
async function PurchSumBrnd(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, dDateFrom, dDateTo__, cSuppName) {

    document.getElementById('loadingIndicator').style.display = 'flex';
    let { timerInterval, elapsedTime } = startTimer(); 
    let data = null;
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/purchases/PurchSumBrnd');
        const params = new URLSearchParams();
        if (cBrandNum) params.append('BrandNum', cBrandNum);
        if (cUsersCde) params.append('UsersCde', cUsersCde);
        if (cOtherCde) params.append('OtherCde', cOtherCde);
        if (cCategNum) params.append('CategNum', cCategNum);
        if (cItemDept) params.append('ItemDept', cItemDept);
        if (cItemType) params.append('ItemType', cItemType);
        if (cLocation) params.append('Location', cLocation);
        if (dDateFrom) params.append('DateFrom', dDateFrom); 
        if (dDateTo__) params.append('DateTo__', dDateTo__); 
        if (cSuppName) params.append('SuppName', cSuppName); 

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        let nTotalQty = 0
        let nTotalPrc = 0
        let nTotalSel = 0
    
        const listCounter=document.getElementById('purcRepo4Counter')
        data = await response.json();
        listCounter.innerHTML=`${data.length} Records`;
        showNotification(`${data.length} Records fetched`);
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

        if (Array.isArray(data)) {
            data.forEach(item => {
                nTotalQty+=item.Quantity
                nTotalPrc+=item.PurcCost
                nTotalSel+=item.SellPrce
            });
        }

        const purcSumDiv = document.getElementById('PurchSumBrnd');
        purcSumDiv.classList.add('active');

        const reportBody = document.getElementById('purchSumBrnd');
        reportBody.style.maxHeight = "80%";
        reportBody.innerHTML = '';  // Clear previous content

        // Define the table structure
        const rankTable = `
            <table id="purchRepoTable1">
                <thead id="rankTHead1">
                    <tr>
                        <th>Location</th>
                        <th>Brand</th>
                        <th>Quantity</th>
                        <th>Receiving Cost</th>
                        <th>Selling Price</th>
                    </tr>
                </thead>
                <tbody id="rankTBody">
                    ${data.map(item => {
                        return `
                            <tr style=" color: ${item.Outright===2 ? 'rgb(7, 130, 130)' : 'black'}"">
                                <td class="colNoWrap" style="text-align: left">${item.LocaName || 'N/A'}</td>
                                <td class="colNoWrap">${item.BrandNme || 'N/A'}</td>
                                <td style="text-align: center">${item.Quantity || 'N/A'}</td>
                                <td style="text-align: right; font-weight: bold">${formatter.format(item.PurcCost) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.SellPrce) || 'N/A'}</td>
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
                        <td style="text-align: right">${formatter.format(nTotalSel) || 'N/A'}</td>
                    </tr>
                 </tfoot>
            </table>
        `;
        
        // Add the table HTML to the div
        reportBody.innerHTML = rankTable;

        // Show purchased sum by department chart
        document.getElementById('brndPurchSumChart').style.display='flex';
        // const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        document.getElementById('printPurchBrndXLS').disabled = false
        PurchChart(data,'BrandNme')
       
    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error,'Fetch error')
    } finally {
        // Hide loading spinner once data is fetched or an error occurs
        document.getElementById('loadingIndicator').style.display = 'none';
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''
    }

    document.getElementById('printPurchBrndXLS').addEventListener('click', () => {

        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        const titleRowsContent = [
            { text: cCompName, style: { fontWeight: 'bold', fontSize: 14 } },
            { text: 'Receiving Summary by Brand', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
            { text: dateRange, style: { fontStyle: 'italic', fontSize: 12 } },
            { text: '' } // Spacer row
            ];

            const colWidths = [
                { width: 20 },{ width: 30 },{ width: 10 },{ width: 15 },{ width: 15 },
                { width: 15 },{ width: 15 },{ width: 15 },
            ];
        
            const columnConfig = [
                { label: 'Location',getValue: row => row.LocaName,type: 'string',align: 'left'},
                { label: 'Brand',getValue: row => row.BrandNme,type: 'string',align: 'left',totalLabel: 'TOTALS:'},
                { label: 'Quantity',getValue: row => +row.Quantity,
                    total: rows => rows.reduce((sum, r) => sum + (+r.Quantity || 0), 0),
                    align: 'right',type: 'integer',cellFormat: '#,##0'},
                { label: 'Gross',getValue: row => +row.PurcCost,
                    total: rows => rows.reduce((sum, r) => sum + (+r.PurcCost || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'},
                { label: 'Discount',getValue: row => +(row.PurcCost - row.Amount__),
                    total: rows => rows.reduce((sum, r) => sum + (+(r.PurcCost - r.Amount__) || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'},
                { label: 'Net',getValue: row => +row.Amount__,
                    total: rows => rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'},
                { label: 'SRP',getValue: row => +row.SellPrce,
                    total: rows => rows.reduce((sum, r) => sum + (+r.SellPrce || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'},
                { label: 'L.Cost',getValue: row => +row.LandCost,
                    total: rows => rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0),
                    align: 'right',cellFormat: '#,##0.00'}
            ];
            
            const titleRows = generateTitleRows(columnConfig, titleRowsContent, 0);

            printReportExcel(data, columnConfig, colWidths, titleRows, 'Stock Receiving by Brand');
    })
}

document.getElementById('purchBrnd').addEventListener('click', () => {
    try {
        FiltrRec('PurcBrnd').then(() => {
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
            const cSuppName = filterData[16];
            
            PurchSumBrnd(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, dDateFrom, dDate__To, cSuppName);
    
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")
    }
})

document.addEventListener('DOMContentLoaded', () => {
    const purchSumByDeptElements = document.querySelectorAll('.purchSumByBrnd'); //<li> menu
    const rankRepoDiv = document.getElementById('PurchSumBrnd');
    const closeRepo = document.getElementById('closePurcRepo4'); 
    
    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

    purchSumByDeptElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('PurchSumBrnd')
        });
    });

});



// Purchases Charts ===========================================
async function PurchChart(data, showData) {
    try {
        // Define a mapping of showData to canvas IDs
        const dataCanvasMapping = {
            'TypeDesc': 'typePurchSumChart1',
            'SuppName': 'suppPurchSumChart1',
            'BrandNme': 'brndPurchSumChart1'
        };

        // Get the canvas ID based on showData
        const dataCanvass = dataCanvasMapping[showData];

        if (!dataCanvass) {
            console.error(`Unknown data type: ${showData}`);
            return;
        }        

        // const dataCanvass = showData === 'TypeDesc' ? 'typePurchSumChart1' : 'suppPurchSumChart1'
        const purchChartElement = document.getElementById(dataCanvass);

        // Declare variables for chart instances
         let myChart = window.myCharts && window.myCharts[dataCanvass] || null;

        // Destroy existing charts if they exist
        if (myChart) {
            myChart.destroy();
        }

        // Clear the canvas context manually (important when reusing canvas elements)
        purchChartElement.getContext('2d').clearRect(0, 0, purchChartElement.width, purchChartElement.height);

        let chartData = data.slice(0,20)

        const dataFieldMapping = {
            'TypeDesc': 'TypeDesc',
            'SuppName': 'SuppName',
            'BrandNme': 'BrandNme'
        };        
        const dataField = dataFieldMapping[showData];

        // Check if the mapping is valid
        if (!dataField) {
            console.error(`Unknown showData type: ${showData}`);
            return;
        }
        // Prepare data for the pie chart 
        const dataGroupTotals = chartData.reduce((acc, entry) => {
            const totalAmount = parseFloat(entry.PurcCost) || 0;
            // Dynamically access the property based on `showData`
            const dataGroup = entry[dataField]?.trim() || '';  
            // const dataGroup = showData === 'TypeDesc' ? entry.TypeDesc.trim() : entry.SuppName.trim();
            acc[dataGroup] = (acc[dataGroup] || 0) + totalAmount;

            return acc;
        }, {});

        // Sort data groups by total amount in descending order
        const sortedStoreGroups = Object.entries(dataGroupTotals).sort((a, b) => b[1] - a[1]);

        const dataGroupLabels = sortedStoreGroups.map(entry => entry[0]);
        const dataGroupValues = sortedStoreGroups.map(entry => entry[1]);

        // Update dynamic text content based on `showData`
        const headingMapping = {
            'TypeDesc': 'Top Classification',
            'SuppName': 'Top Suppliers',
            'BrandNme': 'Top Brands'
        };
       
        const headingElementId = `h5top${showData.substring(0, 4)}`;
        document.getElementById(headingElementId).textContent = headingMapping[showData];        

        if (data.length > 20) {
            const rest = data.slice(20);
            const others = rest.reduce((sum, grp) => sum + grp.PurcCost, 0);
            // Add "Others"
            dataGroupLabels.push('OTHERS');
            dataGroupValues.push(others);
        }

        const totalSales = Object.values(dataGroupTotals).reduce((acc, value) => acc + value, 0); // Calculate total sales
        const dataGroupPercentages = dataGroupValues.map(value => (value / totalSales * 100).toFixed(2)); // Calculate percentages

        const generateRandomColor = () => {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            return `rgba(${r}, ${g}, ${b}, 0.6)`;
        };

        const backgroundColors = dataGroupLabels.map(() => generateRandomColor());
        const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

        // Create the doughnut chart (myChart2)
        const ctx = purchChartElement.getContext('2d');
        myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: dataGroupLabels,
                datasets: [{
                    label: 'Classification Categories',
                    data: dataGroupValues,
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
                                const percentage = dataGroupPercentages[context.dataIndex]; // Get the percentage for the corresponding label
                                const value = context.raw || 0;
                                return `${percentage}%`; 
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        formatter: (value, context) => {
                            const percentage = dataGroupPercentages[context.dataIndex]; // Get the percentage for the corresponding value
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
        // window.myChart = myChart;
        window.myCharts = window.myCharts || {};
        window.myCharts[dataCanvass] = myChart;        

    } catch (error) {
        console.error('Error processing chart data:', error);
        displayErrorMsg(error,"'Error processing chart data'")
    }
}
