import React, { useEffect, useContext } from 'react'
import { ShopContext } from '../../Context/ShopContext'
import * as apis from '../../apis'
import { toast } from "react-hot-toast"
import { useParams } from 'react-router-dom'
import { jwtDecode } from "jwt-decode"

const VerifyLoginSuccess = () => {
  const { navigate, login, setCurrent } = useContext(ShopContext)

  const { token } = useParams()

  const verifySuccess = async () => {
    const decoded = jwtDecode(token)
    const googleId = decoded.googleId

    try {
      const response = await apis.apiLoginWithGoogle({ googleId })
      if (response.success) {
        toast.success(response.msg)
        login(response.accessToken)
        setCurrent(response.userData)
      }
    } catch (error) {
      toast.error(error.msg || "Đã xảy ra lỗi. Vui lòng thử lại sau.")
    } finally {
      navigate('/')
    }
  }

  useEffect(() => {
    verifySuccess()
  }, [])

  return <p>Logging in...</p>
}

export default VerifyLoginSuccess