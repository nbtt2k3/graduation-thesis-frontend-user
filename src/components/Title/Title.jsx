import React from "react";

const Title = ({ title1, title2, titleStyles = "", title1Styles = "" }) => {
  return (
    <div className={`${titleStyles}`}>
      <h2 className={`text-2xl md:text-3xl font-bold ${title1Styles}`}>
        {title1}{" "}
        <span className="text-2xl md:text-3xl font-bold">
          {title2}
        </span>
      </h2>
    </div>
  );
};

export default Title;
