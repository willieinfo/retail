const { queryDatabase } = require('../../DBConnect/dbConnect');

const RecptDtlLst = async (req, res) => {
  const cCtrlNum_ = req.query.CtrlNum_;

  let cSql = `SELECT 
        RECPTDTL.RecordId,
        RECPTDTL.CtrlNum_,
        RECPTDTL.PaymForm,
        RECPTDTL.AcctName,
        RECPTDTL.Acct_Num,
        RECPTDTL.Authorze,
        RECPTDTL.Tender_P,
        RECPTDTL.Tender_D,
        RECPTDTL.Amount__
        FROM RECPTDTL
        JOIN SALESREC ON SALESREC.CtrlNum_ = RECPTDTL.CtrlNum_
        WHERE 1=1
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
    res.status(500).send('Error fetching RecptDtl data');
  }
};


const addRecptDetail = async (req, res) => {
  const { cCtrlNum_, cPaymForm, cAcctName, cAcct_Num, cAuthorze, nAmount__, cSuffixId } = req.body;

  if (!cCtrlNum_ || !cPaymForm || !nAmount__) {
      return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Check the actual data type of RecordId
  const checkTypeSql = `
      SELECT DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'RECPTDTL' AND COLUMN_NAME = 'RecordId';
  `;

  try {
      const typeResult = await queryDatabase(checkTypeSql);
      const dataType = typeResult[0]?.DATA_TYPE;

      const sqlInsert = `
          INSERT INTO RECPTDTL
            (CtrlNum_, PaymForm, AcctName, Acct_Num, Authorze, Amount__)
          VALUES
            (@cCtrlNum_, @cPaymForm, @cAcctName, @cAcct_Num, @cAuthorze, @nAmount__);
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
            RECPTDTL.RecordId,
            RECPTDTL.CtrlNum_,
            RECPTDTL.PaymForm,
            RECPTDTL.AcctName,
            RECPTDTL.Acct_Num,
            RECPTDTL.Authorze,
            RECPTDTL.Tender_P,
            RECPTDTL.Tender_D,
            RECPTDTL.Amount__
            FROM RECPTDTL
          JOIN SALESREC ON SALESREC.CtrlNum_ = RECPTDTL.CtrlNum_
          WHERE RECPTDTL.RecordId = @RecordId;
      `;

      const cSql = sqlInsert + sqlRecordId + fullRecordSet;

      const params = { cCtrlNum_, cPaymForm, cAcctName, cAcct_Num, cAuthorze, nAmount__, cSuffixId };

      const result = await queryDatabase(cSql, params);

      if (!result || result.length === 0) {
          return res.status(404).json({ error: 'No records found' });
      } else {
          return res.json(result);
      }
      
  } catch (err) {
      console.error('Insert RECPTDTL error:', err);
      return res.status(500).json({ error: 'Error inserting RECPTDTL' });
  }
};

const editRecptDetail = async (req, res) => {
  const {cRecordId, cPaymForm, cAcctName, cAcct_Num, cAuthorze, nAmount__ } = req.body;
  
  // console.log(cRecordId, cItemCode, nQuantity, nItemPrce, nDiscRate, nAmount__,nLandCost);

  if ( !cCtrlNum_ || !cPaymForm || !nAmount__ ) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const cSql = `
    UPDATE RECPTDTL SET
      PaymForm=@cPaymForm, 
      AcctName=@cAcctName, 
      Acct_Num=@cAcct_Num, 
      Authorze=@cAuthorze, 
      Amount__=@nAmount__ 
    WHERE RecordId=@cRecordId
  
    DECLARE @RecordId INT;
    SET @RecordId = SCOPE_IDENTITY();

    -- Return the full record
    SELECT 
      RECPTDTL.RecordId,
      RECPTDTL.CtrlNum_,
      RECPTDTL.PaymForm,
      RECPTDTL.AcctName,
      RECPTDTL.Acct_Num,
      RECPTDTL.Authorze,
      RECPTDTL.Tender_P,
      RECPTDTL.Tender_D,
      RECPTDTL.Amount__
      FROM RECPTDTL
    JOIN SALESREC ON SALESREC.CtrlNum_ = RECPTDTL.CtrlNum_
    WHERE RECPTDTL.RecordId = @RecordId;
  `;

  const params = { cRecordId, cPaymForm, cAcctName, cAcct_Num, cAuthorze, nAmount__ };
  // console.log(params)

  try {
    const result = await queryDatabase(cSql, params);

    if (!result || result.length === 0) {
      res.status(404).json({ error: 'No records found' });
    } else {
      res.json(result);
    }
    
  } catch (err) {
      console.error('Update RECPTDTL error:', err);
      res.status(500).json({ error: 'Error updating RECPTDTL' });
  }

}

const deleteRecptDetail = async (req, res) => {
  const { id } = req.params;  // Read id from URL params

  if (!id) {
    return res.status(400).json({ error: 'Missing required parameter: id' });
  }

  cSql = `DELETE FROM RECPTDTL WHERE RecordId=@id`;
  const params = { id };

  try {
    const deleteResult = await queryDatabase(cSql, params);
    return res.json({ message: 'RecptDtl deleted successfully', rowsAffected: deleteResult });
  } catch (err) {
    console.error('Delete RECPTDTL error:', err);
    return res.status(500).json({ error: 'Error deleting RecptDtl' });
  }

};

module.exports = { RecptDtlLst, addRecptDetail, editRecptDetail, deleteRecptDetail };
