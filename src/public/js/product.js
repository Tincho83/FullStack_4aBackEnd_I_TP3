// Función para agregar producto al carrito
async function AddProducttoCart(productId) {

    let cartId = localStorage.getItem("IdCart");

    if (!cartId || cartId == null || cartId == undefined || cartId == "undefined") {
        // Si no hay carrito en localStorage, creamos uno nuevo
        try {
            const response = await fetch('/api/carts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Error al crear el carrito');
            }

            const newCart = await response.json();
            cartId = newCart.cartnuevo._id;

            // Guardamos el nuevo carrito en localStorage
            localStorage.setItem("IdCart", cartId);
        } catch (error) {
            console.error("Error al crear un nuevo carrito: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear un carrito nuevo.'
            });
            return;
        }
    }

    // Validar los ID
    if (!isValidObjectId(productId)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'ID de producto no válido.'
        });
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `ID(s) no válidos. Verifique los Is's ingresados.` });
    }

    if (cartId && !isValidObjectId(cartId)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'ID de carrito no válido.'
        });
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `ID(s) no válidos. Verifique los Is's ingresados.` });
    }
    console.log(`Carrito ID: ${cartId}, Producto ID: ${productId}`);

    try {
        const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
            //method: 'PUT',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            //body: JSON.stringify({ quantity })
        });

        if (response.ok) {
            const result = await response.json();
            Swal.fire({
                icon: 'success',
                title: 'Producto agregado al carrito',
                text: `El producto ha sido agregado correctamente`,
            });
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `No se pudo agregar el producto al carrito: ${errorData.error}`,
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al agregar el producto al carrito',
        });
    }
}





function addToCart(productId) {

    const cartId = 1; // Reemplaza con el ID del carrito correspondiente
    fetch(`/${cartId}/product/${productId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
            } else {
                console.log('Producto agregado al carrito:', data);
                alert('Producto agregado al carrito');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

    // Lógica para agregar el producto al carrito
    console.log(`Producto ${productId} agregado al carrito`);
}

function BackToProducts() {
    window.location.href = "/products";
}

function isValidObjectId(id) {
    return /^[a-f\d]{24}$/i.test(id);
}

// Función para ver el carrito
function ViewCart() {
    let cartId = localStorage.getItem("IdCart");

    if (!cartId || cartId == null || cartId == undefined || cartId == "undefined") {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No tienes un carrito activo. Agrega un producto para crearlo.',
        });
        return;
    }

    // Redirigir a la página del carrito
    window.location.href = `/carts/${cartId}`;
}