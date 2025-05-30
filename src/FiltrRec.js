
export async function FiltrRec(cModules_) {
    const { populateBrandNum, populateItemDept, populateItemType, populateStoreGrp,
            populateCategNum, populateLocation, checkEmptyValue, makeDraggable } = await import('./FunctLib.js');

    return new Promise(async (resolve) => {
        // Create the form element
        const filterForm = document.createElement('form');
        filterForm.id = "filter-form";
        filterForm.style.display = "none";  // Start with it hidden

        filterForm.innerHTML = `
            <div id="titleBar">Filter Form</div>
            <div id="inputSection">
                <br>
                <div id="inputDates" class="subTextDiv" style="flex-direction: row;">
                    <div id='txtFiltrRec_DateFrom'>
                        <label for="FiltrRec_DateFrom">From:</label>
                        <input type="date" id="FiltrRec_DateFrom">
                    </div>
                    <div id='txtFiltrRec_Date__To'>
                        <label for="FiltrRec_Date__To">To:</label>
                        <input type="date" id="FiltrRec_Date__To">
                    </div>
                    <div id='txtFiltrRec_DateAsOf' style="display:none">
                        <label for="FiltrRec_DateAsOf">As Of:</label>
                        <input type="date" id="FiltrRec_DateAsOf">
                    </div>
                    <div id="txtReferDoc">
                        <label for="FiltrRec_ReferDoc">Ref. No.:</label>
                        <input type="text" id="FiltrRec_ReferDoc" spellcheck="false">
                    </div>
                </div>
                <div id="inputLocation" class="textDiv">
                    <div class="subTextDiv">
                        <label for="FiltrRec_Location">Location</label>
                        <select id="FiltrRec_Location"></select>
                    </div>
                    <div class="subTextDiv">
                        <label for="FiltrRec_StoreGrp">Location Group</label>
                        <select id="FiltrRec_StoreGrp"></select>
                    </div>
                </div>

                <div id="inputDetails" class="subTextDiv">
                    <div class="textDiv">
                        <div class="subTextDiv">
                            <label for="FiltrRec_UsersCde">Stock No</label>
                            <input type="text" id="FiltrRec_UsersCde" name="UsersCde" spellcheck="false">
                        </div>
                        <div class="subTextDiv">
                            <label for="FiltrRec_OtherCde">Bar Code</label>
                            <input type="text" id="FiltrRec_OtherCde" name="OtherCde" spellcheck="false">
                        </div>
                    </div>

                    <div id="inputDescript" class="textDiv">
                        <div class="subTextDiv" style="width:100%;">
                            <label for="FiltrRec_Descript">Item Description</label>
                            <input type="text" id="FiltrRec_Descript" name="Descript" spellcheck="false">
                        </div>
                    </div>
                    <div id="inputList1" class="textDiv">
                        <div class="subTextDiv">
                            <label for="FiltrRec_BrandNum">Brand</label>
                            <select id="FiltrRec_BrandNum"></select>
                        </div>
                        <div class="subTextDiv">
                            <label for="FiltrRec_CategNum">Category</label>
                            <select id="FiltrRec_CategNum"></select>
                        </div>
                    </div>
                    <div id="inputList2" class="textDiv">
                        <div class="subTextDiv">
                            <label for="FiltrRec_ItemDept">Department</label>
                            <select id="FiltrRec_ItemDept"></select>
                        </div>
                        <div class="subTextDiv">
                            <label for="FiltrRec_ItemType">Class</label>
                            <select id="FiltrRec_ItemType"></select>
                        </div>
                    </div>
                </div>
                <div id="inputUserName" class="textDiv">
                    <div class="subTextDiv" style="width:100%;">
                        <label for="FiltrRec_UserName">Name or Email or Mobile</label>
                        <input type="text" id="FiltrRec_UserName" name="UserName" spellcheck="false">
                    </div>
                    <br>
                </div>
                
                <div class="btnDiv">
                    <button type="submit" id="saveFilterBtn" class="saveBtn"><i class="fa fa-list"></i>  List</button>
                    <button type="button" id="cancelFilterBtn" class="cancelBtn"><i class="fa fa-close"></i>  Close</button>
                </div>
            </div>
        `;

        // Create the overlay background for the modal
        const overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black background
        overlay.style.zIndex = 999; 

        // Form styling to center it
        filterForm.style.position = 'absolute';
        filterForm.style.top = '50%';
        filterForm.style.left = '50%';
        filterForm.style.transform = 'translate(-50%, -50%)'; // Center the form
        filterForm.style.backgroundColor = 'whitesmoke';
        filterForm.style.padding = '10px';
        filterForm.style.borderRadius = '8px';
        filterForm.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        filterForm.style.zIndex = 1000; // Ensure the form is above the overlay
        filterForm.style.display = 'flex';
        filterForm.style.flexDirection = 'column';
        filterForm.style.width = '80%';
        filterForm.style.maxWidth = '800px';

        // document.getElementById('inputUserName').style.display = 'none';

        // Append the form to the container based on the module type
        if (cModules_ === 'ListItem') {
            document.getElementById('ProductFile').appendChild(filterForm);
            document.getElementById('ProductFile').appendChild(overlay);
            document.getElementById('inputDates').style.display = 'none';
            document.getElementById('inputLocation').style.display = 'none';
            document.getElementById('inputUserName').style.display = 'none';
        } else if (cModules_ === 'ListLoca') {
            document.getElementById('LocationFile').appendChild(filterForm);
            document.getElementById('LocationFile').appendChild(overlay);
            document.getElementById('inputDates').style.display = 'none';
            document.getElementById('inputDetails').style.display = 'none';
            document.getElementById('inputUserName').style.display = 'none';
            await populateLocation('', '', '','FiltrRec_Location');
            await populateStoreGrp('','FiltrRec');
        } else if (cModules_ === 'SalesLst') {
            document.getElementById('SalesLst').appendChild(filterForm);
            document.getElementById('SalesLst').appendChild(overlay);
            document.getElementById('inputDetails').style.display = 'none';
            document.getElementById('inputUserName').style.display = 'none';
            await populateLocation('', '', 'SellArea','FiltrRec_Location');
            await populateStoreGrp('','FiltrRec');
        } else if (cModules_ === 'SaleRnk1') {
            document.getElementById('SalesRankStore').appendChild(filterForm);
            document.getElementById('SalesRankStore').appendChild(overlay);
            document.getElementById('inputDescript').style.display = 'none';
            document.getElementById('txtReferDoc').style.display = 'none';
            document.getElementById('inputUserName').style.display = 'none';
            await populateLocation('', '', 'SellArea','FiltrRec_Location');
            await populateStoreGrp('','FiltrRec');
        } else if (cModules_ === 'SaleRnk2') {
            document.getElementById('SalesRankBrand').appendChild(filterForm);
            document.getElementById('SalesRankBrand').appendChild(overlay);
            document.getElementById('inputDescript').style.display = 'none';
            document.getElementById('txtReferDoc').style.display = 'none';
            document.getElementById('inputUserName').style.display = 'none';
            await populateLocation('', '', 'SellArea','FiltrRec_Location');
            await populateStoreGrp('','FiltrRec');
        } else if (cModules_ === 'SaleRnk3') {
            document.getElementById('SalesRankStock').appendChild(filterForm);
            document.getElementById('SalesRankStock').appendChild(overlay);
            document.getElementById('inputDescript').style.display = 'none';
            document.getElementById('txtReferDoc').style.display = 'none';
            document.getElementById('inputUserName').style.display = 'none';
            await populateLocation('', '', 'SellArea','FiltrRec_Location');
            await populateStoreGrp('','FiltrRec');
        } else if (cModules_ === 'StockLst') {
            document.getElementById('StockLst').appendChild(filterForm);
            document.getElementById('StockLst').appendChild(overlay);
            document.getElementById('inputDetails').style.display = 'none';
            document.getElementById('inputUserName').style.display = 'none';
            await populateLocation('', '', 'StocArea','FiltrRec_Location');
        } else if (cModules_ === 'PurchLst') {
            document.getElementById('PurchLst').appendChild(filterForm);
            document.getElementById('PurchLst').appendChild(overlay);
            document.getElementById('inputDetails').style.display = 'none';
            document.getElementById('inputUserName').style.display = 'none';
            await populateLocation('', '', 'PurcArea','FiltrRec_Location');
        } else if (cModules_ === 'StocEnd1') {
            document.getElementById('StockEndLocation').appendChild(filterForm);
            document.getElementById('StockEndLocation').appendChild(overlay);
            document.getElementById('txtFiltrRec_DateFrom').style.display = 'none';
            document.getElementById('txtFiltrRec_Date__To').style.display = 'none';
            document.getElementById('txtReferDoc').style.display = 'none';
            document.getElementById('inputUserName').style.display = 'none';
            document.getElementById('txtFiltrRec_DateAsOf').style.display = 'block';
            await populateLocation('', '', '','FiltrRec_Location');
            await populateStoreGrp('','FiltrRec');
        } else if (cModules_ === 'StocEnd2') {
            document.getElementById('StockEndBrand').appendChild(filterForm);
            document.getElementById('StockEndBrand').appendChild(overlay);
            document.getElementById('txtFiltrRec_DateFrom').style.display = 'none';
            document.getElementById('txtFiltrRec_Date__To').style.display = 'none';
            document.getElementById('txtReferDoc').style.display = 'none';
            document.getElementById('inputUserName').style.display = 'none';
            document.getElementById('txtFiltrRec_DateAsOf').style.display = 'block';
            await populateLocation('', '', '','FiltrRec_Location');
            await populateStoreGrp('','FiltrRec');
        } else if (cModules_ === 'ListUser') {
            document.getElementById('AppUsersFile').appendChild(filterForm);
            document.getElementById('AppUsersFile').appendChild(overlay);
            document.getElementById('inputDates').style.display = 'none';
            document.getElementById('inputLocation').style.display = 'none';
            document.getElementById('inputDetails').style.display = 'none';
            document.getElementById('inputDescript').style.display = 'none';
            document.getElementById('inputList1').style.display = 'none';
            document.getElementById('inputList2').style.display = 'none';
        }

        // Show the form by changing its display style
        filterForm.style.display = 'flex';
        makeDraggable(filterForm,titleBar)

        let filterData = JSON.parse(localStorage.getItem("filterData"));
        if (!filterData || filterData.length === 0) {
            const currentDate = new Date();
            const dDateFrom = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); 
            const dDate__To = currentDate; 
            const dDateAsOf = currentDate; 

            const formattedDateFrom = dDateFrom.toISOString().split('T')[0];
            const formattedDateTo = dDate__To.toISOString().split('T')[0];
            const formattedDateAsOf = dDateAsOf.toISOString().split('T')[0];

            localStorage.setItem("filterData", JSON.stringify([formattedDateFrom, formattedDateTo, formattedDateAsOf]));

            filterData = [formattedDateFrom, formattedDateTo, formattedDateAsOf];
        }

        document.getElementById('FiltrRec_DateFrom').value = filterData[0];
        document.getElementById('FiltrRec_Date__To').value = filterData[1];
        document.getElementById('FiltrRec_DateAsOf').value = filterData[11];
        

        // Wait for populate functions to finish
        await populateBrandNum('', '', 'FiltrRec');
        await populateCategNum('', '', 'FiltrRec');
        await populateItemDept('', '', 'FiltrRec');
        await populateItemType('', '', 'FiltrRec');

        const locationSelect = document.getElementById('FiltrRec_Location');
        const locationValue = filterData[2].trim(); // The value that should be selected
        // Check if the select element has options, then set the selected option
        const options = locationSelect.options;
        for (let i = 0; i < options.length; i++) {
            if (options[i].value.trim() == locationValue) {
                options[i].selected = true;
                locationSelect.selectedIndex = i; // Set selectedIndex
                break; // Exit loop once the option is selected
            }
        }

        // Cancel button logic
        document.getElementById('cancelFilterBtn').addEventListener('click', () => {
            document.getElementById('filter-form').remove(); 
            document.getElementById('modal-overlay').remove();
        });

        // Save button logic
        document.getElementById('saveFilterBtn').addEventListener('click', (e) => {
            e.preventDefault();

            // Check for empty values for filter to prevent voluminous data
            if (cModules_==='ListItem') {
                const BrandNum = document.getElementById('FiltrRec_BrandNum')
                if (!checkEmptyValue(BrandNum)) {
                    return;  
                }
            }
    
            const dDateFrom = document.getElementById('FiltrRec_DateFrom').value;
            const dDate__To = document.getElementById('FiltrRec_Date__To').value;
            const cLocation = document.getElementById('FiltrRec_Location').value.trim();
            const cReferDoc = document.getElementById('FiltrRec_ReferDoc').value.trim();

            const cUsersCde = document.getElementById('FiltrRec_UsersCde').value.trim();
            const cOtherCde = document.getElementById('FiltrRec_OtherCde').value.trim();
            const cDescript = document.getElementById('FiltrRec_Descript').value.trim();
            const cBrandNum = document.getElementById('FiltrRec_BrandNum').value;
            const cCategNum = document.getElementById('FiltrRec_CategNum').value;
            const cItemType = document.getElementById('FiltrRec_ItemType').value;
            const cItemDept = document.getElementById('FiltrRec_ItemDept').value;
            const dDateAsOf = document.getElementById('FiltrRec_DateAsOf').value;
            const cStoreGrp = document.getElementById('FiltrRec_StoreGrp').value;
            const cUserName = document.getElementById('FiltrRec_UserName').value;

            const filterData = [dDateFrom, dDate__To, cLocation, cUsersCde, cOtherCde, cDescript,
                 cBrandNum, cCategNum, cItemType, cItemDept, cReferDoc, dDateAsOf, cStoreGrp, cUserName];
            localStorage.setItem("filterData", JSON.stringify(filterData));

            document.getElementById('filter-form').remove(); 
            document.getElementById('modal-overlay').remove();  

            // Resolve the promise once everything is set up
            resolve();

        });
    });
}

