const { queryDatabase } = require('../../DBConnect/dbConnect'); // Import the database connection

const listGrup = async (req, res) => {
    const cStoreGrp = req.query.StoreGrp;  
   
    let cSql = `SELECT DISTINCT
      LOCATION.StoreGrp
      FROM LOCATION
      WHERE 1=1 `;
  
      const params = {};
      if (cStoreGrp) {
        cSql += " AND LOCATION.StoreGrp LIKE @cStoreGrp";
        params.cStoreGrp = `%${cStoreGrp}%`;
      }
      cSql += ` ORDER BY 1`;
  
    try {
      const result = await queryDatabase(cSql, params);
      res.json(result);  
    } catch (err) {
      console.error('StoreGrp query error:', err);
      res.status(500).send('Error fetching StoreGrp');
    }
  }

const listLoca = async (req, res) => {
    const cLocation = req.query.Location;  
    const cLocaName = req.query.LocaName;  
    const cStoreGrp = req.query.StoreGrp;  
    const lDisabled = req.query.Disabled;  
   
    let cSql = `SELECT 
      LOCATION.LocaName,
      LOCATION.LocaCode,
      LOCATION.Vicinity,
      LOCATION.StoreGrp,
      LOCATION.SellArea,
      LOCATION.Disabled,
      LOCATION.Location
      FROM LOCATION
      WHERE 1=1 `;
  
      const params = {};
      if (cLocation) {
        cSql += " AND LOCATION.Location LIKE @cLocation";
        params.cLocation = `%${cLocation}%`;  
      }
      if (cLocaName) {
        cSql += " AND LOCATION.LocaName LIKE @cLocaName";
        params.cLocaName = `%${cLocaName}%`;
      }
      if (cStoreGrp) {
        cSql += " AND LOCATION.StoreGrp LIKE @cStoreGrp";
        params.cStoreGrp = `%${cStoreGrp}%`;
      }
      if (lDisabled) {
        cSql += " AND LOCATION.Disabled = @lDisabled";
        params.lDisabled = `${lDisabled}`;
      }
      cSql += ` ORDER BY 7`;
  
    try {
      const result = await queryDatabase(cSql, params);
      // console.log(params)
      res.json(result);  
    } catch (err) {
      console.error('ListLoca query error:', err);
      res.status(500).send('Error fetching Location');
    }
  }
  
  const editLocation = async (req, res) => {
    const { cLocation,cLocaName,cLocaCode,cStoreGrp,lSellArea,lDisabled } = req.body;  // Extract from body
  
    if (!cLocation || !cLocaName || !cLocaCode || !cStoreGrp || !lSellArea || !lDisabled ) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
  
    const cSql = `UPDATE LOCATION 
      SET LocaName=@cLocaName,
          LocaCode=@cLocaCode,
          StoreGrp=@cStoreGrp,
          SellArea=@lSellArea,
          Disabled=@lDisabled
      WHERE Location=@cLocation`;
  
    const params = { cLocation,cLocaName,cLocaCode,cStoreGrp,lSellArea,lDisabled };
  
    try {
      const result = await queryDatabase(cSql, params);
      // res.json({ message: 'Update successful', rowsAffected: result });
      res.json(result);  
  
    } catch (err) {
      console.error('Update LOCATION error:', err);
      res.status(500).json({ error: 'Error updating LOCATION' });
    }
  };
  
  
  
  const addLocation = async (req, res) => {
    const { cLocation, cLocaName, cLocaCode, cStoreGrp, lSellArea, lDisabled } = req.body;
  
    if (!cLocation || !cLocaName || !cLocaCode || !cStoreGrp || !lSellArea || !lDisabled) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
  
    const cSql = `
          -- Insert the new location and get the generated AutIncId
          INSERT INTO LOCATION 
            (Location, LocaName, LocaCode, StoreGrp, SellArea, Disabled)
          VALUES
            (@cLocation, @cLocaName, @cLocaCode, @cStoreGrp, @lSellArea, @lDisabled);

          -- Get the last inserted AutIncId
          DECLARE @AutIncId INT;
          SET @AutIncId = SCOPE_IDENTITY();

          -- Dynamically pad AutIncId to a length of 3 digits and append cSuffixId
          DECLARE @Location VARCHAR(4);  -- Changed from CHAR(3) to VARCHAR(4) to allow suffix addition

          -- Ensure zero-padding for numbers less than 100
          -- SET @Location = RIGHT('000' + CAST(@AutIncId AS VARCHAR(3)), 3) + RTRIM(@cSuffixId);
          SET @Location = RIGHT('0000' + CAST(@AutIncId AS VARCHAR(4)), 4)

          -- Update the Location field
          UPDATE LOCATION
          SET Location = @Location
          WHERE AutIncId = @AutIncId;

          -- Return the full record of the inserted location
          SELECT
          LOCATION.LocaName,
          LOCATION.LocaCode,
          LOCATION.Vicinity,
          LOCATION.StoreGrp,
          LOCATION.SellArea,
          LOCATION.Disabled,
          LOCATION.Location
          FROM LOCATION WHERE AutIncId = @AutIncId;
    `;

    // Note : If the field has a width of 12 and needs a suffix of 2 chars 
    // -- Declare @Location with correct width
    // DECLARE @Location VARCHAR(12);  -- Adjusted for total width of 12
    
    // -- Zero-pad AutIncId to 10 characters
    // SET @Location = RIGHT(REPLICATE('0', 10) + CAST(@AutIncId AS VARCHAR(10)), 10) + RTRIM(@cSuffixId);
    
    
    const params = {cLocation, cLocaName, cLocaCode, cStoreGrp, lSellArea, lDisabled };
    // console.log(params)
    try {
      const result = await queryDatabase(cSql, params);
      res.json(result);  
    } catch (err) {
      console.error('Insert LOCATION error:', err);
      res.status(500).json({ error: 'Error inserting LOCATION' });
    }
  };
  


