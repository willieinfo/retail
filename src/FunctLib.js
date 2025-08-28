
// Function to show the selected report and hide others
export function showReport(reportType) {
    // Hide all report sections
    const sections = document.querySelectorAll('.report-section');
    sections.forEach((section) => {
        section.classList.remove('active');
    });

    // Show the selected report section
    const selectedSection = document.getElementById(reportType);
    selectedSection.classList.add('active');

    document.querySelectorAll('.filter-form').forEach(e => {
        e.remove()
    })
    document.querySelectorAll('.modal-overlay').forEach(e => {
        e.remove()
    })

}

export function formatDate(dateString, cDateFormat='MM/DD/YYYY') {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month and pad with 0
    const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with 0
    const year = date.getFullYear();
    if (cDateFormat==='MM/DD/YYYY') return `${month}/${day}/${year}`; 
    if (cDateFormat==='YYYY-MM-DD') return `${year}-${month}-${day}`;
};


export function showNotification(cMessage) {
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notification-message");

    // Display the notification with a sliding effect
    notificationMessage.innerHTML=`<i class="fa fa-check"></i>  ${cMessage}`;
    notification.classList.add("show");

    // Set a time delay for how long the notification will stay visible (e.g., 3 seconds)
    setTimeout(function() {
        notification.classList.remove("show");
    }, 3000); // 3000ms = 3 seconds

    document.addEventListener('click', (e) => {
        notification.classList.remove("show");
    });

}

export function MessageBox(message, buttons, alertMessage='Alert Message', backColor='whitesmoke', placeTop=false) {
    return new Promise((resolve) => {
        // Disable background scrolling
        document.body.style.overflow = 'hidden';        

        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = placeTop ? '' : 'rgba(0, 0, 0, 0.1)';
        overlay.style.zIndex = '1000';

        // Create modal
        const modal = document.createElement('div');
        modal.style.position = 'absolute';
        modal.style.top =  placeTop ? '0' : '50%';
        modal.style.left = '50%';
        modal.style.maxWidth = '600px';
        modal.style.transform = placeTop ? 'translate(-50%)' : 'translate(-50%, -50%)';
        modal.style.backgroundColor = backColor;
        modal.style.padding = '0';
        modal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        modal.style.borderRadius = '5px';
        modal.style.fontFamily = "Tahoma, Lucida Console";
        modal.style.flexWrap = "wrap";

        // Create Title Bar
        const titleBar = document.createElement('div');
        titleBar.style.display = 'flex'; 
        // titleBar.style.justifyContent = 'center'; 
        titleBar.style.alignItems = 'center'; 
        titleBar.style.width="auto" ;
        titleBar.style.height="30px" ;
        titleBar.style.color = "white" ;
        titleBar.style.backgroundColor = 'var(--main-bg-color)' ;
        titleBar.style.margin="0" ;
        titleBar.style.padding="0" ;
        titleBar.style.paddingLeft="10px" ;
        titleBar.style.borderTopLeftRadius = '5px';
        titleBar.style.borderTopRightRadius = '5px';
        modal.appendChild(titleBar);

        const titleMsg = document.createElement('label');
        titleMsg.innerText=alertMessage;
        titleMsg.style.color= "white";
        titleBar.appendChild(titleMsg);

        // Create Modal Body
        const modalBody = document.createElement('div');
        modalBody.style.width="100%" ;
        modalBody.style.height="100%" ;
        modalBody.style.padding = '20px';
        modalBody.style.paddingBottom = '5px';
        modal.appendChild(modalBody);


        // Create message
        const messageParagraph = document.createElement('p');
        messageParagraph.innerHTML = message.replace(/(\r\n|\n|\r)/g, '<br>');    
        messageParagraph.style.paddingBottom = '20px'    
        modalBody.appendChild(messageParagraph);


        // Create buttons
        const btnDiv = document.createElement('div');
        btnDiv.style.display = 'flex'; // Enable flexbox
        btnDiv.style.justifyContent = 'center'; // Center horizontally
        btnDiv.style.alignItems = 'center'; // Center vertically (if needed)
        btnDiv.style.paddingBottom = '0';
        btnDiv.style.marginBottom = '0';
        modalBody.appendChild(btnDiv);

        const buttonArray = buttons.split(',').map(btn => btn.trim());
        buttonArray.forEach((btnText, index) => {
            const button = document.createElement('button'); // Corrected here
            button.textContent = btnText;
            button.style.margin = '5px';
            button.style.width = '80px';
            button.style.height = '30px';
            button.style.display = 'inline-flex';
            button.style.alignItems = 'center'; // align vertically
            button.style.justifyContent= "center";
            button.style.backgroundColor = "var(--main-bg-color)" ;
            button.style.color = "white" ;
            button.style.cursor = "pointer";

            button.onclick = () => {
                resolve(index);  // Resolve with the index of the button clicked
                cleanup();
            };

            btnDiv.appendChild(button); // Append button to btnDiv
        });


        // Append modal to overlay
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        makeDraggable(modal, titleBar)

        // Cleanup function to remove the modal
        function cleanup() {
            document.body.removeChild(overlay);
            // Re-enable scrolling
            document.body.style.overflow = '';            
        }
    });
}

