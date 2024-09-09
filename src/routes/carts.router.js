const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const CartsManagerMongoDB = require("../dao/db/CartsManagerMongoDB.js");
const ProductsManagerMongoDB = require("../dao/db/ProductsManagerMongoDB.js");
const CartsManager = require("../dao/filesystem/CartsManager.js");
const ProductsManager = require("../dao/filesystem/ProductsManager.js");

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

router.get('/todos/:id', async (req, res) => {
    console.log("entro get by id");

    let { id } = req.params;
    console.log(id);
    if (!isValidObjectId(id)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `id: ${id} no valido,` })
    }

    try {
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

})

router.post('/todos', async (req, res) => {
    console.log("entro post");

    const { products = [] } = req.body;
    console.log("prod: ", products);

    let carts = await CartsManagerMongoDB.getCartsDBMongo();
    console.log("carts: ",carts );

    let id = 1;
    if (carts.length > 0) {
        id = carts[carts.length - 1].id + 1;
    }
    console.log("id new cart: ",id );
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

router.post("/:cid/product/:pid", async (req, res) => {
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);

    if (isNaN(cid) || isNaN(pid)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Los ids deben ser numericos.` })
    }

    carts = await CartsManagerMongoDB.getCartsDBMongo();
    let cart = carts.find(c => c.id === cid)
    if (!cart) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Carrito inexistente ${cid}` })
    }

    let prodss = await ProductsManagerMongoDB.getProductsDBMongo();
    let existe = prodss.find(c => c.id === pid)
    if (!existe) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Producto ${pid} inexistente...!!!` })
    }

    try {
        await CartsManagerMongoDB.addProductToCartDBMongo(cid, pid);
        res.setHeader('Content-type', 'application/json');
        res.status(200).json('Producto agregado al carrito');
    } catch (error) {
        res.setHeader('Content-type', 'application/json');
        res.status(500).send('Error al agregar el producto al carrito');
    }

});


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

