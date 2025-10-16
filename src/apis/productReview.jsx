import axios from './axios'

export const apiCreateProductReview = (data) => axios({
    url: `/productReview`,
    method: 'post',
    data
})

export const apiGetProductReviewsByProductId = (productItemId, data) => axios({
    url: `/productReview/${productItemId}`,
    method: 'get',
    params: data
})

export const apiGetProductReviewsByUserId = (data) => axios({
    url: `/productReview`,
    method: 'get',
    params: data
})

