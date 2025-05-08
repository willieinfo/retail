const { queryDatabase } = require('../../DBConnect/dbConnect');

const StockEndingByLocation = async (req, res) => {
    const cBrandNum = req.query.BrandNum;
    const cLocation = req.query.Location;
    const dDateAsOf = req.query.DateAsOf;


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
        Sum((COUNTDTL.Quantity+COUNTDTL.AdjusCnt)*COUNTDTL.ItemPrce) AS TotalPrc 
        FROM COUNTDTL,COUNTREC,LOCATION,ITEMLIST
        WHERE COUNTREC.CtrlNum_=COUNTDTL.CtrlNum_ 
        AND COUNTDTL.ItemCode=ITEMLIST.ItemCode 
        AND COUNTREC.Location=LOCATION.Location 
        AND ITEMLIST.BrandNum LIKE @cBrandNum 
        AND LOCATION.Location LIKE @cLocation 
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
        Sum(-SALESDTL.Quantity*SALESDTL.ItemPrce) AS TotalPrc 
        FROM SALESDTL,SALESREC,LOCATION,ITEMLIST
        WHERE SALESREC.CtrlNum_=SALESDTL.CtrlNum_ 
        AND SALESREC.Location=LOCATION.Location 
        AND SALESDTL.ItemCode=ITEMLIST.ItemCode 
        AND ITEMLIST.BrandNum LIKE @cBrandNum 
        AND LOCATION.Location LIKE @cLocation 
        AND SALESDTL.Date____ >= LOCATION.BeginDte+1 
        AND SALESDTL.Date____ <= @dDateAsOf 
        AND LOCATION.Damaged_=0 
        AND SALESREC.Disabled=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY LOCATION.LocaName 
    UNION ALL 
    SELECT 
        LOCATION.LocaName, 
        Sum(PURCHDTL.Quantity) AS TotalQty,
        Sum(PURCHDTL.Quantity*PURCHDTL.LandCost) AS TotalCos, 
        Sum(PURCHDTL.Quantity*PURCHDTL.SellPrce) AS TotalPrc 
        FROM PURCHDTL,PURCHREC,LOCATION,ITEMLIST
        WHERE PURCHREC.CtrlNum_=PURCHDTL.CtrlNum_ 
        AND PURCHREC.Location=LOCATION.Location 
        AND PURCHDTL.ItemCode=ITEMLIST.ItemCode 
        AND ITEMLIST.BrandNum LIKE @cBrandNum 
        AND LOCATION.Location LIKE @cLocation 
        AND PURCHREC.Date____ >= LOCATION.BeginDte+1 
        AND PURCHREC.Date____ <= @dDateAsOf 
        AND LOCATION.Damaged_=0 
        AND PURCHREC.Disabled=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY LOCATION.LocaName 
    UNION ALL 
    SELECT 
        LOCATION.LocaName, 
        Sum(ITEMADJU.Quantity) AS TotalQty,
        Sum(ITEMADJU.Quantity*ITEMADJU.LandCost) AS TotalCos,
        Sum(ITEMADJU.Quantity*ITEMADJU.ItemPrce) AS TotalPrc
        FROM ITEMADJU,ADJUSREC,LOCATION,ITEMLIST
        WHERE ADJUSREC.Location=LOCATION.Location 
        AND ADJUSREC.CtrlNum_=ITEMADJU.CtrlNum_ 
        AND ITEMADJU.ItemCode=ITEMLIST.ItemCode 
        AND ITEMLIST.BrandNum LIKE @cBrandNum 
        AND LOCATION.Location LIKE @cLocation 
        AND ADJUSREC.Date____ >= LOCATION.BeginDte+1 
        AND ADJUSREC.Date____ <= @dDateAsOf 
        AND LOCATION.Damaged_=0 
        AND ADJUSREC.Disabled=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY LOCATION.LocaName 
    UNION ALL 
    SELECT 
        LOCATION.LocaName, 
        Sum(-STOCKDTL.Quantity) AS TotalQty,
        Sum(-STOCKDTL.Quantity*STOCKDTL.LandCost) AS TotalCos,
        Sum(-STOCKDTL.Quantity*STOCKDTL.Amount__) AS TotalPrc
        FROM STOCKDTL,STOCKREC,LOCATION,ITEMLIST
        WHERE STOCKREC.CtrlNum_=STOCKDTL.CtrlNum_ 
        AND STOCKREC.WhseFrom=LOCATION.Location 
        AND STOCKDTL.ItemCode=ITEMLIST.ItemCode 
        AND ITEMLIST.BrandNum LIKE @cBrandNum 
        AND LOCATION.Location LIKE @cLocation 
        AND STOCKREC.Date____ >= LOCATION.BeginDte+1 
        AND STOCKREC.Date____ <= @dDateAsOf 
        AND LOCATION.Damaged_=0 
        AND STOCKREC.Disabled=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY LOCATION.LocaName 
    UNION ALL 
    SELECT 
        LOCATION.LocaName, 
        Sum(STOCKDTL.QtyRecvd) AS TotalQty, 
        Sum(STOCKDTL.QtyRecvd*STOCKDTL.LandCost) AS TotalCos, 
        Sum(STOCKDTL.QtyRecvd*STOCKDTL.Amount__) AS TotalPrc 
        FROM STOCKDTL,STOCKREC,LOCATION,ITEMLIST
        WHERE STOCKREC.CtrlNum_=STOCKDTL.CtrlNum_ 
        AND STOCKREC.WhseTo__=LOCATION.Location 
        AND STOCKDTL.ItemCode=ITEMLIST.ItemCode 
        AND ITEMLIST.BrandNum LIKE @cBrandNum 
        AND LOCATION.Location LIKE @cLocation 
        AND STOCKREC.Date____ >= LOCATION.BeginDte+1 
        AND STOCKREC.Date____ <= @dDateAsOf 
        AND LOCATION.Damaged_=0 
        AND STOCKREC.Disabled=0 
        AND LOCATION.Disabled=0 
        AND ITEMLIST.Services=0 
        AND ITEMLIST.Outright=1 
        GROUP BY LOCATION.LocaName
    ) AS SubResult
    GROUP BY LocaName
    ORDER BY 4 DESC
    `
  
    // Parameters object
    const params = {};
    if (cBrandNum) {
        params.cBrandNum = `%${cBrandNum}%`;
    }
    if (cLocation) {
        params.cLocation = `%${cLocation}%`;
    }
    if (dDateAsOf) {
        params.dDateAsOf = `${dDateAsOf}`;
    }
    
    
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
  
  module.exports = { StockEndingByLocation };
  