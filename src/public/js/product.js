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

function continueShopping() {
    // Lógica para continuar comprando
    window.location.href = '/'; // Redirige a la página principal o a la página de productos
}