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

customerSchema.virtual('allies', 
{
    ref: 'Order',
    localField: '_id',
    foreignField: 'customer',
    justOne: false
});

customerSchema.virtual('explorations', 
{
    ref: 'Order',
    localField: '_id',
    foreignField: 'customer',
    justOne: false
});

export default mongoose.model('Explorer', explorerSchema);