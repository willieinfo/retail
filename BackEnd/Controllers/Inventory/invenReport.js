const { queryDatabase } = require('../../DBConnect/dbConnect');

const StockEndingByLocation = async (req, res) => {
    const dDateAsOf = req.query.DateAsOf;
    const cLocation = req.query.Location;
    const cStoreGrp = req.query.StoreGrp;
    const cBrandNum = req.query.BrandNum;
    const cItemType = req.query.ItemType;
    const cItemDept = req.query.ItemDept; 
    const cCategNum = req.query.CategNum;
    const cUsersCde = req.query.UsersCde;
    const cOtherCde = req.query.OtherCde;
    const cDescript = req.query.Descript;

    // Parameters object
    const params = {};
    if (dDateAsOf) {
        params.dDateAsOf = `${dDateAsOf}`;
    }
    let sqlFilters = ``
    if (cLocation) {
        sqlFilters += ` AND LOCATION.Location LIKE @cLocation `
        params.cLocation = `%${cLocation}%`;
    }
    if (cStoreGrp) {
        sqlFilters += ` AND LOCATION.StoreGrp LIKE @cStoreGrp `
        params.cStoreGrp = `%${cStoreGrp}%`;
    }
    if (cBrandNum) {
        sqlFilters += ` AND ITEMLIST.BrandNum LIKE @cBrandNum `
        params.cBrandNum = `%${cBrandNum}%`;
    }
    if (cItemType) {
        sqlFilters += ` AND ITEMLIST.ItemType LIKE @cItemType `
        params.cItemType = `%${cItemType}%`;
    }
    if (cItemDept) {
        sqlFilters += ` AND ITEMLIST.ItemDept LIKE @cItemDept `
        params.cItemDept = `%${cItemDept}%`;
    }
    if (cCategNum) {
        sqlFilters += ` AND ITEMLIST.CategNum LIKE @cCategNum `
        params.cCategNum = `%${cCategNum}%`;
    }
    if (cUsersCde) {
        sqlFilters += ` AND ITEMLIST.UsersCde LIKE @cUsersCde `
        params.cUsersCde = `%${cUsersCde}%`;
    }
    if (cOtherCde) {
        sqlFilters += ` AND ITEMLIST.OtherCde LIKE @cOtherCde `
        params.cOtherCde = `%${cOtherCde}%`;
    }
    if (cDescript) {
        sqlFilters += ` AND ITEMLIST.Descript LIKE @cDescript `
        params.cDescript = `%${cDescript}%`;
    }
        
    let cSql = `SELECT 
        LocaName, 
        SUM(TotalQty) AS TotalQty,
        SUM(TotalCos) AS TotalCos,
        SUM(TotalPrc) AS TotalPrc
    FROM (
    SELECT 
        LOCATION.LocaName, 
        Sum(COUNTDTL.Quantity+COUNTDTL.AdjusCnt) AS TotalQty, 
        Sum((COUNTDTL.Quantity+COUNTDTL.AdjusCnt)*COUNTDTL.LandCost) AS TotalCos, 
        Sum((COUNTDTL.Quantity+COUNTDTL.AdjusCnt)*ITEMLIST.ItemPrce) AS TotalPrc 
        FROM COUNTDTL,COUNTREC,LOCATION,ITEMLIST
        WHERE COUNTREC.CtrlNum_=COUNTDTL.CtrlNum_ 
        AND COUNTREC.Location=LOCATION.Location 
        AND COUNTDTL.ItemCode=ITEMLIST.ItemCode `+sqlFilters+`
        AND LOCATION.Damaged_=0 
        AND COUNTREC.Date____ = LOCATION.BeginDte 
        AND COUNTREC.Disabled=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY LOCATION.LocaName 
    UNION ALL 
    SELECT 
        LOCATION.LocaName, 
        Sum(-SALESDTL.Quantity) AS TotalQty, 
        Sum(-SALESDTL.Quantity*SALESDTL.LandCost) AS TotalCos, 
        Sum(-SALESDTL.Quantity*ITEMLIST.ItemPrce) AS TotalPrc 
        FROM SALESDTL,SALESREC,LOCATION,ITEMLIST
        WHERE SALESREC.CtrlNum_=SALESDTL.CtrlNum_ 
        AND SALESREC.Location=LOCATION.Location 
        AND SALESDTL.ItemCode=ITEMLIST.ItemCode `+sqlFilters+`
        AND SALESDTL.Date____ >= LOCATION.BeginDte+1 
        AND SALESDTL.Date____ <= @dDateAsOf 
        AND SALESREC.Disabled=0 
        AND LOCATION.Damaged_=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY LOCATION.LocaName 
    UNION ALL 
    SELECT 
        LOCATION.LocaName, 
        Sum(PURCHDTL.Quantity) AS TotalQty,
        Sum(PURCHDTL.Quantity*PURCHDTL.LandCost) AS TotalCos, 
        Sum(PURCHDTL.Quantity*ITEMLIST.ItemPrce) AS TotalPrc 
        FROM PURCHDTL,PURCHREC,LOCATION,ITEMLIST
        WHERE PURCHREC.CtrlNum_=PURCHDTL.CtrlNum_ 
        AND PURCHREC.Location=LOCATION.Location 
        AND PURCHDTL.ItemCode=ITEMLIST.ItemCode `+sqlFilters+`
        AND PURCHREC.Date____ >= LOCATION.BeginDte+1 
        AND PURCHREC.Date____ <= @dDateAsOf 
        AND PURCHREC.Disabled=0 
        AND LOCATION.Damaged_=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY LOCATION.LocaName 
    UNION ALL 
    SELECT 
        LOCATION.LocaName, 
        Sum(ITEMADJU.Quantity) AS TotalQty,
        Sum(ITEMADJU.Quantity*ITEMADJU.LandCost) AS TotalCos,
        Sum(ITEMADJU.Quantity*ITEMLIST.ItemPrce) AS TotalPrc
        FROM ITEMADJU,ADJUSREC,LOCATION,ITEMLIST
        WHERE ADJUSREC.Location=LOCATION.Location 
        AND ADJUSREC.CtrlNum_=ITEMADJU.CtrlNum_ 
        AND ITEMADJU.ItemCode=ITEMLIST.ItemCode `+sqlFilters+`
        AND ADJUSREC.Date____ >= LOCATION.BeginDte+1 
        AND ADJUSREC.Date____ <= @dDateAsOf 
        AND ADJUSREC.Disabled=0 
        AND LOCATION.Damaged_=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY LOCATION.LocaName 
    UNION ALL 
    SELECT 
        LOCATION.LocaName, 
        Sum(-STOCKDTL.Quantity) AS TotalQty,
        Sum(-STOCKDTL.Quantity*STOCKDTL.LandCost) AS TotalCos,
        Sum(-STOCKDTL.Quantity*ITEMLIST.ItemPrce) AS TotalPrc
        FROM STOCKDTL,STOCKREC,LOCATION,ITEMLIST
        WHERE STOCKREC.CtrlNum_=STOCKDTL.CtrlNum_ 
        AND STOCKREC.WhseFrom=LOCATION.Location 
        AND STOCKDTL.ItemCode=ITEMLIST.ItemCode `+sqlFilters+`
        AND STOCKREC.Date____ >= LOCATION.BeginDte+1 
        AND STOCKREC.Date____ <= @dDateAsOf 
        AND STOCKREC.Disabled=0 
        AND LOCATION.Damaged_=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY LOCATION.LocaName 
    UNION ALL 
    SELECT 
        LOCATION.LocaName, 
        Sum(STOCKDTL.QtyRecvd) AS TotalQty, 
        Sum(STOCKDTL.QtyRecvd*STOCKDTL.LandCost) AS TotalCos, 
        Sum(STOCKDTL.QtyRecvd*ITEMLIST.ItemPrce) AS TotalPrc 
        FROM STOCKDTL,STOCKREC,LOCATION,ITEMLIST
        WHERE STOCKREC.CtrlNum_=STOCKDTL.CtrlNum_ 
        AND STOCKREC.WhseTo__=LOCATION.Location 
        AND STOCKDTL.ItemCode=ITEMLIST.ItemCode `+sqlFilters+`
        AND STOCKREC.Date____ >= LOCATION.BeginDte+1 
        AND STOCKREC.Date____ <= @dDateAsOf 
        AND STOCKREC.Disabled=0 
        AND LOCATION.Damaged_=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY LOCATION.LocaName
    ) AS SubResult
    GROUP BY LocaName
    ORDER BY 4 DESC
    `
    
    console.log(params)
  
    try {
      // Execute query
      const result = await queryDatabase(cSql, params);
      res.json(result);
    } catch (err) {
      console.error('Database query error:', err.message);  // Log the error message
      res.status(500).send('Error fetching inventory data');
    }
  };

  

  const StockEndingByBrand = async (req, res) => {
    const dDateAsOf = req.query.DateAsOf;
    const cLocation = req.query.Location;
    const cStoreGrp = req.query.StoreGrp;
    const cBrandNum = req.query.BrandNum;
    const cItemType = req.query.ItemType;
    const cItemDept = req.query.ItemDept; 
    const cCategNum = req.query.CategNum;
    const cUsersCde = req.query.UsersCde;
    const cOtherCde = req.query.OtherCde;
    const cDescript = req.query.Descript;

    // Parameters object
    const params = {};
    if (dDateAsOf) {
        params.dDateAsOf = `${dDateAsOf}`;
    }
    let sqlFilters = ``
    if (cLocation) {
        sqlFilters += ` AND LOCATION.Location LIKE @cLocation `
        params.cLocation = `%${cLocation}%`;
    }
    if (cStoreGrp) {
        sqlFilters += ` AND LOCATION.StoreGrp LIKE @cStoreGrp `
        params.cStoreGrp = `%${cStoreGrp}%`;
    }
    if (cBrandNum) {
        sqlFilters += ` AND ITEMLIST.BrandNum LIKE @cBrandNum `
        params.cBrandNum = `%${cBrandNum}%`;
    }
    if (cItemType) {
        sqlFilters += ` AND ITEMLIST.ItemType LIKE @cItemType `
        params.cItemType = `%${cItemType}%`;
    }
    if (cItemDept) {
        sqlFilters += ` AND ITEMLIST.ItemDept LIKE @cItemDept `
        params.cItemDept = `%${cItemDept}%`;
    }
    if (cCategNum) {
        sqlFilters += ` AND ITEMLIST.CategNum LIKE @cCategNum `
        params.cCategNum = `%${cCategNum}%`;
    }
    if (cUsersCde) {
        sqlFilters += ` AND ITEMLIST.UsersCde LIKE @cUsersCde `
        params.cUsersCde = `%${cUsersCde}%`;
    }
    if (cOtherCde) {
        sqlFilters += ` AND ITEMLIST.OtherCde LIKE @cOtherCde `
        params.cOtherCde = `%${cOtherCde}%`;
    }
    if (cDescript) {
        sqlFilters += ` AND ITEMLIST.Descript LIKE @cDescript `
        params.cDescript = `%${cDescript}%`;
    }
    
    let cSql = `SELECT 
        BrandNme, 
        SUM(TotalQty) AS TotalQty,
        SUM(TotalCos) AS TotalCos,
        SUM(TotalPrc) AS TotalPrc
    FROM (
    SELECT 
        BRAND___.BrandNme, 
        Sum(COUNTDTL.Quantity+COUNTDTL.AdjusCnt) AS TotalQty, 
        Sum((COUNTDTL.Quantity+COUNTDTL.AdjusCnt)*COUNTDTL.LandCost) AS TotalCos, 
        Sum((COUNTDTL.Quantity+COUNTDTL.AdjusCnt)*ITEMLIST.ItemPrce) AS TotalPrc 
        FROM COUNTDTL,COUNTREC,ITEMLIST,LOCATION,BRAND___
        WHERE COUNTREC.CtrlNum_=COUNTDTL.CtrlNum_ 
        AND COUNTREC.Location=LOCATION.Location
        AND ITEMLIST.BrandNum=BRAND___.BrandNum
        AND COUNTDTL.ItemCode=ITEMLIST.ItemCode `+sqlFilters+`
        AND LOCATION.Damaged_=0 
        AND COUNTREC.Date____ = LOCATION.BeginDte 
        AND COUNTREC.Disabled=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY BRAND___.BrandNme
    UNION ALL 
    SELECT 
        BRAND___.BrandNme,  
        Sum(-SALESDTL.Quantity) AS TotalQty, 
        Sum(-SALESDTL.Quantity*SALESDTL.LandCost) AS TotalCos, 
        Sum(-SALESDTL.Quantity*ITEMLIST.ItemPrce) AS TotalPrc 
        FROM SALESDTL,SALESREC,ITEMLIST,LOCATION,BRAND___
        WHERE SALESREC.CtrlNum_=SALESDTL.CtrlNum_ 
        AND SALESREC.Location=LOCATION.Location
        AND ITEMLIST.BrandNum=BRAND___.BrandNum
        AND SALESDTL.ItemCode=ITEMLIST.ItemCode `+sqlFilters+`
        AND SALESDTL.Date____ >= LOCATION.BeginDte+1 
        AND SALESDTL.Date____ <= @dDateAsOf 
        AND SALESREC.Disabled=0 
        AND LOCATION.Damaged_=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY BRAND___.BrandNme
    UNION ALL 
    SELECT 
        BRAND___.BrandNme, 
        Sum(PURCHDTL.Quantity) AS TotalQty,
        Sum(PURCHDTL.Quantity*PURCHDTL.LandCost) AS TotalCos, 
        Sum(PURCHDTL.Quantity*ITEMLIST.ItemPrce) AS TotalPrc 
        FROM PURCHDTL,PURCHREC,ITEMLIST,LOCATION,BRAND___
        WHERE PURCHREC.CtrlNum_=PURCHDTL.CtrlNum_ 
        AND PURCHREC.Location=LOCATION.Location
        AND ITEMLIST.BrandNum=BRAND___.BrandNum
        AND PURCHDTL.ItemCode=ITEMLIST.ItemCode `+sqlFilters+`
        AND PURCHREC.Date____ >= LOCATION.BeginDte+1 
        AND PURCHREC.Date____ <= @dDateAsOf 
        AND PURCHREC.Disabled=0 
        AND LOCATION.Damaged_=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY BRAND___.BrandNme
    UNION ALL 
    SELECT 
        BRAND___.BrandNme,  
        Sum(ITEMADJU.Quantity) AS TotalQty,
        Sum(ITEMADJU.Quantity*ITEMADJU.LandCost) AS TotalCos,
        Sum(ITEMADJU.Quantity*ITEMLIST.ItemPrce) AS TotalPrc
        FROM ITEMADJU,ADJUSREC,ITEMLIST,LOCATION,BRAND___
        WHERE ADJUSREC.CtrlNum_=ITEMADJU.CtrlNum_ 
        AND ADJUSREC.Location=LOCATION.Location
        AND ITEMLIST.BrandNum=BRAND___.BrandNum
        AND ITEMADJU.ItemCode=ITEMLIST.ItemCode `+sqlFilters+`
        AND ADJUSREC.Date____ >= LOCATION.BeginDte+1 
        AND ADJUSREC.Date____ <= @dDateAsOf 
        AND ADJUSREC.Disabled=0 
        AND LOCATION.Damaged_=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY BRAND___.BrandNme
    UNION ALL 
    SELECT 
        BRAND___.BrandNme,  
        Sum(-STOCKDTL.Quantity) AS TotalQty,
        Sum(-STOCKDTL.Quantity*STOCKDTL.LandCost) AS TotalCos,
        Sum(-STOCKDTL.Quantity*ITEMLIST.ItemPrce) AS TotalPrc
        FROM STOCKDTL,STOCKREC,ITEMLIST,LOCATION,BRAND___
        WHERE STOCKREC.CtrlNum_=STOCKDTL.CtrlNum_ 
        AND STOCKREC.WhseFrom=LOCATION.Location
        AND ITEMLIST.BrandNum=BRAND___.BrandNum
        AND STOCKDTL.ItemCode=ITEMLIST.ItemCode `+sqlFilters+`
        AND STOCKREC.Date____ >= LOCATION.BeginDte+1 
        AND STOCKREC.Date____ <= @dDateAsOf 
        AND STOCKREC.Disabled=0 
        AND LOCATION.Damaged_=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY BRAND___.BrandNme
    UNION ALL 
    SELECT 
        BRAND___.BrandNme, 
        Sum(STOCKDTL.QtyRecvd) AS TotalQty, 
        Sum(STOCKDTL.QtyRecvd*STOCKDTL.LandCost) AS TotalCos, 
        Sum(STOCKDTL.QtyRecvd*ITEMLIST.ItemPrce) AS TotalPrc 
        FROM STOCKDTL,STOCKREC,ITEMLIST,LOCATION,BRAND___
        WHERE STOCKREC.CtrlNum_=STOCKDTL.CtrlNum_ 
        AND STOCKREC.WhseTo__=LOCATION.Location
        AND ITEMLIST.BrandNum=BRAND___.BrandNum
        AND STOCKDTL.ItemCode=ITEMLIST.ItemCode `+sqlFilters+`
        AND STOCKREC.Date____ >= LOCATION.BeginDte+1 
        AND STOCKREC.Date____ <= @dDateAsOf 
        AND STOCKREC.Disabled=0 
        AND LOCATION.Damaged_=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY BRAND___.BrandNme
    ) AS SubResult
    GROUP BY BrandNme
    ORDER BY 4 DESC
    `
    
    console.log(params)
  
    try {
      // Execute query
      const result = await queryDatabase(cSql, params);
      res.json(result);
    } catch (err) {
      console.error('Database query error:', err.message);  // Log the error message
      res.status(500).send('Error fetching inventory data');
    }
  };

  module.exports = { StockEndingByLocation, StockEndingByBrand };
  