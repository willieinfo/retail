import {formatDate, get24HrTime, MessageBox, showNotification} from './FunctLib.js'

export async function printReportExcel(jsonData, columnConfig, colWidths, titleRows=[] , cRepoTitle = 'Report', nCols = 1) {
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

            // Check if the column type is datetime
            if (col.type === 'datetime') {
                // Assuming the value is a valid Date object, format it to a string (you can customize the format here)
                value = formatDate(new Date(value).toLocaleDateString(),'MM/DD/YYYY'); // You can change this to `toLocaleDateString()` or other formats if needed
                
            }

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
      stickyRowsCount: titleRows.length + 1,
      stickyColumnsCount: nCols
    });

    MessageBox(// After the file is downloaded
        `The file "${filename}" has been downloaded to your Downloads folder.\n 
        Please open it in Excel to view.`,
        'Ok'
    )
    showNotification(`${filename} in Excel`);

}

export function generateTitleRows(columnConfig, titleRowsContent) {
    const totalCols = columnConfig.length;

    // Build the title rows with left alignment
    const buildLeftAlignedRow = (text, style = {}) => {
        return [
        {
            value: text,
            align: 'left', // Left-align all rows
            ...style
        },
        ...Array(totalCols - 1).fill({ value: '' }) // Fill remaining cells with empty values
        ];
    };

    return titleRowsContent.map(row =>
        row.text === ''
        ? Array(totalCols).fill({ value: '' }) // full-width spacer row
        : buildLeftAlignedRow(row.text, row.style)
    );
}



