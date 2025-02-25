
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
const salesRouter = require('./Routers/salesRouter');      
const lookupRouter = require('./Routers/lookupRouter');      

// Use the different routers
app.use('/product', productRouter);
app.use('/sales', salesRouter);  
app.use('/lookup', lookupRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
