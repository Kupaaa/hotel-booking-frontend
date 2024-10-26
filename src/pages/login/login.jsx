import { useState } from "react";
import "./login.css";
import axios from "axios";


export default function LoginPage() {

    const [email, setEmail] = useState("")
    const [password, SetPassword] = useState("")

    function handleLogin(){
        axios.post(import.meta.env.VITE_BACKEND_URL+"/api/users/login",{
            email : email,
            password : password
        }).then(
            (res)=>{

                localStorage.setItem("token",res.data.token)

                const token = localStorage.getItem("token")

                if(res.data.user.type == "customer"){
                    window.location.href= "/"
                }else if(res.data.user.type == "admin"){
                    window.location.href = "admin"
                }

            }
        ).catch((err)=>{
            console.log(err)
        })
    }

    return(
        <div className="w-full h-[100vh] pic-bg flex justify-center items-center relative">
            <div className="w-[400px] h-[400px] backdrop-blur-md rounded-md flex flex-col items-center justify-center">
                <h1 className="text-center text-3xl p-[15px absolute top-[40px]">Login</h1>
                <input type="text" className="w-[80%] bg-[#00000000]  border-[2px] placeholder:text-white h-[40px] text-white px-[8px] mb-[10px] rounded-lg" placeholder="Enter Your Email" 
                defaultValue={email}
                onChange={
                    (e)=>{
                        // console.log(e.target.value)
                        setEmail(e.target.value)
                    }
                }/>
                <input type="password" className="w-[80%] bg-[#00000000]  border-[2px] placeholder:text-white h-[40px] text-white px-[8px] mb-[10px] rounded-lg" placeholder="Enter Your Password" 
                defaultValue={password}
                onChange={
                    (e)=>{
                        // console.log(e.target.value)
                        SetPassword(e.target.value)
                    }
                } />
                <button className="absolute bottom-[40px] bg-[#00000000] border-[2px] border-gray-700 rounded-lg text-white w-[80%] h-[40px] " onClick={handleLogin}>Login</button>
            </div>
        </div>
    )
}