import mongoose from 'mongoose';

const explorerSchema = mongoose.Schema(
{
    email:{type:String, required:true, unique:true},
    username:{type:String, required:true, unique:true},
    name: {type: String, required:true},
    surname: {type: String, required:true},
    passwordHash: {type:String, required:true},

    inventory:
    {
        inox: {type: Number, required:true},
        elements:
        [
            {
                name: {type: String, required:true},
                quantity: {type: Number, required:true}
            }
        ]
    }
},{
    collection:'explorers',
    strict: 'throw',
    timestamps: true
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