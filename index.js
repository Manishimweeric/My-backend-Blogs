// const express = require("express")
// const mongoose = require("mongoose")
// const routes = require("./routes/routes")
// const userRoutes = require("./routes/UserRoutes")
// const passport = require('passport'); // Correct import of passport
// require('./Utilities/passport_configuration');
// const app = express();

// mongoose
//         .connect("mongodb://localhost:27017/blog_db1")
//         .then(()=>{
    
//     const app = express()
//     app.use(express.json());
//     app.use(passport.initialize());
//     app.use('/api',routes)
//     app.use('/api', userRoutes)
    
    
//     app.listen(5000, () => {
//         console.log("Server has started!")
//     })
// })
// module.exports = app;
//  // Export the app for testing
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


mongoose
        .connect("mongodb://localhost:27017/blog_db1")
        .then(()=>{
           
    swaggerDocs(app, 5000)
    app.listen(5000, () => {
        console.log("Server has started!")
    })
})
module.exports = app;