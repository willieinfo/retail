import { addSalesDtl } from './Sales/SalesLst.js';
import { addStockDtl } from './Transfers/StockLst.js';

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
}

export function MessageBox(message, buttons, alertMessage='Alert Message', backColor='lightgrey', placeTop=false) {
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
        titleBar.style.justifyContent = 'center'; 
        titleBar.style.alignItems = 'center'; 
        titleBar.style.width="auto" ;
        titleBar.style.height="30px" ;
        titleBar.style.color = "white" ;
        titleBar.style.backgroundColor = 'var(--main-bg-color)' ;
        titleBar.style.margin="0" ;
        titleBar.style.padding="0" ;
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
    }
}

export async function populateLocation(cLocation, cLocaName, cSellArea='', cLocat_Id='FiltrRec_Location') {
    const locationSelect = document.getElementById(cLocat_Id);
    locationSelect.innerHTML = '';

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

// export function pickList(dataItemList, inputElement) {
//     return new Promise((resolve) => {
//         if (!inputElement) return;

//         // Disable autocomplete to prevent suggestions
//         inputElement.setAttribute('autocomplete', 'off');

//         // Create the pickListDiv and dropdownList dynamically
//         const pickListDiv = document.createElement('div');
//         pickListDiv.id = 'pickListDiv';
//         const dropdownList = document.createElement('ul');
//         dropdownList.id = 'dropdownList';
//         const pickListTitle = document.createElement('span');
//         pickListTitle.innerText = "Click to select item from list";
//         pickListDiv.appendChild(pickListTitle);

//         // Append the dropdown list to the pick list div
//         pickListDiv.appendChild(dropdownList);
//         document.body.appendChild(pickListDiv);  // Add it to the body

//         // Show the pickListDiv and dropdownList
//         pickListDiv.style.display = 'flex';  // Show the pickListDiv
//         dropdownList.style.display = 'block';  // Show the dropdown

//         dropdownList.innerHTML = ''; // Clear previous items

//         // Loop through dataItemList and create <li> elements
//         dataItemList.forEach(item => {
//             const li = document.createElement('li');
//             li.textContent = `${item.UsersCde} - ${item.Descript.substring(0, 24)} - P ${formatter.format(item.ItemPrce)}`;

//             // Add click event to each <li> for selection
//             li.addEventListener('click', () => {
//                 // Fill the input with the selected item’s information
//                 inputElement.value = item.UsersCde;  // or any value you want to fill

//                 // Close the dropdown and pick list after selection
//                 dropdownList.style.display = 'none';
//                 pickListDiv.style.display = 'none';

//                 // Resolve the promise with the selected item
//                 resolve(item); // Return the selected item when clicked
//             });

//             // Append the <li> item to the dropdown list
//             dropdownList.appendChild(li);
//         });

//         // Variables to track the highlighted index and the highlighted item
//         let highlightedIndex = -1;
//         let highlightedItem = null;  // Store the item being highlighted
//         const items = dropdownList.querySelectorAll('li');

//         // Function to highlight an item
//         function highlightItem(index) {
//             // Remove highlight from all items
//             items.forEach(item => item.classList.remove('highlight'));

//             // Only highlight if the index is valid
//             if (index >= 0 && index < items.length) {
//                 items[index].classList.add('highlight');  // Add highlight to the current item
//                 highlightedItem = dataItemList[index];  // Update highlighted item

//                 // Auto-scroll if the highlighted item is out of view
//                 const item = items[index];
//                 const itemTop = item.offsetTop;
//                 const itemBottom = itemTop + item.offsetHeight;
//                 const listTop = dropdownList.scrollTop;
//                 const listBottom = listTop + dropdownList.offsetHeight;

//                 // Scroll the picklist to make the highlighted item fully visible
//                 if (itemTop < listTop) {
//                     // If the item is above the visible area, scroll up
//                     dropdownList.scrollTop = itemTop;
//                 } else if (itemBottom > listBottom) {
//                     // If the item is below the visible area, scroll down
//                     dropdownList.scrollTop = itemBottom - dropdownList.offsetHeight;
//                 }
//             }
//         }

//         // Handle keydown events for ArrowDown, ArrowUp, and Enter
//         inputElement.addEventListener('keydown', (e) => {
//             if (e.key === 'ArrowDown') {
//                 // Move down in the list
//                 if (highlightedIndex < items.length - 1) {
//                     highlightedIndex++;
//                 }
//                 highlightItem(highlightedIndex);
//             } else if (e.key === 'ArrowUp') {
//                 // Move up in the list
//                 if (highlightedIndex > 0) {
//                     highlightedIndex--;
//                 }
//                 highlightItem(highlightedIndex);
//             } else if (e.key === 'Enter') {
//                 // Select the highlighted item
//                 if (highlightedItem) {
//                     inputElement.value = highlightedItem.UsersCde;

//                     // Close the dropdown and pick list after selection
//                     dropdownList.style.display = 'none';
//                     pickListDiv.style.display = 'none';

//                     // Resolve the promise with the highlighted item (the single item)
//                     resolve(highlightedItem); // Only return the highlighted item when Enter is pressed
//                 }
//             }
//         });

//         // Close the dropdown if the user clicks outside of the input, dropdown, or pickListDiv
//         document.addEventListener('click', (e) => {
//             if (!pickListDiv.contains(e.target)) {
//                 dropdownList.style.display = 'none';  // Hide dropdown if clicked outside
//                 pickListDiv.style.display = 'none';  // Hide pickListDiv if clicked outside
//             }
//         });
//     });
// }


// imageLoader.js
window.base64Image = null;

export function loadImageToBase64() {
    const img = new Image();
    img.src = '/images/regent.png';  // Path to your logo image

    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);
        
        window.base64Image = canvas.toDataURL('image/png');
        console.log("Image loaded and converted to base64.");
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
        // Call to your backend to validate and get the list of items
        let dataItemList = await validateField(cModule,'UsersCde', 'http://localhost:3000/product/checkUsersCde', '', true);

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
                    if (cModule!=='StockRec') {
                       document.getElementById(cModule+'_ItemPrce').value = selectedItem.ItemPrce;
                    }
                    document.getElementById(cModule+'_Amount__').value = selectedItem.ItemPrce;
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
                    document.getElementById(cModule+'_ItemPrce').value = item.ItemPrce;
                    document.getElementById(cModule+'_Amount__').value = item.ItemPrce;
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
    }

}

