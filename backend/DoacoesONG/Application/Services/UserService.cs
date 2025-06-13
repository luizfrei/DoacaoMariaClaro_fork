using Domain.Entities;
using API.DTOs;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public UserDTO RegisterUser(UserDTO userDto)
    {
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(userDto.Password);

        var user = new User 
        {
            Name = userDto.Name, 
            Email = userDto.Email, 
            Phone = userDto.Phone,
            Address = userDto.Address,
            Password = hashedPassword,
            Photo = userDto.Photo,
            TipoUsuario = userDto.TipoUsuario
        };
        _userRepository.Add(user);

        return userDto;
    }

    public UserDTO? GetUserDetails(int id)
    {
        var user = _userRepository.GetById(id);
        return user != null ? new UserDTO 
        { 
            Id = user.Id,
            Name = user.Name, 
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            Password = user.Password,
            Photo = user.Photo,
            TipoUsuario = user.TipoUsuario
        } : null;
    }

    public List<UserDTO> GetAllUsers()
    {
        return _userRepository.ListAll().Select(user => new UserDTO
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            Password = user.Password,
            Photo = user.Photo,
            TipoUsuario = user.TipoUsuario
        }).ToList();
    }

    public UserDTO? UpdateUser(int id, UserDTO userDto)
    {
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(userDto.Password);
        var user = _userRepository.GetById(id);
        if (user == null) return null;

        user.Name = userDto.Name;
        user.Email = userDto.Email;
        user.Phone = userDto.Phone;
        user.Address = userDto.Address;
        user.Password = hashedPassword;
        user.Photo = userDto.Photo;
        user.TipoUsuario = userDto.TipoUsuario;

        _userRepository.Update(user);

        return userDto;
    }

    public bool DeleteUser(int id)
    {
        var user = _userRepository.GetById(id);
        if (user == null) return false;
        _userRepository.Delete(id);
        return true;
    }

    public UserDTO? ValidateUser(string email, string password)
    {
        var user = _userRepository.GetByEmail(email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.Password))
            return null;

        return new UserDTO
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            Photo = user.Photo,
            TipoUsuario = user.TipoUsuario
        };
    }
}