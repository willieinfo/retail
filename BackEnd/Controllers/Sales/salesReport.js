const { queryDatabase } = require('../../DBConnect/dbConnect');

const SalesCompStore = async (req, res) => {
  // Extract query parameters
  const filters = {
    BrandNum: req.query.BrandNum,
    UsersCde: req.query.UsersCde,
    OtherCde: req.query.OtherCde,
    CategNum: req.query.CategNum,
    ItemDept: req.query.ItemDept,
    ItemType: req.query.ItemType,
    Location: req.query.Location,
    StoreGrp: req.query.StoreGrp,
    DateFrom: req.query.DateFrom,
    DateTo__: req.query.DateTo__,
    YearFrom: req.query.YearFrom,
    YearTo__: req.query.YearTo__,
    MontFrom: req.query.MontFrom,
    MontTo__: req.query.MontTo__
  };

  // Determine the full date range needed (min to max)
  const allDates = [
    filters.DateFrom,
    filters.DateTo__,
    filters.YearFrom,
    filters.YearTo__,
    filters.MontFrom,
    filters.MontTo__
  ].filter(Boolean); // Remove null/undefined if any

  const minDate = allDates.sort()[0];                      // earliest
  const maxDate = allDates.sort().reverse()[0];            // latest

  const { query, params } = buildSalesQuery(filters, minDate, maxDate);

  const finalQuery = `
    SELECT 
      StoreGrp,
      LocaName,
      SUM(Quantity) AS Quantity,
      SUM(LandCost) AS LandCost,
      SUM(ItemPrce) AS ItemPrce,
      SUM(Amount__) AS Amount__,
      SUM(PrvYrQty) AS PrvYrQty,
      SUM(PrvYrLan) AS PrvYrLan,
      SUM(PrvYrPrc) AS PrvYrPrc,
      SUM(PrvYrAmt) AS PrvYrAmt,
      SUM(PrvMoQty) AS PrvMoQty,
      SUM(PrvMoLan) AS PrvMoLan,
      SUM(PrvMoPrc) AS PrvMoPrc,
      SUM(PrvMoAmt) AS PrvMoAmt
    FROM (${query}) AS CombinedSalesData
    GROUP BY StoreGrp, LocaName
    ORDER BY 6 DESC
  `;

  try {
    const result = await queryDatabase(finalQuery, params);
    res.json(result);
  } catch (err) {
    console.error('Database query error:', err.message);
    res.status(500).send('Error fetching sales data');
  }
};


