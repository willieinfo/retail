const btnXLSX = document.getElementById("btnXLSX").addEventListener('click', () => createXLSX());

function createXLSX() {
    const jsonData = [
        {LocaGrup: 'REGENT TRAVEL GROUP',
            Date____: '01/31/2025',
            LocaName: 'AIRMALL T3',
            Quantity: 120,
            ItemPrce: 1200,
            Amount__: 1000,
            LandCost: 400
        },
        {LocaGrup: 'REGENT TRAVEL GROUP',
            Date____: '01/31/2025',
            LocaName: 'TRAVEL HUB BATANGAS',
            Quantity: 120,
            ItemPrce: 2100,
            Amount__: 1600,
            LandCost: 460
        }
    ];

    const titleRowsContent = [
      { text: 'REGENT TRAVEL RETAIL GROUP', style: { fontWeight: 'bold', fontSize: 14 } },
      { text: 'Sales Ranking by Location', style: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 12 } },
      { text: '' } // Spacer row
    ];
    
    const colWidths = [
        { width: 25 }, // Column A (e.g. Group)
        { width: 15 },
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
          getValue: row => row.LocaGrup,
          type: 'string',
          align: 'left'
        },
        {
          label: 'Date',
          getValue: row => row.Date____,
          type: 'string',
          align: 'center',
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
    const numCols = columnConfig.length;

    function generateTitleRows(columnConfig, titleRowsContent, visualStartIndex = 1) {
      const totalCols = columnConfig.length;
      const visualCols = totalCols - visualStartIndex;
      const centerIndex = visualStartIndex + Math.floor(visualCols / 2) - 1;
    
      const buildCenteredRow = (text, style = {}) => {
        return [
          ...Array(centerIndex).fill({ value: '' }),
          {
            value: text,
            align: 'center',
            ...style
          },
          ...Array(totalCols - centerIndex - 1).fill({ value: '' })
        ];
      };
    
      return titleRowsContent.map(row =>
        row.text === ''
          ? Array(totalCols).fill({ value: '' }) // full-width spacer row
          : buildCenteredRow(row.text, row.style)
      );
    }
    
    
    const titleRows = generateTitleRows(columnConfig, titleRowsContent, 0);

     
    printReportExcel(jsonData, columnConfig, colWidths, titleRows, 'StoreRanking');
}

async function printReportExcel(jsonData, columnConfig, colWidths, titleRows = [], cRepoTitle = 'Report') {
    if (!jsonData || !jsonData.length) {
      alert("No data to export.");
      return;
    }
  
    // Build header row
    const headers = columnConfig.map(col => ({ value: col.label, fontWeight: 'bold', align: 'center' }));
  
    // Build data rows
    const rows = jsonData.map(row =>
      columnConfig.map(col => {
        let value = col.getValue(row, jsonData); // pass full data for % columns
        const isPercent = col.cellFormat === 'percent'; // changed format to cellFormat
        return {
          value: isPercent ? `${value.toFixed(2)}%` : value,
          align: col.align || 'left',
          format: isPercent ? undefined : col.cellFormat // changed format to cellFormat
        };
      })
    );
  
    const totalsRow = columnConfig.map(col => {
      if (typeof col.total === 'function') {
          const totalValue = col.total(jsonData);
    
          // Check if the format should apply commas (i.e., not for percentages)
          const isPercent = col.cellFormat === 'percent';
          let formattedValue = totalValue;
    
          // Apply comma formatting with 2 decimal places for numbers (except Quantity)
          if (!isPercent) {
              if (col.type === 'integer') {
                  // Quantity (integer) should have no decimals
                  formattedValue = totalValue.toLocaleString(); // Apply comma formatting, no decimals
              } else {
                  formattedValue = totalValue.toFixed(2); // Ensure 2 decimal places as a string
                  formattedValue = formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Apply comma formatting in the string
                  // console.log(col.label,formattedValue)
              }
          }
    
          // Handle the formatting for percentages (without commas, with % symbol)
          if (isPercent) {
              formattedValue = `${(totalValue).toFixed(2)}%`; // Show percentage with 2 decimal places
          }
    
          return {
            value: formattedValue,
            align: col.align || 'right',
            fontWeight: 'bold',
            topBorderStyle: "thick",
            cellFormat: '#,##0.00' 
          };
    
      } else if (col.totalLabel === '100%') {
          return { value: '100.00%', align: 'right', fontWeight: 'bold', topBorderStyle: "thick" };
    
      } else if (typeof col.type === 'string') {
        if (col.totalLabel === 'undefined') {
          return { value: '', align: 'left' };
        } 
        return { value: col.totalLabel, align: 'right', fontWeight: 'bold' };
    
      }
      return { value: '', align: col.align || 'left', fontWeight: 'bold', topBorderStyle: "thick" };
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
      columns: colWidths,
      stickyRowsCount: titleRows.length,
      stickyColumnsCount: 1
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