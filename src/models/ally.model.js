import mongoose from 'mongoose';

const allySchema = mongoose.Schema({

    name:{type:String, required:true},
    affinity:{type:String, required:true},
    essence: {type:Number, required:true},
    stats:
    {
        life: {type: Number, required:true},
        speed: {type: Number, required:true},
        power: {type: Number, required:true},
        shield: {type: Number, required:true},
    },

    crypto:
    {
        hash: {type: String, required:true},
        signature: {type: String, required:true},
    },

    books:
    [

    ],

    kernel:
    [

    ],
    uuid: {type: Number, required:true, unique:true},
    archiveIndex: {type: Number, required:true, unique:true},
    href: {type: String, required:true},
    asset: {type: String, required:true},
    createdAt: {type: String, required:true},
    updatedAt: {type: String, required:true},
    expireAt: {type: String, required:true}
});

export default mongoose.model('Ally', allySchema);