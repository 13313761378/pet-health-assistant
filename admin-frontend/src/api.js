import axios from 'axios';
const api=axios.create({baseURL:'/api/admin',timeout:10000});
api.interceptors.request.use(c=>{const t=localStorage.getItem('admin_token');if(t)c.headers.Authorization=`Bearer ${t}`;return c;});
api.interceptors.response.use(r=>r.data,e=>{if(e.response?.status===401){localStorage.removeItem('admin_token');if(location.pathname!='/login')location.href='/login';}return Promise.reject(e);});
export default api;
