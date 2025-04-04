
const { queryDatabase } = require('../DBConnect/dbConnect'); // Import the database connection

// Modified route to accept multiple query parameters
const listItem = async (req, res) => {
  const cUsersCde = req.query.UsersCde;  
  const cOtherCde = req.query.OtherCde;  
  const cDescript = req.query.Descript;  
  const cBrandNum = req.query.BrandNum;  
  const cItemDept = req.query.ItemDept;  
  const cItemType = req.query.ItemType;  
  const cCategNum = req.query.CategNum;  

  // Build SQL query with parameters
  let cSql = `SELECT ITEMLIST.Descript, 
    ITEMLIST.UsersCde, 
    ITEMLIST.OtherCde, 
    ITEMLIST.ItemCode, 
    ITEMLIST.ItemPrce, 
    ITEMLIST.ItemCost, 
    ITEMLIST.LandCost, 
    ITEMDEPT.Descript AS DeptName, 
    ITEMLIST.ItemDept, 
    ITEMLIST.ItemType, 
    ITEMLIST.BrandNum, 
    ITEMLIST.SuppNum_, 
    ITEMLIST.CategNum, 
    ITEMLIST.Disabled, 
    ITEMLIST.Services, 
    ITEMLIST.Outright, 
    BRAND___.BrandNme
    FROM ITEMLIST
    INNER JOIN ITEMDEPT ON ITEMLIST.ItemDept = ITEMDEPT.ItemDept
    INNER JOIN BRAND___ ON ITEMLIST.BrandNum = BRAND___.BrandNum
    WHERE 1=1`;

  // Add conditions based on query parameters
  const params = {};
  if (cUsersCde) {
    cSql += " AND ITEMLIST.UsersCde LIKE @cUsersCde";
    params.cUsersCde = `%${cUsersCde}%`;
  }
  if (cOtherCde) {
    cSql += " AND ITEMLIST.OtherCde LIKE @cOtherCde";
    params.cOtherCde = `%${cOtherCde}%`;
  }
  if (cDescript) {
    cSql += " AND ITEMLIST.Descript LIKE @cDescript";
    params.cDescript = `%${cDescript}%`;  
  }
  if (cBrandNum) {
    cSql += " AND ITEMLIST.BrandNum LIKE @cBrandNum";
    params.cBrandNum = `%${cBrandNum}%`;  
  }
  if (cItemDept) {
    cSql += " AND ITEMLIST.ItemDept LIKE @cItemDept";
    params.cItemDept = `%${cItemDept}%`;  
  }
  if (cItemType) {
    cSql += " AND ITEMLIST.ItemType LIKE @cItemType";
    params.cItemType = `%${cItemType}%`;  
  }
  if (cCategNum) {
    cSql += " AND ITEMLIST.CategNum LIKE @cCategNum";
    params.cCategNum = `%${cCategNum}%`;  
  }
  cSql += " ORDER BY ITEMLIST.Descript ";

  // console.log(params)

  try {
    // Perform the query and get the result
    const result = await queryDatabase(cSql, params);
    res.json(result);  // Send the result as a JSON response
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).send('Error fetching items');
  }
};

const listBrnd = async (req, res) => {
  const cBrandNum = req.query.BrandNum;  
  const cBrandNme = req.query.BrandNme;  
 
  let cSql = `SELECT 
    BRAND___.BrandNme,
    BRAND___.BrandNum,
    BRAND___.Outright
    FROM BRAND___
    WHERE 1=1`;

    const params = {};
    if (cBrandNum) {
      cSql += " AND BRAND___.BrandNum LIKE @cBrandNum";
      params.cBrandNum = `%${cBrandNum}%`;  
    }
    if (cBrandNme) {
      cSql += " AND BRAND___.BrandNme LIKE @cBrandNme";
      params.cBrandNme = `%${cBrandNme}%`;
    }
    cSql += ` ORDER BY 1`;

  try {
    const result = await queryDatabase(cSql, params);
    res.json(result);  
  } catch (err) {
    console.error('ListBrnd query error:', err);
    res.status(500).send('Error fetching Brands');
  }
}

const listType = async (req, res) => {
  const cItemType = req.query.ItemType;  
  const cDescript = req.query.Descript;  
 
  // Build SQL query with parameters
  let cSql = `SELECT 
    ITEMTYPE.Descript AS TypeDesc,
    ITEMTYPE.ItemType
    FROM ITEMTYPE
    WHERE 1=1`;

    const params = {};
    if (cItemType) {
      cSql += " AND ITEMTYPE.ItemType LIKE @cItemType";
      params.cItemType = `%${cItemType}%`;  
    }
    if (cDescript) {
      cSql += " AND ITEMTYPE.Descript LIKE @cDescript";
      params.cDescript = `%${cDescript}%`;  
    }
    cSql += ` ORDER BY 1`;

  
  try {
    const result = await queryDatabase(cSql, params);
    res.json(result);  
  } catch (err) {
    console.error('ListType query error:', err);
    res.status(500).send('Error fetching ItemType');
  }
}

