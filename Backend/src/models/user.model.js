import mongoose,{Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const templateSchema = new mongoose.Schema({
    cpp: {
        type: String,
        default: `#include<bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n\n    return 0;\n}`  
    },
    c: {
        type: String,
        default: `#include<stdio.h>\n\nint main() {\n    // Your code here\n\n    return 0;\n}`
    },
    java: {
        type: String,
        default: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`
    },
    python: {
        type: String,
        default: `def main():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    main()`
    }
});


const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    avatar:{
        type:String, 
        default:'https://res.cloudinary.com/dyyta5lri/image/upload/v1724514263/defaultuser_l0d3kk.png'
    },
    password:{
        type:String,
        required:[true,'Password is Required'],
    },
    refreshToken:{
        type:String,
    },
    default_language:{
        type:String,
        default:'cpp',
    },
    template:{
        type:templateSchema,
        required:true,
        default: () => ({})
    }
},{timestamps:true});


userSchema.pre("save",async function(next){
    if(!this.isModified("password"))return next();
    this.password=await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
};

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
};

export const User=mongoose.model('User',userSchema);