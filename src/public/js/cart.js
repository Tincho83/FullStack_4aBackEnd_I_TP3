function BackToProducts() {
    window.location.href = "/products";
}


async function DeleteProduct(productId, cartId) {
    console.log(`delete api/carts/${cartId}/product/${productId}`);
    const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {

                console.log("delete prod de la pagina");
                // Eliminar el producto de la interfaz de usuario
                document.querySelector(`[data-id="${productId}"]`).remove();

                console.log("actualizar subtotal");
                // Opcional: Actualizar el subtotal
                updateSubtotal();
            } else {
                console.error('Error al eliminar el producto');
            }
        })
        .catch(error => console.error('Error:', error));
}


function updateSubtotal() {
    let subtotal = 0;
    document.querySelectorAll('.divCardItem').forEach(item => {
        const price = parseFloat(item.querySelector('.ItemDataPrice').textContent.replace('Price: $', ''));
        const quantity = parseInt(item.querySelector('.ItemDataQty').textContent.replace('Quantity: ', ''));
        subtotal += price * quantity;
    });
    document.querySelector('.ItemDataSubtotal').textContent = `Subtotal: $ ${subtotal}`;
}