export async function populateBrandNum(cBrandNum, cBrandNme, cModule='FiltrRec') {
    const brandSelect = document.getElementById(cModule+'_BrandNum');
    brandSelect.innerHTML = '';

    const emptyOption = document.createElement('option');
    emptyOption.value = ''; 
    emptyOption.textContent = 'Select a brand'; // You can set custom text here
    brandSelect.appendChild(emptyOption);
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/product/brands');
        const params = new URLSearchParams();
        if (cBrandNum) params.append('BrandNum', cBrandNum);
        if (cBrandNme) params.append('BrandNme', cBrandNme);

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const listBrnd = await response.json();
        listBrnd.forEach(data => {
            const option1 = document.createElement('option');
            option1.value = data.BrandNum;
            option1.textContent = data.BrandNme;
            brandSelect.appendChild(option1);
            });

    } catch (error) {
        console.error('Fetch Brand error:', error);
        displayErrorMsg(error,'Fetch Brand error')
    }
}

export async function populateCategNum(cCategNum, cCategNme, cModule='FiltrRec') {
    const categnumSelect = document.getElementById(cModule+'_CategNum');
    categnumSelect.innerHTML = '';

    const emptyOption = document.createElement('option');
    emptyOption.value = ''; 
    emptyOption.textContent = 'Select a category'; // You can set custom text here
    categnumSelect.appendChild(emptyOption);
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/product/categnum');
        const params = new URLSearchParams();
        if (cCategNum) params.append('CategNum', cCategNum);
        if (cCategNme) params.append('CategNme', cCategNme);

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const listCate = await response.json();
        listCate.forEach(data => {
            const option = document.createElement('option');
            option.value = data.CategNum;
            option.textContent = data.CategNme;
            categnumSelect.appendChild(option);
            });

    } catch (error) {
        console.error('Fetch Category error:', error);
        displayErrorMsg(error,'Fetch Category error')
    }
}


export async function populateItemDept(cItemDept, cDescript, cModule='FiltrRec') {
    const itemdeptSelect = document.getElementById(cModule+'_ItemDept');
    itemdeptSelect.innerHTML = '';

    const emptyOption = document.createElement('option');
    emptyOption.value = ''; 
    emptyOption.textContent = 'Select a department'; // You can set custom text here
    itemdeptSelect.appendChild(emptyOption);
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/product/itemdept');
        const params = new URLSearchParams();
        if (cItemDept) params.append('ItemDept', cItemDept);
        if (cDescript) params.append('Descript', cDescript);

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const listDept = await response.json();
        listDept.forEach(data => {
            const option = document.createElement('option');
            option.value = data.ItemDept;
            option.textContent = data.DeptDesc;
            itemdeptSelect.appendChild(option);
            });

    } catch (error) {
        console.error('Fetch Department error:', error);
        displayErrorMsg(error,'Fetch Department error')
    }
}

export async function populateItemType(cItemType, cDescript, cModule='FiltrRec') {
    const itemtypeSelect = document.getElementById(cModule+'_ItemType');
    itemtypeSelect.innerHTML = '';

    const emptyOption = document.createElement('option');
    emptyOption.value = ''; 
    emptyOption.textContent = 'Select a class'; // You can set custom text here
    itemtypeSelect.appendChild(emptyOption);
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/product/itemtype');
        const params = new URLSearchParams();
        if (cItemType) params.append('ItemType', cItemType);
        if (cDescript) params.append('Descript', cDescript);

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const listDept = await response.json();
        listDept.forEach(data => {
            const option = document.createElement('option');
            option.value = data.ItemType;
            option.textContent = data.TypeDesc;
            itemtypeSelect.appendChild(option);
            });

    } catch (error) {
        console.error('Fetch Department error:', error);
        displayErrorMsg(error,'Fetch Department error')
    }
}

