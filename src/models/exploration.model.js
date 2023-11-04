import mongoose from 'mongoose';

const explorationSchema = mongoose.Schema({

    explorationDate:{type:String, required:true},
    destination:{type:String, required:true},
    affinity: {type: String, required:true},

    vault: 
    {
        inox: {type: number, required:true},
        elements:
        [
            {
                name: {type: String, required:true},
                quantity: {type: number, required:true}
            }
        ]
    }
});

customerSchema.virtual('ally', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'customer',
    justOne: true
});

export default mongoose.model('Exploration', explorationSchema);