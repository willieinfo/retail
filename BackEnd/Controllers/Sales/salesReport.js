const { queryDatabase } = require('../../DBConnect/dbConnect');

const SalesCompBrand = async (req, res) => {
  
  // Extract parameters from the request
  const cBrandNum = req.query.BrandNum;
  const cUsersCde = req.query.UsersCde;
  const cOtherCde = req.query.OtherCde;
  const cCategNum = req.query.CategNum;
  const cItemDept = req.query.ItemDept;
  const cItemType = req.query.ItemType;
  const cLocation = req.query.Location;
  const cStoreGrp = req.query.StoreGrp;
  const dDateFrom = req.query.DateFrom;  // Date range for current period
  const dDateTo__ = req.query.DateTo__;  // Date range for current period
  const dYearFrom = req.query.YearFrom;  // Year range for previous year comparison
  const dYearTo__ = req.query.YearTo__;  // Year range for previous year comparison
  const dMontFrom = req.query.MontFrom;  // Month range for previous month comparison
  const dMontTo__ = req.query.MontTo__;  // Month range for previous month comparison

  // Parameters object to pass to SQL query
  const params = {};
  let sqlQuery = '';

  // Add other filters to sqlQuery string
  if (cBrandNum) {
    sqlQuery += " AND ITEMLIST.BrandNum LIKE @cBrandNum";
    params.cBrandNum = `%${cBrandNum}%`;
  }
  if (cCategNum) {
    sqlQuery += " AND ITEMLIST.CategNum LIKE @cCategNum";
    params.cCategNum = `%${cCategNum}%`;
  }
  if (cUsersCde) {
    sqlQuery += " AND ITEMLIST.UsersCde LIKE @cUsersCde";
    params.cUsersCde = `%${cUsersCde}%`;
  }
  if (cOtherCde) {
    sqlQuery += " AND ITEMLIST.OtherCde LIKE @cOtherCde";
    params.cOtherCde = `%${cOtherCde}%`;
  }
  if (cItemDept) {
    sqlQuery += " AND ITEMLIST.ItemDept LIKE @cItemDept";
    params.cItemDept = `%${cItemDept}%`;
  }
  if (cItemType) {
    sqlQuery += " AND ITEMLIST.ItemType LIKE @cItemType";
    params.cItemType = `%${cItemType}%`;
  }
  if (cLocation) {
    sqlQuery += " AND SALESREC.Location LIKE @cLocation";
    params.cLocation = `%${cLocation}%`;
  }
  if (cStoreGrp) {
    sqlQuery += " AND LOCATION.StoreGrp LIKE @cStoreGrp";
    params.cStoreGrp = `%${cStoreGrp}%`;
  }

  // ** cSql1 - Current period date range (dDateFrom to dDateTo__) **
  let cSql1 = `
    SELECT 
      BRAND___.BrandNme,
      BRAND___.BrandNum,
      ITEMLIST.Outright,
      SUM(SALESDTL.Quantity) AS Quantity,
      SUM(SALESDTL.Quantity * SALESDTL.LandCost) AS LandCost,
      SUM(SALESDTL.Quantity * SALESDTL.ItemPrce) AS ItemPrce,
      SUM(SALESDTL.Quantity * SALESDTL.Amount__) AS Amount__
    FROM SALESDTL
    JOIN SALESREC ON SALESDTL.CtrlNum_ = SALESREC.CtrlNum_
    JOIN ITEMLIST ON SALESDTL.ItemCode = ITEMLIST.ItemCode
    JOIN BRAND___ ON ITEMLIST.BrandNum = BRAND___.BrandNum
    WHERE SALESREC.Disabled = 0
    AND SALESDTL.Date____ >= @dDateFrom 
    AND SALESDTL.Date____ <= @dDateTo__
    ${sqlQuery}
    GROUP BY BRAND___.BrandNme,BRAND___.BrandNum,ITEMLIST.Outright
  `;

  // Add current period date range parameters to params
  if (dDateFrom) {
    params.dDateFrom = dDateFrom; // Set current period's start date
  }
  if (dDateTo__) {
    params.dDateTo__ = dDateTo__; // Set current period's end date
  }

  // ** cSql2 - Previous year date range (dYearFrom to dYearTo__) **
  let cSql2 = `
    SELECT 
      BRAND___.BrandNum,
      SUM(SALESDTL.Quantity) AS PrvYrQty,
      SUM(SALESDTL.Quantity * SALESDTL.LandCost) AS PrvYrLan,
      SUM(SALESDTL.Quantity * SALESDTL.ItemPrce) AS PrvYrPrc,
      SUM(SALESDTL.Quantity * SALESDTL.Amount__) AS PrvYrAmt
    FROM SALESDTL
    JOIN SALESREC ON SALESDTL.CtrlNum_ = SALESREC.CtrlNum_
    JOIN ITEMLIST ON SALESDTL.ItemCode = ITEMLIST.ItemCode
    JOIN BRAND___ ON ITEMLIST.BrandNum = BRAND___.BrandNum
    WHERE SALESREC.Disabled = 0
    AND SALESDTL.Date____ >= @dYearFrom 
    AND SALESDTL.Date____ <= @dYearTo__
    ${sqlQuery}
    GROUP BY BRAND___.BrandNum
  `;

  // Add previous year date range parameters to params
  if (dYearFrom) {
    params.dYearFrom = dYearFrom; // Set previous year start date
  }
  if (dYearTo__) {
    params.dYearTo__ = dYearTo__; // Set previous year end date
  }

  // ** cSql3 - Previous month date range (dMontFrom to dMontTo__) **
  let cSql3 = `
    SELECT 
      BRAND___.BrandNum,
      SUM(SALESDTL.Quantity) AS PrvMoQty,
      SUM(SALESDTL.Quantity * SALESDTL.LandCost) AS PrvMoLan,
      SUM(SALESDTL.Quantity * SALESDTL.ItemPrce) AS PrvMoPrc,
      SUM(SALESDTL.Quantity * SALESDTL.Amount__) AS PrvMoAmt
    FROM SALESDTL
    JOIN SALESREC ON SALESDTL.CtrlNum_ = SALESREC.CtrlNum_
    JOIN ITEMLIST ON SALESDTL.ItemCode = ITEMLIST.ItemCode
    JOIN BRAND___ ON ITEMLIST.BrandNum = BRAND___.BrandNum
    WHERE SALESREC.Disabled = 0
    AND SALESDTL.Date____ >= @dMontFrom 
    AND SALESDTL.Date____ <= @dMontTo__
    ${sqlQuery}
    GROUP BY BRAND___.BrandNum
  `;

  // Add previous month date range parameters to params
  if (dMontFrom) {
    params.dMontFrom = dMontFrom; // Set previous month start date
  }
  if (dMontTo__) {
    params.dMontTo__ = dMontTo__; // Set previous month end date
  }

  // Final SQL combining all three queries
  let finalSql = `
    SELECT
      BRNDSALE.BrandNme,
      BRNDSALE.Outright,
      BRNDSALE.Quantity,
      BRNDSALE.LandCost,
      BRNDSALE.ItemPrce,
      BRNDSALE.Amount__,
      PREVYEAR.PrvYrQty,
      PREVYEAR.PrvYrLan,
      PREVYEAR.PrvYrPrc,
      PREVYEAR.PrvYrAmt,
      PREVMONT.PrvMoQty,
      PREVMONT.PrvMoLan,
      PREVMONT.PrvMoPrc,
      PREVMONT.PrvMoAmt
    FROM
      (${cSql1}) AS BRNDSALE
    LEFT JOIN
      (${cSql2}) AS PREVYEAR ON BRNDSALE.BrandNum = PREVYEAR.BrandNum
    LEFT JOIN
      (${cSql3}) AS PREVMONT ON BRNDSALE.BrandNum = PREVMONT.BrandNum
    ORDER BY
      BRNDSALE.Amount__ DESC;
  `;

  // Execute the final query
  // console.log(params)
  try {
    const result = await queryDatabase(finalSql, params);
    res.json(result);
  } catch (err) {
    console.error('Database query error:', err.message);
    res.status(500).send('Error fetching sales data');
  }
};



