import { showReport, showNotification, formatter, formatDate, goMonth} from '../FunctLib.js';
// import {printReportExcel, generateTitleRows} from '../PrintRep.js'
import { FiltrRec, displayErrorMsg } from "../FiltrRec.js"

const divStockEndLoca = `
    <div id="StockEndLocation" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Stock Ending By Location</span>
            <button id="closeStockEndLoca" class="closeForm">✖</button>
        </div>
        <div class="ReportBody">
            <div id="stockEndLocation" class="ReportBody">
                <table>
                    <thead>
                        <tr>
                            <th>Location</th>
                            <th>Total Qty</th>
                            <th>Total Cost</th>
                            <th>Total Price</th>
                        </tr>
                    </thead>
                </table>            
            </div>

            <div id="stockEndLocaChart">
                <div id="locaEndBarChart">
                    <h5>Inventory By SRP</h5>
                    <canvas id="locaEndChart1"></canvas>
                </div>
                <div class="divPieChart">
                    <h5>Contribution to Inventory</h5>
                    <div class="pieContainer">
                        <canvas id="locaEndChart2"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <span id="stockEndLocaCounter" class="recCounter"></span>
                <button id="printStockEndLoca"><i class="fa fa-file-excel"></i> Excel</button>
                <button id="stockEndLocaFilter"><i class="fa fa-filter"></i> Filter List</button>
            </div>
        </div>
    </div>
`

const divStockEndBrand = `
<div id="StockEndBrand" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Stock Ending By Brand</span>
            <button id="closeStockEndBrand" class="closeForm">✖</button>
        </div>
        <div class="ReportBody">
            <div id="stockEndBrand" class="ReportBody">
                <table>
                    <thead>
                        <tr>
                            <th>Brand</th>
                            <th>Total Qty</th>
                            <th>Total Cost</th>
                            <th>Total Price</th>
                        </tr>
                    </thead>
                </table>            
            </div>

            <div id="stockEndBrandChart">
                <div class="divPieChart">
                    <h5>Contribution to Inventory</h5>
                    <div class="pieContainer">
                        <canvas id="brandEndChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="ReportFooter" style="justify-content: flex-end;">
            <div class="footSegments">
                <span id="stockEndBrandCounter" class="recCounter"></span>
                <button id="printStockEndBrand"><i class="fa fa-file-excel"></i> Excel</button>
                <button id="stockEndBrandFilter"><i class="fa fa-filter"></i> Filter List</button>
            </div>
        </div>
    </div>
`

const fragment = document.createDocumentFragment();

const div1 = document.createElement('div');
div1.innerHTML = divStockEndLoca;
fragment.appendChild(div1);

const div2 = document.createElement('div');
div2.innerHTML = divStockEndBrand;
fragment.appendChild(div2);

document.body.appendChild(fragment);  // Only one reflow happens here


async function StockEndLocation(cLocation, cStoreGrp, dDateAsOf , cBrandNum, cItemType, cItemDept, cCategNum,
    cUsersCde, cOtherCde, cDescript) {

    let data = null;
    document.getElementById('loadingIndicator').style.display = 'flex';
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/inventory/StockEndingByLocation');
        const params = new URLSearchParams();
        if (dDateAsOf) params.append('DateAsOf', dDateAsOf); 
        if (cLocation) params.append('Location', cLocation);
        if (cStoreGrp) params.append('StoreGrp', cStoreGrp);
        if (cBrandNum) params.append('BrandNum', cBrandNum);
        if (cItemType) params.append('ItemType', cItemType); 
        if (cItemDept) params.append('ItemDept', cItemDept); 
        if (cCategNum) params.append('CategNum', cCategNum); 
        if (cUsersCde) params.append('ItemDept', cUsersCde); 
        if (cOtherCde) params.append('OtherCde', cOtherCde); 
        if (cDescript) params.append('Descript', cDescript); 

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        data = await response.json();
        const listCounter=document.getElementById('stockEndLocaCounter')
        listCounter.innerHTML=`${data.length} Records`;
        showNotification(`${data.length} Records fetched`);
        console.log(data)
        
        if (data.length===0) return
        const reportBody = document.getElementById('stockEndLocation');
        if (data.length > 30) {
            reportBody.style.height='700px'
        }

        let nTotalQty = 0
        let nTotalCos = 0
        let nTotalPrc = 0

        data.forEach(item => {
            nTotalQty+=item.TotalQty
            nTotalPrc+=item.TotalPrc
            nTotalCos+=item.TotalCos
        });

        reportBody.innerHTML = '';  // Clear previous content

        const listReport = `
            <div>
                <table id="stockEndLocaTable">
                    <thead>
                        <tr>
                            <th>Location</th>
                            <th>Total Qty</th>
                            <th>Total Cost</th>
                            <th>Total Price</th>
                        </tr>
                    </thead>
                    <tbody id="stockEndLocaBody">
                        ${data.map((item, index) => `
                            <tr data-index="${index}">
                                <td class="colNoWrap">${item.LocaName || 'N/A'}</td>
                                <td style="text-align: center">${item.TotalQty.toFixed(0) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.TotalCos) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.TotalPrc) || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="height: 2px"></tr>
                        <tr style="font-weight: bold">
                            <td style="text-align: right">Total</td>
                            <td style="text-align: center">${nTotalQty.toFixed(0) || 'N/A'}</td>
                            <td style="text-align: right">${formatter.format(nTotalCos) || 'N/A'}</td>
                            <td style="text-align: right">${formatter.format(nTotalPrc) || 'N/A'}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        reportBody.innerHTML = listReport

        document.getElementById('stockEndLocaChart').style.display='flex';
        document.getElementById('stockEndLocaChart').style.flexDirection='column';

        setStockEndByLocationChart(data, dDateAsOf);

    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg('Fetch error: '+error)

    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

