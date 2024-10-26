import { useState } from "react"

export default function Test(){

    const [num, setNum] = useState(0)
    return(
        <div className="bg-red-900 w-full h-[100vh] flex items-center justify-center">
            <div className="bg-white w-[350px] h-[250px] justify-center items-center flex">
                <button className="w-[50px] h-[50px] rounded-full bg-gray-600 text-5xl text-center" onClick={
                    ()=>{
                       setNum(num-1)
                    }
                }>-</button>
                <span className="w-[50px] h-[50px] rounded-full text-center text-5xl justify-center">{num}</span>
                <button className="w-[50px] h-[50px] rounded-full bg-green-500 text-5xl text-center"
                on onClick={
                    ()=>{
                        setNum(num+1)
                    }
                }>+</button>
            </div>
        </div>
    )
}