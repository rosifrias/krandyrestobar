function cambiarCantidad(boton, cambio) {
    const input = boton.parentElement.querySelector('input[type="number"]');
    let valor = parseInt(input.value);
    valor += cambio;
    if (valor < 1) valor = 1;
    input.value = valor;
}

function agregarDesdeHTML(boton, nombreProducto, precioProducto) {
    // Buscar el input dentro del mismo contenedor
    const container = boton.parentElement;
    const inputCantidad = container.querySelector('.quantity-control input[type="number"]');
    const cantidad = parseInt(inputCantidad.value);

    // Llamamos a la función general de agregar con cantidad
    addToCart(nombreProducto, precioProducto, cantidad);
}

let cart = [];
let total = 0;

function addToCart(item, precio, cantidad = 1) {
    // Verificar si el producto ya está en el carrito
    const index = cart.findIndex(producto => producto.item === item);
    if (index !== -1) {
        cart[index].cantidad += cantidad;
    } else {
        cart.push({ item, precio, cantidad });
    }

    // Recalcular total
    total = cart.reduce((acc, producto) => acc + producto.precio * producto.cantidad, 0);

    guardarCarrito();
    renderCarrito();
    actualizarBotonPedido();
    actualizarCarritoFlotante();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    total = cart.reduce((acc, producto) => acc + producto.precio * producto.cantidad, 0);

    guardarCarrito();
    renderCarrito();
    actualizarBotonPedido();
    actualizarCarritoFlotante();
}

function renderCarrito() {
    const carritoElemento = document.getElementById('cart');
    carritoElemento.innerHTML = '';
    cart.forEach((producto, index) => {
        const li = document.createElement('li');
        li.classList.add('cart-item');

        const span = document.createElement('span');
        span.textContent = `${producto.item} x${producto.cantidad} - ${formatearPrecio(producto.precio * producto.cantidad)}`;
        span.classList.add('product-details');

        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = 'Eliminar';
        botonEliminar.classList.add('button-remove');
        botonEliminar.onclick = () => {
            if (confirm("¿Seguro que deseas eliminar este producto?")) {
                removeFromCart(index);
            }
        };

        li.appendChild(span);
        li.appendChild(botonEliminar);
        carritoElemento.appendChild(li);
    });
    document.getElementById('total').textContent = formatearPrecio(total);
}

function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(precio);
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(cart));
    localStorage.setItem('total', total.toString());
}

function cargarCarrito() {
    try {
        const carritoGuardado = JSON.parse(localStorage.getItem('carrito'));
        if (Array.isArray(carritoGuardado)) {
            cart = carritoGuardado;
        } else {
            cart = [];
        }
    } catch (e) {
        cart = [];
    }
    total = cart.reduce((acc, producto) => acc + producto.precio * producto.cantidad, 0);
    renderCarrito();
    actualizarBotonPedido();
    actualizarCarritoFlotante();
}

function actualizarBotonPedido() {
    const botonEnviarPedido = document.getElementById('sendOrder');
    botonEnviarPedido.disabled = cart.length === 0;
}

function actualizarCarritoFlotante() {
    const count = cart.reduce((acc, producto) => acc + producto.cantidad, 0);
    const floatingCart = document.getElementById('floating-cart');
    const floatingCount = document.getElementById('floating-count');
    floatingCount.textContent = count;
    floatingCart.style.display = count > 0 ? 'block' : 'none';
}

// Evento para enviar pedido por WhatsApp (igual que antes)
document.getElementById('sendOrder').addEventListener('click', () => {
    if (cart.length === 0) return;

    const numeroTelefono = '56954381023';
    let textoPedido = 'Hola, quiero hacer el siguiente pedido:\n';
    cart.forEach(producto => {
        textoPedido += `${producto.item} x${producto.cantidad} - ${formatearPrecio(producto.precio * producto.cantidad)}\n`;
    });
    textoPedido += `Total: ${formatearPrecio(total)}`;
    
    const textoCodificado = encodeURIComponent(textoPedido);
    const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${textoCodificado}`;
    window.open(urlWhatsApp, '_blank');
    
    document.getElementById('sendOrder').disabled = true;
});

// Al cargar la página, carga el carrito guardado
window.onload = cargarCarrito;

document.getElementById('floating-cart').addEventListener('click', () => {
    const carrito = document.getElementById('cart');
    if (carrito) {
        // Scroll suave al contenedor del carrito
        carrito.scrollIntoView({ behavior: 'smooth', block: 'end' });

        // Fallback adicional para asegurar que se vea bien el final en móviles
        setTimeout(() => {
            window.scrollBy(0, 300); // Ajusta este valor si aún no alcanza el final
        }, 600);
    }
});