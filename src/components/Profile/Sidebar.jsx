import React from "react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "profile", label: "Hồ sơ" },
    { id: "address", label: "Địa chỉ" },
    { id: "password", label: "Đổi mật khẩu" },
  ];

  return (
    <aside className="md:w-1/3 border border-gray-200 rounded-md p-4">
      <h2 className="text-xl font-semibold mb-6">Tài khoản của tôi</h2>
      <ul className="flex flex-col space-y-4">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-2 rounded-md transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-gray-700 hover:bg-blue-100"
              }`}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;