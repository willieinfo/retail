const { queryDatabase } = require('../DBConnect/dbConnect');

const SalesRankStore = async (req, res) => {
  const cBrandNum = req.query.BrandNum;
  const cUsersCde = req.query.UsersCde;
  const cOtherCde = req.query.OtherCde;
  const cCategNum = req.query.CategNum;
  const cItemDept = req.query.ItemDept;
  const cItemType = req.query.ItemType;
  const cStorNum_ = req.query.StorNum_;
  const dDateFrom = req.query.DateFrom;
  const dDateTo__ = req.query.DateTo__;


  // Constructing the base SQL query
  let cSql = `SELECT 
				STORE___.StorName,
				Max(SALESDTL.Date____) AS MaxiDate,
				Sum(SALESDTL.Quantity) AS Quantity,
				Sum(SALESDTL.ItemCost*SALESDTL.Quantity) AS ItemCost,
				Sum(SALESDTL.LandCost*SALESDTL.Quantity) AS LandCost,
				Sum((SALESDTL.Quantity*SALESDTL.Amount__)*SALESREC.ConcRate/100) AS Concessi,
				Sum(SALESDTL.ItemPrce*SALESDTL.Quantity) AS ItemPrce,
				Sum(SALESDTL.Amount__*SALESDTL.Quantity) AS Amount__ 
				FROM SALESREC, SALESDTL, STORE___, ITEMLIST
				WHERE SALESREC.CtrlNum_ = SALESDTL.CtrlNum_
				AND SALESREC.StorNum_ = STORE___.StorNum_
				AND ITEMLIST.ItemCode = SALESDTL.ItemCode
				AND SALESREC.Disabled = 0
				AND SALESDTL.Date____ >= @dDateFrom
				AND SALESDTL.Date____ <= @dDateTo__
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
  if (cStorNum_) {
    cSql += " AND STORE___.StorNum_ LIKE @cStorNum_";
    params.cStorNum_ = `%${cStorNum_}%`;
  }

  cSql += ` GROUP BY STORE___.StorName	
    ORDER BY 7 DESC `;

  if (dDateFrom) {
    params.dDateFrom = dDateFrom;
  }
  if (dDateTo__) {
    params.dDateTo__ = dDateTo__;
  }

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

module.exports = { SalesRankStore };
