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
router.get('/carts/:cid', async (req, res) => {

    let { detalle } = req.query;
    if (detalle) {
        console.log(detalle);
    }

    let titulo = "Listado de Productos del Carrito";
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
    res.status(200).render("carts", {
        detalle,
        titulo,
        prodss
    });
})

router.get('/products', async (req, res) => {

    let titulo = "Listado de Productos";
    let prodss;
    let dataObject = {};
    let cSort = {};

    let { page, limit, sort, query, type } = req.query;

    // Validación de los parámetros
    if (type && !['category', 'price', 'title', 'status', 'stock'].includes(type)) {
        dataObject = {
            status: 'error',
            message: 'Tipo de búsqueda inválido.'
        };
        console.log(`${dataObject.status}: ${dataObject.message} `);

        // Retornar un error 400 (Bad Request) indicando que el tipo no es válido
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json(dataObject);
    }


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
                cSort[criterio] = valorOrden;
            }

        });

        console.log(`Criterios de orden definidos:`, cSort);
    }

    let searchCriteria = {};
    let { detalle } = req.query;
    if (detalle) {
        console.log(detalle);
    }

    try {
        if (!query) {
            console.log('Realizando búsqueda general');
            prodss = await ProductsManagerMongoDB.getProductsDBMongoPaginate(page, limit, cSort);
        } else {
            console.log('Realizando búsqueda por criterio');
            console.log(`query: ${query}, type: ${type}`);

            // Construir el criterio de búsqueda con base en el tipo de filtro
            if (type === 'category') {
                searchCriteria = { category: new RegExp(query, 'i') };
            } else if (type === 'price') {
                searchCriteria = { price: query };
            } else if (type === 'title') {
                searchCriteria = { title: new RegExp(query, 'i') }; // Búsqueda insensible a mayúsculas/minúsculas
            } else if (type === 'status') {
                searchCriteria = { status: query.toLowerCase() === 'true' };
            } else if (type === 'stock') {
                searchCriteria = { stock: query }; // Búsqueda insensible a mayúsculas/minúsculas
            }

            console.log(`criterio: ${JSON.stringify(searchCriteria)}`);

            // Aquí utilizamos el criterio de búsqueda en la consulta
            prodss = await ProductsManagerMongoDB.getProductsDBMongoPaginate(page, limit, cSort, searchCriteria);

            if (prodss.docs.length === 0) {
                dataObject = {
                    status: 'error',
                    message: 'No se encontraron productos que coincidan con la búsqueda.'
                };

                console.log(`${dataObject.status}: ${dataObject.message} `);

                // Retornar una respuesta con status 404 para indicar que no se encontraron productos
                res.setHeader('Content-type', 'application/json');
                return res.status(404).json(dataObject);
            }
        }

        let prevLink;
        let nextLink;
        let pageLink;
        let showLastPage;

        if (prodss.hasPrevPage) {
            if (!sort) {
                prevLink = `/products?page=${prodss.prevPage}&limit=${limit}`;
            } else {
                prevLink = `/products?page=${prodss.prevPage}&limit=${limit}&sort=${sort}`;
            }
        } else {
            prevLink = null;
        }

        if (prodss.hasNextPage) {
            if (!sort) {
                nextLink = `/products?page=${prodss.nextPage}&limit=${limit}`;
            } else {
                nextLink = `/products?page=${prodss.nextPage}&limit=${limit}&sort=${sort}`;
            }
        } else {
            nextLink = null;
        }

        if (!sort && !limit) {
            pageLink = `/products?page=${prodss.page}`;
        } else if (limit && !sort) {
            pageLink = `/products?page=${prodss.page}&limit=${limit}`;
        } else if (sort && !limit) {
            pageLink = `/products?page=${prodss.page}&sort=${sort}`;
        } else if (sort && limit) {
            pageLink = `/products?page=${prodss.page}&limit=${limit}&sort=${sort}`;
        }

        if (prodss.nextPage == prodss.totalPages || !prodss.nextPage) {
            showLastPage = false;
        } else {
            showLastPage = true;
        }

        dataObject = {
            status: 'success',
            payload: prodss.docs,
            totalPages: prodss.totalPages,
            prevPage: prodss.prevPage,
            nextPage: prodss.nextPage,
            page: prodss.page,
            pageLink: pageLink,
            hasPrevPage: prodss.hasPrevPage,
            hasNextPage: prodss.hasNextPage,
            prevLink: prevLink,
            nextLink: nextLink,
            hasLastPage: showLastPage
        };

    } catch (error) {
        console.log(error);

        dataObject = {
            status: 'error',
            message: 'Error al obtener los productos.',
            errorDetails: error.message
        };

        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
    //console.log(dataObject);

    res.setHeader('Content-type', 'text/html');
    res.status(200).render("index", {
        detalle,
        titulo,
        products: prodss.docs,
        dataObject
    });
})


