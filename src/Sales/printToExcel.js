// /* <script src="https://unpkg.com/write-excel-file@1.x/bundle/write-excel-file.min.js"></script> */

const btnXLSX=document.getElementById("btnXLSX")
btnXLSX.addEventListener('click', ()=>createXLSX())


function createXLSX() {
    const jsonData = [
        {LocaGrup: 'REGENT TRAVEL GROUP',
            LocaName: 'AIRMALL T3',
            Quantity: 120,
            ItemPrce: 1200,
            Amount__: 1000,
            LandCost: 400
        },
        {LocaGrup: 'REGENT TRAVEL GROUP',
            LocaName: 'TRAVEL HUB BATANGAS',
            Quantity: 120,
            ItemPrce: 2100,
            Amount__: 1600,
            LandCost: 460
        }
    ]
    const titleRows = [
        [{ value: 'REGENT TRAVEL RETAIL GROUP', fontWeight: 'bold', fontSize: 14 }],
        [{ value: 'Sales Ranking by Location', fontWeight: 'bold', fontSize: 12, fontStyle:'italic' }],
        [{ value: '' }] // empty row
    ];
    
    const columnConfig = [
        {
          label: 'Group',
          getValue: row => row.LocaGrup,
          type: 'string',
          align: 'left'
        },
        {
          label: 'Location',
          getValue: row => row.LocaName,
          type: 'string',
          align: 'left'
        },
        {
          label: 'Quantity',
          getValue: row => +row.Quantity,
          total: rows => rows.reduce((sum, r) => sum + (+r.Quantity || 0), 0),
          align: 'right',
          type: 'integer',
          format: '#,##0'
        },
        {
          label: 'Gross',
          getValue: row => +row.ItemPrce,
          total: rows => rows.reduce((sum, r) => sum + (+r.ItemPrce || 0), 0),
          align: 'right',
          format: '#,##0.00'
        },
        {
          label: 'Discount',
          getValue: row => +(row.ItemPrce - row.Amount__),
          total: rows => rows.reduce((sum, r) => sum + (+(r.ItemPrce - r.Amount__) || 0), 0),
          align: 'right',
          format: '#,##0.00'
        },
        {
          label: 'Net',
          getValue: row => +row.Amount__,
          total: rows => rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0),
          align: 'right',
          format: '#,##0.00'
        },
        {
          label: 'Cost',
          getValue: row => +row.LandCost,
          total: rows => rows.reduce((sum, r) => sum + (+r.LandCost || 0), 0),
          align: 'right',
          format: '#,##0.00'
        },
        {
          label: 'Gross Profit',
          getValue: row => +(row.Amount__ - row.LandCost),
          total: rows => rows.reduce((sum, r) => sum + (+(r.Amount__ - r.LandCost) || 0), 0),
          align: 'right',
          format: '#,##0.00'
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
          format: 'percent'
        },
        {
          label: 'CTS %',
          getValue: (row, rows) => {
            const totalAmount = rows.reduce((sum, r) => sum + (+r.Amount__ || 0), 0);
            return totalAmount ? (row.Amount__ / totalAmount) * 100 : 0;
          },
          align: 'right',
          format: 'percent'
        }
    ];
      
    const colWidths =  [
        { width: 25 }, // Column A (e.g. Group)
        { width: 30 }, // Column B (e.g. Location)
        { width: 10 }, // Quantity
        { width: 15 }, // Gross
        { width: 15 }, // Discount
        { width: 15 }, // Net
        { width: 15 }, // Cost
        { width: 20 }, // Gross Profit
        { width: 10 }, // GP %
        { width: 10 }  // CTS %
    ]
   printReportExcel(jsonData, columnConfig, colWidths, titleRows, 'StoreRanking');
}

async function printReportExcel(jsonData, columnConfig, colWidths, titleRows = [], cRepoTitle = 'Report') {
    if (!jsonData || !jsonData.length) {
      alert("No data to export.");
      return;
    }
  
    // Build header row
    const headers = columnConfig.map(col => ({ value: col.label, fontWeight: 'bold' }));
  
    // Build data rows
    const rows = jsonData.map(row =>
      columnConfig.map(col => {
        let value = col.getValue(row, jsonData); // pass full data for % columns
        const isPercent = col.format === 'percent';
        return {
          value: isPercent ? `${value.toFixed(2)}%` : value,
          align: col.align || 'left',
          format: isPercent ? undefined : col.format
        };
      })
    );
  
    // Build totals row
    const totalsRow = columnConfig.map(col => {
    
      if (typeof col.total === 'function') {
        const totalValue = col.total(jsonData);
        const isPercent = col.format === 'percent';
        return {
          value: isPercent ? `${totalValue.toFixed(2)}%` : totalValue,
          align: col.align || 'right',
          fontWeight: 'bold',
          topBorderStyle : "thick"
        };

      } else if (typeof col.type === 'string') {
        return { value: '', align: col.align || 'left' };
    
      }
      return { value: '', align: col.align || 'left', fontWeight: 'bold',  topBorderStyle : "thick" };
    });
  
    // Assemble final data
    const data = [
        ...titleRows,
        headers,
        ...rows,
        totalsRow
    ];
      
    // Write the file
    const date = new Date().toISOString().slice(0, 10);
    const filename = `${cRepoTitle}_Report_${date}.xlsx`;
  
    await writeXlsxFile(data, {
      fileName: filename,
      columns: colWidths
    });
  }
  
// Property	Description
// value	The actual cell content (string, number, boolean, or Date)
// bold	true or false to make text bold
// color	Font color. Can be a hex like '#FF0000' or Excel RGB like 'RGB(255,0,0)'
// backgroundColor	Cell background fill color (same color format as color)
// fontSize	Font size in points (e.g., 12)
// align	'left', 'center', or 'right'
// format	Excel number format string (e.g., "#,##0.00" or "0%")

// You can format numbers like this:
// Format String	Output Example	Use For
// "#,##0"	1,000	Integers with commas
// "#,##0.00"	1,234.56	Two decimal points with commas
// "0%"	75%	Percent values
// "0.00%"	75.00%	Percent with 2 decimals
// "mm/dd/yyyy"	04/15/2025	Dates

// You can even dynamically format values. For example:
// value: someValue,
// format: Number.isInteger(someValue) ? "#,##0" : "#,##0.00"