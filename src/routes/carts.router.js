const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const CartsManager = require("../dao/filesystem/CartsManager.js");
const CartsManagerMongoDB = require("../dao/db/CartsManagerMongoDB.js");
const ProductsManagerMongoDB = require("../dao/db/ProductsManagerMongoDB.js");
const ProductsManager = require("../dao/filesystem/ProductsManager.js");
const { CartsModel } = require("../dao/models/CartsModel.js");
const { ProductsModel } = require("../dao/models/ProductsModel.js");

const router = Router();

CartsManager.path = "./src/data/carrito.json";

// Inicio DB
router.get('/todos', async (req, res) => {
    console.log("entro get");

    try {
        let carts = await CartsManagerMongoDB.getCartsDBMongo();
        console.log(`Se encontraron ${carts.length} productos.`);
        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ carts })
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
})

//5
router.get('/todos/:cid', async (req, res) => {
    console.log("entro get by id");

    let { cid } = req.params;
    console.log(cid);

    if (!isValidObjectId(cid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `id: ${cid} no valido,` })
    }

    try {
        // Usamos el método con populate para traer los productos completos
        let cart = await CartsManagerMongoDB.getCartByDBMongo(cid);
        if (!cart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: `Carrito con id: ${cid} no encontrado.` });
        }

        console.log(cart);
        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ cart });
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor. Intente nuevamente más tarde.`,
            detalle: error.message
        });
    }
    /*
           let cart = await CartsManagerMongoDB.getCartByDBMongo({ _id: id });
           if (!cart) {
               res.setHeader('Content-type', 'application/json');
               return res.status(400).json({ error: `No existen carritos con el id: ${id}` });
           }
           console.log(cart);
           res.setHeader('Content-type', 'application/json');
           return res.status(200).json({ cart })
       } catch (error) {
           console.log(error);
           res.setHeader('Content-type', 'application/json');
           return res.status(500).json({
               error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
               detalle: `${error.message}`
           });
       }
   
       */

});

router.post('/todos', async (req, res) => {
    console.log("entro post");

    const { products = [] } = req.body;
    console.log("prod: ", products);

    let carts = await CartsManagerMongoDB.getCartsDBMongo();
    console.log("carts: ", carts);

    let id = 1;
    if (carts.length > 0) {
        id = carts[carts.length - 1].id + 1;
    }
    console.log("id new cart: ", id);
    try {
        let cartnuevo = await CartsManagerMongoDB.addCartDBMongo({ products });

        console.log("Carrito Nuevo: ", cartnuevo);

        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ cartnuevo });

    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde.`,
            detalle: `${error.message}`
        });
    }
})
//6
router.post("/:cid/product/:pid", async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;

    // Validar los ID
    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `ID(s) no válidos. Verifique los Is's ingresados.` });
    }
    console.log(`Carrito ID: ${cid}, Producto ID: ${pid}`);

    try {
        const cart = await CartsManagerMongoDB.getCartById(cid);
        if (!cart) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `Carrito inexistente ${cid}` });
        }

        const product = await ProductsManagerMongoDB.getProductById(pid);
        if (!product) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `Producto ${pid} inexistente...!!!` });
        }

        await CartsManagerMongoDB.addProductToCartDBMongo(cid, pid);
        res.setHeader('Content-type', 'application/json');
        res.status(200).json('Producto agregado al carrito');
    } catch (error) {
        console.error('Error al agregar el producto al carrito:', error);
        res.setHeader('Content-type', 'application/json');
        res.status(500).send('Error al agregar el producto al carrito');
    }

});
//1
router.delete('/:cid/products/:pid', async (req, res) => {
    console.log("entro delete carritoId y prodId");

    let { cid, pid } = req.params;

    // Validar los ID
    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `ID(s) no válidos. Verifique los Is's ingresados.` });
    }
    console.log(`Carrito ID: ${cid}, Producto ID: ${pid}`);

    try {
        // Obtener el carrito actual
        let cart = await CartsManagerMongoDB.getCartByDBMongo(cid);
        if (!cart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: `Carrito no encontrado con ID: ${cid}` });
        }

        // Verificar si el producto está en el carrito
        let productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        if (productIndex === -1) {
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: `Producto no encontrado en el carrito con ID: ${pid}` });
        }

        // Eliminar el producto del carrito
        cart.products.splice(productIndex, 1);
        //await CartsManagerMongoDB.updateCartDBMongo(cid, cart);
        let prodDelete = await CartsManagerMongoDB.updateCartDBMongo(cid, cart);
        if (!prodDelete) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `No se pudo eliminar el producto id: ${cid}` })
        } else {
            req.socket.emit("ProductoBorrado", pid);
            console.log("Evento *ProductoBorrado* emitido");

            res.setHeader('Content-type', 'application/json');
            return res.status(200).json({ message: `Producto id: ${cid} eliminado del carrito exitosamente.` });
        }

        //let prodDelete = await ProductsManagerMongoDB.deleteProductDBMongo(id);
        //if (!prodDelete) {
        //    res.setHeader('Content-type', 'application/json');
        //    return res.status(400).json({ error: `No se pudo eliminar el producto id: ${id}` })
        //} else {
        //   res.setHeader('Content-type', 'application/json');
        //    return res.status(200).json({ prodDelete })
        //}
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
})