const SalesCompStore = async (req, res) => {
  
  // Extract parameters from the request
  const cBrandNum = req.query.BrandNum;
  const cUsersCde = req.query.UsersCde;
  const cOtherCde = req.query.OtherCde;
  const cCategNum = req.query.CategNum;
  const cItemDept = req.query.ItemDept;
  const cItemType = req.query.ItemType;
  const cLocation = req.query.Location;
  const cStoreGrp = req.query.StoreGrp;
  const dDateFrom = req.query.DateFrom;  // Date range for current period
  const dDateTo__ = req.query.DateTo__;  // Date range for current period
  const dYearFrom = req.query.YearFrom;  // Year range for previous year comparison
  const dYearTo__ = req.query.YearTo__;  // Year range for previous year comparison
  const dMontFrom = req.query.MontFrom;  // Month range for previous month comparison
  const dMontTo__ = req.query.MontTo__;  // Month range for previous month comparison

  // Parameters object to pass to SQL query
  const params = {};
  let sqlQuery = '';

  // Add other filters to sqlQuery string
  if (cBrandNum) {
    sqlQuery += " AND ITEMLIST.BrandNum LIKE @cBrandNum";
    params.cBrandNum = `%${cBrandNum}%`;
  }
  if (cCategNum) {
    sqlQuery += " AND ITEMLIST.CategNum LIKE @cCategNum";
    params.cCategNum = `%${cCategNum}%`;
  }
  if (cUsersCde) {
    sqlQuery += " AND ITEMLIST.UsersCde LIKE @cUsersCde";
    params.cUsersCde = `%${cUsersCde}%`;
  }
  if (cOtherCde) {
    sqlQuery += " AND ITEMLIST.OtherCde LIKE @cOtherCde";
    params.cOtherCde = `%${cOtherCde}%`;
  }
  if (cItemDept) {
    sqlQuery += " AND ITEMLIST.ItemDept LIKE @cItemDept";
    params.cItemDept = `%${cItemDept}%`;
  }
  if (cItemType) {
    sqlQuery += " AND ITEMLIST.ItemType LIKE @cItemType";
    params.cItemType = `%${cItemType}%`;
  }
  if (cLocation) {
    sqlQuery += " AND SALESREC.Location LIKE @cLocation";
    params.cLocation = `%${cLocation}%`;
  }
  if (cStoreGrp) {
    sqlQuery += " AND LOCATION.StoreGrp LIKE @cStoreGrp";
    params.cStoreGrp = `%${cStoreGrp}%`;
  }

  // ** cSql1 - Current period date range (dDateFrom to dDateTo__) **
  let cSql1 = `
    SELECT 
      LOCATION.StoreGrp,
      LOCATION.LocaName,
      COUNT(DISTINCT SALESREC.ReferDoc) AS TrxCount,
      SUM(SALESDTL.Quantity) AS Quantity,
      SUM(SALESDTL.Quantity * SALESDTL.LandCost) AS LandCost,
      SUM(SALESDTL.Quantity * SALESDTL.ItemPrce) AS ItemPrce,
      SUM(SALESDTL.Quantity * SALESDTL.Amount__) AS Amount__
    FROM SALESDTL
    JOIN SALESREC ON SALESDTL.CtrlNum_ = SALESREC.CtrlNum_
    JOIN LOCATION ON SALESREC.Location = LOCATION.Location
    WHERE SALESREC.Disabled = 0
    AND SALESDTL.Date____ >= @dDateFrom 
    AND SALESDTL.Date____ <= @dDateTo__
    ${sqlQuery}
    GROUP BY LOCATION.StoreGrp, LOCATION.LocaName
  `;

  // Add current period date range parameters to params
  if (dDateFrom) {
    params.dDateFrom = dDateFrom; // Set current period's start date
  }
  if (dDateTo__) {
    params.dDateTo__ = dDateTo__; // Set current period's end date
  }

  // ** cSql2 - Previous year date range (dYearFrom to dYearTo__) **
  let cSql2 = `
    SELECT 
      LOCATION.LocaName,
      SUM(SALESDTL.Quantity) AS PrvYrQty,
      SUM(SALESDTL.Quantity * SALESDTL.LandCost) AS PrvYrLan,
      SUM(SALESDTL.Quantity * SALESDTL.ItemPrce) AS PrvYrPrc,
      SUM(SALESDTL.Quantity * SALESDTL.Amount__) AS PrvYrAmt
    FROM SALESDTL
    JOIN SALESREC ON SALESDTL.CtrlNum_ = SALESREC.CtrlNum_
    JOIN LOCATION ON SALESREC.Location = LOCATION.Location
    WHERE SALESREC.Disabled = 0
    AND SALESDTL.Date____ >= @dYearFrom 
    AND SALESDTL.Date____ <= @dYearTo__
    ${sqlQuery}
    GROUP BY LOCATION.LocaName
  `;

  // Add previous year date range parameters to params
  if (dYearFrom) {
    params.dYearFrom = dYearFrom; // Set previous year start date
  }
  if (dYearTo__) {
    params.dYearTo__ = dYearTo__; // Set previous year end date
  }

  // ** cSql3 - Previous month date range (dMontFrom to dMontTo__) **
  let cSql3 = `
    SELECT 
      LOCATION.LocaName,
      SUM(SALESDTL.Quantity) AS PrvMoQty,
      SUM(SALESDTL.Quantity * SALESDTL.LandCost) AS PrvMoLan,
      SUM(SALESDTL.Quantity * SALESDTL.ItemPrce) AS PrvMoPrc,
      SUM(SALESDTL.Quantity * SALESDTL.Amount__) AS PrvMoAmt
    FROM SALESDTL
    JOIN SALESREC ON SALESDTL.CtrlNum_ = SALESREC.CtrlNum_
    JOIN LOCATION ON SALESREC.Location = LOCATION.Location
    WHERE SALESREC.Disabled = 0
    AND SALESDTL.Date____ >= @dMontFrom 
    AND SALESDTL.Date____ <= @dMontTo__
    ${sqlQuery}
    GROUP BY LOCATION.LocaName
  `;

  // Add previous month date range parameters to params
  if (dMontFrom) {
    params.dMontFrom = dMontFrom; // Set previous month start date
  }
  if (dMontTo__) {
    params.dMontTo__ = dMontTo__; // Set previous month end date
  }

  // Final SQL combining all three queries
  let finalSql = `
    SELECT
      TRXCOUNT.StoreGrp,
      TRXCOUNT.LocaName,
      TRXCOUNT.TrxCount,
      TRXCOUNT.Quantity,
      TRXCOUNT.LandCost,
      TRXCOUNT.ItemPrce,
      TRXCOUNT.Amount__,
      PREVYEAR.PrvYrQty,
      PREVYEAR.PrvYrLan,
      PREVYEAR.PrvYrPrc,
      PREVYEAR.PrvYrAmt,
      PREVMONT.PrvMoQty,
      PREVMONT.PrvMoLan,
      PREVMONT.PrvMoPrc,
      PREVMONT.PrvMoAmt
    FROM
      (${cSql1}) AS TRXCOUNT
    LEFT JOIN
      (${cSql2}) AS PREVYEAR ON TRXCOUNT.LocaName = PREVYEAR.LocaName
    LEFT JOIN
      (${cSql3}) AS PREVMONT ON TRXCOUNT.LocaName = PREVMONT.LocaName
    ORDER BY
      TRXCOUNT.Amount__ DESC;
  `;

  // Execute the final query
  try {
    const result = await queryDatabase(finalSql, params);
    res.json(result);
  } catch (err) {
    console.error('Database query error:', err.message);
    res.status(500).send('Error fetching sales data');
  }
};