export async function addScanCode(cModule, currentRec) {
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

        let cItemCode = '', nItemPrce = 0, nLandCost = 0, nItemCost = 0
        // Call to your backend to validate and get the list of items
        const dataItem = await validateField(cModule,'ScanCode', 'http://localhost:3000/product/checkUsersCde', '', true);
        
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
        const nQtyRecvd = 1
        const nDiscRate = 0
        const cTimeSale = get24HrTime()
        const dDate____ = new Date()

        // console.log(cCtrlNum_,cItemCode,dDate____,cTimeSale,nQuantity,nItemPrce,nDiscRate,nAmount__,nLandCost)

        if (cModule==='SalesRec') {
            addSalesDtl(cCtrlNum_,cItemCode,dDate____,cTimeSale,nQuantity,nItemPrce,nDiscRate,nAmount__,nLandCost)
        } else if (cModule==='StockRec') {
            addStockDtl(cCtrlNum_,cItemCode,nQuantity,nQtyRecvd,nAmount__,nLandCost)
        }
        ScanCode.value=''
        ScanCode.focus()

    } catch (error) {
        console.error("Error fetching or processing data:", error);
    }

}


export function pickItem(dataItemList, inputElement) {
    return new Promise((resolve) => {
        if (!inputElement) return;

        // Disable autocomplete to prevent suggestions
        inputElement.setAttribute('autocomplete', 'off');

        // Create the pickItemDiv and dropdownList dynamically
        const pickItemDiv = document.createElement('div');
        pickItemDiv.id = 'pickItemDiv';

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

        // Show the pickItemDiv and dropdownList
        pickItemDiv.style.display = 'flex';  // Show the pickItemDiv
        dropdownList.style.display = 'block';  // Show the dropdown

        tbody.innerHTML = ''; // Clear previous items
        // console.log("pickItemDiv height:", pickItemDiv.offsetHeight);
        // console.log(pickItemDiv.scrollHeight, pickItemDiv.clientHeight);


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

        // Close the dropdown if the user clicks outside of the input, dropdown, or pickItemDiv
        document.addEventListener('click', (e) => {
            if (!pickItemDiv.contains(e.target)) {
                tbody.style.display = 'none';  // Hide dropdown if clicked outside
                pickItemDiv.style.display = 'none';  // Hide pickItemDiv if clicked outside
            }
        });
    });
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


export function printFormPDF(headerData, detailData, itemFields, createTotals, colWidths, 
    columnHeader, fieldTypes ,imgLogo, paperSetup, cFileName) {
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
    });
    doc.setTextColor(0,0,0)


    // BOTTOM PAGE
    // Horizontal bottom line for last row on page
    doc.setLineDash([1, 2]); 
    doc.line(pageMargin, currentY, currentX, currentY); 

    doc.setFontSize(8);
    doc.setFont(reportFont, "bold");


    // Calculate TOTALS Section
    // Create dynamic totals based on createTotals array
    const totals = new Array(createTotals.length).fill(0);
    // Accumulate totals for relevant fields
    detailData.forEach(item => {
        createTotals.forEach((doTotal, i) => {
            if (!doTotal) return;

            const field = itemFields[i];
            let value = 0;

            if (typeof field === 'function') {
                // Pass unformatted value for calculation (assume function returns number)
                value = parseFloat(field(item, { format: v => v })); 
            } else {
                value = item[field];
                if (typeof value !== 'number') value = parseFloat(value) || 0;
            }

            totals[i] += value;
        });
    });


    // Where to place the 'Totals' label
    const descriptIndex = itemFields.findIndex(f =>
        (typeof f === 'string' && f.toLowerCase().includes('descript')) 
    );

    // Align and render totals
    let totalX = pageMargin;

    colWidths.forEach((width, i) => {
        if (createTotals[i]) {
            const value = totals[i];
            const textValue = (fieldTypes[i] === 'integer')
                ? value.toFixed(0)
                : formatter.format(value);

            doc.text(textValue, totalX + width - 2, currentY + itemLineHeight, { align: 'right' });
        }

        // Print 'Totals:' right-aligned in the Descript column
        if (i === descriptIndex) {
            doc.text('Totals:', totalX + width - 2, currentY + itemLineHeight, { align: 'right' });
        }

        totalX += width;
    });

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
    
    doc.output('dataurlnewwindow',cFileName);


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
    
        currentY += lineHeight;
        doc.text(headerData[3], pageMargin + 2, currentY); // Customer
        doc.text(headerData[4], centerPosi + padding, currentY); // Remarks
        // doc.line(dividerX, currentY - lineHeight, dividerX, currentY + lineHeight); // 4th vert line

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
        const addCol = (headerData[7]) ? 44 :40

        for (let i = 1; i < nNumOfLines; i++) {
            doc.setLineDash([1, 2]);
            // Draw vertical dashed line at xPos
            doc.line(xPos, startY+addCol, xPos, pageHeight - bottomLinePosi - pageMargin); 
            
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

export async function printReportExcel(jsonData, HeaderRow, DetailRow, createTotals, groupByField = 'Report') {
    if (!jsonData || !jsonData.length) {
        alert("No data to export.");
        return;
    }

    // Extract rows
    const rows = jsonData.map((row) =>
        DetailRow.map((field) => {
            try {
                // If field is a function, evaluate it; otherwise, treat as field name
                return typeof field === "function" ? field(row) : row[field];
            } catch {
                return '';
            }
        })
    );

    // const rows = jsonData.map((row) =>
    //     DetailRow.map((field) => {
    //         try {
    //             let value = typeof field === "function" ? field(row) : row[field];
    //             const isNumber = typeof value === 'number';
    //             const isInteger = isNumber && Number.isInteger(value);
    
    //             return isNumber
    //                 ? {
    //                     type: Number,
    //                     value,
    //                     format: isInteger ? '#,##0' : '#,##0.00',
    //                     align: 'right',
    //                     color: '000000' // Hex color, not RGB()
    //                 }
    //                 : {
    //                     type: String,
    //                     value: value ?? '',
    //                     align: 'left'
    //                 };
    //         } catch {
    //             return { type: String, value: '' };
    //         }
    //     })
    // );
                    
    // Calculate totals row
    let totalsRow = [];
    if (createTotals) {
        totalsRow = DetailRow.map((field, i) => {
            if (createTotals[i]) {
                let total = 0;
                for (const row of jsonData) {
                    try {
                        let value = typeof field === "function" ? field(row) : row[field];
                        total += parseFloat(value) || 0;
                    } catch {}
                }
                return total;
            }
            return '';
        });
    }

    // Build worksheet content
    const data = [
        HeaderRow.map(h => ({ value: h, bold: true })), // Header
        ...rows.map(row => row.map(cell => ({ value: cell }))) // Data rows
    ];

    if (totalsRow.length > 0) {
        data.push(totalsRow.map((cell, i) => ({
            value: cell,
            bold: true
            // color: createTotals[i] ? '#D9E1F2' : undefined
        })));
        // #D9E1F2
    }

    // Generate file name
    const date = new Date().toISOString().slice(0, 10);
    const filename = `${groupByField}_Report_${date}.xlsx`;

    
    // Write to Excel
    await writeXlsxFile(data, {
        fileName: filename
    });
}