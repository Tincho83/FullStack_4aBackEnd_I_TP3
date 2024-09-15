const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const ProductsManagerMongoDB = require("../dao/db/ProductsManagerMongoDB.js");
const ProductsManager = require("../dao/filesystem/ProductsManager.js");
const CartsManager = require("../dao/filesystem/CartsManager.js");
const CartsManagerMongoDB = require("../dao/db/CartsManagerMongoDB.js");

const router = Router();

router.get("/", (req, res) => {
    console.log("url: ", req.url);
    let titulo = "Bienvenido al Portal de Acceso a Productos";
    res.setHeader('Content-type', 'text/html');
    res.status(200).render("home", { titulo });
});

// Para DB
router.get('/products/:pid', async (req, res) => {

    console.log("entro en carrito");

    const { pid } = req.params;

    if (!isValidObjectId(pid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: 'ID de carrito no válido.' });
    }

    try {
        // Obtén los productos con el ID pid
        let product = await ProductsManagerMongoDB.getProductsByDBMongo({ _id: pid });
        if (!product) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `No existen productos con el id: ${pid}` });
        }
        console.log(product);

        //res.setHeader('Content-type', 'application/json');
        //return res.status(200).json({ product })

        let titulo = "Detalle del Producto";
        //const prod = cart.products;  // Suponiendo que el carrito tiene un array de productos

        res.setHeader('Content-type', 'text/html');
        res.status(200).render("product", {
            titulo,
            product
        });

    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
})


router.get('/carts/:cid', async (req, res) => {

    console.log("entro en carrito");

    const { cid } = req.params;

    if (!isValidObjectId(cid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: 'ID de carrito no válido.' });
    }

    try {
        // Obtén los productos del carrito con el ID cid
        const cart = await CartsManagerMongoDB.getCartByDBMongo(cid);

        if (!cart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: 'Carrito no encontrado.' });
        }

        let titulo = "Listado de Productos del Carrito";
        //let prodss;
        const prodss = cart.products;  // Suponiendo que el carrito tiene un array de productos

        console.log(prodss);

        let subtotal = 0;
        let total = 0;

        prodss.forEach(p => {
            subtotal += p.product.price * p.quantity;
        });

        console.log(subtotal);
        //subtotal = prodss.product.price * prodss.quantity;

        res.setHeader('Content-type', 'text/html');
        res.status(200).render("carts", {
            titulo,
            subtotal,
            prodss,
            cartId: cid
        });

    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
})

router.get('/products', async (req, res) => {
    console.log("\r\nentro get");

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
                // Agregar el criterio y el valor al objeto cSort
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

        const baseUrl = `/products?page=${prodss.page}&limit=${limit}`;
        const filters = `&sort=${sort || ''}&query=${query || ''}&type=${type || ''}`.trim();


        if (prodss.hasPrevPage) {
            prevLink = `${baseUrl.replace(`page=${prodss.page}`, `page=${prodss.prevPage}`)}${filters}`;
            /*
            if (!sort) {
                prevLink = `/products?page=${prodss.prevPage}&limit=${limit}`;
            } else {
                prevLink = `/products?page=${prodss.prevPage}&limit=${limit}&sort=${sort}`;
            }
            */
        } else {
            prevLink = null;
        }

        if (prodss.hasNextPage) {
            nextLink = `${baseUrl.replace(`page=${prodss.page}`, `page=${prodss.nextPage}`)}${filters}`;
            /*
            if (!sort) {
                nextLink = `/products?page=${prodss.nextPage}&limit=${limit}`;
            } else {
                nextLink = `/products?page=${prodss.nextPage}&limit=${limit}&sort=${sort}`;
            }
            */
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

        pageLink = `${baseUrl}${filters}`;

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

    let searchCriteria = {};
    let { detalle } = req.query;
    if (detalle) {
        console.log(detalle);
    }

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

        let prevLink;
        let nextLink;
        let pageLink;
        let showLastPage;

        const baseUrl = `/realtimeproducts?page=${prodss.page}&limit=${limit}`;
        const filters = `&sort=${sort || ''}&query=${query || ''}&type=${type || ''}`.trim();

        if (prodss.hasPrevPage) {
            prevLink = `${baseUrl.replace(`page=${prodss.page}`, `page=${prodss.prevPage}`)}${filters}`;
            /*
            if (!sort) {
                prevLink = `/realtimeproducts?page=${prodss.prevPage}&limit=${limit}`;
            } else {
                prevLink = `/realtimeproducts?page=${prodss.prevPage}&limit=${limit}&sort=${sort}`;
            }
            */
        } else {
            prevLink = null;
        }

        if (prodss.hasNextPage) {
            nextLink = `${baseUrl.replace(`page=${prodss.page}`, `page=${prodss.nextPage}`)}${filters}`;
            /*
            if (!sort) {
                nextLink = `/realtimeproducts?page=${prodss.nextPage}&limit=${limit}`;
            } else {
                nextLink = `/realtimeproducts?page=${prodss.nextPage}&limit=${limit}&sort=${sort}`;
            }
            */
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

        pageLink = `${baseUrl}${filters}`;

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
    console.log(dataObject);

    res.setHeader('Content-type', 'text/html');
    res.status(200).render("realTimeProducts", {
        titulo,
        products: prodss.docs,
        dataObject
    });
});

// Fin DB

module.exports = { router };


