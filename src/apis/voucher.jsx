import axios from './axios';

export const getAllVouchers = () => axios({
    url: '/voucher',
    method: 'get'   
});

export const getVouchersById = (voucherId) => axios({
    url: `/voucher/${voucherId}`,
    method: 'get'
});