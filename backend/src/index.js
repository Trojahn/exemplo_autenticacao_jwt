const express = require("express");
const cors = require("cors");
const { swaggerUi, specs } = require("./swagger");

const corsOptions = {
  origin: "*", // Permite todas as origens
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Métodos permitidos
  allowedHeaders: ["Content-Type", "Authorization"], // Cabeçalhos permitidos
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }", // Remove a barra de identificação do swagger.
    customSiteTitle: "Documentação da API de exemplo",
  })
);

const rotas = require("./routes/rotas");
app.use("/", rotas);

app.listen(3000, () => {
  console.log("Servidor executando em http://localhost:3000");
});
