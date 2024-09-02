
const express = require("express");
const  swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerLog = require("./logger.ts");
const  fs = require("fs");

const options= {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SWAGGER BLOGS API",
            version: "1.1"
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        email: { type: 'string' },
                        password: { type: 'string' }
                    },
                    required: ['email', 'password'],
                },
                Blog: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        content: { type: 'string' },
                        image: { type: 'string', default: '' },
                        public_id: { type: 'string', default: '' },
                        date: { type: 'string', format: 'date-time', default: new Date().toISOString() },
                        author: { type: 'string' },
                        comments: { 
                            type: 'array',
                            items: { type: 'string', format: 'uuid' } 
                        },
                        Likes: { 
                            type: 'array',
                            items: { type: 'string', format: 'uuid' } 
                        },
                        likesCount: { type: 'number', default: 0 }
                    },
                    required: ['title', 'content'],
                },
                Like: {
                    type: 'object',
                    properties: {
                        postId: { type: 'string', format: 'uuid' },
                        user: { type: 'string', format: 'uuid' },
                        date: { type: 'string', format: 'date-time', default: new Date().toISOString() }
                    },
                    required: ['postId', 'user'],
                },
                Comment: {
                    type: 'object',
                    properties: {
                        postId: { type: 'string', format: 'uuid' },
                        user: { type: 'string', format: 'uuid' },
                        content: { type: 'string' },
                        date: { type: 'string', format: 'date-time', default: new Date().toISOString() }
                    },
                    required: ['postId', 'user', 'content'],
                }
            },

        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./index.js", "./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app, port) {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get("/docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

  
    app.use((req, res, next) => {
        const host = req.get("host");
        const protocol = req.protocol;
        swaggerLog.info(`Swagger docs available at ${protocol}://${host}/docs`);
        next();
    });

}

module.exports = swaggerDocs;