//2
router.put('/todos/:cid', async (req, res) => {
    console.log("\r\nentro al put");

    const { cid } = req.params;
    const productsToUpdate = req.body;

    console.log("con body:", productsToUpdate);

    if (!productsToUpdate.title || !productsToUpdate.description || !productsToUpdate.code || !productsToUpdate.price || !productsToUpdate.stock || !productsToUpdate.category) {
        res.setHeader('Content-type', 'application/json');
        return res.send({ status: "error", error: "Incomplete values" })
    }


    // Validar el ID del carrito
    if (!isValidObjectId(cid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `id: ${cid} no valido,` })
    }
    console.log("con params id:", cid);

    // Validar que el body contiene un arreglo de productos
    if (!Array.isArray(productsToUpdate)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: "Se esperaba un arreglo de productos en el body" });
    }

    try {
        // Verificar si el carrito existe
        const cart = await CartsManagerMongoDB.getCartByDBMongo(cid);
        if (!cart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: `Carrito no encontrado con ID: ${cid}` });
        }

        // Validar que los productos existen en la base de datos de productos
        for (let product of productsToUpdate) {
            if (!isValidObjectId(product.product)) {
                res.setHeader('Content-type', 'application/json');
                return res.status(400).json({ error: `ID de producto no válido: ${product.product}` });
            }

            const existingProduct = await ProductsModel.findById(product.product).lean();
            if (!existingProduct) {
                res.setHeader('Content-type', 'application/json');
                return res.status(404).json({ error: `Producto no encontrado con ID: ${product.product}` });
            }
        }

        // Actualizar el carrito con los nuevos productos
        cart.products = productsToUpdate;
        const updatedCart = await CartsManagerMongoDB.updateCartDBMongo(cid, cart);

        if (!updatedCart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `No se a podido actualizar el producto id: ${cid}, ${prodModified}` })
        }

        console.log("Carrito actualizado: ", updatedCart);

        // Emitir el evento de actualización
        req.socket.emit("CarritoActualizado", updatedCart);
        console.log("Evento *CarritoActualizado* emitido");

        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ success: "Carrito actualizado correctamente", updatedCart });

    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }


    /*
    
        let prodToModify = req.body;
        console.log("con body:", prodToModify);
    
        if (!prodToModify.title || !prodToModify.description || !prodToModify.code || !prodToModify.price || !prodToModify.stock || !prodToModify.category) {
            res.setHeader('Content-type', 'application/json');
            return res.send({ status: "error", error: "Incomplete values" })
        }
    
        //let existingProduct = await ProductsModel.findOne({ id: prodToModify.id });
        let existingProduct = await ProductsModel.findOne({ id: cid });
        console.log("Producto existente en DB? ", existingProduct);
        console.log("con params id:", cid);
    
        if (existingProduct && existingProduct.id !== cid) {
            console.log(existingProduct);
            res.setHeader('Content-type', 'application/json');
            return res.send({ status: "error", error: "Duplicate ID found" });
        }
    
        console.log("reemplazar");
    
    
    
        try {
            let prodModified = await ProductsManagerMongoDB.updateProductDBMongo(id, prodToModify)
            if (!prodModified) {
                res.setHeader('Content-type', 'application/json');
                return res.status(400).json({ error: `No se a podido actualizar el producto id: ${id}, ${prodModified}` })
            }
            console.log(prodModified);
    
            req.socket.emit("ProductoActualizado", prodModified);
            console.log("Evento *ProductoActualizado* emitido");
    
            res.setHeader('Content-type', 'application/json');
            return res.status(200).json({ success: `producto actualizado id: ${id}, ${prodModified}` })
    
        } catch (error) {
            console.log(error);
            res.setHeader('Content-type', 'application/json');
            return res.status(500).json({
                error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
                detalle: `${error.message}`
            });
        }
    */


    //let result = await ProductsModel.updateOne({ _id: prodid });
    //let result = await ProductsModel.updateOne({ id: prodid });
    //return res.send({ status: "sucess", payload: result })

    /*
        try {
            let result = await ProductsModel.updateOne(
                { id: prodid },
                { $set: prodToModify }
            );
            if (result.modifiedCount > 0) {
                return res.send({ status: "success", payload: result });
            } else {
                return res.send({ status: "error", error: "No document found with the provided ID" });
            }
        } catch (error) {
            return res.send({ status: "error", error: error.message });
        }
    */


});

