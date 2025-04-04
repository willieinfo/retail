
// Remember to install the following first:
// npm install express
// npm install cors
// npm install mssql
// npm install dotenv

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const productRouter = require('./Routers/productRouter');  
const lookupRouter = require('./Routers/lookupRouter');      
const salesRouter = require('./Routers/salesRouter');      
const stockRouter = require('./Routers/stockRouter');      

// Use the different routers
app.use('/product', productRouter);
app.use('/lookup', lookupRouter);
app.use('/sales', salesRouter);  
app.use('/transfers', stockRouter);  

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
