import User from "../models/UserSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOTP, sendOTPEmail, verifyOTP } from "../utils/emailService.js";

// Helper to generate JWT
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerControllers = async (req, res, next) => {
    try{
        const {name, email, password} = req.body || {};

        // console.log(name, email, password);

        if(!name || !email || !password){
            res.status(400);
            throw new Error("Please enter All Fields");
        }

        const normalizedEmail = email.trim().toLowerCase();
        let user = await User.findOne({ email: normalizedEmail });

        if(user){
            res.status(409);
            throw new Error("User already Exists");
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + (process.env.OTP_EXPIRY_TIME || 10) * 60 * 1000);

        // Create user with OTP but not verified
        let newUser = await User.create({
            name,
            email: normalizedEmail,
            password, // UserSchema pre-save hook handles hashing
            otp,
            otpExpiry,
            isVerified: false,
        });

        // Send OTP email
        const emailResult = await sendOTPEmail(normalizedEmail, otp, name);

        if (!emailResult.success) {
            await User.deleteOne({ _id: newUser._id });
            res.status(500);
            throw new Error(emailResult.message || "Failed to send OTP email");
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully. OTP sent to email.",
            userId: newUser._id,
            email: newUser.email,
            requiresOTP: true,
        });
    }
    catch(err){
        next(err);
    }
}
export const loginControllers = async (req, res, next) => {
    try{
        const { email, password } = req.body || {};

        // console.log(email, password);
  
        if (!email || !password){
            res.status(400);
            throw new Error("Please enter All Fields");
        }
    
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });
    
        if (!user){
            res.status(401);
            throw new Error("User not found");
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Account not verified. Please verify your email first.",
                requiresVerification: true,
                userId: user._id,
            });
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
    
        if (!isMatch){
            res.status(401);
            throw new Error("Incorrect Email or Password");
        }

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAvatarImageSet: user.isAvatarImageSet,
                avatarImage: user.avatarImage,
            },
            token: generateToken(user._id.toString()),
        });

    }
    catch(err){
        next(err);
    }
}

export const setAvatarController = async (req, res, next)=> {
    try{

        const userId = req.params.id;
       
        const imageData = req.body.image;
      
        const userData = await User.findByIdAndUpdate(userId, {
            isAvatarImageSet: true,
            avatarImage: imageData,
        },
        { new: true });

        return res.status(200).json({
            isSet: userData.isAvatarImageSet,
            image: userData.avatarImage,
          });


    }catch(err){
        next(err);
    }
}

export const allUsers = async (req, res, next) => {
    try{
        const user = await User.find({_id: {$ne: req.params.id}}).select([
            "email",
            "name",
            "avatarImage",
            "_id",
        ]);

        return res.json(user);
    }
    catch(err){
        next(err);
    }
}

export const verifyOTPController = async (req, res, next) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.status(400).json({
                success: false,
                message: "User ID and OTP are required",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Account is already verified",
            });
        }

        // Verify OTP
        const otpVerification = verifyOTP(user.otp, otp, user.otpExpiry);

        if (!otpVerification.valid) {
            return res.status(400).json({
                success: false,
                message: otpVerification.message,
            });
        }

        // Update user as verified and clear OTP
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully. You can now log in.",
            userId: user._id,
            email: user.email,
        });

    } catch (err) {
        next(err);
    }
}

export const resendOTPController = async (req, res, next) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Account is already verified",
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + (process.env.OTP_EXPIRY_TIME || 10) * 60 * 1000);

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send new OTP email
        const emailResult = await sendOTPEmail(user.email, otp, user.name);

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to resend OTP email",
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP resent successfully to your email",
        });

    } catch (err) {
        next(err);
    }
}
