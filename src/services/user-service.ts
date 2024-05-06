import UserModel from "../models/user.js";

class UserService {
    async getUsersByType(userType){
        const users = await UserModel.find({userType});

        return users;
    }

    async getUserById(id){
        const user = await UserModel.findById(id);

        return user;
    }

    async updateUser(user){
        const userToUpdate = await UserModel.findById(user.id);

        await userToUpdate.$set({...user}).save();

        return userToUpdate;
    }

    async createUser(user){
        const newUser = await new UserModel(user).save();

        return newUser;
    }
}

export default new UserService();