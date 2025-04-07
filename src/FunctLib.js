
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

export async function populateBrandNum(cBrandNum, cBrandNme) {
    const brandSelect = document.getElementById('BrandNum');
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

export async function populateCategNum(cCategNum, cCategNme) {
    const categnumSelect = document.getElementById('CategNum');
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


export async function populateItemDept(cItemDept, cDescript) {
    const itemdeptSelect = document.getElementById('ItemDept');
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

export async function populateItemType(cItemType, cDescript) {
    const itemtypeSelect = document.getElementById('ItemType');
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

export async function populateLocation(cLocation, cLocaName, cSellArea='', cLocat_Id='Location') {
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

export async function populateSuppNum_(cSuppNum_, cSuppName) {
    const suppnum_Select = document.getElementById('SuppNum_');
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
export async function validateField(fieldId, url, alertMessage, editmode=false) {
    const fieldValue = document.getElementById(fieldId).value;
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

// export function pickItem(dataItemList, inputElement) {
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



export function pickItem(dataItemList, inputElement) {
    return new Promise((resolve) => {
        if (!inputElement) return;

        // Disable autocomplete to prevent suggestions
        inputElement.setAttribute('autocomplete', 'off');

        // Create the pickListDiv and dropdownList dynamically
        const pickListDiv = document.createElement('div');
        pickListDiv.id = 'pickListDiv';
        const dropdownList = document.createElement('ul');
        dropdownList.id = 'dropdownList';
        const pickListTitle = document.createElement('span');
        pickListTitle.innerText = "Click to select item from list";
        pickListDiv.appendChild(pickListTitle);

        // Append the dropdown list to the pick list div
        pickListDiv.appendChild(dropdownList);
        document.body.appendChild(pickListDiv);  // Add it to the body

        // Show the pickListDiv and dropdownList
        pickListDiv.style.display = 'flex';  // Show the pickListDiv
        dropdownList.style.display = 'block';  // Show the dropdown

        dropdownList.innerHTML = ''; // Clear previous items

        // Loop through dataItemList and create <li> elements
        dataItemList.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.UsersCde} - ${item.Descript.substring(0, 24)} - P ${formatter.format(item.ItemPrce)}`;

            // Add click event to each <li> for selection
            li.addEventListener('click', () => {
                // Fill the input with the selected item’s information
                inputElement.value = item.UsersCde;  // or any value you want to fill

                // Close the dropdown and pick list after selection
                dropdownList.style.display = 'none';
                pickListDiv.style.display = 'none';

                // Resolve the promise with the selected item
                resolve(item); // Return the selected item when clicked
            });

            // Append the <li> item to the dropdown list
            dropdownList.appendChild(li);
        });

        // Variables to track the highlighted index and the highlighted item
        let highlightedIndex = -1;
        let highlightedItem = null;  // Store the item being highlighted
        const items = dropdownList.querySelectorAll('li');

        // Function to highlight an item
        function highlightItem(index) {
            // Remove highlight from all items
            items.forEach(item => item.classList.remove('highlight'));

            // Only highlight if the index is valid
            if (index >= 0 && index < items.length) {
                items[index].classList.add('highlight');  // Add highlight to the current item
                highlightedItem = dataItemList[index];  // Update highlighted item

                // Auto-scroll if the highlighted item is out of view
                const item = items[index];
                const itemTop = item.offsetTop;
                const itemBottom = itemTop + item.offsetHeight;
                const listTop = dropdownList.scrollTop;
                const listBottom = listTop + dropdownList.offsetHeight;

                // Scroll the picklist to make the highlighted item fully visible
                if (itemTop < listTop) {
                    // If the item is above the visible area, scroll up
                    dropdownList.scrollTop = itemTop;
                } else if (itemBottom > listBottom) {
                    // If the item is below the visible area, scroll down
                    dropdownList.scrollTop = itemBottom - dropdownList.offsetHeight;
                }
            }
        }

        // Handle keydown events for ArrowDown, ArrowUp, and Enter
        inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                // Move down in the list
                if (highlightedIndex < items.length - 1) {
                    highlightedIndex++;
                }
                highlightItem(highlightedIndex);
            } else if (e.key === 'ArrowUp') {
                // Move up in the list
                if (highlightedIndex > 0) {
                    highlightedIndex--;
                }
                highlightItem(highlightedIndex);
            } else if (e.key === 'Enter') {
                // Select the highlighted item
                if (highlightedItem) {
                    inputElement.value = highlightedItem.UsersCde;

                    // Close the dropdown and pick list after selection
                    dropdownList.style.display = 'none';
                    pickListDiv.style.display = 'none';

                    // Resolve the promise with the highlighted item (the single item)
                    resolve(highlightedItem); // Only return the highlighted item when Enter is pressed
                }
            }
        });

        // Close the dropdown if the user clicks outside of the input, dropdown, or pickListDiv
        document.addEventListener('click', (e) => {
            if (!pickListDiv.contains(e.target)) {
                dropdownList.style.display = 'none';  // Hide dropdown if clicked outside
                pickListDiv.style.display = 'none';  // Hide pickListDiv if clicked outside
            }
        });
    });
}


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
