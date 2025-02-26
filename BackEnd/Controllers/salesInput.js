const { queryDatabase } = require('../DBConnect/dbConnect');

const SalesLst = async (req, res) => {
  const cLocation = req.query.Location;
  const dDateFrom = req.query.DateFrom;
  const dDateTo__ = req.query.DateTo__;


  let cSql = `SELECT 
        SALESREC.CtrlNum_,
        SALESREC.ReferDoc,
        SALESREC.DateFrom,
        LOCATION.LocaName,
        Sum(SALESDTL.Amount__*SALESDTL.Quantity) AS Amount__ ,
        SALESREC.NoOfItem,
        SALESREC.Remarks_,
        SALESREC.Encoder_,
        SALESREC.Log_Date
        FROM SALESREC, SALESDTL, LOCATION
        WHERE SALESREC.CtrlNum_ = SALESDTL.CtrlNum_
        AND SALESREC.Location = LOCATION.Location
        AND SALESREC.Disabled = 0
        AND 1=1
        `

  // Parameters object
  const params = {};

  // Additional filters based on query parameters
  if (cLocation) {
    cSql += " AND SALESREC.Location LIKE @cLocation";
    params.cLocation = `%${cLocation}%`;
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
    SALESREC.CtrlNum_,
    SALESREC.ReferDoc,
    SALESREC.DateFrom,
    LOCATION.LocaName,
    SALESREC.NoOfItem,
    SALESREC.Remarks_,
    SALESREC.Encoder_,
    SALESREC.Log_Date
    ORDER BY 4,1,3 `;

  // Log SQL query and parameters for debugging
//   console.log('Parameters:', params);

  try {
    // Execute query
    const result = await queryDatabase(cSql, params);
    res.json(result);
  } catch (err) {
    console.error('Database query error:', err.message);  // Log the error message
    res.status(500).send('Error fetching sales data');
  }
};

module.exports = { SalesLst };
