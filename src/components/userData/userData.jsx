
function UserTag(props) {
  return (
    <div className="absolute right-0 flex items-center  cursor-pointer p-[10px]">
      <img 
      className="rounded-full w-[50px] h-[50px]" src={props.imageLink}
      />
      <span className="text-white ml-[10px] text-xl ">{props.name}</span>
    </div>
  );
}

export default UserTag;
