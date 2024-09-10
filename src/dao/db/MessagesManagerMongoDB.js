const { CartsModel } = require("../models/CartsModel");

class CartsManagerMongoDB {

    static async getCartsDBMongo() {
        return await CartsModel.find().lean();
    }

    static async getCartByDBMongo(filter = {}) {
        return await CartsModel.findOne(filter).lean();
    }

    static async addCartDBMongo(cart) {
        let cartNew = await CartsModel.create(cart);
        return cartNew.toJSON();
    }

    static async addProductToCartDBMongo(cid, pid) {

        // Encuentra el último carrito para determinar el próximo ID
        const lastCart = await CartsModel.findOne({}, { id: 1 }).sort({ id: -1 }).lean();
        const nextId = lastCart ? lastCart.id + 1 : 1;  // Si no hay carritos, comienza con ID 1

        console.log("last cart", lastCart);
        console.log("next id", nextId);


        /*
        try {

            const cart = await CartsModel.findById(cid).lean();
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }




            const updatedCart = await CartsModel.findByIdAndUpdate(
                cid,
                {
                    $addToSet: { products: pid } // Usa $addToSet para evitar duplicados
                },
                { new: true } // Devuelve el carrito actualizado
            ).lean();

            return updatedCart;
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            throw error;
        }

        //
        let product = cart.products.find(prod => prod.product === pid);
        if (product) {
            product.quantity += 1;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }

        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 5), {encoding: "utf-8"});
        return cart;
*/
    }

    static async updateCartDBMongo(id, cart) {
        return await CartsModel.findByIdAndUpdate(id, cart, { new: true }).lean();
    }

    static async deleteCartDBMongo(id) {
        return await CartsModel.findByIdAndDelete(id, { new: true });
    }

}

module.exports = CartsManagerMongoDB;