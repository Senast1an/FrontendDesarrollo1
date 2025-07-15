(() => {
  let editando = false;

  const tabla = document.querySelector("#clientesTable tbody");
  const modal = new bootstrap.Modal(document.getElementById("clienteModal"));
  const form = document.getElementById("clienteForm");

  cargarClientes();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cliente = {
      ruc: document.getElementById("rucCliente").value.trim(),
      razonSocial: document.getElementById("razonSocial").value.trim(),
      correo: document.getElementById("correo").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      lineaCredito: parseFloat(document.getElementById("lineaCredito").value),
      cuotaMensual: parseFloat(document.getElementById("cuotaMensual").value)
    };

    let url = `${API_BASE_URL}/api/clientes`;
    let metodo = "POST";

    if (editando) {
      url += `/${cliente.ruc}`;
      metodo = "PUT";
    }

    try {
      const resp = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente)
      });

      if (resp.ok) {
        alert(`Cliente ${editando ? "actualizado" : "registrado"} correctamente`);
        form.reset();
        modal.hide();
        cargarClientes();
      } else {
        alert("❌ Error al guardar el cliente");
      }
    } catch (err) {
      console.error("Error al guardar cliente:", err);
      alert("❌ Error inesperado");
    }
  });

  async function cargarClientes() {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/clientes`);
      const data = await resp.json();

      tabla.innerHTML = "";
      data.forEach((c, i) => {
        tabla.innerHTML += `
          <tr>
            <td>${i + 1}</td>
            <td>${c.ruc}</td>
            <td>${c.razonSocial}</td>
            <td>${c.correo}</td>
            <td>${c.telefono}</td>
            <td>$${c.lineaCredito}</td>
            <td>$${c.cuotaMensual}</td>
          </tr>`;
      });
    } catch (err) {
      console.error("Error cargando clientes:", err);
      tabla.innerHTML = `<tr><td colspan="8" class="text-danger text-center">Error al cargar clientes</td></tr>`;
    }
  }

//   window.editarCliente = async function (ruc) {
//     try {
//       const resp = await fetch(`${API_BASE_URL}/api/clientes/${ruc}`);
//       if (!resp.ok) throw new Error("Cliente no encontrado");
//       const c = await resp.json();

//       editando = true;
//       document.getElementById("clienteRUCEditando").value = c.ruc;
//       document.getElementById("rucCliente").value = c.ruc;
//       document.getElementById("rucCliente").disabled = true;
//       document.getElementById("razonSocial").value = c.razonSocial;
//       document.getElementById("correo").value = c.correo;
//       document.getElementById("telefono").value = c.telefono;
//       document.getElementById("lineaCredito").value = c.lineaCredito;
//       document.getElementById("cuotaMensual").value = c.cuotaMensual;

//       document.getElementById("clienteModalLabel").textContent = "Editar Cliente";
//       modal.show();
//     } catch (err) {
//       alert("No se pudo cargar cliente");
//     }
//   };

  // Resetear al cerrar modal
  document.getElementById("clienteModal").addEventListener("hidden.bs.modal", () => {
    form.reset();
    editando = false;
    document.getElementById("rucCliente").disabled = false;
    document.getElementById("clienteModalLabel").textContent = "Nuevo Cliente";
  });

})();