const listDept = async (req, res) => {
  const cItemDept = req.query.ItemDept;  
  const cDescript = req.query.Descript;  
 
  // Build SQL query with parameters
  let cSql = `SELECT 
    ITEMDEPT.Descript AS DeptDesc,
    ITEMDEPT.ItemDept
    FROM ITEMDEPT
    WHERE 1=1`;

    const params = {};
    if (cItemDept) {
      cSql += " AND ITEMDEPT.ItemDept LIKE @cItemDept";
      params.cItemDept = `%${cItemDept}%`;  
    }
    if (cDescript) {
      cSql += " AND ITEMDEPT.Descript LIKE @cDescript";
      params.cDescript = `%${cDescript}%`;  
    }
    cSql += ` ORDER BY 1`;
  
  try {
    const result = await queryDatabase(cSql, params);
    res.json(result);  
  } catch (err) {
    console.error('ListDept query error:', err);
    res.status(500).send('Error fetching ItemDept');
  }
}

const listCate = async (req, res) => {
  const cCategNum = req.query.CategNum;  
  const cCategNme = req.query.CategNme;  
 
  // Build SQL query with parameters
  let cSql = `SELECT 
    CATEGORY.CategNme,
    CATEGORY.CategNum
    FROM CATEGORY
    WHERE 1=1`;

    const params = {};
    if (cCategNum) {
      cSql += " AND CATEGORY.CategNum LIKE @cCategNum";
      params.cCategNum = `%${cCategNum}%`;  
    }
    if (cCategNme) {
      cSql += " AND CATEGORY.CategNme LIKE @cCategNme";
      params.cCategNme = `%${cCategNme}%`;  
    }
    cSql += ` ORDER BY 1`;
  
  try {
    const result = await queryDatabase(cSql, params);
    res.json(result);  
  } catch (err) {
    console.error('ListCate query error:', err);
    res.status(500).send('Error fetching CategNme');
  }
}

const checkUsersCde = async (req, res) => {
  const cUsersCde = req.query.UsersCde;  

  let cSql = `SELECT UsersCde, OtherCde, Descript, ItemCode,
    ItemPrce, LandCost FROM ITEMLIST WHERE UsersCde LIKE @cUsersCde ORDER BY 1`;
  const params = { cUsersCde: `%${cUsersCde}%` };  
  
  let result = '';
  try {
    // First query to check for UsersCde
    result = await queryDatabase(cSql, params);

    if (result && result.length > 0) {
      // Return results if UsersCde is found
      res.json(result);
    } else {
      // No results found, try searching with OtherCde
      cSql = `SELECT UsersCde, OtherCde, Descript, ItemCode,
        ItemPrce, LandCost FROM ITEMLIST WHERE OtherCde LIKE @cUsersCde ORDER BY 1`;
      result = await queryDatabase(cSql, params);
      
      if (result && result.length > 0) {
        // Return results if OtherCde is found
        res.json(result);
      } else {
        // If neither UsersCde nor OtherCde has a result, return an empty array
        res.json([]);
      }
    }
  } catch (err) {
    console.error('Validation query error:', err);
    res.status(500).send('Error fetching UsersCde');
  }
}

const checkOtherCde = async (req, res) => {
  const cOtherCde = req.query.OtherCde;  
 
  let cSql = `SELECT UsersCde, OtherCde, Descript, ItemCode,
    ItemPrce, LandCost FROM ITEMLIST WHERE OtherCde=@cOtherCde`
  const params = {};
  params.cOtherCde = `${cOtherCde}`;  
  try {
    const result = await queryDatabase(cSql, params);
    if (result && result.length > 0) {
      res.json(result); // Return the result as JSON
    } else {
        res.json([]); // Return an empty array if no result
    }    
  } catch (err) {
    console.error('Validation query error:', err);
    res.status(500).send('Error fetching OtherCde');
  }

}

