const { queryDatabase } = require('../../DBConnect/dbConnect');

const PurchSumType = async (req, res) => {
  const cBrandNum = req.query.BrandNum;
  const cUsersCde = req.query.UsersCde;
  const cOtherCde = req.query.OtherCde;
  const cCategNum = req.query.CategNum;
  const cItemDept = req.query.ItemDept;
  const cItemType = req.query.ItemType;
  const cLocation = req.query.Location;
  const dDateFrom = req.query.DateFrom;
  const dDateTo__ = req.query.DateTo__;
  const cSuppName = req.query.SuppName;


  // Constructing the base SQL query
  let cSql = `SELECT 
        LOCATION.LocaName,
        ITEMTYPE.Descript AS TypeDesc,
        Sum(PURCHDTL.Quantity) AS Quantity,
        Sum(PURCHDTL.SellPrce*PURCHDTL.Quantity) AS SellPrce,
        Sum(PURCHDTL.ItemPrce*PURCHDTL.Quantity) AS PurcCost,
        Sum(PURCHDTL.Amount__*PURCHDTL.Quantity) AS Amount__,
        Sum(PURCHDTL.LandCost*PURCHDTL.Quantity) AS LandCost
        FROM PURCHREC, PURCHDTL, ITEMLIST, LOCATION, ITEMTYPE, SUPPLIER
        WHERE PURCHREC.CtrlNum_ = PURCHDTL.CtrlNum_
        AND PURCHREC.Location = LOCATION.Location
        AND ITEMLIST.ItemType = ITEMTYPE.ItemType
        AND ITEMLIST.SuppNum_ = SUPPLIER.SuppNum_
        AND ITEMLIST.ItemCode = PURCHDTL.ItemCode
        AND PURCHREC.Disabled = 0
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
    cSql += " AND PURCHREC.Location LIKE @cLocation";
    params.cLocation = `%${cLocation}%`;
  }
  if (dDateFrom) {
    cSql += " AND PURCHREC.Date____ >= @dDateFrom";
    params.dDateFrom = `${dDateFrom}`;
  }
  if (dDateTo__) {
    cSql += " AND PURCHREC.Date____ <= @dDateTo__";
    params.dDateTo__ = `${dDateTo__}`;
  }
  if (cSuppName) {
    cSql += " AND SUPPLIER.SuppName LIKE @cSuppName";
    params.cSuppName = `%${cSuppName}%`;
  }

  cSql += ` GROUP BY 
    LOCATION.LocaName,
    ITEMTYPE.Descript
    ORDER BY 5 DESC `;

  // Log SQL query and parameters for debugging
  console.log('Parameters:', params);

  try {
    // Execute query
    const result = await queryDatabase(cSql, params);
    res.json(result);
  } catch (err) {
    console.error('Database query error:', err.message);  // Log the error message
    res.status(500).send('Error fetching purchases data');
  }
};



const PurchRepoStock = async (req, res) => {
  const cBrandNum = req.query.BrandNum;
  const cUsersCde = req.query.UsersCde;
  const cOtherCde = req.query.OtherCde;
  const cCategNum = req.query.CategNum;
  const cItemDept = req.query.ItemDept;
  const cItemType = req.query.ItemType;
  const cLocation = req.query.Location;
  const dDateFrom = req.query.DateFrom;
  const dDateTo__ = req.query.DateTo__;
  const cSuppName = req.query.SuppName;

  // Constructing the base SQL query
  let cSql = `SELECT 
        LOCATION.LocaName,
        ITEMLIST.UsersCde,
        ITEMLIST.OtherCde,
        ITEMLIST.Descript,
        ITEMLIST.Outright,
        BRAND___.BrandNme,
        ITEMDEPT.Descript AS DeptDesc,
        SUPPLIER.SuppName,
        Sum(PURCHDTL.Quantity) AS Quantity,
        Sum(PURCHDTL.SellPrce*PURCHDTL.Quantity) AS SellPrce,
        Sum(PURCHDTL.ItemPrce*PURCHDTL.Quantity) AS PurcCost,
        Sum(PURCHDTL.Amount__*PURCHDTL.Quantity) AS Amount__,
        Sum(PURCHDTL.LandCost*PURCHDTL.Quantity) AS LandCost
        FROM PURCHREC, PURCHDTL, BRAND___, ITEMLIST, LOCATION, ITEMDEPT, SUPPLIER
        WHERE PURCHREC.CtrlNum_ = PURCHDTL.CtrlNum_
        AND PURCHREC.Location = LOCATION.Location
        AND ITEMLIST.BrandNum = BRAND___.BrandNum
        AND ITEMLIST.ItemDept = ITEMDEPT.ItemDept
        AND ITEMLIST.SuppNum_ = SUPPLIER.SuppNum_
        AND ITEMLIST.ItemCode = PURCHDTL.ItemCode
        AND PURCHREC.Disabled = 0
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
    cSql += " AND PURCHREC.Location LIKE @cLocation";
    params.cLocation = `%${cLocation}%`;
  }
  if (dDateFrom) {
    cSql += " AND PURCHREC.Date____ >= @dDateFrom";
    params.dDateFrom = `${dDateFrom}`;
  }
  if (dDateTo__) {
    cSql += " AND PURCHREC.Date____ <= @dDateTo__";
    params.dDateTo__ = `${dDateTo__}`;
  }
  if (cSuppName) {
    cSql += " AND SUPPLIER.SuppName LIKE @cSuppName";
    params.cSuppName = `%${cSuppName}%`;
  }
  cSql += ` GROUP BY 
    LOCATION.LocaName,
    ITEMLIST.UsersCde,
    ITEMLIST.OtherCde,
    ITEMLIST.Descript,
    ITEMLIST.Outright,
    BRAND___.BrandNme,
    ITEMDEPT.Descript,
    SUPPLIER.SuppName
    ORDER BY 11 DESC `;

  // Log SQL query and parameters for debugging
  // console.log('Parameters:', params);

  try {
    // Execute query
    const result = await queryDatabase(cSql, params);
    res.json(result);
  } catch (err) {
    console.error('Database query error:', err.message);  // Log the error message
    res.status(500).send('Error fetching purchases data');
  }
};

