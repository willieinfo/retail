import { showReport, showNotification, formatter, formatDate, startTimer} from '../FunctLib.js';
import { printFormPDF, printReportExcel, generateTitleRows } from "../PrintRep.js"
import { FiltrRec, displayErrorMsg } from "../FiltrRec.js"

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
const divPurchSumDept =`
    <div id="PurchSumDept" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Receiving Summary Report by Category</span>
            <button id="closePurcRepo2" class="closeForm">✖</button>
        </div>
        <div class="ReportBody">
            <div id="purchSumDept" class="ReportBody">
                <table id="purchRepoTable2">
                    <thead id="rankTHead1">
                        <tr>
                            <th>Location</th>
                            <th>Department</th>
                            <th>Quantity</th>
                            <th>Receiving Cost</th>
                            <th>Selling Price</th>
                        </tr>
                    </thead>
                </table>            
            </div>

            <div id="deptPurchSumChart" class="chartContainer">
                <div id="sumDepartment">
                    <h5>Top Department Purchases</h5>
                    <canvas id="deptPurchSumChart1"></canvas>
                </div>
            </div>
        </div>

        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <span id="purcRepo2Counter" class="recCounter"></span>
                <button id="printPurchDeptXLS" disabled><i class="fa fa-file-excel"></i> Excel</button>
                <button id="purchDept"><i class="fa fa-list"></i> List</button>
            </div>
        </div>
    </div>
`

const fragment = document.createDocumentFragment();

const div1 = document.createElement('div');
div1.innerHTML = divListStock;
fragment.appendChild(div1);

const div2 = document.createElement('div');
div2.innerHTML = divPurchSumDept;
fragment.appendChild(div2);

document.body.appendChild(fragment);  // Only one reflow happens here
// ======================================================================