const addItemList = async (req, res) => {
  const { cItemCode,cUsersCde,cOtherCde,cDescript,
    cBrandNum,cItemType,cItemDept,cCategNum,cSuppNum_,
    nItemPrce,nItemCost,nLandCost,
    nOutright,lDisabled,lServices,cSuffixId } = req.body;  // Extract from body

  if (!cItemCode || !cUsersCde || !cOtherCde || !cDescript
    ||!cBrandNum || !cItemType || !cItemDept || !cCategNum || !cSuppNum_
    ||!nItemPrce || !nItemCost || !nLandCost 
    ||!nOutright ||!lDisabled || !lServices || cSuffixId===undefined
  ) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const dDateCost= new Date()

  const cSql = `
        -- Insert the new location and get the generated AutIncId
        INSERT INTO ITEMLIST
          ( ItemCode,UsersCde,OtherCde,Descript,
          BrandNum,ItemType,ItemDept,CategNum,SuppNum_,
          ItemPrce,ItemCost,LandCost,
          Outright,Disabled,Services,DateCost )
        VALUES
          ( @cItemCode,@cUsersCde,@cOtherCde,@cDescript,
          @cBrandNum,@cItemType,@cItemDept,@cCategNum,@cSuppNum_,
          @nItemPrce,@nItemCost,@nLandCost,
          @nOutright,@lDisabled,@lServices,@dDateCost )
;

        -- Get the last inserted AutIncId
        DECLARE @AutIncId INT;
        SET @AutIncId = SCOPE_IDENTITY();

        -- Dynamically pad AutIncId to a length of 10 digits and append cSuffixId
        DECLARE @ItemCode VARCHAR(11);  -- Changed from CHAR(10) to VARCHAR(11) to allow suffix addition

        -- Ensure zero-padding for numbers less than 100
        SET @ItemCode = RIGHT(REPLICATE('0', 10) + CAST(@AutIncId AS VARCHAR(10)), 10) + RTRIM(@cSuffixId);

        -- Update the Location field
        UPDATE ITEMLIST
        SET ItemCode = @ItemCode
        WHERE AutIncId = @AutIncId;

        -- Return the full record of the inserted itemcode
        SELECT ITEMLIST.Descript, 
            ITEMLIST.UsersCde, 
            ITEMLIST.OtherCde, 
            ITEMLIST.ItemCode, 
            ITEMLIST.ItemPrce, 
            ITEMLIST.ItemCost, 
            ITEMLIST.LandCost, 
            ITEMDEPT.Descript AS DeptName, 
            ITEMLIST.ItemDept, 
            ITEMLIST.ItemType, 
            ITEMLIST.BrandNum, 
            ITEMLIST.SuppNum_, 
            ITEMLIST.CategNum, 
            ITEMLIST.Outright, 
            ITEMLIST.Disabled, 
            ITEMLIST.Services, 
            BRAND___.BrandNme
            FROM ITEMLIST,BRAND___,ITEMDEPT
            WHERE ITEMLIST.BrandNum=BRAND___.BrandNum
            AND ITEMLIST.ItemDept=ITEMDEPT.ItemDept
            AND ITEMLIST.AutIncId = @AutIncId;
        `;

  // Note : If the field has a width of 12 and needs a suffix of 2 chars 
  // -- Declare @ItemCode with correct width
  // DECLARE @ItemCode VARCHAR(11);  -- Adjusted for total width of 11
  
  // -- Zero-pad AutIncId to 10 characters
  // SET @ItemCode = RIGHT(REPLICATE('0', 10) + CAST(@AutIncId AS VARCHAR(10)), 10) + RTRIM(@cSuffixId);
  
  
  const params = { cItemCode,cUsersCde,cOtherCde,cDescript,
    cBrandNum,cItemType,cItemDept,cCategNum,cSuppNum_,
    nItemPrce,nItemCost,nLandCost,
    nOutright,lDisabled,lServices,cSuffixId,dDateCost }

    // console.log(params)
  try {
    const result = await queryDatabase(cSql, params);
    res.json(result);  
  } catch (err) {
    console.error('Insert ITEMLIST error:', err);
    res.status(500).json({ error: 'Error inserting ITEMLIST' });
  }
};



