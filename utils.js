const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");


//INICIALIZA EL JSON VERIFICA SI ESTA CREADO O NO
const initJSONFile = (filename) => {
  return async (req, res, next) => {
    const archivoFile = `${filename}s.json`;
    const archivo = path.join(__dirname, archivoFile);

    try {
      await fs.access(archivo); // SI EXISTE
      next();
    } catch (error) {
      try {
        // SI NO EXISTE
        await fs.writeFile(archivo, JSON.stringify({ [filename]: [] })); // SE CREA
        console.log(`Archivo ${archivoFile} creado correctamente`);
        next();
      } catch (e) {
        console.error(`Error interno al crear el archivo ${archivoFile}`, e);
      }
    }
  };
};
const agregarGastoJSON = async (roommate, descripcion, monto) => {
  const archivo = path.join(__dirname, "gastos.json");
  try {
    let contentJson = await fs.readFile(archivo, "utf-8");
    let data = contentJson ? JSON.parse(contentJson) : { gasto: [] }; //SE PARSEA O SE CREA DESDE 0
    data.gasto.push({ id: uuidv4().slice(0, 6), roommate, descripcion, monto });

    await fs.writeFile(archivo, JSON.stringify(data, null, 2));
    console.log(`Gasto agregado correctamente`);
  } catch (error) {
    console.error("Error al crear dato", error);
  }
};

const agregarRoomateJSON = async (nombre, recibe) => {
  const archivo = path.join(__dirname, "roommates.json");
  const recibeParseado = parseInt(recibe);
  try {
    let contentJson = await fs.readFile(archivo, "utf-8");
    let data = contentJson ? JSON.parse(contentJson) : { roommate: [] }; //SE PARSEA O SE CREA DESDE 0
    data.roommate.push({
      id: uuidv4().slice(0, 6),
      nombre,
      debe: 0,
      recibe: recibeParseado,
    });

    await fs.writeFile(archivo, JSON.stringify(data, null, 2));
    console.log(`Roommate ${nombre} agregado correctamente`);
  } catch (error) {
    console.error("Error al leer o escribir el archivo roommates.json", error);
  }
};

const eliminarGasto = async (id, res) => {
  let archivo = path.join(__dirname, "gastos.json");
  try {
    let contentJson = await fs.readFile(archivo, "utf-8");
    let data = JSON.parse(contentJson);
    let dataGasto = data.gasto;

    let index = dataGasto.findIndex((g) => g.id == id); //-1 NO HAY DATO
    if (index !== -1) {
      dataGasto.splice(index, 1); //INICIO Y FINAL
      dataGasto = data.gasto;
      await fs.writeFile(archivo, JSON.stringify(data));
      console.log("Gasto eliminado correctamente");
      res.status(200).json({message: "Gasto eliminado correctamente"});
    } else {
      console.log("Gasto no encontrado");
      res.status(404).json({message: "Gasto no encontrado"});
    }
  } catch (e) {
    console.log("Error al eliminar dato", e);
    res.status(500).json({message: "Error al eliminar dato"});
  }
};

const editarGasto = async (id, roommate, descripcion, monto, res) => {
  let archivo = path.join(__dirname, "gastos.json");
  console.log(roommate, descripcion, monto);
  try {
    let contentJson = await fs.readFile(archivo, "utf-8");
    let data = JSON.parse(contentJson);
    let dataGasto = data.gasto;

    let index = dataGasto.findIndex((g) => g.id == id); //-1 NO HAY DATO

    if (index !== -1) {
      dataGasto[index] = { id, roommate, descripcion, monto };
      await fs.writeFile(archivo, JSON.stringify(data, null, 2));
      console.log("Dato editado");
      res.status(200).json({ succes: true, message: "Dato editado" });
    } else {
      console.log("No existe dato");
      res.status(404).json({ succes: false, message: "El dato no existe" });
    }
  } catch (e) {
    console.log("Error al editar dato", e);
    res.status(500).json({ succes: false, message: "Error al editar dato" });
  }
};
//ACTUALIZA LA DEUDA DEL ROOMMATE 
const editarDebe = async (req, res, next) => {
  const archivoR = path.join(__dirname, "roommates.json");
  const archivoG = path.join(__dirname, "gastos.json");

  try {
    //JSON ROOMMATES
    let contentJsonR = await fs.readFile(archivoR, "utf-8");
    let dataR = JSON.parse(contentJsonR);
    let dataRoommate = dataR.roommate;

    //JSON GASTOS
    let contentJsonG = await fs.readFile(archivoG, "utf-8");
    let dataG = JSON.parse(contentJsonG);
    let dataGasto = dataG.gasto;

    //RESET
    dataRoommate.forEach((roommate) => {
      roommate.debe = 0;
    });

    //SEUMA SEGUN ROOMMATE
    dataGasto.forEach((gasto) => {
      let roommate = dataRoommate.find((r) => r.nombre === gasto.roommate);
      if (roommate) {
        roommate.debe += Number(gasto.monto);
      }
    });

    //ESCRIBE-SOBRESCRIBE
    await fs.writeFile(
      archivoR,
      JSON.stringify({ roommate: dataRoommate }, null, 2)
    );
    console.log(`Se actualizaron las deudas correctamente`);
  } catch (error) {
    console.error("Error al actualizar las deudas:", error);
  }
};
module.exports = {
  agregarGastoJSON,
  initJSONFile,
  agregarRoomateJSON,
  eliminarGasto,
  editarGasto,
  editarDebe,
};
