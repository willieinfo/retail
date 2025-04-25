import { showReport, showNotification, formatter, formatDate} from '../FunctLib.js';
import {printReportExcel, generateTitleRows} from '../PrintRep.js'
import { FiltrRec } from "../FiltrRec.js"

async function SalesRankStore(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, dDateFrom, dDateTo__) {

    let data = null;
    document.getElementById('loadingIndicator').style.display = 'flex';
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/sales/SalesRankStore');
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
        let nTotalDsc = 0
        let nTotalAmt = 0
        let nTotalCon = 0
        let nTotalDue = 0
        let nTotalCos = 0
        let nTotalGro = 0
        let nGP_Prcnt = 0
        let nGP_Total = 0
    
        
        const listCounter=document.getElementById('saleRank1Counter')
        data = await response.json();
        listCounter.innerHTML=`${data.length} Records`;
        showNotification(`${data.length} Records fetched`);

        if (Array.isArray(data)) {
            data.forEach(item => {
                nTotalQty+=item.Quantity
                nTotalPrc+=item.ItemPrce
                nTotalDsc+=(item.ItemPrce-item.Amount__)
                nTotalAmt+=item.Amount__
                nTotalCon+=item.Concessi
                nTotalDue+=(item.Amount__-item.Concessi)
                nTotalCos+=item.LandCost
                nTotalGro+=(item.Amount__-item.Concessi-item.LandCost)

            });
        }
        if (nTotalAmt !== 0) {
            nGP_Total = ((nTotalAmt-nTotalCos-nTotalCon) / nTotalAmt) * 100; // GP% formula
        }

        const salesRankStoreDiv = document.getElementById('SalesRankStore');
        salesRankStoreDiv.classList.add('active');

        const reportBody = document.getElementById('salesRankStore');
        reportBody.innerHTML = '';  // Clear previous content

        // Define the table structure
        const rankTable = `
            <table id="salesRankTable1">
                <thead id="rankTHead1">
                    <tr>
                        <th>Location</th>
                        <th>Quantity</th>
                        <th>Gross</th>
                        <th>Discount</th>
                        <th>Net</th>
                        <th>Concession</th>
                        <th>Net Due</th>
                        <th>Cost</th>
                        <th>Gross Profit</th>
                        <th>GP %</th>
                        <th>CTS %</th>
                    </tr>
                </thead>
                <tbody id="rankTBody">
                    ${data.map(item => {
                        nGP_Prcnt = 0;
                        if (item.Amount__ !== 0) {
                            nGP_Prcnt = ((item.Amount__ - item.LandCost-item.Concessi) / item.Amount__) * 100; // GP% formula
                        }
                        return `
                            <tr>
                                <td class="colNoWrap">${item.LocaName || 'N/A'}</td>
                                <td style="text-align: center">${item.Quantity || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ItemPrce) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ItemPrce - item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Concessi) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Amount__ - item.Concessi) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.LandCost) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Amount__ - item.LandCost -item.Concessi) || 'N/A'}</td>
                                <td>${nGP_Prcnt ? nGP_Prcnt.toFixed(2) + '%' : 'N/A'}</td>
                                <td>${(item.Amount__ / nTotalAmt *100).toFixed(2) + '%'|| 'N/A'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr style="height: 2px"></tr>
                    <tr style="font-weight: bold">
                        <td style="text-align: right">Total</td>
                        <td style="text-align: center">${nTotalQty || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalPrc) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalDsc) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalAmt) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalCon) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalDue) || 'N/A'}</td>
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
        document.getElementById('storeRankChart').style.display='flex';
        const dateRange = `From: ${formatDate(dDateFrom,'MM/DD/YYYY')} To: ${formatDate(dDateTo__,'MM/DD/YYYY')}`
        setStoreChart(data, dateRange)

       
    } catch (error) {
        console.error('Fetch error:', error);
    } finally {
        // Hide loading spinner once data is fetched or an error occurs
        document.getElementById('loadingIndicator').style.display = 'none';
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
           
          printReportExcel(data, columnConfig, colWidths, titleRows, 'StoreRanking');
    })
    
}

