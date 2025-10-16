import axios from './axios';

export const createAddress = (data) => axios({
    url: '/address',
    method: 'post',
    data
});

export const updateAddress = (addressId, data) => axios({
    url: `/address/${addressId}`,
    method: 'put',
    data
});

export const getAllAddresses = () => axios({
    url: '/address',
    method: 'get'
});

export const getAddressById = (addressId) => axios({
    url: `/address/${addressId}`,
    method: 'get'
});

export const updateDefaultAddress = (addressId) => axios({
    url: `/address/default/${addressId}`,
    method: 'put'
});

export const deleteAddress = (addressId) => axios({
    url: `/address/${addressId}`,
    method: 'delete'
});