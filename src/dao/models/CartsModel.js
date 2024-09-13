const { mongoose } = require("mongoose");
const { config } = require("../../config/config");
const paginate = require("mongoose-paginate-v2");

const cartsColl = config.MONGO_COLLCARTNAME;

const cartsSchema = new mongoose.Schema(
    {
        //id: { type: Number, unique: true, required: true },
        //products: { type: Array, required: false },
        //products: [{
        //    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
        //    quantity: { type: Number, default: 1 }
        //}]
        products: {
            type: [
                {
                    product: {
                        type: mongoose.Schema.Types.ObjectId, ref: "products"
                        //agregar config para MONGO_COLLPRODNAME
                    },
                    quantity: { type: Number, default: 1 }
                }
            ]
        }
    },
    {
        timestamps: true,
        strict: false,
    }
)

//cartsSchema.plugin(paginate);
cartsSchema.pre("findOne", function () {
    this.populate("products.product").lean();
});

const CartsModel = mongoose.model(
    cartsColl,
    cartsSchema
)

module.exports = { CartsModel };
