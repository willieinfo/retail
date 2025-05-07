const { queryDatabase } = require('../DBConnect/dbConnect');

const updatePurchTotals = async (req, res) => {
  const { cCtrlNum_, nTotalQty, nTotalCos, nTotalSRP, nNoOfItem } = req.body;
  
  // console.log(cCtrlNum_, nTotalQty, nTotalCos, nTotalSRP, nNoOfItem);
  if (!cCtrlNum_ || !nTotalQty || !nTotalCos || !nNoOfItem) {
      return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  const cSql = `
    UPDATE PURCHREC SET
      Amount__=@nTotalCos,
      TotalSRP=@nTotalSRP,
      TotalQty=@nTotalQty,
      NoOfItem=@nNoOfItem
    WHERE CtrlNum_=@cCtrlNum_

    -- SCOPE_IDENTITY() has no function here
    -- This is just to return the full recordset
    DECLARE @AutIncId INT;
    SET @AutIncId = SCOPE_IDENTITY();

    -- Return the full record
    SELECT
      PURCHREC.CtrlNum_,
      PURCHREC.ReferDoc,
      PURCHREC.Date____,
      PURCHREC.DRNum___,
      PURCHREC.DR__Date,
      PURCHREC.PONum___,
      PURCHREC.PODate__,
      LOCATION.LocaName,
      PURCHREC.Location,
      PURCHREC.TotalQty,
      PURCHREC.Amount__,
      PURCHREC.NoOfItem,
      PURCHREC.Remarks_,
      PURCHREC.Encoder_,
      PURCHREC.Printed_,
      PURCHREC.Disabled,
      SUPPLIER.SuppName,
      PURCHREC.SuppNum_,
      PURCHREC.Log_Date
    FROM PURCHREC LEFT JOIN SUPPLIER
    ON PURCHREC.SuppNum_ = SUPPLIER.SuppNum_ , LOCATION
    WHERE PURCHREC.Location = LOCATION.Location
    AND PURCHREC.CtrlNum_=@cCtrlNum_
  `;

  const params = { cCtrlNum_, nTotalQty, nTotalCos, nTotalSRP, nNoOfItem  };
  try {
    const result = await queryDatabase(cSql, params);
    // console.log(params)

    if (!result || result.length === 0) {
      res.status(404).json({ error: 'No records found' });
    } else {
      res.json(result);
    }
    
  } catch (err) {
    console.error('Update PURCHREC Totals error:', err);
    res.status(500).json({ error: 'Error updating PURCHREC' });
  }

}

const editPurchHeader = async (req, res) => {
  const { cCtrlNum_, cLocation, cSuppNum_, dDate____, cDRNum___, dDR__Date,
    cPONum___, dPODate__, cRemarks_, lDisabled } = req.body;
  if (!cLocation || !dDate____ || !cCtrlNum_) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const cSql = `
    UPDATE PURCHREC SET
      Location=@cLocation,
      SuppNum_=@cSuppNum_,
      Date____=@dDate____,
      DRNum___=@cDRNum___,
      DR__Date=@dDR__Date,
      PONum___=@cPONum___,
      PODate__=@dPODate__,
      Remarks_=@cRemarks_,
      Disabled=@lDisabled
    WHERE CtrlNum_=@cCtrlNum_

    -- SCOPE_IDENTITY() has no function here
    -- This is just to return the full recordset
    DECLARE @AutIncId INT;
    SET @AutIncId = SCOPE_IDENTITY();
    
    -- Return the full record
    SELECT
      PURCHREC.CtrlNum_,
      PURCHREC.ReferDoc,
      PURCHREC.Date____,
      PURCHREC.DRNum___,
      PURCHREC.DR__Date,
      PURCHREC.PONum___,
      PURCHREC.PODate__,
      LOCATION.LocaName,
      PURCHREC.Location,
      PURCHREC.TotalQty,
      PURCHREC.Amount__,
      PURCHREC.NoOfItem,
      PURCHREC.Remarks_,
      PURCHREC.Encoder_,
      PURCHREC.Printed_,
      PURCHREC.Disabled,
      SUPPLIER.SuppName,
      PURCHREC.SuppNum_,
      PURCHREC.Log_Date
    FROM PURCHREC LEFT JOIN SUPPLIER
    ON PURCHREC.SuppNum_ = SUPPLIER.SuppNum_ , LOCATION
    WHERE PURCHREC.Location = LOCATION.Location
    AND PURCHREC.CtrlNum_=@cCtrlNum_
  `;

  const params = { cCtrlNum_, cLocation, cSuppNum_, dDate____, cDRNum___, dDR__Date,
    cPONum___, dPODate__, cRemarks_, lDisabled };
  try {
    const result = await queryDatabase(cSql, params);
    // console.log(params)

    if (!result || result.length === 0) {
      res.status(404).json({ error: 'No records found' });
    } else {
      res.json(result);
    }
    
  } catch (err) {
    console.error('Update PURCHREC error:', err);
    res.status(500).json({ error: 'Error updating PURCHREC' });
  }
}


const addPurchHeader = async (req, res) => {
  const { cCtrlNum_, cLocation, cSuppNum_, dDate____, cDRNum___, dDR__Date,
    cPONum___, dPODate__, cRemarks_, nNoOfItem, cEncoder_, dLog_Date, cSuffixId } = req.body;

  if (!cLocation || !dDate____ || !cEncoder_) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const cSql = `
    -- Insert the new record into PURCHREC and get the generated AutIncId
    INSERT INTO PURCHREC
      (CtrlNum_, Location, SuppNum_, Date____, DRNum___, DR__Date,
    PONum___, PODate__, Remarks_, NoOfItem, Encoder_, Log_Date)
    VALUES
      (@cCtrlNum_, @cLocation, @cSuppNum_, @dDate____, @cDRNum___, @dDR__Date,
    @cPONum___, @dPODate__, @cRemarks_, @nNoOfItem, @cEncoder_, @dLog_Date);

    -- Get the last inserted AutIncId
    DECLARE @AutIncId INT;
    SET @AutIncId = SCOPE_IDENTITY();

    -- Dynamically generate the next CtrlNum_ based on AutIncId and cSuffixId
    DECLARE @CtrlNum_ VARCHAR(11);
    SET @CtrlNum_ = RIGHT('00000000000' + CAST(@AutIncId AS VARCHAR(10)), 10) + RTRIM(@cSuffixId);
    
    -- Update the CtrlNum_ field with the new value
    UPDATE PURCHREC
    SET CtrlNum_ = @CtrlNum_
    WHERE AutIncId = @AutIncId;

    -- Dynamically generate the next ReferDoc based on Location
    DECLARE @PrevReferDoc VARCHAR(10);
    DECLARE @NewReferDoc VARCHAR(10);
    
    -- Find the latest ReferDoc for the given Location
    SELECT @PrevReferDoc = MAX(ReferDoc)
    FROM PURCHREC
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
    UPDATE PURCHREC
    SET ReferDoc = @NewReferDoc
    WHERE AutIncId = @AutIncId;

    -- Return the full record
    SELECT
      PURCHREC.CtrlNum_,
      PURCHREC.ReferDoc,
      PURCHREC.Date____,
      PURCHREC.DRNum___,
      PURCHREC.DR__Date,
      PURCHREC.PONum___,
      PURCHREC.PODate__,
      LOCATION.LocaName,
      PURCHREC.Location,
      PURCHREC.TotalQty,
      PURCHREC.Amount__,
      PURCHREC.NoOfItem,
      PURCHREC.Remarks_,
      PURCHREC.Encoder_,
      PURCHREC.Printed_,
      PURCHREC.Disabled,
      SUPPLIER.SuppName,
      PURCHREC.SuppNum_,
      PURCHREC.Log_Date
    FROM PURCHREC LEFT JOIN SUPPLIER
    ON PURCHREC.SuppNum_ = SUPPLIER.SuppNum_ , LOCATION
    WHERE PURCHREC.Location = LOCATION.Location
    AND PURCHREC.AutIncId = @AutIncId
    ORDER BY LOCATION.LocaName, PURCHREC.CtrlNum_, PURCHREC.Date____
  `;

  const params = { cCtrlNum_, cLocation, cSuppNum_, dDate____, cDRNum___, dDR__Date,
    cPONum___, dPODate__, cRemarks_, nNoOfItem, cEncoder_, dLog_Date, cSuffixId  };
  try {
    const result = await queryDatabase(cSql, params);
    // console.log(params)

    if (!result || result.length === 0) {
      res.status(404).json({ error: 'No records found' });
    } else {
      res.json(result);
    }
    
  } catch (err) {
    console.error('Insert PURCHREC error:', err);
    res.status(500).json({ error: 'Error inserting PURCHREC' });
  }

}

// SELECT TOP 1 @PrevReferDoc = ReferDoc
// FROM PURCHREC
// WHERE LTRIM(RTRIM(Location)) = LTRIM(RTRIM(@cLocation))
// ORDER BY AutIncId DESC;

const PurchRecLst = async (req, res) => {
  const cLocation = req.query.Location;
  const dDateFrom = req.query.DateFrom;
  const dDateTo__ = req.query.DateTo__;
  const cReferDoc = req.query.ReferDoc;

  let cSql = `SELECT 
      PURCHREC.CtrlNum_,
      PURCHREC.ReferDoc,
      PURCHREC.Date____,
      PURCHREC.DRNum___,
      PURCHREC.DR__Date,
      PURCHREC.PONum___,
      PURCHREC.PODate__,
      LOCATION.LocaName,
      PURCHREC.Location,
      PURCHREC.TotalQty,
      PURCHREC.Amount__,
      PURCHREC.NoOfItem,
      PURCHREC.Remarks_,
      PURCHREC.Encoder_,
      PURCHREC.Printed_,
      PURCHREC.Disabled,
      SUPPLIER.SuppName,
      PURCHREC.SuppNum_,
      PURCHREC.Log_Date
    FROM PURCHREC LEFT JOIN SUPPLIER
    ON PURCHREC.SuppNum_ = SUPPLIER.SuppNum_ , LOCATION
    WHERE PURCHREC.Location = LOCATION.Location
    AND 1=1
  `

  // Parameters object
  const params = {};

  // Additional filters based on query parameters
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
  if (cReferDoc) {
    cSql += " AND PURCHREC.ReferDoc LIKE @cReferDoc";
    params.cReferDoc = `%${cReferDoc}%`;
  }
  cSql += ` ORDER BY LOCATION.LocaName, PURCHREC.CtrlNum_, PURCHREC.Date____ `;

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

const PurchDtlLst = async (req, res) => {
  const cCtrlNum_ = req.query.CtrlNum_;

  let cSql = `SELECT 
        PURCHDTL.RecordId,
        PURCHDTL.CtrlNum_,
        PURCHDTL.ItemCode,
        ITEMLIST.UsersCde,
        ITEMLIST.OtherCde,
        ITEMLIST.Descript,
        PURCHDTL.POQty___,
        PURCHDTL.Quantity,
        PURCHDTL.QtyGood_,
        PURCHDTL.QtyBad__,
        PURCHDTL.Amount__,
        PURCHDTL.ItemPrce,
        PURCHDTL.SellPrce,
        PURCHDTL.LandCost
        FROM PURCHREC, PURCHDTL, ITEMLIST
        WHERE PURCHREC.CtrlNum_ = PURCHDTL.CtrlNum_
        AND PURCHDTL.ItemCode = ITEMLIST.ItemCode
        AND 1=1
        `

  // Parameters object
  const params = {};

  // Additional filters based on query parameters
  if (cCtrlNum_) {
    cSql += " AND PURCHREC.CtrlNum_ LIKE @cCtrlNum_";
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
    res.status(500).send('Error fetching purchase data');
  }
};


const addPurchDetail = async (req, res) => {
  const { cCtrlNum_,cItemCode,nQuantity,nPOQty___,nQtyGood_,nQtyBad__,nItemPrce,nSellPrce,nLandCost,cSuffixId } = req.body;
  // console.log(cCtrlNum_,cItemCode,nQuantity,nPOQty___,nQtyGood_,nQtyBad__,nItemPrce,nSellPrce,nLandCost,cSuffixId)

  if (!cCtrlNum_ || !cItemCode || !nQuantity) {
      return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Check the actual data type of RecordId
  const checkTypeSql = `
      SELECT DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'PURCHDTL' AND COLUMN_NAME = 'RecordId';
  `;

  try {
      const typeResult = await queryDatabase(checkTypeSql);
      const dataType = typeResult[0]?.DATA_TYPE;

      const sqlInsert = `
          INSERT INTO PURCHDTL
            (CtrlNum_,ItemCode,Quantity,POQty___,QtyGood_,QtyBad__,ItemPrce,SellPrce,LandCost)
          VALUES
            (@cCtrlNum_,@cItemCode,@nQuantity,@nPOQty___,@nQtyGood_,@nQtyBad__,@nItemPrce,@nSellPrce,@nLandCost);
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

              UPDATE PURCHDTL
              SET RecordId = @RecordId
              WHERE AutIncId = @AutIncId;
          `;
      }

      const fullRecordSet = `
          SELECT 
          PURCHDTL.RecordId,
          PURCHDTL.CtrlNum_,
          PURCHDTL.ItemCode,
          ITEMLIST.UsersCde,
          ITEMLIST.OtherCde,
          ITEMLIST.Descript,
          PURCHDTL.POQty___,
          PURCHDTL.Quantity,
          PURCHDTL.QtyGood_,
          PURCHDTL.QtyBad__,
          PURCHDTL.Amount__,
          PURCHDTL.ItemPrce,
          PURCHDTL.SellPrce,
          PURCHDTL.LandCost
          FROM PURCHDTL, ITEMLIST
          WHERE PURCHDTL.ItemCode = ITEMLIST.ItemCode
          AND PURCHDTL.RecordId = @RecordId;
      `;

      const cSql = sqlInsert + sqlRecordId + fullRecordSet;

      const params = { cCtrlNum_,cItemCode,nQuantity,nPOQty___,nQtyGood_,nQtyBad__,nItemPrce,nSellPrce,nLandCost,cSuffixId };

      const result = await queryDatabase(cSql, params);

      if (!result || result.length === 0) {
          return res.status(404).json({ error: 'No records found' });
      } else {
          return res.json(result);
      }
      
  } catch (err) {
      console.error('Insert PURCHDTL error:', err);
      return res.status(500).json({ error: 'Error inserting PURCHDTL' });
  }
};

const editPurchDetail = async (req, res) => {
  const {cRecordId, cItemCode, nQuantity, nPOQty___,nItemPrce,nLandCost } = req.body;
  
  if ( !cRecordId || !cItemCode || !nQuantity ) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const cSql = `
    UPDATE PURCHDTL SET
      ItemCode=@cItemCode, 
      Quantity=@nQuantity, 
      POQty___=@nPOQty___, 
      ItemPrce=@nItemPrce, 
      LandCost=@nLandCost
    WHERE RecordId=@cRecordId
  
    DECLARE @RecordId INT;
    SET @RecordId = SCOPE_IDENTITY();

    -- Return the full record
    SELECT 
        PURCHDTL.RecordId,
        PURCHDTL.CtrlNum_,
        PURCHDTL.ItemCode,
        ITEMLIST.UsersCde,
        ITEMLIST.OtherCde,
        ITEMLIST.Descript,
        PURCHDTL.Quantity,
        PURCHDTL.POQty___,
        PURCHDTL.Amount__,
        PURCHDTL.ItemPrce,
        PURCHDTL.SellPrce,
        PURCHDTL.LandCost
        FROM PURCHDTL, ITEMLIST
        WHERE PURCHDTL.ItemCode = ITEMLIST.ItemCode
        AND PURCHDTL.RecordId = @cRecordId
  `;

  const params = { cRecordId, cItemCode, nQuantity, nPOQty___,nItemPrce,nLandCost };
  // console.log(params)

  try {
    const result = await queryDatabase(cSql, params);

    if (!result || result.length === 0) {
      res.status(404).json({ error: 'No records found' });
    } else {
      res.json(result);
    }
    
  } catch (err) {
      console.error('Update PURCHDTL error:', err);
      res.status(500).json({ error: 'Error updating PURCHDTL' });
  }
}

const deletePurchDetail = async (req, res) => {
  const { id } = req.params;  // Read id from URL params

  if (!id) {
    return res.status(400).json({ error: 'Missing required parameter: id' });
  }

  cSql = `DELETE FROM PURCHDTL WHERE RecordId=@id`;
  const params = { id };

  try {
    const deleteResult = await queryDatabase(cSql, params);
    return res.json({ message: 'PurchDtl deleted successfully', rowsAffected: deleteResult });
  } catch (err) {
    console.error('Delete PURCHDTL error:', err);
    return res.status(500).json({ error: 'Error deleting SalesDtl' });
  }

};


module.exports = { PurchRecLst, PurchDtlLst, addPurchHeader, editPurchHeader, 
  addPurchDetail, editPurchDetail, updatePurchTotals, deletePurchDetail };
