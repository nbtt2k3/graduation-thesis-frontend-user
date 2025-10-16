import axios from './axios';

export const getCouponByCode = ({ couponCode }) => axios({
    url: `/coupon/code/${couponCode}`,
    method: 'get'
});
