
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
    SUPPLIER.SuppCode,
    ITEMLIST.ItemDept, 
    ITEMLIST.ItemType, 
    ITEMLIST.BrandNum, 
    ITEMLIST.SuppNum_, 
    ITEMLIST.CategNum, 
    BRAND___.BrandNme
    FROM ITEMLIST
    INNER JOIN ITEMDEPT ON ITEMLIST.ItemDept = ITEMDEPT.ItemDept
    INNER JOIN BRAND___ ON ITEMLIST.BrandNum = BRAND___.BrandNum
    INNER JOIN SUPPLIER ON ITEMLIST.SuppNum_ = SUPPLIER.SuppNum_
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
 
  let cSql = `SELECT UsersCde FROM ITEMLIST WHERE UsersCde=@cUsersCde`
  const params = {};
  params.cUsersCde = `${cUsersCde}`;  
  try {
    const result = await queryDatabase(cSql, params);
    res.json(result);  
  } catch (err) {
    console.error('Validation query error:', err);
    res.status(500).send('Error fetching UsersCde');
  }

}

const checkOtherCde = async (req, res) => {
  const cOtherCde = req.query.OtherCde;  
 
  let cSql = `SELECT OtherCde FROM ITEMLIST WHERE OtherCde=@cOtherCde`
  const params = {};
  params.cOtherCde = `${cOtherCde}`;  
  try {
    const result = await queryDatabase(cSql, params);
    res.json(result);  
  } catch (err) {
    console.error('Validation query error:', err);
    res.status(500).send('Error fetching OtherCde');
  }

}


const editItemList = async (req, res) => {
  const { cItemCode,cUsersCde,cOtherCde,cDescript,
    cBrandNum,cItemType,cItemDept,
    nItemPrce,nItemCost,nLandCost } = req.body;  // Extract from body

  if (!cItemCode || !cUsersCde || !cOtherCde || !cDescript
    ||!cBrandNum || !cItemType || !cItemDept 
    ||!nItemPrce || !nItemCost || !nLandCost  
  ) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const cSql = `UPDATE ITEMLIST 
    SET UsersCde=@cUsersCde,
        OtherCde=@cOtherCde,
        Descript=@cDescript,
        BrandNum=@cBrandNum,
        ItemType=@cItemType,
        ItemDept=@cItemDept,
        ItemPrce=@nItemPrce,
        ItemCost=@nItemCost,
        LandCost=@nLandCost
    WHERE ItemCode=@cItemCode`;

  const params = { cItemCode,cUsersCde,cOtherCde,cDescript,
    cBrandNum,cItemType,cItemDept,
    nItemPrce,nItemCost,nLandCost };

  try {
    const result = await queryDatabase(cSql, params);
    // res.json({ message: 'Update successful', rowsAffected: result });
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

  const cSql = `DELETE FROM ITEMLIST WHERE ItemCode=@cItemCode`;
  const params = { cItemCode };

  try {
      const result = await queryDatabase(cSql, params);
      res.json({ message: 'Delete successful', rowsAffected: result });
  } catch (err) {
      console.error('Delete ITEMLIST error:', err);
      res.status(500).json({ error: 'Error deleting ITEMLIST' });
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
    SUPPLIER.SuppCode,
    ITEMLIST.ItemDept, 
    ITEMLIST.ItemType, 
    ITEMLIST.BrandNum, 
    ITEMLIST.SuppNum_, 
    ITEMLIST.CategNum, 
    BRAND___.BrandNme
    FROM ITEMLIST,BRAND___,ITEMDEPT,SUPPLIER
    WHERE ITEMLIST.BrandNum=BRAND___.BrandNum
    AND ITEMLIST.ItemDept=ITEMDEPT.ItemDept
    AND ITEMLIST.SuppNum_=SUPPLIER.SuppNum_
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
  editItemList,
  deleteItemList,
  getItemReco
};

