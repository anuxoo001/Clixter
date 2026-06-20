import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../features/profile/userSlice";

const useGetUserProfile = (userId) =>{
    const dispatch = useDispatch()
    useEffect(() => {
        const fetchUserProfile = async () =>{
           try {
                const api = import.meta.env.VITE_API_URL || '';
                const res = await axios.get(`${api}/api/user/${userId}/profile`, { withCredentials: true} )
                if(res.data.success){
                    dispatch(setUserProfile(res.data.user))
                }else{
                    console.log(res)
                }           
           } catch (error) {
                console.log(error)
           }
        }
        fetchUserProfile()
    },[userId])
}

export default useGetUserProfile