const PurchSumSupp = async (req, res) => {
  const cBrandNum = req.query.BrandNum;
  const cUsersCde = req.query.UsersCde;
  const cOtherCde = req.query.OtherCde;
  const cCategNum = req.query.CategNum;
  const cItemDept = req.query.ItemDept;
  const cItemType = req.query.ItemType;
  const cLocation = req.query.Location;
  const dDateFrom = req.query.DateFrom;
  const dDateTo__ = req.query.DateTo__;
  const cSuppName = req.query.SuppName;


  // Constructing the base SQL query
  let cSql = `SELECT 
        LOCATION.LocaName,
        SUPPLIER.SuppName,
        Sum(PURCHDTL.Quantity) AS Quantity,
        Sum(PURCHDTL.SellPrce*PURCHDTL.Quantity) AS SellPrce,
        Sum(PURCHDTL.ItemPrce*PURCHDTL.Quantity) AS PurcCost,
        Sum(PURCHDTL.Amount__*PURCHDTL.Quantity) AS Amount__,
        Sum(PURCHDTL.LandCost*PURCHDTL.Quantity) AS LandCost
        FROM PURCHREC, PURCHDTL, ITEMLIST, LOCATION, ITEMTYPE, SUPPLIER
        WHERE PURCHREC.CtrlNum_ = PURCHDTL.CtrlNum_
        AND PURCHREC.Location = LOCATION.Location
        AND ITEMLIST.ItemType = ITEMTYPE.ItemType
        AND ITEMLIST.SuppNum_ = SUPPLIER.SuppNum_
        AND ITEMLIST.ItemCode = PURCHDTL.ItemCode
        AND PURCHREC.Disabled = 0
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
    cSql += " AND PURCHREC.Location LIKE @cLocation";
    params.cLocation = `%${cLocation}%`;
  }
  if (dDateFrom) {
    cSql += " AND PURCHREC.Date____ >= @dDateFrom";
    params.dDateFrom = `${dDateFrom}`;
  }
  if (dDateTo__) {
    cSql += " AND PURCHREC.Date____ <= @dDateTo__";
    params.dDateTo__ = `${dDateTo__}`;
  }
  if (cSuppName) {
    cSql += " AND SUPPLIER.SuppName LIKE @cSuppName";
    params.cSuppName = `%${cSuppName}%`;
  }

  cSql += ` GROUP BY 
    LOCATION.LocaName,
    SUPPLIER.SuppName
    ORDER BY 5 DESC `;

  // Log SQL query and parameters for debugging
  // console.log('Parameters:', params);

  try {
    // Execute query
    const result = await queryDatabase(cSql, params);
    res.json(result);
  } catch (err) {
    console.error('Database query error:', err.message);  // Log the error message
    res.status(500).send('Error fetching purchases data');
  }
};

const PurchSumBrnd = async (req, res) => {
  const cBrandNum = req.query.BrandNum;
  const cUsersCde = req.query.UsersCde;
  const cOtherCde = req.query.OtherCde;
  const cCategNum = req.query.CategNum;
  const cItemDept = req.query.ItemDept;
  const cItemType = req.query.ItemType;
  const cLocation = req.query.Location;
  const dDateFrom = req.query.DateFrom;
  const dDateTo__ = req.query.DateTo__;
  const cSuppName = req.query.SuppName;


  // Constructing the base SQL query
  let cSql = `SELECT 
        LOCATION.LocaName,
        BRAND___.BrandNme,
        Sum(PURCHDTL.Quantity) AS Quantity,
        Sum(PURCHDTL.SellPrce*PURCHDTL.Quantity) AS SellPrce,
        Sum(PURCHDTL.ItemPrce*PURCHDTL.Quantity) AS PurcCost,
        Sum(PURCHDTL.Amount__*PURCHDTL.Quantity) AS Amount__,
        Sum(PURCHDTL.LandCost*PURCHDTL.Quantity) AS LandCost
        FROM PURCHREC, PURCHDTL, ITEMLIST, LOCATION, ITEMTYPE, BRAND___
        WHERE PURCHREC.CtrlNum_ = PURCHDTL.CtrlNum_
        AND PURCHREC.Location = LOCATION.Location
        AND ITEMLIST.ItemType = ITEMTYPE.ItemType
        AND ITEMLIST.BrandNum = BRAND___.BrandNum
        AND ITEMLIST.ItemCode = PURCHDTL.ItemCode
        AND PURCHREC.Disabled = 0
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
    cSql += " AND PURCHREC.Location LIKE @cLocation";
    params.cLocation = `%${cLocation}%`;
  }
  if (dDateFrom) {
    cSql += " AND PURCHREC.Date____ >= @dDateFrom";
    params.dDateFrom = `${dDateFrom}`;
  }
  if (dDateTo__) {
    cSql += " AND PURCHREC.Date____ <= @dDateTo__";
    params.dDateTo__ = `${dDateTo__}`;
  }
  if (cSuppName) {
    cSql += " AND SUPPLIER.SuppName LIKE @cSuppName";
    params.cSuppName = `%${cSuppName}%`;
  }

  cSql += ` GROUP BY 
    LOCATION.LocaName,
    BRAND___.BrandNme
    ORDER BY 5 DESC `;

  // Log SQL query and parameters for debugging
  // console.log('Parameters:', params);

  try {
    // Execute query
    const result = await queryDatabase(cSql, params);
    res.json(result);
  } catch (err) {
    console.error('Database query error:', err.message);  // Log the error message
    res.status(500).send('Error fetching purchases data');
  }
};

module.exports = { PurchRepoStock, PurchSumType, PurchSumSupp, PurchSumBrnd };
