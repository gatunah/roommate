let roommates = [];
let gastos = [];
let gastoEditing = null;

const getRoommates = async () => {
  const res = await fetch("http://localhost:3002/roommates");
  const data = await res.json();
  roommates = data.roommates;
  //console.log(roommates);
};

const getGastos = async () => {
  const res = await fetch("http://localhost:3002/gastos");
  const data = await res.json();
  gastos = data.gastos;
  //console.log(gastos);
};

const imprimir = async () => {
  try {
    await getRoommates();
    await getGastos();
    $("#roommates").html("");
    $("#roommatesSelect").html("");
    $("#roommatesSelectModal").html("");
    //console.log(roommates);
    roommates.forEach((r) => {
      $("#roommatesSelect").append(`
          <option value="${r.nombre}">${r.nombre}</option>
          `);
      $("#roommatesSelectModal").append(`
          <option value="${r.nombre}">${r.nombre}</option>
          `);
      $("#roommates").append(`
                  <tr>
                    <td>${r.nombre}</td>
                    <td class="text-danger">$${r.debe ? r.debe : "0"}</td>
                    <td class="text-success">$${r.recibe ? r.recibe : "0"}</td>
                  </tr>
              `);
    });
    $("#gastosHistorial").html("");
    gastos.forEach((g) => {
      $("#gastosHistorial").append(`
                <tr>
                  <td>${g.roommate}</td>
                  <td>${g.descripcion}</td>
                  <td>${g.monto}</td>
                  <td class="d-flex align-items-center justify-content-between">
                    <i class="fas fa-edit text-warning" onclick="editGasto('${g.id}')" data-toggle="modal" data-target="#exampleModal"></i>
                    <i class="fas fa-trash-alt text-danger" onclick="deleteGasto('${g.id}')" ></i>
                  </td>
                </tr>
              `);
    });
  } catch (e) {
    console.log(e);
  }
};

const nuevoRoommate = async (recibeInput) => {
  //console.log(recibeInput);
  await fetch("http://localhost:3002/roommate?recibe=" + recibeInput, { method: "POST" })
  
    .then((res) => res.json())
    .then((data) => {
      //console.log("Response Data:", data);
      toastAlert(data.message);      
    })
    .catch((error) => {
      console.error('Error:', error);
    });
    imprimir();
};

const agregarGasto = async () => {
  const roommateSelected = $("#roommatesSelect").val();
  const descripcion = $("#descripcion").val();
  const monto = Number($("#monto").val());
  //console.log(roommateSelected,descripcion,monto);
  await fetch("http://localhost:3002/gasto", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      roommate: roommateSelected,
      descripcion,
      monto,
    }),
  });
  imprimir();
};

const deleteGasto = async (id) => {
  try {
    await fetch("http://localhost:3002/gasto?id=" + id, {
      method: "DELETE",
    });
    imprimir(); 
  } catch (error) {
    console.error("Error al eliminar el gasto:", error);
  }
};
const updateGasto = async () => {
  const roommateSelected = $("#roommatesSelectModal").val();
  const descripcion = $("#descripcionModal").val();
  const monto = Number($("#montoModal").val());
  //console.log(gastoEditing);
  
  await fetch("http://localhost:3002/gasto?id=" + gastoEditing, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
    body: JSON.stringify({
      roommate: roommateSelected,
      descripcion,
      monto,
    }),
  });
  $("#exampleModal").modal("hide");
  imprimir();
};

const editGasto = (id) => {
  gastoEditing = id;
  const { roommate, descripcion, monto } = gastos.find((g) => g.id == id);
  $("#roommatesSelectModal").val(roommate);
  $("#descripcionModal").html(descripcion);
  $("#montoModal").val(monto);
};

imprimir();

function toastAlert(message) {
  $("#toastContainer").empty();
  const toast = `<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-delay="5000">
    <div class="toast-header">
      
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>  </div>
    <div class="toast-body">
      ${message}
    </div>
    </div>`;
  $("#toastContainer").append(toast);
  $(".toast").toast("show");
  $("#exampleModal").modal("hide");
}
