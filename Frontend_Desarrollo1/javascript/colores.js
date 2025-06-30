document.getElementById("colorForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const codigo = document.getElementById("codigo").value.toUpperCase();
    const nombre = document.getElementById("nombre").value;
    const hex = document.getElementById("hex").value.substring(1,7);

    const color = { codigo, nombre, hex };

    const resp = await fetch(API_BASE_URL + "/api/colores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(color)
    });

    if (resp.ok) {
        cargarColores(); // Reusar desde productos.js
        document.getElementById("colorForm").reset();
        bootstrap.Modal.getInstance(document.getElementById("colorModal")).hide();
    }
});
