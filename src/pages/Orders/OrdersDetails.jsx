import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";
import {
  apiGetOrder,
  cancelOrderByUser,
  apiCreateProductReview,
} from "../../apis";
import {
  FaRegClipboard,
  FaCheck,
  FaCogs,
  FaTruck,
  FaShippingFast,
  FaBoxOpen,
  FaTimesCircle,
  FaUndo,
  FaStar,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

const statusConfig = {
  pending: {
    label: "Chờ xác nhận",
    color: "bg-blue-100 text-blue-800 border border-blue-200",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "bg-teal-100 text-teal-800 border border-teal-200",
  },
  processing: {
    label: "Đang chuẩn bị",
    color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  },
  shipped: {
    label: "Đã gửi đi",
    color: "bg-cyan-100 text-cyan-800 border border-cyan-200",
  },
  out_for_delivery: {
    label: "Đang giao hàng",
    color: "bg-orange-100 text-orange-800 border border-orange-200",
  },
  delivered: {
    label: "Đã giao",
    color: "bg-green-100 text-green-800 border border-green-200",
  },
  return_requested: {
    label: "Yêu cầu trả hàng",
    color: "bg-purple-100 text-purple-800 border border-purple-200",
  },
  returned: {
    label: "Đã trả hàng",
    color: "bg-purple-200 text-purple-900 border border-purple-300",
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-800 border border-red-200",
  },
  default: {
    label: "Không xác định",
    color: "bg-gray-100 text-gray-800 border border-gray-200",
  },
};

const getStatusLabel = (status) =>
  statusConfig[status?.toLowerCase()]?.label || statusConfig.default.label;
const getStatusColor = (status) =>
  statusConfig[status?.toLowerCase()]?.color || statusConfig.default.color;

const orderSteps = [
  { key: "pending", label: "Chờ xác nhận", icon: FaRegClipboard },
  { key: "confirmed", label: "Đã xác nhận", icon: FaCheck },
  { key: "processing", label: "Đang chuẩn bị", icon: FaCogs },
  { key: "shipped", label: "Đã gửi đi", icon: FaTruck },
  { key: "out_for_delivery", label: "Đang giao hàng", icon: FaShippingFast },
  { key: "delivered", label: "Đã giao", icon: FaBoxOpen },
];

const OrderDetails = () => {
  const { orderId } = useParams();
  const { currency } = useContext(ShopContext);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const response = await apiGetOrder({ orderId });

        console.log("📦 API trả về:", response);
        if (response.success && response.order) {
          setOrder({
            ...response.order,
            status: response.order.status?.toLowerCase() || "unknown",
            items:
              response.order.items?.map((item) => ({
                ...item,
                hasReview: item.hasReview || false,
              })) || [],
            voucherInfos: response.order.voucherInfos || [],
            couponInfos: response.order.couponInfos || [],
            shippingAddress: response.order.shippingAddress || {},
            userId: response.order.userId || {},
          });
          setError(null);
        } else {
          throw new Error("Dữ liệu đơn hàng không hợp lệ.");
        }
      } catch (err) {
        setOrder(null);
        toast.error(err.msg || "Không tìm thấy đơn hàng hoặc có lỗi xảy ra.");
        setError("Không tìm thấy đơn hàng hoặc có lỗi xảy ra.");
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleOpenCancelModal = () => {
    if (orderId) {
      setCancelReason("");
      setShowCancelModal(true);
    }
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setCancelReason("");
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy đơn hàng.");
      return;
    }
    if (!orderId) {
      toast.error("Không tìm thấy đơn hàng để hủy.");
      return;
    }
    try {
      setIsLoading(true);
      const response = await cancelOrderByUser({ orderId, cancelReason });
      if (response.success) {
        setOrder((prev) => ({
          ...prev,
          status: "cancelled",
          cancelReason: cancelReason,
        }));
        toast.success("Đơn hàng đã được hủy thành công!");
        handleCloseCancelModal();
      } else {
        throw new Error("Hủy đơn hàng không thành công.");
      }
    } catch (error) {
      toast.error(error.msg || "Đã có lỗi xảy ra khi hủy đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReviewModal = (productItemId) => {
    if (productItemId) {
      setSelectedProductId(productItemId);
      setRating(0);
      setComment("");
      setShowReviewModal(true);
    }
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedProductId(null);
    setRating(0);
    setComment("");
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá.");
      return;
    }
    if (!selectedProductId || !orderId) {
      toast.error("Không tìm thấy đơn hàng hoặc sản phẩm để đánh giá.");
      return;
    }
    try {
      setIsLoading(true);
      const response = await apiCreateProductReview({
        productItemId: selectedProductId,
        orderId,
        rating,
        comment,
      });
      if (response.success) {
        setOrder((prev) => ({
          ...prev,
          items: prev.items.map((item) =>
            item.productItemId === selectedProductId
              ? { ...item, hasReview: true }
              : item
          ),
        }));
        toast.success("Đánh giá đã được gửi thành công!");
        handleCloseReviewModal();
      } else {
        throw new Error("Gửi đánh giá không thành công.");
      }
    } catch (error) {
      toast.error(error.msg || "Đã có lỗi xảy ra khi gửi đánh giá.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-10 text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 sm:mt-4 text-xs sm:text-sm md:text-base text-gray-600 font-semibold">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-10 text-center text-red-600 font-semibold">
          {error || "Không tìm thấy đơn hàng."}
          <br />
          <button
            className="mt-4 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm md:text-base font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            onClick={() => navigate("/orders")}
            aria-label="Quay lại danh sách đơn hàng"
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return `${(amount || 0).toLocaleString("vi-VN")} ${currency || "₫"}`;
  };

  const statusToStepKey = {
    pending: "pending",
    confirmed: "confirmed",
    processing: "processing",
    shipped: "shipped",
    out_for_delivery: "out_for_delivery",
    delivered: "delivered",
    return_requested: "delivered",
    returned: "delivered",
    cancelled: "cancelled",
  };

  const currentStatus = order.status || "pending";
  const isCancelled = currentStatus === "cancelled";
  const isReturn =
    currentStatus === "return_requested" || currentStatus === "returned";
  const currentStepKey = statusToStepKey[currentStatus] || "pending";
  const currentStepIndex = isCancelled
    ? 0
    : orderSteps.findIndex((s) => s.key === currentStepKey);

  const subtotal =
    order.items?.reduce(
      (sum, p) => sum + (p.discountedPrice || 0) * (p.quantity || 0),
      0
    ) || 0;

  const voucherDiscount =
    order.voucherInfos?.reduce((sum, v) => sum + (v.discountAmount || 0), 0) ||
    0;
  const couponDiscount =
    order.couponInfos?.reduce((sum, c) => sum + (c.discountAmount || 0), 0) ||
    0;
  const totalDiscount = voucherDiscount + couponDiscount;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
            Đơn hàng #{order.orderCode || orderId}
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium shadow ${getStatusColor(order.status)}`}
            >
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current"></span>
              <span>{getStatusLabel(order.status)}</span>
            </div>
            {order.status === "pending" && (
              <button
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 w-full sm:w-auto"
                onClick={handleOpenCancelModal}
                aria-label={`Hủy đơn hàng ${order.orderCode || orderId}`}
              >
                Hủy đơn hàng
              </button>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-2 sm:p-4 rounded-lg shadow-sm mb-4 sm:mb-8">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-4 text-gray-700">
            Thông tin người nhận
          </h3>
          <p className="text-xs sm:text-sm text-gray-700">
            <strong className="font-semibold">Họ tên:</strong>{" "}
            {order.shippingAddress?.fullName || "Không xác định"}
          </p>
          <p className="text-xs sm:text-sm text-gray-700">
            <strong className="font-semibold">Số điện thoại:</strong>{" "}
            {order.shippingAddress?.phone || "Không xác định"}
          </p>
          <p className="text-xs sm:text-sm text-gray-700">
            <strong className="font-semibold">Địa chỉ:</strong>{" "}
            {order.shippingAddress
              ? `${order.shippingAddress.addressLine}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`
              : "Không xác định"}
          </p>
          <p className="text-xs sm:text-sm text-gray-700 mt-2">
            <strong className="font-semibold">Email:</strong>{" "}
            {order.userId?.email || "Không xác định"}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-2 sm:p-4 rounded-lg shadow-sm mb-4 sm:mb-8">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-4 text-gray-700">
            Tiến trình đơn hàng
          </h3>
          <div className="relative sm:flex sm:items-center sm:justify-between flex-col sm:flex-row">
            <div className="hidden sm:block absolute top-5 sm:top-6 left-[6%] right-[6%] h-0.5 sm:h-1 bg-gray-300 z-0 rounded"></div>
            {!isCancelled && !isReturn && (
              <div
                className="hidden sm:block absolute top-5 sm:top-6 left-[6%] h-0.5 sm:h-1 bg-green-500 z-0 rounded transition-all duration-300"
                style={{
                  width: `calc(${(currentStepIndex / (orderSteps.length - 1)) * 88}%)`,
                }}
              ></div>
            )}
            {isCancelled && (
              <div
                className="hidden sm:block absolute top-5 sm:top-6 left-[6%] h-0.5 sm:h-1 bg-red-500 z-0 rounded transition-all duration-300"
                style={{ width: "0%" }}
              ></div>
            )}
            {isReturn && (
              <div
                className="hidden sm:block absolute top-5 sm:top-6 left-[6%] h-0.5 sm:h-1 bg-purple-500 z-0 rounded transition-all duration-300"
                style={{
                  width: `calc(${((orderSteps.length - 1) / (orderSteps.length - 1)) * 88}%)`,
                }}
              ></div>
            )}
            {orderSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted =
                !isCancelled && !isReturn && index <= currentStepIndex;
              return (
                <div
                  key={step.key}
                  className="relative flex flex-col items-center z-10 mb-4 sm:mb-0 sm:w-[16.66%]"
                >
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 mb-1 sm:mb-2 ${
                      isCancelled && index === 0
                        ? "bg-red-500 border-red-500 text-white"
                        : isReturn && index === orderSteps.length - 1
                          ? "bg-purple-500 border-purple-500 text-white"
                          : isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCancelled && index === 0 ? (
                      <FaTimesCircle className="text-base sm:text-lg" />
                    ) : isReturn && index === orderSteps.length - 1 ? (
                      <FaUndo className="text-base sm:text-lg" />
                    ) : (
                      <Icon className="text-base sm:text-lg" />
                    )}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-800 text-center">
                    {isCancelled && index === 0
                      ? "Đã hủy"
                      : isReturn && index === orderSteps.length - 1
                        ? currentStatus === "return_requested"
                          ? "Yêu cầu trả hàng"
                          : "Đã trả hàng"
                        : step.label}
                  </div>
                  <div className="h-4 sm:h-5 mt-1"></div>
                </div>
              );
            })}
          </div>
          {isCancelled && (
            <p className="mt-2 sm:mt-4 text-xs sm:text-sm text-red-600">
              Đơn hàng đã bị hủy. Lý do:{" "}
              {order.cancelReason || "Không xác định"}
            </p>
          )}
          {isReturn && (
            <p className="mt-2 sm:mt-4 text-xs sm:text-sm text-purple-600">
              {currentStatus === "return_requested"
                ? "Đơn hàng đã yêu cầu trả hàng."
                : "Đơn hàng đã được trả về kho."}
              {order.cancelReason ? ` Lý do: ${order.cancelReason}` : ""}
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 p-2 sm:p-4 rounded-lg shadow-sm">
          <p className="mb-2 sm:mb-4 text-xs sm:text-sm text-gray-700">
            <strong className="font-semibold">Ngày đặt:</strong>{" "}
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("vi-VN")
              : "-"}
          </p>
          {order.cancelReason && (
            <p className="mb-2 sm:mb-4 text-xs sm:text-sm text-gray-700">
              <strong className="font-semibold">
                {currentStatus === "cancelled" ? "Lý do hủy" : "Lý do trả hàng"}
                :
              </strong>{" "}
              {order.cancelReason}
            </p>
          )}
          <h4 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-4">Sản phẩm</h4>
          <div className="space-y-2 sm:space-y-4">
            {order.items?.map((product, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row gap-2 sm:gap-4 border border-gray-200 rounded-lg p-2 sm:p-4 shadow-sm"
              >
                <img
                  src={
                    product.image ||
                    "https://via.placeholder.com/80x80?text=Img"
                  }
                  alt={product.name || "Sản phẩm"}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded self-center sm:self-start"
                />
                <div className="text-xs sm:text-sm text-gray-700 flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2">
                    <div>
                      <h5 className="font-semibold text-sm sm:text-base">
                        {product.name || "Không xác định"}
                      </h5>
                      <p>
                        Giá:{" "}
                        <span className="font-medium">
                          {formatCurrency(product.discountedPrice)}
                        </span>
                      </p>
                      <p>Số lượng: {product.quantity || 0}</p>
                      {product.attributes?.length > 0 && (
                        <div>
                          {product.attributes.map((attr, attrIdx) => (
                            <p key={attrIdx}>
                              {attr.code}: {attr.value}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    {order.status === "delivered" && (
                      <button
                        className={`mt-1 sm:mt-0 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md w-full sm:w-auto ${
                          order.hasReview
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                        onClick={() =>
                          !order.hasReview &&
                          handleOpenReviewModal(product.productItemId)
                        }
                        disabled={order.hasReview}
                      >
                        {order.hasReview ? "Đã đánh giá" : "Đánh giá"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 sm:mt-6 border-t pt-2 sm:pt-4 text-xs sm:text-sm md:text-base text-gray-700">
          <div className="flex flex-col sm:flex-row justify-between py-1 gap-1 sm:gap-2">
            <span className="flex-shrink-0">Tổng tiền hàng</span>
            <span className="text-right">{formatCurrency(subtotal)}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex flex-col sm:flex-row justify-between py-1 gap-1 sm:gap-2">
              <span className="flex-shrink-0">Giảm giá (Voucher/Coupon)</span>
              <span className="text-right text-red-500">
                -{formatCurrency(totalDiscount)}
              </span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-between border-t pt-2 sm:pt-3 mt-2 sm:mt-3 text-sm sm:text-base md:text-lg font-semibold gap-1 sm:gap-2">
            <span className="flex-shrink-0">Thành tiền</span>
            <span className="text-right text-red-600">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between pt-1 sm:pt-2 text-xs sm:text-sm text-gray-600 gap-1 sm:gap-2">
            <span className="flex-shrink-0">Phương thức Thanh toán</span>
            <span className="text-right font-medium text-gray-800">
              {order.paymentMethod === "cod"
                ? "Thanh toán khi nhận hàng"
                : order.paymentMethod || "Chuyển khoản ngân hàng (MÃ QR)"}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between pt-1 sm:pt-2 text-xs sm:text-sm text-gray-600 gap-1 sm:gap-2">
            <span className="flex-shrink-0">Trạng thái thanh toán</span>
            <span className="text-right font-medium text-gray-800">
              {order.paymentStatus === "pending"
                ? "Chưa thanh toán"
                : order.paymentStatus === "completed"
                  ? "Đã thanh toán"
                  : order.paymentStatus === "failed"
                    ? "Thất bại"
                    : "Không xác định"}
            </span>
          </div>
        </div>

        {showCancelModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Modal hủy đơn hàng"
          >
            <div className="bg-white p-2 sm:p-4 rounded-lg shadow-lg border border-gray-200 max-w-[90vw] sm:max-w-md w-full">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-4">
                Hủy đơn hàng
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">
                Vui lòng nhập lý do hủy đơn hàng:
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-1 sm:p-2 border border-gray-200 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Nhập lý do hủy..."
                aria-label="Lý do hủy đơn hàng"
              />
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-2 sm:mt-4">
                <button
                  onClick={handleCloseCancelModal}
                  className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  aria-label="Hủy bỏ thao tác"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700"
                  aria-label="Xác nhận hủy đơn hàng"
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {showReviewModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Modal đánh giá sản phẩm"
          >
            <div className="bg-white p-2 sm:p-4 rounded-lg shadow-lg border border-gray-200 max-w-[90vw] sm:max-w-md w-full">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-4">
                Đánh giá sản phẩm
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">
                Vui lòng chọn số sao và nhập nội dung đánh giá:
              </p>
              <div className="flex gap-1 mb-2 sm:mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`text-lg sm:text-xl cursor-pointer ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    onClick={() => setRating(star)}
                    aria-label={`Đánh giá ${star} sao`}
                  />
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-1 sm:p-2 border border-gray-200 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Nhập nội dung đánh giá..."
                aria-label="Nội dung đánh giá sản phẩm"
              />
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-2 sm:mt-4">
                <button
                  onClick={handleCloseReviewModal}
                  className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  aria-label="Hủy bỏ đánh giá"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700"
                  aria-label="Gửi đánh giá sản phẩm"
                >
                  Gửi đánh giá
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;