export async function populateStoreGrp(cStoreGrp, cModule='FiltrRec') {
    const storegrpSelect = document.getElementById(cModule+'_StoreGrp');
    storegrpSelect.innerHTML = '';

    const emptyOption = document.createElement('option');
    emptyOption.value = ''; 
    emptyOption.textContent = 'Select a Location Group'; // You can set custom text here
    storegrpSelect.appendChild(emptyOption);
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/lookup/storegrp');
        const params = new URLSearchParams();
        if (cStoreGrp) params.append('StoreGrp', cStoreGrp);

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const listGrup = await response.json();
        listGrup.forEach(data => {
            const option = document.createElement('option');
            option.value = data.StoreGrp;
            option.textContent = data.StoreGrp;
            storegrpSelect.appendChild(option);
            });

    } catch (error) {
        console.error('Fetch StoreGrp error:', error);
        displayErrorMsg(error,'Fetch StoreGrp error')
    }
}

export async function populateLocation(cLocation, cLocaName, cSellArea='', cLocat_Id='FiltrRec_Location',lDisabled = 0) {
    const locationSelect = document.getElementById(cLocat_Id);
    locationSelect.innerHTML = '';
    const cStoreGrp = ''

    const emptyOption = document.createElement('option');
    emptyOption.value = ''; 
    emptyOption.textContent = 'Select a location'; // You can set custom text here
    locationSelect.appendChild(emptyOption);
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/lookup/location');
        const params = new URLSearchParams();
        if (cLocation) params.append('Location', cLocation);
        if (cLocaName) params.append('LocaName', cLocaName);
        if (cStoreGrp) params.append('StoreGrp', cStoreGrp);
        if (lDisabled) params.append('Disabled', lDisabled);

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const listLoca = await response.json();
        listLoca.forEach(data => {
            if (data.Disabled===0) {return}
            if (cSellArea==='SellArea' && !data.SellArea) {return}
                
            const option = document.createElement('option');
            option.value = data.Location;
            option.textContent = data.LocaName;
            locationSelect.appendChild(option);
            });

    } catch (error) {
        console.error('Fetch Location error:', error);
        displayErrorMsg(error,'Fetch Location error')
    }
}

export async function populateSuppNum_(cSuppNum_, cSuppName, cModule='ItemList') {
    const suppnum_Select = document.getElementById(cModule+'_SuppNum_');
    suppnum_Select.innerHTML = '';

    const emptyOption = document.createElement('option');
    emptyOption.value = ''; 
    emptyOption.textContent = 'Select a Supplier'; // You can set custom text here
    suppnum_Select.appendChild(emptyOption);
    try {
        // Build query parameters
        const url = new URL('http://localhost:3000/lookup/supplier');
        const params = new URLSearchParams();
        if (cSuppNum_) params.append('SuppNum_', cSuppNum_);
        if (cSuppName) params.append('SuppName', cSuppName);

        // Send request with query parameters
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const listSupp = await response.json();
        listSupp.forEach(data => {
            if (data.Disabled===0) {return}
            const option = document.createElement('option');
            option.value = data.SuppNum_;
            option.textContent = data.SuppName;
            suppnum_Select.appendChild(option);
            });

    } catch (error) {
        console.error('Fetch Supplier error:', error);
        displayErrorMsg(error,'Fetch Supplier error')
    }
}

export async function validateField(cModule, fieldId, url, alertMessage, editmode=false) {
    const fieldValue = document.getElementById(cModule+'_'+fieldId).value;
    const params = new URLSearchParams();
    
    fieldId = fieldId ==='ScanCode' ? 'UsersCde' : fieldId

    if (fieldValue) params.append(fieldId, fieldValue);
    try {
        const response = await fetch(`${url}?${params.toString()}`);
        const data = await response.json();

        // Just check to see if record exist
        // addItemList-> prevents duplicate
        if (data.length > 0 && !editmode) {
            alert(alertMessage);
            return false; // Return false when validation fails (field exists)
        }

        // Just check to see if record exist, then return recordset
        // addSalesDetail-> get ItemCode
        if (data.length > 0 && editmode) {
            return data;  
        }

        return false; // Return false (field does not exist)
    } catch (error) {
        console.error('Error during fetch:', error);
        displayErrorMsg(error,'Fetch validate error')
        return false; // Optionally handle fetch error as failure (validation fails)
    }
}

export function checkEmptyValue(...fields) {
    // Loop through each field to check if it's empty or invalid
    for (let field of fields) {
        // Check if the field is empty, contains only spaces, or is zero for numeric fields
        if (!field.value.trim() || (field.type === "number" && (isNaN(field.value) || field.value === "0"))) {
            document.getElementById(field.id).focus();
            let labelElement = document.querySelector(`label[for="${field.id}"]`);
            alert(labelElement.textContent + ' is empty.');  // Alert to notify user
            return false;  // Return false to stop further processing
        }
    }
    return true;  // Return true if no empty or invalid fields are found
}

