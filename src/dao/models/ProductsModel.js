const { mongoose } = require("mongoose");
const { config } = require("../../config/config");
const  paginate = require("mongoose-paginate-v2");

const productsColl = config.MONGO_COLLPRODNAME;

const productsSchema = new mongoose.Schema(
    {
        //id: { type: Number, required: true, unique: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        price: { type: Number, required: true },
        status: { type: Boolean, default: true },
        stock: { type: Number, required: true },
        category: { type: String, required: true },
        thumbnails: { type: Array, required: false },
    },
    {
        timestamps: true,
        strict: false,
        //collection: config.MONGO_COLLPRODNAME,
    }    
)

productsSchema.plugin(paginate);

const ProductsModel = mongoose.model(
    productsColl,
    productsSchema,
)

module.exports = { ProductsModel };

