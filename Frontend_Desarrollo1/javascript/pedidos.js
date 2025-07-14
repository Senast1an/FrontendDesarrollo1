(() => {
  // Esta variable queda encapsulada, no global
  let lineasPedido = [];

    cargarClientesSelect();
    cargarProductosSelect();
    console.log("xd")

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

    document.getElementById("rucClienteSelect").addEventListener("change", async (e) => {
      const ruc = e.target.value;

      if (!ruc) {
        document.getElementById("datosCliente").innerHTML = "";
        return;
      }

      const resp = await fetch(`${API_BASE_URL}/api/clientes/${ruc}`);
      if (resp.ok) {
        const cliente = await resp.json();
        document.getElementById("datosCliente").innerHTML = `
          <div class="alert alert-info">
            <strong>${cliente.razonSocial}</strong><br>
            Correo: ${cliente.correo} | Teléfono: ${cliente.telefono}<br>
            Línea de crédito: $${cliente.lineaCredito} | Cuota: $${cliente.cuotaMensual}
          </div>`;
      } else {
        document.getElementById("datosCliente").innerHTML = `<div class="alert alert-danger">Cliente no encontrado</div>`;
      }
    });

    document.getElementById("formPedido").addEventListener("submit", async (e) => {
      e.preventDefault();
      const ruc = document.getElementById("rucClienteSelect").value.trim();
      const fechaEntrega = document.getElementById("fechaEntrega").value;

      if (!ruc || !fechaEntrega || lineasPedido.length === 0) {
        alert("Completa todos los campos y agrega al menos un producto");
        return;
      }

      const pedido = {
        cliente: { ruc },
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

  function renderTablaLineas() {
    const tbody = document.querySelector("#tablaLineasPedido tbody");
    tbody.innerHTML = "";
    lineasPedido.forEach((linea, index) => {
      tbody.innerHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${linea.producto.descripcion}</td>
          <td>${linea.cantidad}</td>
          <td><button class="btn btn-sm btn-danger" data-index="${index}">Eliminar</button></td>
        </tr>`;
    });

    // Reasigna listeners a los botones de eliminar
    tbody.querySelectorAll("button.btn-danger").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.dataset.index);
        lineasPedido.splice(i, 1);
        renderTablaLineas();
      });
    });
  }

  async function cargarClientesSelect() {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/clientes`);
      const data = await resp.json();

      const select = document.getElementById("rucClienteSelect");
      select.innerHTML = '<option value="">Seleccione un cliente</option>';
      data.forEach(c => {
        select.innerHTML += `<option value="${c.ruc}">${c.ruc} - ${c.razonSocial}</option>`;
      });
    } catch (err) {
      console.error("Error cargando clientes", err);
    }
  }

  async function cargarProductosSelect() {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/productos?activo=true`);
      const data = await resp.json();

      const select = document.getElementById("productoSelect");
      select.innerHTML = '<option value="">Seleccione un producto</option>';
      data.forEach(p => {
        const descripcion = `${p.color?.nombre || p.color?.codigo} - ${p.grosor}mm`;
        select.innerHTML += `<option value="${p.id}">${descripcion}</option>`;
      });
    } catch (err) {
      console.error("Error cargando productos", err);
    }
  }

})();
