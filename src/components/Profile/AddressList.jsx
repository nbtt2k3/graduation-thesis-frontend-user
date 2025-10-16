import React, { useState, useEffect } from "react";
import * as apis from "../../apis";
import AddressList from "./AddressList";

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [showUpdateAddressForm, setShowUpdateAddressForm] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);

  // Fetch addresses on component mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await apis.apiGetUseAddress();

        console.log(response)

        if (response.success) {
          // Map API data to the format expected by AddressList
          const formattedAddresses = response.address.map((addr) => ({
            name: addr.name || "Unknown", // API doesn't provide name, so use a default or derive it
            phone: addr.phone || "N/A", // API doesn't provide phone, so use a default
            address: addr.addressLine,
            subAddress: `${addr.ward}, ${addr.district}, ${addr.province}, ${addr.postalCode}`,
            isDefault: addr.isDefault,
            id: addr._id, // Store ID for updates/deletes
          }));
          setAddresses(formattedAddresses);
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      }
    };

    fetchAddresses();
  }, []);

  const handleUpdateAddress = (index) => {
    setSelectedAddressIndex(index);
    setShowUpdateAddressForm(true);
  };

  const handleDeleteAddress = async (index) => {
    try {
      // Assuming you have an API to delete an address by ID
      await apis.apiDeleteAddress(addresses[index].id); // Implement this API in your apis module
      setAddresses(addresses.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Failed to delete address:", error);
    }
  };

  const handleSetDefaultAddress = async (index) => {
    try {
      // Assuming you have an API to set default address by ID
      await apis.apiSetDefaultAddress(addresses[index].id); // Implement this API in your apis module
      setAddresses(
        addresses.map((addr, i) => ({
          ...addr,
          isDefault: i === index,
        }))
      );
    } catch (error) {
      console.error("Failed to set default address:", error);
    }
  };

  return (
    <div>
      <AddressList
        addresses={addresses}
        handleUpdateAddress={handleUpdateAddress}
        handleDeleteAddress={handleDeleteAddress}
        handleSetDefaultAddress={handleSetDefaultAddress}
        showAddAddressForm={showAddAddressForm}
        setShowAddAddressForm={setShowAddAddressForm}
        showUpdateAddressForm={showUpdateAddressForm}
      />
    </div>
  );
};

export default AddressManager;