function buildSalesQuery(filters, minDate, maxDate) {
  let whereClause = `
    WHERE SALESDTL.Date____ BETWEEN @MinDate AND @MaxDate
      AND SALESREC.Disabled = 0
  `;

  // Dynamically build WHERE conditions
  if (filters.BrandNum) {
    whereClause += ` AND ITEMLIST.BrandNum LIKE @BrandNum`;
  }
  if (filters.CategNum) {
    whereClause += ` AND ITEMLIST.CategNum LIKE @CategNum`;
  }
  if (filters.UsersCde) {
    whereClause += ` AND ITEMLIST.UsersCde LIKE @UsersCde`;
  }
  if (filters.OtherCde) {
    whereClause += ` AND ITEMLIST.OtherCde LIKE @OtherCde`;
  }
  if (filters.ItemDept) {
    whereClause += ` AND ITEMLIST.ItemDept LIKE @ItemDept`;
  }
  if (filters.ItemType) {
    whereClause += ` AND ITEMLIST.ItemType LIKE @ItemType`;
  }
  if (filters.Location) {
    whereClause += ` AND SALESREC.Location LIKE @Location`;
  }
  if (filters.StoreGrp) {
    whereClause += ` AND LOCATION.StoreGrp LIKE @StoreGrp`;
  }

  const query = `
    SELECT 
      LOCATION.LocaName,
      LOCATION.StoreGrp,

      -- Current Period
      SUM(CASE WHEN SALESDTL.Date____ BETWEEN @DateFrom AND @DateTo__ THEN SALESDTL.Quantity ELSE 0 END) AS Quantity,
      SUM(CASE WHEN SALESDTL.Date____ BETWEEN @DateFrom AND @DateTo__ THEN SALESDTL.LandCost * SALESDTL.Quantity ELSE 0 END) AS LandCost,
      SUM(CASE WHEN SALESDTL.Date____ BETWEEN @DateFrom AND @DateTo__ THEN SALESDTL.ItemPrce * SALESDTL.Quantity ELSE 0 END) AS ItemPrce,
      SUM(CASE WHEN SALESDTL.Date____ BETWEEN @DateFrom AND @DateTo__ THEN SALESDTL.Amount__ * SALESDTL.Quantity ELSE 0 END) AS Amount__,

      -- Previous Year
      SUM(CASE WHEN SALESDTL.Date____ BETWEEN @YearFrom AND @YearTo__ THEN SALESDTL.Quantity ELSE 0 END) AS PrvYrQty,
      SUM(CASE WHEN SALESDTL.Date____ BETWEEN @YearFrom AND @YearTo__ THEN SALESDTL.LandCost * SALESDTL.Quantity ELSE 0 END) AS PrvYrLan,
      SUM(CASE WHEN SALESDTL.Date____ BETWEEN @YearFrom AND @YearTo__ THEN SALESDTL.ItemPrce * SALESDTL.Quantity ELSE 0 END) AS PrvYrPrc,
      SUM(CASE WHEN SALESDTL.Date____ BETWEEN @YearFrom AND @YearTo__ THEN SALESDTL.Amount__ * SALESDTL.Quantity ELSE 0 END) AS PrvYrAmt,

      -- Previous Month
      SUM(CASE WHEN SALESDTL.Date____ BETWEEN @MontFrom AND @MontTo__ THEN SALESDTL.Quantity ELSE 0 END) AS PrvMoQty,
      SUM(CASE WHEN SALESDTL.Date____ BETWEEN @MontFrom AND @MontTo__ THEN SALESDTL.LandCost * SALESDTL.Quantity ELSE 0 END) AS PrvMoLan,
      SUM(CASE WHEN SALESDTL.Date____ BETWEEN @MontFrom AND @MontTo__ THEN SALESDTL.ItemPrce * SALESDTL.Quantity ELSE 0 END) AS PrvMoPrc,
      SUM(CASE WHEN SALESDTL.Date____ BETWEEN @MontFrom AND @MontTo__ THEN SALESDTL.Amount__ * SALESDTL.Quantity ELSE 0 END) AS PrvMoAmt

    FROM SALESREC
    INNER JOIN SALESDTL ON SALESREC.CtrlNum_ = SALESDTL.CtrlNum_
    INNER JOIN LOCATION ON SALESREC.Location = LOCATION.Location
    INNER JOIN ITEMLIST ON ITEMLIST.ItemCode = SALESDTL.ItemCode
    ${whereClause}
    GROUP BY LOCATION.LocaName, LOCATION.StoreGrp
  `;

  // Prepare parameters safely
  const params = {
    MinDate: minDate,
    MaxDate: maxDate,
    DateFrom: filters.DateFrom,
    DateTo__: filters.DateTo__,
    YearFrom: filters.YearFrom,
    YearTo__: filters.YearTo__,
    MontFrom: filters.MontFrom,
    MontTo__: filters.MontTo__,
    ...(filters.BrandNum && { BrandNum: `%${filters.BrandNum}%` }),
    ...(filters.UsersCde && { UsersCde: `%${filters.UsersCde}%` }),
    ...(filters.OtherCde && { OtherCde: `%${filters.OtherCde}%` }),
    ...(filters.CategNum && { CategNum: `%${filters.CategNum}%` }),
    ...(filters.ItemDept && { ItemDept: `%${filters.ItemDept}%` }),
    ...(filters.ItemType && { ItemType: `%${filters.ItemType}%` }),
    ...(filters.Location && { Location: `%${filters.Location}%` }),
    ...(filters.StoreGrp && { StoreGrp: `%${filters.StoreGrp}%` }),
  };

  return { query, params };
}


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

module.exports = { SalesCompStore, SalesRankBrand };
