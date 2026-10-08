import {createContext,useContext,useState,useEffect} from 'react';
const AuthContext=createContext(null);
const read=()=>{try{return JSON.parse(sessionStorage.getItem('reh_user')||localStorage.getItem('reh_user')||'null');}catch{return null;}};
export function AuthProvider({children}){
 const [user,setUser]=useState(read);const [remember,setRemember]=useState(()=>{try{return !sessionStorage.getItem('reh_user');}catch{return true;}});
 useEffect(()=>{try{localStorage.removeItem('reh_user');sessionStorage.removeItem('reh_user');if(user)(remember?localStorage:sessionStorage).setItem('reh_user',JSON.stringify(user));}catch{}},[user,remember]);
 useEffect(()=>{const expire=()=>setUser(null);window.addEventListener('reh-auth-expired',expire);return()=>window.removeEventListener('reh-auth-expired',expire);},[]);
 const login=(next,options={})=>{setRemember(options.remember??true);setUser(next);};const logout=()=>setUser(null);
 return <AuthContext.Provider value={{user,login,logout,updateProfile:patch=>setUser(u=>({...u,...patch}))}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
