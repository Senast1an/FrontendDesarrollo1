document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    cargarColores();

    document.getElementById("productoForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const colorId = document.getElementById("colorSelect").value;
        const grosor = parseFloat(document.getElementById("grosor").value);
        const precio = parseFloat(document.getElementById("precio").value);
        const stock = parseInt(document.getElementById("stock").value);

        const producto = { color: { codigo: colorId }, grosor, precio, stock };

        const resp = await fetch(API_BASE_URL + "/api/productos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto)
        });

        if (resp.ok) {
            cargarProductos();
            document.getElementById("productoForm").reset();
            bootstrap.Modal.getInstance(document.getElementById("productoModal")).hide();
        }
    });
});

async function cargarProductos() {
    const resp = await fetch(API_BASE_URL + "/api/productos");
    const data = await resp.json();

    const tbody = document.querySelector("#productosTable tbody");
    tbody.innerHTML = "";
    data.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <th scope="row">${p.id}</td>
                <td>${p.color?.nombre || p.color?.codigo}</td>
                <td>${p.grosor}</td>
                <td>${p.precio}</td>
                <td>${p.stock}</td>
                <td class="${p.activo ? 'text-success' : 'text-danger'}">${p.activo ? "✅ Activo" : "❌ Inactivo"}</td>
                <td>
                    <button onclick="editarProducto('${p.id}')">✏️ Editar</button>
                    <button onclick="toggleActivo('${p.id}', ${p.activo})">${p.activo ? "🚫 Desactivar" : "✅ Activar"}</button>
                </td>
            </tr>`;
    });
}

async function cargarColores() {
    const resp = await fetch(API_BASE_URL + "/api/colores");
    const data = await resp.json();

    const select = document.getElementById("colorSelect");
    select.innerHTML = `<option value="">Selecciona un color</option>`;
    data.forEach(c => {
        select.innerHTML += `<option value="${c.codigo}">${c.nombre}</option>`;
    });


    
}

function toggleActivo(id, activo) {
  fetch(API_BASE_URL + "/api/productos/" + id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activo: !activo })
  })
  .then(res => {
    if (res.ok) {
      alert(activo ? "Producto marcado como inactivo" : "Producto marcado como activo");
      cargarProductos(); // Recarga la tabla
    } else {
      alert("Error al cambiar estado");
    }
  });
}


let currentEditId = null;

function editarProducto(id) {
  fetch(API_BASE_URL + "/api/productos/" + id)
    .then(res => res.json())
    .then(p => {
      currentEditId = p.id;
      document.getElementById("producto-editar-id").innerHTML = `(${id})`;
      document.getElementById("editar-id").value = p.id;
      document.getElementById("editar-grosor").value = p.grosor;
      document.getElementById("editar-precio").value = p.precio;
      document.getElementById("editar-stock").value = p.stock;

      // Rellenar colores
      fetch(API_BASE_URL + "/api/colores")
        .then(res => res.json())
        .then(colores => {
          const select = document.getElementById("editar-color");
          select.innerHTML = "";
          colores.forEach(c => {
            const option = document.createElement("option");
            option.value = c.codigo;
            option.text = c.nombre;
            if (p.color.codigo === c.codigo) option.selected = true;
            select.appendChild(option);
          });
        });

      const modal = new bootstrap.Modal(document.getElementById('editarProductoModal'));
      modal.show();
    });
}

// Evento del formulario
document.getElementById("formEditarProducto").addEventListener("submit", function(e) {
  e.preventDefault();

  const producto = {
    color: { codigo: document.getElementById("editar-color").value },
    grosor: parseFloat(document.getElementById("editar-grosor").value),
    precio: parseFloat(document.getElementById("editar-precio").value),
    stock: parseInt(document.getElementById("editar-stock").value)
  };

  fetch(API_BASE_URL + "/api/productos/" + currentEditId, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto)
  })
  .then(res => {
    if (res.ok) {
      alert("Producto actualizado");
      bootstrap.Modal.getInstance(document.getElementById('editarProductoModal')).hide();
      cargarProductos(); // Vuelve a cargar la tabla
    } else {
      alert("Error al actualizar producto");
    }
  });
});
