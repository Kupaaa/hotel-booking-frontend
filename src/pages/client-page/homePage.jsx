import Header from "../../components/header/header";

export default function HomePage() {
  return (
    <>
      <Header />
      <div className="w-full h-screen bg-blue-300 flex flex-col items-center p-[10px]">
        <div className="w-[700px] h-[100px] border border-white bg-white rounded-lg flex justify-center items-center">
          <input type="date" />
          <input type="date" />

          <select>
            <option value="">1</option>
            <option value="">2</option>
            <option value="">3</option>
          </select>
        </div>
        <h1 className="text-white text-[30px]">Welcome to +++++++++</h1>
      </div>
    </>
  );
}
