
function printToPDF(headerData, detailData, itemFields, colWidths, 
    columnHeader, fieldTypes ,imgLogo, paperSetup) {
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
    
    // Total column widths based on colWidths array
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
            if (i === 0 && parseFloat(itemRow[i]) < 0) {
                doc.setTextColor(255, 0, 0); // Red text for negative numbers
            } else {
                doc.setTextColor(0, 0, 0); // Black text otherwise
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
    });
    doc.setTextColor(0,0,0)


    // BOTTOM PAGE
    // Horizontal bottom line for last row on page
    doc.setLineDash([1, 2]); 
    doc.line(pageMargin, currentY, currentX, currentY); 

    doc.setFontSize(8);
    doc.setFont(reportFont, "bold");

    // Add totals at the bottom of the page
    const totals = {
        totalQty: itemsDtl.reduce((sum, item) => sum + item.Quantity, 0),
        totalPrice: itemsDtl.reduce((sum, item) => sum + item.Quantity * item.ItemPrce, 0),
        totalDiscount: itemsDtl.reduce((sum, item) => sum + item.Quantity * (item.ItemPrce - item.Amount__), 0),
        totalAmount: itemsDtl.reduce((sum, item) => sum + item.Quantity * item.Amount__, 0)
    };

    // Align TOTALS dynamically
    let totalX = pageMargin; // Start at left margin
    let columnTotal = 0
    colWidths.forEach((width, i) => {
        let textValue = '';
        if (i === 0) {
            // Total Quantity (aligned right)
            textValue = totals.totalQty.toFixed(0); // Total Quantity (no formatting)
            doc.text(textValue, totalX + width - 2, currentY + itemLineHeight, { align: 'right' });
        } else if (i === 4) {
            // No total for Unit Price (column 4), so skip
            totalX += width; // Skip column 4 and move X to the next column
            columnTotal = totalX
            return;        
        } else if ([5, 6, 7].includes(i)) {
            // Columns 5, 6, 7 should have totals and be aligned right
            const totalValues = [totals.totalPrice, totals.totalDiscount, totals.totalAmount];
            textValue = formatter.format(totalValues[i - 5]); // Adjusted for correct index mapping
            doc.text(textValue, totalX + width - 2, currentY + itemLineHeight, { align: 'right' });
        }

        totalX += width; // Move to the next column
    });

    doc.text('Totals:', columnTotal , currentY + itemLineHeight, { align: 'right' });

    // Draw a final line to separate totals
    // doc.line(pageMargin, currentY + itemLineHeight + 2, totalX, currentY + itemLineHeight + 2); 

    doc.setFont('Courier', "normal");
    doc.text('Encoded By:', pageMargin, pageHeight - 22);
    doc.text('Checked By:', pageMargin + 40, pageHeight - 22);
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

    doc.output('dataurlnewwindow','Sales Invoice.pdf');


    function showTableHeader() {
        // const columns = ['Qty', 'Stock No.', 'Bar Code', 'Item Description', 'Unit Price', 'Gross', 'Discount', 'Net'];

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
    
        const centerPosi = (pageWidth / 2) + pageMargin //-20;
        const boxWidth = centerPosi - pageMargin;
        const padding = 14
        const headerHeight = lineHeight + 4; // Adjusted height for the header box
    
        currentY += lineHeight -2 ;
        // Draw the background rectangle (Gray color) for cModule_
        doc.setFillColor(200, 200, 200); // RGB for gray
        doc.rect(pageMargin, currentY , boxWidth - pageMargin, headerHeight - 2, 'F');

        doc.setFont(reportFont, "bold");
        doc.setFontSize(10);
        doc.line(pageMargin, currentY, totalColWidth, currentY); 
        const cModule__ = "SALES RECORD";
        doc.text(cModule__, (boxWidth + pageMargin - doc.getTextWidth(cModule__)) / 2, currentY + (headerHeight / 2));
        doc.setFont(reportFont, "normal");
        doc.setFont('Courier', "bold");
        doc.setFontSize(10);
        doc.text(headerData[0], centerPosi + padding, currentY + (headerHeight / 2)); // Ref No.


        // Add a vertical line dividing the columns
        const dividerX = centerPosi - pageMargin; // X position for the center dividing line
        doc.line(dividerX, currentY , dividerX, currentY ); // 1st vert line for SALES HEADER

        // Draw a line just after the SALES HEADER and Ref. No. row to separate the header
        currentY += lineHeight
        doc.line(pageMargin, currentY + 2, totalColWidth, currentY +2); 
        doc.line(dividerX, currentY - lineHeight , dividerX, currentY + lineHeight ); // 2nd vert line
    
        currentY += lineHeight
        doc.setFont('Courier', "bold");
        doc.text(headerData[1], pageMargin + 2, currentY); // Location
        doc.text(headerData[2], centerPosi + padding, currentY); // OR Date
        doc.line(dividerX, currentY - lineHeight, dividerX, currentY + lineHeight); // 3nd vert line
    
        currentY += lineHeight;
        doc.text(headerData[3], pageMargin + 2, currentY); // Customer
        doc.text(headerData[4], centerPosi + padding, currentY); // Remarks
        doc.line(dividerX, currentY - lineHeight, dividerX, currentY + lineHeight); // 4th vert line
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
        for (let i = 1; i < 8; i++) {
            doc.setLineDash([1, 2]);
            // Draw vertical dashed line at xPos
            doc.line(xPos, startY+40, xPos, pageHeight - bottomLinePosi - pageMargin); 
            
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