const deleteLocation = async (req, res) => {
  const { id } = req.params;  // Read id from URL params

  if (!id) {
    return res.status(400).json({ error: 'Missing required parameter: id' });
  }

  // Check if location is used in any transactions
  let cSql = `
    SELECT TOP 1 Location FROM SALESREC WHERE Location=@id
    UNION ALL 
    SELECT TOP 1 Location FROM COUNTREC WHERE Location=@id
    UNION ALL 
    SELECT TOP 1 Location FROM PURCHREC WHERE Location=@id
    UNION ALL 
    SELECT TOP 1 Location FROM ADJUSREC WHERE Location=@id
    UNION ALL 
    SELECT TOP 1 WhseFrom FROM STOCKREC WHERE WhseFrom=@id
    UNION ALL 
    SELECT TOP 1 WhseTo__ FROM STOCKREC WHERE WhseTo__=@id
  `;
  const params = { id };

  try {
    const result = await queryDatabase(cSql, params);

    // If any row is found, location cannot be deleted
    if (result && result.length > 0) {
      return res.status(409).json({
        message: 'Delete cannot be performed. The location is referenced in transactions.'
      });
    }

    // Proceed with the deletion if no references were found
    cSql = `DELETE FROM LOCATION WHERE Location=@id`;

    try {
      const deleteResult = await queryDatabase(cSql, params);
      return res.json({ message: 'Location deleted successfully', rowsAffected: deleteResult });
    } catch (err) {
      console.error('Delete LOCATION error:', err);
      return res.status(500).json({ error: 'Error deleting location' });
    }

  } catch (err) {
    console.error('Error checking location usage:', err);
    return res.status(500).json({ error: 'Error checking location usage' });
  }
};

const listSupp = async (req, res) => {
  const cSuppNum_ = req.query.SuppNum_;  
  const cSuppName = req.query.SuppName;  
 
  // Build SQL query with parameters
  let cSql = `SELECT 
    SUPPLIER.SuppName,
    SUPPLIER.SuppNum_,
    SUPPLIER.Disabled
    FROM SUPPLIER
    WHERE 1=1`;

    const params = {};
    if (cSuppNum_) {
      cSql += " AND SUPPLIER.SuppNum_ LIKE @cSuppNum_";
      params.cSuppNum_ = `%${cSuppNum_}%`;  
    }
    if (cSuppName) {
      cSql += " AND SUPPLIER.SuppName LIKE @cSuppName";
      params.cSuppName = `%${cSuppName}%`;  
    }
    cSql += ` ORDER BY 1`;
  
  try {
    const result = await queryDatabase(cSql, params);
    res.json(result);  
  } catch (err) {
    console.error('ListSupp query error:', err);
    res.status(500).send('Error fetching Supplier');
  }
}

const checkLogIn = async (req, res) => {
  const cLoggedIn = req.query.LoggedIn;  
 
  // Build SQL query with parameters
  let cSql = `SELECT 
    APPUSERS.UserCode,
    APPUSERS.UserName,
    APPUSERS.NickName,
    APPUSERS.EmailAdd,
    APPUSERS.Password,
    APPUSERS.MenuOpts,
    APPUSERS.SuffixId,
    APPUSERS.Disabled
    FROM APPUSERS
    WHERE 1=1`;

    const params = {};
    if (cLoggedIn) {
      cSql += " AND RTrim(APPUSERS.EmailAdd)+LTrim(APPUSERS.Password) LIKE @cLoggedIn";
      params.cLoggedIn = `%${cLoggedIn}%`;  
    }
    cSql += ` ORDER BY 1`;
  
  try {
    const result = await queryDatabase(cSql, params);
    // console.log(result)
    res.json(result);  
  } catch (err) {
    console.error('LogIn query error:', err);
    res.status(500).send('Error fetching Log In');
  }
}

