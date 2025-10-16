"use client";
import { DefaultIcon } from "./utils";
import L from "leaflet";

L.Marker.prototype.options.icon = DefaultIcon;

const AddressList = ({
  addresses,
  handleUpdateAddress,
  handleDeleteAddress,
  handleSetDefaultAddress,
  setShowAddAddressForm,
  showAddAddressForm,
  showUpdateAddressForm,
  isLoading = false, // Thêm prop isLoading với giá trị mặc định là false
}) => {
  const buttonStyles = "px-2 py-1 rounded text-sm font-medium transition-colors";
  const addButtonStyles = `${buttonStyles} bg-blue-600 text-white hover:bg-blue-700`;
  const editButtonStyles = `${buttonStyles} bg-blue-500 text-white hover:bg-blue-600`;
  const deleteButtonStyles = `${buttonStyles} bg-red-500 text-white hover:bg-red-600`;
  const defaultButtonStyles = `${buttonStyles} bg-green-500 text-white hover:bg-green-600`;

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
          Danh sách địa chỉ
        </h3>
        {!showAddAddressForm && !showUpdateAddressForm && (
          <button
            onClick={() => setShowAddAddressForm(true)}
            className={addButtonStyles}
            aria-label="Thêm địa chỉ mới"
          >
            Thêm địa chỉ
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-6">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-2 text-sm text-gray-600">Đang tải...</p>
        </div>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          Chưa có địa chỉ nào được thêm.
        </p>
      ) : (
        <ul className="space-y-3">
          {addresses.map((address) => (
            <li
              key={address._id}
              className="border border-gray-300 bg-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-base font-medium text-gray-900">
                    {address.fullName} | {address.phone}
                  </p>
                  <p className="text-sm text-gray-700">{address.address}</p>
                  <p className="text-sm text-gray-700">
                    Loại: {address.type === "home" ? "Nhà riêng" : address.type === "work" ? "Cơ quan" : "Khác"}
                  </p>
                  {address.isDefault && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      Mặc định
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateAddress(address)}
                    className={editButtonStyles}
                    aria-label={`Chỉnh sửa địa chỉ ${address.fullName}`}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address._id)}
                    className={deleteButtonStyles}
                    aria-label={`Xóa địa chỉ ${address.fullName}`}
                  >
                    Xóa
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefaultAddress(address._id)}
                      className={defaultButtonStyles}
                      aria-label={`Đặt làm mặc định địa chỉ ${address.fullName}`}
                    >
                      Mặc định
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressList;