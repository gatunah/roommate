const express = require("express");
const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const {
  agregarGastoJSON,
  initJSONFile,
  agregarRoomateJSON,
  eliminarGasto,
  editarGasto,
  editarDebe
} = require("./utils");

const app = express();
const port = 3002;

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

app.use(express.json()); //PARA ACCEDER A req.body

//ESTATICOS
app.use(express.static("public"));
app.use("/axios", express.static(__dirname + "/node_modules/axios/dist"));

//VISTA
app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use(initJSONFile("roommate"));
app.use(initJSONFile("gasto"));

// Middleware PARA VER SOLICITUDES ENTRANTES
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`)
  next();
});

app.post("/roommate", (req, res) => {
  const { recibe } = req.query;
  axios
    .get("https://randomuser.me/api/")
    .then((response) => {
      const datos = response.data.results;
      const nombreCompleto = `${datos[0].name.first} ${datos[0].name.last}`;
      agregarRoomateJSON(nombreCompleto, recibe);
      res.status(200).json({
        success: true,
        message: `Roommate ${nombreCompleto} agregado correctamente`,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ success: false, message: "Error agregar dato" });
    });
});

app.get("/roommates", async (req, res) => {
  const archivo = path.join(__dirname, "roommates.json");
  try {
    let contentJson = await fs.readFile(archivo, "utf-8");
    let data = JSON.parse(contentJson);
    //await editarDebe();
    res.status(200).json({ roommates: data.roommate });
    //console.log(data.roommate);
  } catch (e) {
    console.error("Error al leer el archivo", e);
    res
      .status(500)
      .json({ success: false, message: "Error al leer el archivo" });
  }
});

app.post("/gasto", async (req, res) => {
  const archivo = path.join(__dirname, "gastos.json");
  const { roommate, descripcion, monto } = req.body;
  //console.log(roommate, descripcion, monto);
  try {
    await agregarGastoJSON(roommate, descripcion, monto);
    await editarDebe();
    res.status(200).json({
      success: true,
      message: `Gasto de ${roommate} agregado correctamente`,
    });
    console.log(`Gasto de ${roommate} agregado correctamente`);
  } catch (e) {
    res.status(500).json({
      succes: false,
      message: `Error al crear dato`,
      e,
    });
  }
});

app.get("/gastos", async (req, res) => {
  const archivo = path.join(__dirname, "gastos.json");
  try {
    let contentJson = await fs.readFile(archivo, "utf-8");
    let data = JSON.parse(contentJson);
    res.status(200).json({ gastos: data.gasto });
    //console.log(data.gasto);
  } catch {
    res
      .status(500)
      .json({ succes: false, message: "Error al recopilar datos" });
  }
});

app.put("/gasto", async (req, res) => {
  let { id } = req.query;
  let { roommate, descripcion, monto } = req.body;
  try {
    const data = await editarGasto(id, roommate, descripcion, monto, res);
    await editarDebe();
   
  } catch (e) {
    console.log("error", e);
    res
      .sendStatus(500)
      .json({ success: false, message: "Error interno al editar dato", e });
  }
});

app.delete("/gasto", async (req, res) => {
  const { id } = req.query;
  //console.log(id);
  try {
    await eliminarGasto(id, res);
    await editarDebe();
  } catch (e) {
    console.log("Error:", e);
    res.status(500).json({succes: false, message: "Error al eliminar el gasto"});
  }
});
