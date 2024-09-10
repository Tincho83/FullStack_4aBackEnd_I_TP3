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

    let titulo = "Listado de Productos en tiempo Real";
    let prodss;
    let dataObjectPaginate = {};
    let dataObject = {};
    let cSort = {};

    let { detalle } = req.query;
    if (detalle) {
        console.log(detalle);
    }

    let { page, limit, sort, query, type } = req.query;

    if (!page || isNaN(Number(page))) {
        page = 1;
    }
    console.log(`pagina: ${page}`);


    if (!limit || isNaN(Number(limit))) {
        limit = 10;
    }
    console.log(`limite: ${limit}`);

    if (!sort) {
        console.log(`orden no definida: ${sort}`);
    } else {
        let criteriosSep = sort.split(',');

        criteriosSep.forEach(element => {
            let [criterio, orden] = element.split(':');

            console.log(`Criterio: ${criterio}, Orden: ${orden}`);

            let valorOrden = (orden === 'asc') ? 1 : (orden === 'desc') ? -1 : null;

            if (valorOrden !== null) {
                // Agregar el criterio y el valor al objeto cSort
                cSort[criterio] = valorOrden;
            }

        });

        console.log(`Criterios de orden definidos:`, cSort);
    }

    let searchCriteria = {};








    //http://localhost:8080/realtimeproductsdb?page=1&sort=category:desc,price:desc&limit=7

    //sort = { category: -1, price: 1 };
    //sort = { price: 1 };

    try {

        if (!query) {
            console.log('Realizando búsqueda general');

            //console.log(`Paginas ${page}`);
            //prodss = await ProductsManagerMongoDB.getProductsDBMongo();
            prodss = await ProductsManagerMongoDB.getProductsDBMongoPaginate(page, limit, cSort, query);
            //console.log(`Products: ${JSON.stringify(prodss.docs, null, 5)}`);
            //console.log(`Se eencontraron ${prodss.docs.length} productos.`);
            //console.log("::", prodss);

        } else {
            console.log(`query: ${query}`);
            console.log(`type: ${type}`);
            // Construir el criterio de búsqueda con base en el tipo de filtro
            if (type === 'category') {
                searchCriteria = { category: query };
            } else if (type === 'price') {
                searchCriteria = { price: query };
            } else if (type === 'title') {
                searchCriteria = { title: new RegExp(query, 'i') }; // Búsqueda insensible a mayúsculas/minúsculas
            }

            // Aquí utilizamos el criterio de búsqueda en la consulta
            prodss = await ProductsManagerMongoDB.getProductsByDBMongo(searchCriteria);
        }

        dataObject = {
            status: 'success',
            payload: prodss.docs,
            totalPages: prodss.totalPages,
            prevPage: prodss.prevPage,
            nextPage: prodss.nextPage,
            page: prodss.page,
            hasPrevPage: prodss.hasPrevPage,
            hasNextPage: prodss.hasNextPage,
            prevLink: prodss.hasPrevPage ? `/realtimeproductsdb?page=${prodss.prevPage}&limit=${limit}` : null,
            nextLink: prodss.hasNextPage ? `/realtimeproductsdb?page=${prodss.nextPage}&limit=${limit}` : null
        };

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

        //console.log("Datos para la vista:", dataObjectPaginate);

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


