import { showReport, showNotification } from '../FunctLib.js';
import { FiltrRec } from "../FiltrRec.js"

const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });    


async function SalesRankStore(cBrandNum, cUsersCde, cOtherCde, cCategNum,
    cItemDept, cItemType, cLocation, dDateFrom, dDateTo__) {

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
        const data = await response.json();
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
       
    } catch (error) {
        console.error('Fetch error:', error);
    } finally {
        // Hide loading spinner once data is fetched or an error occurs
        document.getElementById('loadingIndicator').style.display = 'none';
    }
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
        const data = await response.json();
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
       
    } catch (error) {
        console.error('Fetch error:', error);
    } finally {
        // Hide loading spinner once data is fetched or an error occurs
        document.getElementById('loadingIndicator').style.display = 'none';
    }
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

