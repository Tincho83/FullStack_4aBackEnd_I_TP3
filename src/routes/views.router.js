const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const ProductsManagerMongoDB = require("../dao/db/ProductsManagerMongoDB.js");
const ProductsManager = require("../dao/filesystem/ProductsManager.js");

const router = Router();

router.get("/", (req, res) => {
    console.log("url: ", req.url);
    let titulo = "Bienvenido al Portal de Acceso a Productos";
    res.setHeader('Content-type', 'text/html');
    res.status(200).render("home", { titulo });
});

// Para DB
router.get('/productsdb', async (req, res) => {

    let { detalle } = req.query;
    if (detalle) {
        console.log(detalle);
    }

    let titulo = "Listado de Productos";
    let prodss;

    let { page } = req.query;
    if (!page || isNaN(Number(page))) {
        page = 1;
    }

    try {
        //prodss = await ProductsManagerMongoDB.getProductsDBMongo();
        prodss = await ProductsManagerMongoDB.getProductsDBMongoPaginate(page);
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }


    res.setHeader('Content-type', 'text/html');
    res.status(200).render("index", {
        detalle,
        titulo,
        prodss
    });
})


router.get('/realtimeproductsdb', async (req, res) => {
    console.log("\r\nentro get");

    let { detalle } = req.query;
    if (detalle) {
        console.log(detalle);
    }

    let { page, limit, sort, query } = req.query;
    if (!page || isNaN(Number(page))) {
        page = 1;
    }

    let titulo = "Listado de Productos en tiempo Real";
    let prodss;
    let dataObjectPaginate = {};

    sort = { category: -1 };

    try {
        console.log(`Paginas ${page}`);
        //prodss = await ProductsManagerMongoDB.getProductsDBMongo();
        prodss = await ProductsManagerMongoDB.getProductsDBMongoPaginate(page, limit, sort);
        console.log(`Products: ${JSON.stringify(prodss.docs, null, 5)}`);
        console.log(`Se eencontraron ${prodss.docs.length} productos.`);
        console.log("::", prodss);



        dataObjectPaginate = {
            //titulo,
            //products: prodss.docs,          // Lista de productos
            totalPages: prodss.totalPages,   // Total de páginas
            currentPage: prodss.page,        // Página actual
            hasPrevPage: prodss.hasPrevPage, // ¿Tiene página anterior?
            hasNextPage: prodss.hasNextPage, // ¿Tiene siguiente página?
            prevPage: prodss.prevPage,       // Página anterior
            nextPage: prodss.nextPage,        // Siguiente página
        };

        console.log("Datos para la vista:", dataObjectPaginate);

    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }

    res.setHeader('Content-type', 'text/html');
    res.status(200).render("realTimeProducts", {
        titulo,
        products: prodss.docs,
        dataObjectPaginate
    });
});

// Fin DB

router.get('/products', async (req, res) => {

    let { detalle } = req.query;
    if (detalle) {
        console.log(detalle);
    }

    let titulo = "Listado de Productos";
    let prodss;

    try {
        prodss = await ProductsManager.getProducts();
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }


    res.setHeader('Content-type', 'text/html');
    res.status(200).render("index", {
        detalle,
        titulo,
        prodss
    });
})

router.get('/realtimeproducts', async (req, res) => {

    let { detalle } = req.query;
    if (detalle) {
        console.log(detalle);
    }

    let titulo = "Listado de Productos en tiempo Real";
    let prodss;

    try {
        prodss = await ProductsManager.getProducts();
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }

    res.setHeader('Content-type', 'text/html');
    res.status(200).render("realTimeProducts", {
        titulo,
        prodss
    });
});

module.exports = { router };


