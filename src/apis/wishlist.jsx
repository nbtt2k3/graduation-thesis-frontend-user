import axios from './axios';

export const apiAddToWishlist = (productItemId) => axios({
    url: '/wishlist',
    method: 'post',
    data: { productItemId }
});

export const apiGetAllWishlists = () => axios({
    url: '/wishlist',
    method: 'get'
});

export const apiRemoveFromWishlist = (wishlistId) => axios({
    url: `/wishlist/${wishlistId}`,
    method: 'delete'
});
