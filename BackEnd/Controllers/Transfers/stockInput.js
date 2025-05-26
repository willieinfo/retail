const { queryDatabase } = require('../../DBConnect/dbConnect');

const updateStockTotals = async (req, res) => {
  const { cCtrlNum_, nTotalQty, nTotalRcv, nTotalAmt, nNoOfItem } = req.body;
  
  // console.log(cCtrlNum_, nTotalQty, nTotalPrc, nTotalAmt, nNoOfItem);
  if (!cCtrlNum_ || !nTotalQty || !nTotalRcv || !nTotalAmt || !nNoOfItem) {
      return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  const cSql = `
    UPDATE STOCKREC SET
      Amount__=@nTotalAmt,
      TotalQty=@nTotalQty,
      TotalRcv=@nTotalRcv,
      NoOfItem=@nNoOfItem
    WHERE CtrlNum_=@cCtrlNum_

    -- SCOPE_IDENTITY() has no function here
    -- This is just to return the full recordset
    DECLARE @AutIncId INT;
    SET @AutIncId = SCOPE_IDENTITY();

    -- Return the full record
    SELECT
        STOCKREC.CtrlNum_,
        STOCKREC.ReferDoc,
        STOCKREC.Date____,
        STOCKREC.DateRcvd,
        LOC1.LocaName AS LocaFrom,
        LOC2.LocaName AS LocaTo__,
        STOCKREC.TotalQty,
        STOCKREC.TotalRcv,
        STOCKREC.Amount__,
        STOCKREC.NoOfItem,
        STOCKREC.Remarks_,
        STOCKREC.Encoder_,
        STOCKREC.WhseFrom,
        STOCKREC.WhseTo__,
        STOCKREC.Printed_,
        STOCKREC.Prepared,
        STOCKREC.Received,
        STOCKREC.Disabled,
        STOCKREC.Log_Date
    FROM STOCKREC
    FULL JOIN LOCATION LOC1 ON STOCKREC.WhseFrom = LOC1.Location
    FULL JOIN LOCATION LOC2 ON STOCKREC.WhseTo__ = LOC2.Location
    WHERE STOCKREC.CtrlNum_=@cCtrlNum_
  `;

  const params = { cCtrlNum_, nTotalQty, nTotalRcv, nTotalAmt, nNoOfItem };
  try {
    const result = await queryDatabase(cSql, params);
    // console.log(params)

    if (!result || result.length === 0) {
      res.status(404).json({ error: 'No records found' });
    } else {
      res.json(result);
    }
    
  } catch (err) {
    console.error('Update STOCKREC Totals error:', err);
    res.status(500).json({ error: 'Error updating STOCKREC' });
  }

}

const editStockHeader = async (req, res) => {
  const { cCtrlNum_, cWhseFrom, cWhseTo__, dDate____, dDateRcvd, cRemarks_, cPrepared, cReceived, lDisabled } = req.body;

  if (!cWhseFrom || !dDate____ || !cCtrlNum_) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const cSql = `
    UPDATE STOCKREC SET
      WhseFrom=@cWhseFrom,
      WhseTo__=@cWhseTo__,
      Date____=@dDate____,
      DateRcvd=@dDateRcvd,
      Remarks_=@cRemarks_,
      Prepared=@cPrepared,
      Received=@cReceived,
      Disabled=@lDisabled
    WHERE CtrlNum_=@cCtrlNum_

    -- SCOPE_IDENTITY() has no function here
    -- This is just to return the full recordset
    DECLARE @AutIncId INT;
    SET @AutIncId = SCOPE_IDENTITY();
    
    -- Return the full record
    SELECT
        STOCKREC.CtrlNum_,
        STOCKREC.ReferDoc,
        STOCKREC.Date____,
        STOCKREC.DateRcvd,
        LOC1.LocaName AS LocaFrom,
        LOC2.LocaName AS LocaTo__,
        STOCKREC.TotalQty,
        STOCKREC.TotalRcv,
        STOCKREC.Amount__,
        STOCKREC.NoOfItem,
        STOCKREC.Remarks_,
        STOCKREC.Encoder_,
        STOCKREC.WhseFrom,
        STOCKREC.WhseTo__,
        STOCKREC.Printed_,
        STOCKREC.Prepared,
        STOCKREC.Received,
        STOCKREC.Disabled,
        STOCKREC.Log_Date
    FROM STOCKREC
    FULL JOIN LOCATION LOC1 ON STOCKREC.WhseFrom = LOC1.Location
    FULL JOIN LOCATION LOC2 ON STOCKREC.WhseTo__ = LOC2.Location
    WHERE STOCKREC.CtrlNum_=@cCtrlNum_
  `;

  const params = { cCtrlNum_, cWhseFrom, cWhseTo__, dDate____, dDateRcvd, cRemarks_, cPrepared, cReceived, lDisabled };
  try {
    const result = await queryDatabase(cSql, params);
    // console.log(params)

    if (!result || result.length === 0) {
      res.status(404).json({ error: 'No records found' });
    } else {
      res.json(result);
    }
    
  } catch (err) {
    console.error('Update STOCKREC error:', err);
    res.status(500).json({ error: 'Error updating STOCKREC' });
  }
}


const addStockHeader = async (req, res) => {
  const { cCtrlNum_, cWhseFrom, cWhseTo__, dDate____, dDateRcvd, cRemarks_, cEncoder_,
    dLog_Date, nNoOfItem, cPrepared, cReceived, cSuffixId } = req.body;

  if (!cWhseFrom || !dDate____ || !cEncoder_) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const cSql = `
    -- Insert the new record into STOCKREC and get the generated AutIncId
    INSERT INTO STOCKREC
      (CtrlNum_, WhseFrom, WhseTo__, Date____, DateRcvd, Remarks_, Encoder_,
    Log_Date, NoOfItem, Prepared, Received)
    VALUES
      (@cCtrlNum_, @cWhseFrom, @cWhseTo__, @dDate____, @dDateRcvd, @cRemarks_, @cEncoder_,
    @dLog_Date, @nNoOfItem, @cPrepared, @cReceived);

    -- Get the last inserted AutIncId
    DECLARE @AutIncId INT;
    SET @AutIncId = SCOPE_IDENTITY();

    -- Dynamically generate the next CtrlNum_ based on AutIncId and cSuffixId
    DECLARE @CtrlNum_ VARCHAR(11);
    SET @CtrlNum_ = RIGHT('00000000000' + CAST(@AutIncId AS VARCHAR(10)), 10) + RTRIM(@cSuffixId);

    -- Update the CtrlNum_ field with the new value
    UPDATE STOCKREC
    SET CtrlNum_ = @CtrlNum_
    WHERE AutIncId = @AutIncId;

    -- Dynamically generate the next ReferDoc based on Location
    DECLARE @PrevReferDoc VARCHAR(10);
    DECLARE @NewReferDoc VARCHAR(10);
    
    -- Find the latest ReferDoc for the given Location
    SELECT @PrevReferDoc = MAX(ReferDoc)
    FROM STOCKREC
    WHERE LTRIM(RTRIM(WhseFrom)) = LTRIM(RTRIM(@cWhseFrom));

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
    UPDATE STOCKREC
    SET ReferDoc = @NewReferDoc
    WHERE AutIncId = @AutIncId;

    -- Return the full record
    SELECT
        STOCKREC.CtrlNum_,
        STOCKREC.ReferDoc,
        STOCKREC.Date____,
        STOCKREC.DateRcvd,
        LOC1.LocaName AS LocaFrom,
        LOC2.LocaName AS LocaTo__,
        STOCKREC.TotalQty,
        STOCKREC.TotalRcv,
        STOCKREC.Amount__,
        STOCKREC.NoOfItem,
        STOCKREC.Remarks_,
        STOCKREC.Encoder_,
        STOCKREC.WhseFrom,
        STOCKREC.WhseTo__,
        STOCKREC.Printed_,
        STOCKREC.Prepared,
        STOCKREC.Received,
        STOCKREC.Disabled,
        STOCKREC.Log_Date
    FROM STOCKREC
    FULL JOIN LOCATION LOC1 ON STOCKREC.WhseFrom = LOC1.Location
    FULL JOIN LOCATION LOC2 ON STOCKREC.WhseTo__ = LOC2.Location
    WHERE STOCKREC.AutIncId = @AutIncId
    ORDER BY 5, 1, 3
  `;

  const params = { cCtrlNum_, cWhseFrom, cWhseTo__, dDate____, dDateRcvd, cRemarks_, cEncoder_,
    dLog_Date, nNoOfItem, cPrepared, cReceived, cSuffixId };
  try {
    const result = await queryDatabase(cSql, params);
    console.log(params)

    if (!result || result.length === 0) {
      res.status(404).json({ error: 'No records found' });
    } else {
      res.json(result);
    }
    
  } catch (err) {
    console.error('Insert STOCKREC error:', err);
    res.status(500).json({ error: 'Error inserting STOCKREC' });
  }

}

// SELECT TOP 1 @PrevReferDoc = ReferDoc
// FROM STOCKREC
// WHERE LTRIM(RTRIM(Location)) = LTRIM(RTRIM(@cLocation))
// ORDER BY AutIncId DESC;

const StockRecLst = async (req, res) => {
  const cWhseFrom = req.query.WhseFrom;
  const dDateFrom = req.query.DateFrom;
  const dDateTo__ = req.query.DateTo__;
  const cReferDoc = req.query.ReferDoc;

  // let cSql = `SELECT 
  //     STOCKREC.CtrlNum_,
  //     STOCKREC.ReferDoc,
  //     STOCKREC.Date____,
  //     STOCKREC.DateRcvd,
  //     LOCATION.LocaName,
  //     STOCKREC.TotalQty,
  //     STOCKREC.TotalRcv,
  //     STOCKREC.Amount__,
  //     STOCKREC.NoOfItem,
  //     STOCKREC.Remarks_,
  //     STOCKREC.Encoder_,
  //     STOCKREC.WhseFrom,
  //     STOCKREC.WhseTo__,
  //     STOCKREC.Printed_,
  //     STOCKREC.Prepared,
  //     STOCKREC.Received,
  //     STOCKREC.Disabled,
  //     STOCKREC.Log_Date
  //   FROM STOCKREC, LOCATION
  //   WHERE STOCKREC.WhseFrom = LOCATION.Location
  //   AND 1=1
  // `
  let cSql=`SELECT
        STOCKREC.CtrlNum_,
        STOCKREC.ReferDoc,
        STOCKREC.Date____,
        STOCKREC.DateRcvd,
        LOC1.LocaName AS LocaFrom,
        LOC2.LocaName AS LocaTo__,
        STOCKREC.TotalQty,
        STOCKREC.TotalRcv,
        STOCKREC.Amount__,
        STOCKREC.NoOfItem,
        STOCKREC.Remarks_,
        STOCKREC.Encoder_,
        STOCKREC.WhseFrom,
        STOCKREC.WhseTo__,
        STOCKREC.Printed_,
        STOCKREC.Prepared,
        STOCKREC.Received,
        STOCKREC.Disabled,
        STOCKREC.Log_Date
    FROM STOCKREC
    FULL JOIN LOCATION LOC1 ON STOCKREC.WhseFrom = LOC1.Location
    FULL JOIN LOCATION LOC2 ON STOCKREC.WhseTo__ = LOC2.Location
    WHERE 1=1
  `

  // Parameters object
  const params = {};

  // Additional filters based on query parameters
  if (cWhseFrom) {
    cSql += " AND STOCKREC.WhseFrom LIKE @cWhseFrom";
    params.cWhseFrom = `%${cWhseFrom}%`;
  }
  if (dDateFrom) {
    cSql += " AND STOCKREC.Date____ >= @dDateFrom";
    params.dDateFrom = `${dDateFrom}`;
  }
  if (dDateTo__) {
    cSql += " AND STOCKREC.Date____ <= @dDateTo__";
    params.dDateTo__ = `${dDateTo__}`;
  }
  if (cReferDoc) {
    cSql += " AND STOCKREC.ReferDoc LIKE @cReferDoc";
    params.cReferDoc = `%${cReferDoc}%`;
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

const StockDtlLst = async (req, res) => {
  const cCtrlNum_ = req.query.CtrlNum_;

  let cSql = `SELECT 
        STOCKDTL.RecordId,
        STOCKDTL.CtrlNum_,
        STOCKDTL.ItemCode,
        ITEMLIST.UsersCde,
        ITEMLIST.OtherCde,
        ITEMLIST.Descript,
        STOCKDTL.Quantity,
        STOCKDTL.QtyRecvd,
        STOCKDTL.Amount__,
        STOCKDTL.LandCost
        FROM STOCKREC, STOCKDTL, ITEMLIST
        WHERE STOCKREC.CtrlNum_ = STOCKDTL.CtrlNum_
        AND STOCKDTL.ItemCode = ITEMLIST.ItemCode
        AND 1=1
        `

  // Parameters object
  const params = {};

  // Additional filters based on query parameters
  if (cCtrlNum_) {
    cSql += " AND STOCKREC.CtrlNum_ LIKE @cCtrlNum_";
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


const addStockDetail = async (req, res) => {
  const { cCtrlNum_,cItemCode,nQuantity,nQtyRecvd,nAmount__,nLandCost,cSuffixId } = req.body;
  
  if (!cCtrlNum_ || !cItemCode || !nQuantity) {
      return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Check the actual data type of RecordId
  const checkTypeSql = `
      SELECT DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'STOCKDTL' AND COLUMN_NAME = 'RecordId';
  `;

  try {
      const typeResult = await queryDatabase(checkTypeSql);
      const dataType = typeResult[0]?.DATA_TYPE;

      const sqlInsert = `
          INSERT INTO STOCKDTL
            (CtrlNum_, ItemCode, Quantity, QtyRecvd, Amount__, LandCost)
          VALUES
            (@cCtrlNum_, @cItemCode, @nQuantity, @nQtyRecvd,  @nAmount__, @nLandCost);
      `;

      let sqlRecordId = '';
      if (dataType === 'int' || dataType === 'bigint' || dataType === 'smallint') {
          sqlRecordId = `
              DECLARE @RecordId INT;
              SET @RecordId = SCOPE_IDENTITY();
          `;
      } else {
          sqlRecordId = `
              DECLARE @AutIncId INT;
              SET @AutIncId = SCOPE_IDENTITY();

              DECLARE @RecordId VARCHAR(12);
              SET @RecordId = RIGHT('00000000000' + CAST(@AutIncId AS VARCHAR(10)), 10) + RTRIM(@cSuffixId);

              UPDATE STOCKDTL
              SET RecordId = @RecordId
              WHERE AutIncId = @AutIncId;
          `;
      }

      const fullRecordSet = `
          SELECT 
              STOCKDTL.RecordId,
              STOCKDTL.CtrlNum_,
              STOCKDTL.ItemCode,
              ITEMLIST.UsersCde,
              ITEMLIST.OtherCde,
              ITEMLIST.Descript,
              STOCKDTL.Quantity,
              STOCKDTL.QtyRecvd,
              STOCKDTL.Amount__,
              STOCKDTL.LandCost
          FROM STOCKDTL
          JOIN ITEMLIST ON STOCKDTL.ItemCode = ITEMLIST.ItemCode
          WHERE STOCKDTL.RecordId = @RecordId;
      `;

      const cSql = sqlInsert + sqlRecordId + fullRecordSet;

      const params = { cCtrlNum_, cItemCode, nQuantity, nQtyRecvd, nAmount__, nLandCost, cSuffixId };

      const result = await queryDatabase(cSql, params);

      if (!result || result.length === 0) {
          return res.status(404).json({ error: 'No records found' });
      } else {
          return res.json(result);
      }
      
  } catch (err) {
      console.error('Insert STOCKDTL error:', err);
      return res.status(500).json({ error: 'Error inserting STOCKDTL' });
  }
};

const editStockDetail = async (req, res) => {
  const {cRecordId, cItemCode, nQuantity, nQtyRecvd, nAmount__, nLandCost } = req.body;
  
  if ( !cRecordId || !cItemCode || !nQuantity ) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const cSql = `
    UPDATE STOCKDTL SET
      ItemCode=@cItemCode, 
      Quantity=@nQuantity, 
      QtyRecvd=@nQtyRecvd, 
      Amount__=@nAmount__, 
      LandCost=@nLandCost
    WHERE RecordId=@cRecordId
  
    DECLARE @RecordId INT;
    SET @RecordId = SCOPE_IDENTITY();

    -- Return the full record
    SELECT 
        STOCKDTL.RecordId,
        STOCKDTL.CtrlNum_,
        STOCKDTL.ItemCode,
        ITEMLIST.UsersCde,
        ITEMLIST.OtherCde,
        ITEMLIST.Descript,
        STOCKDTL.Quantity,
        STOCKDTL.QtyRecvd,
        STOCKDTL.Amount__,
        STOCKDTL.LandCost
        FROM STOCKDTL, ITEMLIST
        WHERE STOCKDTL.ItemCode = ITEMLIST.ItemCode
        AND STOCKDTL.RecordId = @cRecordId
  `;

  const params = { cRecordId, cItemCode, nQuantity, nQtyRecvd, nAmount__, nLandCost };
  // console.log(params)

  try {
    const result = await queryDatabase(cSql, params);

    if (!result || result.length === 0) {
      res.status(404).json({ error: 'No records found' });
    } else {
      res.json(result);
    }
    
  } catch (err) {
      console.error('Update STOCKDTL error:', err);
      res.status(500).json({ error: 'Error updating STOCKDTL' });
  }

}

const deleteStockDetail = async (req, res) => {
  const { id } = req.params;  // Read id from URL params

  if (!id) {
    return res.status(400).json({ error: 'Missing required parameter: id' });
  }

  cSql = `DELETE FROM STOCKDTL WHERE RecordId=@id`;
  const params = { id };

  try {
    const deleteResult = await queryDatabase(cSql, params);
    return res.json({ message: 'StockDtl deleted successfully', rowsAffected: deleteResult });
  } catch (err) {
    console.error('Delete STOCKDTL error:', err);
    return res.status(500).json({ error: 'Error deleting SalesDtl' });
  }

};


module.exports = { StockRecLst, StockDtlLst, addStockHeader, editStockHeader, 
  addStockDetail, editStockDetail, updateStockTotals, deleteStockDetail };