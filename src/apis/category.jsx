import axios from './axios';

export const apiGetAllCategories = (params) => axios({
    url: '/category',
    method: 'get',
    params
});
