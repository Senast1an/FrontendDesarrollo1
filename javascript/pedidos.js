let lineasPedido = [];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnBuscarCliente").addEventListener("click", async () => {
    const ruc = document.getElementById("rucCliente").value.trim();
    if (!ruc) return;

    const resp = await fetch(`${API_BASE_URL}/api/clientes/${ruc}`);
    if (resp.ok) {
      const cliente = await resp.json();
      document.getElementById("datosCliente").innerHTML = `
        <div class="alert alert-info">
          <strong>${cliente.razonSocial}</strong><br>
          Correo: ${cliente.correo} | Teléfono: ${cliente.telefono}<br>
          Línea de crédito: $${cliente.lineaCredito} | Cuota: $${cliente.cuota}
        </div>`;
    } else {
      document.getElementById("datosCliente").innerHTML = `<div class="alert alert-danger">Cliente no encontrado</div>`;
    }
  });

  document.getElementById("btnAgregarLinea").addEventListener("click", () => {
    const productoId = document.getElementById("productoSelect").value;
    const cantidad = parseInt(document.getElementById("cantidadProducto").value);

    if (!productoId || isNaN(cantidad) || cantidad <= 0) {
      alert("Selecciona un producto y cantidad válida");
      return;
    }

    const nombreProducto = document.getElementById("productoSelect").selectedOptions[0].text;
    lineasPedido.push({
      posicion: lineasPedido.length + 1,
      producto: { id: productoId, descripcion: nombreProducto },
      cantidad
    });

    renderTablaLineas();
    document.getElementById("productoSelect").value = "";
    document.getElementById("cantidadProducto").value = "";
  });

  document.getElementById("formPedido").addEventListener("submit", async (e) => {
    e.preventDefault();
    const ruc = document.getElementById("rucCliente").value.trim();
    const fechaEntrega = document.getElementById("fechaEntrega").value;
    const fechaPedido = document.getElementById("fechaPedido").value;

    if (!ruc || !fechaEntrega || lineasPedido.length === 0) {
      alert("Completa todos los campos y agrega al menos un producto");
      return;
    }

    const pedido = {
      cliente: { ruc },
      fechaPedido,
      fechaEntrega,
      detalles: lineasPedido
    };

    const resp = await fetch(`${API_BASE_URL}/api/pedidos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido)
    });

    if (resp.ok) {
      alert("✅ Pedido registrado con éxito");
      document.getElementById("formPedido").reset();
      document.getElementById("datosCliente").innerHTML = "";
      lineasPedido = [];
      renderTablaLineas();
    } else {
      alert("Error al registrar el pedido");
    }
  });
});

function renderTablaLineas() {
  const tbody = document.querySelector("#tablaLineasPedido tbody");
  tbody.innerHTML = "";
  lineasPedido.forEach((linea, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${linea.producto.descripcion}</td>
        <td>${linea.cantidad}</td>
        <td><button class="btn btn-sm btn-danger" onclick="eliminarLinea(${index})">Eliminar</button></td>
      </tr>`;
  });
}

window.eliminarLinea = (index) => {
  lineasPedido.splice(index, 1);
  renderTablaLineas();
};
