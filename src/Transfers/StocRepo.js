import { showReport, showNotification, formatter, formatDate, startTimer} from '../FunctLib.js';
// import { printFormPDF, printReportExcel, generateTitleRows } from "../PrintRep.js"
import { FiltrRec, displayErrorMsg } from "../FiltrRec.js"


const divStockDetails =`
    <div id="StockDetails" class="report-section containerDiv">
        <div class="ReportHead">
            <span>Stock Transfer Report by Stock No</span>
            <button id="closeTra1" class="closeForm">✖</button>
        </div>
        <div class="ReportBody">
            <div id="transStockDetails" class="ReportBody">
                <table>
                    <thead>
                        <tr>
                            <th>Ref. No.</th>
                            <th>Date Transfer</th>
                            <th>Qty. Out</th>
                            <th>Date Received</th>
                            <th>Qty. In</th>
                            <th>Origin</th>
                            <th>Destination</th>
                            <th>Remarks</th>
                            <th>Brand</th>
                            <th>Classification</th>
                            <th>Stock No.</th>
                            <th>Bar Code</th>
                            <th>Description</th>
                            <th>Selling Price</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                </table>            
            </div>

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
                            <th>Classification</th>
                            <th>Origin</th>
                            <th>Qty. Out</th>
                            <th>Destination</th>
                            <th>Qty. In</th>
                            <th>Tot Amt Out</th>
                            <th>Tot Amt In</th>
                            <th>Tot Cost Out</th>
                            <th>Tot Cost In</th>
                        </tr>
                    </thead>
                </table>            
            </div>

            <div id="transChart" class="chartContainer">
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

const fragment = document.createDocumentFragment();

const div1 = document.createElement('div');
div1.innerHTML = divStockDetails;
fragment.appendChild(div1);

document.body.appendChild(fragment);  


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

async function StockTraDetails(dDateFrom,dDateTo__,cReferDoc,cLocaFrom,cLocaTo__,
    cUsersCde, cOtherCde, cDescript, cBrandNum, cCategNum, cItemType, cItemDept ) {

    document.getElementById('loadingIndicator').style.display = 'flex';
    let { timerInterval, elapsedTime } = startTimer(); 
    let data = null;
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/transfers/StockTraDetails');
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

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        let nTotalQty = 0
        let nTotalRcv = 0
        let nTotalAmt = 0
        let nTotalCos = 0
    
        const listCounter=document.getElementById('transCounter1')
        data = await response.json();
        listCounter.innerHTML=`${data.length} Records`;
        showNotification(`${data.length} Records fetched`);
        clearInterval(timerInterval);        
        document.getElementById('runningTime').textContent=''

        if (Array.isArray(data)) {
            data.forEach(item => {
                nTotalQty+=item.Quantity
                nTotalRcv+=item.QtyRecvd
                nTotalAmt+=item.Amount__
                nTotalCos+=item.LandCost
            });
        }

        const mainReportDiv = document.getElementById('StockDetails');
        mainReportDiv.classList.add('active');

        const reportBody = document.getElementById('transStockDetails');
        reportBody.style.maxHeight = "80%";
        reportBody.innerHTML = '';  // Clear previous content

        // Define the table structure
        const reportTable = `
            <table>
                <thead>
                    <tr>
                        <th>Ref. No.</th>
                        <th>Date Transfer</th>
                        <th>Qty. Out</th>
                        <th>Date Received</th>
                        <th>Qty. In</th>
                        <th>Origin</th>
                        <th>Destination</th>
                        <th>Remarks</th>
                        <th>Brand</th>
                        <th>Classification</th>
                        <th>Stock No.</th>
                        <th>Bar Code</th>
                        <th>Description</th>
                        <th>Selling Price</th>
                        <th>Cost</th>
                    </tr>
                </thead>
                <tbody>
                ${data.map((item) => {
                    return `
                        <tr style=" color: ${item.Outright===2 ? 'rgb(7, 130, 130)' : 'black'}">
                            <td style="text-align: center">${item.ReferDoc || 'N/A'}</td>
                            <td style="text-align: center">${formatDate(item.Date____,'MM/DD/YYYY') || 'N/A'}</td>
                            <td style="text-align: center">${item.Quantity || 'N/A'}</td>
                            <td style="text-align: center">${formatDate(item.DateRcvd,'MM/DD/YYYY') || 'N/A'}</td>
                            <td style="text-align: center">${item.QtyRecvd || 'N/A'}</td>
                            <td class="colNoWrap">${item.LocaFrom || 'N/A'}</td>
                            <td class="colNoWrap">${item.LocaTo__ || 'N/A'}</td>
                            <td class="colNoWrap">${item.Remarks_ || 'N/A'}</td>
                            <td class="colNoWrap">${item.BrandNme || 'N/A'}</td>
                            <td class="colNoWrap">${item.TypeDesc || 'N/A'}</td>
                            <td class="colNoWrap">${item.UsersCde || 'N/A'}</td>
                            <td class="colNoWrap">${item.OtherCde || 'N/A'}</td>
                            <td class="colNoWrap">${item.Descript.substring(0,30) || 'N/A'}</td>
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
                    <td style="text-align: center">${nTotalQty || 'N/A'}</td>
                    <td></td>
                    <td style="text-align: center">${nTotalRcv || 'N/A'}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td style="text-align: right">Total</td>
                    <td style="text-align: right">${formatter.format(nTotalAmt) || 'N/A'}</td>
                    <td style="text-align: right">${formatter.format(nTotalCos) || 'N/A'}</td>
                </tr>
            </tfoot>
        </table>
        `;
        
        // Add the table HTML to the div
        reportBody.innerHTML =  reportTable;

        // Show report chart
        document.getElementById('transDetailsChart').style.display='flex';
        StockChart(data,'Details1')
        StockChart(data,'Details2')
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

document.getElementById('transBtn1').addEventListener('click', async () => {
    try {
        FiltrRec('StocRep1').then(() => {
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
            'Details2': 'transChart2'
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
            'Details2': 'TypeDesc'
        };
        const dataField = dataFieldMapping[showData];

        // Check if the mapping is valid
        if (!dataField) {
            console.error(`Unknown showData type: ${showData}`);
            return;
        }

        // Prepare data for the pie chart
        const groupTotals = chartData.reduce((acc, entry) => {
            const totalAmount = parseFloat(entry.Amount__) || 0;
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
            'Details2': 'Top Classifications'
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

            // options: {
            //     responsive: true,
            //     maintainAspectRatio: false,
            //     plugins: {
            //         legend: {
            //             position: 'top',
            //             labels: {
            //                 font: {
            //                     family: 'Arial Narrow',
            //                     size: 10
            //                 }
            //             }
            //         },
            //         tooltip: {
            //             callbacks: {
            //                 label: function (context) {
            //                     const percentage = dataGroupPercentages[context.dataIndex]; // Get the percentage for the corresponding label
            //                     const value = context.raw || 0;
            //                     return `${percentage}%`;
            //                 }
            //             }
            //         },
            //         datalabels: {
            //             anchor: 'end',
            //             align: 'end',
            //             formatter: (value, context) => {
            //                 const percentage = dataGroupPercentages[context.dataIndex]; // Get the percentage for the corresponding value
            //                 return `${percentage}%`;
            //             },
            //             color: '#fff',
            //             font: {
            //                 weight: 'bold',
            //                 size: 10
            //             }
            //         }
            //     }
            // }
        });

        // Store the chart instances globally if needed (optional)
        window.myCharts = window.myCharts || {};
        window.myCharts[dataCanvass] = myChart;

    } catch (error) {
        console.error('Error processing chart data:', error);
        displayErrorMsg(error, "'Error processing chart data'");
    }
}

// async function StockChart(data, showData) {
//     try {
//         // Define a mapping of showData to canvas IDs
//         const dataCanvasMapping = {
//             'Details1' : 'transChart1',
//             'Details2' : 'transChart2'
//         };

//         // Get the canvas ID based on showData
//         const dataCanvass = dataCanvasMapping[showData];

//         if (!dataCanvass) {
//             console.error(`Unknown data type: ${showData}`);
//             return;
//         }        

        
//         const reportChartElement = document.getElementById(dataCanvass);

//         // Declare variables for chart instances
//          let myChart = window.myCharts && window.myCharts[dataCanvass] || null;

//         // Destroy existing charts if they exist
//         if (myChart) {
//             myChart.destroy();
//         }

//         // Clear the canvas context manually (important when reusing canvas elements)
//         reportChartElement.getContext('2d').clearRect(0, 0, reportChartElement.width, reportChartElement.height);

//         // let chartData = data.slice(0,20)
//         let chartData = data

//         const dataFieldMapping = {
//             'Details1' : 'BrandNme',
//             'Details2' : 'TypeDesc'
//         };        
//         const dataField = dataFieldMapping[showData];

//         // Check if the mapping is valid
//         if (!dataField) {
//             console.error(`Unknown showData type: ${showData}`);
//             return;
//         }
//         // Prepare data for the pie chart 
//         const groupTotals = chartData.reduce((acc, entry) => {
//             const totalAmount = parseFloat(entry.Amount__) || 0;
//             // Dynamically access the property based on `showData`
//             const dataGroup = entry[dataField]?.trim() || '';  
//             acc[dataGroup] = (acc[dataGroup] || 0) + totalAmount;

//             return acc;
//         }, {});

//         let dataGroupTotals = groupTotals.slice(0,20)

//         // Sort data groups by total amount in descending order
//         const sortedGroups = Object.entries(dataGroupTotals).sort((a, b) => b[1] - a[1]);

//         const dataGroupLabels = sortedGroups.map(entry => entry[0]);
//         const dataGroupValues = sortedGroups.map(entry => entry[1]);

//         // Update dynamic text content based on `showData`
//         const headingMapping = {
//             'Details1' : 'Top Brands',
//             'Details2' : 'Top Classifications'
//         };
       
//         const headingElementId = `h5top${dataFieldMapping[showData].substring(0, 4)}`;
//         document.getElementById(headingElementId).textContent = headingMapping[showData];        

//         if (data.length > 20) {
//             // const rest = data.slice(20);
//             // const others = rest.reduce((sum, grp) => sum + grp.PurcCost, 0);
//             // // Add "Others"
//             // dataGroupLabels.push('OTHERS');
//             // dataGroupValues.push(others);
//         }

//         const totalValues = Object.values(dataGroupTotals).reduce((acc, value) => acc + value, 0); // Calculate total values
//         const dataGroupPercentages = dataGroupValues.map(value => (value / totalValues * 100).toFixed(2)); // Calculate percentages

//         const generateRandomColor = () => {
//             const r = Math.floor(Math.random() * 255);
//             const g = Math.floor(Math.random() * 255);
//             const b = Math.floor(Math.random() * 255);
//             return `rgba(${r}, ${g}, ${b}, 0.6)`;
//         };

//         const backgroundColors = dataGroupLabels.map(() => generateRandomColor());
//         const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

//         // Create the chart 
//         const ctx = reportChartElement.getContext('2d');
//         myChart = new Chart(ctx, {
//             type: 'bar',
//             data: {
//                 labels: dataGroupLabels,
//                 datasets: [{
//                     label: 'Values',
//                     data: dataGroupValues,
//                     backgroundColor: backgroundColors,
//                     borderColor: borderColors,
//                     borderWidth: 1
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: {
//                         position: 'top',
//                         labels: {
//                             font: {
//                                 family: 'Arial Narrow',
//                                 size: 10
//                             }
//                         }
//                     },
//                     tooltip: {
//                         callbacks: {
//                             label: function(context) {
//                                 const percentage = dataGroupPercentages[context.dataIndex]; // Get the percentage for the corresponding label
//                                 const value = context.raw || 0;
//                                 return `${percentage}%`; 
//                             }
//                         }
//                     },
//                     datalabels: {
//                         anchor: 'end',
//                         align: 'end',
//                         formatter: (value, context) => {
//                             const percentage = dataGroupPercentages[context.dataIndex]; // Get the percentage for the corresponding value
//                             return `${percentage}%`;
//                         },
//                         color: '#fff',
//                         font: {
//                             weight: 'bold',
//                             size: '10'
//                         }
//                     }
//                 }
//             }
//         });

//         // Store the chart instances globally if needed (optional)
//         // window.myChart = myChart;
//         window.myCharts = window.myCharts || {};
//         window.myCharts[dataCanvass] = myChart;        

//     } catch (error) {
//         console.error('Error processing chart data:', error);
//         displayErrorMsg(error,"'Error processing chart data'")
//     }
// }