const listUser = async (req, res) => {
  const cUserName = req.query.UserName;

  if (!cUserName) {
    return res.status(400).send("UserName parameter is required.");
  }

 const cSql = `
    SELECT 
      APPUSERS.UserCode,
      APPUSERS.UserName,
      APPUSERS.NickName,
      APPUSERS.EmailAdd,
      APPUSERS.Position,
      APPUSERS.Tel_Num_,
      APPUSERS.Password,
      APPUSERS.Remarks_,
      APPUSERS.SuffixId,
      APPUSERS.MenuOpts,
      APPUSERS.Address_,
      APPUSERS.Disabled
    FROM APPUSERS
    WHERE 
      APPUSERS.UserName LIKE @cUserName
      OR APPUSERS.EmailAdd LIKE @cUserName
      OR APPUSERS.NickName LIKE @cUserName
      OR APPUSERS.Tel_Num_ LIKE @cUserName
    ORDER BY APPUSERS.UserCode`;

  const params = { cUserName: `%${cUserName}%` };

  try {
    const result = await queryDatabase(cSql, params);
    res.json(result);
  } catch (err) {
    console.error('ListUser query error:', err);
    res.status(500).send('Error fetching AppUsers');
  }
};

const addAppUsers = async (req, res) => {
    const { cUserName, cEmailAdd, cPosition, cTel_Num_, cPassword, cNickName, cSuffixId, cRemarks_, cMenuOpts, lDisabled } = req.body;
  
    if (!cUserName || !cEmailAdd || !cNickName) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    const cUserCode=''

    const cSql = `
          -- Insert the new location and get the generated AutIncId
          INSERT INTO APPUSERS 
            (UserCode, UserName, EmailAdd, Position, Tel_Num_, Password, NickName, Remarks_, MenuOpts, Disabled)
          VALUES
            (@cUserCode, @cUserName, @cEmailAdd, @cPosition, @cTel_Num_, @cPassword, @cNickName, @cRemarks_, @cMenuOpts, @lDisabled);

          -- Get the last inserted AutIncId
          DECLARE @AutIncId INT;
          SET @AutIncId = SCOPE_IDENTITY();

          -- Dynamically pad AutIncId to a length of 3 digits and append cSuffixId
          DECLARE @UserCode VARCHAR(4);  

          -- Ensure zero-padding for numbers less than 100
          SET @UserCode = RIGHT('0000' + CAST(@AutIncId AS VARCHAR(4)), 4)

          -- Update the Location field
          UPDATE APPUSERS
          SET UserCode = @UserCode
          WHERE AutIncId = @AutIncId;

          -- Return the full record of the inserted data
          SELECT
            APPUSERS.UserCode,
            APPUSERS.UserName,
            APPUSERS.NickName,
            APPUSERS.EmailAdd,
            APPUSERS.Position,
            APPUSERS.Tel_Num_,
            APPUSERS.Password,
            APPUSERS.Remarks_,
            APPUSERS.SuffixId,
            APPUSERS.MenuOpts,
            APPUSERS.Address_,
            APPUSERS.Disabled
          FROM APPUSERS WHERE AutIncId = @AutIncId;
    `;

    
    const params = { cUserCode, cUserName, cEmailAdd, cPosition, cTel_Num_, cPassword, cNickName, cSuffixId, cRemarks_ , cMenuOpts , lDisabled };
    // console.log(params)
    try {
      const result = await queryDatabase(cSql, params);
      res.json(result);  
    } catch (err) {
      console.error('Insert APPUSERS error:', err);
      res.status(500).json({ error: 'Error inserting APPUSERS' });
    }
  };
  
const editAppUsers = async (req, res) => {
    const { cUserCode, cUserName, cEmailAdd, cPosition, cTel_Num_, cPassword, cNickName, cSuffixId, cRemarks_, cMenuOpts, cAddress_, lDisabled } = req.body; 
  
    if (!cUserName || !cEmailAdd || !cNickName ) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
  
    const cSql = `UPDATE APPUSERS
      SET UserName=@cUserName,
          EmailAdd=@cEmailAdd,
          Position=@cPosition,
          Tel_Num_=@cTel_Num_,
          Password=@cPassword,
          NickName=@cNickName,
          Remarks_=@cRemarks_,
          SuffixId=@cSuffixId,
          MenuOpts=@cMenuOpts,
          Address_=@cAddress_,
          Disabled=@lDisabled
      WHERE UserCode=@cUserCode`;
  
    const params = { cUserCode, cUserName, cEmailAdd, cPosition, cTel_Num_, cPassword, cNickName, cSuffixId, cRemarks_, cMenuOpts, cAddress_, lDisabled };
  
    try {
      const result = await queryDatabase(cSql, params);
      // res.json({ message: 'Update successful', rowsAffected: result });
      res.json(result);  
  
    } catch (err) {
      console.error('Update APPUSERS error:', err);
      res.status(500).json({ error: 'Error updating APPUSERS' });
    }
  };
  
