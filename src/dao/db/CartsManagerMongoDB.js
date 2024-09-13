const { CartsModel } = require("../models/CartsModel");
const { ProductsModel } = require("../models/ProductsModel.js");

class CartsManagerMongoDB {

    static async getCartsDBMongo() {
        return await CartsModel.find().lean();
    }

    static async getCartByDBMongo(id) {
        //return await CartsModel.findOne({ _id: id }).lean();
        return await CartsModel.findOne({ _id: id }).populate('products.product').lean();
    }

    static async addCartDBMongo() {
        //console.log("cart manager: ", products);
        let cartNew = await CartsModel.create({ products: [] });
        //console.log("completo cart manager: ", products);
        return cartNew.toJSON();
    }

    static async addCartAndProductsDBMongo(products = []) {
        console.log("cart manager: ", products);
        let cartNew = await CartsModel.create({ products });
        console.log("completo cart manager: ", cartNew);
        return cartNew.toJSON();
    }

    static async updateCartsDBMongo(id, cart) {
        return await CartsModel.updateOne({ _id: id }, cart);
    }

    static async addProductToCartDBMongo(cid, pid) {
        return await ProductsModel.findByIdAndUpdate(cid, pid, { new: true }).lean();
    }

    static async updateCartDBMongo(id, cart) {
        return await CartsModel.findByIdAndUpdate(id, cart, { new: true }).lean();
    }

    static async deleteCartDBMongo(id) {
        return await CartsModel.findByIdAndDelete(id, { new: true }).lean();
    }

}

module.exports = CartsManagerMongoDB;