import axios from './axios'

export const apiOrderCOD = (data) => axios({
    url: `/order/placeCod`,
    method: 'post',
    data
})

export const apiOrderMoMo = (data) => axios({
    url: `/order/placeMoMo`,
    method: 'post',
    data
})

export const apiGetUserOrder = () => axios({
    url: `/order/userOrders`,
    method: 'get',
})

export const apiGetOrder = ({ orderId }) => axios({
    url: `/order/${orderId}`,
    method: 'get',
})

export const cancelOrderByUser = ({ orderId, cancelReason }) => axios({
    url: `/order/cancelOrder/${orderId}`,
    method: 'put',
    data: { cancelReason }
})