router.get('/realtimeproducts', async (req, res) => {
    console.log("\r\nentro get");

    let titulo = "Listado de Productos en tiempo Real";
    let prodss;
    let dataObject = {};
    let cSort = {};

    let { detalle } = req.query;
    if (detalle) {
        console.log(detalle);
    }

    let { page, limit, sort, query, type } = req.query;

    // Validación de los parámetros
    if (type && !['category', 'price', 'title', 'status', 'stock'].includes(type)) {
        dataObject = {
            status: 'error',
            message: 'Tipo de búsqueda inválido.'
        };
        console.log(`${dataObject.status}: ${dataObject.message} `);

        // Retornar un error 400 (Bad Request) indicando que el tipo no es válido
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json(dataObject);
    }

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




    //sort = { category: -1, price: 1 };
    //sort = { price: 1 };

    let searchCriteria = {};

    try {

        if (!query) {
            console.log('Realizando búsqueda general');

            //console.log(`Paginas ${page}`);
            //prodss = await ProductsManagerMongoDB.getProductsDBMongo();
            prodss = await ProductsManagerMongoDB.getProductsDBMongoPaginate(page, limit, cSort);
            //console.log(`Products: ${JSON.stringify(prodss.docs, null, 5)}`);
            //console.log(`Se eencontraron ${prodss.docs.length} productos.`);
            //console.log("::", prodss);



        } else {

            console.log('Realizando búsqueda por criterio');
            console.log(`query: ${query}, type: ${type}`);
            // Construir el criterio de búsqueda con base en el tipo de filtro
            if (type === 'category') {
                searchCriteria = { category: new RegExp(query, 'i') };
            } else if (type === 'price') {
                searchCriteria = { price: query };
            } else if (type === 'title') {
                searchCriteria = { title: new RegExp(query, 'i') }; // Búsqueda insensible a mayúsculas/minúsculas
            } else if (type === 'status') {
                searchCriteria = { status: query.toLowerCase() === 'true' };
            } else if (type === 'stock') {
                searchCriteria = { stock: query }; // Búsqueda insensible a mayúsculas/minúsculas
            }

            console.log(`criterio: ${JSON.stringify(searchCriteria)}`);

            // Aquí utilizamos el criterio de búsqueda en la consulta
            prodss = await ProductsManagerMongoDB.getProductsDBMongoPaginate(page, limit, cSort, searchCriteria);

            if (prodss.docs.length === 0) {
                dataObject = {
                    status: 'error',
                    message: 'No se encontraron productos que coincidan con la búsqueda.'
                };

                console.log(`${dataObject.status}: ${dataObject.message} `);

                // Retornar una respuesta con status 404 para indicar que no se encontraron productos
                res.setHeader('Content-type', 'application/json');
                return res.status(404).json(dataObject);
            }
        }

        console.log("...");
        let prevLink;
        let nextLink;
        let pageLink;
        let showLastPage;

        if (prodss.hasPrevPage) {
            if (!sort) {
                prevLink = `/realtimeproducts?page=${prodss.prevPage}&limit=${limit}`;
            } else {
                prevLink = `/realtimeproducts?page=${prodss.prevPage}&limit=${limit}&sort=${sort}`;
            }
        } else {
            prevLink = null;
        }

        if (prodss.hasNextPage) {
            if (!sort) {
                nextLink = `/realtimeproducts?page=${prodss.nextPage}&limit=${limit}`;
            } else {
                nextLink = `/realtimeproducts?page=${prodss.nextPage}&limit=${limit}&sort=${sort}`;
            }
        } else {
            nextLink = null;
        }

        if (!sort && !limit) {
            pageLink = `/realtimeproducts?page=${prodss.page}`;
        } else if (limit && !sort) {
            pageLink = `/realtimeproducts?page=${prodss.page}&limit=${limit}`;
        } else if (sort && !limit) {
            pageLink = `/realtimeproducts?page=${prodss.page}&sort=${sort}`;
        } else if (sort && limit) {
            pageLink = `/realtimeproducts?page=${prodss.page}&limit=${limit}&sort=${sort}`;
        }

        console.log("... ...");

        if (prodss.nextPage == prodss.totalPages || !prodss.nextPage) {
            showLastPage = false;

            //console.log(prodss.nextPage);
            //console.log(prodss.totalPages);
            //console.log(false);
        } else {
            showLastPage = true;
        }

        dataObject = {
            status: 'success',
            payload: prodss.docs,
            totalPages: prodss.totalPages,
            prevPage: prodss.prevPage,
            nextPage: prodss.nextPage,
            page: prodss.page,
            pageLink: pageLink,
            hasPrevPage: prodss.hasPrevPage,
            hasNextPage: prodss.hasNextPage,
            //prevLink: prodss.hasPrevPage ? `/realtimeproducts?page=${prodss.prevPage}&limit=${limit}` : null,
            prevLink: prevLink,
            //nextLink: prodss.hasNextPage ? `/realtimeproducts?page=${prodss.nextPage}&limit=${limit}` : null,
            nextLink: nextLink,
            hasLastPage: showLastPage
        };
        console.log("... ... ...");

        /*
        http://localhost:8080/realtimeproducts?page=1&limit=7&sort=category:desc,price:desc
        http://localhost:8080/realtimeproducts?page=1&limit=7&sort=category:desc,price:desc
        http://localhost:8080/realtimeproducts?page=2&limit=7&sort=category:desc,price:desc

        http://localhost:8080/realtimeproducts?page=1&limit=7&sort=title
        http://localhost:8080/realtimeproducts?page=1&limit=7&sort=price:asc
http://localhost:8080/realtimeproducts?page=1&limit=7&sort=title:asc,price:asc


    http://localhost:8080/realtimeproducts?page=1&limit=7&sort=category:desc,price:desc
    http://localhost:8080/realtimeproducts?page=1&limit=7&sort=category:desc,price:desc&query=infusion&type=category
            http://localhost:8080/realtimeproducts?page=1
            http://localhost:8080/realtimeproducts?page=2
            http://localhost:8080/realtimeproducts?page=1&limit=7
            http://localhost:8080/realtimeproducts?page=2&limit=7
            http://localhost:8080/realtimeproducts?page=1&limit=7&sort=category:desc,price:desc
            http://localhost:8080/realtimeproducts?page=2&limit=7&sort=category:desc,price:desc
            http://localhost:8080/realtimeproducts?query=infusion&type=category&limit=2




        */
        /*
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
        
                */

    } catch (error) {
        console.log(error);

        dataObject = {
            status: 'error',
            message: 'Error al obtener los productos.',
            errorDetails: error.message
        };

        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
    console.log("... ... ... ...");
    console.log(dataObject);
    res.setHeader('Content-type', 'text/html');
    res.status(200).render("realTimeProducts", {
        titulo,
        products: prodss.docs,
        dataObject
    });
});

// Fin DB

// FS
/*
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
*/
module.exports = { router };