// Wait for the DOM to fully load before adding the event listener
document.addEventListener('DOMContentLoaded', () => {
    const salesRankLocationElements = document.querySelectorAll('.salesRankingByLocation');
    const rankRepoDiv = document.getElementById('SalesRankStore');
    const closeRepo = document.getElementById('closeRepo1');
    
    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

        // Add event listener to each element with the necessary arguments
    salesRankLocationElements.forEach(element => {
        element.addEventListener('click', () => {
            showReport('SalesRankStore')
        });
    });
});

async function SalesRankBrand(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, dDateFrom, dDateTo__) {

    document.getElementById('loadingIndicator').style.display = 'flex';
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
        let nTotalCon = 0
        let nTotalDue = 0
        let nTotalCos = 0
        let nTotalGro = 0
        let nGP_Prcnt = 0
        let nGP_Total = 0
    
        const listCounter=document.getElementById('saleRank2Counter')
        data = await response.json();
        listCounter.innerHTML=`${data.length} Records`;
        showNotification(`${data.length} Records fetched`);

        if (Array.isArray(data)) {
            data.forEach(item => {
                nTotalQty+=item.Quantity
                nTotalPrc+=item.ItemPrce
                nTotalDsc+=(item.ItemPrce-item.Amount__)
                nTotalAmt+=item.Amount__
                nTotalCon+=item.Concessi
                nTotalDue+=(item.Amount__-item.Concessi)
                nTotalCos+=item.LandCost
                nTotalGro+=(item.Amount__-item.Concessi-item.LandCost)
            });
        }
        if (nTotalAmt !== 0) {
            nGP_Total = ((nTotalAmt-nTotalCos-nTotalCon) / nTotalAmt) * 100; // GP% formula
        }

        const salesRankBrandDiv = document.getElementById('SalesRankBrand');
        salesRankBrandDiv.classList.add('active');

        const reportBody = document.getElementById('salesRankBrand');
        reportBody.innerHTML = '';  // Clear previous content

        // Define the table structure
        const rankTable = `
            <table id="salesRankTable1">
                <thead id="rankTHead1">
                    <tr>
                        <th>Brand</th>
                        <th>Quantity</th>
                        <th>Gross</th>
                        <th>Discount</th>
                        <th>Net</th>
                        <th>Concession</th>
                        <th>Net Due</th>
                        <th>Cost</th>
                        <th>Gross Profit</th>
                        <th>GP %</th>
                        <th>CTS %</th>
                    </tr>
                </thead>
                <tbody id="rankTBody">
                    ${data.map(item => {
                        nGP_Prcnt = 0;
                        if (item.Amount__ !== 0) {
                            nGP_Prcnt = ((item.Amount__ - item.LandCost-item.Concessi) / item.Amount__) * 100; // GP% formula
                        }
                        return `
                            <tr>
                                <td class="colNoWrap">${item.BrandNme || 'N/A'}</td>
                                <td style="text-align: center">${item.Quantity || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ItemPrce) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.ItemPrce - item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Amount__) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Concessi) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Amount__ - item.Concessi) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.LandCost) || 'N/A'}</td>
                                <td style="text-align: right">${formatter.format(item.Amount__ - item.LandCost -item.Concessi) || 'N/A'}</td>
                                <td>${nGP_Prcnt ? nGP_Prcnt.toFixed(2) + '%' : 'N/A'}</td>
                                <td>${(item.Amount__ / nTotalAmt *100).toFixed(2) + '%'|| 'N/A'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr style="height: 2px"></tr>
                    <tr style="font-weight: bold">
                        <td style="text-align: right">Total</td>
                        <td style="text-align: center">${nTotalQty || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalPrc) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalDsc) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalAmt) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalCon) || 'N/A'}</td>
                        <td style="text-align: right">${formatter.format(nTotalDue) || 'N/A'}</td>
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
        rankBrandSales(data, dateRange)
       
    } catch (error) {
        console.error('Fetch error:', error);
    } finally {
        // Hide loading spinner once data is fetched or an error occurs
        document.getElementById('loadingIndicator').style.display = 'none';
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

          printReportExcel(data, columnConfig, colWidths, titleRows, 'StoreRanking');
    })

}

