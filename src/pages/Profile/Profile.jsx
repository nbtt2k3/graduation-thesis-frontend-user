"use client";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import ProfileForm from "./ProfileForm";
import AddressForm from "./AddressForm";
import AddressList from "./AddressList";
import PasswordForm from "./PasswordForm";
import VoucherList from "./VoucherList";
import Wishlist from "./Wishlist";
import * as apis from "../../apis";
import { isValidVietnamCoordinates } from "./utils";

const Sidebar = ({ activeTab, setActiveTab, className }) => {
  const navigate = useNavigate();

  const tabs = [
    { id: "profile", label: "Thông tin cá nhân" },
    { id: "address", label: "Địa chỉ" },
    { id: "vouchers", label: "Voucher của tôi" },
    { id: "password", label: "Đổi mật khẩu" },
    { id: "wishlist", label: "Danh sách yêu thích" }, // Added Wishlist tab
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    navigate(`/profile?tab=${tabId}`);
  };

  return (
    <div className={className}>
      <ul className="flex flex-col gap-2 p-4 sm:p-6">
        {tabs.map((tab) => (
          <li
            key={tab.id}
            className={`cursor-pointer text-sm sm:text-base p-3 rounded-md min-w-[80px] whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            onClick={() => handleTabClick(tab.id)}
            aria-label={`Chuyển đến tab ${tab.label}`}
          >
            {tab.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") || "profile";
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [showUpdateAddressForm, setShowUpdateAddressForm] = useState(false);
  const [editData, setEditData] = useState({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    addressLine: "",
    longitude: "",
    latitude: "",
    isDefault: false,
    type: "home",
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    dob: "",
    avatar: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [addresses, setAddresses] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["profile", "address", "password", "vouchers", "wishlist"].includes(tab)) { // Added wishlist to valid tabs
      setActiveTab(tab);
    } else {
      setActiveTab("profile");
      navigate("/profile?tab=profile");
    }
  }, [location.search, navigate]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apis.apiGetCurrent();
        if (response.success && response.userInfo) {
          const { userInfo } = response;
          setUserInfo(userInfo);
          setEditData((prev) => ({
            ...prev,
            firstName: userInfo.firstName || "",
            lastName: userInfo.lastName || "",
            email: userInfo.email || "",
            phone: userInfo.phone || "",
            gender: userInfo.gender || "",
            dob: userInfo.dateOfBirth
              ? new Date(userInfo.dateOfBirth).toISOString().split("T")[0]
              : "",
            avatar: userInfo.avatarUrl || "https://placehold.co/100x100",
          }));
        } else {
          throw new Error(
            response.msg || "Không thể tải thông tin người dùng!"
          );
        }
      } catch (error) {
        toast.error(error.msg || "Không thể tải thông tin người dùng!");
        setUserInfo(null);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      if (provinces.length === 0) {
        try {
          const response = await fetch("/dvhcvn/dvhcvn.json");
          const data = await response.json();
          setProvinces(
            data.data?.map((province) => ({
              code: province.level1_id,
              name: province.name,
              type: province.type,
              level2s: province.level2s || [],
            })) || []
          );
        } catch (error) {
          toast.error(error.msg || "Không thể tải danh sách tỉnh/thành phố!");
        }
      }
    };
    fetchProvinces();
  }, [provinces]);

  const fetchAddresses = async () => {
    try {
      const response = await apis.getAllAddresses();
      if (response.success && Array.isArray(response.addressList)) {
        const formattedAddresses = response.addressList.map((addr) => ({
          _id: addr._id,
          fullName: addr.fullName || "Unknown",
          phone: addr.phone || "Unknown",
          address: `${addr.addressLine}, ${addr.ward}, ${addr.district}, ${addr.province}`,
          isDefault: addr.isDefault || false,
          addressLine: addr.addressLine || "",
          ward: addr.ward || "",
          district: addr.district || "",
          province: addr.province || "",
          longitude: addr.location?.coordinates[0] || "",
          latitude: addr.location?.coordinates[1] || "",
          type: addr.type || "home",
        }));
        setAddresses(formattedAddresses);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      toast.error(error.msg || "Không thể tải danh sách địa chỉ!");
    }
  };

  useEffect(() => {
    if (activeTab === "address") {
      fetchAddresses();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn tệp hình ảnh!");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Tệp hình ảnh không được vượt quá 5MB!");
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setEditData((prev) => ({ ...prev, avatar: imageUrl }));
    }
  };

  const handleSaveProfile = async (fileInputRef) => {
    try {
      if (!editData.firstName || !editData.lastName || !editData.phone) {
        toast.error("Vui lòng điền đầy đủ họ, tên và số điện thoại!");
        return;
      }
      if (editData.dob && !/^\d{4}-\d{2}-\d{2}$/.test(editData.dob)) {
        toast.error("Ngày sinh không hợp lệ!");
        return;
      }

      const formData = new FormData();
      formData.append("firstName", editData.firstName);
      formData.append("lastName", editData.lastName);
      formData.append("phone", editData.phone);
      formData.append("gender", editData.gender);
      formData.append("dateOfBirth", editData.dob);

      if (
        editData.avatar &&
        editData.avatar.startsWith("blob:") &&
        fileInputRef.current?.files[0]
      ) {
        formData.append("avatar", fileInputRef.current.files[0]);
      }

      const response = await apis.apiUpdateUser(formData);
      if (response.success && response.userInfo) {
        setUserInfo((prev) => ({
          ...prev,
          firstName: editData.firstName,
          lastName: editData.lastName,
          phone: editData.phone,
          gender: editData.gender,
          dateOfBirth: editData.dob,
          avatarUrl: response.userInfo?.avatarUrl || editData.avatar,
        }));
        if (editData.avatar && editData.avatar.startsWith("blob:")) {
          URL.revokeObjectURL(editData.avatar);
          setEditData((prev) => ({
            ...prev,
            avatar:
              response.userInfo?.avatarUrl || "https://placehold.co/100x100",
          }));
        }
        toast.success("Thông tin cá nhân đã được lưu!");
      } else {
        throw new Error("Không thể lưu thông tin cá nhân!");
      }
    } catch (error) {
      toast.error(error.msg || "Không thể lưu thông tin cá nhân!");
    }
  };

  const cancelEditProfile = () => {
    if (editData.avatar && editData.avatar.startsWith("blob:")) {
      URL.revokeObjectURL(editData.avatar);
    }
    setEditData((prev) => ({
      ...prev,
      firstName: userInfo?.firstName || "",
      lastName: userInfo?.lastName || "",
      email: userInfo?.email || "",
      phone: userInfo?.phone || "",
      gender: userInfo?.gender || "",
      dob: userInfo?.dateOfBirth
        ? new Date(userInfo.dateOfBirth).toISOString().split("T")[0]
        : "",
      avatar: userInfo?.avatarUrl || "https://placehold.co/100x100",
    }));
  };

  const handleSaveAddress = async (data, coords) => {
    if (!data || !coords || !isValidVietnamCoordinates(coords)) {
      toast.error(
        "Tọa độ hoặc dữ liệu không hợp lệ. Vui lòng kiểm tra lại."
      );
      return;
    }
    const provinceName =
      provinces.find((p) => p.code === data.province)?.name || "";
    const districtName =
      districts.find((d) => d.code === data.district)?.name || "";
    const wardName = wards.find((w) => w.code === data.ward)?.name || "";
    if (!provinceName || !districtName || !wardName) {
      toast.error("Vui lòng chọn đầy đủ tỉnh, quận/huyện và phường/xã!");
      return;
    }
    const newAddress = {
      fullName: data.fullName,
      phone: data.phone,
      addressLine: data.addressLine,
      ward: wardName,
      district: districtName,
      province: provinceName,
      type: data.type,
      isDefault: data.isDefault || addresses.length === 0,
      location: {
        type: "Point",
        coordinates: [coords.longitude, coords.latitude],
      },
    };
    try {
      const response = await apis.createAddress(newAddress);
      if (response.success && response?.address?._id) {
        await fetchAddresses();
        setShowAddAddressForm(false);
        setEditData((prev) => ({
          ...prev,
          fullName: "",
          phone: "",
          province: "",
          district: "",
          ward: "",
          addressLine: "",
          longitude: "",
          latitude: "",
          isDefault: false,
          type: "home",
        }));
        toast.success("Địa chỉ đã được thêm!");
      } else {
        throw new Error(response.msg || "Không thể lưu địa chỉ mới!");
      }
    } catch (error) {
      toast.error(error.msg || "Không thể lưu địa chỉ mới!");
    }
  };

  const handleUpdateAddress = async (address) => {
    try {
      const response = await apis.getAddressById(address._id);
      if (response.success && response.address) {
        const addressData = response.address;
        if (!provinces.length) {
          toast.warn(
            "Danh sách tỉnh/thành phố chưa được tải. Vui lòng thử lại."
          );
          return;
        }
        const provinceCode =
          provinces.find((p) => p.name === addressData.province)?.code || "";
        const selectedProvince = provinces.find((p) => p.code === provinceCode);
        const districtList =
          selectedProvince?.level2s?.map((district) => ({
            code: district.level2_id,
            name: district.name,
            type: district.type,
            level3s: district.level3s || [],
          })) || [];
        setDistricts(districtList);
        const districtCode =
          districtList.find((d) => d.name === addressData.district)?.code || "";
        const selectedDistrict = districtList.find(
          (d) => d.code === districtCode
        );
        const wardList =
          selectedDistrict?.level3s?.map((ward) => ({
            code: ward.level3_id,
            name: ward.name,
            type: ward.type,
          })) || [];
        setWards(wardList);
        const wardCode =
          wardList.find((w) => w.name === addressData.ward)?.code || "";
        setEditData((prev) => ({
          ...prev,
          fullName: addressData.fullName || "",
          phone: addressData.phone || "",
          province: provinceCode,
          district: districtCode,
          ward: wardCode,
          addressLine: addressData.addressLine || "",
          longitude: addressData.location?.coordinates[0] || "",
          latitude: addressData.location?.coordinates[1] || "",
          isDefault: addressData.isDefault || false,
          type: addressData.type || "home",
          _id: addressData._id,
        }));
        setShowUpdateAddressForm(true);
        setShowAddAddressForm(false);
      }
    } catch (error) {
      toast.error(error.msg || "Không thể lấy thông tin địa chỉ!");
    }
  };

  const handleSaveUpdateAddress = async (data, coords) => {
    if (!data || !coords || !isValidVietnamCoordinates(coords)) {
      toast.error(
        "Tọa độ hoặc dữ liệu không hợp lệ. Vui lòng kiểm tra lại."
      );
      return;
    }
    const provinceName =
      provinces.find((p) => p.code === data.province)?.name || "";
    const districtName =
      districts.find((d) => d.code === data.district)?.name || "";
    const wardName = wards.find((w) => w.code === data.ward)?.name || "";
    if (!provinceName || !districtName || !wardName) {
      toast.error("Vui lòng chọn đầy đủ tỉnh, quận/huyện và phường/xã!");
      return;
    }
    const updatedAddress = {
      fullName: data.fullName,
      phone: data.phone,
      addressLine: data.addressLine,
      ward: wardName,
      district: districtName,
      province: provinceName,
      type: data.type,
      isDefault: data.isDefault,
      location: {
        type: "Point",
        coordinates: [coords.longitude, coords.latitude],
      },
    };
    try {
      const response = await apis.updateAddress(editData._id, updatedAddress);
      if (response.success) {
        await fetchAddresses();
        setShowUpdateAddressForm(false);
        setEditData((prev) => ({
          ...prev,
          fullName: "",
          phone: "",
          province: "",
          district: "",
          ward: "",
          addressLine: "",
          longitude: "",
          latitude: "",
          isDefault: false,
          type: "home",
        }));
        toast.success("Địa chỉ đã được cập nhật!");
      }
    } catch (error) {
      toast.error(error.msg || "Không thể cập nhật địa chỉ!");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await apis.deleteAddress(addressId);
      if (response.success) {
        await fetchAddresses();
        toast.success("Địa chỉ đã được xóa!");
      }
    } catch (error) {
      toast.error(error.msg || "Không thể xóa địa chỉ!");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await apis.updateDefaultAddress(addressId);
      if (response.success) {
        await fetchAddresses();
        toast.success("Địa chỉ đã được thiết lập mặc định!");
      }
    } catch (error) {
      toast.error(error.msg || "Không thể đặt địa chỉ mặc định!");
    }
  };

  const handleCancelAddress = (resetForm) => {
    setShowAddAddressForm(false);
    setShowUpdateAddressForm(false);
    setEditData((prev) => ({
      ...prev,
      fullName: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      addressLine: "",
      longitude: "",
      latitude: "",
      isDefault: false,
      type: "home",
    }));
    resetForm();
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (
      !editData.currentPassword ||
      !editData.newPassword ||
      !editData.confirmPassword
    ) {
      toast.error("Vui lòng điền đủ các trường.");
      return;
    }
    if (editData.newPassword !== editData.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp.");
      return;
    }

    try {
      const response = await apis.apiChangePassword({
        password: editData.currentPassword,
        newPassword: editData.newPassword,
      });
      if (response.success) {
        toast.success("Đổi mật khẩu thành công!");
        setEditData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        throw new Error(response.msg || "Không thể đổi mật khẩu!");
      }
    } catch (error) {
      toast.error(error.msg || "Không thể đổi mật khẩu!");
    }
  };

  if (!userInfo) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center text-red-600 font-semibold text-sm sm:text-base">
          Đang tải thông tin người dùng...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-6">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          className="md:w-1/4 bg-white border border-gray-200 rounded-lg shadow-sm"
        />
        <section className="w-full md:w-3/4 bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm flex-1">
          {activeTab === "profile" && (
            <ProfileForm
              editData={editData}
              handleChange={handleChange}
              handleAvatarChange={handleAvatarChange}
              handleSaveProfile={handleSaveProfile}
              isEditingProfile={isEditingProfile}
              setIsEditingProfile={setIsEditingProfile}
              cancelEditProfile={cancelEditProfile}
            />
          )}
          {activeTab === "address" && (
            <div className="p-2 sm:p-3">
              {showAddAddressForm && (
                <AddressForm
                  editData={editData}
                  setEditData={setEditData}
                  handleSubmit={handleSaveAddress}
                  handleCancel={handleCancelAddress}
                  title="Thêm địa chỉ mới"
                  provinces={provinces}
                  setProvinces={setProvinces}
                  districts={districts}
                  setDistricts={setDistricts}
                  wards={wards}
                  setWards={setWards}
                />
              )}
              {showUpdateAddressForm && (
                <AddressForm
                  editData={editData}
                  setEditData={setEditData}
                  handleSubmit={handleSaveUpdateAddress}
                  handleCancel={handleCancelAddress}
                  title="Cập nhật địa chỉ"
                  provinces={provinces}
                  setProvinces={setProvinces}
                  districts={districts}
                  setDistricts={setDistricts}
                  wards={wards}
                  setWards={setWards}
                />
              )}
              {!showAddAddressForm && !showUpdateAddressForm && (
                <AddressList
                  addresses={addresses}
                  handleUpdateAddress={handleUpdateAddress}
                  handleDeleteAddress={handleDeleteAddress}
                  handleSetDefaultAddress={handleSetDefaultAddress}
                  setShowAddAddressForm={setShowAddAddressForm}
                  showAddAddressForm={showAddAddressForm}
                  showUpdateAddressForm={showUpdateAddressForm}
                />
              )}
            </div>
          )}
          {activeTab === "password" && (
            <PasswordForm
              editData={editData}
              handleChange={handleChange}
              handleChangePassword={handleChangePassword}
            />
          )}
          {activeTab === "vouchers" && <VoucherList />}
          {activeTab === "wishlist" && <Wishlist />}
        </section>
      </div>
    </div>
  );
};

export default Profile;