export function get24HrTime(timeFormat='24') {
    const now = new Date();

    // Extract hours, minutes, and seconds
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    if (timeFormat === '24') {
        // Return time in 24-hour format
        hours = hours < 10 ? '0' + hours : hours;
        return `${hours}:${minutes}:${seconds}`;
    } else {
        // Convert to 12-hour format with AM/PM
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12; // Convert hour to 12-hour format
        hours = hours ? hours : 12; // Convert hour 0 to 12 for midnight
        return `${hours}:${minutes}:${seconds} ${ampm}`;
    }

}

// formatter.js
export const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
export function formatNumber(value) {
    return formatter.format(value);
}

export function highlightRow(targetRow, tableSelector) {
    if (!targetRow || !tableSelector) return;

    // Remove highlight from all rows in the specified table
    document.querySelectorAll(`${tableSelector} tbody tr`).forEach(row => {
        row.style.backgroundColor = ''; 
        row.style.color = '';
        row.style.fontWeight = ''
    });

    // Highlight the clicked row
    targetRow.style.backgroundColor = 'color-mix(in srgb, var(--second-bg-color) 30%, white)';
    targetRow.style.color = 'black';
    targetRow.style.fontWeight = 'bold';
}



// imageLoader.js
window.base64Image = null;

export function loadImageToBase64() {
    const img = new Image();
    img.src = '/images/complogo.png';  // Path to your logo image

    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);
        
        window.base64Image = canvas.toDataURL('image/png');
        // console.log("Image loaded and converted to base64.");
    };
}

// Load the image when the page loads (or when this script is executed)
loadImageToBase64();

export async function chkUsersCde(editMode, cModule, otherDetails) {
    const UsersCde=document.getElementById(cModule+'_UsersCde')

    if (!UsersCde.value ) {
        UsersCde.focus();
        return;
    }
    if (UsersCde.value.length < 5) {
        UsersCde.focus()
        return;
    }

    try {
        document.getElementById('loadingIndicator').style.display = 'flex';
        // Call to your backend to validate and get the list of items
        let dataItemList = await validateField(cModule,'UsersCde', 'http://localhost:3000/product/checkUsersCde', '', true);

        document.getElementById('loadingIndicator').style.display = 'none';

        if (dataItemList) {
            // If more than one item is returned, show the pick list
            if (dataItemList.length > 1) {
                const inputElement = UsersCde;
                
                // Call pickItem function to show the pick list
                const selectedItem = await pickItem(dataItemList, inputElement);
                if (!selectedItem) {
                    // Handle case where no selection is made
                    UsersCde.value = '';
                    UsersCde.focus();
                    return;
                }
                
                // Proceed with the selected item
                document.getElementById(cModule+'_UsersCde').value = selectedItem.UsersCde;
                document.getElementById(cModule+'_OtherCde').value = selectedItem.OtherCde;
                document.getElementById(cModule+'_Descript').value = selectedItem.Descript;
                
                if (!editMode) {
                    if (cModule==='StockRec') {
                        document.getElementById(cModule+'_ItemPrce').value = selectedItem.ItemPrce;
                    } else if (cModule==='SalesRec') {
                        document.getElementById(cModule+'_Amount__').value = selectedItem.ItemPrce;
                        document.getElementById(cModule+'_ItemPrce').value = selectedItem.ItemPrce;
                    } else if (cModule==='PurchRec') {
                        document.getElementById(cModule+'_ItemPrce').value = selectedItem.ItemCost;
                        document.getElementById(cModule+'_SellPrce').value = selectedItem.ItemPrce;
                    }

                }

                // Additional variables
                otherDetails.nLandCost = selectedItem.LandCost;
                otherDetails.cItemCode = selectedItem.ItemCode;

            } else {
                // If only one item is returned, fill in the form fields
                const item = dataItemList[0]; // The single item returned
                document.getElementById(cModule+'_UsersCde').value = item.UsersCde;
                document.getElementById(cModule+'_OtherCde').value = item.OtherCde;
                document.getElementById(cModule+'_Descript').value = item.Descript;

                if (!editMode) {
                    if (cModule==='StockRec') {
                        document.getElementById(cModule+'_ItemPrce').value = item.ItemPrce;
                    } else if (cModule==='SalesRec') {
                        document.getElementById(cModule+'_Amount__').value = item.ItemPrce;
                        document.getElementById(cModule+'_ItemPrce').value = item.ItemPrce;
                    } else if (cModule==='PurchRec') {
                        document.getElementById(cModule+'_ItemPrce').value = item.ItemCost;
                        document.getElementById(cModule+'_SellPrce').value = item.ItemPrce;
                    }
                }

                // Set additional fields
                otherDetails.nLandCost = item.LandCost;
                otherDetails.cItemCode = item.ItemCode;
            }
            // Close pickItemDiv if it's open
            const pickItemDiv = document.getElementById('pickItemDiv');
            if (pickItemDiv) {
                pickItemDiv.style.display = 'none';  // Hide the pickItemDiv if it's open
            }

        }

    } catch (error) {
        console.error("Error fetching or processing data:", error);
        displayErrorMsg(error,'Fetch error')
    }

}


