import UserDTO from "../dtos/user-dto.js";

class Mapper {
  public static mapUsers(users) {
    return users.map((user) => new UserDTO(user));
  }
}

export default Mapper;
