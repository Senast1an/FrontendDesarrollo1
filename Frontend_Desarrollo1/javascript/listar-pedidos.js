(() => {
  const tabla = document.getElementById('tablaPedidos').querySelector('tbody');
  const btnLimpiar = document.getElementById('btnLimpiarBusquedaPedidos');
  let pedidos = [];

  async function cargarPedidos() {
    try {
      const resp = await fetch(API_BASE_URL + "/api/pedidos");
      if (!resp.ok) throw new Error("Error al cargar pedidos");
      pedidos = await resp.json();
      calcularTotales();
      renderPedidos();
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      tabla.innerHTML = `<tr><td colspan="8" class="text-danger">Error al cargar pedidos.</td></tr>`;
    }
  }

  function renderPedidos(filtro = '') {
    tabla.innerHTML = '';

    const filtrados = pedidos.filter(p =>
      p.cliente.ruc.includes(filtro) ||
      (p.cliente?.razonSocial?.toLowerCase() || '').includes(filtro.toLowerCase()) ||
      p.fechaPedido.includes(filtro)
    );

    if (filtrados.length === 0) {
      tabla.innerHTML = `<tr><td colspan="8" class="text-center">No se encontraron pedidos.</td></tr>`;
      return;
    }

    filtrados.forEach((pedido, index) => {
      const tr = document.createElement('tr');const estadoElemento = document.getElementById('detalleEstado');

      let estadoClass = '';


      switch (pedido.estado.toLowerCase()) {
        case 'pendiente':
          estadoClass = 'text-warning';
          break;
        case 'entregado':
          estadoClass = 'text-success';
          break;
        case 'cancelado':
          estadoClass = 'text-danger';
          break;
        default:
          estadoClass = 'text-secondary';
      }

      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${pedido.cliente.ruc}</td>
        <td>${pedido.cliente?.razonSocial || 'Cliente desconocido'}</td>
        <td>${pedido.fechaPedido.split("T")[0]}</td>
        <td>${pedido.fechaEntrega.split("T")[0]}</td>
        <td class="${estadoClass}">${pedido.estado}</td>
        <td>${pedido.total?.toFixed(2) || '0.00'}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="verDetallePedido('${pedido.idPedido}')">Ver</button>
          <button class="btn btn-sm btn-success" ${!pedido.modificable ? 'disabled' : ''} onclick="entregarPedido('${pedido.idPedido}')">Registrar entrega</button>
          <button class="btn btn-sm btn-danger" ${!pedido.modificable ? 'disabled' : ''} onclick="cancelarPedido('${pedido.idPedido}')">Cancelar pedido</button>
        </td>
      `;
      tabla.appendChild(tr);
    });
  }

  

  function calcularTotales() {
    pedidos.forEach((pedido, index) => {
      if (pedido.cancelado == true) {
        pedido.estado = 'Cancelado';
        pedido.modificable = false;
      } else if(pedido.entregado == true) {
        pedido.estado = 'Entregado';
        pedido.modificable = false;
      } else {
        pedido.estado = 'Pendiente'
        pedido.modificable = true;
      }
      pedido.total = pedido.detalles.reduce(
        (accumulator, detalle) => accumulator + (detalle.producto.precio * detalle.cantidad),
        0,
      );
    })
  }

  window.verDetallePedido = function (id) {
    const pedido = pedidos.find(p => p.idPedido === id);
    if (!pedido) return;

    document.getElementById('detalleRUC').textContent = pedido.cliente.ruc;
    document.getElementById('detalleCliente').textContent = pedido.cliente?.razonSocial || 'Sin cliente';
    document.getElementById('detalleFechaPedido').textContent = pedido.fechaPedido.split("T")[0];
    document.getElementById('detalleFechaEntrega').textContent = pedido.fechaEntrega.split("T")[0];
    document.getElementById('detalleEstado').textContent = pedido.estado;
    document.getElementById('detalleTotal').textContent = pedido.total?.toFixed(2) || '0.00';

    const tbody = document.getElementById('detalleProductosBody');
    tbody.innerHTML = '';
    pedido.detalles.forEach((det, i) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${det.producto.id}</td>
        <td>${det.producto.color.nombre}</td>
        <td>${det.producto.grosor}</td>
        <td>${det.producto.precio}</td>
        <td>${det.cantidad}</td>
        <td>$${(det.cantidad * det.producto.precio)?.toFixed(2) || '0.00'}</td>
      `;
      tbody.appendChild(row);
    });

    const modal = new bootstrap.Modal(document.getElementById('detallePedidoModal'));
    modal.show();
  };
  
  
  window.cancelarPedido = async function(id) {
    const confirmar = confirm("¿Estás seguro de que deseas cancelar este pedido?");
    if (!confirmar) return;

    try {
      const resp = await fetch(`${API_BASE_URL}/api/pedidos/${id}/cancelar`, {
        method: "PATCH"
      });

      if (resp.ok) {
        alert("✅ Pedido cancelado correctamente.");
        cargarPedidos?.(); // recargar si la función existe
      } else {
        alert("❌ Error al cancelar el pedido.");
      }
    } catch (err) {
      console.error("Error en cancelarPedido:", err);
      alert("❌ Error inesperado al cancelar el pedido.");
    }
  };

  window.entregarPedido = async function(id) {
    const confirmar = confirm("¿Confirmas que el pedido fue entregado?");
    if (!confirmar) return;

    try {
      const resp = await fetch(`${API_BASE_URL}/api/pedidos/${id}/entregar`, {
        method: "PATCH"
      });

      if (resp.ok) {
        alert("✅ Pedido marcado como entregado.");
        cargarPedidos?.();
      } else {
        alert("❌ Error al marcar como entregado.");
      }
    } catch (err) {
      console.error("Error en entregarPedido:", err);
      alert("❌ Error inesperado al marcar como entregado.");
    }
  };





  cargarPedidos();
})();
