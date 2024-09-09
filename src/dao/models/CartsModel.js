const { mongoose } = require("mongoose");
const { config } = require("../../config/config");

const cartsColl = config.MONGO_COLLCARTNAME;

const cartsSchema = new mongoose.Schema(
    {
        //id: { type: Number, unique: true, required: true },
        //products: { type: Array, required: false },
        products: [{
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
            quantity: { type: Number, default: 1 }
        }]
    },
    {
        timestamps: true,
        strict: false,
    }
)

const CartsModel = mongoose.model(
    cartsColl,
    cartsSchema
)

module.exports = { CartsModel };
