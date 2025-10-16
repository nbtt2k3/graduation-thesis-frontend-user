import React, { useState } from "react";
import DOMPurify from "dompurify";

const ProductDescription = ({ description, specifications }) => {
  const [activeTab, setActiveTab] = useState("description");

  // ✅ Chuẩn hóa HTML mô tả sản phẩm
  const sanitizedHTML = DOMPurify.sanitize(
    description || "<p>Không có mô tả</p>",
    {
      ALLOWED_TAGS: [
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "strong",
        "em",
        "a",
        "img",
        "br",
        "ul",
        "ol",
        "li",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "target", "rel", "class"],
    }
  );

  return (
    <div className="border border-gray-200 rounded-xl mt-6 shadow-sm bg-white">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "description"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("description")}
        >
          Mô tả sản phẩm
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "specifications"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("specifications")}
        >
          Thông số kỹ thuật
        </button>
      </div>

      {/* Nội dung */}
      <div className="p-5">
        {activeTab === "description" ? (
          <div
            className="max-w-none leading-relaxed text-gray-700 text-sm sm:text-base space-y-4
            [&>h1]:text-xl [&>h1]:font-bold
            [&>h2]:text-lg [&>h2]:font-semibold
            [&>ul]:list-disc [&>ul]:pl-5
            [&>ol]:list-decimal [&>ol]:pl-5
            [&>a]:text-blue-600 [&>a]:hover:underline
            [&>table]:w-full [&>table]:border [&>table]:border-gray-300 [&>table]:text-left [&>table]:border-collapse
            [&>thead>tr>th]:border [&>thead>tr>th]:border-gray-300 [&>thead>tr>th]:bg-gray-100 [&>thead>tr>th]:p-2 [&>thead>tr>th]:text-sm [&>thead>tr>th]:font-semibold
            [&>tbody>tr>td]:border [&>tbody>tr>td]:border-gray-300 [&>tbody>tr>td]:p-2 [&>tbody>tr>td]:text-sm"
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          />
        ) : (
          <div className="flex flex-col gap-5">
            {specifications && specifications.length > 0 ? (
              specifications.map((specGroup) => (
                <div key={specGroup._id}>
                  <h5 className="text-base font-semibold text-gray-800 mb-2">
                    {specGroup.group}
                  </h5>
                  <ul className="list-none pl-0 text-sm text-gray-600 divide-y divide-gray-100">
                    {specGroup.items.map((item) => (
                      <li
                        key={item._id}
                        className="py-1 flex justify-between items-center"
                      >
                        <span className="font-medium text-gray-700">
                          {item.label}
                        </span>
                        <span>{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">
                Không có thông số kỹ thuật
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;