const SalesRankBrand = async (req, res) => {
  const cBrandNum = req.query.BrandNum;
  const cUsersCde = req.query.UsersCde;
  const cOtherCde = req.query.OtherCde;
  const cCategNum = req.query.CategNum;
  const cItemDept = req.query.ItemDept;
  const cItemType = req.query.ItemType;
  const cLocation = req.query.Location;
  const cStoreGrp = req.query.StoreGrp;
  const dDateFrom = req.query.DateFrom;
  const dDateTo__ = req.query.DateTo__;

  // Constructing the base SQL query
  let cSql = `SELECT 
				BRAND___.BrandNme,
        ITEMLIST.Outright,
				Sum(SALESDTL.Quantity) AS Quantity,
				Sum(SALESDTL.ItemCost*SALESDTL.Quantity) AS ItemCost,
				Sum(SALESDTL.LandCost*SALESDTL.Quantity) AS LandCost,
				Sum(SALESDTL.ItemPrce*SALESDTL.Quantity) AS ItemPrce,
				Sum(SALESDTL.Amount__*SALESDTL.Quantity) AS Amount__ 
				FROM SALESREC, SALESDTL, BRAND___, ITEMLIST, LOCATION
				WHERE SALESREC.CtrlNum_ = SALESDTL.CtrlNum_
				AND SALESREC.Location = LOCATION.Location
				AND ITEMLIST.BrandNum = BRAND___.BrandNum
				AND ITEMLIST.ItemCode = SALESDTL.ItemCode
				AND SALESREC.Disabled = 0
        `

  // Parameters object
  const params = {};

  // Additional filters based on query parameters
  if (cBrandNum) {
    cSql += " AND ITEMLIST.BrandNum LIKE @cBrandNum";
    params.cBrandNum = `%${cBrandNum}%`;
  }
  if (cCategNum) {
    cSql += " AND ITEMLIST.CategNum LIKE @cCategNum";
    params.cCategNum = `%${cCategNum}%`;
  }
  if (cUsersCde) {
    cSql += " AND ITEMLIST.UsersCde LIKE @cUsersCde";
    params.cUsersCde = `%${cUsersCde}%`;  
  }
  if (cOtherCde) {
    cSql += " AND ITEMLIST.OtherCde LIKE @cOtherCde";
    params.cOtherCde = `%${cOtherCde}%`;
  }
  if (cItemDept) {
    cSql += " AND ITEMLIST.ItemDept LIKE @cItemDept";
    params.cItemDept = `%${cItemDept}%`;
  }
  if (cItemType) {
    cSql += " AND ITEMLIST.ItemType LIKE @cItemType";
    params.cItemType = `%${cItemType}%`;
  }
  if (cLocation) {
    cSql += " AND SALESREC.Location LIKE @cLocation";
    params.cLocation = `%${cLocation}%`;
  }
  if (cStoreGrp) {
    cSql += " AND LOCATION.StoreGrp LIKE @cStoreGrp";
    params.cStoreGrp = `%${cStoreGrp}%`;
  }
  if (dDateFrom) {
    cSql += " AND SALESDTL.Date____ >= @dDateFrom";
    params.dDateFrom = `${dDateFrom}`;
  }
  if (dDateTo__) {
    cSql += " AND SALESDTL.Date____ <= @dDateTo__";
    params.dDateTo__ = `${dDateTo__}`;
  }
  cSql += ` GROUP BY BRAND___.BrandNme, ITEMLIST.Outright
    ORDER BY 7 DESC `;

  // Log SQL query and parameters for debugging
  // console.log('Parameters:', params);

  try {
    // Execute query
    const result = await queryDatabase(cSql, params);
    res.json(result);
  } catch (err) {
    console.error('Database query error:', err.message);  // Log the error message
    res.status(500).send('Error fetching sales data');
  }
};

