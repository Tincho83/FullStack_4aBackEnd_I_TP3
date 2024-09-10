const socket = io();

let addstatus = true;
let divHora = document.getElementById("hhmm");

const inputTitle = document.getElementById("title");
const inputDescrip = document.getElementById("description");
const inputCode = document.getElementById("code");
const inputPrice = document.getElementById("price");
const inputStock = document.getElementById("stock");
const inputCateg = document.getElementById("category");
const btnSubmit = document.getElementById("btnSubmit");
const productListDiv = document.getElementById("product-list");

const getProducts = async () => {

    let res = await fetch(`/api/products/todos`);
    //let res = await fetch(`/realtimeproductsdb`);
    let data = await res.json();
    console.log("\r\nentro realtimeproducts.js");
    console.log(`Se hencontraron ${data.products.docs.length} productos.`);
    console.log(data);


    console.log(data.products.totalPages);

    let otpg = Number(data.products.totalPages);
    console.log(otpg);

    const paginateDiv = document.getElementById('paginate');

    if (!data.products.hasPrevPage) {
        const FirstPage = document.createElement("a");
        FirstPage.textContent = `[1] `;
        FirstPage.className = "paginacionfirst";
        FirstPage.href = `/api/products/todos?page=1`;
        paginateDiv.appendChild(FirstPage);

        if (data.products.nextPage) {
            const NextPage = document.createElement("a");
            NextPage.textContent = `[${data.products.nextPage}] `;
            NextPage.className = "paginacion";
            NextPage.href = `/api/products/todos?page=${data.products.nextPage}`;
            paginateDiv.appendChild(NextPage);
        } else {

        }

        if (data.products.totalPages) {
            const LastPage = document.createElement("a");
            LastPage.textContent = `[${data.products.totalPages}] `;
            LastPage.className = "paginacion";
            LastPage.href = `/api/products/todos?page=${data.products.totalPages}`;
            paginateDiv.appendChild(LastPage);
        }

    } else {

        let prevpg = Number(data.products.totalPages) - 1;
        const PrevPage = document.createElement("a");
        PrevPage.textContent = `[${prevpg}] `;
        PrevPage.className = "paginacionprev";
        PrevPage.href = `/api/products/todos?page=1`;
        paginateDiv.appendChild(PrevPage);
    }







    if (!data.products.hasPrevPage) {
        if (otpg < 4) {
            const FirstPage = document.createElement("a");
            FirstPage.textContent = ` [1] `;
            FirstPage.className = "paginacion";
            FirstPage.href = `/api/products/todos?page=1`;
            document.body.append(FirstPage);

            const NextPage = document.createElement("a");
            NextPage.textContent = ` [${data.products.nextPage}] `;
            NextPage.className = "paginacion";
            NextPage.href = `/api/products/todos?page=${data.products.nextPage}`;
            document.body.append(NextPage);

            const LastPage = document.createElement("a");
            LastPage.textContent = ` [${data.products.totalPages}] `;
            LastPage.className = "paginacion";
            LastPage.href = `/api/products/todos?page=${data.products.totalPages}`;
            document.body.append(LastPage);
        }
        else {
            const FirstPage = document.createElement("a");
            FirstPage.textContent = ` [1] `;
            FirstPage.className = "paginacion";
            FirstPage.href = `/api/products/todos?page=1`;
            document.body.append(FirstPage);

            const NextPage = document.createElement("a");
            NextPage.textContent = ` [${data.products.nextPage}] `;
            NextPage.className = "paginacion";
            NextPage.href = `/api/products/todos?page=${data.products.nextPage}`;
            document.body.append(NextPage);

            otpg = Number(data.products.nextPage) + 1;
            console.log(otpg);

            const OtNextPage = document.createElement("a");
            OtNextPage.textContent = ` [${otpg}] `;
            OtNextPage.className = "paginacion";
            OtNextPage.href = `/api/products/todos?page=${otpg}`;
            document.body.append(OtNextPage);

            const LastPage = document.createElement("a");
            LastPage.textContent = ` [${data.products.totalPages}] `;
            LastPage.className = "paginacion";
            LastPage.href = `/api/products/todos?page=${data.products.totalPages}`;
            document.body.append(LastPage);
        }
    } else {
        const FirstPage = document.createElement("a");
        FirstPage.textContent = ` [1] `;
        FirstPage.className = "paginacion";
        FirstPage.href = `/api/products/todos?page=1`;
        document.body.append(FirstPage);

        const NextPage = document.createElement("a");
        NextPage.textContent = ` [${data.products.nextPage}] `;
        NextPage.className = "paginacion";
        NextPage.href = `/api/products/todos?page=${data.products.nextPage}`;
        document.body.append(NextPage);

        const LastPage = document.createElement("a");
        LastPage.textContent = ` [${data.products.totalPages}] `;
        LastPage.className = "paginacion";
        LastPage.href = `/api/products/todos?page=${data.products.totalPages}`;
        document.body.append(LastPage);
    }




}

