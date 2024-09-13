const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const ProductsManager = require("../dao/filesystem/ProductsManager.js");
const ProductsManagerMongoDB = require("../dao/db/ProductsManagerMongoDB");
const { ProductsModel } = require("../dao/models/ProductsModel.js");

const router = Router();

ProductsManager.path = "./src/data/productos.json";

// Inicio DB
router.get('/', async (req, res) => {
    console.log("\r\nentro get");

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
            //prodss.products = products.docs;
            //delete products.docs;
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
                    status: 'Sin Resultados.',
                    message: 'No se encontraron productos que coincidan con la búsqueda.'
                };

                console.log(`${dataObject.status}: ${dataObject.message} `);

                // Retornar una respuesta con status 404 para indicar que no se encontraron productos
                res.setHeader('Content-type', 'application/json');
                return res.status(404).json(dataObject);
                //return res.status(200).json({ dataObject })
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
            message: 'Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.'
        };

        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({ dataObject })

})

router.get('/:id', async (req, res) => {
    console.log("entro get by id");

    let { id } = req.params;
    if (!isValidObjectId(id)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `id: ${id} no valido,` })
    }
    console.log(id);

    try {
        //let product = await ProductsManagerMongoDB.getProductsByDBMongo({id: id});
        let product = await ProductsManagerMongoDB.getProductsByDBMongo({ _id: id });
        if (!product) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `No existen productos con el id: ${id}` });
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

router.post('/', async (req, res) => {
    //let { id, title, description, code, price, stock, category } = req.body;
    let { title, description, code, price, stock, category } = req.body;

    console.log("entro post");

    //if (!id || !title || !description || !code || !price || !stock || !category) {
    if (!title || !description || !code || !price || !stock || !category) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ status: "error", error: "Incomplete values." })
        //return res.send({ status: "error", error: "Incomplete values." });
    }

    //console.log(id, title, description, code, price, stock, category);
    console.log(title, description, code, price, stock, category);

    try {
        let existe = await ProductsManagerMongoDB.getProductsByDBMongo({ code })
        if (existe) {
            console.log(`Producto ${code} existente en DB.`);
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `Producto ${code} existente en DB.` })
        }
        console.log(existe, code);

        let prodNew = await ProductsManagerMongoDB.addProductDBMongo({ title, description, code, price, stock, category })
        console.log(prodNew);

        req.socket.emit("nuevoProducto", prodNew);
        console.log("Evento *nuevoProducto* emitido");

        res.setHeader('Content-type', 'application/json');
        return res.status(201).json({ prodNew })

    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Erro.r inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
})

router.put('/:id', async (req, res) => {
    console.log("\r\nentro al put");

    let { id } = req.params;
    if (!isValidObjectId(id)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `id: ${id} no valido,` })
    }
    console.log("con params id:", id);

    let prodToModify = req.body;
    console.log("con body:", prodToModify);

    //let existingProduct = await ProductsModel.findOne({ id: prodToModify.id });
    let existingProduct = await ProductsModel.findOne({ id: id });
    console.log("Producto existente en DB? ", existingProduct);
    console.log("con params id:", id);

    if (existingProduct && existingProduct.id !== id) {
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
})

router.delete('/:id', async (req, res) => {
    console.log("entro delete");

    let { id } = req.params;
    if (!isValidObjectId(id)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `id: ${id} no valido,` })
    }
    console.log(id);

    try {
        let prodDelete = await ProductsManagerMongoDB.deleteProductDBMongo(id);
        if (!prodDelete) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `No se pudo eliminar el producto id: ${id}` })
        } else {

            req.socket.emit("ProductoBorrado", id);
            console.log("Evento *ProductoBorrado* emitido");

            res.setHeader('Content-type', 'application/json');
            return res.status(200).json({ prodDelete })
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

module.exports = { router };