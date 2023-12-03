// import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
// import data from "../package.json" assert { type: "json" };
// const version = data.version;
const swaggerDocument = YAML.load("./swagger.yaml");

// const options = {
//   definition: {
//     openai: "3.0.0",
//     info: {
//       title: "EVOTE REST API Docs",
//       version,
//     },
//     components: {
//       securitySchemas: {
//         bearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//         },
//       },
//     },
//     security: [
//       {
//         bearerAuth: [],
//       },
//     ],
//   },
//   apis: ["./routes/*.js", "./models/*.js"],
// };

// const swaggerSpec = swaggerJSDoc(options);

function swaggerDocs(app, port) {
  // Swagger page
  //   app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Docs in JSON format
  app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    // res.send(swaggerSpec);
    res.send(swaggerDocument);
  });

  console.info(`Docs available at http://localhost:${port}/docs`);
}

export default swaggerDocs;