const SalesRankStock = async (req, res) => {
  const cBrandNum = req.query.BrandNum;
  const cUsersCde = req.query.UsersCde;
  const cOtherCde = req.query.OtherCde;
  const cCategNum = req.query.CategNum;
  const cItemDept = req.query.ItemDept;
  const cItemType = req.query.ItemType;
  const cLocation = req.query.Location;
  const cStoreGrp = req.query.StoreGrp;
  const dDateFrom = req.query.DateFrom;
  const dDateTo__ = req.query.DateTo__;


  // Constructing the base SQL query
  let cSql = `SELECT 
        ITEMLIST.UsersCde,
        ITEMLIST.OtherCde,
        ITEMLIST.Descript,
        ITEMLIST.Outright,
				BRAND___.BrandNme,
				ITEMDEPT.Descript AS DeptDesc,
				ITEMTYPE.Descript AS TypeDesc,
				Sum(SALESDTL.Quantity) AS Quantity,
				Sum(SALESDTL.LandCost*SALESDTL.Quantity) AS LandCost,
				Sum(SALESDTL.ItemPrce*SALESDTL.Quantity) AS ItemPrce,
				Sum(SALESDTL.Amount__*SALESDTL.Quantity) AS Amount__ 
				FROM SALESREC, SALESDTL, BRAND___, ITEMDEPT, ITEMTYPE, ITEMLIST, LOCATION
				WHERE SALESREC.CtrlNum_ = SALESDTL.CtrlNum_
				AND SALESREC.Location = LOCATION.Location
				AND ITEMLIST.BrandNum = BRAND___.BrandNum
				AND ITEMLIST.ItemDept = ITEMDEPT.ItemDept 
				AND ITEMLIST.ItemType = ITEMTYPE.ItemType 
				AND ITEMLIST.ItemCode = SALESDTL.ItemCode
				AND SALESREC.Disabled = 0
        `

  // Parameters object
  const params = {};

  // Additional filters based on query parameters
  if (cBrandNum) {
    cSql += " AND ITEMLIST.BrandNum LIKE @cBrandNum";
    params.cBrandNum = `%${cBrandNum}%`;
  }
  if (cCategNum) {
    cSql += " AND ITEMLIST.CategNum LIKE @cCategNum";
    params.cCategNum = `%${cCategNum}%`;
  }
  if (cUsersCde) {
    cSql += " AND ITEMLIST.UsersCde LIKE @cUsersCde";
    params.cUsersCde = `%${cUsersCde}%`;  
  }
  if (cOtherCde) {
    cSql += " AND ITEMLIST.OtherCde LIKE @cOtherCde";
    params.cOtherCde = `%${cOtherCde}%`;
  }
  if (cItemDept) {
    cSql += " AND ITEMLIST.ItemDept LIKE @cItemDept";
    params.cItemDept = `%${cItemDept}%`;
  }
  if (cItemType) {
    cSql += " AND ITEMLIST.ItemType LIKE @cItemType";
    params.cItemType = `%${cItemType}%`;
  }
  if (cLocation) {
    cSql += " AND SALESREC.Location LIKE @cLocation";
    params.cLocation = `%${cLocation}%`;
  }
  if (cStoreGrp) {
    cSql += " AND LOCATION.StoreGrp LIKE @cStoreGrp";
    params.cStoreGrp = `%${cStoreGrp}%`;
  }
  if (dDateFrom) {
    cSql += " AND SALESDTL.Date____ >= @dDateFrom";
    params.dDateFrom = `${dDateFrom}`;
  }
  if (dDateTo__) {
    cSql += " AND SALESDTL.Date____ <= @dDateTo__";
    params.dDateTo__ = `${dDateTo__}`;
  }
  cSql += ` GROUP BY 
    ITEMLIST.UsersCde,
    ITEMLIST.OtherCde,
    ITEMLIST.Descript,
    ITEMLIST.Outright,
    BRAND___.BrandNme,
    ITEMDEPT.Descript,
    ITEMTYPE.Descript
    ORDER BY 11 DESC `;

  // Log SQL query and parameters for debugging
  // console.log('Parameters:', params);

  try {
    // Execute query
    const result = await queryDatabase(cSql, params);
    res.json(result);
  } catch (err) {
    console.error('Database query error:', err.message);  // Log the error message
    res.status(500).send('Error fetching sales data');
  }
};

