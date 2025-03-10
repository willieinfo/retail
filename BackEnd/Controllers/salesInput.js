const { queryDatabase } = require('../DBConnect/dbConnect');

const addSalesHeader = async (req, res) => {
  const { cCtrlNum_, cLocation, dDateFrom, cRemarks_, cEncoder_, 
    dLog_Date, nNoOfItem, cSuffixId } = req.body;

  if (!cLocation || !dDateFrom || !cEncoder_) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const cSql = `
    -- Insert the new record into SALESREC and get the generated AutIncId
    INSERT INTO SALESREC
      (CtrlNum_, Location, DateFrom, DateTo__, Remarks_, Encoder_, 
      Log_Date, NoOfItem)
    VALUES
      (@cCtrlNum_, @cLocation, @dDateFrom, @dDateFrom, @cRemarks_, 
      @cEncoder_, @dLog_Date, @nNoOfItem);

    -- Get the last inserted AutIncId
    DECLARE @AutIncId INT;
    SET @AutIncId = SCOPE_IDENTITY();

    -- Dynamically generate the next CtrlNum_ based on AutIncId and cSuffixId
    DECLARE @CtrlNum_ VARCHAR(11);
    SET @CtrlNum_ = RIGHT('00000000000' + CAST(@AutIncId AS VARCHAR(10)), 10) + RTRIM(@cSuffixId);

    -- Update the CtrlNum_ field with the new value
    UPDATE SALESREC
    SET CtrlNum_ = @CtrlNum_
    WHERE AutIncId = @AutIncId;

    -- Dynamically generate the next ReferDoc based on Location
    DECLARE @PrevReferDoc VARCHAR(10);
    DECLARE @NewReferDoc VARCHAR(10);
    
    -- Find the latest ReferDoc for the given Location
    SELECT @PrevReferDoc = MAX(ReferDoc)
    FROM SALESREC
    WHERE LTRIM(RTRIM(Location)) = LTRIM(RTRIM(@cLocation));

    PRINT 'PrevReferDoc: ' + ISNULL(@PrevReferDoc, 'NULL');

    -- Generate new ReferDoc (increment the numeric part of the previous ReferDoc)
    IF @PrevReferDoc IS NOT NULL
      BEGIN
        -- Extract numeric part of the last ReferDoc and increment by 1
        SET @NewReferDoc = RIGHT(REPLICATE('0', 10) + CAST(CAST(SUBSTRING(@PrevReferDoc, 1, 10) AS INT) + 1 AS VARCHAR(10)), 10);
      END
    ELSE
      BEGIN
        -- If no previous ReferDoc exists for the Location, start with 1
        SET @NewReferDoc = RIGHT('0000000001', 10);
      END

    -- Update the ReferDoc field with the new value
    UPDATE SALESREC
    SET ReferDoc = @NewReferDoc
    WHERE AutIncId = @AutIncId;

    -- Return the full record
    SELECT
      SALESREC.CtrlNum_,
      SALESREC.ReferDoc,
      SALESREC.DateFrom,
      LOCATION.LocaName,
      SALESREC.Amount__,
      SALESREC.NoOfItem,
      SALESREC.Remarks_,
      SALESREC.Encoder_,
      SALESREC.Location,
      SALESREC.Log_Date
    FROM SALESREC, LOCATION
    WHERE SALESREC.Location = LOCATION.Location
    AND SALESREC.AutIncId = @AutIncId
    ORDER BY LOCATION.LocaName, SALESREC.CtrlNum_, SALESREC.DateFrom
  `;

  const params = { cCtrlNum_, cLocation, dDateFrom, cRemarks_, cEncoder_, 
    dLog_Date, nNoOfItem, cSuffixId };
  try {
    const result = await queryDatabase(cSql, params);
    console.log(params)

    if (!result || result.length === 0) {
      res.status(404).json({ error: 'No records found' });
    } else {
      res.json(result);
    }
    
  } catch (err) {
    console.error('Insert SALESREC error:', err);
    res.status(500).json({ error: 'Error inserting SALESREC' });
  }

}

// SELECT TOP 1 @PrevReferDoc = ReferDoc
// FROM SALESREC
// WHERE LTRIM(RTRIM(Location)) = LTRIM(RTRIM(@cLocation))
// ORDER BY AutIncId DESC;



const SalesRecLst = async (req, res) => {
  const cLocation = req.query.Location;
  const dDateFrom = req.query.DateFrom;
  const dDateTo__ = req.query.DateTo__;

  let cSql = `SELECT 
      SALESREC.CtrlNum_,
      SALESREC.ReferDoc,
      SALESREC.DateFrom,
      LOCATION.LocaName,
      SALESREC.Amount__,
      SALESREC.NoOfItem,
      SALESREC.Remarks_,
      SALESREC.Encoder_,
      SALESREC.Location,
      SALESREC.Log_Date
    FROM SALESREC, LOCATION
    WHERE SALESREC.Location = LOCATION.Location
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
    cSql += " AND SALESREC.DateFrom >= @dDateFrom";
    params.dDateFrom = `${dDateFrom}`;
  }
  if (dDateTo__) {
    cSql += " AND SALESREC.DateFrom <= @dDateTo__";
    params.dDateTo__ = `${dDateTo__}`;
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
    res.status(500).send('Error fetching sales data');
  }
};

const SalesDtlLst = async (req, res) => {
  const cCtrlNum_ = req.query.CtrlNum_;

  let cSql = `SELECT 
        SALESDTL.RecordId,
        SALESDTL.CtrlNum_,
        SALESDTL.ItemCode,
        ITEMLIST.UsersCde,
        ITEMLIST.OtherCde,
        ITEMLIST.Descript,
        SALESDTL.Quantity,
        SALESDTL.ItemPrce,
        SALESDTL.DiscRate,
        SALESDTL.Amount__,
        SALESDTL.LandCost
        FROM SALESREC, SALESDTL, ITEMLIST
        WHERE SALESREC.CtrlNum_ = SALESDTL.CtrlNum_
        AND SALESDTL.ItemCode = ITEMLIST.ItemCode
        AND 1=1
        `

  // Parameters object
  const params = {};

  // Additional filters based on query parameters
  if (cCtrlNum_) {
    cSql += " AND SALESREC.CtrlNum_ LIKE @cCtrlNum_";
    params.cCtrlNum_ = `%${cCtrlNum_}%`;
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
    res.status(500).send('Error fetching sales data');
  }
};

module.exports = { SalesRecLst, SalesDtlLst, addSalesHeader };
