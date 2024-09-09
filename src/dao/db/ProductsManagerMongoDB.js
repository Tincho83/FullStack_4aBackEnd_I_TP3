const { ProductsModel } = require("../models/ProductsModel");

class ProductsManagerMongoDB {

    static async getProductsDBMongo() {
        return await ProductsModel.find().lean();        
    }

    static async getProductsByDBMongo(filter = {}) { //{ key:"value", key2: "value" }
        return await ProductsModel.findOne(filter).lean();
    }

    static async addProductDBMongo(product) {
        console.log("prod manager: ", product);
        let prodNew = await ProductsModel.create(product);
        console.log("completo prod manager: ", product);
        return prodNew.toJSON();
    }

    static async updateProductDBMongo(id, product) {
        return await ProductsModel.findByIdAndUpdate(id, product, { new: true }).lean();
        //return await ProductsModel.UpdateOne({_id:id}, product).lean(); // devuel: {modificados=1}
    }

    static async deleteProductDBMongo(id) {
        return await ProductsModel.findByIdAndDelete(id, { new: true }).lean();
    }

}

module.exports = ProductsManagerMongoDB;