const DailySalesSum = async (req, res) => {
  const cBrandNum = req.query.BrandNum;
  const cUsersCde = req.query.UsersCde;
  const cOtherCde = req.query.OtherCde;
  const cCategNum = req.query.CategNum;
  const cItemDept = req.query.ItemDept;
  const cItemType = req.query.ItemType;
  const cLocation = req.query.Location;
  const cStoreGrp = req.query.StoreGrp;
  const dDateFrom = req.query.DateFrom;
  const dDateTo__ = req.query.DateTo__;


  // Constructing the base SQL query
  let cSql = `SELECT
	    SALESREC.DateFrom AS Date____,
	    COUNT(DISTINCT SALESREC.ReferDoc) AS TrxCount,
	    SUM(SALESDTL.Quantity) AS Quantity,
	    SUM(SALESDTL.ItemPrce * SALESDTL.Quantity) AS Gross___,
	    SUM(SALESDTL.Amount__ * SALESDTL.Quantity) AS Amount__,
	    SUM(SALESDTL.LandCost * SALESDTL.Quantity) AS LandCost,
	    SUM(SALESDTL.Amount__ * SALESDTL.Quantity) / COUNT(DISTINCT SALESREC.ReferDoc) AS ATV_____,
	    (SUM(SALESDTL.Amount__ * SALESDTL.Quantity) - SUM(SALESDTL.LandCost * SALESDTL.Quantity))
	    / SUM(SALESDTL.Amount__ * SALESDTL.Quantity) * 100 AS GrossPct
    FROM SALESREC,SALESDTL,ITEMLIST,BRAND___,LOCATION
    WHERE SALESREC.CtrlNum_ = SALESDTL.CtrlNum_
    AND SALESREC.Location = LOCATION.Location
    AND ITEMLIST.BrandNum = BRAND___.BrandNum
    AND ITEMLIST.ItemCode = SALESDTL.ItemCode
    AND SALESREC.Disabled = 0
  `

  // Parameters object
  const params = {};

  // Additional filters based on query parameters
  if (cBrandNum) {
    cSql += " AND ITEMLIST.BrandNum LIKE @cBrandNum";
    params.cBrandNum = `%${cBrandNum}%`;
  }
  if (cCategNum) {
    cSql += " AND ITEMLIST.CategNum LIKE @cCategNum";
    params.cCategNum = `%${cCategNum}%`;
  }
  if (cUsersCde) {
    cSql += " AND ITEMLIST.UsersCde LIKE @cUsersCde";
    params.cUsersCde = `%${cUsersCde}%`;  
  }
  if (cOtherCde) {
    cSql += " AND ITEMLIST.OtherCde LIKE @cOtherCde";
    params.cOtherCde = `%${cOtherCde}%`;
  }
  if (cItemDept) {
    cSql += " AND ITEMLIST.ItemDept LIKE @cItemDept";
    params.cItemDept = `%${cItemDept}%`;
  }
  if (cItemType) {
    cSql += " AND ITEMLIST.ItemType LIKE @cItemType";
    params.cItemType = `%${cItemType}%`;
  }
  if (cLocation) {
    cSql += " AND SALESREC.Location LIKE @cLocation";
    params.cLocation = `%${cLocation}%`;
  }
  if (cStoreGrp) {
    cSql += " AND LOCATION.StoreGrp LIKE @cStoreGrp";
    params.cStoreGrp = `%${cStoreGrp}%`;
  }
  if (dDateFrom) {
    cSql += " AND SALESDTL.Date____ >= @dDateFrom";
    params.dDateFrom = `${dDateFrom}`;
  }
  if (dDateTo__) {
    cSql += " AND SALESDTL.Date____ <= @dDateTo__";
    params.dDateTo__ = `${dDateTo__}`;
  }
  cSql += ` GROUP BY SALESREC.DateFrom
    ORDER BY 1 `;

  // Log SQL query and parameters for debugging
  // console.log('Parameters:', params);

  try {
    // Execute query
    const result = await queryDatabase(cSql, params);
    res.json(result);
  } catch (err) {
    console.error('Database query error:', err.message);  // Log the error message
    res.status(500).send('Error fetching sales data');
  }
};


