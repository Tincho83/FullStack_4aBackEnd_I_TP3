const { ProductsModel } = require("../models/ProductsModel");

class ProductsManagerMongoDB {

    static async getProductsDBMongo() {
        return await ProductsModel.find().lean();        
    }

    static async getProductsByDBMongo(filter = {}) {
        return await ProductsModel.findOne(filter).lean();
    }

    static async addProductDBMongo(product) {
        let prodNew = await ProductsModel.create(product);
        return prodNew.toJSON();
    }

    static async updateProductDBMongo(id, product) {
        return await ProductsModel.findByIdAndUpdate(id, product, { new: true }).lean();
    }

    static async deleteProductDBMongo(id) {
        return await ProductsModel.findByIdAndDelete(id, { new: true });
    }

}

module.exports = ProductsManagerMongoDB;