export async function addScanCode(cModule, currentRec) {

    const { addSalesDtl } = await import('./Sales/SalesLst.js');
    const { addStockDtl } = await import('./Transfers/StockLst.js');
    const { addPurchDtl } = await import('./Purchases/PurchLst.js');

    const ScanCode = document.getElementById(cModule+'_ScanCode')
    if (!ScanCode.value) {
        ScanCode.focus();
        return;
    }
    if (ScanCode.value.length < 5) {
        ScanCode.focus();
        return;
    }

    try {

        document.getElementById('loadingIndicator').style.display = 'flex';

        let cItemCode = '', nItemPrce = 0, nLandCost = 0, nItemCost = 0
        // Call to your backend to validate and get the list of items
        const dataItem = await validateField(cModule,'ScanCode', 'http://localhost:3000/product/checkUsersCde', '', true);
        document.getElementById('loadingIndicator').style.display = 'none';
        
        if (!dataItem) {
            alert(`${ScanCode.value} is not found.`)
            ScanCode.value='';
            ScanCode.focus();
            return;
        }

        if (dataItem) {
            // If more than one item is returned, show the pick list
            if (dataItem.length > 1) {
                const inputElement = ScanCode;
                
                // Call pickItem function to show the pick list
                const selectedItem = await pickItem(dataItem, inputElement);
                if (!selectedItem) {
                    // Handle case where no selection is made
                    ScanCode.value = '';
                    ScanCode.focus();
                    return;
                }
                
                // Proceed with the selected item
                cItemCode = selectedItem.ItemCode
                nItemPrce = selectedItem.ItemPrce
                nLandCost = selectedItem.LandCost
                nItemCost = selectedItem.ItemCost

            } else {
                // If only one item is returned, fill in the form fields
                const item = dataItem[0]; // The single item returned
                cItemCode = item.ItemCode
                nItemPrce = item.ItemPrce
                nLandCost = item.LandCost
                nItemCost = item.ItemCost

            }
        }
        // Close pickItemDiv if it's open
        const pickItemDiv = document.getElementById('pickItemDiv');
        if (pickItemDiv) {
            pickItemDiv.style.display = 'none';  // Hide the pickItemDiv if it's open
        }

        const cCtrlNum_ = currentRec.CtrlNum_
        const nAmount__ = nItemPrce
        const nQuantity = 1
        const nDiscRate = 0
        const cTimeSale = get24HrTime()
        const dDate____ = new Date()
        const cSuffixId = 'ES'
        // console.log(cCtrlNum_,cItemCode,dDate____,cTimeSale,nQuantity,nItemPrce,nDiscRate,nAmount__,nLandCost)

        if (cModule==='SalesRec') {
            addSalesDtl(cCtrlNum_,cItemCode,dDate____,cTimeSale,nQuantity,nItemPrce,nDiscRate,nAmount__,nLandCost,cSuffixId)
        } else if (cModule==='StockRec') {
            const nQtyRecvd = 1
            addStockDtl(cCtrlNum_,cItemCode,nQuantity,nQtyRecvd,nAmount__,nLandCost,cSuffixId)
        } else if (cModule==='PurchRec') {
            const nPOQty___ = 1
            addPurchDtl(cCtrlNum_,cItemCode,nQuantity,nPOQty___,nItemCost,nItemPrce,nLandCost,cSuffixId)
        }
        ScanCode.value=''
        ScanCode.focus()

    } catch (error) {
        console.error("Error fetching or processing data:", error);
        displayErrorMsg(error,'Fetch ScanCode error')
    }

}

export function debounce(func, delay) {
    let timeout;
    return function(...args) {
        // Clear the timeout if it exists
        clearTimeout(timeout);
        // Set a new timeout to execute the function after the delay
        timeout = setTimeout(() => func(...args), delay);
    };
}

