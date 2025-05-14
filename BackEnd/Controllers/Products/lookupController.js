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
      cSql += ` ORDER BY 7`;
  
    try {
      const result = await queryDatabase(cSql, params);
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

  module.exports = { 
    listGrup,
    listLoca,
    listSupp,
    addLocation,
    editLocation,
    deleteLocation
  };
  