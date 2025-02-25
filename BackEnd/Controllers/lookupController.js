const { queryDatabase } = require('../DBConnect/dbConnect'); // Import the database connection

const listLoca = async (req, res) => {
    const cLocation = req.query.Location;  
    const cLocaName = req.query.LocaName;  
   
    let cSql = `SELECT 
      LOCATION.Location,
      LOCATION.LocaName,
      LOCATION.LocaCode,
      LOCATION.Vicinity,
      LOCATION.SellArea,
      LOCATION.Disabled
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
      cSql += ` ORDER BY 2`;
  
    try {
      const result = await queryDatabase(cSql, params);
      res.json(result);  
    } catch (err) {
      console.error('ListLoca query error:', err);
      res.status(500).send('Error fetching Location');
    }
  }
  
  const editLocation = async (req, res) => {
    const { cLocation,cLocaName,cLocaCode,cVicinity,lSellArea,lDisabled } = req.body;  // Extract from body
  
    if (!cLocation || !cLocaName || !cLocaCode || !cVicinity || !lSellArea || !lDisabled ) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
  
    const cSql = `UPDATE LOCATION 
      SET LocaName=@cLocaName,
          LocaCode=@cLocaCode,
          Vicinity=@cVicinity,
          SellArea=@lSellArea,
          Disabled=@lDisabled
      WHERE Location=@cLocation`;
  
    const params = { cLocation,cLocaName,cLocaCode,cVicinity,lSellArea,lDisabled };
  
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
    const { cLocation, cLocaName, cLocaCode, cVicinity, lSellArea, lDisabled, cSuffixId } = req.body;
  
    if (!cLocation || !cLocaName || !cLocaCode || !cVicinity || !lSellArea || !lDisabled || cSuffixId === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
  
    const cSql = `
          -- Insert the new location and get the generated AutIncId
          INSERT INTO LOCATION 
            (Location, LocaName, LocaCode, Vicinity, SellArea, Disabled)
          VALUES
            (@cLocation, @cLocaName, @cLocaCode, @cVicinity, @lSellArea, @lDisabled);

          -- Get the last inserted AutIncId
          DECLARE @AutIncId INT;
          SET @AutIncId = SCOPE_IDENTITY();

          -- Dynamically pad AutIncId to a length of 3 digits and append cSuffixId
          DECLARE @Location VARCHAR(4);  -- Changed from CHAR(3) to VARCHAR(4) to allow suffix addition

          -- Ensure zero-padding for numbers less than 100
          SET @Location = RIGHT('000' + CAST(@AutIncId AS VARCHAR(3)), 3) + RTRIM(@cSuffixId);

          -- Update the Location field
          UPDATE LOCATION
          SET Location = @Location
          WHERE AutIncId = @AutIncId;

          -- Return the full record of the inserted location
          SELECT * FROM LOCATION WHERE AutIncId = @AutIncId;
    `;

    // Note : If the field has a width of 12 and needs a suffix of 2 chars 
    // -- Declare @Location with correct width
    // DECLARE @Location VARCHAR(12);  -- Adjusted for total width of 12
    
    // -- Zero-pad AutIncId to 10 characters
    // SET @Location = RIGHT(REPLICATE('0', 10) + CAST(@AutIncId AS VARCHAR(10)), 10) + RTRIM(@cSuffixId);
    
    
    const params = {cLocation, cLocaName, cLocaCode, cVicinity, lSellArea, lDisabled, cSuffixId };
    console.log(params)
    try {
      const result = await queryDatabase(cSql, params);
      res.json({
        message: 'Location added successfully',
        record: result[0] // The first record in the result set will be the newly inserted location
      });
    } catch (err) {
      console.error('Insert LOCATION error:', err);
      res.status(500).json({ error: 'Error inserting LOCATION' });
    }
  };
  
  // const deleteLocation = async (req, res) => {
  //   const { cLocation } = req.body;  
  
  //   if (!cLocation ) {
  //     return res.status(400).json({ error: 'Missing required parameters' });
  //   }
  
  //   const cSql = `DELETE FROM LOCAION
  //     WHERE Location=@cLocation`;
  
  //   const params = { cLocation };
  
  //   try {
  //     const result = await queryDatabase(cSql, params);
  //     // res.json({ message: 'Update successful', rowsAffected: result });
  //     res.json(result);  
  
  //   } catch (err) {
  //     console.error('Delete LOCATION error:', err);
  //     res.status(500).json({ error: 'Error deleting LOCATION' });
  //   }
  // };

  const deleteLocation = async (req, res) => {
    const { id } = req.params;  // Read id from URL params

    if (!id) {
        return res.status(400).json({ error: 'Missing required parameter: id' });
    }

    const cSql = `DELETE FROM LOCATION WHERE Location=@id`;
    const params = { id };

    try {
        const result = await queryDatabase(cSql, params);
        res.json({ message: 'Delete successful', rowsAffected: result });
    } catch (err) {
        console.error('Delete LOCATION error:', err);
        res.status(500).json({ error: 'Error deleting LOCATION' });
    }
};

  module.exports = { 
    listLoca,
    addLocation,
    editLocation,
    deleteLocation
  };
  