export function goMonth(dateString, monthOffset) {
    const date = new Date(dateString);
    date.setMonth(date.getMonth() + monthOffset);  // Adjust month by the offset
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Format month
    const day = String(date.getDate()).padStart(2, '0');  // Format day
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
    // return `${month}/${day}/${year}`;
}
  
export function getCurrentTime() {
    return new Date();
}

export function getTimeUsed(startTime) {
    const endTime = new Date();
    const timeDiff = endTime - startTime; // in milliseconds

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}




export function pickItem(dataItemList, inputElement) {
    return new Promise((resolve) => {
        if (!inputElement) return;

        // Disable autocomplete to prevent suggestions
        inputElement.setAttribute('autocomplete', 'off');

        // Create the pickItemDiv and dropdownList dynamically
        const pickItemDiv = document.createElement('div');
        pickItemDiv.id = 'pickItemDiv';

        const savedPos = localStorage.getItem('pickItemDiv');
        if (savedPos) {
            const { left, top } = JSON.parse(savedPos);
            pickItemDiv.style.left = `${left}px`;
            pickItemDiv.style.top = `${top}px`;
        } else {
            pickItemDiv.style.left = '500px';
            pickItemDiv.style.top = '500px';
        }

        const dropdownList = document.createElement('table');
        dropdownList.classList.add('PickItemTable');

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Stock No.</th>
                <th>Bar Code</th>
                <th>Item Description</th>
                <th>Unit Price</th>
            </tr>
        `;
        const tfoot = document.createElement('tfoot');
        tfoot.innerHTML = `
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        `;

        const tbody = document.createElement('tbody');
        tbody.id = 'pickItemList';
        dropdownList.appendChild(thead);
        dropdownList.appendChild(tbody);
        dropdownList.appendChild(tfoot);

        const titleBar = document.createElement('div');
        titleBar.id = 'titleBar';
        titleBar.style.display = 'flex';
        titleBar.style.width = '100%';
        titleBar.style.position = "sticky";
        titleBar.style.top = "0px";
        titleBar.style.justifyContent = "space-between";
        titleBar.style.alignItems = "center";
        titleBar.style.padding = "10px";
        titleBar.style.zIndex = "1";
        titleBar.style.borderBottom = "1px solid #ccc";
        
        // Create title text
        const titleText = document.createElement('p');
        titleText.textContent = "Click to select item from list";
        titleText.style.margin = "0";
        titleText.style.flex = "1";  
        titleText.style.whiteSpace = "nowrap";  
        titleText.style.overflow = "hidden";
        titleText.style.textOverflow = "ellipsis";
    
        // Create close button
        const closeBtn = document.createElement('span');
        closeBtn.className = 'closeForm';
        closeBtn.innerHTML = '<i class="fa fa-close"></i>';
        closeBtn.style.cursor = "pointer";
        closeBtn.style.flex = "0";  
        closeBtn.style.marginLeft = "10px";
        closeBtn.style.display = 'flex';
        closeBtn.style.alignItems = 'center';
        closeBtn.style.justifyContent = 'center';
        closeBtn.style.height = '100%'; 
        closeBtn.classList.add('wiggle-on-hover');
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.backgroundColor = 'red';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.backgroundColor = ''; // or restore original color
        });
        closeBtn.addEventListener('click', () => {
            pickItemDiv.style.display = 'none';
        });
            
        // Append both to titleBar
        titleBar.appendChild(titleText);
        titleBar.appendChild(closeBtn);
        pickItemDiv.appendChild(titleBar);

        const bottomBar = document.createElement('div');
        bottomBar.style.display = 'flex';
        bottomBar.style.width = '100%';
        bottomBar.style.alignItems = "center";
        bottomBar.style.padding = "2px 10px";
        bottomBar.style.justifyContent = "flex-end";
        bottomBar.classList.add('bottomBar');

        
        // Append the dropdown list to the pick list div
        pickItemDiv.appendChild(dropdownList);
        pickItemDiv.appendChild(bottomBar);
        document.body.appendChild(pickItemDiv);  // Add it to the body

        pickItemDiv.style.animation = "popInCenter 0.5s ease-out forwards";

        // Show the pickItemDiv and dropdownList
        pickItemDiv.style.display = 'flex';  // Show the pickItemDiv
        dropdownList.style.display = 'block';  // Show the dropdown

        tbody.innerHTML = ''; // Clear previous items

        // Loop through dataItemList and create <tr> elements for the table
        dataItemList.forEach(item => {
            // Create the row HTML using template literals
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="colNoWrap">${item.UsersCde || 'N/A'}</td>
                <td class="colNoWrap">${item.OtherCde || 'N/A'}</td>
                <td class="colNoWrap">${item.Descript.substring(0, 30) || 'N/A'}</td>
                <td style="text-align: right">${formatter.format(item.ItemPrce) || 'N/A'}</td>
            `;

            // Add click event to each row for selection
            tr.addEventListener('click', () => {
                // Fill the input with the selected item’s information
                inputElement.value = item.UsersCde;  // or any value you want to fill

                // Close the dropdown and pick list after selection
                tbody.style.display = 'none';
                pickItemDiv.style.display = 'none';

                // Resolve the promise with the selected item
                resolve(item); // Return the selected item when clicked
            });

            // Append the row to the tbody
            tbody.appendChild(tr);
        });


        // Variables to track the highlighted index and the highlighted item
        let highlightedIndex = 0    //-1 no highlight at start;
        let highlightedItem = null;  // Store the item being highlighted
        const rows = tbody.querySelectorAll('tr');
        highlightRow(highlightedIndex);

        // Function to highlight a row
        function highlightRow(index) {
            bottomBar.textContent = `Record: ${index+1} Rows: ${dataItemList.length}`;

            // Remove the highlight from all rows
            rows.forEach(row => row.classList.remove('highlight'));
        
            // Only highlight if the index is valid
            if (index >= 0 && index <= rows.length) {
                rows[index].classList.add('highlight');
                highlightedItem = dataItemList[index];  // Update the highlighted item
        
                // Get the row and its position
                const row = rows[index];
                const rowTop = row.offsetTop - 40;
                const rowBottom = rowTop + row.offsetHeight +40;
                const listTop = tbody.scrollTop;
                const listBottom = listTop + tbody.offsetHeight;

                // Scroll the picklist to make the highlighted row fully visible
                if (rowTop < listTop) {
                    // If the row is above the visible area, scroll up
                    tbody.scrollTop = rowTop  ; // Scroll to the top of the row
                } else if (rowBottom > listBottom) {
                    // If the row is below the visible area, scroll down
                    tbody.scrollTop = rowBottom - tbody.offsetHeight; // Scroll to the bottom of the row
                }                
            }
        }
        
        // Set focus on pickItemDiv or dropdownList to capture keydown events
        dropdownList.tabIndex = 0;  // Make sure the table is focusable
        dropdownList.focus();  // Focus on the table to start receiving keydown events

        // Attach the keydown event listener to the pickItemDiv (table dropdown)
        dropdownList.addEventListener('keydown', (e) => {
            // console.log('keydown event triggered', e.key); 
            // e.preventDefault()
            const rows = tbody.querySelectorAll('tr');
            if (e.key === 'ArrowDown') {

                // Move down in the list
                if (highlightedIndex < rows.length - 1) {
                    highlightedIndex++;
                }
                highlightRow(highlightedIndex);
            } else if (e.key === 'ArrowUp') {
                // Move up in the list
                if (highlightedIndex > 0) {
                    highlightedIndex--;
                }
                highlightRow(highlightedIndex);
            } else if (e.key === 'Enter') {
                // Select the highlighted item
                if (highlightedItem) {
                    inputElement.value = highlightedItem.UsersCde;

                    // Close the dropdown and pick list after selection
                    tbody.style.display = 'none';
                    pickItemDiv.style.display = 'none';

                    // Resolve the promise with the highlighted item (the single item)
                    resolve(highlightedItem); // Only return the highlighted item when Enter is pressed
                }
            }
        });

        makeDraggable(pickItemDiv, titleBar, 'pickItemDiv');
        
        // Re-focus dropdownList after drag ends
        document.addEventListener('mouseup', () => {
            dropdownList.focus();  // Re-focus after dragging
        })

        // Close the dropdown if the user clicks outside of the input, dropdown, or pickItemDiv
        document.addEventListener('click', (e) => {
            if (!pickItemDiv.contains(e.target)) {
                tbody.style.display = 'none';  // Hide dropdown if clicked outside
                pickItemDiv.style.display = 'none';  // Hide pickItemDiv if clicked outside
            }
        });
    });
}



