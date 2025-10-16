import axios from './axios';

export const getAllUserVouchersById = () => axios({
    url: '/userVoucher',
    method: 'get'   
});

export const createUserVoucher = (voucherId) => axios({
    url: '/userVoucher',
    method: 'post',
    data: { voucherId }   
});