//3
router.put('/todos/:cid/products/:pid', async (req, res) => {
    console.log("\r\nentro al put");

    const { cid, pid } = req.params;
    const { quantity } = req.body;

    // Validar el ID del carrito y del producto
    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: "ID de carrito o producto no válido" });
    }
    // Validar que la cantidad sea un número mayor que 0
    if (!quantity || typeof quantity !== "number" || quantity <= 0) {
        return res.status(400).json({ error: "Cantidad no válida, debe ser un número mayor que 0" });
    }


    console.log("reemplazar");

    try {
        // Verificar si el carrito existe en la base de datos
        const cart = await CartsManagerMongoDB.getCartByDBMongo(cid);
        if (!cart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: `Carrito no encontrado con ID: ${cid}` });
        }

        // Verificar si el producto existe en la base de datos
        const product = await ProductsManagerMongoDB.getProductsByDBMongo({ _id: pid });
        if (!product) {
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: `Producto no encontrado con ID: ${pid}` });
        }

        // Encontrar el producto en el carrito
        const productInCart = cart.products.find(p => p.product.toString() === pid);
        if (!productInCart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: `Producto no encontrado en el carrito con ID: ${pid}` });
        }

        // Actualizar la cantidad del producto en el carrito
        productInCart.quantity = quantity;

        // Guardar el carrito actualizado
        const updatedCart = await CartsManagerMongoDB.updateCartDBMongo(cid, cart);

        console.log("Carrito actualizado: ", updatedCart);

        // Emitir el evento de actualización
        req.socket.emit("CarritoActualizado", updatedCart);
        console.log("Evento *CarritoActualizado* emitido");

        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ success: "Cantidad de producto actualizada correctamente", updatedCart });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Error inesperado en el servidor. Intente más tarde.",
            detalle: error.message
        });
    }
});

//4
router.delete('/todos/:cid', async (req, res) => {
    console.log("entro delete carritoId");

    let { cid } = req.params;

    if (!isValidObjectId(cid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `id: ${cid} no valido,` })
    }
    console.log(cid);

    try {
        // Buscar el carrito en la base de datos
        const cart = await CartsManagerMongoDB.getCartByDBMongo(cid);
        if (!cart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: `Carrito no encontrado con ID: ${cid}` });
        }

        // Eliminar todos los productos del carrito
        cart.products = [];

        // Guardar el carrito actualizado
        const updatedCart = await CartsManagerMongoDB.updateCartDBMongo(cid, cart);

        console.log("Carrito actualizado: ", updatedCart);

        if (!updatedCart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `No se pudo eliminar los productos del carrito id: ${cid}` })
        } else {
            req.socket.emit("ProductoBorrado", id);
            console.log("Evento *ProductoBorrado* emitido");

            res.setHeader('Content-type', 'application/json');
            return res.status(200).json({ updatedCart })
        }
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
})


// Fin DB

router.post("/", async (req, res) => {

    const { products = [] } = req.body;


    let carts = await CartsManager.getCarts();

    let id = 1;
    if (carts.length > 0) {
        id = carts[carts.length - 1].id + 1;
    }

    try {
        let cartnuevo = await CartsManager.addCart({ products });

        console.log("Carrito Nuevo: ", cartnuevo);

        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ cartnuevo });

    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde.`,
            detalle: `${error.message}`
        });
    }
});


router.get("/:cid", async (req, res) => {
    let { cid } = req.params;
    cid = Number(cid);

    if (isNaN(cid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `Debe ingresar un Id numerico.` });
    }

    let carts;

    try {
        carts = await CartsManager.getCarts();
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde.`,
            detalle: `${error.message}`
        });
    }

    let cart = carts.find(idc => idc.id === cid);

    if (!cart) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `ID Cart ${cid} not found.` });
    }

    console.log("Productos del carrito '" + cid + "'", cart.products);

    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({ payload: cart.products });

});


router.post("/:cid/product/:pid", async (req, res) => {
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);

    if (isNaN(cid) || isNaN(pid)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Los ids deben ser numericos.` })
    }

    carts = await CartsManager.getCarts();
    let cart = carts.find(c => c.id === cid)
    if (!cart) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Carrito inexistente ${cid}` })
    }

    let prodss = await ProductsManager.getProducts();
    let existe = prodss.find(c => c.id === pid)
    if (!existe) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Producto ${pid} inexistente...!!!` })
    }

    try {
        await CartsManager.addProductToCart(cid, pid);
        res.setHeader('Content-type', 'application/json');
        res.status(200).json('Producto agregado al carrito');
    } catch (error) {
        res.setHeader('Content-type', 'application/json');
        res.status(500).send('Error al agregar el producto al carrito');
    }

});


module.exports = { router };

