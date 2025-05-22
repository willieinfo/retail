const { queryDatabase } = require('../../DBConnect/dbConnect');

const updateSalesTotals = async (req, res) => {
  const { cCtrlNum_, nTotalQty, nTotalPrc, nTotalAmt, nNoOfItem } = req.body;
  
  // console.log(cCtrlNum_, nTotalQty, nTotalPrc, nTotalAmt, nNoOfItem);
  if (!cCtrlNum_ || !nTotalQty || !nTotalPrc || !nTotalAmt || !nNoOfItem) {
      return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  const cSql = `
    UPDATE SALESREC SET
      Amount__=@nTotalAmt,
      Discount=@nTotalAmt,
      TotalQty=@nTotalQty,
      NoOfItem=@nNoOfItem
    WHERE CtrlNum_=@cCtrlNum_

    -- SCOPE_IDENTITY() has no function here
    -- This is just to return the full recordset
    DECLARE @AutIncId INT;
    SET @AutIncId = SCOPE_IDENTITY();

    -- Return the full record
    SELECT
      SALESREC.CtrlNum_,
      SALESREC.ReferDoc,
      SALESREC.DateFrom,
      LOCATION.LocaName,
      SALESREC.TotalQty,
      SALESREC.Amount__,
      SALESREC.NoOfItem,
      SALESREC.Remarks_,
      SALESREC.Encoder_,
      SALESREC.Location,
      SALESREC.Printed_,
      SALESREC.CustName,
      SALESREC.Disabled,
      SALESREC.Log_Date
    FROM SALESREC, LOCATION
    WHERE SALESREC.Location = LOCATION.Location
    AND SALESREC.CtrlNum_=@cCtrlNum_
  `;

  const params = { cCtrlNum_, nTotalQty, nTotalPrc, nTotalAmt, nNoOfItem };
  try {
    const result = await queryDatabase(cSql, params);
    // console.log(params)

    if (!result || result.length === 0) {
      res.status(404).json({ error: 'No records found' });
    } else {
      res.json(result);
    }
    
  } catch (err) {
    console.error('Update SALESREC Totals error:', err);
    res.status(500).json({ error: 'Error updating SALESREC' });
  }

}

const editSalesHeader = async (req, res) => {
  const { cCtrlNum_, cLocation, dDateFrom, cRemarks_, cCustName, lDisabled } = req.body;

  if (!cLocation || !dDateFrom || !cCtrlNum_) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const cSql = `
    UPDATE SALESREC SET
      Location=@cLocation,
      DateFrom=@dDateFrom,
      Remarks_=@cRemarks_,
      CustName=@cCustName,
      Disabled=@lDisabled
    WHERE CtrlNum_=@cCtrlNum_

    -- SCOPE_IDENTITY() has no function here
    -- This is just to return the full recordset
    DECLARE @AutIncId INT;
    SET @AutIncId = SCOPE_IDENTITY();
    
    -- Return the full record
    SELECT
      SALESREC.CtrlNum_,
      SALESREC.ReferDoc,
      SALESREC.DateFrom,
      LOCATION.LocaName,
      SALESREC.TotalQty,
      SALESREC.Amount__,
      SALESREC.NoOfItem,
      SALESREC.Remarks_,
      SALESREC.Encoder_,
      SALESREC.Location,
      SALESREC.Printed_,
      SALESREC.CustName,
      SALESREC.Disabled,
      SALESREC.Log_Date
    FROM SALESREC, LOCATION
    WHERE SALESREC.Location = LOCATION.Location
    AND SALESREC.CtrlNum_=@cCtrlNum_
  `;

  const params = { cCtrlNum_, cLocation, dDateFrom, cRemarks_, cCustName, lDisabled };
  try {
    const result = await queryDatabase(cSql, params);
    // console.log(params)

    if (!result || result.length === 0) {
      res.status(404).json({ error: 'No records found' });
    } else {
      res.json(result);
    }
    
  } catch (err) {
    console.error('Update SALESREC error:', err);
    res.status(500).json({ error: 'Error updating SALESREC' });
  }
}


const addSalesHeader = async (req, res) => {
  const { cCtrlNum_, cLocation, dDateFrom, cRemarks_, cEncoder_, 
    dLog_Date, nNoOfItem, cCustName, cSuffixId } = req.body;

  if (!cLocation || !dDateFrom || !cEncoder_) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const cSql = `
    -- Insert the new record into SALESREC and get the generated AutIncId
    INSERT INTO SALESREC
      (CtrlNum_, Location, DateFrom, DateTo__, Remarks_, Encoder_, 
      Log_Date, NoOfItem, CustName)
    VALUES
      (@cCtrlNum_, @cLocation, @dDateFrom, @dDateFrom, @cRemarks_, 
      @cEncoder_, @dLog_Date, @nNoOfItem, @cCustName);

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
      SALESREC.TotalQty,
      SALESREC.Amount__,
      SALESREC.NoOfItem,
      SALESREC.Remarks_,
      SALESREC.Encoder_,
      SALESREC.Location,
      SALESREC.Printed_,
      SALESREC.CustName,
      SALESREC.Disabled,
      SALESREC.Log_Date
    FROM SALESREC, LOCATION
    WHERE SALESREC.Location = LOCATION.Location
    AND SALESREC.AutIncId = @AutIncId
    ORDER BY LOCATION.LocaName, SALESREC.CtrlNum_, SALESREC.DateFrom
  `;

  const params = { cCtrlNum_, cLocation, dDateFrom, cRemarks_, cEncoder_, 
    dLog_Date, nNoOfItem, cCustName, cSuffixId };
  try {
    const result = await queryDatabase(cSql, params);
    // console.log(params)

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
  const dDateFrom = req.query.DateFrom;
  const dDateTo__ = req.query.DateTo__;
  const cLocation = req.query.Location;
  const cStoreGrp = req.query.StoreGrp;
  const cReferDoc = req.query.ReferDoc;

  let cSql = `SELECT 
      SALESREC.CtrlNum_,
      SALESREC.ReferDoc,
      SALESREC.DateFrom,
      LOCATION.LocaName,
      SALESREC.TotalQty,
      SALESREC.Amount__,
      SALESREC.NoOfItem,
      SALESREC.Remarks_,
      SALESREC.Encoder_,
      SALESREC.Location,
      SALESREC.Printed_,
      SALESREC.CustName,
      SALESREC.Disabled,
      SALESREC.Log_Date
    FROM SALESREC, LOCATION
    WHERE SALESREC.Location = LOCATION.Location
    AND 1=1
  `
  // Parameters object
  const params = {};

  // Additional filters based on query parameters
  if (dDateFrom) {
    cSql += " AND SALESREC.DateFrom >= @dDateFrom";
    params.dDateFrom = `${dDateFrom}`;
  }
  if (dDateTo__) {
    cSql += " AND SALESREC.DateFrom <= @dDateTo__";
    params.dDateTo__ = `${dDateTo__}`;
  }
  if (cLocation) {
    cSql += " AND SALESREC.Location LIKE @cLocation";
    params.cLocation = `%${cLocation}%`;
  }
  if (cStoreGrp) {
    cSql += " AND LOCATION.StoreGrp LIKE @cStoreGrp";
    params.cStoreGrp = `%${cStoreGrp}%`;
  }
  if (cReferDoc) {
    cSql += " AND SALESREC.ReferDoc LIKE @cReferDoc";
    params.cReferDoc = `%${cReferDoc}%`;
  }
  cSql += ` ORDER BY 1 `;

  // Log SQL query and parameters for debugging
  // console.log('Parameters:', params);

  try {
    // Execute query
    const result = await queryDatabase(cSql, params);
    res.json(result);
    // console.log(params)
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


const addSalesDetail = async (req, res) => {
  const { cCtrlNum_, cItemCode, dDate____, cTimeSale, 
      nQuantity, nItemPrce, nDiscRate, nAmount__, nLandCost, cSuffixId } = req.body;

  if (!cCtrlNum_ || !cItemCode || !dDate____ || !nQuantity) {
      return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Check the actual data type of RecordId
  const checkTypeSql = `
      SELECT DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'SALESDTL' AND COLUMN_NAME = 'RecordId';
  `;

  try {
      const typeResult = await queryDatabase(checkTypeSql);
      const dataType = typeResult[0]?.DATA_TYPE;

      const sqlInsert = `
          INSERT INTO SALESDTL
            (CtrlNum_, ItemCode, Date____, TimeSale, 
            Quantity, ItemPrce, DiscRate, Amount__, LandCost)
          VALUES
            (@cCtrlNum_, @cItemCode, @dDate____, @cTimeSale, 
            @nQuantity, @nItemPrce, @nDiscRate, @nAmount__, @nLandCost);
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

              UPDATE SALESDTL
              SET RecordId = @RecordId
              WHERE AutIncId = @AutIncId;
          `;
      }

      const fullRecordSet = `
          SELECT 
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
          FROM SALESDTL
          JOIN ITEMLIST ON SALESDTL.ItemCode = ITEMLIST.ItemCode
          WHERE SALESDTL.RecordId = @RecordId;
      `;

      const cSql = sqlInsert + sqlRecordId + fullRecordSet;

      const params = { cCtrlNum_, cItemCode, dDate____, cTimeSale, 
        nQuantity, nItemPrce, nDiscRate, nAmount__, nLandCost, cSuffixId };

      const result = await queryDatabase(cSql, params);

      if (!result || result.length === 0) {
          return res.status(404).json({ error: 'No records found' });
      } else {
          return res.json(result);
      }
      
  } catch (err) {
      console.error('Insert SALESDTL error:', err);
      return res.status(500).json({ error: 'Error inserting SALESDTL' });
  }
};

const editSalesDetail = async (req, res) => {
  const {cRecordId, cItemCode, nQuantity, nItemPrce, nDiscRate, nAmount__, nLandCost } = req.body;
  
  // console.log(cRecordId, cItemCode, nQuantity, nItemPrce, nDiscRate, nAmount__,nLandCost);

  if ( !cRecordId || !cItemCode || !nQuantity ) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const cSql = `
    UPDATE SALESDTL SET
      ItemCode=@cItemCode, 
      Quantity=@nQuantity, 
      ItemPrce=@nItemPrce, 
      DiscRate=@nDiscRate, 
      Amount__=@nAmount__, 
      LandCost=@nLandCost
    WHERE RecordId=@cRecordId
  
    DECLARE @RecordId INT;
    SET @RecordId = SCOPE_IDENTITY();

    -- Return the full record
    SELECT 
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
        FROM SALESDTL, ITEMLIST
        WHERE SALESDTL.ItemCode = ITEMLIST.ItemCode
        AND SALESDTL.RecordId = @cRecordId
  `;

  const params = { cRecordId, cItemCode, nQuantity, nItemPrce, nDiscRate, nAmount__, nLandCost };
  // console.log(params)

  try {
    const result = await queryDatabase(cSql, params);

    if (!result || result.length === 0) {
      res.status(404).json({ error: 'No records found' });
    } else {
      res.json(result);
    }
    
  } catch (err) {
      console.error('Update SALESDTL error:', err);
      res.status(500).json({ error: 'Error updating SALESDTL' });
  }

}

const deleteSalesDetail = async (req, res) => {
  const { id } = req.params;  // Read id from URL params

  if (!id) {
    return res.status(400).json({ error: 'Missing required parameter: id' });
  }

  cSql = `DELETE FROM SALESDTL WHERE RecordId=@id`;
  const params = { id };

  try {
    const deleteResult = await queryDatabase(cSql, params);
    return res.json({ message: 'SalesDtl deleted successfully', rowsAffected: deleteResult });
  } catch (err) {
    console.error('Delete SALESDTL error:', err);
    return res.status(500).json({ error: 'Error deleting SalesDtl' });
  }

};


module.exports = { SalesRecLst, SalesDtlLst, addSalesHeader, editSalesHeader, 
  addSalesDetail, editSalesDetail, updateSalesTotals, deleteSalesDetail };