//getProducts();

btnSubmit.addEventListener("click", async (e) => {
    e.preventDefault();

    if (document.getElementById('btnSubmit').value == "Add Product") {
        addstatus = true;

        const product = {
            title: inputTitle.value,
            description: inputDescrip.value,
            code: inputCode.value,
            price: parseFloat(inputPrice.value),
            stock: parseInt(inputStock.value),
            category: inputCateg.value
        };

        if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category) {
            alert('Comprobar datos ingresados. Todos los campos son obligatorios.');
            return;
        }

        if (isNaN(product.price) || isNaN(product.stock)) {
            alert('Los campos precio y stock deben ser numericos.');
            return;
        }



        try {
            const response = await fetch(`/api/products/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product)
            })
                /*
                    .then(response => {
                        response.json()
                    })
                    .then(data => {
                        alert('Producto agregado correctamente.');
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Ocurrio un error al intentar agregar un producto.');
                    })
                    */
                ;



            const data = await response.json();

            console.log(data);

            if (response.ok) {
                alert('Producto agregado correctamente.');
            } else {
                alert(`Error: ${data.error}`);
            }



        } catch (error) {
            console.error('Error:', error);
            alert('Un error occurrio al intentar agregar el producto.');
        }
    } else {
    }
});


function ModifyProduct(_id, title, description, code, price, stock, category) {

    console.log(_id, title, description, code, price, stock, category);
    addstatus = false;

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    document.getElementById('productId').value = _id;
    document.getElementById('title').value = title;
    document.getElementById('description').value = description;
    document.getElementById('code').value = code;
    document.getElementById('price').value = price;
    document.getElementById('stock').value = stock;
    document.getElementById('category').value = category;

    const submitButton = document.getElementById('btnSubmit');
    submitButton.innerText = 'Modify Product';
    document.getElementById('btnSubmit').value = "Modify Product";

    submitButton.onclick = function (event) {
        if (document.getElementById('btnSubmit').value == "Modify Product") {

            event.preventDefault();
            const updatedProductId = {
                //id: parseInt(document.getElementById('productId').value, 10)                
            };
            const updatedProduct = {
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                code: document.getElementById('code').value,
                price: parseFloat(document.getElementById('price').value),
                stock: parseInt(document.getElementById('stock').value, 10),
                category: document.getElementById('category').value
            };

            console.log(price);
            console.log(stock);

            if (isNaN(updatedProduct.price) || isNaN(updatedProduct.stock) || typeof updatedProduct.price == null || typeof updatedProduct.stock == null) {
                alert('Los campos precio y stock deben ser numericos.');
                return;
            }

            if (!title || !description || !code || !price || !stock || !category) {
                alert('Comprobar datos ingresados. Todos los campos son obligatorios.');
                return;
            }


            fetch(`/api/products/todos/${_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedProduct)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Producto actualizado exitosamente.');
                        document.getElementById('btnSubmit').value = "Add Product";
                    } else {
                        console.log("Error: ", data);
                        alert(`Error al actualizar el producto ${_id}`);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert(`Error al actualizar el producto ${_id}`);
                });

            document.getElementById('productId').value = "";
            document.getElementById('title').value = "";
            document.getElementById('description').value = "";
            document.getElementById('code').value = "";
            document.getElementById('price').value = "";
            document.getElementById('stock').value = "";
            document.getElementById('category').value = "";
        };
    }
}