const editItemList = async (req, res) => {
  const { cItemCode,cUsersCde,cOtherCde,cDescript,
    cBrandNum,cItemType,cItemDept,cCategNum,cSuppNum_,
    nItemPrce,nItemCost,nLandCost,
    nOutright,lDisabled,lServices } = req.body;  // Extract from body

  if (!cItemCode || !cUsersCde || !cOtherCde || !cDescript
    ||!cBrandNum || !cItemType || !cItemDept || !cCategNum || !cSuppNum_
    ||!nItemPrce || !nItemCost || !nLandCost 
    ||!nOutright || !lDisabled || !lServices
  ) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // nOutright= nOutright==='1' ? 1 : 0

  const cSql = `UPDATE ITEMLIST 
    SET UsersCde=@cUsersCde,
        OtherCde=@cOtherCde,
        Descript=@cDescript,
        BrandNum=@cBrandNum,
        ItemType=@cItemType,
        ItemDept=@cItemDept,
        CategNum=@cCategNum,
        SuppNum_=@cSuppNum_,
        ItemPrce=@nItemPrce,
        ItemCost=@nItemCost,
        LandCost=@nLandCost,
        Outright=@nOutright,
        Disabled=@lDisabled,
        Services=@lServices
    WHERE ItemCode=@cItemCode`;

  const params = { cItemCode,cUsersCde,cOtherCde,cDescript,
    cBrandNum,cItemType,cItemDept,cCategNum,cSuppNum_,
    nItemPrce,nItemCost,nLandCost,
    nOutright,lDisabled,lServices };

// console.log(params)
  try {
    const result = await queryDatabase(cSql, params);
    res.json(result);  

  } catch (err) {
    console.error('Update ITEMLIST error:', err);
    res.status(500).json({ error: 'Error updating ITEMLIST' });
  }
};

const deleteItemList = async (req, res) => {
  const { cItemCode } = req.body;  // Read from body

  if (!cItemCode) {
      return res.status(400).json({ error: 'Missing ItemCode' });
  }

  let cSql = `
    SELECT TOP 1 ItemCode FROM SALESDTL WHERE ItemCode=@cItemCode
    UNION ALL 
    SELECT TOP 1 ItemCode FROM COUNTDTL WHERE ItemCode=@cItemCode
    UNION ALL 
    SELECT TOP 1 ItemCode FROM PURCHDTL WHERE ItemCode=@cItemCode
    UNION ALL 
    SELECT TOP 1 ItemCode FROM ITEMADJU WHERE ItemCode=@cItemCode
    UNION ALL 
    SELECT TOP 1 ItemCode FROM STOCKDTL WHERE ItemCode=@cItemCode
    UNION ALL 
    SELECT TOP 1 ItemCode FROM PUORDDTL WHERE ItemCode=@cItemCode
`;  
const params = { cItemCode };

try {
  const result = await queryDatabase(cSql, params);

  // If any row is found, ItemCode cannot be deleted
  if (result && result.length > 0) {
    return res.status(400).json({
      message: 'Delete cannot be performed. The ItemCode is referenced in transactions.'
    });
  }

    cSql = `DELETE FROM ITEMLIST WHERE ItemCode=@cItemCode`;
  
    try {
        const result = await queryDatabase(cSql, params);
        res.json({ message: 'Delete successful', rowsAffected: result });
    } catch (err) {
        console.error('Delete ITEMLIST error:', err);
        res.status(500).json({ error: 'Error deleting ITEMLIST' });
    }

  } catch (err) {
    console.error('Error checking ItemCode usage:', err);
    return res.status(500).json({ error: 'Error checking ItemCode usage' });
  }

};

const getItemReco = async (req, res) => {
  const cItemCode = req.query.ItemCode;  
  
  let cSql = `SELECT ITEMLIST.Descript, 
    ITEMLIST.UsersCde, 
    ITEMLIST.OtherCde, 
    ITEMLIST.ItemCode, 
    ITEMLIST.ItemPrce, 
    ITEMLIST.ItemCost, 
    ITEMLIST.LandCost, 
    ITEMDEPT.Descript AS DeptName, 
    ITEMLIST.ItemDept, 
    ITEMLIST.ItemType, 
    ITEMLIST.BrandNum, 
    ITEMLIST.SuppNum_, 
    ITEMLIST.CategNum, 
    ITEMLIST.Outright, 
    ITEMLIST.Disabled, 
    ITEMLIST.Services, 
    BRAND___.BrandNme
    FROM ITEMLIST,BRAND___,ITEMDEPT
    WHERE ITEMLIST.BrandNum=BRAND___.BrandNum
    AND ITEMLIST.ItemDept=ITEMDEPT.ItemDept
    AND ITEMLIST.ItemCode=@cItemCode
    ORDER BY ITEMLIST.UsersCde`
    ;


  const params = {};
  params.cItemCode = `${cItemCode}`;  
  try {
    const result = await queryDatabase(cSql, params);
    res.json(result);  
  } catch (err) {
    console.error('Validation query error:', err);
    res.status(500).send('Error fetching ITEMLIST');
  }
};


module.exports = { 
  listItem, 
  listBrnd, 
  listType, 
  listDept, 
  listCate,
  checkUsersCde, 
  checkOtherCde,
  getItemReco,
  addItemList,
  editItemList,
  deleteItemList
};