export function displayErrorMsg(error,otherMsg = '') {
    const errorMessageDiv = document.getElementById("error-message");
    const errorText = document.getElementById("error-text");
    const retryBtn = document.getElementById("retry-btn");
    const ignoreBtn = document.getElementById("ignore-btn");
    const abortBtn = document.getElementById("abort-btn");
    const errorOtherMsg = document.getElementById("error-otherMsg");
    const titleBar = document.getElementById("title-bar");

    error = !error ? 'Error occured' : error

    // Customize error message based on error type
    if (error.status === 404) {
        errorText.textContent = "Resource not found. Would you like to retry?";
        retryBtn.style.display = 'inline-block';
        ignoreBtn.style.display = 'inline-block';
        abortBtn.style.display = 'inline-block';
        titleBar.innerHTML = "Error Message - 404"
    } else if (error.status === 500) {
        errorText.textContent = "Server error. Please try again later.";
        retryBtn.style.display = 'inline-block';
        ignoreBtn.style.display = 'none';
        abortBtn.style.display = 'inline-block';
        titleBar.innerHTML = "Error Message - 500"
    } else {
        errorText.textContent = "An unexpected error occurred. "+error;
        retryBtn.style.display = 'none';
        ignoreBtn.style.display = 'inline-block';
        abortBtn.style.display = 'inline-block';
        titleBar.innerHTML = "Error Message"
    }
    errorOtherMsg.textContent = otherMsg

    // Display the error message
    errorMessageDiv.style.display = 'block';
    makeDraggable(errorMessageDiv,titleBar)

    // Button actions
    retryBtn.onclick = function () {
        location.reload(); // Retry logic here
        errorMessageDiv.style.display = 'none';
    };
    ignoreBtn.onclick = function () {
        errorMessageDiv.style.display = 'none'; // Close message without doing anything
    };
    abortBtn.onclick = function () {
        window.location.href = '/'; // Abort by redirecting to home page (for example)
        errorMessageDiv.style.display = 'none';
    };
}