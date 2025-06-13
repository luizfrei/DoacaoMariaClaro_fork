using Domain.Entities;

public interface IUserRepository
{
    void Add(User user);
    User? GetById(int id);
    List<User> ListAll();
    void Update(User user);
    void Delete(int id);
    User? GetByEmail(string email);
}