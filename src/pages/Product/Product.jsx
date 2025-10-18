import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  FaStar,
  FaPlay,
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
} from "react-icons/fa";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import ProductDescription from "../../components/ProductDescription/ProductDescription";
import ProductFeature from "../../components/ProductFeature/ProductFeature";
import RelatedProduct from "../../components/RelatedProduct/RelatedProduct";
import * as apis from "../../apis";
import { ShopContext } from "../../Context/ShopContext";

const renderVideoPlayer = (videoUrl, poster) => {
  if (!videoUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <p className="text-gray-600 text-sm">Không có video sản phẩm</p>
      </div>
    );
  }

  if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
    let videoId = "";
    if (videoUrl.includes("youtube.com/watch?v=")) {
      videoId = videoUrl.split("v=")[1]?.split("&")[0];
    } else if (videoUrl.includes("youtu.be/")) {
      videoId = videoUrl.split("youtu.be/")[1]?.split("?")[0];
    }

    if (videoId) {
      return (
        <div className="relative w-full h-full">
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-xl"
            src={`https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0`}
            title="Product Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  }

  if (videoUrl.includes("vimeo.com")) {
    const videoId = videoUrl.split("vimeo.com/")[1]?.split("?")[0];
    if (videoId) {
      return (
        <div className="relative w-full h-full">
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-xl"
            src={`https://player.vimeo.com/video/${videoId}`}
            title="Product Video"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  }

  if (videoUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return (
      <video
        className="w-full h-full rounded-xl object-contain"
        controls
        controlsList="nodownload"
        muted
        playsInline
        preload="metadata"
        poster={poster || "/placeholder.svg"}
      >
        <source src={videoUrl} type="video/mp4" />
        Trình duyệt của bạn không hỗ trợ video.
      </video>
    );
  }

  return (
    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 w-full h-full flex flex-col justify-center">
      <p className="text-sm text-gray-600 mb-2">Video URL:</p>
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline break-all text-sm cursor-pointer"
      >
        {videoUrl}
      </a>
    </div>
  );
};

const Product = () => {
  const { auth, fetchCart } = useContext(ShopContext);
  const { productId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [image, setImage] = useState("");
  const [tab, setTab] = useState("image");
  const [mainIndex, setMainIndex] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedPrimaryAttribute, setSelectedPrimaryAttribute] = useState("");
  const [selectedOtherAttributes, setSelectedOtherAttributes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const REVIEWS_PER_PAGE = 5;
  const MAX_VISIBLE_THUMBNAILS = 4;

  useEffect(() => {
    if (!productId) {
      setError("Không tìm thấy ID sản phẩm");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await apis.apiGetProduct(productId);
        if (response.success && response.product?.productItems?.length) {
          setProduct(response.product);

          const sku = searchParams.get("sku");
          let defaultItem = response.product.productItems[0];
          if (sku) {
            const matchingItem = response.product.productItems.find(
              (item) => item.sku === sku
            );
            defaultItem = matchingItem || defaultItem;
          }

          setSelectedItem(defaultItem);
          setImage(
            defaultItem?.images?.[0]?.image ||
              defaultItem?.thumbUrl ||
              response.product.thumbUrl ||
              "/placeholder.svg"
          );

          const primaryAttributeValue =
            defaultItem?.attributes?.find((attr) => attr.code === "Phiên bản")
              ?.value || "";
          const primaryAttributes = [
            ...new Set(
              response.product?.productItems
                ?.map(
                  (item) =>
                    item.attributes?.find((attr) => attr.code === "Phiên bản")
                      ?.value
                )
                ?.filter(Boolean)
            ),
          ];
          const defaultPrimaryAttribute =
            primaryAttributeValue ||
            (primaryAttributes.length > 0 ? primaryAttributes[0] : "");

          setSelectedPrimaryAttribute(defaultPrimaryAttribute);
          setSelectedColor(
            defaultItem?.attributes?.find((attr) => attr.code === "Màu")
              ?.value || ""
          );

          const otherAttributes = {};
          defaultItem.attributes
            .filter((attr) => attr.code !== "Màu" && attr.code !== "Phiên bản")
            .forEach((attr) => {
              otherAttributes[attr.code] = attr.value;
            });
          setSelectedOtherAttributes(otherAttributes);

          if (defaultItem.sku) {
            setSearchParams({ sku: defaultItem.sku }, { replace: true });
          } else {
            setSearchParams({}, { replace: true });
          }
        } else {
          throw new Error("Sản phẩm không hợp lệ");
        }
      } catch (err) {
        setError(err.msg || "Đã xảy ra lỗi khi tải sản phẩm");
        toast.error(err.msg || "Đã xảy ra lỗi khi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await apis.apiGetProductReviewsByProductId(productId, {
          limit: REVIEWS_PER_PAGE,
          page: currentReviewPage,
        });
        if (response.success) {
          setReviews(response.reviewList || []);
        }
      } catch (err) {
        toast.error(err.msg || "Đã xảy ra lỗi khi tải đánh giá sản phẩm");
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [productId, searchParams, setSearchParams, currentReviewPage]);

  useEffect(() => {
    if (selectedItem?.sku && selectedItem.sku !== searchParams.get("sku")) {
      setSearchParams({ sku: selectedItem.sku }, { replace: true });
    }
  }, [selectedItem, setSearchParams]);

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      if (!auth.isLoggedIn || !selectedItem?._id) return;
      try {
        const response = await apis.apiGetAllWishlists();
        if (response.success) {
          const isInWishlist = response.wishlists.some(
            (wishlist) => wishlist.productItemId._id === selectedItem._id
          );
          setIsFavorited(isInWishlist);
        } else {
          console.log("Failed to fetch wishlist:", response.msg);
        }
      } catch (error) {
        console.log("Error fetching wishlist status:", error);
      }
    };

    fetchWishlistStatus();
  }, [auth.isLoggedIn, selectedItem?._id]);

  const addToCartHandler = useCallback(
    async (productItemId) => {
      if (!auth.isLoggedIn) {
        toast.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
        return false;
      }
      try {
        const response = await apis.apiAddToCart({ productItemId });
        if (response.success) {
          fetchCart();
          toast.success("Sản phẩm đã được thêm vào giỏ hàng!");
          return true;
        } else if (response.error?.code === "cart_limit") {
          toast.error("Giỏ hàng đã đạt giới hạn!");
          return false;
        }
      } catch (error) {
        toast.error(error.msg || "Đã xảy ra lỗi khi thêm vào giỏ hàng.");
        return false;
      }
    },
    [auth.isLoggedIn, fetchCart]
  );

  const buyNowHandler = useCallback(
    async (productItemId) => {
      const addedToCart = await addToCartHandler(productItemId);
      if (addedToCart) {
        navigate("/place-order");
      }
    },
    [addToCartHandler, navigate]
  );

  const toggleWishlistHandler = useCallback(
    async (productItemId) => {
      if (!auth.isLoggedIn) {
        toast.error("Bạn cần đăng nhập để quản lý danh sách yêu thích!");
        return;
      }
      try {
        if (isFavorited) {
          const response = await apis.apiRemoveFromWishlist(productItemId);
          if (response.success) {
            setIsFavorited(false);
            toast.success("Đã xóa sản phẩm khỏi danh sách yêu thích!");
          } else {
            toast.error(
              response.msg || "Không thể xóa khỏi danh sách yêu thích."
            );
          }
        } else {
          const response = await apis.apiAddToWishlist(productItemId);
          if (response.success) {
            setIsFavorited(true);
            toast.success("Sản phẩm đã được thêm vào danh sách yêu thích!");
          } else {
            toast.error(
              response.msg || "Không thể thêm vào danh sách yêu thích."
            );
          }
        }
      } catch (error) {
        toast.error(
          error.msg || "Đã xảy ra lỗi khi cập nhật danh sách yêu thích."
        );
      }
    },
    [auth.isLoggedIn, isFavorited]
  );

  const handlePrevImage = useCallback(() => {
    if (tab === "image" && selectedItem?.images?.length) {
      if (mainIndex > 0) {
        setMainIndex(mainIndex - 1);
        setImage(
          selectedItem.images[mainIndex - 1]?.image ||
            selectedItem.thumbUrl ||
            product?.thumbUrl ||
            "/placeholder.svg"
        );
      } else if (product?.featuredImages?.length) {
        setTab("noi-bat");
        setHighlightIndex(product.featuredImages.length - 1);
      } else if (product?.videoUrl) {
        setTab("video");
      }
    } else if (tab === "noi-bat" && product?.featuredImages?.length) {
      if (highlightIndex > 0) {
        setHighlightIndex(highlightIndex - 1);
      } else {
        setTab("image");
        setMainIndex(selectedItem?.images?.length - 1 || 0);
        setImage(
          selectedItem?.images?.[selectedItem.images.length - 1]?.image ||
            selectedItem?.thumbUrl ||
            product?.thumbUrl ||
            "/placeholder.svg"
        );
      }
    } else if (
      tab === "video" &&
      (product?.featuredImages?.length || selectedItem?.images?.length)
    ) {
      if (product?.featuredImages?.length) {
        setTab("noi-bat");
        setHighlightIndex(product.featuredImages.length - 1);
      } else {
        setTab("image");
        setMainIndex(selectedItem?.images?.length - 1 || 0);
        setImage(
          selectedItem?.images?.[selectedItem.images.length - 1]?.image ||
            selectedItem?.thumbUrl ||
            product?.thumbUrl ||
            "/placeholder.svg"
        );
      }
    }
  }, [tab, mainIndex, highlightIndex, selectedItem, product]);

  const handleNextImage = useCallback(() => {
    if (tab === "image" && selectedItem?.images?.length) {
      if (mainIndex < selectedItem.images.length - 1) {
        setMainIndex(mainIndex + 1);
        setImage(
          selectedItem.images[mainIndex + 1]?.image ||
            selectedItem.thumbUrl ||
            product?.thumbUrl ||
            "/placeholder.svg"
        );
      } else if (product?.featuredImages?.length) {
        setTab("noi-bat");
        setHighlightIndex(0);
      } else if (product?.videoUrl) {
        setTab("video");
      }
    } else if (tab === "noi-bat" && product?.featuredImages?.length) {
      if (highlightIndex < product.featuredImages.length - 1) {
        setHighlightIndex(highlightIndex + 1);
      } else if (product?.videoUrl) {
        setTab("video");
      } else {
        setTab("image");
        setMainIndex(0);
        setImage(
          selectedItem?.images?.[0]?.image ||
            selectedItem?.thumbUrl ||
            product?.thumbUrl ||
            "/placeholder.svg"
        );
      }
    } else if (
      tab === "video" &&
      (product?.featuredImages?.length || selectedItem?.images?.length)
    ) {
      setTab("image");
      setMainIndex(0);
      setImage(
        selectedItem?.images?.[0]?.image ||
          selectedItem?.thumbUrl ||
          product?.thumbUrl ||
          "/placeholder.svg"
      );
    }
  }, [tab, mainIndex, highlightIndex, selectedItem, product]);

  const handleTabChange = useCallback(
    (newTab) => {
      setTab(newTab);
      if (newTab === "image" && selectedItem?.images?.length) {
        setMainIndex(0);
        setImage(
          selectedItem.images[0]?.image ||
            selectedItem.thumbUrl ||
            product?.thumbUrl ||
            "/placeholder.svg"
        );
      } else if (newTab === "noi-bat" && product?.featuredImages?.length) {
        setHighlightIndex(0);
      }
    },
    [selectedItem, product]
  );

  const handleThumbnailClick = useCallback(
    (idx) => {
      setTab("image");
      setMainIndex(idx);
      setImage(
        selectedItem?.images?.[idx]?.image ||
          selectedItem?.thumbUrl ||
          product?.thumbUrl ||
          "/placeholder.svg"
      );
    },
    [selectedItem, product]
  );

  const handleColorChange = useCallback(
    (color) => {
      setSelectedColor(color);
      const newItem =
        product?.productItems?.find(
          (item) =>
            item.attributes?.some(
              (attr) => attr.code === "Màu" && attr.value === color
            ) &&
            item.attributes?.some(
              (attr) =>
                attr.code === "Phiên bản" &&
                attr.value === selectedPrimaryAttribute
            )
        ) || product?.productItems[0];

      if (newItem) {
        setSelectedItem(newItem);
        setMainIndex(0);
        setImage(
          newItem.images?.[0]?.image ||
            newItem.thumbUrl ||
            product?.thumbUrl ||
            "/placeholder.svg"
        );
        const otherAttributes = {};
        newItem.attributes
          .filter((attr) => attr.code !== "Màu" && attr.code !== "Phiên bản")
          .forEach((attr) => {
            otherAttributes[attr.code] = attr.value;
          });
        setSelectedOtherAttributes(otherAttributes);
      } else {
        toast.error("Màu sắc này không khả dụng cho phiên bản đã chọn.");
      }
    },
    [selectedPrimaryAttribute, product]
  );

  const handlePrimaryAttributeChange = useCallback(
    (value) => {
      setSelectedPrimaryAttribute(value);
      const newItem =
        product?.productItems?.find(
          (item) =>
            item.attributes?.some(
              (attr) => attr.code === "Phiên bản" && attr.value === value
            ) &&
            (selectedColor
              ? item.attributes?.some(
                  (attr) => attr.code === "Màu" && attr.value === selectedColor
                )
              : true)
        ) || product?.productItems[0];

      if (newItem) {
        setSelectedItem(newItem);
        setMainIndex(0);
        setImage(
          newItem.images?.[0]?.image ||
            newItem.thumbUrl ||
            product?.thumbUrl ||
            "/placeholder.svg"
        );
        const newColor =
          newItem.attributes?.find((attr) => attr.code === "Màu")?.value || "";
        setSelectedColor(newColor);
        const otherAttributes = {};
        newItem.attributes
          .filter((attr) => attr.code !== "Màu" && attr.code !== "Phiên bản")
          .forEach((attr) => {
            otherAttributes[attr.code] = attr.value;
          });
        setSelectedOtherAttributes(otherAttributes);
      }
    },
    [selectedColor, product]
  );

  const handleOtherAttributeChange = useCallback(
    (code, value) => {
      setSelectedOtherAttributes((prev) => ({ ...prev, [code]: value }));
      const newItem =
        product?.productItems?.find(
          (item) =>
            item.attributes?.some(
              (attr) => attr.code === "Màu" && attr.value === selectedColor
            ) &&
            item.attributes?.some(
              (attr) =>
                attr.code === "Phiên bản" &&
                attr.value === selectedPrimaryAttribute
            ) &&
            item.attributes?.some(
              (attr) => attr.code === code && attr.value === value
            )
        ) || product?.productItems[0];

      if (newItem) {
        setSelectedItem(newItem);
        setMainIndex(0);
        setImage(
          newItem.images?.[0]?.image ||
            newItem.thumbUrl ||
            product?.thumbUrl ||
            "/placeholder.svg"
        );
        setSelectedColor(
          newItem.attributes?.find((attr) => attr.code === "Màu")?.value ||
            selectedColor
        );
        setSelectedPrimaryAttribute(
          newItem.attributes?.find((attr) => attr.code === "Phiên bản")
            ?.value || selectedPrimaryAttribute
        );
        const otherAttributes = {};
        newItem.attributes
          .filter((attr) => attr.code !== "Màu" && attr.code !== "Phiên bản")
          .forEach((attr) => {
            otherAttributes[attr.code] = attr.value;
          });
        setSelectedOtherAttributes(otherAttributes);
      }
    },
    [selectedColor, selectedPrimaryAttribute, product]
  );

  const renderStars = useCallback((rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const totalStars = 5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar key={`full-${i}`} className="w-4 h-4 text-yellow-400" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <FaStar
          key="half"
          className="w-4 h-4 text-yellow-400"
          style={{ clipPath: "inset(0 50% 0 0)" }}
        />
      );
    }
    for (let i = stars.length; i < totalStars; i++) {
      stars.push(
        <FaStar key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }
    return stars;
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 flex-col gap-4 min-h-[450px]">
        <div className="w-full max-w-[700px] h-[225px] sm:h-[300px] lg:h-[450px] bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="w-full max-w-[500px] h-6 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-full max-w-[300px] h-4 sm:h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error || !product || !selectedItem || !product.productItems?.length) {
    return (
      <div className="flex justify-center items-center h-96 text-red-500 text-lg">
        {error || "Không tìm thấy sản phẩm hoặc dữ liệu không hợp lệ"}
      </div>
    );
  }

  const images = selectedItem?.images || [];
  const featuredImages = product?.featuredImages || [];
  const visibleThumbnails = images.slice(0, MAX_VISIBLE_THUMBNAILS);
  const remainingThumbnails = images.length - MAX_VISIBLE_THUMBNAILS;

  const retailPrice = selectedItem?.retailPrice || 0;
  const discountedPrice = selectedItem?.discountedPrice || retailPrice;
  const onSale = discountedPrice < retailPrice;
  const discountPercentage = onSale
    ? ((retailPrice - discountedPrice) / retailPrice) * 100
    : 0;

  const primaryAttributes = [
    ...new Set(
      product?.productItems
        ?.map(
          (item) =>
            item.attributes?.find((attr) => attr.code === "Phiên bản")?.value
        )
        ?.filter(Boolean)
    ),
  ];

  const colors = [
    ...new Set(
      product?.productItems
        ?.filter((item) =>
          item.attributes?.some(
            (attr) =>
              attr.code === "Phiên bản" &&
              attr.value === selectedPrimaryAttribute
          )
        )
        ?.map(
          (item) => item.attributes?.find((attr) => attr.code === "Màu")?.value
        )
        ?.filter(Boolean)
    ),
  ].map((value) => {
    const item = product.productItems.find(
      (item) =>
        item.attributes?.some(
          (attr) => attr.code === "Màu" && attr.value === value
        ) &&
        item.attributes?.some(
          (attr) =>
            attr.code === "Phiên bản" && attr.value === selectedPrimaryAttribute
        )
    );
    return { name: value, value, image: item?.thumbUrl || "/placeholder.svg" };
  });

  const otherAttributeCodes = [
    ...new Set(
      selectedItem?.attributes
        ?.filter((attr) => attr.code !== "Màu" && attr.code !== "Phiên bản")
        ?.map((attr) => attr.code) || []
    ),
  ];

  const otherAttributeValues = otherAttributeCodes.reduce((acc, code) => {
    acc[code] = [
      ...new Set(
        product?.productItems
          .filter((item) =>
            item.attributes.every(
              (attr) =>
                attr.code === code ||
                (attr.code === "Màu" && attr.value === selectedColor) ||
                (attr.code === "Phiên bản" &&
                  attr.value === selectedPrimaryAttribute) ||
                (selectedOtherAttributes[attr.code] &&
                  attr.value === selectedOtherAttributes[attr.code])
            )
          )
          .map(
            (item) => item.attributes.find((attr) => attr.code === code)?.value
          )
          .filter(Boolean)
      ),
    ];
    return acc;
  }, {});

  const paginatedReviews = reviews.slice(
    0,
    REVIEWS_PER_PAGE * currentReviewPage
  );

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
        <div className="w-full lg:max-w-[700px] mx-auto relative">
          <div className="relative bg-white rounded-xl border border-gray-200 shadow-md w-full h-[225px] sm:h-[300px] md:h-[400px] lg:h-[450px]">
            {tab === "image" && images.length > 0 && (
              <>
                <img
                  src={image || "/placeholder.svg"}
                  alt={selectedItem.name}
                  className="w-full h-full object-contain rounded-xl"
                  loading="lazy"
                />
                <button
                  onClick={handlePrevImage}
                  className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full p-1 sm:p-2 md:p-3 opacity-80 hover:opacity-100"
                >
                  <FaChevronLeft className="text-gray-700 w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full p-1 sm:p-2 md:p-3 opacity-80 hover:opacity-100"
                >
                  <FaChevronRight className="text-gray-700 w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />
                </button>
                {images.length > 0 && (
                  <div className="absolute bottom-1 sm:bottom-2 md:bottom-4 left-1 sm:left-2 md:left-4 bg-gray-200 bg-opacity-70 px-1 py-0.5 sm:px-2 sm:py-1 md:px-2 md:py-1 rounded-full text-xs sm:text-sm">
                    {mainIndex + 1}/{images.length}
                  </div>
                )}
              </>
            )}
            {tab === "noi-bat" && featuredImages.length > 0 && (
              <>
                <img
                  src={
                    featuredImages[highlightIndex]?.image || "/placeholder.svg"
                  }
                  alt={`highlight-${highlightIndex}`}
                  className="w-full h-full object-contain rounded-xl"
                  loading="lazy"
                />
                <button
                  onClick={handlePrevImage}
                  className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full p-1 sm:p-2 md:p-3 opacity-80 hover:opacity-100"
                >
                  <FaChevronLeft className="text-gray-700 w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full p-1 sm:p-2 md:p-3 opacity-80 hover:opacity-100"
                >
                  <FaChevronRight className="text-gray-700 w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />
                </button>
                {featuredImages.length > 0 && (
                  <div className="absolute bottom-1 sm:bottom-2 md:bottom-4 left-1 sm:left-2 md:left-4 bg-gray-200 bg-opacity-70 px-1 py-0.5 sm:px-2 sm:py-1 md:px-2 md:py-1 rounded-full text-xs sm:text-sm">
                    {highlightIndex + 1}/{featuredImages.length}
                  </div>
                )}
              </>
            )}
            {tab === "video" && (
              <div className="relative w-full h-full">
                {renderVideoPlayer(
                  product.videoUrl,
                  selectedItem?.thumbUrl || product?.thumbUrl
                )}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full p-1 sm:p-2 md:p-3 opacity-80 hover:opacity-100 z-10"
                >
                  <FaChevronLeft className="text-gray-700 w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full p-1 sm:p-2 md:p-3 opacity-80 hover:opacity-100 z-10"
                >
                  <FaChevronRight className="text-gray-700 w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-center mt-2 sm:mt-4 md:mt-6 overflow-x-auto scrollbar-hidden">
            <div className="flex gap-1 sm:gap-2 md:gap-3">
              {featuredImages.length > 0 && (
                <button
                  onClick={() => handleTabChange("noi-bat")}
                  className={`flex items-center justify-center w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 border rounded-full ${
                    tab === "noi-bat" ? "border-blue-500" : "border-gray-300"
                  } flex-shrink-0`}
                >
                  <FaStar className="text-gray-600 w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />
                </button>
              )}
              {product.videoUrl && (
                <button
                  onClick={() => handleTabChange("video")}
                  className={`flex items-center justify-center w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 border rounded-full ${
                    tab === "video" ? "border-blue-500" : "border-gray-300"
                  } flex-shrink-0`}
                >
                  <FaPlay className="text-gray-600 w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />
                </button>
              )}
              {visibleThumbnails.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => handleThumbnailClick(idx)}
                  className={`w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 border rounded-full overflow-hidden ${
                    tab === "image" && mainIndex === idx
                      ? "border-blue-500"
                      : "border-gray-300"
                  } flex-shrink-0`}
                >
                  <img
                    src={img.image || "/placeholder.svg"}
                    alt={`thumb-${idx}`}
                    className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 object-contain"
                    loading="lazy"
                  />
                </button>
              ))}
              {remainingThumbnails > 0 && (
                <div className="flex items-center justify-center w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 border rounded-full bg-gray-100 flex-shrink-0">
                  <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">
                    +{remainingThumbnails}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 bg-white p-2 sm:p-4 md:p-6 rounded-xl">
          <div className="flex justify-between items-center mb-2 sm:mb-3 md:mb-4">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
              {selectedItem.name}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4 flex-wrap">
            <div className="flex items-center gap-1">
              {renderStars(selectedItem.ratingAvg || 0)}
            </div>
            <span className="text-xs sm:text-sm md:text-base text-gray-600">
              ({selectedItem.reviewCount || 0} đánh giá)
            </span>
            <span className="text-xs sm:text-sm md:text-base text-gray-600">
              Mã sản phẩm: {selectedItem.sku || "N/A"}
            </span>
          </div>
          <div className="mb-2 sm:mb-4 md:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
              <span className="text-base sm:text-lg md:text-xl font-semibold text-red-600">
                {discountedPrice.toLocaleString("vi-VN")} VNĐ
              </span>
              {onSale && (
                <>
                  <span className="text-xs sm:text-sm md:text-base text-gray-500 line-through">
                    {retailPrice.toLocaleString("vi-VN")} VNĐ
                  </span>
                  <span className="text-xs sm:text-sm md:text-base font-medium text-green-600 bg-green-100 px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-0.5 md:py-1 rounded-full">
                    -{discountPercentage.toFixed(0)}%
                  </span>
                </>
              )}
            </div>
          </div>
          {primaryAttributes.length > 0 && (
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h3 className="font-semibold mb-1 sm:mb-2 md:mb-3 text-gray-900 text-sm sm:text-base md:text-lg">
                Phiên bản
              </h3>
              <div className="flex flex-wrap gap-1 sm:gap-2 md:gap-3">
                {primaryAttributes.map((value) => (
                  <div key={value} className="relative">
                    <button
                      onClick={() => handlePrimaryAttributeChange(value)}
                      className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 border-2 rounded-lg text-center min-w-[70px] sm:min-w-[80px] md:min-w-[90px] font-medium text-xs sm:text-sm md:text-base transition-all ${
                        selectedPrimaryAttribute === value
                          ? "border-red-500 bg-red-50 text-gray-800"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {value}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {colors.length > 0 && (
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h3 className="font-semibold mb-1 sm:mb-2 md:mb-3 text-gray-900 text-sm sm:text-base md:text-lg">
                Màu sắc
              </h3>
              <div className="flex flex-wrap gap-1 sm:gap-2 md:gap-3">
                {colors.map((color) => (
                  <div key={color.value} className="relative">
                    <button
                      onClick={() => handleColorChange(color.value)}
                      className={`flex items-center gap-1 px-1 sm:px-1.5 md:px-2 py-1 sm:py-1.5 md:py-2 border-2 rounded-lg transition-all ${
                        selectedColor === color.value
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="w-5 sm:w-6 md:w-8 h-5 sm:h-6 md:h-8 flex items-center justify-center">
                        <img
                          src={color.image || "/placeholder.svg"}
                          alt={color.name}
                          className="w-5 sm:w-6 md:w-8 h-5 sm:h-6 md:h-8 object-contain"
                          loading="lazy"
                        />
                      </div>
                      <span className="font-medium text-xs sm:text-sm md:text-base text-gray-800">
                        {color.name}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {otherAttributeCodes.map((code) => (
            <div key={code} className="mb-4 sm:mb-6 md:mb-8">
              <h3 className="font-semibold mb-1 sm:mb-2 md:mb-3 text-gray-900 text-sm sm:text-base md:text-lg">
                {code}
              </h3>
              <div className="flex flex-wrap gap-1 sm:gap-2 md:gap-3">
                {otherAttributeValues[code].map((value) => (
                  <div key={value} className="relative">
                    <button
                      onClick={() => handleOtherAttributeChange(code, value)}
                      className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 border-2 rounded-lg text-center min-w-[70px] sm:min-w-[80px] md:min-w-[90px] font-medium text-xs sm:text-sm md:text-base transition-all ${
                        selectedOtherAttributes[code] === value
                          ? "border-red-500 bg-red-50 text-gray-800"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {value}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex gap-2 sm:gap-3 md:gap-4">
            <button
              onClick={() => addToCartHandler(selectedItem._id)}
              className="flex-1 bg-blue-600 text-white py-2 sm:py-3 md:py-4 rounded-xl font-medium text-sm sm:text-base md:text-lg hover:bg-blue-700 transition-colors"
            >
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={() => buyNowHandler(selectedItem._id)}
              className="flex-1 bg-red-600 text-white py-2 sm:py-3 md:py-4 rounded-xl font-medium text-sm sm:text-base md:text-lg hover:bg-red-700 transition-colors"
            >
              Mua ngay
            </button>
            <button
              onClick={() => toggleWishlistHandler(selectedItem._id)}
              className={`flex items-center justify-center w-12 sm:w-14 md:w-16 py-2 sm:py-3 md:py-4 rounded-xl font-medium text-sm sm:text-base md:text-lg transition-colors ${
                isFavorited
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              title={isFavorited ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
            >
              <FaHeart className="w-5 sm:w-6 md:w-7 h-5 sm:h-6 md:h-7" />
            </button>
          </div>
        </div>
      </div>
      <ProductDescription
        description={product.description}
        specifications={selectedItem.specifications}
      />
      <ProductFeature />
      <RelatedProduct productItemId={selectedItem._id} />
      <div className="mt-4 sm:mt-6 md:mt-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4">
          Đánh giá sản phẩm
        </h2>
        {reviewsLoading ? (
          <div className="flex justify-center items-center h-24 sm:h-32">
            <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-gray-600 text-center text-sm sm:text-base md:text-lg">
            Chưa có đánh giá nào cho sản phẩm này.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[300px]">
              {paginatedReviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 md:mb-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <img
                      src={review.userId.avatarUrl || "/placeholder.svg"}
                      alt={review.userId.fullName}
                      className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 rounded-full object-cover"
                      loading="lazy"
                    />
                    <span className="text-sm sm:text-base md:text-lg text-gray-800">
                      {review.userId.fullName}
                    </span>
                  </div>
                  <div className="text-sm sm:text-base md:text-lg text-gray-600">
                    {review.productItemId.name}
                    <div className="text-xs sm:text-sm md:text-base text-gray-500">
                      {review.productItemId.attributes.map((attr) => (
                        <span key={attr._id}>
                          {attr.code}: {attr.value}{" "}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1 sm:mt-2 mb-1 sm:mb-2">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-sm sm:text-base md:text-lg text-gray-600">
                    {review.comment}
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1 sm:mt-2">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              ))}
            </div>
            {reviews.length > REVIEWS_PER_PAGE && (
              <div className="flex justify-center gap-2 mt-2 sm:mt-3 md:mt-4">
                <button
                  disabled={currentReviewPage === 1}
                  onClick={() => setCurrentReviewPage((prev) => prev - 1)}
                  className={`bg-white border border-gray-200 text-gray-800 py-1 sm:py-1.5 md:py-2 px-2 sm:px-3 md:px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base ${
                    currentReviewPage === 1 ? "opacity-50" : ""
                  }`}
                >
                  Trang trước
                </button>
                <button
                  disabled={paginatedReviews.length < REVIEWS_PER_PAGE}
                  onClick={() => setCurrentReviewPage((prev) => prev + 1)}
                  className={`bg-white border border-gray-200 text-gray-800 py-1 sm:py-1.5 md:py-2 px-2 sm:px-3 md:px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base ${
                    paginatedReviews.length < REVIEWS_PER_PAGE
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;