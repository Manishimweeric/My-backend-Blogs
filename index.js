const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes/routes");
const userRoutes = require("./routes/UserRoutes");
const passport = require('passport');
require('./Utilities/passport_configuration');

const  swaggerjsdoc = require('swagger-jsdoc');
const swaggerui = require('swagger-ui-express');
const swaggerDocs = require("./Utilities/swagger.ts");

const app = express();

app.use(express.json());
app.use(passport.initialize());
app.use('/api', routes);
app.use('/api', userRoutes);
app.get('/test', (req, res) => res.status(200).json({ message: 'Test route' }));


const url_db="mongodb+srv://manishimweeric54:0789704679eric?@cluster0.tkfd8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

async function startServer() {
    try {
      await mongoose.connect(url_db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
  
      swaggerDocs(app, 5000); 

      const server = app.listen(3000, () => {
        console.log('Server has started on port 3000!');
      });

      return server;
    } catch (error) {
      console.error('Error starting the server:', error);
    }
  }

  if (require.main === module) {
    startServer();
  }
  
  module.exports = { app, startServer };