export function printFormPDF(headerData, detailData, itemFields, createTotals, totalsValue, colWidths, 
    columnHeader, fieldTypes ,imgLogo, paperSetup, formatter, cFileName) {

    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    // You can set format to 'letter', 'a4', or 'a3' and orientation to 'portrait' or 'landscape'
    const doc = new jsPDF({ unit: 'mm', format: paperSetup[0], orientation: paperSetup[1] }); 

    const pageMargin = 10; // Page margin (left, top, right, bottom)
    const lineHeight = 6; // Line height for content - ideal 8
    const startY = 20; // Start Y position for the content
    const pageWidth = doc.internal.pageSize.width;

    const reportFont='Helvetica'
    let currentY = startY;

    doc.setFont("helvetica", "normal");
    doc.setLineWidth(0.2); // line thickness

    // approx position for pageNum
    const pageHeight = doc.internal.pageSize.height; 
    let pageNum = 1

    // Render Table Header and Details
    doc.setFontSize(8);
    const itemLineHeight = 5; // Line height for items
    const tableHeaderHeight = 6; // Row height - Header height
    let bottomMargin = 23; // Preferred bottom margin
    let vertLineTop = 0
    let endOfRow = 0

    // Total column widths dimensions based on colWidths array determines width of report
    const totalColWidth = colWidths.reduce((sum, width) => sum + width, pageMargin);

    // Document Header
    showDocHeader(true)
    doc.addImage(imgLogo, 'BMP', pageMargin, startY - 10, 18, 18);

    let currentX = pageMargin; 
    showTableHeader()

    createVertLines(bottomMargin)   

    detailData.forEach(item => {
        // bottomMargin = currentY + itemLineHeight >= rowsPerPage - pageMargin ? 10 : 23

        if (currentY + itemLineHeight > pageHeight - bottomMargin - pageMargin) {
            doc.setTextColor(0,0,0)
            // Horizontal bottom line for last row on page
            // doc.line(pageMargin, currentY, currentX, currentY); 
            showPageNum()

            // If we reach the bottom of the page, add a new page
            doc.addPage();
            currentY = startY;  // Reset 

            createVertLines(bottomMargin)

            showDocHeader()
            doc.addImage(imgLogo, 'BMP', pageMargin, startY - 10, 18, 18);

            pageNum++
            showPageNum()

            doc.setFont(reportFont, "bold");
            showTableHeader()
            doc.setFont(reportFont, "normal");

        }

        let itemRow = itemFields.map((field,index) => {
            // Handle dynamic formatting based on field type
            if (typeof field === 'function') {
                return field(item, formatter);  // Pass the item and formatter to the function
            }            
            const value = item[field];
            if (fieldTypes[index] === 'integer') {
                return value.toFixed(0);  
            }            
            if (typeof value === 'number') {
                return formatter.format(value); // Currency formatting for numeric fields
            } else if (typeof value === 'string' && value.length > 30) {
                return value.substring(0, 30); // Truncate long strings
            }
            return value; // Default handling
        });

        currentX = pageMargin; // Reset X for each row
        itemRow.forEach((text, i) => {
            // Color based on some condition (e.g., negative quantities)
            if (parseFloat(itemRow[i]) < 0) {
                doc.setTextColor(255, 0, 0); // Red text for negative numbers
            } else {
                doc.setTextColor(0, 0, 0)
            }

            // Default alignment
            let textX = currentX + 2;

            // Check the field type to determine alignment
            const fieldType = fieldTypes[i];
            if (fieldType === 'number' || fieldType === 'calculated' || fieldType === 'integer') {
                textX = currentX + colWidths[i] - 2; // Right-align if numeric
                doc.text(text, textX, currentY + 4, { align: 'right' });
            } else {
                // Otherwise, align text to the left
                doc.text(text, textX, currentY + 4, { align: 'left' });
            }

            currentX += colWidths[i]; // Move to the next column
        });        
        currentY += itemLineHeight; // Move to the next row
        // endOfRow = currentY
    });
    doc.setTextColor(0,0,0)


    // BOTTOM PAGE
    // Horizontal bottom line for last row on page
    doc.setLineDash([1, 2]); 
    doc.line(pageMargin, currentY, totalColWidth, currentY); 


    doc.setFontSize(8);
    doc.setFont(reportFont, "bold");


    // TOTALS Section
    // Print totals based on createTotals array
    const totals = new Array(createTotals.length).fill(0);
    createTotals.forEach((doTotal, i) => {
        if (!doTotal) return;
        totals[i] = totalsValue[i];
    });


    // Align and render totals
    let totalX = pageMargin;
    let textValue = ''
    colWidths.forEach((width, i) => {
        if (createTotals[i]) {
            const value = totals[i];

            if (fieldTypes[i] === 'integer') {
                textValue = value.toFixed(0)
            } else if (value === 'Totals:'){
                textValue = value.trim()
            } else {
                textValue = formatter.format(value)
            }

            doc.text(textValue, totalX + width - 2, currentY + itemLineHeight, { align: 'right' });
        }
        totalX += width;
    });
    endOfRow = currentY + itemLineHeight + 2
    // createVertLines(bottomMargin)   


    // Draw a final line AFTER totals
    // doc.line(pageMargin, currentY + itemLineHeight + 2, totalX, currentY + itemLineHeight + 2); 


    doc.setFont('Courier', "normal");
    doc.text('Prepared By:', pageMargin, pageHeight - 22);
    doc.text('Checked By:', pageMargin + 40, pageHeight - 22);
    doc.text('Willie', pageMargin, pageHeight - 16);
    doc.text('__________________ ', pageMargin, pageHeight - 14);
    doc.text('__________________ ', pageMargin + 40, pageHeight - 14);

    const cDate_Now = formatDate(new Date(), 'MM/DD/YYYY')
    doc.text('RunDate:', pageWidth-pageMargin-40, pageHeight - 22);
    doc.text(cDate_Now, pageWidth-pageMargin - doc.getTextWidth('RunDate: MM/DD/YYYY') + 8, pageHeight - 22);
    doc.text('RunTime:', pageWidth-pageMargin-40, pageHeight - 16);
    doc.text(get24HrTime('12'), pageWidth-pageMargin - doc.getTextWidth('RunTime: 12:00:00 AM') + 10 , pageHeight - 16);

    showPageNum()

    // Save or print the document
    // doc.save('Sales Invoice.pdf');

    // document.querySelector('.pdfReport').src = doc.output('datauristring');

    doc.output('dataurlnewwindow',cFileName);


    function showTableHeader() {
        currentX = pageMargin; // **Reset

        // Draw the header row
        doc.setFillColor(200, 200, 200); // Gray background for headers
        // Full header width
        doc.rect(pageMargin, currentY, totalColWidth - pageMargin, tableHeaderHeight, "F"); 
        
        columnHeader.forEach((header, i) => {
            // **Draw full grid for header**
            doc.rect(currentX, currentY, colWidths[i], tableHeaderHeight); 
            doc.text(header, currentX + 2, currentY + 4);
            currentX += colWidths[i];
        });
        currentY += tableHeaderHeight;
        vertLineTop = currentY // top position where vertical line starts w/c is after header
    }

    function showPageNum() {
        doc.setFont('Courier', "normal");
        // currentY += lineHeight;
        // doc.text(`Page: ${pageNum} of ${totalNoOfPages}`, pageWidth -24- pageMargin, startY + 8)
        doc.text(`Page: ${pageNum}`, pageWidth -18- pageMargin, startY + 8)
    }

    function showDocHeader(firstPage=false) {

        doc.setFontSize(10);
        const cCompName = 'REGENT TRAVEL RETAIL GROUP';
        const cAddress_ = '35 JME Bldg. 3rd Flr Calbayog St., Mandaloyong City';

        doc.setFont(reportFont, "bold");
        doc.text(cCompName, (pageWidth - doc.getTextWidth(cCompName)) / 2, currentY);
        // doc.text(cCompName, 30, currentY);
        currentY += lineHeight;
        doc.text(cAddress_, (pageWidth - doc.getTextWidth(cAddress_)) / 2, currentY);
        // doc.text(cAddress_, 30, currentY);

        const centerPosi = (pageWidth / 2) + pageMargin -10;
        const boxWidth = centerPosi - pageMargin;
        const padding = 2
        const headerHeight = lineHeight + 4; // Adjusted height for the header box

        currentY += lineHeight -2 ;
        // Draw the background rectangle (Gray color) for cModule_
        doc.setFillColor(200, 200, 200); // RGB for gray
        doc.rect(pageMargin, currentY , boxWidth - pageMargin, headerHeight - 2, 'F');

        // Module Name
        doc.setFont(reportFont, "bold");
        doc.setFontSize(10);
        doc.line(pageMargin, currentY, totalColWidth, currentY); 
        const cModule__ = cFileName.trim().toUpperCase();
        doc.text(cModule__, (boxWidth + pageMargin - doc.getTextWidth(cModule__)) / 2, currentY + (headerHeight / 2));
        doc.setFont(reportFont, "normal");
        doc.setFont('Courier', "bold");
        doc.setFontSize(10);
        doc.text(headerData[0], centerPosi + padding, currentY + (headerHeight / 2)); // Ref No.


        // Add a vertical line dividing the columns
        const dividerX = centerPosi - pageMargin; // X position for the center dividing line
        doc.line(dividerX, currentY , dividerX, currentY ); 

        // Draw a line just after the MODULE HEADER and Ref. No. row to separate the header
        currentY += lineHeight
        doc.line(pageMargin, currentY + 2, totalColWidth, currentY +2); 
        // doc.line(dividerX, currentY - lineHeight , dividerX, currentY + lineHeight ); // 2nd vert line

        currentY += lineHeight
        doc.setFont('Courier', "bold");
        doc.text(headerData[1], pageMargin + 2, currentY); // Location
        doc.text(headerData[2], centerPosi + padding, currentY); // OR Date
        // doc.line(dividerX, currentY - lineHeight, dividerX, currentY + lineHeight); // 3nd vert line

        if (headerData[3] && headerData[4]) {
            currentY += lineHeight;
            doc.text(headerData[3], pageMargin + 2, currentY); // Customer
            doc.text(headerData[4], centerPosi + padding, currentY); // Remarks
            // doc.line(dividerX, currentY - lineHeight, dividerX, currentY + lineHeight); // 4th vert line
        }

        if (headerData[5] && headerData[6]) {
            currentY += lineHeight
            doc.text(headerData[5], pageMargin + 2, currentY); 
            doc.text(headerData[6], centerPosi + padding, currentY); 
            // doc.line(dividerX, currentY - lineHeight, dividerX, currentY + lineHeight); // 5th vert line
        }
        if (headerData[7] ) {
            currentY += lineHeight
            doc.text(headerData[7], pageMargin + 2, currentY); 
            doc.text(headerData[8], centerPosi + padding, currentY); 
            // doc.line(dividerX, currentY - lineHeight, dividerX, currentY + lineHeight); // 6th vert line
        }
        if (headerData[9]) {
            currentY += lineHeight
            doc.text(headerData[9], pageMargin + 2, currentY); 
            doc.text(headerData[10], centerPosi + padding, currentY); 
            // doc.line(dividerX, currentY - lineHeight, dividerX, currentY + lineHeight); // 7th vert line
        }
        doc.setFont(reportFont, "normal");
        doc.setFontSize(8);

        if (firstPage) {
            currentY += lineHeight - 2;
        } else {
            currentY += lineHeight - 1
        }

    }

    function createVertLines(bottomLinePosi) {
        let xPos = pageMargin+colWidths[0];
        const nNumOfLines = colWidths.length
        // const addCol = (headerData[7]) ? 44 :40

        for (let i = 1; i < nNumOfLines; i++) {
            doc.setLineDash([1, 2]);
            // Draw vertical dashed line at xPos
            doc.line(xPos, vertLineTop, xPos, pageHeight - bottomLinePosi - pageMargin); 
            // doc.line(xPos, vertLineTop, xPos, endOfRow); 
            
            // Move xPos to the next column's starting position
            xPos += colWidths[i];
        }    
        doc.setLineDash([]);
        const nRowPosi = pageHeight - bottomLinePosi -pageMargin
        doc.line(pageMargin, nRowPosi , totalColWidth, nRowPosi ); 

    }

    // doc.line(startingCol, rowPosition, length, rowPosition)
    // doc.text(textStr, startingCol, rowPosition)

}


