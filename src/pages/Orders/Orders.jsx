import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";
import Title from "../../components/Title/Title";
import {
  apiGetUserOrder,
  cancelOrderByUser,
  apiCreateProductReview,
} from "../../apis";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";

const STATUS_OPTIONS = [
  { label: "Tất cả", value: "" },
  { label: "Chờ xác nhận", value: "pending" },
  { label: "Đã xác nhận", value: "confirmed" },
  { label: "Đang chuẩn bị", value: "processing" },
  { label: "Đã gửi đi", value: "shipped" },
  { label: "Đang giao hàng", value: "out_for_delivery" },
  { label: "Đã giao", value: "delivered" },
  { label: "Yêu cầu trả hàng", value: "return_requested" },
  { label: "Đã trả hàng", value: "returned" },
  { label: "Đã hủy", value: "cancelled" },
];

const statusLabel = (status) => {
  switch (status) {
    case "pending":
      return "Chờ xác nhận";
    case "confirmed":
      return "Đã xác nhận";
    case "processing":
      return "Đang chuẩn bị";
    case "shipped":
      return "Đã gửi đi";
    case "out_for_delivery":
      return "Đang giao hàng";
    case "delivered":
      return "Đã giao";
    case "return_requested":
      return "Yêu cầu trả hàng";
    case "returned":
      return "Đã trả hàng";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
};

const statusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "confirmed":
      return "bg-teal-100 text-teal-800 border border-teal-200";
    case "processing":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "shipped":
      return "bg-cyan-100 text-cyan-800 border border-cyan-200";
    case "out_for_delivery":
      return "bg-orange-100 text-orange-800 border border-orange-200";
    case "delivered":
      return "bg-green-100 text-green-800 border border-green-200";
    case "return_requested":
      return "bg-purple-100 text-purple-800 border border-purple-200";
    case "returned":
      return "bg-purple-200 text-purple-900 border border-purple-300";
    case "cancelled":
      return "bg-red-100 text-red-800 border border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

const Orders = () => {
  const [userOrders, setUserOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { currency } = useContext(ShopContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiGetUserOrder();
        if (response.success && Array.isArray(response.userOrderList)) {
          const mappedOrders = response.userOrderList.map((order) => ({
            id_order: order._id,
            hasReview: order.hasReview || {},
            products: order.items.map((item) => ({
              productItemId: item.productItemId,
              name: item.name,
              image: item.image,
              price: item.discountedPrice,
              quantity: item.quantity,
              attributes: item.attributes.map((attr) => ({
                code: attr.code,
                value: attr.value,
              })),
              hasReview: item.hasReview || false,
            })),
            status: order.status?.toLowerCase() || "unknown",
            date: order.createdAt,
            paymentMethod: order.paymentMethod,
            totalAmount: order.totalAmount,
            cancel_reason: order.cancelReason || null,
            userVoucherId: order.userVoucherId || null,
            couponId: order.couponId || null,
          }));
          setUserOrders(mappedOrders);
        } else {
          throw new Error("Dữ liệu đơn hàng không hợp lệ.");
        }
      } catch (error) {
        toast.error(error.msg || "Đã có lỗi xảy ra khi tải đơn hàng.");
        setUserOrders([]);
      }
    };

    fetchOrders();
  }, []);

  const handleOpenCancelModal = (orderId, e) => {
    e.stopPropagation();
    if (orderId) {
      setSelectedOrderId(orderId);
      setCancelReason("");
      setShowCancelModal(true);
    }
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setSelectedOrderId(null);
    setCancelReason("");
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy đơn hàng.");
      return;
    }
    if (!selectedOrderId) {
      toast.error("Không tìm thấy đơn hàng để hủy.");
      return;
    }
    try {
      const response = await cancelOrderByUser({
        orderId: selectedOrderId,
        cancelReason,
      });
      if (response.success) {
        setUserOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id_order === selectedOrderId
              ? { ...order, status: "cancelled", cancel_reason: cancelReason }
              : order
          )
        );
        toast.success("Đơn hàng đã được hủy thành công!");
        handleCloseCancelModal();
      } else {
        throw new Error("Hủy đơn hàng không thành công.");
      }
    } catch (error) {
      toast.error(error.msg || "Đã có lỗi xảy ra khi hủy đơn hàng.");
    }
  };

  const handleOpenReviewModal = (orderId, productItemId, e) => {
    e.stopPropagation();
    if (orderId && productItemId) {
      setSelectedOrderId(orderId);
      setSelectedProductId(productItemId);
      setRating(0);
      setComment("");
      setShowReviewModal(true);
    }
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedOrderId(null);
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
    if (!selectedOrderId || !selectedProductId) {
      toast.error("Không tìm thấy đơn hàng hoặc sản phẩm để đánh giá.");
      return;
    }
    try {
      const response = await apiCreateProductReview({
        productItemId: selectedProductId,
        orderId: selectedOrderId,
        rating,
        comment,
      });
      if (response.success) {
        setUserOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id_order === selectedOrderId
              ? {
                  ...order,
                  products: order.products.map((product) =>
                    product.productItemId === selectedProductId
                      ? { ...product, hasReview: true }
                      : product
                  ),
                }
              : order
          )
        );
        toast.success("Đánh giá đã được gửi thành công!");
        handleCloseReviewModal();
      } else {
        throw new Error("Gửi đánh giá không thành công.");
      }
    } catch (error) {
      toast.error(error.msg || "Đã có lỗi xảy ra khi gửi đánh giá.");
    }
  };

  const filteredOrders = filterStatus
    ? userOrders.filter((order) => order.status === filterStatus)
    : userOrders;

  if (userOrders.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center text-gray-600">
          Chưa có đơn hàng nào.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Title
          title1="Đơn hàng"
          title2="của bạn"
          titleStyles="pb-10 text-xl font-bold"
          paraStyles="max-w-xl"
        />

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {STATUS_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilterStatus(value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filterStatus === value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              aria-label={`Lọc đơn hàng theo trạng thái ${label}`}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center text-gray-600 text-sm">
            Không có đơn hàng phù hợp.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id_order}
              onClick={() => navigate(`/orders/${order.id_order}`)}
              className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm cursor-pointer transition hover:shadow-md"
            >
              {/* Trạng thái đơn hàng - góc trên bên phải */}
              <div
                className={`absolute top-4 right-4 flex items-center gap-2 text-sm font-medium px-2 py-1 rounded-lg shadow-sm ${statusColor(
                  order.status
                )}`}
              >
                <span className="w-2 h-2 rounded-full bg-current"></span>
                <span>{statusLabel(order.status)}</span>
              </div>

              <div className="text-gray-700 flex flex-col gap-4">
                <div className="flex flex-wrap gap-4">
                  {/* PRODUCT LIST */}
                  {order.products?.map((product, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 w-full sm:w-1/2 mb-3"
                    >
                      <img
                        src={
                          product.image ||
                          `https://via.placeholder.com/60x60?text=Img`
                        }
                        alt={product.name}
                        className="w-[99px] h-[99px] object-contain rounded"
                      />
                      <div className="flex flex-col w-full">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h5 className="text-base font-semibold line-clamp-1">
                              {product.name || "Sản phẩm không xác định"}
                            </h5>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                              <p>
                                Giá: {product.price?.toLocaleString("vi-VN") || 0}{" "}
                                {currency || "₫"}
                              </p>
                              {product.attributes?.map((attr, attrIdx) => (
                                <p key={attrIdx}>
                                  {attr.code}: {attr.value}
                                </p>
                              ))}
                              <p>Số lượng: {product.quantity || 1}</p>
                            </div>
                          </div>
                          {order.status === "delivered" && (
                            <button
                              className={`px-3 py-1.5 text-sm font-medium rounded-md min-w-[80px] whitespace-nowrap ${
                                product.hasReview
                                  ? "bg-gray-400 text-white cursor-not-allowed"
                                  : "bg-green-600 text-white hover:bg-green-700"
                              }`}
                              onClick={(e) =>
                                !product.hasReview &&
                                handleOpenReviewModal(
                                  order.id_order,
                                  product.productItemId,
                                  e
                                )
                              }
                              disabled={product.hasReview}
                              aria-label={
                                product.hasReview
                                  ? "Sản phẩm đã được đánh giá"
                                  : `Đánh giá sản phẩm ${product.name}`
                              }
                            >
                              {product.hasReview ? "Đã đánh giá" : "Đánh giá"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ORDER INFO */}
                <div className="flex justify-between items-center flex-wrap gap-y-2 mt-2">
                  <div className="text-sm flex flex-wrap gap-4">
                    <p>
                      <strong>Ngày đặt:</strong>{" "}
                      {order.date
                        ? new Date(order.date).toLocaleDateString("vi-VN")
                        : "Không xác định"}
                    </p>
                    <p>
                      <strong>Thanh toán:</strong>{" "}
                      {order.paymentMethod || "Không xác định"}
                    </p>
                    {order.userVoucherId && (
                      <p>
                        <strong>Mã Voucher:</strong> {order.userVoucherId}
                      </p>
                    )}
                    {order.couponId && (
                      <p>
                        <strong>Mã Coupon:</strong> {order.couponId}
                      </p>
                    )}
                    {order.cancel_reason && (
                      <p>
                        <strong>
                          {order.status === "cancelled"
                            ? "Lý do hủy"
                            : "Lý do trả hàng"}
                          :
                        </strong>{" "}
                        {order.cancel_reason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">
                      Tổng tiền: {order.totalAmount?.toLocaleString("vi-VN") || 0}{" "}
                      {currency || "₫"}
                    </span>
                    {order.status === "pending" && (
                      <button
                        className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 min-w-[80px] whitespace-nowrap"
                        onClick={(e) => handleOpenCancelModal(order.id_order, e)}
                        aria-label={`Hủy đơn hàng ${order.id_order}`}
                      >
                        Hủy đơn hàng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Cancel Reason Modal */}
        {showCancelModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Modal hủy đơn hàng"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Hủy đơn hàng</h3>
              <p className="text-sm text-gray-600 mb-4">
                Vui lòng nhập lý do hủy đơn hàng:
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Nhập lý do hủy..."
                aria-label="Lý do hủy đơn hàng"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={handleCloseCancelModal}
                  className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  aria-label="Hủy bỏ thao tác"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700"
                  aria-label="Xác nhận hủy đơn hàng"
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Modal đánh giá sản phẩm"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Đánh giá sản phẩm</h3>
              <p className="text-sm text-gray-600 mb-4">
                Vui lòng chọn số sao và nhập nội dung đánh giá:
              </p>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`text-2xl cursor-pointer ${
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
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Nhập nội dung đánh giá..."
                aria-label="Nội dung đánh giá sản phẩm"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={handleCloseReviewModal}
                  className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  aria-label="Hủy bỏ đánh giá"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700"
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

export default Orders;