export function makeDraggable(container, handle, storageKey = null) {
    let offsetX = 0, offsetY = 0;
    let isDragging = false;

    handle.style.cursor = 'move';

    handle.addEventListener('mousedown', e => {
        isDragging = true;
        offsetX = e.clientX - container.offsetLeft;
        offsetY = e.clientY - container.offsetTop;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        const newLeft = Math.max(0, e.clientX - offsetX);
        const newTop = Math.max(0, e.clientY - offsetY);
        container.style.left = `${newLeft}px`;
        container.style.top = `${newTop}px`;
        container.style.position = 'absolute';

        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify({ left: newLeft, top: newTop }));
        }
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    // Restore previous position
    if (storageKey) {
        const savedPos = localStorage.getItem(storageKey);
        if (savedPos) {
            const { left, top } = JSON.parse(savedPos);
            container.style.left = `${left}px`;
            container.style.top = `${top}px`;
        }
    }
}


// Function to disable an <li> based on its data-ref attribute
export function disableLiByRef(refValue) {
    // Find all <li> elements
    const liElements = document.querySelectorAll('li');

    // Loop through each <li> and check its data-ref attribute
    liElements.forEach(li => {
        if (li.getAttribute('menu-ref') === refValue) {
            // Add the 'disabled' class to the matching <li> element
            li.classList.add('disabled');
        }
    });
}