const deleteAppUsers = async (req, res) => {
  const { id } = req.params;  // Read id from URL params

  if (!id) {
    return res.status(400).json({ error: 'Missing required parameter: id' });
  }

  // Check if location is used in any transactions
  let cSql = `
    SELECT TOP 1 UserCode FROM SALESREC WHERE UserCode=@id
  `;
  const params = { id };

  try {
    const result = await queryDatabase(cSql, params);

    // If any row is found, location cannot be deleted
    if (result && result.length > 0) {
      return res.status(409).json({
        message: 'Delete cannot be performed. The App User is referenced in transactions.'
      });
    }

    // Proceed with the deletion if no references were found
    cSql = `DELETE FROM APPUSERS WHERE UserCode=@id`;

    try {
      const deleteResult = await queryDatabase(cSql, params);
      return res.json({ message: 'App User deleted successfully', rowsAffected: deleteResult });
    } catch (err) {
      console.error('Delete APPUSERS error:', err);
      return res.status(500).json({ error: 'Error deleting App User' });
    }

  } catch (err) {
    console.error('Error checking app user usage:', err);
    return res.status(500).json({ error: 'Error checking app user usage' });
  }
};

const createTables = async (req, res) => {

  try {
    const cSql = `
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'appusers')
        BEGIN
          CREATE TABLE appusers (
            UserCode Char(4) PRIMARY KEY,
            UserName Char(25) DEFAULT '',
            NickName Char(10) DEFAULT '',
            Address_ Char(100) DEFAULT '',
            Tel_Num_ Char(40) DEFAULT '',
            Password Char(10) DEFAULT '',
            Position Char(20) DEFAULT '',
            Remarks_ Char(50) DEFAULT '',
            EmailAdd Char(50) DEFAULT '',
            SuffixId Char(2) DEFAULT '',
            MenuOpts Char(200) DEFAULT '',
            Disabled bit DEFAULT 0,
            AutIncId Int IDENTITY(1,1)
          )
        END
    `;
    await queryDatabase(cSql);  

    const cSql2 = `
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SALESREC' 
        AND COLUMN_NAME = 'CustName') 
        BEGIN ALTER TABLE SALESREC ADD CustName Char(30) NOT NULL DEFAULT ''; END

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'LOCATION' 
        AND COLUMN_NAME = 'StoreGrp') 
        BEGIN ALTER TABLE LOCATION ADD StoreGrp Char(30) NOT NULL DEFAULT ''; END
        
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ITEMLIST' 
        AND COLUMN_NAME = 'AutIncId') 
        BEGIN ALTER TABLE ITEMLIST ADD AutIncId Int IDENTITY(1,1); END
        
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SALESREC' 
        AND COLUMN_NAME = 'AutIncId') 
        BEGIN ALTER TABLE SALESREC ADD AutIncId Int IDENTITY(1,1); END

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'STOCKREC' 
        AND COLUMN_NAME = 'AutIncId') BEGIN ALTER TABLE STOCKREC ADD AutIncId Int IDENTITY(1,1); END

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PURCHREC' 
        AND COLUMN_NAME = 'AutIncId') BEGIN ALTER TABLE PURCHREC ADD AutIncId Int IDENTITY(1,1); END

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SALESDTL' 
        AND (COLUMN_NAME = 'AutIncId' OR COLUMN_NAME = 'RecordId')) 
        BEGIN ALTER TABLE SALESDTL ADD AutIncId Int IDENTITY(1,1); END

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'STOCKDTL'  
        AND (COLUMN_NAME = 'AutIncId' OR COLUMN_NAME = 'RecordId')) 
        BEGIN ALTER TABLE STOCKDTL ADD AutIncId Int IDENTITY(1,1); END

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PURCHDTL'  
        AND (COLUMN_NAME = 'AutIncId' OR COLUMN_NAME = 'RecordId')) 
        BEGIN ALTER TABLE PURCHDTL ADD AutIncId Int IDENTITY(1,1); END

        `

    await queryDatabase(cSql2);  

    res.json({ success: true, message: 'Table check/creation executed' });
  } catch (err) {
    // console.error('Update Tables error:', err);
    res.status(500).json({ error: 'Error Updating Tables' });
  }
};

module.exports = { 
  listGrup,
  listSupp,
  listUser,
  checkLogIn,
  addAppUsers,
  editAppUsers,
  deleteAppUsers,
  listLoca,
  addLocation,
  editLocation,
  deleteLocation,
  createTables
};
