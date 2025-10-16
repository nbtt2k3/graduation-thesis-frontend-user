import React from 'react'
import Hero from '../../components/Hero/Hero'
import Features from '../../components/Features/Features'
import NewArrivals from '../../components/NewArrivals/NewArrivals'
import PopularProduct from '../../components/PopularProduct/PopularProduct'
import Banner from '../../components/Banner/Banner'
import NewLetter from '../../components/NewLetter/NewLetter'
import VoucherProduct from '../../components/VoucherProduct/VoucherProduct'
import RecommendedProductList from '../../components/RecommendedProductList/RecommendedProductList'


const Home = () => {
  return (
    <>
    <Hero />
    <VoucherProduct />
    <NewArrivals />
    <PopularProduct />
    <RecommendedProductList />
    <Banner />
    <NewLetter />
    </>
  )
}

export default Home