// Wait for the DOM to fully load before adding the event listener
document.addEventListener('DOMContentLoaded', () => {
    const salesRankLocationElements = document.querySelectorAll('.salesRankingByBrand');
    const rankRepoDiv = document.getElementById('SalesRankBrand');
    const closeRepo = document.getElementById('closeRepo2');
    
    closeRepo.addEventListener('click', () => {
        rankRepoDiv.classList.remove('active');
    });

        // Add event listener to each element with the necessary arguments
    salesRankLocationElements.forEach(element => {
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
    
            SalesRankStore(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, dDateFrom, dDate__To);

        });
    } catch (error) {
        console.error("Error processing the filter:", error);
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
    
            SalesRankBrand(cBrandNum, cUsersCde, cOtherCde, cCategNum, cItemDept, 
                cItemType, cLocation, dDateFrom, dDate__To);

        });
    } catch (error) {
        console.error("Error processing the filter:", error);
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

        // Create the horizontal bar chart (myChart1)
        // const ctx1 = storeChart1Element.getContext('2d');
        // myChart1 = new Chart(ctx1, {
        //     type: 'bar',
        //     data: {
        //         labels: storeNames,
        //         datasets: [{
        //             label: 'Top 30 Stores',
        //             data: storeAmounts,
        //             backgroundColor: 'rgba(54, 162, 235, 0.6)',
        //             borderColor: 'rgba(54, 162, 235, 1)',
        //             borderWidth: 1
        //         }]
        //     },
        //     options: {
        //         responsive: true,
        //         maintainAspectRatio: false,
        //         backgroundColor: '#282828',  // Set the background color of the chart area
        //         layout: {
        //             padding: {
        //                 left: 10,
        //                 right: 10,
        //                 top: 10,
        //                 bottom: 10
        //             }
        //         },
        //         indexAxis: 'y',
        //         scales: {
        //             x: {
        //                 beginAtZero: true,
        //                 ticks: {
        //                     font: {
        //                         family: 'Arial Narrow',
        //                         size: 12
        //                     },
        //                     color: 'white',  // x-axis tick labels color
        //                     padding: 5,  // Adjust padding between x-axis labels and canvas
        //                 },
        //                 grid: {
        //                     color: '#d3d3d3',  // Set grid color for x-axis
        //                 }
        //             },
        //             y: {
        //                 ticks: {
        //                     font: {
        //                         family: 'Arial Narrow',
        //                         size: 12
        //                     },
        //                     color: 'black',  // y-axis tick labels color
        //                 },
        //                 grid: {
        //                     color: '#d3d3d3',  // Set grid color for y-axis
        //                 }
        //             }
        //         },
        //         plugins: {
        //             legend: {
        //                 display: false
        //             }
        //         }
        //     }
        // });
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
                brandMap[item.BrandNme] = { Amount__: 0};
            }
            brandMap[item.BrandNme].Amount__ += Math.round(item.Amount__);
        });

        // Sort the brandMap by amount
        let sortedBrands = Object.entries(brandMap)
            .map(([BrandNme, values]) => ({ BrandNme, ...values }))
            .slice(0, 30);

        // Now assign background colors after sorting
        const backgroundColors = sortedBrands.map(item => 
            item.Outright === 'Outright' ? 'rgba(54, 162, 235, 0.6)' : 'rgba(75, 192, 192, 0.2)'
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
        // Add UI feedback here if needed
    }
}
