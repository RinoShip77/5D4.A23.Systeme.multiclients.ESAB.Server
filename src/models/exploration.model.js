import mongoose from 'mongoose';

const explorationSchema = mongoose.Schema({

    explorationDate:{type:String, required:true},
    destination:{type:String, required:true},
    affinity: {type: String, required:true},

    vault: 
    {
        inox: {type: Number, required:false},
        elements:
        [
            {
                element: {type: String, required:false},
                quantity: {type: Number, required:false},
                _id:false
            }
        ]
    },

    explorer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Explorer',
        required: true
    }
},{
    collection: 'explorations',
    strict:'throw'
}
);

explorationSchema.virtual('ally', {
    ref: 'Ally',
    localField: '_id',
    foreignField: 'exploration',
    justOne: true
});

const Exploration = new mongoose.model('Exploration', explorationSchema);
export { Exploration };