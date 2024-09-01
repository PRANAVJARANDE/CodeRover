import mongoose, {Schema} from "mongoose";

const tweetSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    image:{
        type:String,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    replyOf: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    }
}, {timestamps: true})


export const Tweet = mongoose.model("Tweet", tweetSchema)