const SalesRankType = async (req, res) => {
  const cBrandNum = req.query.BrandNum;
  const cUsersCde = req.query.UsersCde;
  const cOtherCde = req.query.OtherCde;
  const cCategNum = req.query.CategNum;
  const cItemDept = req.query.ItemDept;
  const cItemType = req.query.ItemType;
  const cLocation = req.query.Location;
  const cStoreGrp = req.query.StoreGrp;
  const dDateFrom = req.query.DateFrom;
  const dDateTo__ = req.query.DateTo__;


  // Constructing the base SQL query
  let cSql = `SELECT 
				ITEMTYPE.Descript AS TypeDesc,
				Sum(SALESDTL.Quantity) AS Quantity,
				Sum(SALESDTL.ItemCost*SALESDTL.Quantity) AS ItemCost,
				Sum(SALESDTL.LandCost*SALESDTL.Quantity) AS LandCost,
				Sum(SALESDTL.ItemPrce*SALESDTL.Quantity) AS ItemPrce,
				Sum(SALESDTL.Amount__*SALESDTL.Quantity) AS Amount__ 
				FROM SALESREC, SALESDTL, ITEMTYPE, ITEMLIST, LOCATION
				WHERE SALESREC.CtrlNum_ = SALESDTL.CtrlNum_
				AND SALESREC.Location = LOCATION.Location
				AND ITEMLIST.ItemType = ITEMTYPE.ItemType
				AND ITEMLIST.ItemCode = SALESDTL.ItemCode
				AND SALESREC.Disabled = 0
        `

  // Parameters object
  const params = {};

  // Additional filters based on query parameters
  if (cBrandNum) {
    cSql += " AND ITEMLIST.BrandNum LIKE @cBrandNum";
    params.cBrandNum = `%${cBrandNum}%`;
  }
  if (cCategNum) {
    cSql += " AND ITEMLIST.CategNum LIKE @cCategNum";
    params.cCategNum = `%${cCategNum}%`;
  }
  if (cUsersCde) {
    cSql += " AND ITEMLIST.UsersCde LIKE @cUsersCde";
    params.cUsersCde = `%${cUsersCde}%`;  
  }
  if (cOtherCde) {
    cSql += " AND ITEMLIST.OtherCde LIKE @cOtherCde";
    params.cOtherCde = `%${cOtherCde}%`;
  }
  if (cItemDept) {
    cSql += " AND ITEMLIST.ItemDept LIKE @cItemDept";
    params.cItemDept = `%${cItemDept}%`;
  }
  if (cItemType) {
    cSql += " AND ITEMLIST.ItemType LIKE @cItemType";
    params.cItemType = `%${cItemType}%`;
  }
  if (cLocation) {
    cSql += " AND SALESREC.Location LIKE @cLocation";
    params.cLocation = `%${cLocation}%`;
  }
  if (cStoreGrp) {
    cSql += " AND LOCATION.StoreGrp LIKE @cStoreGrp";
    params.cStoreGrp = `%${cStoreGrp}%`;
  }
  if (dDateFrom) {
    cSql += " AND SALESDTL.Date____ >= @dDateFrom";
    params.dDateFrom = `${dDateFrom}`;
  }
  if (dDateTo__) {
    cSql += " AND SALESDTL.Date____ <= @dDateTo__";
    params.dDateTo__ = `${dDateTo__}`;
  }
  cSql += ` GROUP BY ITEMTYPE.Descript
    ORDER BY 6 DESC `;

  // Log SQL query and parameters for debugging
  // console.log('Parameters:', params);

  try {
    // Execute query
    const result = await queryDatabase(cSql, params);
    res.json(result);
  } catch (err) {
    console.error('Database query error:', err.message);  // Log the error message
    res.status(500).send('Error fetching sales data');
  }
};

module.exports = { SalesCompStore, SalesCompBrand, SalesRankBrand, SalesRankStock, SalesRankType, DailySalesSum };