// Example: Disable the <li> with data-ref="101"
// disableLiByRef('101');



// Example: Disable <li> elements with menu-ref "101" and "102"
// disableMultipleLis(['101', '102']);
export function disableMultipleLis(refValues) {
    const liElements = document.querySelectorAll('li');
    liElements.forEach(li => {
        if (refValues.includes(li.getAttribute('menu-ref'))) {
            li.classList.add('disabled');
        }
    });
}

// Example: Disable <li> elements with no 'menu-ref' attribute and no 'class'
export function disableNoMenuRefLis() {
    const liElements = document.querySelectorAll('li');
    liElements.forEach(li => {
        if (!li.getAttribute('menu-ref') && !li.getAttribute('class')) {
            li.classList.add('disabled');
        }
    });
}

export function greetTime(timeNow) {
    let greeting = '';
    const hour = parseInt(timeNow, 10); // Convert the input to an integer

    if (hour >= 0 && hour <= 11) {
        greeting = 'Good morning';
    } else if (hour >= 12 && hour <= 18) {
        greeting = 'Good afternoon';
    } else {
        greeting = 'Good evening';
    }            

    return greeting;
}

export function startTimer() {
    let elapsedTime = 0; 
    const timerInterval = setInterval(() => {
        elapsedTime++;
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        document.getElementById('runningTime').textContent = 
            `Elapsed Time: ${minutes}m ${seconds}s`;
    }, 1000);

    return { timerInterval, elapsedTime };
}

export function encrypt(cString, cPWrd) {
    // Check if password is valid (not longer than 3 characters or empty)
    if (cPWrd.length > 3 || !cPWrd) return '';

    let cnCript = '';
    cString = cString.trim();  // Remove extra spaces

    const nLenStr = cString.length;
    
    // Loop through each character of the string
    for (let ctr = 0; ctr < nLenStr; ctr++) {
        // Get the ASCII value of the character, add 7, and convert back to a character
        cnCript += String.fromCharCode(cString.charCodeAt(ctr) + 7);
        // cnCript=cnCript+Chr(Asc(SubStr(cString,ctr,1))+7)
    }

    // Return password + encrypted string
    return cPWrd + cnCript;
}

export function decrypt(cnCript, cPWrd) {
    // Check if the password is correct (first 3 characters of cnCript should match cPWrd)
    if (cPWrd !== cnCript.substring(0, 3)) {
        // console.log(String.fromCharCode(7));  // Debugging or logging equivalent to VFP's ?? Chr(7)
        return cnCript;  // If password does not match, return the input string
    }

    cnCript = cnCript.trim();  // Remove extra spaces
    let cString = '';
    const nLencnCript = cnCript.length - cPWrd.length;  // Length of the encrypted part

    // Loop through each character in the encrypted string and subtract 7 from the ASCII value
    for (let ctr = 0; ctr < nLencnCript; ctr++) {
        cString += String.fromCharCode(cnCript.charCodeAt(cPWrd.length + ctr) - 7);
    }

    return cString;
}

// * ----------------------
// FUNCTION decrypt(cnCript,cPWrd)
// * ----------------------
// LOCAL ctr,nLencnCript
// LOCAL cString

// 	IF cPWrd != SubStr(cnCript,1,3)
// 		?? Chr(7)
// 		RETURN cnCript
// 	ENDIF

// 	cnCript=AllTrim(cnCript)
// 	cString=""
// 	nLencnCript=Len(SubStr(cnCript,Len(cPWrd)+1))
// 	FOR ctr=1 TO nLencnCript
// 		cString=cString+Chr(Asc(SubStr(cnCript,ctr+3,1))-7)
// 	NEXT

// RETURN cString
