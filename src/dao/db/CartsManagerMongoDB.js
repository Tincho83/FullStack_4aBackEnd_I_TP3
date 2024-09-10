const { CartsModel } = require("../models/CartsModel");

class CartsManagerMongoDB {

    static async getCartsDBMongo() {
        return await CartsModel.find().lean();
    }

    static async getCartByDBMongo(id) {
        return await CartsModel.findOne({ _id: id }).lean();
    }

    static async addCartDBMongo(cart) {
        console.log("cart manager: ", cart);
        let cartNew = await CartsModel.create({ products: [] });
        console.log("completo cart manager: ", cart);
        return cartNew.toJSON();
    }

    static async addProductToCartDBMongo(cid, pid) {
        return await ProductsModel.findByIdAndUpdate(id, product, { new: true }).lean();
    }

    static async updateCartDBMongo(id, cart) {
        return await CartsModel.findByIdAndUpdate(id, cart, { new: true }).lean();
    }

    static async deleteCartDBMongo(id) {
        return await CartsModel.findByIdAndDelete(id, { new: true }).lean();
    }

}

module.exports = CartsManagerMongoDB;