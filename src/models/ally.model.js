import mongoose from 'mongoose';

const allySchema = mongoose.Schema({

    name:{type:String, required:true},
    affinity:{type:String, required:true},
    essence: {type: number, required:true},
    stats:
    {
        life: {type: number, required:true},
        speed: {type: number, required:true},
        power: {type: number, required:true},
        shield: {type: number, required:true},
    },

    crypto:
    {
        hash: {type: string, required:true},
        signature: {type: string, required:true},
    },

    books:
    [

    ],

    kernel:
    [

    ],
    uuid: {type: number, required:true, unique:true},
    archiveIndex: {type: number, required:true, unique:true},
    href: {type: string, required:true},
    asset: {type: string, required:true},
    createdAt: {type: string, required:true},
    updatedAt: {type: string, required:true},
    expireAt: {type: string, required:true}
});

customerSchema.virtual('allies', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'customer',
    justOne: false
});

customerSchema.virtual('explorations', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'customer',
    justOne: false
});

export default mongoose.model('Ally', allySchema);