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
    },

    ally: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ally',
        required: false
    }
},{
    collection: 'explorations',
    strict:'throw'
}
);

const Exploration = new mongoose.model('Exploration', explorationSchema);
export { Exploration };