document.getElementById('stockEndLocaFilter').addEventListener('click', () => {
    try {
        FiltrRec('StocEnd1').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));
    
            // const dDateFrom = filterData[0];
            // const dDate__To = filterData[1];
            const cLocation = filterData[2];
            const cUsersCde = filterData[3];
            const cOtherCde = filterData[4];
            const cDescript = filterData[5];
            const cBrandNum = filterData[6];
            const cCategNum = filterData[7];
            const cItemType = filterData[8];
            const cItemDept = filterData[9];
            // const cReferDoc = filterData[10];
            const dDateAsOf = filterData[11];
            const cStoreGrp = filterData[12];

            StockEndLocation(cLocation ,cStoreGrp, dDateAsOf , cBrandNum, cItemType, cItemDept, cCategNum,
                cUsersCde, cOtherCde, cDescript );
    
        });
    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")

    }
})


async function setStockEndByLocationChart(data, cAsOfDate) {
    try {

        const locationChart1Element = document.getElementById('locaEndChart1');
        const locationChart2Element = document.getElementById('locaEndChart2');

        // Destroy previous charts if they exist
        if (window.myChart1) window.myChart1.destroy();
        if (window.myChart2) window.myChart2.destroy();

        // === Sort all locations by TotalPrc (descending) ===
        // const sortedData = data.sort((a, b) => b.TotalPrc - a.TotalPrc);
        const sortedData = [...data].sort((a, b) => b.TotalPrc - a.TotalPrc);
        const totalSRP = sortedData.reduce((sum, loc) => sum + loc.TotalPrc, 0);
        

        // === Chart 1: Column chart for all locations ===
        const allLabels = sortedData.map(loc => loc.LocaName);
        const allValues = sortedData.map(loc => loc.TotalPrc);

        const ctx1 = locationChart1Element.getContext('2d');
        window.myChart1 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: allLabels,
                datasets: [{
                    label: 'Inventory By SRP',
                    data: allValues,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Inventory by SRP as of ${cAsOfDate}`
                    },
                    font: {
                        family: 'Arial Narrow',
                        size: 14 // smaller title
                    },                    
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            autoSkip: false,
                            maxRotation: 90,
                            minRotation: 45,
                            ticks: {
                                font: {
                                    family: 'Arial Narrow',
                                    size: 12
                                },
                                color: 'black',  // y-axis tick labels color
                            },
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                family: 'Arial Narrow',
                                size: 12
                            },
                            color: 'black',  // y-axis tick labels color
                        },

                    }
                }
            }
        });

        // === Chart 2: Pie chart for Top 20 locations' percentage ===
        const top20 = sortedData.slice(0, 20);
        // Labels and values
        const pieLabels = top20.map(loc => loc.LocaName);
        const pieData = top20.map(loc => loc.TotalPrc);

        if (data.length > 20) {
            const rest = sortedData.slice(20);
            const othersSRP = rest.reduce((sum, loc) => sum + loc.TotalPrc, 0);
            // Add "Others"
            pieLabels.push('Others');
            pieData.push(othersSRP);
        }
        
        // Recalculate percentages for all segments
        const piePercentages = pieData.map(val => ((val / totalSRP) * 100).toFixed(2));

        const pieColors = pieLabels.map(() =>
            `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, 0.6)`
        );

        const ctx2 = locationChart2Element.getContext('2d');
        window.myChart2 = new Chart(ctx2, {
            type: 'pie',
            data: {
                labels: pieLabels,
                datasets: [{
                    data: pieData,
                    backgroundColor: pieColors,
                    borderColor: pieColors.map(c => c.replace('0.6', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 10
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                const dataset = data.datasets[0];
                    
                                return data.labels.map((label, i) => {
                                    const rawValue = dataset.data[i];
                                    const percentage = piePercentages[i];
                                    const shortLabel = label.substring(0, 18);
                                    return {
                                        text: `${percentage}% - ${shortLabel}`,
                                        fillStyle: dataset.backgroundColor[i],
                                        strokeStyle: dataset.borderColor[i],
                                        lineWidth: dataset.borderWidth,
                                        hidden: chart.getDatasetMeta(0).data[i].hidden,
                                        index: i
                                    };
                                });
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const idx = context.dataIndex;
                                return `${pieLabels[idx]}: ${piePercentages[idx]}%`;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Top 20 Locations – % CTI'
                    },
                    font: {
                        size: 14 // smaller title
                    }                    
                }
            }
        });

    } catch (error) {
        console.error('Error loading or processing chart data:', error);
        displayErrorMsg(error,'Error loading or processing chart data')
    }
}
// Wait for the DOM to fully load before adding the event listener
document.addEventListener('DOMContentLoaded', () => {
    const stockEndingByLocation = document.getElementById('stockEndingByLocation'); //<li>
    const rankRepoDiv = document.getElementById('StockEndLocation');
    const closeRepo = document.getElementById('closeStockEndLoca');
    
    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

        // Add event listener to each element with the necessary arguments
    stockEndingByLocation.addEventListener('click', () => {
        showReport('StockEndLocation')
    });
});




document.getElementById('stockEndBrandFilter').addEventListener('click', () => {
    try {
        FiltrRec('StocEnd2').then(() => {
            const filterData = JSON.parse(localStorage.getItem("filterData"));
    
            // const dDateFrom = filterData[0];
            // const dDate__To = filterData[1];
            const cLocation = filterData[2];
            const cUsersCde = filterData[3];
            const cOtherCde = filterData[4];
            const cDescript = filterData[5];
            const cBrandNum = filterData[6];
            const cCategNum = filterData[7];
            const cItemType = filterData[8];
            const cItemDept = filterData[9];
            // const cReferDoc = filterData[10];
            const dDateAsOf = filterData[11];
            const cStoreGrp = filterData[12];

            StockEndBrand(cLocation ,cStoreGrp, dDateAsOf , cBrandNum, cItemType, cItemDept, cCategNum,
                cUsersCde, cOtherCde, cDescript );
        });


    } catch (error) {
        console.error("Error processing the filter:", error);
        displayErrorMsg(error,"Error processing the filter")

    }
})

async function StockEndBrand(cLocation, cStoreGrp, dDateAsOf , cBrandNum, cItemType, cItemDept, cCategNum,
    cUsersCde, cOtherCde, cDescript) {

    let data = null;
    document.getElementById('loadingIndicator').style.display = 'flex';
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/inventory/StockEndingByBrand');
        const params = new URLSearchParams();
        if (dDateAsOf) params.append('DateAsOf', dDateAsOf); 
        if (cLocation) params.append('Location', cLocation);
        if (cStoreGrp) params.append('StoreGrp', cStoreGrp);
        if (cBrandNum) params.append('BrandNum', cBrandNum);
        if (cItemType) params.append('ItemType', cItemType); 
        if (cItemDept) params.append('ItemDept', cItemDept); 
        if (cCategNum) params.append('CategNum', cCategNum); 
        if (cUsersCde) params.append('ItemDept', cUsersCde); 
        if (cOtherCde) params.append('OtherCde', cOtherCde); 
        if (cDescript) params.append('Descript', cDescript); 

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        data = await response.json();
        const listCounter=document.getElementById('stockEndBrandCounter')
        listCounter.innerHTML=`${data.length} Records`;
        showNotification(`${data.length} Records fetched`);
        
        if (data.length===0) return

        const reportBody = document.getElementById('stockEndBrand');
        if (data.length > 30) {
            reportBody.style.height='700px'
        }
        reportBody.innerHTML = '';  // Clear previous content

        let nTotalQty = 0
        let nTotalCos = 0
        let nTotalPrc = 0

        data.forEach(item => {
            nTotalQty+=item.TotalQty
            nTotalPrc+=item.TotalPrc
            nTotalCos+=item.TotalCos
        });

        const listReport = `
            <div>
                <table id="stockEndBrandTable">
                    <thead>
                        <tr>
                            <th>Brand</th>
                            <th>Total Qty</th>
                            <th>Total Cost</th>
                            <th>Total Price</th>
                        </tr>
                    </thead>
                    <tbody id="stockEndBrandBody">
                        ${data.map((item, index) => `
                            <tr data-index="${index}">
                                <td class="colNoWrap">${item.BrandNme || 'N/A'}</td>
                                <td style="text-align: center">${item.TotalQty.toFixed(0) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.TotalCos) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.TotalPrc) || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="height: 2px"></tr>
                        <tr style="font-weight: bold">
                            <td style="text-align: right">Total</td>
                            <td style="text-align: center">${nTotalQty.toFixed(0) || 'N/A'}</td>
                            <td style="text-align: right">${formatter.format(nTotalCos) || 'N/A'}</td>
                            <td style="text-align: right">${formatter.format(nTotalPrc) || 'N/A'}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        reportBody.innerHTML = listReport

        document.getElementById('stockEndBrandChart').style.display='flex';
        document.getElementById('stockEndBrandChart').style.flexDirection='column';

        setStockEndByBrandChart(data, dDateAsOf);

    } catch (error) {
        console.error('Fetch error:', error);
        displayErrorMsg(error,'Fetch error')

    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}


async function setStockEndByBrandChart(data, cAsOfDate) {
    try {
        // const response = await fetch(dataSource);
        // const data = await response.json();

        const brandChartElement = document.getElementById('brandEndChart');

        // Destroy previous charts if they exist
        if (window.myChart3) window.myChart3.destroy();

        // === Sort all brands by totalsrp (descending) ===
        // const sortedData = data.sort((a, b) => b.totalsrp - a.totalsrp);
        const sortedData = [...data].sort((a, b) => b.TotalPrc - a.TotalPrc);
        const totalSRP = sortedData.reduce((sum, loc) => sum + loc.TotalPrc, 0);
        

        // === Chart 3: Pie chart for Top 30 brands' percentage ===
        const top20 = sortedData.slice(0, 20);
        // Labels and values
        const pieLabels = top20.map(loc => loc.BrandNme);
        const pieData = top20.map(loc => loc.TotalPrc);

        if (data.length > 20) {
            const rest = sortedData.slice(20);
            const othersSRP = rest.reduce((sum, loc) => sum + loc.TotalPrc, 0);
            // Add "Others"
            pieLabels.push('Others');
            pieData.push(othersSRP);
        }
        
        
        
        // Recalculate percentages for all segments
        const piePercentages = pieData.map(val => ((val / totalSRP) * 100).toFixed(2));

        const pieColors = pieLabels.map(() =>
            `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, 0.6)`
        );

        const ctx2 = brandChartElement.getContext('2d');
        window.myChart3 = new Chart(ctx2, {
            type: 'pie',
            data: {
                labels: pieLabels,
                datasets: [{
                    data: pieData,
                    backgroundColor: pieColors,
                    borderColor: pieColors.map(c => c.replace('0.6', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 10
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                const dataset = data.datasets[0];
                    
                                return data.labels.map((label, i) => {
                                    const rawValue = dataset.data[i];
                                    const percentage = piePercentages[i];
                                    const shortLabel = label.substring(0, 18);
                                    return {
                                        text: `${percentage}% - ${shortLabel}`,
                                        fillStyle: dataset.backgroundColor[i],
                                        strokeStyle: dataset.borderColor[i],
                                        lineWidth: dataset.borderWidth,
                                        hidden: chart.getDatasetMeta(0).data[i].hidden,
                                        index: i
                                    };
                                });
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const idx = context.dataIndex;
                                return `${pieLabels[idx]}: ${piePercentages[idx]}%`;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: `Top 20 Brands – % CTI As of: ${cAsOfDate}`
                    },
                    font: {
                        size: 14 // smaller title
                    }                    
                }
            }
        });

    } catch (error) {
        console.error('Error loading or processing chart data:', error);
        displayErrorMsg('Error loading or processing chart data: '+error)
    }
}
// Wait for the DOM to fully load before adding the event listener
document.addEventListener('DOMContentLoaded', () => {
    const stockEndingByBrand = document.getElementById('stockEndingByBrand');
    const rankRepoDiv = document.getElementById('StockEndBrand');
    const closeRepo = document.getElementById('closeStockEndBrand');
    
    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

        // Add event listener to each element with the necessary arguments
    stockEndingByBrand.addEventListener('click', () => {
        showReport('StockEndBrand')
    });
});
