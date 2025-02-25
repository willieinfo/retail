
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

export function formatDate(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month and pad with 0
    const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with 0
    const year = date.getFullYear();
    return `${month}/${day}/${year}`; // Return in MM/DD/YYYY format
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

export function MessageBox(message, buttons, alertMessage='Alert Message', backColor='lightgrey') {
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
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        overlay.style.zIndex = '1000';

        // Create modal
        const modal = document.createElement('div');
        modal.style.position = 'absolute';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.maxWidth = '600px';
        modal.style.transform = 'translate(-50%, -50%)';
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
        titleBar.style.backgroundColor = "darkblue" ;
        titleBar.style.color = "white" ;
        titleBar.style.margin="0" ;
        titleBar.style.padding="0" ;
        titleBar.style.borderTopLeftRadius = '5px';
        titleBar.style.borderTopRightRadius = '5px';
        modal.appendChild(titleBar);

        const titleMsg = document.createElement('label');
        titleMsg.innerText=alertMessage;
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
            button.style.backgroundColor = "darkblue" ;
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

export async function populateLocation(cLocation, cLocaName) {
    const locationSelect = document.getElementById('Location');
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
            const option = document.createElement('option');
            option.value = data.Location;
            option.textContent = data.LocaName;
            locationSelect.appendChild(option);
            });

    } catch (error) {
        console.error('Fetch Location error:', error);
    }
}

export async function validateField(fieldId, url, alertMessage) {
    const field = document.getElementById(fieldId);
    field.addEventListener('blur', async function () {
        const fieldValue = field.value;
        const params = new URLSearchParams();
        if (fieldValue) params.append(fieldId, fieldValue);

        // Send request with query parameters
        try {
            const response = await fetch(`${url}?${params.toString()}`);
            const data = await response.json();

            // Check if the result has any data (which means the code exists)
            if (data.length > 0) {
                alert(alertMessage);
            }
        } catch (error) {
            console.error('Error during fetch:', error);
        }
    });
}

