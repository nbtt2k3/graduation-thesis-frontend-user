import React from 'react'
import { RiSecurePaymentLine } from 'react-icons/ri'
import { TbArrowBackUp, TbTruckDelivery } from 'react-icons/tb'

const ProductFeature = () => {
  return (
    <div className='bg-primary rounded-xl mt-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 rounded-xl'>
            <div className='flexCenter gap-x-4 p-2 rounded-3xl'>
                <div className='text-3xl'>
                    <TbArrowBackUp className='mb-3 text-yellow-500' />
                </div>
                <div>
                    <h4 className='h4 capitalize'>Đổi trả dễ dàng</h4>
                    <p className='text-justify'>Chúng tôi cam kết mang đến cho bạn trải nghiệm mua sắm an tâm với chính sách đổi trả dễ dàng. Nếu sản phẩm không đáp ứng mong đợi, bạn có thể yêu cầu đổi hoặc trả hàng trong vòng 7 ngày mà không gặp bất kỳ khó khăn nào.</p>
                </div>
            </div>
            <div className='flexCenter gap-x-4 p-2 rounded-3xl'>
                <div className='text-3xl'>
                    <TbTruckDelivery className='mb-3 text-red-500' />
                </div>
                <div>
                    <h4 className='h4 capitalize'>Vận chuyển nhanh</h4>
                    <p className='text-justify'>Chúng tôi đảm bảo giao hàng nhanh chóng đến tay bạn trong thời gian ngắn nhất, giúp bạn nhận sản phẩm kịp thời và thuận tiện. Dịch vụ vận chuyển hiệu quả, an toàn, luôn ưu tiên sự hài lòng của khách hàng.</p>
                </div>
            </div>
            <div className='flexCenter gap-x-4 p-2 rounded-3xl'>
                <div className='text-3xl'>
                    <RiSecurePaymentLine className='mb-3 text-black-500' />
                </div>
                <div>
                    <h4 className='h4 capitalize'>Thanh toán an toàn</h4>
                    <p className='text-justify'>Chúng tôi cam kết mang đến cho bạn phương thức thanh toán an toàn và bảo mật, bảo vệ thông tin cá nhân và tài chính của bạn tuyệt đối. Mọi giao dịch đều được mã hóa và xử lý qua các cổng thanh toán uy tín, giúp bạn yên tâm mua sắm.</p>
                </div>
            </div>
            
        </div>
    </div>
  )
}

export default ProductFeature