async function PurchRepoStock(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, dDateFrom, dDateTo__) {

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

        // Show store ranking chart
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
            { text: 'REGENT TRAVEL RETAIL GROUP', style: { fontWeight: 'bold', fontSize: 14 } },
            { text: 'Stock Receiving by SKU', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
            { text: dateRange, style: { fontStyle: 'italic', fontSize: 12 } },
            { text: '' } // Spacer row
            ];

            const colWidths = [
                { width: 20 },{ width: 20 },{ width: 20 },{ width: 30 },{ width: 25 },
                { width: 10 },{ width: 15 },{ width: 15 },{ width: 15 },{ width: 15 },
                { width: 15 },
            ];
        
            const columnConfig = [
                { label: 'Location',getValue: row => row.LocaName,type: 'string',align: 'left'},
                { label: 'Stock No.',getValue: row => row.UsersCde,type: 'string',align: 'left'},
                { label: 'Bar Code',getValue: row => row.OtherCde,type: 'string',align: 'left'},
                { label: 'Description',getValue: row => row.Descript.substring(0,30),type: 'string',align: 'left'},
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
            // const cStoreGrp = filterData[12];
            
            PurchRepoStock(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, dDateFrom, dDate__To);
    
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


async function stockPurchChart(chartData, dateRange) {

    try {
        const purchData = chartData;
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
        
        // Prepare data for the doughnut chart (Contribution to Total Sales by store group)
        const storeGroupTotals = chartData.reduce((acc, entry) => {
            const totalAmount = parseFloat(entry.PurcCost) || 0;
            const storeGroup = entry.DeptDesc.trim(); // Ensure group name is trimmed
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
        const ctx2 = purchChart2Element.getContext('2d');
        myChart2 = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: storeGroupLabels,
                datasets: [{
                    label: 'Department Categories',
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

// ======================================================================

async function PurchSumDept(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, dDateFrom, dDateTo__) {

    document.getElementById('loadingIndicator').style.display = 'flex';
    let { timerInterval, elapsedTime } = startTimer(); 
    let data = null;
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/purchases/PurchSumDept');
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

        const purcSumDeptDiv = document.getElementById('PurchSumDept');
        purcSumDeptDiv.classList.add('active');

        const reportBody = document.getElementById('purchSumDept');
        reportBody.style.maxHeight = "80%";
        reportBody.innerHTML = '';  // Clear previous content

        // Define the table structure
        const rankTable = `
            <table id="purchRepoTable1">
                <thead id="rankTHead1">
                    <tr>
                        <th>Location</th>
                        <th>Department</th>
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
                                <td class="colNoWrap">${item.DeptDesc || 'N/A'}</td>
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
        document.getElementById('deptPurchSumChart').style.display='flex';
        // const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        document.getElementById('printPurchDeptXLS').disabled = false
        deptPurchChart(data)
       
    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error,'Fetch error')
    } finally {
        // Hide loading spinner once data is fetched or an error occurs
        document.getElementById('loadingIndicator').style.display = 'none';
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''
    }

    document.getElementById('printPurchDeptXLS').addEventListener('click', () => {

        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        const titleRowsContent = [
            { text: 'REGENT TRAVEL RETAIL GROUP', style: { fontWeight: 'bold', fontSize: 14 } },
            { text: 'Receiving Summary by Department', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 14 } },
            { text: dateRange, style: { fontStyle: 'italic', fontSize: 12 } },
            { text: '' } // Spacer row
            ];

            const colWidths = [
                { width: 20 },{ width: 20 },{ width: 10 },{ width: 15 },{ width: 15 },
                { width: 15 },{ width: 15 },{ width: 15 },
            ];
        
            const columnConfig = [
                { label: 'Location',getValue: row => row.LocaName,type: 'string',align: 'left'},
                { label: 'Department',getValue: row => row.DeptDesc,type: 'string',align: 'left',totalLabel: 'TOTALS:'},
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

document.getElementById('purchDept').addEventListener('click', () => {
    try {
        FiltrRec('PurcDept').then(() => {
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
            // const cStoreGrp = filterData[12];
            
            PurchSumDept(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, dDateFrom, dDate__To);
    
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")
    }
})

document.addEventListener('DOMContentLoaded', () => {
    const purchSumByDeptElements = document.querySelectorAll('.purchSumByDept'); //<li> menu
    const rankRepoDiv = document.getElementById('PurchSumDept');
    const closeRepo = document.getElementById('closePurcRepo2'); 
    
    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

    purchSumByDeptElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('PurchSumDept')
        });
    });

});


async function deptPurchChart(data) {

    try {
        const purchChartElement = document.getElementById('deptPurchSumChart1');

        // Declare variables for chart instances
        let myChart = window.myChart || null;

        // Destroy existing charts if they exist
        if (myChart) {
            myChart.destroy();
            window.myChart = null;  // Reset reference
        }

        // Clear the canvas context manually (important when reusing canvas elements)
        purchChartElement.getContext('2d').clearRect(0, 0, purchChartElement.width, purchChartElement.height);

        let chartData = data.slice(0,30)
        // if (data.length > 30) {
        //     const rest = data.slice(30);
        //     const othersSRP = rest.reduce((sum, loc) => sum + loc.TotalPrc, 0);
        //     // Add "Others"
        //     pieLabels.push('Others');
        //     pieData.push(othersSRP);
        // }


        // Prepare data for the pie chart 
        const storeGroupTotals = chartData.reduce((acc, entry) => {
            const totalAmount = parseFloat(entry.PurcCost) || 0;
            const storeGroup = entry.DeptDesc.trim(); // Ensure group name is trimmed
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
        const ctx = purchChartElement.getContext('2d');
        myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: storeGroupLabels,
                datasets: [{
                    label: 'Department Categories',
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
        window.myChart = myChart;

    } catch (error) {
        console.error('Error processing chart data:', error);
        displayErrorMsg(error,"'Error processing chart data'")
    }
}
