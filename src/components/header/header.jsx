import UserTag from "../userData/userData";

function Header() {
  return (
    <header className="w-full bg-blue-400 flex h-[100px] relative items-center">
      <h1 className="text-white text-[30px] p-[10px]">Hotel Management System</h1>
      <UserTag
        imageLink="https://as2.ftcdn.net/v2/jpg/00/65/77/27/1000_F_65772719_A1UV5kLi5nCEWI0BNLLiFaBPEkUbv5Fv.jpg"
        name="Guest User"
      />
    </header>
  );
}

export default Header;
