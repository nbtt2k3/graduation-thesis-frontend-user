"use client";
import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import Title from "../../components/Title/Title";
import CartTotal from "../../components/CartTotal/CartTotal";
import * as apis from "../../apis";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import axios from "axios";

// Hàm xử lý lỗi API chung
const handleApiError = (error, defaultMessage) => {
  toast.error(error.message || defaultMessage, { duration: 4000 });
};

// Hàm debounce
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Cấu hình biểu tượng mặc định cho Leaflet
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const AddressSection = ({
  addresses,
  setAddresses,
  selectedAddress,
  setSelectedAddress,
  showSavedAddresses,
  setShowSavedAddresses,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      addressLine: "",
      longitude: "",
      latitude: "",
      type: "home",
    },
  });
  const [mapVisible, setMapVisible] = useState(false);
  const [coordinates, setCoordinates] = useState({
    longitude: 105.8342,
    latitude: 21.0278,
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const provinceValue = watch("province");
  const districtValue = watch("district");
  const wardValue = watch("ward");
  const addressLineValue = watch("addressLine");
  const addressTypes = [
    { value: "home", label: "Nhà riêng" },
    { value: "work", label: "Cơ quan" },
    { value: "other", label: "Khác" },
  ];

  useEffect(() => {
    const fetchProvinces = async () => {
      const cachedProvinces = localStorage.getItem("provinces");
      if (cachedProvinces) {
        setProvinces(JSON.parse(cachedProvinces));
        setIsLoadingProvinces(false);
        return;
      }
      setIsLoadingProvinces(true);
      try {
        const response = await fetch("/dvhcvn/dvhcvn.json");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const formattedProvinces = data.data.map((province) => ({
          code: province.level1_id,
          name: province.name,
          type: province.type,
          level2s: province.level2s,
        }));
        setProvinces(formattedProvinces);
        localStorage.setItem("provinces", JSON.stringify(formattedProvinces));
      } catch (error) {
        handleApiError(error, "Không thể tải danh sách tỉnh/thành phố!");
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (provinceValue) {
      setIsLoadingDistricts(true);
      try {
        const selectedProvince = provinces.find(
          (p) => p.code === provinceValue
        );
        setDistricts(
          selectedProvince?.level2s.map((district) => ({
            code: district.level2_id,
            name: district.name,
            type: district.type,
            level3s: district.level3s,
          })) || []
        );
        setWards([]);
        setValue("district", "");
        setValue("ward", "");
      } catch (error) {
        handleApiError(error, "Không thể tải danh sách quận/huyện!");
      } finally {
        setIsLoadingDistricts(false);
      }
    } else {
      setDistricts([]);
      setWards([]);
      setValue("district", "");
      setValue("ward", "");
    }
  }, [provinceValue, provinces, setValue]);

  useEffect(() => {
    if (districtValue) {
      setIsLoadingWards(true);
      try {
        const selectedDistrict = districts.find(
          (d) => d.code === districtValue
        );
        setWards(
          selectedDistrict?.level3s.map((ward) => ({
            code: ward.level3_id,
            name: ward.name,
            type: ward.type,
          })) || []
        );
        setValue("ward", "");
      } catch (error) {
        handleApiError(error, "Không thể tải danh sách phường/xã!");
      } finally {
        setIsLoadingWards(false);
      }
    } else {
      setWards([]);
      setValue("ward", "");
    }
  }, [districtValue, districts, setValue]);

  useEffect(() => {
    if (addressLineValue && provinceValue && districtValue && wardValue) {
      const fetchSuggestions = async () => {
        try {
          const province =
            provinces.find((p) => p.code === provinceValue)?.name || "";
          const district =
            districts.find((d) => d.code === districtValue)?.name || "";
          const ward = wards.find((w) => w.code === wardValue)?.name || "";
          const query = `${addressLineValue}, Phường ${ward}, Quận ${district}, Thành phố ${province}, Vietnam`;
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              query
            )}&addressdetails=1&limit=5&countrycodes=vn`,
            {
              headers: {
                "Accept-Language": "vi",
              },
            }
          );
          if (!response.data || !Array.isArray(response.data)) {
            throw new Error("Dữ liệu gợi ý không hợp lệ!");
          }
          setAddressSuggestions(response.data);
        } catch (error) {
          handleApiError(error, "Đã xảy ra lỗi khi tải danh sách gợi ý!");
          setAddressSuggestions([]);
        }
      };
      const debouncedFetchSuggestions = debounce(fetchSuggestions, 500);
      debouncedFetchSuggestions();
    } else {
      setAddressSuggestions([]);
    }
  }, [
    addressLineValue,
    provinceValue,
    districtValue,
    wardValue,
    provinces,
    districts,
    wards,
  ]);

  const isValidVietnamCoordinates = ({ latitude, longitude }) => {
    return (
      (latitude >= 7.0 &&
        latitude <= 24.0 &&
        longitude >= 99.0 &&
        longitude <= 113.0) ||
      (latitude >= 6.0 &&
        latitude <= 12.0 &&
        longitude >= 111.0 &&
        longitude <= 117.0)
    );
  };

  const geocodeAddress = async (addressData, retryCount = 0) => {
    const { addressLine, ward, district, province } = addressData;
    if (!addressLine || !ward || !district || !province) {
      toast.error("Vui lòng điền đầy đủ các trường địa chỉ!");
      return null;
    }
    setIsGeocoding(true);
    const provinceName = provinces.find((p) => p.code === province)?.name || "";
    const districtName = districts.find((d) => d.code === district)?.name || "";
    const wardName = wards.find((w) => w.code === ward)?.name || "";
    const addressComponents = [
      addressLine,
      `Phường ${wardName}`,
      `Quận ${districtName}`,
      `Thành phố ${provinceName}`,
      "Vietnam",
    ]
      .filter(Boolean)
      .join(", ");
    const queries = [
      addressComponents,
      `${addressLine}, Quận ${districtName}, Thành phố ${provinceName}, Vietnam`,
      `Phường ${wardName}, Quận ${districtName}, Thành phố ${provinceName}, Vietnam`,
      `Quận ${districtName}, Thành phố ${provinceName}, Vietnam`,
      `Thành phố ${provinceName}, Vietnam`,
    ];
    for (let i = 0; i < queries.length; i++) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            queries[i]
          )}&addressdetails=1&limit=1&countrycodes=vn`,
          {
            headers: {
              "User-Agent": "ECommerceApp/1.0 (contact@yourapp.com)",
              "Accept-Language": "vi",
            },
          }
        );
        if (!response.ok) {
          if (response.status === 429 && retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
            return geocodeAddress(addressData, retryCount + 1);
          }
          throw new Error(
            `Lỗi API: ${response.status} - ${response.statusText}`
          );
        }
        const data = await response.json();
        if (data.length > 0) {
          const { lat, lon } = data[0];
          const newCoordinates = {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
          };
          if (!isValidVietnamCoordinates(newCoordinates)) {
            continue;
          }
          setCoordinates(newCoordinates);
          setValue("latitude", newCoordinates.latitude.toString());
          setValue("longitude", newCoordinates.longitude.toString());
          if (mapRef.current && markerRef.current) {
            mapRef.current.setView(
              [newCoordinates.latitude, newCoordinates.longitude],
              15
            );
            markerRef.current.setLatLng([
              newCoordinates.latitude,
              newCoordinates.longitude,
            ]);
          }
          toast.success(`Tọa độ đã được cập nhật cho ${queries[i]}!`);
          setIsGeocoding(false);
          return newCoordinates;
        }
      } catch (error) {
        handleApiError(error, `Không thể định vị địa chỉ: ${error.message}`);
      }
    }
    setIsGeocoding(false);
    toast.warn(
      "Không tìm thấy tọa độ chính xác. Vui lòng kiểm tra địa chỉ hoặc chọn vị trí trên bản đồ."
    );
    setMapVisible(true);
    return null;
  };

  const debouncedGeocodeAddress = useRef(
    debounce(geocodeAddress, 1500)
  ).current;

  const handleShowMap = async () => {
    const addressData = {
      addressLine: addressLineValue,
      ward: wardValue,
      district: districtValue,
      province: provinceValue,
    };
    const coords = await geocodeAddress(addressData);
    if (coords) {
      setMapVisible(true);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    if (!suggestion.lat || !suggestion.lon) {
      toast.error("Dữ liệu gợi ý không hợp lệ!");
      return;
    }
    const newCoordinates = {
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
    };
    if (isNaN(newCoordinates.latitude) || isNaN(newCoordinates.longitude)) {
      toast.error("Tọa độ không hợp lệ!");
      return;
    }
    if (isValidVietnamCoordinates(newCoordinates)) {
      setCoordinates(newCoordinates);
      setValue("latitude", newCoordinates.latitude.toString());
      setValue("longitude", newCoordinates.longitude.toString());
      setValue(
        "addressLine",
        suggestion.address?.road ||
          suggestion.display_name?.split(", ")[0] ||
          ""
      );
      setAddressSuggestions([]);
      if (mapRef.current && markerRef.current) {
        mapRef.current.setView(
          [newCoordinates.latitude, newCoordinates.longitude],
          15
        );
        markerRef.current.setLatLng([
          newCoordinates.latitude,
          newCoordinates.longitude,
        ]);
      }
      toast.success("Đã chọn địa chỉ từ gợi ý!");
    } else {
      toast.error("Tọa độ không hợp lệ. Vui lòng chọn lại.");
    }
  };

  useEffect(() => {
    let mapInitialized = false;
    if (mapVisible && !mapRef.current) {
      const mapElement = document.getElementById("map");
      if (!mapElement) {
        toast.error("Không thể tải bản đồ!");
        return;
      }
      mapRef.current = L.map("map").setView(
        [coordinates.latitude, coordinates.longitude],
        15
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
      markerRef.current = L.marker(
        [coordinates.latitude, coordinates.longitude],
        {
          draggable: true,
        }
      ).addTo(mapRef.current);
      markerRef.current.on("dragend", async (e) => {
        const { lat, lng } = e.target.getLatLng();
        if (isValidVietnamCoordinates({ latitude: lat, longitude: lng })) {
          setCoordinates({ latitude: lat, longitude: lng });
          setValue("latitude", lat.toString());
          setValue("longitude", lng.toString());
        } else {
          toast.error("Vị trí nằm ngoài phạm vi Việt Nam. Vui lòng chọn lại.");
          markerRef.current.setLatLng([
            coordinates.latitude,
            coordinates.longitude,
          ]);
        }
      });
      mapInitialized = true;
    }
    return () => {
      if (mapRef.current && mapInitialized) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [mapVisible, coordinates, setValue]);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowSavedAddresses(false);
    setShowForm(false);
    const addressData = {
      addressLine: address.address.split(", ")[0] || "",
      ward: address.address.split(", ")[1] || "",
      district: address.address.split(", ")[2] || "",
      province: address.address.split(", ")[3] || "",
    };
    setValue("addressLine", addressData.addressLine);
    setValue(
      "ward",
      wards.find((w) => w.name === addressData.ward)?.code || ""
    );
    setValue(
      "district",
      districts.find((d) => d.name === addressData.district)?.code || ""
    );
    setValue(
      "province",
      provinces.find((p) => p.name === addressData.province)?.code || ""
    );
    setValue("type", address.type || "home");
    debouncedGeocodeAddress(addressData);
  };

  const handleDeleteAddress = async (addressId) => {
    const addressToDelete = addresses.find((addr) => addr._id === addressId);
    if (addressToDelete?.isDefault) {
      toast.error("Không thể xóa địa chỉ mặc định!");
      return;
    }
    try {
      const response = await apis.deleteAddress(addressId);
      if (!response.success) {
        throw new Error("Xóa địa chỉ không thành công!");
      }
      const updatedAddresses = addresses.filter(
        (addr) => addr._id !== addressId
      );
      setAddresses(updatedAddresses);
      if (selectedAddress?._id === addressId) {
        const defaultAddress = updatedAddresses.find((addr) => addr.isDefault);
        setSelectedAddress(defaultAddress || updatedAddresses[0] || null);
        if (!updatedAddresses.length) {
          toast.warn("Danh sách địa chỉ trống. Vui lòng thêm địa chỉ mới!");
          setShowForm(true);
          setShowSavedAddresses(false);
        }
      }
      toast.success("Địa chỉ đã được xóa!");
    } catch (error) {
      handleApiError(error, "Không thể xóa địa chỉ!");
    }
  };

  const onCreateAddress = async (data) => {
    let coords = await geocodeAddress(data);
    if (!coords && !mapVisible) {
      toast.error("Vui lòng điều chỉnh vị trí trên bản đồ trước khi lưu.");
      return;
    }
    coords = coords || coordinates;
    if (!isValidVietnamCoordinates(coords)) {
      toast.error(
        "Tọa độ không hợp lệ. Vui lòng chọn vị trí trong phạm vi Việt Nam."
      );
      return;
    }
    const provinceName =
      provinces.find((p) => p.code === data.province)?.name || "";
    const districtName =
      districts.find((d) => d.code === data.district)?.name || "";
    const wardName = wards.find((w) => w.code === data.ward)?.name || "";
    const newAddress = {
      fullName: data.fullName,
      phone: data.phone,
      addressLine: data.addressLine,
      ward: wardName,
      district: districtName,
      province: provinceName,
      type: data.type,
      isDefault: addresses.length === 0 || true,
      location: {
        type: "Point",
        coordinates: [coords.longitude, coords.latitude],
      },
    };
    try {
      const response = await apis.createAddress(newAddress);
      if (!response.success || !response.address?._id) {
        throw new Error("Tạo địa chỉ không thành công!");
      }
      const addressResponse = await apis.getAllAddresses();
      if (
        !addressResponse.success ||
        !Array.isArray(addressResponse.addressList)
      ) {
        throw new Error("Không thể tải lại danh sách địa chỉ!");
      }
      const formattedAddresses = addressResponse.addressList.map((addr) => ({
        _id: addr._id,
        fullName: addr.fullName || "Unknown",
        phone: addr.phone || "Unknown",
        address: `${addr.addressLine}, ${addr.ward}, ${addr.district}, ${addr.province}`,
        type: addr.type || "home",
        isDefault: addr.isDefault || false,
      }));
      setAddresses(formattedAddresses);
      const newSelectedAddress = formattedAddresses.find(
        (addr) => addr._id === response.address._id
      );
      if (newSelectedAddress) {
        setSelectedAddress(newSelectedAddress);
      } else {
        const formattedAddress = {
          _id: response.address._id,
          fullName: newAddress.fullName,
          phone: newAddress.phone,
          address: `${newAddress.addressLine}, ${wardName}, ${districtName}, ${provinceName}`,
          type: newAddress.type,
          isDefault: newAddress.isDefault,
        };
        setSelectedAddress(formattedAddress);
      }
      setShowSavedAddresses(false);
      setShowForm(false);
      setMapVisible(false);
      reset();
      toast.success("Đã thêm địa chỉ mới!");
    } catch (error) {
      handleApiError(error, "Không thể lưu địa chỉ mới!");
    }
  };

  const handleAddressInputChange = async (data) => {
    await debouncedGeocodeAddress(data);
  };

  return (
    <div className="flex flex-col gap-4 text-sm">
      <Title
        title1={"Thông tin"}
        title2={"nhận hàng"}
        title1Styles={"text-xl font-bold"}
      />
      {addresses.length > 0 &&
      selectedAddress &&
      !showSavedAddresses &&
      !showForm ? (
        <>
          <div className="mt-3 p-4 border border-gray-300 rounded bg-white">
            <p className="text-sm font-medium">Địa chỉ nhận hàng:</p>
            <p className="text-xs">{selectedAddress.fullName}</p>
            <p className="text-xs">SĐT: {selectedAddress.phone}</p>
            <p className="text-xs">{selectedAddress.address}</p>
            <p className="text-xs">
              Loại:{" "}
              {addressTypes.find((t) => t.value === selectedAddress.type)
                ?.label || selectedAddress.type}
            </p>
            {selectedAddress.isDefault && (
              <span className="text-xs text-red-600 font-medium">Mặc định</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowSavedAddresses(true)}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            aria-label="Chọn từ danh sách địa chỉ đã lưu hoặc thêm mới"
          >
            Chọn địa chỉ khác hoặc thêm mới
          </button>
        </>
      ) : (
        <>
          {showSavedAddresses && addresses.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2 border border-gray-300 rounded p-4 bg-white">
              <h4 className="text-sm font-medium">Địa chỉ đã lưu</h4>
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className={`p-3 border rounded transition-all ${
                    selectedAddress?._id === address._id
                      ? "bg-gray-200 border-gray-700"
                      : "bg-white border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleAddressSelect(address)}
                    className="text-left w-full"
                    aria-label={`Chọn địa chỉ: ${address.address}`}
                  >
                    <p className="text-xs">{address.fullName}</p>
                    <p className="text-xs">SĐT: {address.phone}</p>
                    <p className="text-xs">{address.address}</p>
                    <p className="text-xs">
                      Loại:{" "}
                      {addressTypes.find((t) => t.value === address.type)
                        ?.label || address.type}
                    </p>
                    {address.isDefault && (
                      <span className="text-xs text-red-600 font-medium">
                        Mặc định
                      </span>
                    )}
                  </button>
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(address._id)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition-colors mt-2"
                      aria-label={`Xóa địa chỉ: ${address.address}`}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setShowSavedAddresses(false);
                  setShowForm(true);
                }}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors mt-2"
                aria-label="Thêm địa chỉ mới"
              >
                Thêm địa chỉ mới
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSavedAddresses(false);
                  setShowForm(false);
                }}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors mt-2"
                aria-label="Hủy"
              >
                Hủy
              </button>
            </div>
          ) : (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-2">
                {addresses.length > 0
                  ? "Thêm địa chỉ mới"
                  : "Thêm địa chỉ nhận hàng"}
              </h4>
              <form
                onSubmit={handleSubmit(onCreateAddress)}
                className="flex flex-col gap-3"
              >
                <div>
                  <input
                    {...register("fullName", {
                      required: "Họ tên là bắt buộc",
                    })}
                    placeholder="Họ tên"
                    className="border border-gray-300 p-2 rounded bg-white outline-none w-full"
                    aria-label="Nhập họ tên"
                    aria-describedby="fullName-error"
                  />
                  {errors.fullName && (
                    <p
                      id="fullName-error"
                      className="text-xs text-red-500 mt-1"
                      aria-live="polite"
                    >
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("phone", {
                      required: "Số điện thoại là bắt buộc",
                      pattern: {
                        value: /^(0[3|5|7|8|9])[0-9]{8}$/,
                        message:
                          "Số điện thoại phải có 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09",
                      },
                    })}
                    placeholder="Số điện thoại"
                    className="border border-gray-300 p-2 rounded bg-white outline-none w-full"
                    aria-label="Nhập số điện thoại"
                    aria-describedby="phone-error"
                  />
                  {errors.phone && (
                    <p
                      id="phone-error"
                      className="text-xs text-red-500 mt-1"
                      aria-live="polite"
                    >
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div>
                  <select
                    {...register("type", {
                      required: "Loại địa chỉ là bắt buộc",
                    })}
                    className="border border-gray-300 p-2 rounded bg-white outline-none w-full"
                    aria-label="Chọn loại địa chỉ"
                    aria-describedby="type-error"
                  >
                    <option value="">Chọn loại địa chỉ</option>
                    {addressTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p
                      id="type-error"
                      className="text-xs text-red-500 mt-1"
                      aria-live="polite"
                    >
                      {errors.type.message}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <div className="w-1/3">
                    <select
                      {...register("province", {
                        required: "Tỉnh/Thành phố là bắt buộc",
                      })}
                      className="border border-gray-300 p-2 rounded bg-white outline-none w-full"
                      aria-label="Chọn Tỉnh/Thành phố"
                      aria-describedby="province-error"
                      disabled={isLoadingProvinces || !provinces.length}
                    >
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                    {errors.province && (
                      <p
                        id="province-error"
                        className="text-xs text-red-500 mt-1"
                        aria-live="polite"
                      >
                        {errors.province.message}
                      </p>
                    )}
                    {isLoadingProvinces && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <svg
                          className="animate-spin h-4 w-4 text-gray-500"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h-8z"
                          />
                        </svg>
                        Đang tải tỉnh/thành phố...
                      </div>
                    )}
                  </div>
                  <div className="w-1/3">
                    <select
                      {...register("district", {
                        required: "Quận/Huyện là bắt buộc",
                      })}
                      className="border border-gray-300 p-2 rounded bg-white outline-none w-full"
                      aria-label="Chọn Quận/Huyện"
                      aria-describedby="district-error"
                      disabled={!provinceValue || isLoadingDistricts}
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                    {errors.lower && (
                      <p
                        id="district-error"
                        className="text-xs text-red-500 mt-1"
                        aria-live="polite"
                      >
                        {errors.district.message}
                      </p>
                    )}
                    {isLoadingDistricts && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <svg
                          className="animate-spin h-4 w-4 text-gray-500"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h-8z"
                          />
                        </svg>
                        Đang tải quận/huyện...
                      </div>
                    )}
                  </div>
                  <div className="w-1/3">
                    <select
                      {...register("ward", {
                        required: "Phường/Xã là bắt buộc",
                      })}
                      className="border border-gray-300 p-2 rounded bg-white outline-none w-full"
                      aria-label="Chọn Phường/Xã"
                      aria-describedby="ward-error"
                      disabled={!districtValue || isLoadingWards}
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                    {errors.ward && (
                      <p
                        id="ward-error"
                        className="text-xs text-red-500 mt-1"
                        aria-live="polite"
                      >
                        {errors.ward.message}
                      </p>
                    )}
                    {isLoadingWards && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <svg
                          className="animate-spin h-4 w-4 text-gray-500"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h-8z"
                          />
                        </svg>
                        Đang tải phường/xã...
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <input
                    {...register("addressLine", {
                      required: "Địa chỉ là bắt buộc",
                    })}
                    placeholder="Địa chỉ chi tiết (số nhà, tên đường)"
                    className="border border-gray-300 p-2 rounded bg-white outline-none w-full"
                    aria-label="Nhập địa chỉ chi tiết"
                    aria-describedby="addressLine-error"
                    onBlur={() => handleSubmit(handleAddressInputChange)()}
                  />
                  {errors.addressLine && (
                    <p
                      id="addressLine-error"
                      className="text-xs text-red-500 mt-1"
                      aria-live="polite"
                    >
                      {errors.addressLine.message}
                    </p>
                  )}
                  {addressSuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                      {addressSuggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="p-2 text-xs hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSuggestionSelect(suggestion)}
                        >
                          {suggestion.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleShowMap}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors mt-2"
                  aria-label="Xem bản đồ dựa trên địa chỉ đã nhập"
                  disabled={
                    isGeocoding ||
                    !addressLineValue ||
                    !provinceValue ||
                    !districtValue ||
                    !wardValue
                  }
                >
                  {isGeocoding ? "Đang định vị..." : "Xem bản đồ"}
                </button>
                {mapVisible && (
                  <div id="map" className="h-96 w-full mt-3"></div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors mt-3"
                    aria-label="Lưu địa chỉ mới"
                    disabled={isGeocoding}
                  >
                    {isGeocoding ? "Đang xử lý..." : "Lưu địa chỉ"}
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setShowSavedAddresses(true);
                      }}
                      className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors mt-3"
                      aria-label="Hủy và xem danh sách địa chỉ"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const VoucherSection = ({
  vouchers,
  selectedProductVoucher,
  setSelectedProductVoucher,
  selectedFreeShipVoucher,
  setSelectedFreeShipVoucher,
  couponCode,
  setCouponCode,
  couponDiscount,
  setCouponDiscount,
}) => {
  const applyCoupon = async () => {
    if (!couponCode) {
      toast.error("Vui lòng nhập mã coupon!");
      return;
    }
    try {
      const response = await apis.getCouponByCode({ couponCode });
      if (!response.success || !response.coupon?._id) {
        throw new Error("Mã coupon không hợp lệ!");
      }
      const coupon = response.coupon;
      const currentDate = new Date();
      if (
        !coupon.isActive ||
        new Date(coupon.validTo) < currentDate ||
        new Date(coupon.validFrom) > currentDate
      ) {
        throw new Error("Coupon không hợp lệ hoặc đã hết hạn!");
      }
      const formattedCoupon = {
        _id: coupon._id,
        code: coupon.code,
        applyTo: coupon.applyTo,
        type: coupon.type,
        value: coupon.value,
        minValue: coupon.minValue,
        maxValue: coupon.maxValue,
        validFrom: coupon.validFrom,
        validTo: coupon.validTo,
      };
      setCouponDiscount(formattedCoupon);
      setCouponCode("");
      toast.success("Áp dụng mã coupon thành công!");
    } catch (error) {
      handleApiError(error, "Không thể áp dụng mã coupon!");
    }
  };

  return (
    <div className="mt-6">
      <Title
        title1={"Áp dụng"}
        title2={"khuyến mãi"}
        title1Styles={"text-xl font-bold"}
      />
      <div className="flex flex-col gap-4 mt-3">
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium">Phiếu giảm giá sản phẩm</h4>
          <select
            value={selectedProductVoucher?._id || ""}
            onChange={(e) => {
              const voucher = vouchers.find(
                (v) => v._id === e.target.value && v.voucherType === "product"
              );
              setSelectedProductVoucher(voucher || null);
            }}
            className="border border-gray-300 p-2 rounded bg-white outline-none w-full"
            aria-label="Chọn voucher giảm giá sản phẩm"
          >
            <option value="">Chọn voucher giảm giá</option>
            {vouchers.filter((v) => v.voucherType === "product").length > 0 ? (
              vouchers
                .filter((v) => v.voucherType === "product")
                .map((voucher) => (
                  <option key={voucher._id} value={voucher._id}>
                    {voucher.code} -{" "}
                    {voucher.type === "percentage"
                      ? `${voucher.value}% (Tối đa ${voucher.maxValue.toLocaleString(
                          "vi-VN"
                        )} VNĐ)`
                      : `${voucher.value.toLocaleString("vi-VN")} VNĐ`}
                  </option>
                ))
            ) : (
              <option disabled>Không có voucher sản phẩm nào</option>
            )}
          </select>
          {selectedProductVoucher && (
            <p className="text-xs text-green-600">
              Đã áp dụng: {selectedProductVoucher.code} (
              {selectedProductVoucher.type === "percentage"
                ? `${selectedProductVoucher.value}% (Tối đa ${selectedProductVoucher.maxValue.toLocaleString(
                    "vi-VN"
                  )} VNĐ)`
                : `${selectedProductVoucher.value.toLocaleString("vi-VN")} VNĐ`}
              )
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium">Phiếu miễn phí vận chuyển</h4>
          <select
            value={selectedFreeShipVoucher?._id || ""}
            onChange={(e) => {
              const voucher = vouchers.find(
                (v) => v._id === e.target.value && v.voucherType === "shipping"
              );
              setSelectedFreeShipVoucher(voucher || null);
            }}
            className="border border-gray-300 p-2 rounded bg-white outline-none w-full"
            aria-label="Chọn voucher miễn phí vận chuyển"
          >
            <option value="">Chọn voucher miễn phí vận chuyển</option>
            {vouchers.filter((v) => v.voucherType === "shipping").length > 0 ? (
              vouchers
                .filter((v) => v.voucherType === "shipping")
                .map((voucher) => (
                  <option key={voucher._id} value={voucher._id}>
                    {voucher.code} - Miễn phí vận chuyển
                  </option>
                ))
            ) : (
              <option disabled>Không có voucher vận chuyển nào</option>
            )}
          </select>
          {selectedFreeShipVoucher && (
            <p className="text-xs text-green-600">
              Đã áp dụng: {selectedFreeShipVoucher.code} (Miễn phí vận chuyển)
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium">Mã giảm giá</h4>
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Nhập mã coupon"
              className="border border-gray-300 p-2 rounded bg-white outline-none flex-1"
              aria-label="Nhập mã coupon"
            />
            <button
              type="button"
              onClick={applyCoupon}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              aria-label="Áp dụng mã coupon"
            >
              Áp dụng
            </button>
          </div>
          {couponDiscount && (
            <p className="text-xs text-green-600">
              Đã áp dụng: {couponDiscount.code} (
              {couponDiscount.type === "percentage"
                ? `${couponDiscount.value}%`
                : `${couponDiscount.value.toLocaleString("vi-VN")} VNĐ`}
              )
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const PaymentSection = ({
  method,
  setMethod,
  isSubmitting,
  onSubmit,
  isLoading,
}) => {
  return (
    <div className="my-6">
      <h3 className="text-xl font-bold mb-5">
        Phương thức <span>thanh toán</span>
      </h3>
      <div className="flex gap-3 mb-3">
        <button
          type="button"
          onClick={() => setMethod("momo")}
          className={`${
            method === "momo"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800 border border-gray-800"
          } py-2 px-4 rounded text-xs hover:bg-gray-700 hover:text-white transition-colors`}
          disabled={isLoading}
          aria-label="Thanh toán bằng MoMo"
        >
          Thanh toán bằng MoMo
        </button>
        <button
          type="button"
          onClick={() => setMethod("cod")}
          className={`${
            method === "cod"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800 border border-gray-800"
          } py-2 px-4 rounded text-xs hover:bg-gray-700 hover:text-white transition-colors`}
          disabled={isLoading}
          aria-label="Thanh toán khi nhận hàng"
        >
          Thanh toán khi nhận hàng
        </button>
      </div>
      {method === "momo" && (
        <div className="flex flex-col gap-2 mt-3">
          <div className="flex items-center gap-3 p-2 border rounded bg-gray-200 border-gray-700">
            <img
              src="/logo_momo.png"
              alt="MoMo"
              className="w-6 h-6"
              onError={(e) => (e.target.src = "https://via.placeholder.com/24")}
            />
            <span className="text-sm font-medium">MoMo</span>
          </div>
        </div>
      )}
      <div className="flex gap-3 mt-3">
        <button
          type="button"
          onClick={onSubmit}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isSubmitting || isLoading}
          aria-label={
            isSubmitting
              ? "Đang xử lý đơn hàng"
              : isLoading
                ? "Đang tải"
                : "Đặt hàng"
          }
        >
          {isSubmitting
            ? "Đang xử lý..."
            : isLoading
              ? "Đang tải..."
              : "Đặt hàng"}
        </button>
      </div>
    </div>
  );
};

const PlaceOrder = () => {
  const { cartItems, resetCart, fetchCart, auth } = useContext(ShopContext);
  const [method, setMethod] = useState("cod");
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [vouchers, setVouchers] = useState([]);
  const [selectedProductVoucher, setSelectedProductVoucher] = useState(null);
  const [selectedFreeShipVoucher, setSelectedFreeShipVoucher] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [addressResponse, voucherResponse] = await Promise.all([
          apis.getAllAddresses(),
          apis.getAllUserVouchersById(),
        ]);

        // Xử lý địa chỉ
        if (
          !addressResponse.success ||
          !Array.isArray(addressResponse.addressList)
        ) {
          throw new Error("Không thể tải danh sách địa chỉ!");
        }
        const formattedAddresses = addressResponse.addressList.map((addr) => ({
          _id: addr._id,
          fullName: addr.fullName || "Unknown",
          phone: addr.phone || "Unknown",
          address: `${addr.addressLine}, ${addr.ward}, ${addr.district}, ${addr.province}`,
          type: addr.type || "home",
          isDefault: addr.isDefault || false,
        }));
        setAddresses(formattedAddresses);
        const defaultAddress = formattedAddresses.find(
          (addr) => addr.isDefault
        );
        setSelectedAddress(defaultAddress || formattedAddresses[0] || null);
        setShowSavedAddresses(false);

        // Xử lý voucher
        if (
          !voucherResponse.success ||
          !Array.isArray(voucherResponse.userVoucherList)
        ) {
          throw new Error("Không thể tải danh sách voucher!");
        }
        const currentDate = new Date();
        const formattedVouchers = voucherResponse.userVoucherList
          .filter((v) => {
            const isValid =
              !v.isUsed &&
              v.voucherId?.isActive &&
              v.voucherId?.validFrom &&
              v.voucherId?.validTo &&
              new Date(v.voucherId.validFrom) <= currentDate &&
              new Date(v.voucherId.validTo) >= currentDate;
            return isValid;
          })
          .map((v) => ({
            _id: v._id || "",
            code: v.voucherId?.code || "",
            voucherType: v.voucherId?.applyTo || "",
            type: v.voucherId?.type || "",
            value: v.voucherId?.value || 0,
            minValue: v.voucherId?.minValue || 0,
            maxValue: v.voucherId?.maxValue || 0,
            validFrom: v.voucherId?.validFrom || "",
            validTo: v.voucherId?.validTo || "",
          }));
        setVouchers(formattedVouchers);

        // Fetch cart
        if (auth.isLoggedIn && auth.token) {
          await fetchCart();
        }
      } catch (error) {
        handleApiError(error, "Không thể tải dữ liệu!");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [auth, fetchCart]);

  useEffect(() => {
    if (selectedAddress?._id) {
      const fetchUpdatedCart = async () => {
        try {
          await fetchCart();
        } catch (error) {
          handleApiError(error, "Không thể cập nhật giỏ hàng!");
        }
      };
      fetchUpdatedCart();
    }
  }, [selectedAddress?._id, fetchCart]);

  const totalAmount = useMemo(() => {
    let total = cartItems?.totalAmount ?? 0;
    let shippingFee = cartItems?.shippingFee ?? 0;
    const currentDate = new Date();
    if (
      selectedProductVoucher &&
      selectedProductVoucher.minValue &&
      total >= selectedProductVoucher.minValue &&
      selectedProductVoucher.validTo &&
      new Date(selectedProductVoucher.validTo) >= currentDate
    ) {
      if (selectedProductVoucher.type === "percentage") {
        const discount = Math.min(
          total * (selectedProductVoucher.value / 100),
          selectedProductVoucher.maxValue
        );
        total -= discount;
      } else if (selectedProductVoucher.type === "fixed") {
        total -= selectedProductVoucher.value;
      }
    }
    if (
      selectedFreeShipVoucher &&
      selectedFreeShipVoucher.validTo &&
      new Date(selectedFreeShipVoucher.validTo) >= currentDate
    ) {
      shippingFee = 0;
    }
    if (
      couponDiscount &&
      couponDiscount.validTo &&
      new Date(couponDiscount.validTo) >= currentDate &&
      (!couponDiscount.minValue || total >= couponDiscount.minValue)
    ) {
      if (couponDiscount.type === "percentage") {
        const discount = Math.min(
          total * (couponDiscount.value / 100),
          couponDiscount.maxValue || Infinity
        );
        total -= discount;
      } else if (couponDiscount.type === "fixed") {
        total -= couponDiscount.value;
      }
    }
    total += shippingFee;
    return Math.max(total, 0);
  }, [
    cartItems,
    selectedProductVoucher,
    selectedFreeShipVoucher,
    couponDiscount,
  ]);

  const createOrderData = () => {
    if (!cartItems || !cartItems.items?.length) {
      throw new Error("Giỏ hàng trống!");
    }
    if (!selectedAddress) {
      throw new Error("Vui lòng chọn hoặc thêm địa chỉ nhận hàng!");
    }
    if (
      !cartItems.items.every(
        (item) => item.productItem?._id && item.quantity > 0
      )
    ) {
      throw new Error("Dữ liệu giỏ hàng không hợp lệ!");
    }
    const items = cartItems.items.map((item) => ({
      productItemId: item.productItem?._id || "",
      name: item.productItem?.name || "",
      image: item.productItem?.thumbUrl || "",
      attributes:
        item.productItem?.attributes?.map((attr) => ({
          code: attr.code || "",
          value: attr.value || "",
        })) || [],
      originalPrice: item.productItem?.retailPrice ?? 0,
      discountedPrice: item.finalPrice ?? 0,
      quantity: item.quantity ?? 1,
    }));
    const addressParts = selectedAddress.address?.split(", ") || [];
    const [addressLine = "", ward = "", district = "", province = ""] =
      addressParts.length >= 4 ? addressParts : ["", "", "", ""];
    const orderData = {
      items,
      shippingAddress: {
        fullName: selectedAddress.fullName || "Unknown",
        phone: selectedAddress.phone || "Unknown",
        province,
        district,
        ward,
        addressLine,
      },
      paymentMethod: method,
      totalAmount: totalAmount,
      vouchers: [],
      coupons: [],
    };
    const currentDate = new Date();
    if (
      selectedProductVoucher &&
      selectedProductVoucher.validTo &&
      new Date(selectedProductVoucher.validTo) >= currentDate
    ) {
      orderData.vouchers.push({
        userVoucherId: selectedProductVoucher._id,
        voucherApplyTo: "product",
      });
    }
    if (
      selectedFreeShipVoucher &&
      selectedFreeShipVoucher.validTo &&
      new Date(selectedFreeShipVoucher.validTo) >= currentDate
    ) {
      orderData.vouchers.push({
        userVoucherId: selectedFreeShipVoucher._id,
        voucherApplyTo: "shipping",
      });
    }
    if (
      couponDiscount &&
      couponDiscount.validTo &&
      new Date(couponDiscount.validTo) >= currentDate &&
      couponDiscount.applyTo
    ) {
      orderData.coupons.push({
        couponId: couponDiscount._id,
        couponApplyTo: couponDiscount.applyTo,
      });
    }
    return orderData;
  };

  const onSubmit = async () => {
    if (!selectedAddress) {
      toast.error("Vui lòng chọn hoặc thêm địa chỉ nhận hàng!");
      return;
    }
    if (!cartItems || !cartItems.items?.length) {
      toast.error("Giỏ hàng trống!");
      return;
    }
    if (
      !cartItems.items.every(
        (item) => item.productItem?._id && item.quantity > 0
      )
    ) {
      toast.error("Dữ liệu giỏ hàng không hợp lệ!");
      return;
    }
    setIsSubmitting(true);
    try {
      const orderData = createOrderData();
      let response;
      if (method === "cod") {
        response = await apis.apiOrderCOD(orderData);
        if (!response?.success) {
          throw new Error("Đặt hàng COD không thành công!");
        }

        toast.success("Đặt hàng thành công!");
        resetCart();
        setSelectedProductVoucher(null);
        setSelectedFreeShipVoucher(null);
        setCouponDiscount(null);
        setCouponCode("");
        navigate("/orders");
      } else if (method === "momo") {
        response = await apis.apiOrderMoMo(orderData);
        if (!response?.success || !response.payUrl) {
          throw new Error("Không thể tạo URL thanh toán MoMo!");
        }
        toast.success("Đang chuyển hướng đến cổng thanh toán...");
        resetCart();
        setSelectedProductVoucher(null);
        setSelectedFreeShipVoucher(null);
        setCouponDiscount(null);
        setCouponCode("");
        window.location.href = response.payUrl;
      }
    } catch (error) {
      console.log(error.msg);
      handleApiError(error, "Đã có lỗi xảy ra khi đặt hàng!");
      navigate("/cart");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {isLoading && (
        <div className="text-center py-10">
          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-gray-500"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
            </svg>
            <p className="text-lg font-medium">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}
      {!isLoading && (
        <div className="mb-16">
          <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col xl:flex-row gap-10">
              <div className="flex-1 flex flex-col gap-4 text-sm">
                <AddressSection
                  addresses={addresses}
                  setAddresses={setAddresses}
                  selectedAddress={selectedAddress}
                  setSelectedAddress={setSelectedAddress}
                  showSavedAddresses={showSavedAddresses}
                  setShowSavedAddresses={setShowSavedAddresses}
                />
                <VoucherSection
                  vouchers={vouchers}
                  selectedProductVoucher={selectedProductVoucher}
                  setSelectedProductVoucher={setSelectedProductVoucher}
                  selectedFreeShipVoucher={selectedFreeShipVoucher}
                  setSelectedFreeShipVoucher={setSelectedFreeShipVoucher}
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  couponDiscount={couponDiscount}
                  setCouponDiscount={setCouponDiscount}
                />
              </div>
              <div className="flex flex-1 flex-col">
                <CartTotal
                  totalAmount={totalAmount}
                  shippingFee={cartItems?.shippingFee}
                />
                <PaymentSection
                  method={method}
                  setMethod={setMethod}
                  isSubmitting={isSubmitting}
                  onSubmit={onSubmit}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
