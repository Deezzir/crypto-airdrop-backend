import UserDTO from "../dtos/user-dto.js";

class Mapper {
    public static mapUsers(users: any) {
        return users.map((user: any) => new UserDTO(user));
    }
}

export default Mapper;
