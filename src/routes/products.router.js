const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const ProductsManager = require("../dao/ProductsManager.js");
const ProductsManagerMongoDB = require("../dao/mongodb/ProductsManagerMongoDB");
const { ProductsModel } = require("../dao/models/ProductsModel.js");

const router = Router();

ProductsManager.path = "./src/data/productos.json";

// Inicio DB
router.get('/todos', async (req, res) => {
    console.log("entro get");
    /*
    try {
        let products = await ProductsModel.find();
        console.log("products", products);
        res.send({ result: "success", payload: products });
    } catch (error) {
        console.log("Cannot get users with mongoose: " + error);
    }
    */
    try {
        let products = await ProductsManagerMongoDB.getProductsDBMongo();
        console.log(products);
        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ products })
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
    if(!isValidObjectId(id)){
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error:`id: ${id} no valido,` })
    }
    console.log(id);

    try {
        //let product = await ProductsManagerMongoDB.getProductsByDBMongo({id: id});
        let product = await ProductsManagerMongoDB.getProductsByDBMongo({ _id: id });
        if(!product){
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error:`No existen usuarios con el id: ${id}` });
        }
        console.log(product);
        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ product })
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
    let { id, title, description, code, price, stock, category } = req.body;

    console.log("entro post");

    if (!id || !title || !description || !code || !price || !stock || !category) {
        return res.send({ status: "error", error: "Incomplete values." });
    }

    console.log(id, title, description, code, price, stock, category);

    let result = await ProductsModel.create({
        id,
        title,
        description,
        code,
        price,
        stock,
        category
    });
    res.send({ status: "sucess", payload: result })
})

router.put('/todos/:prodid', async (req, res) => {
    console.log("entro put");

    let { prodid } = req.params;
    console.log(prodid);

    let prodToReplace = req.body;
    console.log(prodToReplace);

    if (!prodToReplace.title || !prodToReplace.description || !prodToReplace.code || !prodToReplace.price || !prodToReplace.stock || !prodToReplace.category) {
        return res.send({ status: "error", error: "Incomplete values" })
    }

    let existingProduct = await ProductsModel.findOne({ id: prodToReplace.id });
    if (existingProduct && existingProduct.id !== prodid) {
        return res.send({ status: "error", error: "Duplicate ID found" });
    }

    console.log("reemplazar");

    //let result = await ProductsModel.updateOne({ _id: prodid });
    //let result = await ProductsModel.updateOne({ id: prodid });
    //return res.send({ status: "sucess", payload: result })


    try {
        let result = await ProductsModel.updateOne(
            { id: prodid },
            { $set: prodToReplace }
        );
        if (result.modifiedCount > 0) {
            return res.send({ status: "success", payload: result });
        } else {
            return res.send({ status: "error", error: "No document found with the provided ID" });
        }
    } catch (error) {
        return res.send({ status: "error", error: error.message });
    }



})

router.delete('/todos/:prodid', async (req, res) => {
    console.log("entro delete");

    let { prodid } = req.params;
    console.log(prodid);

    try {
        let result = await ProductsModel.deleteOne({ id: prodid });
        if (result.deletedCount > 0) {
            res.send({ status: "success", payload: result });
        } else {
            res.send({ status: "error", error: "No document found with the provided ID" });
        }
    } catch (error) {
        console.error("Error during deletion:", error); // Log the error for debugging
        res.send({ status: "error", error: error.message }); // Send error message to client
    }
})
// Fin DB

// FileSystem
router.get("/", async (req, res) => {
    let prodss;

    try {
        prodss = await ProductsManager.getProducts();
        console.log(prodss);
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }

    let { limit, skip } = req.query;

    if (limit) {
        limit = Number(limit);
        if (isNaN(limit)) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `El argumento limit debe ser numerico.` });
        }
    } else {
        limit = prodss.length;
    }

    if (skip) {
        skip = Number(skip);
        if (isNaN(skip)) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `El argumento skip debe ser numerico.` });
        }
    } else {
        skip = 0;
    }

    let resultado = prodss.slice(skip, skip + limit);

    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({ resultado });
});

router.get("/:pid", async (req, res) => {
    let { pid } = req.params;
    pid = Number(pid);

    if (!isValidObjectId(pid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `Id no valido.` });
    }

    if (isNaN(pid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `Debe ingresar un Id numerico.` });
    }

    let prods;

    try {
        prods = await ProductsManager.getProducts();
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde.`,
            detalle: `${error.message}`
        });
    }

    let prod = prods.find(idp => idp.id === pid);

    if (!prod) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `ID Product ${pid} not found.` });
    }

    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({ payload: prod });

});

router.post("/", async (req, res) => {

    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: 'Por favor complete todos los atributos, son obligatorios, excepto thumbnails' });
    }

    let prods = await ProductsManager.getProducts();

    let existe = prods.find(prod => prod.code.toLowerCase() === code.toLowerCase());

    if (existe) {
        console.log("Producto Existente: ", existe);
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `Ya existe un producto con codigo ${code}` });
    } else {
        console.log("Producto Existente: No");
    }

    let id = 1;
    if (prods.length > 0) {
        id = prods[prods.length - 1].id + 1;
    }

    try {
        let prodnuevo = await ProductsManager.addProduct({ title, description, code, price, status, stock, category, thumbnails });

        req.socket.emit("nuevoProducto", prodnuevo);
        console.log("Evento *nuevoProducto* emitido");

        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ prodnuevo });

    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde.`,
            detalle: `${error.message}`
        });
    }

});


router.put("/:pid", async (req, res) => {

    let { pid } = req.params;
    pid = Number(pid);
    if (isNaN(pid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `Debe ingresar un Id numerico.` });
    }

    let prods;
    try {
        prods = await ProductsManager.getProducts();
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde.`,
            detalle: `${error.message}`
        });
    }

    let prod = prods.find(idp => idp.id === pid);

    if (!prod) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `ID Product ${pid} not found.` });
    }

    let { ...aModificar } = req.body; // tambien puede ser let aModificar = req.body;

    delete aModificar.id;

    if (aModificar.name) {
        let existe = prods.find(prod => prod.name.toLowerCase() === aModificar.name.toLowerCase() && prod.id !== pid);

        if (existe) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `Name Product ${aModificar.name} ya existe.` });
        }
    }

    try {
        let prodModific = await ProductsManager.updateProduct(pid, aModificar);
        console.log("Producto Actualizado:", prodModific);

        req.socket.emit("ProductoActualizado", prodModific);
        console.log("Evento *ProductoActualizado* emitido");

        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ success: true, product: prodModific });
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde.`,
            detalle: `${error.message}`
        });
    }
});


router.delete("/:pid", async (req, res) => {

    let { pid } = req.params;
    pid = Number(pid);
    if (isNaN(pid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `Debe ingresar un Id numerico.` });
    }

    try {
        let prodresult = await ProductsManager.deleteProduct(pid);
        if (prodresult > 0) {

            req.socket.emit("ProductoBorrado", pid);
            console.log("Evento *ProductoBorrado* emitido");

            res.setHeader('Content-type', 'application/json');
            return res.status(200).json({ payload: `Producto Id ${pid} eliminado.` });

        } else {
            res.setHeader('Content-type', 'application/json');
            return res.status(500).json({ error: `Error al eliminar.` });
        }

    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde.`,
            detalle: `${error.message}`
        });
    }
});

module.exports = { router };