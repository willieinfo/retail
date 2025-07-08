const { queryDatabase } = require('../../DBConnect/dbConnect');

const StockTraDetails = async (req, res) => {
  const cLocaFrom = req.query.LocaFrom;
  const cLocaTo__ = req.query.LocaTo__;
  const dDateFrom = req.query.DateFrom;
  const dDateTo__ = req.query.DateTo__;
  const cUsersCde = req.query.UsersCde;
  const cOtherCde = req.query.OtherCde;
  const cDescript = req.query.Descript;
  const cBrandNum = req.query.BrandNum;
  const cCategNum = req.query.CategNum;
  const cItemType = req.query.ItemType;
  const cItemDept = req.query.ItemDept;
  
  let cSql=`SELECT
        STOCKREC.CtrlNum_,
        STOCKREC.ReferDoc,
        STOCKREC.Date____,
        STOCKREC.DateRcvd,
        LOC1.LocaName AS LocaFrom,
        LOC2.LocaName AS LocaTo__,
        STOCKREC.Remarks_,
        STOCKREC.Encoder_,
        STOCKREC.Prepared,
        STOCKREC.Received,
        STOCKDTL.RecordId,
        BRAND___.BrandNme,
        ITEMLIST.Outright,
        ITEMTYPE.Descript AS TypeDesc,
        ITEMLIST.UsersCde,
        ITEMLIST.OtherCde,
        ITEMLIST.Descript,
        STOCKDTL.Quantity,
        STOCKDTL.QtyRecvd,
        STOCKDTL.Amount__,
        STOCKDTL.LandCost
    FROM STOCKREC
    FULL JOIN LOCATION LOC1 ON STOCKREC.WhseFrom = LOC1.Location
    FULL JOIN LOCATION LOC2 ON STOCKREC.WhseTo__ = LOC2.Location
    JOIN STOCKDTL ON STOCKDTL.CtrlNum_ = STOCKREC.CtrlNum_
    JOIN ITEMLIST ON ITEMLIST.ItemCode = STOCKDTL.ItemCode
    JOIN BRAND___ ON BRAND___.BrandNum = ITEMLIST.BrandNum
    JOIN ITEMTYPE ON ITEMTYPE.ItemType = ITEMLIST.ItemType
    WHERE STOCKREC.Disabled = 0
  `

  // Parameters object
  const params = {};

  // Additional filters based on query parameters
  if (dDateFrom) {
    cSql += " AND STOCKREC.Date____ >= @dDateFrom";
    params.dDateFrom = `${dDateFrom}`;
  }
  if (dDateTo__) {
    cSql += " AND STOCKREC.Date____ <= @dDateTo__";
    params.dDateTo__ = `${dDateTo__}`;
  }
  if (cLocaFrom) {
    cSql += " AND LOC1.LocaName LIKE @cLocaFrom";
    params.cLocaFrom = `%${cLocaFrom}%`;
  }
  if (cLocaTo__) {
    cSql += " AND LOC2.LocaName LIKE @cLocaTo__";
    params.cLocaTo__ = `%${cLocaTo__}%`;
  }
  if (cUsersCde) {
    cSql += " AND ITEMLIST.UsersCde LIKE @cUsersCde";
    params.cUsersCde = `%${cUsersCde}%`;
  }
  if (cOtherCde) {
    cSql += " AND ITEMLIST.OtherCde LIKE @cOtherCde";
    params.cOtherCde = `%${cOtherCde}%`;
  }
  if (cDescript) {
    cSql += " AND ITEMLIST.Descript LIKE @cDescript";
    params.cDescript = `%${cDescript}%`;
  }
  if (cBrandNum) {
    cSql += " AND ITEMLIST.BrandNum LIKE @cBrandNum";
    params.cBrandNum = `%${cBrandNum}%`;
  }
  if (cCategNum) {
    cSql += " AND ITEMLIST.CategNum LIKE @cCategNum";
    params.cCategNum = `%${cCategNum}%`;
  }
  if (cItemType) {
    cSql += " AND ITEMLIST.ItemType LIKE @cItemType";
    params.cItemType = `%${cItemType}%`;
  }
  if (cItemDept) {
    cSql += " AND ITEMLIST.ItemDept LIKE @cItemDept";
    params.cItemDept = `%${cItemDept}%`;
  }

  cSql += ` ORDER BY 1 `;

  // Log SQL query and parameters for debugging
  // console.log('Parameters:', params);

  try {
    // Execute query
    const result = await queryDatabase(cSql, params);
    res.json(result);
  } catch (err) {
    console.error('Database query error:', err.message);  // Log the error message
    res.status(500).send('Error fetching stock transfer report');
  }
};

module.exports = {StockTraDetails}