import mongoose from 'mongoose';

const explorerSchema = mongoose.Schema(
{
    email:{type:String, required:true, unique:true},
    username:{type:String, required:true, unique:true},
    name: {type: String, required:true},
    surname: {type: String, required:true},
    passwordHash: {type:String, required:true},
    location: {type:String, required:false, default: "inoxis"}, // Vérifier si sa existe

    inventory:
    {
        inox: {type: Number, required:true, default: 0},
        elements:
        [
            {
                element: {type: String, required:false},
                quantity: {type: Number, required:false}
            }
        ]
    }
},{
    collection:'explorers',
    strict: 'throw',
    timestamps: true,
    id: false
});

explorerSchema.virtual('allies', 
{
    ref: 'Ally',
    localField: '_id',
    foreignField: 'explorer',
    justOne: false
});

explorerSchema.virtual('explorations', 
{
    ref: 'Exploration',
    localField: '_id',
    foreignField: 'explorer',
    justOne: false
});

const Explorer = new mongoose.model('Explorer', explorerSchema);
export { Explorer };