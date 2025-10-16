import axios from './axios'

export const apiAddToCart = ({ productItemId }) => axios({
    url: `/cart/`,
    method: 'post',
    data: { productItemId }
})

export const apiUpdateQuantity = ({ productItemId, quantity }) => axios({
    url: `/cart/`,
    method: 'put',
    data: { productItemId, quantity }
})

export const apiGetUserCart = () => axios({
    url: `/cart/`,
    method: 'get',
})