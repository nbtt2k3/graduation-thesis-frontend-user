import axios from "./axios";

export const apiGetProduct = (productId) =>
  axios({
    url: `/product/${productId}`,
    method: "get",
  });

export const apiGetAllProducts = (params) =>
  axios({
    url: `/product`,
    method: "get",
    params,
  });

export const apiGetAllProductItems = (params) =>
  axios({
    url: `/product/productItem`,
    method: "get",
    params,
  });

export const apiGetPopularProducts = (params) =>
  axios({
    url: `/product/popular`,
    method: "get",
    params,
  });

export const apiGetRecommendationsForNewUserService = (data) =>
  axios({
    url: `/product/recommend`,
    method: "post",
    data,
  });

export const apiGetRelatedProductItems = (productItemId) =>
  axios({
    url: `/product/relatedProducts/${productItemId}`,
    method: "get",
  });

export const apiGetSimilarItems = (productId) =>
  axios({
    url: `/product/similar-items/${productId}`,
    method: "post",
  });