function DeleteProduct(productId) {
    if (confirm(`Deseas borrar el producto id ${productId}?`)) {
        fetch(`/api/products/todos/${productId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    eliminarProductoDelDOM(productId);
                    alert('Producto borrado correctamente.');
                } else {
                    return response.json().then(error => {
                        alert(`Hubo un fallo al querer borrar el producto: ${error.message}`);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Ocurrio un error al intentar borrar el producto.');
            });
    }
}

socket.on("HoraServidor", datosrecib => {
    divHora.textContent = `Hora: ${datosrecib}`;
});

socket.on("nuevoProducto", nuevoProd => {
    console.log("RT JS escucha:", nuevoProd)
    agregarProductoAlDOM(nuevoProd);
});

function agregarProductoAlDOM(product) {
    const productList = document.getElementById('product-list');

    if (!productList) {
        console.error('El elemento con id "product-list" no existe en el DOM.');
        return;
    }

    if (isNaN(product.price) || isNaN(product.stock)) {
        alert('Los campos precio y stock deben ser numericos.');
        return;
    }


    const newItem = document.createElement('div');
    newItem.className = 'divCardItem';
    //newItem.style.display = 'flex';
    //newItem.style.justifyContent = 'center';
    //newItem.style.alignItems = 'center';
    newItem.dataset.id = product._id;

    console.log("RT JS addtoDOM:", product)

    let disp = product.status ? "Si" : "No";

    let img = "";
    let alt = "";
    let pid = product._id;
    console.log("_id es: ", pid);

    if (product.thumbnails > 0) {
        alt = product.title;
        img = product.th.urlmain;

    } else {
        img = "https://media.istockphoto.com/id/1216251206/vector/no-image-available-icon.jpg?s=612x612&w=0&k=20&c=6C0wzKp_NZgexxoECc8HD4jRpXATfcu__peSYecAwt0=";
        alt = "Sin Imagen";
    }

    newItem.innerHTML = `
        <div class="CardItem">
            <div class="diviCartItem">
                <p>Disponible: ${disp}</p>
            </div>
            <div class="Header">
                <img src="${img}" alt="${alt}" class="ImgPic" />
                <div class="ItemData">
                    <p>${product.category}</p>
                    <h3 style="font-size: 1.5rem;">${product.title} - ${product.code}</h3>
                    <p class="ItemDataPrice">Price: $ ${product.price}</p>
                </div>
            </div>
            <div class="ItemCardFooter">
                <button onclick="DeleteProduct('${pid}')" id="btnDelete">Delete Product</button>
                <button onclick="ModifyProduct('${pid}', '${product.title}', '${product.description}', '${product.code}', ${product.price}, ${product.stock}, '${product.category}')" id="btnModify">Modify Product</button>
            </div>        
        </div>
    `;

    productList.appendChild(newItem);
}


socket.on("ProductoActualizado", Prodactuald => {
    //console.log("Evento *ProductoActualizado* recibido", Prodactuald);
    actualizarProductoEnDOM(Prodactuald);
});

function actualizarProductoEnDOM(product) {
    const productElement = document.querySelector(`[data-id="${product._id}"]`);

    if (productElement) {
        //console.log("Producto encontrado en DOM, actualizando...");
        productElement.querySelector('.ItemData p').innerText = product.category;
        productElement.querySelector('.ItemData h3').innerText = `${product.title} - ${product.code}`;
        productElement.querySelector('.ItemDataPrice').innerText = `Price: $ ${product.price}`;

        const btnModify = productElement.querySelector('#btnModify');
        if (btnModify) {
            btnModify.setAttribute('onclick', `ModifyProduct('${product._id}', '${product.title}', '${product.description}', '${product.code}', ${product.price}, ${product.stock}, '${product.category}')`);
        }
    } else {
        //console.log("Producto no encontrado en el DOM");
    }
}


socket.on("ProductoBorrado", Prodborrado => {
    eliminarProductoDelDOM(Prodborrado);
});


function eliminarProductoDelDOM(productId) {
    const productItem = document.querySelector(`[data-id="${productId}"]`);
    if (productItem) {
        productItem.remove();
    }
}

let pFecha = document.getElementById("DateLastAccess");

formatCurrentDate();

function formatCurrentDate() {
    const today = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const formattedDate = formatter.format(today);

    pFecha.textContent = `Fecha de Último Acceso: ${formattedDate}`;
}
