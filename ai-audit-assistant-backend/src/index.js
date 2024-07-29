const express = require('express');
   const cors = require('cors');
   require('dotenv').config();

   const app = express();
   const port = process.env.PORT || 3000;

   app.use(cors());
   app.use(express.json());

   app.get('/', (req, res) => {
     res.json({ message: 'Welcome to AI Audit Assistant Backend' });
   });

   app.listen(port, () => {
     console.log(`Server is running on port ${port}`);
   });