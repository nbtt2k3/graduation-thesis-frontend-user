"use client";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-hot-toast";
import axios from "axios";
import { isValidVietnamCoordinates, DefaultIcon } from "./utils";

L.Marker.prototype.options.icon = DefaultIcon;

const AddressForm = ({
  editData,
  setEditData,
  handleSubmit,
  handleCancel,
  title,
  provinces,
  setProvinces,
  districts,
  setDistricts,
  wards,
  setWards,
}) => {
  const {
    register,
    handleSubmit: handleFormSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: editData.fullName || "",
      phone: editData.phone || "",
      province: editData.province || "",
      district: editData.district || "",
      ward: editData.ward || "",
      addressLine: editData.addressLine || "",
      longitude: editData.longitude?.toString() || "",
      latitude: editData.latitude?.toString() || "",
      isDefault: editData.isDefault || false,
      type: editData.type || "home",
    },
    mode: "onChange",
  });

  const [mapVisible, setMapVisible] = useState(false);
  const [coordinates, setCoordinates] = useState({
    longitude: editData.longitude || 105.8342,
    latitude: editData.latitude || 21.0278,
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocationSet, setIsLocationSet] = useState(false);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const provinceValue = watch("province");
  const districtValue = watch("district");
  const wardValue = watch("ward");
  const addressLineValue = watch("addressLine");

  useEffect(() => {
    const fetchProvinces = async () => {
      if (provinces.length === 0) {
        setIsLoadingProvinces(true);
        try {
          const response = await fetch("/dvhcvn/dvhcvn.json");
          if (!response.ok) throw new Error("Failed to fetch provinces");
          const data = await response.json();
          setProvinces(
            data.data.map((province) => ({
              code: province.level1_id,
              name: province.name,
              type: province.type,
              level2s: province.level2s,
            }))
          );
        } catch (error) {
          toast.error(error.msg || "Không thể tải danh sách tỉnh/thành phố!");
        } finally {
          setIsLoadingProvinces(false);
        }
      }
    };
    fetchProvinces();
  }, [provinces, setProvinces]);

  useEffect(() => {
    if (provinceValue) {
      setIsLoadingDistricts(true);
      try {
        const selectedProvince = provinces.find((p) => p.code === provinceValue);
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
        toast.error(error.msg || "Không thể tải danh sách quận/huyện!");
      } finally {
        setIsLoadingDistricts(false);
      }
    } else {
      setDistricts([]);
      setWards([]);
      setValue("district", "");
      setValue("ward", "");
    }
  }, [provinceValue, provinces, setDistricts, setWards, setValue]);

  useEffect(() => {
    if (districtValue) {
      setIsLoadingWards(true);
      try {
        const selectedDistrict = districts.find((d) => d.code === districtValue);
        setWards(
          selectedDistrict?.level3s.map((ward) => ({
            code: ward.level3_id,
            name: ward.name,
            type: ward.type,
          })) || []
        );
        if (editData.ward && !wardValue) {
          const initialWard = selectedDistrict?.level3s.find((w) => w.name === editData.ward);
          if (initialWard) setValue("ward", initialWard.code);
        }
      } catch (error) {
        toast.error(error.msg || "Không thể tải danh sách phường/xã!");
      } finally {
        setIsLoadingWards(false);
      }
    } else {
      setWards([]);
      setValue("ward", "");
    }
  }, [districtValue, districts, editData.ward, setWards, setValue, wardValue]);

  useEffect(() => {
    if (editData._id) {
      Object.entries(editData).forEach(([key, value]) => {
        setValue(key, value?.toString() || "");
      });
      setCoordinates({
        longitude: editData.longitude || 105.8342,
        latitude: editData.latitude || 21.0278,
      });
      setIsLocationSet(!!editData.longitude && !!editData.latitude);
      const province = provinces.find((p) => p.name === editData.province);
      if (province) setValue("province", province.code);
      const district = districts.find((d) => d.name === editData.district);
      if (district) setValue("district", district.code);
    }
  }, [editData, setValue, provinces, districts]);

  const geocodeAddress = async (addressData, retryCount = 0) => {
    const { addressLine, ward, district, province } = addressData;
    if (!addressLine || !ward || !district || !province) {
      toast.error("Vui lòng điền đầy đủ địa chỉ!");
      return null;
    }
    setIsGeocoding(true);
    const provinceName = provinces.find((p) => p.code === province)?.name || "";
    const districtName = districts.find((d) => d.code === district)?.name || "";
    const wardName = wards.find((w) => w.code === ward)?.name || "";
    const queries = [
      `${addressLine}, ${wardName}, ${districtName}, ${provinceName}, Vietnam`,
      `${addressLine}, ${districtName}, ${provinceName}, Vietnam`,
      `${wardName}, ${districtName}, ${provinceName}, Vietnam`,
    ];

    for (const query of queries) {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=1&countrycodes=vn`,
          { headers: { "Accept-Language": "vi" } }
        );
        if (response.status === 429 && retryCount < 3) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return geocodeAddress(addressData, retryCount + 1);
        }
        if (response.data.length > 0) {
          const { lat, lon } = response.data[0];
          const newCoordinates = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
          if (isValidVietnamCoordinates(newCoordinates)) {
            setCoordinates(newCoordinates);
            setValue("latitude", newCoordinates.latitude.toString());
            setValue("longitude", newCoordinates.longitude.toString());
            setIsLocationSet(true);
            if (mapRef.current && markerRef.current) {
              mapRef.current.setView([newCoordinates.latitude, newCoordinates.longitude], 16);
              markerRef.current.setLatLng([newCoordinates.latitude, newCoordinates.longitude]);
            }
            toast.success("Đã tìm thấy vị trí!");
            setIsGeocoding(false);
            return newCoordinates;
          }
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    }
    setIsGeocoding(false);
    toast.error("Không tìm thấy vị trí. Vui lòng chọn trên bản đồ!");
    setMapVisible(true);
    return null;
  };

  const handleShowMap = async () => {
    const addressData = {
      addressLine: addressLineValue,
      ward: wardValue,
      district: districtValue,
      province: provinceValue,
    };
    const coords = await geocodeAddress(addressData);
    if (coords) setMapVisible(true);
  };

  useEffect(() => {
    if (mapVisible && !mapRef.current) {
      const mapElement = document.getElementById("map");
      if (!mapElement) return;
      mapRef.current = L.map(mapElement, {
        center: [coordinates.latitude, coordinates.longitude],
        zoom: 16,
        zoomControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapRef.current);
      markerRef.current = L.marker([coordinates.latitude, coordinates.longitude], {
        draggable: true,
      }).addTo(mapRef.current);
      markerRef.current.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        if (isValidVietnamCoordinates({ latitude: lat, longitude: lng })) {
          setCoordinates({ latitude: lat, longitude: lng });
          setValue("latitude", lat.toString());
          setValue("longitude", lng.toString());
          setIsLocationSet(true);
          toast.success("Vị trí bản đồ đã được cập nhật!");
        } else {
          toast.error("Vị trí ngoài phạm vi Việt Nam!");
          markerRef.current.setLatLng([coordinates.latitude, coordinates.longitude]);
        }
      });
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [mapVisible, coordinates, setValue]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setValue(name, type === "checkbox" ? checked : value, { shouldValidate: true });
    if (["province", "district", "ward", "addressLine"].includes(name)) {
      setIsLocationSet(false);
      setMapVisible(false);
    }
  };

  const onSubmit = async (data) => {
    if (!isLocationSet) {
      toast.error("Vui lòng xác định vị trí trước khi lưu!");
      return;
    }
    if (!data.addressLine.trim()) {
      toast.error("Địa chỉ chi tiết không được để trống!");
      return;
    }
    handleSubmit(data, coordinates);
    reset();
    setMapVisible(false);
  };

  const handleReset = () => {
    reset();
    setEditData({});
    setCoordinates({ longitude: 105.8342, latitude: 21.0278 });
    setIsLocationSet(false);
    setMapVisible(false);
    toast.success("Đã đặt lại biểu mẫu!");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <div className="relative">
        <div className="flex flex-col gap-4">
          <div>
            <input
              {...register("fullName", { required: "Họ tên là bắt buộc" })}
              placeholder="Họ tên"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              onChange={handleChange}
              aria-describedby="fullName-error"
            />
            {errors.fullName && (
              <p id="fullName-error" className="text-red-500 text-xs mt-1">
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
                  message: "Số điện thoại không hợp lệ",
                },
              })}
              placeholder="Số điện thoại"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              onChange={handleChange}
              aria-describedby="phone-error"
            />
            {errors.phone && (
              <p id="phone-error" className="text-red-500 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
          <div>
            <select
              {...register("type", { required: "Loại địa chỉ là bắt buộc" })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              onChange={handleChange}
              aria-describedby="type-error"
            >
              <option value="">Chọn loại địa chỉ</option>
              <option value="home">Nhà riêng</option>
              <option value="work">Cơ quan</option>
              <option value="other">Khác</option>
            </select>
            {errors.type && (
              <p id="type-error" className="text-red-500 text-xs mt-1">
                {errors.type.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <select
                {...register("province", { required: "Tỉnh/Thành phố là bắt buộc" })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                onChange={handleChange}
                disabled={isLoadingProvinces}
                aria-describedby="province-error"
              >
                <option value="">Tỉnh/Thành phố</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
              {isLoadingProvinces && (
                <p className="text-gray-500 text-xs mt-1">Đang tải...</p>
              )}
              {errors.province && (
                <p id="province-error" className="text-red-500 text-xs mt-1">
                  {errors.province.message}
                </p>
              )}
            </div>
            <div>
              <select
                {...register("district", { required: "Quận/Huyện là bắt buộc" })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                onChange={handleChange}
                disabled={!provinceValue || isLoadingDistricts}
                aria-describedby="district-error"
              >
                <option value="">Quận/Huyện</option>
                {districts.map((district) => (
                  <option key={district.code} value={district.code}>
                    {district.name}
                  </option>
                ))}
              </select>
              {isLoadingDistricts && (
                <p className="text-gray-500 text-xs mt-1">Đang tải...</p>
              )}
              {errors.district && (
                <p id="district-error" className="text-red-500 text-xs mt-1">
                  {errors.district.message}
                </p>
              )}
            </div>
            <div>
              <select
                {...register("ward", { required: "Phường/Xã là bắt buộc" })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                onChange={handleChange}
                disabled={!districtValue || isLoadingWards}
                aria-describedby="ward-error"
              >
                <option value="">Phường/Xã</option>
                {wards.map((ward) => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
              {isLoadingWards && (
                <p className="text-gray-500 text-xs mt-1">Đang tải...</p>
              )}
              {errors.ward && (
                <p id="ward-error" className="text-red-500 text-xs mt-1">
                  {errors.ward.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <input
              {...register("addressLine", {
                required: "Địa chỉ chi tiết là bắt buộc",
                validate: (value) => value.trim() !== "" || "Địa chỉ không được để trống",
              })}
              placeholder="Số nhà, tên đường..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              onChange={handleChange}
              aria-describedby="addressLine-error"
            />
            {errors.addressLine && (
              <p id="addressLine-error" className="text-red-500 text-xs mt-1">
                {errors.addressLine.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("isDefault")}
              className="h-4 w-4 text-blue-500 focus:ring-blue-500"
              onChange={handleChange}
            />
            <label className="text-sm text-gray-700">Đặt làm mặc định</label>
          </div>
          <button
            type="button"
            onClick={handleShowMap}
            className={`w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${isGeocoding || !provinceValue || !districtValue || !wardValue || !addressLineValue ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isGeocoding || !provinceValue || !districtValue || !wardValue || !addressLineValue}
          >
            {isGeocoding ? "Đang tìm..." : "Tìm vị trí"}
          </button>
          {mapVisible && (
            <div id="map" className="w-full h-80 mt-4 rounded-md border border-gray-200" />
          )}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleFormSubmit(onSubmit)}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${!isLocationSet ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!isLocationSet}
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={() => handleCancel(reset)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;